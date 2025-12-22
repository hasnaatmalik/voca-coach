import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getModel } from '@/lib/vertex';

interface ClientInsight {
  clientId: string;
  clientName: string;
  sessionsCount: number;
  lastSession: string | null;
  nextSession: string | null;
  preSessionNotes: string | null;
  commonTopics: string[];
  moodTrend: 'improving' | 'stable' | 'declining' | 'unknown';
  aiSummary: string;
  alerts: string[];
}

// GET /api/therapist/insights - Get AI-powered client insights
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    // Get upcoming sessions with pre-session data
    const upcomingSessions = await prisma.therapySession.findMany({
      where: {
        therapistId: user.id,
        scheduledAt: { gte: new Date() },
        status: { in: ['scheduled', 'confirmed'] },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        preSessionData: true,
      },
      orderBy: { scheduledAt: 'asc' },
      take: clientId ? 100 : 10,
    });

    // If specific client requested
    if (clientId) {
      const clientSessions = await prisma.therapySession.findMany({
        where: {
          therapistId: user.id,
          userId: clientId,
        },
        include: {
          user: { select: { id: true, name: true } },
          preSessionData: true,
          postSessionSummary: true,
        },
        orderBy: { scheduledAt: 'desc' },
        take: 10,
      });

      if (clientSessions.length === 0) {
        return NextResponse.json({ error: 'No sessions found with this client' }, { status: 404 });
      }

      const insight = await generateClientInsight(clientSessions);
      return NextResponse.json({ insight });
    }

    // Generate insights for upcoming clients
    const insights: ClientInsight[] = [];
    const processedClients = new Set<string>();

    for (const session of upcomingSessions) {
      if (processedClients.has(session.userId)) continue;
      processedClients.add(session.userId);

      // Get all sessions with this client
      const clientSessions = await prisma.therapySession.findMany({
        where: {
          therapistId: user.id,
          userId: session.userId,
        },
        include: {
          user: { select: { id: true, name: true } },
          preSessionData: true,
          postSessionSummary: true,
        },
        orderBy: { scheduledAt: 'desc' },
        take: 5,
      });

      const insight = await generateClientInsight(clientSessions);
      insights.push(insight);
    }

    // Get crisis alerts
    const crisisAlerts = await prisma.notification.findMany({
      where: {
        userId: user.id,
        type: 'crisis_alert',
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      insights,
      crisisAlerts,
      upcomingWithNotes: upcomingSessions
        .filter((s) => s.preSessionData)
        .map((s) => ({
          sessionId: s.id,
          clientName: s.user.name,
          scheduledAt: s.scheduledAt,
          moodRating: s.preSessionData?.moodRating,
          concerns: s.preSessionData?.concernText,
          goals: s.preSessionData?.sessionGoals,
        })),
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}

async function generateClientInsight(
  sessions: Array<{
    user: { id: string; name: string };
    scheduledAt: Date;
    preSessionData: { moodRating: number; concernText: string | null; sessionGoals: string | null } | null;
    postSessionSummary: { keyTopics: string | null; moodBefore: number | null; moodAfter: number | null } | null;
  }>
): Promise<ClientInsight> {
  const client = sessions[0].user;
  const pastSessions = sessions.filter((s) => new Date(s.scheduledAt) <= new Date());
  const futureSessions = sessions.filter((s) => new Date(s.scheduledAt) > new Date());

  // Extract mood data
  const moodData: number[] = [];
  const concerns: string[] = [];
  const topics: string[] = [];

  for (const session of pastSessions) {
    if (session.preSessionData?.moodRating) {
      moodData.push(session.preSessionData.moodRating);
    }
    if (session.preSessionData?.concernText) {
      concerns.push(session.preSessionData.concernText);
    }
    if (session.postSessionSummary?.keyTopics) {
      try {
        const sessionTopics = JSON.parse(session.postSessionSummary.keyTopics);
        topics.push(...sessionTopics);
      } catch {
        // Invalid JSON, skip
      }
    }
  }

  // Calculate mood trend
  let moodTrend: 'improving' | 'stable' | 'declining' | 'unknown' = 'unknown';
  if (moodData.length >= 2) {
    const recent = moodData.slice(0, Math.min(3, moodData.length));
    const older = moodData.slice(-Math.min(3, moodData.length));
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    if (recentAvg - olderAvg > 1) moodTrend = 'improving';
    else if (olderAvg - recentAvg > 1) moodTrend = 'declining';
    else moodTrend = 'stable';
  }

  // Get common topics
  const topicCounts = topics.reduce(
    (acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const commonTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);

  // Get latest pre-session notes
  const latestNotes = futureSessions[0]?.preSessionData?.concernText || null;

  // Generate AI summary
  let aiSummary = '';
  const alerts: string[] = [];

  if (pastSessions.length > 0 || concerns.length > 0) {
    try {
      const model = getModel();
      const prompt = `Generate a brief (2-3 sentences) therapist briefing for a client. Be concise and clinical.

Client: ${client.name}
Total sessions: ${pastSessions.length}
Mood trend: ${moodTrend}
Common topics: ${commonTopics.join(', ') || 'None identified'}
Recent concerns: ${concerns.slice(0, 2).join('; ') || 'None recorded'}
Upcoming session notes: ${latestNotes || 'None'}

Generate:
1. A brief summary for the therapist
2. Any alerts or flags (e.g., declining mood, recurring themes)

Return JSON (no markdown):
{"summary": "...", "alerts": ["alert1", "alert2"]}`;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const parsed = JSON.parse(responseText);
      aiSummary = parsed.summary;
      alerts.push(...(parsed.alerts || []));
    } catch {
      aiSummary = `${pastSessions.length} previous sessions. Mood trend: ${moodTrend}.`;
    }
  } else {
    aiSummary = 'New client - no previous session data.';
  }

  // Add mood trend alert if declining
  if (moodTrend === 'declining' && !alerts.some((a) => a.toLowerCase().includes('mood'))) {
    alerts.unshift('Declining mood trend over recent sessions');
  }

  return {
    clientId: client.id,
    clientName: client.name,
    sessionsCount: pastSessions.length,
    lastSession: pastSessions[0]?.scheduledAt.toISOString() || null,
    nextSession: futureSessions[0]?.scheduledAt.toISOString() || null,
    preSessionNotes: latestNotes,
    commonTopics,
    moodTrend,
    aiSummary,
    alerts,
  };
}

// POST /api/therapist/insights - Generate session suggestions
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, clientMessage } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Get session with history
    const session = await prisma.therapySession.findFirst({
      where: { id: sessionId, therapistId: user.id },
      include: {
        user: { select: { name: true } },
        preSessionData: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get past sessions for context
    const pastSessions = await prisma.therapySession.findMany({
      where: {
        therapistId: user.id,
        userId: session.userId,
        scheduledAt: { lt: new Date() },
      },
      include: { postSessionSummary: true },
      orderBy: { scheduledAt: 'desc' },
      take: 3,
    });

    // Generate AI suggestions
    const model = getModel();
    const prompt = `You are an AI assistant helping a therapist during a live session. Provide 2-3 brief, actionable suggestions based on the context.

CLIENT: ${session.user.name}
PRE-SESSION MOOD: ${session.preSessionData?.moodRating || 'Not recorded'}/10
PRE-SESSION CONCERNS: ${session.preSessionData?.concernText || 'None'}
SESSION GOALS: ${session.preSessionData?.sessionGoals || 'None specified'}

PREVIOUS SESSIONS: ${pastSessions.length} completed
${pastSessions
  .map(
    (s) => `- Topics: ${s.postSessionSummary?.keyTopics || 'N/A'}`
  )
  .join('\n')}

${clientMessage ? `LATEST CLIENT STATEMENT: "${clientMessage}"` : ''}

Provide suggestions that are:
- Therapeutic and evidence-based
- Specific to this client's context
- Actionable in the moment

Return JSON (no markdown):
{"suggestions": [{"type": "technique|question|observation", "content": "..."}]}`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const parsed = JSON.parse(responseText);

    // Store suggestion for analytics
    await prisma.therapistAISuggestion.create({
      data: {
        therapySessionId: sessionId,
        timestamp: 0, // Can be updated to track when suggestion was made
        suggestionType: 'observation',
        content: JSON.stringify(parsed.suggestions),
        priority: 'medium',
        isUsed: false,
      },
    });

    return NextResponse.json({ suggestions: parsed.suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
