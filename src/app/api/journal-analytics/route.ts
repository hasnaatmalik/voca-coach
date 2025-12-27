import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getModel } from '@/lib/vertex';
import {
  getStreak,
  calculateMoodTrend,
  calculateDistortionStats,
  calculateTagCloud,
  getWeeklyActivity,
  COGNITIVE_DISTORTIONS,
} from '@/lib/journal-utils';

// Cache insights per user for 2 hours
const insightsCache = new Map<string, { data: string[]; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

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
export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { forceRefresh = false } = await req.json().catch(() => ({}));

    // Check cache unless force refresh
    if (!forceRefresh) {
      const cached = insightsCache.get(authUser.userId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json({ insights: cached.data, cached: true });
      }
    }

    // Fetch user's journal data from the past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [entries, sessions, streak] = await Promise.all([
      prisma.journalEntry.findMany({
        where: {
          userId: authUser.userId,
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          mood: true,
          moodAfter: true,
          distortion: true,
          distortions: true,
          tags: true,
          content: true,
          isVoiceEntry: true,
          createdAt: true,
        },
      }),
      prisma.journalSession.findMany({
        where: {
          userId: authUser.userId,
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          sessionType: true,
          moodStart: true,
          moodEnd: true,
          isComplete: true,
          createdAt: true,
        },
      }),
      getStreak(authUser.userId),
    ]);

    // Calculate analytics
    const moodTrends = calculateMoodTrend(entries);
    const distortionStats = calculateDistortionStats(entries);
    const tagCloud = calculateTagCloud(entries);
    const weeklyActivity = getWeeklyActivity(entries);

    // Calculate mood improvement
    const moodsWithValues = entries.filter((e) => e.mood !== null);
    let moodImprovement: number | null = null;
    let averageMood: number | null = null;

    if (moodsWithValues.length >= 2) {
      averageMood = moodsWithValues.reduce((sum, e) => sum + (e.mood || 0), 0) / moodsWithValues.length;

      if (moodsWithValues.length >= 4) {
        const half = Math.floor(moodsWithValues.length / 2);
        const firstHalf = moodsWithValues.slice(half); // older entries (entries are desc)
        const secondHalf = moodsWithValues.slice(0, half); // newer entries

        const firstAvg = firstHalf.reduce((sum, e) => sum + (e.mood || 0), 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, e) => sum + (e.mood || 0), 0) / secondHalf.length;

        moodImprovement = secondAvg - firstAvg;
      }
    }

    // Count session types
    const sessionsByType: Record<string, number> = {};
    sessions.forEach((s) => {
      sessionsByType[s.sessionType] = (sessionsByType[s.sessionType] || 0) + 1;
    });

    // Calculate mood after journaling improvement
    const entriesWithBothMoods = entries.filter((e) => e.mood !== null && e.moodAfter !== null);
    const avgMoodLift = entriesWithBothMoods.length > 0
      ? entriesWithBothMoods.reduce((sum, e) => sum + ((e.moodAfter || 0) - (e.mood || 0)), 0) / entriesWithBothMoods.length
      : null;

    // Identify most active days
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mostActiveDay = weeklyActivity.indexOf(Math.max(...weeklyActivity));
    const leastActiveDay = weeklyActivity.indexOf(Math.min(...weeklyActivity.filter(d => d >= 0)));

    // Get recent content themes (last 5 entries, truncated)
    const recentThemes = entries
      .slice(0, 5)
      .map((e) => e.content?.substring(0, 100))
      .filter(Boolean);

    // Build context for AI
    const analyticsContext = {
      totalEntries: entries.length,
      totalSessions: sessions.length,
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      averageMood: averageMood ? Math.round(averageMood * 10) / 10 : null,
      moodImprovement: moodImprovement ? Math.round(moodImprovement * 10) / 10 : null,
      avgMoodLiftAfterJournaling: avgMoodLift ? Math.round(avgMoodLift * 10) / 10 : null,
      topDistortions: distortionStats.slice(0, 3).map((d) => d.type),
      topTags: tagCloud.slice(0, 5).map((t) => t.tag),
      mostActiveDay: dayNames[mostActiveDay],
      leastActiveDay: dayNames[leastActiveDay],
      voiceEntriesCount: entries.filter((e) => e.isVoiceEntry).length,
      completedSessions: sessions.filter((s) => s.isComplete).length,
      sessionTypes: Object.keys(sessionsByType),
      recentThemes: recentThemes.slice(0, 3),
    };

    let insights: string[] = [];

    try {
      const model = getModel();
      const prompt = `You are a compassionate mental wellness coach analyzing a user's journaling patterns. Based on their data, generate 3-5 personalized, actionable insights to help them on their mental health journey.

User's Journal Analytics (Past 30 Days):
- Total journal entries: ${analyticsContext.totalEntries}
- Total guided sessions: ${analyticsContext.totalSessions}
- Current journaling streak: ${analyticsContext.currentStreak} days
- Longest streak achieved: ${analyticsContext.longestStreak} days
- Average mood rating: ${analyticsContext.averageMood ?? 'Not enough data'}/10
- Mood trend (recent vs earlier): ${analyticsContext.moodImprovement !== null ? (analyticsContext.moodImprovement > 0 ? `+${analyticsContext.moodImprovement} improvement` : `${analyticsContext.moodImprovement} change`) : 'Not enough data'}
- Average mood lift after journaling: ${analyticsContext.avgMoodLiftAfterJournaling !== null ? (analyticsContext.avgMoodLiftAfterJournaling > 0 ? `+${analyticsContext.avgMoodLiftAfterJournaling}` : analyticsContext.avgMoodLiftAfterJournaling) : 'Not tracked'}
- Most common cognitive distortions: ${analyticsContext.topDistortions.length > 0 ? analyticsContext.topDistortions.join(', ') : 'None identified'}
- Frequently used tags: ${analyticsContext.topTags.length > 0 ? analyticsContext.topTags.join(', ') : 'None'}
- Most active journaling day: ${analyticsContext.mostActiveDay}
- Least active journaling day: ${analyticsContext.leastActiveDay}
- Voice journal entries: ${analyticsContext.voiceEntriesCount}
- Session types used: ${analyticsContext.sessionTypes.length > 0 ? analyticsContext.sessionTypes.join(', ') : 'None'}

Known cognitive distortions to reference: ${COGNITIVE_DISTORTIONS.slice(0, 6).join(', ')}

Generate insights in JSON format:
{
  "insights": [
    "Insight 1 - observation about their patterns with encouragement",
    "Insight 2 - specific, actionable suggestion based on their data",
    "Insight 3 - recognition of progress or area for growth"
  ]
}

Guidelines:
- Be warm, supportive, and specific to their data
- Reference actual numbers from their data when relevant
- If they have cognitive distortions, gently suggest awareness strategies
- Celebrate progress (streaks, mood improvements, consistency)
- Suggest trying different session types if they haven't explored them
- Keep each insight to 1-2 sentences, clear and actionable
- If data is limited, focus on encouragement and suggestions to build habits

Return ONLY valid JSON.`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      });

      const responseText = result.response.text();
      const parsed = JSON.parse(responseText);
      insights = parsed.insights || [];
    } catch (aiError) {
      console.error('AI insights generation failed:', aiError);
      // Fallback to rule-based insights
      insights = generateFallbackInsights(analyticsContext);
    }

    // Ensure we have at least some insights
    if (insights.length === 0) {
      insights = generateFallbackInsights(analyticsContext);
    }

    // Cache the results
    insightsCache.set(authUser.userId, {
      data: insights,
      timestamp: Date.now(),
    });

    return NextResponse.json({ insights, cached: false });
  } catch (error) {
    console.error('Generate insights error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}

// Fallback insights when AI is unavailable
function generateFallbackInsights(data: {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  averageMood: number | null;
  moodImprovement: number | null;
  avgMoodLiftAfterJournaling: number | null;
  topDistortions: string[];
  mostActiveDay: string;
  voiceEntriesCount: number;
}): string[] {
  const insights: string[] = [];

  // Streak-based insights
  if (data.currentStreak >= 7) {
    insights.push(`Amazing! You're on a ${data.currentStreak}-day journaling streak. This consistency is building powerful self-awareness habits.`);
  } else if (data.currentStreak >= 3) {
    insights.push(`You're building momentum with a ${data.currentStreak}-day streak! Keep it going to strengthen your reflection practice.`);
  } else if (data.totalEntries > 0) {
    insights.push("Starting a daily journaling habit can boost self-awareness. Try setting a reminder to write at the same time each day.");
  }

  // Mood-based insights
  if (data.moodImprovement !== null && data.moodImprovement > 0.5) {
    insights.push(`Your mood has improved by ${data.moodImprovement.toFixed(1)} points recently. Your journaling practice is making a positive difference!`);
  } else if (data.avgMoodLiftAfterJournaling !== null && data.avgMoodLiftAfterJournaling > 0) {
    insights.push(`On average, your mood improves by ${data.avgMoodLiftAfterJournaling.toFixed(1)} points after journaling. This shows the therapeutic value of your practice.`);
  }

  // Distortion-based insights
  if (data.topDistortions.length > 0) {
    insights.push(`You've been working on recognizing "${data.topDistortions[0]}" thinking patterns. Awareness is the first step toward balanced thinking.`);
  }

  // Activity pattern insights
  if (data.mostActiveDay) {
    insights.push(`${data.mostActiveDay}s are your most productive journaling days. Consider protecting this time in your schedule.`);
  }

  // Voice entry insights
  if (data.voiceEntriesCount > 0) {
    insights.push("You've been using voice journaling - great for capturing thoughts when typing feels like too much effort!");
  } else if (data.totalEntries > 5) {
    insights.push("Try voice journaling when you're on the go. Speaking your thoughts can feel more natural and reveal different insights.");
  }

  // Ensure we have at least 3 insights
  while (insights.length < 3) {
    const genericInsights = [
      "Regular journaling helps process emotions and reduce stress. Even a few minutes makes a difference.",
      "Consider trying different journaling modes - gratitude, CBT, or free-writing each offer unique benefits.",
      "Your journal is a safe space for honest self-reflection. There's no wrong way to express yourself here.",
    ];
    insights.push(genericInsights[insights.length % genericInsights.length]);
  }

  return insights.slice(0, 5);
}
