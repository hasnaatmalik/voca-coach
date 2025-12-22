import { prisma } from './prisma';

export interface JournalStreak {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: Date | null;
  totalEntries: number;
}

export async function updateStreak(userId: string): Promise<JournalStreak> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = await prisma.journalStreak.findUnique({ where: { userId } });

  if (!streak) {
    streak = await prisma.journalStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastEntryDate: today,
        totalEntries: 1,
      },
    });
  } else {
    const lastDate = streak.lastEntryDate ? new Date(streak.lastEntryDate) : null;
    if (lastDate) {
      lastDate.setHours(0, 0, 0, 0);
    }

    const diffDays = lastDate
      ? Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      : 2;

    let newCurrentStreak = streak.currentStreak;
    if (diffDays === 0) {
      // Same day, no streak change, just increment total
    } else if (diffDays === 1) {
      // Consecutive day
      newCurrentStreak += 1;
    } else {
      // Streak broken
      newCurrentStreak = 1;
    }

    streak = await prisma.journalStreak.update({
      where: { userId },
      data: {
        currentStreak: newCurrentStreak,
        longestStreak: Math.max(streak.longestStreak, newCurrentStreak),
        lastEntryDate: today,
        totalEntries: { increment: 1 },
      },
    });
  }

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastEntryDate: streak.lastEntryDate,
    totalEntries: streak.totalEntries,
  };
}

export async function getStreak(userId: string): Promise<JournalStreak | null> {
  const streak = await prisma.journalStreak.findUnique({ where: { userId } });
  if (!streak) return null;

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastEntryDate: streak.lastEntryDate,
    totalEntries: streak.totalEntries,
  };
}

export interface MoodTrend {
  date: string;
  mood: number;
  moodAfter?: number;
}

export function calculateMoodTrend(
  entries: Array<{ createdAt: Date; mood: number | null; moodAfter: number | null }>
): MoodTrend[] {
  const moodMap = new Map<string, { moods: number[]; moodsAfter: number[] }>();

  entries.forEach((entry) => {
    if (entry.mood !== null) {
      const dateKey = entry.createdAt.toISOString().split('T')[0];
      if (!moodMap.has(dateKey)) {
        moodMap.set(dateKey, { moods: [], moodsAfter: [] });
      }
      const data = moodMap.get(dateKey)!;
      data.moods.push(entry.mood);
      if (entry.moodAfter !== null) {
        data.moodsAfter.push(entry.moodAfter);
      }
    }
  });

  const trends: MoodTrend[] = [];
  moodMap.forEach((data, date) => {
    const avgMood = data.moods.reduce((a, b) => a + b, 0) / data.moods.length;
    const avgMoodAfter =
      data.moodsAfter.length > 0
        ? data.moodsAfter.reduce((a, b) => a + b, 0) / data.moodsAfter.length
        : undefined;

    trends.push({
      date,
      mood: Math.round(avgMood * 10) / 10,
      moodAfter: avgMoodAfter ? Math.round(avgMoodAfter * 10) / 10 : undefined,
    });
  });

  return trends.sort((a, b) => a.date.localeCompare(b.date));
}

export interface DistortionStats {
  type: string;
  count: number;
  percentage: number;
}

export function calculateDistortionStats(
  entries: Array<{ distortion: string | null; distortions: string | null }>
): DistortionStats[] {
  const distortionCounts = new Map<string, number>();
  let totalDistortions = 0;

  entries.forEach((entry) => {
    // Handle single distortion field
    if (entry.distortion) {
      const count = distortionCounts.get(entry.distortion) || 0;
      distortionCounts.set(entry.distortion, count + 1);
      totalDistortions++;
    }

    // Handle multiple distortions (JSON array)
    if (entry.distortions) {
      try {
        const parsed = JSON.parse(entry.distortions) as Array<{ type: string }>;
        parsed.forEach((d) => {
          const count = distortionCounts.get(d.type) || 0;
          distortionCounts.set(d.type, count + 1);
          totalDistortions++;
        });
      } catch {
        // Invalid JSON, skip
      }
    }
  });

  const stats: DistortionStats[] = [];
  distortionCounts.forEach((count, type) => {
    stats.push({
      type,
      count,
      percentage: totalDistortions > 0 ? Math.round((count / totalDistortions) * 100) : 0,
    });
  });

  return stats.sort((a, b) => b.count - a.count);
}

export interface TagCloud {
  tag: string;
  count: number;
}

export function calculateTagCloud(
  entries: Array<{ tags: string | null }>
): TagCloud[] {
  const tagCounts = new Map<string, number>();

  entries.forEach((entry) => {
    if (entry.tags) {
      try {
        const parsed = JSON.parse(entry.tags) as string[];
        parsed.forEach((tag) => {
          const normalizedTag = tag.toLowerCase().trim();
          const count = tagCounts.get(normalizedTag) || 0;
          tagCounts.set(normalizedTag, count + 1);
        });
      } catch {
        // Invalid JSON, skip
      }
    }
  });

  const cloud: TagCloud[] = [];
  tagCounts.forEach((count, tag) => {
    cloud.push({ tag, count });
  });

  return cloud.sort((a, b) => b.count - a.count);
}

export function getWeeklyActivity(
  entries: Array<{ createdAt: Date }>
): number[] {
  // Returns array of 7 numbers (Sun-Sat) representing entry counts
  const activity = [0, 0, 0, 0, 0, 0, 0];

  entries.forEach((entry) => {
    const dayOfWeek = entry.createdAt.getDay();
    activity[dayOfWeek]++;
  });

  return activity;
}

export const MOOD_EMOJIS: Record<number, string> = {
  1: '😢',
  2: '😞',
  3: '😔',
  4: '😕',
  5: '😐',
  6: '🙂',
  7: '😊',
  8: '😄',
  9: '😁',
  10: '🤩',
};

export function getMoodEmoji(mood: number): string {
  return MOOD_EMOJIS[Math.max(1, Math.min(10, Math.round(mood)))] || '😐';
}

export function getMoodColor(mood: number): string {
  if (mood <= 3) return '#EF4444'; // Red
  if (mood <= 5) return '#F59E0B'; // Amber
  if (mood <= 7) return '#3B82F6'; // Blue
  return '#10B981'; // Green
}

export const COGNITIVE_DISTORTIONS = [
  'All-or-Nothing Thinking',
  'Overgeneralization',
  'Mental Filter',
  'Disqualifying the Positive',
  'Jumping to Conclusions',
  'Magnification/Minimization',
  'Emotional Reasoning',
  'Should Statements',
  'Labeling',
  'Personalization',
  'Catastrophizing',
  'Mind Reading',
  'Fortune Telling',
];
