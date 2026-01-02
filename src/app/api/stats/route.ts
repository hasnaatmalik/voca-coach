import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type {
  WeeklyProgressData,
  UpcomingSession,
  DashboardAchievement,
  ActivityItem
} from '@/types/dashboard';

// Helper function to calculate empathy score from pre-fetched data
function calculateEmpathyScore(
  therapySessions: any[],
  chatMessages: any[],
  personaConversations: any[]
): number {
  // 1. Therapy session feedback ratings (weight: 40%)
  const avgTherapyRating = therapySessions.length > 0
    ? therapySessions.reduce((sum, s) => sum + (s.postSessionSummary?.rating || 3), 0) / therapySessions.length
    : 3; // default 3/5
  const therapyComponent = (avgTherapyRating / 5) * 100 * 0.4;

  // 2. Chat message positive sentiment ratio (weight: 35%)
  let positiveSentimentCount = 0;
  chatMessages.forEach(m => {
    if (m.sentiment) {
      try {
        const sentiment = typeof m.sentiment === 'string' ? JSON.parse(m.sentiment) : m.sentiment;
        if (sentiment.label === 'positive' || sentiment.score > 0.5 || sentiment.moodScore > 5) {
          positiveSentimentCount++;
        }
      } catch {
        // Skip invalid JSON
      }
    }
  });
  const sentimentRatio = chatMessages.length > 0 ? positiveSentimentCount / chatMessages.length : 0.5;
  const chatComponent = sentimentRatio * 100 * 0.35;

  // 3. Persona conversation engagement depth (weight: 25%)
  let totalMessages = 0;
  personaConversations.forEach(c => {
    try {
      const messages = typeof c.messages === 'string' ? JSON.parse(c.messages || '[]') : (c.messages || []);
      totalMessages += messages.length;
    } catch {
      // Skip invalid JSON
    }
  });
  const avgMessageCount = personaConversations.length > 0 ? totalMessages / personaConversations.length : 0;
  const engagementDepth = Math.min(avgMessageCount / 20, 1); // cap at 20 messages
  const personaComponent = engagementDepth * 100 * 0.25;

  return Math.round(therapyComponent + chatComponent + personaComponent);
}

// Helper function to calculate engagement score
// Helper function to calculate engagement score from pre-fetched data
function calculateEngagementScore(
  userId: string,
  sessions30Days: any[],
  journalStreak: any,
  recentSessions: any[],
  recentJournals: any[],
  featureUsage: {
    hasDeEscalation: boolean;
    hasBiomarkers: boolean;
    hasPersonaChats: boolean;
    hasTherapySessions: boolean;
  }
): number {
  // 1. Session completion rate (weight: 30%)
  const sessionScore = Math.min(sessions30Days.length / 15, 1) * 100 * 0.30;

  // 2. Journal streak consistency (weight: 25%)
  const streakScore = Math.min((journalStreak?.currentStreak || 0) / 14, 1) * 100 * 0.25;

  // 3. Login frequency - days active in last 7 days (weight: 25%)
  const uniqueActiveDays = new Set([
    ...recentSessions.map(s => new Date(s.createdAt).toDateString()),
    ...recentJournals.map(j => new Date(j.createdAt).toDateString())
  ]).size;
  const loginScore = (uniqueActiveDays / 7) * 100 * 0.25;

  // 4. Feature usage diversity (weight: 20%)
  const featureCount = [
    featureUsage.hasDeEscalation,
    featureUsage.hasBiomarkers,
    featureUsage.hasPersonaChats,
    featureUsage.hasTherapySessions
  ].filter(Boolean).length;
  const featureScore = (featureCount / 4) * 100 * 0.20;

  return Math.round(sessionScore + streakScore + loginScore + featureScore);
}

// Helper function to get weekly progress data
// Helper function to get weekly progress data from pre-fetched data
function getWeeklyProgress(
  sessions7Days: any[],
  journals7Days: any[],
  sessionsPrevWeek: number
): WeeklyProgressData {
  const sessions: number[] = new Array(7).fill(0);
  const journalEntries: number[] = new Array(7).fill(0);
  const moodTrend: number[] = new Array(7).fill(50);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Distribute data across days
  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - (6 - i));
    const dateStr = targetDate.toDateString();

    const daySessions = sessions7Days.filter(s => new Date(s.createdAt).toDateString() === dateStr);
    const dayJournals = journals7Days.filter(j => new Date(j.createdAt).toDateString() === dateStr);

    sessions[i] = daySessions.length;
    journalEntries[i] = dayJournals.length;

    if (daySessions.length > 0) {
      moodTrend[i] = Math.round(daySessions.reduce((sum, s) => sum + (s.emotionalScore || 50), 0) / daySessions.length);
    }
  }

  // Calculate week-over-week improvement
  const thisWeekSessions = sessions.reduce((a, b) => a + b, 0);
  const improvement = sessionsPrevWeek > 0
    ? Math.round(((thisWeekSessions - sessionsPrevWeek) / sessionsPrevWeek) * 100)
    : thisWeekSessions > 0 ? 100 : 0;

  return { sessions, journalEntries, moodTrend, improvement };
}

// Helper function to get upcoming therapy sessions
async function getUpcomingSessions(userId: string): Promise<UpcomingSession[]> {
  const now = new Date();
  const upcomingSessions = await prisma.therapySession.findMany({
    where: {
      userId,
      status: 'scheduled',
      scheduledAt: { gte: now }
    },
    include: {
      therapist: {
        select: { name: true }
      }
    },
    orderBy: { scheduledAt: 'asc' },
    take: 3
  });

  return upcomingSessions.map(s => ({
    id: s.id,
    therapistName: s.therapist?.name || 'Therapist',
    therapistId: s.therapistId,
    scheduledAt: s.scheduledAt.toISOString(),
    duration: s.duration || 60,
    status: s.status as 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  }));
}

// Helper function to get achievements
async function getAchievements(userId: string): Promise<DashboardAchievement[]> {
  const achievements = await prisma.deEscalationAchievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: 'desc' },
    take: 5
  });

  return achievements.map(a => ({
    id: a.id,
    name: a.name,
    icon: a.icon,
    type: a.type as 'streak' | 'sessions' | 'techniques' | 'improvement',
    unlockedAt: a.unlockedAt.toISOString()
  }));
}

// Helper function to get recent activity across all features
async function getRecentActivity(userId: string): Promise<ActivityItem[]> {
  const activities: ActivityItem[] = [];

  // Get recent sessions
  const recentSessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  recentSessions.forEach(s => {
    activities.push({
      id: s.id,
      type: 'session',
      title: 'De-escalation Session',
      description: `Calm score: ${Math.round(s.calmScore)}%`,
      timestamp: s.createdAt.toISOString(),
      icon: '🎯'
    });
  });

  // Get recent journal entries
  const recentJournals = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  recentJournals.forEach(j => {
    activities.push({
      id: j.id,
      type: 'journal',
      title: j.title || 'Journal Entry',
      description: j.content.slice(0, 50) + (j.content.length > 50 ? '...' : ''),
      timestamp: j.createdAt.toISOString(),
      icon: '📝'
    });
  });

  // Get recent biomarker readings
  const recentBiomarkers = await prisma.biomarker.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 2
  });
  recentBiomarkers.forEach(b => {
    activities.push({
      id: b.id,
      type: 'biomarker',
      title: 'Voice Analysis',
      description: `Stress: ${Math.round(b.stress)}%, Clarity: ${Math.round(b.clarity)}%`,
      timestamp: b.date.toISOString(),
      icon: '🎤'
    });
  });

  // Get recent achievements
  const recentAchievements = await prisma.deEscalationAchievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: 'desc' },
    take: 2
  });
  recentAchievements.forEach(a => {
    activities.push({
      id: a.id,
      type: 'achievement',
      title: 'Achievement Unlocked',
      description: a.name,
      timestamp: a.unlockedAt.toISOString(),
      icon: a.icon
    });
  });

  // Sort by timestamp and return top 10
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
}

// GET /api/stats - Get dashboard stats for current user
export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get session count and average calm score
    const sessions = await prisma.session.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: 'desc' },
    });

    const sessionCount = sessions.length;
    const avgCalmScore = sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.calmScore, 0) / sessions.length)
      : 0;

    // Get journal entry count
    const journalCount = await prisma.journalEntry.count({
      where: { userId: authUser.userId },
    });

    // Calculate streak (consecutive days with sessions)
    let streak = 0;
    if (sessions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get unique days with sessions
      const sessionDays = new Set(
        sessions.map(s => {
          const d = new Date(s.createdAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      );

      // Check consecutive days from today
      let checkDate = today.getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      while (sessionDays.has(checkDate)) {
        streak++;
        checkDate -= oneDay;
      }
    }

    // Get recent activity
    const recentSessions = sessions.slice(0, 4);
    const recentJournalEntries = await prisma.journalEntry.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    // Merge and sort recent activity
    const activity = [
      ...recentSessions.map(s => ({
        type: 'session' as const,
        time: s.createdAt,
        action: 'Completed de-escalation session',
        result: `Calm score: ${Math.round(s.calmScore)}%`,
      })),
      ...recentJournalEntries.map(e => ({
        type: 'journal' as const,
        time: e.createdAt,
        action: `Journal entry: "${e.content.slice(0, 30)}${e.content.length > 30 ? '...' : ''}"`,
        result: e.distortion ? `Identified: ${e.distortion}` : 'Reflection logged',
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4);

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { name: true },
    });

    // Aggregate sentiment data from sessions with sentiment snapshots
    const sessionsWithSentiments = await prisma.session.findMany({
      where: { userId: authUser.userId },
      include: {
        sentiments: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Last 10 sessions for trends
    });

    let sentimentData = null;
    const sessionsWithData = sessionsWithSentiments.filter(s => s.sentiments.length > 0);

    if (sessionsWithData.length > 0) {
      // Calculate average emotions across all sentiment snapshots
      const allEmotions: any = { happy: 0, sad: 0, anxious: 0, calm: 0, neutral: 0, frustrated: 0 };
      let totalSnapshots = 0;

      sessionsWithData.forEach(session => {
        session.sentiments.forEach(snapshot => {
          const emotions = JSON.parse(snapshot.emotions);
          Object.keys(allEmotions).forEach(key => {
            allEmotions[key] += emotions[key] || 0;
          });
          totalSnapshots++;
        });
      });

      // Average the emotions
      const avgEmotions = Object.keys(allEmotions).reduce((acc: any, key) => {
        acc[key] = totalSnapshots > 0 ? allEmotions[key] / totalSnapshots : 0;
        return acc;
      }, {});

      // Calculate dominant mood (most common across sessions)
      const moodCounts: { [key: string]: number } = {};
      sessionsWithData.forEach(session => {
        if (session.dominantMood) {
          moodCounts[session.dominantMood] = (moodCounts[session.dominantMood] || 0) + 1;
        }
      });
      const dominantMood = Object.keys(moodCounts).length > 0
        ? Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b)
        : 'neutral';

      // Calculate emotional stability (average emotional score)
      const avgEmotionalStability = sessionsWithData
        .filter(s => s.emotionalScore !== null)
        .reduce((sum, s) => sum + (s.emotionalScore || 0), 0) / sessionsWithData.filter(s => s.emotionalScore !== null).length || 50;

      // Get recent sessions with mood data
      const recentSessions = sessionsWithData.slice(0, 7).map(s => ({
        date: s.createdAt,
        dominantMood: s.dominantMood || 'neutral',
        emotionalScore: s.emotionalScore || 0,
        moodChanges: s.moodChanges || 0
      }));

      sentimentData = {
        avgEmotions,
        dominantMood,
        emotionalStability: Math.round(avgEmotionalStability),
        recentSessions
      };
    }

    // 7. Optimization: Consolidated Data Fetching
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      therapySessionsHist,
      chatMessagesHist,
      personaConversationsHist,
      sessionsHist,
      journalsHist,
      journalStreak,
      upcomingSessionsRaw,
      achievementsRaw,
      biomarkersHist,
      deEscalationSessionsHist,
      // Prev week sessions for improvement calculation
      prevWeekSessionCount,
      // Feature usage flags
      hasDeEscalation,
      hasBiomarkers,
      hasPersonaChats,
      hasTherapySessionsCheck
    ] = await Promise.all([
      prisma.therapySession.findMany({ where: { userId: authUser.userId, status: 'completed' }, include: { postSessionSummary: true }, take: 10, orderBy: { createdAt: 'desc' } }),
      prisma.chatMessage.findMany({ where: { senderId: authUser.userId }, take: 50, orderBy: { createdAt: 'desc' } }),
      prisma.personaConversation.findMany({ where: { userId: authUser.userId }, take: 10, orderBy: { createdAt: 'desc' } }),
      prisma.session.findMany({ where: { userId: authUser.userId, createdAt: { gte: thirtyDaysAgo } }, orderBy: { createdAt: 'desc' } }),
      prisma.journalEntry.findMany({ where: { userId: authUser.userId, createdAt: { gte: thirtyDaysAgo } }, orderBy: { createdAt: 'desc' } }),
      prisma.journalStreak.findUnique({ where: { userId: authUser.userId } }),
      prisma.therapySession.findMany({ where: { userId: authUser.userId, status: 'scheduled', scheduledAt: { gte: now } }, include: { therapist: { select: { name: true } } }, orderBy: { scheduledAt: 'asc' }, take: 3 }),
      prisma.deEscalationAchievement.findMany({ where: { userId: authUser.userId }, orderBy: { unlockedAt: 'desc' }, take: 5 }),
      prisma.biomarker.findMany({ where: { userId: authUser.userId }, orderBy: { date: 'desc' }, take: 5 }),
      prisma.deEscalationSession.findMany({ where: { userId: authUser.userId }, orderBy: { startTime: 'desc' }, take: 5 }),
      prisma.session.count({ where: { userId: authUser.userId, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
      prisma.deEscalationSession.count({ where: { userId: authUser.userId } }),
      prisma.biomarker.count({ where: { userId: authUser.userId } }),
      prisma.personaConversation.count({ where: { userId: authUser.userId } }),
      prisma.therapySession.count({ where: { userId: authUser.userId } })
    ]);

    // Calculate scores in-memory
    const sessions7Days = sessionsHist.filter(s => new Date(s.createdAt) >= sevenDaysAgo);
    const journals7Days = journalsHist.filter(j => new Date(j.createdAt) >= sevenDaysAgo);

    const empathyScore = calculateEmpathyScore(therapySessionsHist, chatMessagesHist, personaConversationsHist);
    const engagementScore = calculateEngagementScore(
      authUser.userId,
      sessionsHist, // This is 30 days
      journalStreak,
      sessions7Days,
      journals7Days,
      {
        hasDeEscalation: hasDeEscalation > 0,
        hasBiomarkers: hasBiomarkers > 0,
        hasPersonaChats: hasPersonaChats > 0,
        hasTherapySessions: hasTherapySessionsCheck > 0
      }
    );
    const weeklyProgress = getWeeklyProgress(sessions7Days, journals7Days, prevWeekSessionCount);

    const upcomingSessions = upcomingSessionsRaw.map(s => ({
      id: s.id,
      therapistName: s.therapist?.name || 'Therapist',
      therapistId: s.therapistId,
      scheduledAt: s.scheduledAt.toISOString(),
      duration: s.duration || 60,
      status: s.status as any
    }));

    const achievements = achievementsRaw.map(a => ({
      id: a.id,
      name: a.name,
      icon: a.icon,
      type: a.type as any,
      unlockedAt: a.unlockedAt.toISOString()
    }));

    // Construct recent activity from fetched data
    const recentActivityItems: ActivityItem[] = [
      ...sessionsHist.slice(0, 3).map(s => ({
        id: s.id,
        type: 'session' as const,
        title: 'De-escalation Session',
        description: `Calm score: ${Math.round(s.calmScore)}%`,
        timestamp: s.createdAt.toISOString(),
        icon: '🎯'
      })),
      ...journalsHist.slice(0, 3).map(j => ({
        id: j.id,
        type: 'journal' as const,
        title: j.title || 'Journal Entry',
        description: j.content.slice(0, 50) + (j.content.length > 50 ? '...' : ''),
        timestamp: j.createdAt.toISOString(),
        icon: '📝'
      })),
      ...biomarkersHist.slice(0, 2).map(b => ({
        id: b.id,
        type: 'biomarker' as const,
        title: 'Voice Analysis',
        description: `Stress: ${Math.round(b.stress)}%, Clarity: ${Math.round(b.clarity)}%`,
        timestamp: b.date.toISOString(),
        icon: '🎤'
      })),
      ...achievementsRaw.slice(0, 2).map(a => ({
        id: a.id,
        type: 'achievement' as const,
        title: 'Achievement Unlocked',
        description: a.name,
        timestamp: a.unlockedAt.toISOString(),
        icon: a.icon
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    return NextResponse.json({
      stats: {
        sessionCount: sessionsHist.length, // approximation or fetch total if needed
        avgCalmScore: sessionsHist.length > 0 ? Math.round(sessionsHist.reduce((sum, s) => sum + s.calmScore, 0) / sessionsHist.length) : 0,
        journalCount: journalsHist.length, // approximation
        streak: streak, // already calculated above
      },
      sentimentData,
      activity,
      userName: user?.name || 'User',
      empathyScore,
      engagementScore,
      weeklyProgress,
      upcomingSessions,
      achievements,
      recentActivity: recentActivityItems,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
