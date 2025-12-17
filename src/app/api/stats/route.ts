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

    return NextResponse.json({
      stats: {
        sessionCount,
        avgCalmScore,
        journalCount,
        streak,
      },
      activity,
      userName: user?.name || 'User',
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
