import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type {
  WeeklyProgressData,
  UpcomingSession,
  DashboardAchievement,
  ActivityItem
} from '@/types/dashboard';

// Helper function to calculate empathy score
async function calculateEmpathyScore(userId: string): Promise<number> {
  // 1. Therapy session feedback ratings (weight: 40%)
  const therapySessions = await prisma.therapySession.findMany({
    where: { userId, status: 'completed' },
    include: { postSessionSummary: true },
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  const avgTherapyRating = therapySessions.length > 0
    ? therapySessions.reduce((sum, s) => sum + (s.postSessionSummary?.rating || 3), 0) / therapySessions.length
    : 3; // default 3/5
  const therapyComponent = (avgTherapyRating / 5) * 100 * 0.4;

  // 2. Chat message positive sentiment ratio (weight: 35%)
  const chatMessages = await prisma.chatMessage.findMany({
    where: { senderId: userId },
    take: 50,
    orderBy: { createdAt: 'desc' }
  });
  let positiveSentimentCount = 0;
  chatMessages.forEach(m => {
    if (m.sentiment) {
      try {
        const sentiment = JSON.parse(m.sentiment);
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
  const personaConversations = await prisma.personaConversation.findMany({
    where: { userId },
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  let totalMessages = 0;
  personaConversations.forEach(c => {
    try {
      const messages = JSON.parse(c.messages || '[]');
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
async function calculateEngagementScore(userId: string): Promise<number> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 1. Session completion rate (weight: 30%)
  const sessionsLast30Days = await prisma.session.count({
    where: { userId, createdAt: { gte: thirtyDaysAgo } }
  });
  const sessionScore = Math.min(sessionsLast30Days / 15, 1) * 100 * 0.30;

  // 2. Journal streak consistency (weight: 25%)
  const journalStreak = await prisma.journalStreak.findUnique({
    where: { userId }
  });
  const streakScore = Math.min((journalStreak?.currentStreak || 0) / 14, 1) * 100 * 0.25;

  // 3. Login frequency - days active in last 7 days (weight: 25%)
  const recentSessions = await prisma.session.findMany({
    where: { userId, createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true }
  });
  const recentJournals = await prisma.journalEntry.findMany({
    where: { userId, createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true }
  });
  const uniqueActiveDays = new Set([
    ...recentSessions.map(s => s.createdAt.toDateString()),
    ...recentJournals.map(j => j.createdAt.toDateString())
  ]).size;
  const loginScore = (uniqueActiveDays / 7) * 100 * 0.25;

  // 4. Feature usage diversity (weight: 20%)
  const hasDeEscalation = await prisma.deEscalationSession.count({ where: { userId } }) > 0;
  const hasBiomarkers = await prisma.biomarker.count({ where: { userId } }) > 0;
  const hasPersonaChats = await prisma.personaConversation.count({ where: { userId } }) > 0;
  const hasTherapySessions = await prisma.therapySession.count({ where: { userId } }) > 0;
  const featureCount = [hasDeEscalation, hasBiomarkers, hasPersonaChats, hasTherapySessions].filter(Boolean).length;
  const featureScore = (featureCount / 4) * 100 * 0.20;

  return Math.round(sessionScore + streakScore + loginScore + featureScore);
}

// Helper function to get weekly progress data
async function getWeeklyProgress(userId: string): Promise<WeeklyProgressData> {
  const now = new Date();
  const sessions: number[] = [];
  const journalEntries: number[] = [];
  const moodTrend: number[] = [];

  // Get data for last 7 days
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const sessionCount = await prisma.session.count({
      where: { userId, createdAt: { gte: dayStart, lte: dayEnd } }
    });
    sessions.push(sessionCount);

    const journalCount = await prisma.journalEntry.count({
      where: { userId, createdAt: { gte: dayStart, lte: dayEnd } }
    });
    journalEntries.push(journalCount);

    // Get average mood for the day from sessions
    const daySessions = await prisma.session.findMany({
      where: { userId, createdAt: { gte: dayStart, lte: dayEnd } },
      select: { emotionalScore: true }
    });
    const avgMood = daySessions.length > 0
      ? Math.round(daySessions.reduce((sum, s) => sum + (s.emotionalScore || 50), 0) / daySessions.length)
      : 50;
    moodTrend.push(avgMood);
  }

  // Calculate week-over-week improvement
  const thisWeekSessions = sessions.reduce((a, b) => a + b, 0);
  const previousWeekStart = new Date(now);
  previousWeekStart.setDate(previousWeekStart.getDate() - 14);
  const previousWeekEnd = new Date(now);
  previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

  const lastWeekSessions = await prisma.session.count({
    where: { userId, createdAt: { gte: previousWeekStart, lt: previousWeekEnd } }
  });

  const improvement = lastWeekSessions > 0
    ? Math.round(((thisWeekSessions - lastWeekSessions) / lastWeekSessions) * 100)
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

    // Calculate enhanced metrics in parallel
    const [empathyScore, engagementScore, weeklyProgress, upcomingSessions, achievements, recentActivity] = await Promise.all([
      calculateEmpathyScore(authUser.userId),
      calculateEngagementScore(authUser.userId),
      getWeeklyProgress(authUser.userId),
      getUpcomingSessions(authUser.userId),
      getAchievements(authUser.userId),
      getRecentActivity(authUser.userId)
    ]);

    return NextResponse.json({
      stats: {
        sessionCount,
        avgCalmScore,
        journalCount,
        streak,
      },
      sentimentData,
      activity,
      userName: user?.name || 'User',
      // Enhanced dashboard data
      empathyScore,
      engagementScore,
      weeklyProgress,
      upcomingSessions,
      achievements,
      recentActivity,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
