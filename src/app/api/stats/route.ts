import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
