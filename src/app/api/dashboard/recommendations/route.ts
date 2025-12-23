import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getModel } from '@/lib/vertex';
import type { DashboardRecommendation } from '@/types/dashboard';

interface TodaySummary {
  sessionsCompleted: number;
  journalEntries: number;
  moodAverage: number | null;
  focusArea: string;
}

// Cache recommendations per user for 1 hour
const recommendationsCache = new Map<string, { data: DashboardRecommendation[]; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authUser.userId;
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Check cache
    const cached = recommendationsCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      // Still calculate today's summary fresh
      const todaySummary = await calculateTodaySummary(userId, today);
      return NextResponse.json({
        recommendations: cached.data,
        todaySummary,
        cached: true
      });
    }

    // Gather user data for AI analysis
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [recentSessions, recentJournals, recentBiomarkers, journalStreak, deEscalationSessions] = await Promise.all([
      prisma.session.findMany({
        where: { userId, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.journalEntry.findMany({
        where: { userId, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.biomarker.findMany({
        where: { userId, date: { gte: sevenDaysAgo } },
        orderBy: { date: 'desc' },
        take: 3
      }),
      prisma.journalStreak.findUnique({
        where: { userId }
      }),
      prisma.deEscalationSession.findMany({
        where: { userId, startTime: { gte: sevenDaysAgo } },
        orderBy: { startTime: 'desc' },
        take: 3
      })
    ]);

    // Prepare data summary for AI
    const userDataSummary = {
      sessionsThisWeek: recentSessions.length,
      avgCalmScore: recentSessions.length > 0
        ? Math.round(recentSessions.reduce((sum, s) => sum + s.calmScore, 0) / recentSessions.length)
        : null,
      journalsThisWeek: recentJournals.length,
      currentStreak: journalStreak?.currentStreak || 0,
      recentMoods: recentSessions.slice(0, 3).map(s => s.dominantMood).filter(Boolean),
      stressLevels: recentBiomarkers.map(b => Math.round(b.stress)),
      deEscalationSessionsCount: deEscalationSessions.length,
      hasUsedBiomarkers: recentBiomarkers.length > 0,
      recentDistortions: recentJournals
        .filter(j => j.distortion)
        .map(j => j.distortion)
        .slice(0, 3)
    };

    let recommendations: DashboardRecommendation[] = [];

    try {
      // Generate AI recommendations using Gemini
      const model = getModel();
      const prompt = `You are a mental wellness coach assistant. Based on this user's recent activity data, generate 3 personalized recommendations to help improve their mental health journey.

User Activity Summary:
- Sessions completed this week: ${userDataSummary.sessionsThisWeek}
- Average calm score: ${userDataSummary.avgCalmScore ?? 'No sessions yet'}%
- Journal entries this week: ${userDataSummary.journalsThisWeek}
- Current journaling streak: ${userDataSummary.currentStreak} days
- Recent moods: ${userDataSummary.recentMoods.length > 0 ? userDataSummary.recentMoods.join(', ') : 'Not tracked'}
- Recent stress levels: ${userDataSummary.stressLevels.length > 0 ? userDataSummary.stressLevels.join('%, ') + '%' : 'Not measured'}
- De-escalation practice sessions: ${userDataSummary.deEscalationSessionsCount}
- Uses voice biomarkers: ${userDataSummary.hasUsedBiomarkers ? 'Yes' : 'No'}
- Recent cognitive distortions identified: ${userDataSummary.recentDistortions.length > 0 ? userDataSummary.recentDistortions.join(', ') : 'None identified'}

Generate recommendations in JSON format with this structure:
[
  {
    "type": "technique" | "journal" | "session" | "insight",
    "priority": "high" | "medium" | "low",
    "title": "Short title (max 50 chars)",
    "message": "Helpful recommendation message (max 150 chars)",
    "actionLabel": "Button text if applicable",
    "actionHref": "URL path if applicable"
  }
]

Focus on:
1. Encouraging consistent practice if streaks are low
2. Suggesting stress management if stress levels are high
3. Recommending journal reflection for processing emotions
4. Celebrating progress and maintaining motivation

Return ONLY valid JSON array, no other text.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        recommendations = parsed.map((rec: Record<string, string>, index: number) => ({
          id: `rec-${Date.now()}-${index}`,
          type: rec.type || 'insight',
          priority: rec.priority || 'medium',
          title: rec.title || 'Wellness Tip',
          message: rec.message || 'Keep up the great work on your mental wellness journey!',
          action: rec.actionLabel && rec.actionHref ? {
            label: rec.actionLabel,
            href: rec.actionHref
          } : undefined,
          generatedAt: new Date().toISOString()
        }));
      }
    } catch (aiError) {
      console.error('AI recommendations generation failed:', aiError);
      // Fallback to rule-based recommendations
      recommendations = generateFallbackRecommendations(userDataSummary);
    }

    // Cache the recommendations
    recommendationsCache.set(userId, {
      data: recommendations,
      timestamp: Date.now()
    });

    // Calculate today's summary
    const todaySummary = await calculateTodaySummary(userId, today);

    return NextResponse.json({
      recommendations,
      todaySummary,
      cached: false
    });
  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}

async function calculateTodaySummary(userId: string, today: Date): Promise<TodaySummary> {
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todaySessions, todayJournals] = await Promise.all([
    prisma.session.findMany({
      where: {
        userId,
        createdAt: { gte: today, lt: tomorrow }
      }
    }),
    prisma.journalEntry.count({
      where: {
        userId,
        createdAt: { gte: today, lt: tomorrow }
      }
    })
  ]);

  const avgMood = todaySessions.length > 0
    ? Math.round(todaySessions.reduce((sum, s) => sum + (s.emotionalScore || 50), 0) / todaySessions.length)
    : null;

  // Determine focus area based on recent activity
  let focusArea = 'Mindfulness';
  if (todaySessions.length === 0) {
    focusArea = 'De-escalation Practice';
  } else if (todayJournals === 0) {
    focusArea = 'Reflective Journaling';
  } else if (avgMood && avgMood < 50) {
    focusArea = 'Stress Management';
  }

  return {
    sessionsCompleted: todaySessions.length,
    journalEntries: todayJournals,
    moodAverage: avgMood,
    focusArea
  };
}

function generateFallbackRecommendations(data: {
  sessionsThisWeek: number;
  avgCalmScore: number | null;
  journalsThisWeek: number;
  currentStreak: number;
  stressLevels: number[];
  hasUsedBiomarkers: boolean;
}): DashboardRecommendation[] {
  const recommendations: DashboardRecommendation[] = [];
  const now = new Date().toISOString();

  // Session-based recommendations
  if (data.sessionsThisWeek < 3) {
    recommendations.push({
      id: `rec-${Date.now()}-1`,
      type: 'session',
      priority: 'high',
      title: 'Practice De-escalation',
      message: 'Regular practice helps build emotional resilience. Try a quick session today!',
      action: { label: 'Start Session', href: '/de-escalation' },
      generatedAt: now
    });
  }

  // Journal streak recommendations
  if (data.currentStreak === 0) {
    recommendations.push({
      id: `rec-${Date.now()}-2`,
      type: 'journal',
      priority: 'medium',
      title: 'Start Your Journal Streak',
      message: 'Journaling helps process emotions. Begin your streak with a quick reflection.',
      action: { label: 'Write Entry', href: '/journal' },
      generatedAt: now
    });
  } else if (data.currentStreak >= 7) {
    recommendations.push({
      id: `rec-${Date.now()}-2`,
      type: 'insight',
      priority: 'low',
      title: 'Amazing Progress!',
      message: `${data.currentStreak}-day journaling streak! Your consistency is building strong habits.`,
      generatedAt: now
    });
  }

  // Stress-based recommendations
  const avgStress = data.stressLevels.length > 0
    ? data.stressLevels.reduce((a, b) => a + b, 0) / data.stressLevels.length
    : null;

  if (avgStress && avgStress > 60) {
    recommendations.push({
      id: `rec-${Date.now()}-3`,
      type: 'technique',
      priority: 'high',
      title: 'Manage Elevated Stress',
      message: 'Your recent stress levels are elevated. Try a breathing exercise to find calm.',
      action: { label: 'Try Breathing', href: '/de-escalation' },
      generatedAt: now
    });
  }

  // Biomarker recommendation
  if (!data.hasUsedBiomarkers) {
    recommendations.push({
      id: `rec-${Date.now()}-4`,
      type: 'insight',
      priority: 'medium',
      title: 'Try Voice Analysis',
      message: 'Voice biomarkers can reveal stress patterns you might not notice. Give it a try!',
      action: { label: 'Analyze Voice', href: '/biomarkers' },
      generatedAt: now
    });
  }

  // Ensure we have at least 3 recommendations
  while (recommendations.length < 3) {
    recommendations.push({
      id: `rec-${Date.now()}-${recommendations.length + 1}`,
      type: 'insight',
      priority: 'low',
      title: 'Keep Going!',
      message: 'Every small step counts toward better mental wellness. You\'re doing great!',
      generatedAt: now
    });
  }

  return recommendations.slice(0, 3);
}
