import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  getStreak,
  calculateMoodTrend,
  calculateDistortionStats,
  calculateTagCloud,
  getWeeklyActivity,
} from '@/lib/journal-utils';

// GET /api/journal-analytics - Get journal analytics
export async function GET(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'month';

    // Calculate date range
    let dateFrom: Date | undefined;
    const now = new Date();

    if (range === 'week') {
      dateFrom = new Date(now);
      dateFrom.setDate(dateFrom.getDate() - 7);
    } else if (range === 'month') {
      dateFrom = new Date(now);
      dateFrom.setMonth(dateFrom.getMonth() - 1);
    }
    // 'all' means no date filter

    // Fetch entries
    const entries = await prisma.journalEntry.findMany({
      where: {
        userId: authUser.userId,
        ...(dateFrom && { createdAt: { gte: dateFrom } }),
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        mood: true,
        moodAfter: true,
        distortion: true,
        distortions: true,
        tags: true,
        createdAt: true,
      },
    });

    // Fetch sessions
    const sessions = await prisma.journalSession.findMany({
      where: {
        userId: authUser.userId,
        ...(dateFrom && { createdAt: { gte: dateFrom } }),
      },
      select: {
        sessionType: true,
      },
    });

    // Get streak
    const streak = await getStreak(authUser.userId);

    // Calculate mood trends
    const moodTrends = calculateMoodTrend(entries);

    // Calculate distortion stats
    const distortionStats = calculateDistortionStats(entries);

    // Calculate tag cloud
    const tagCloud = calculateTagCloud(entries);

    // Calculate weekly activity
    const weeklyActivity = getWeeklyActivity(entries);

    // Calculate average mood
    const moodsWithValues = entries.filter((e) => e.mood !== null);
    const averageMood = moodsWithValues.length > 0
      ? moodsWithValues.reduce((sum, e) => sum + (e.mood || 0), 0) / moodsWithValues.length
      : null;

    // Calculate mood improvement (compare first half to second half)
    let moodImprovement: number | null = null;
    if (moodsWithValues.length >= 4) {
      const half = Math.floor(moodsWithValues.length / 2);
      const firstHalf = moodsWithValues.slice(0, half);
      const secondHalf = moodsWithValues.slice(half);

      const firstAvg = firstHalf.reduce((sum, e) => sum + (e.mood || 0), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, e) => sum + (e.mood || 0), 0) / secondHalf.length;

      moodImprovement = secondAvg - firstAvg;
    }

    // Count sessions by type
    const sessionsByType: Record<string, number> = {};
    sessions.forEach((s) => {
      sessionsByType[s.sessionType] = (sessionsByType[s.sessionType] || 0) + 1;
    });

    return NextResponse.json({
      streak,
      moodTrends,
      distortionStats,
      tagCloud,
      weeklyActivity,
      totalSessions: sessions.length,
      sessionsByType,
      averageMood: averageMood ? Math.round(averageMood * 10) / 10 : null,
      moodImprovement: moodImprovement ? Math.round(moodImprovement * 10) / 10 : null,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

// POST /api/journal-analytics - Generate AI insights
export async function POST() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This could generate AI-powered insights based on journal history
    // For now, return a placeholder
    return NextResponse.json({
      insights: [
        "You've been journaling consistently - great habit!",
        "Your mood tends to be higher in the mornings.",
        "Consider exploring more gratitude-focused entries.",
      ],
    });
  } catch (error) {
    console.error('Generate insights error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
