import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  SessionProgress,
  WeeklyDataPoint,
  Achievement,
  SessionSummary,
} from '@/types/de-escalation';

// Achievement definitions
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-session',
    type: 'sessions',
    name: 'First Steps',
    description: 'Complete your first de-escalation session',
    icon: '🌱',
  },
  {
    id: 'five-sessions',
    type: 'sessions',
    name: 'Getting Started',
    description: 'Complete 5 sessions',
    icon: '⭐',
  },
  {
    id: 'ten-sessions',
    type: 'sessions',
    name: 'Dedicated Learner',
    description: 'Complete 10 sessions',
    icon: '🏆',
  },
  {
    id: 'twentyfive-sessions',
    type: 'sessions',
    name: 'De-Escalation Pro',
    description: 'Complete 25 sessions',
    icon: '🎖️',
  },
  {
    id: 'fifty-sessions',
    type: 'sessions',
    name: 'Master of Calm',
    description: 'Complete 50 sessions',
    icon: '👑',
  },
  {
    id: 'three-day-streak',
    type: 'streak',
    name: 'Building Momentum',
    description: 'Practice for 3 days in a row',
    icon: '🔥',
  },
  {
    id: 'seven-day-streak',
    type: 'streak',
    name: 'Week Warrior',
    description: 'Practice for 7 days in a row',
    icon: '💪',
  },
  {
    id: 'thirty-day-streak',
    type: 'streak',
    name: 'Consistency Champion',
    description: 'Practice for 30 days in a row',
    icon: '🏅',
  },
  {
    id: 'all-techniques',
    type: 'techniques',
    name: 'Versatile Practitioner',
    description: 'Try all available techniques',
    icon: '🎨',
  },
  {
    id: 'stress-reducer',
    type: 'improvement',
    name: 'Stress Reducer',
    description: 'Achieve 50% or more stress reduction in a session',
    icon: '😌',
  },
  {
    id: 'calm-master',
    type: 'improvement',
    name: 'Calm Master',
    description: 'Complete a session with average stress below 0.2',
    icon: '🧘',
  },
];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all user sessions
    const sessions = await prisma.deEscalationSession.findMany({
      where: { userId: user.id },
      orderBy: { startTime: 'desc' },
    });

    // Calculate basic stats
    const totalSessions = sessions.length;
    const totalMinutes = Math.round(
      sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
    );

    // Calculate average stress reduction
    let totalStressReduction = 0;
    let sessionsWithStressData = 0;

    for (const session of sessions) {
      if (session.peakStress && session.averageStress) {
        const reduction = (session.peakStress - session.averageStress) / session.peakStress;
        totalStressReduction += reduction;
        sessionsWithStressData++;
      }
    }

    const averageStressReduction = sessionsWithStressData > 0
      ? Math.round((totalStressReduction / sessionsWithStressData) * 100)
      : 0;

    // Calculate streak
    const { currentStreak, longestStreak } = calculateStreak(sessions);

    // Get most effective techniques
    const techniqueEffectiveness = new Map<string, { count: number; avgReduction: number }>();

    for (const session of sessions) {
      const techniques: string[] = JSON.parse(session.techniquesUsed || '[]');
      const reduction = session.peakStress && session.averageStress
        ? (session.peakStress - session.averageStress) / session.peakStress
        : 0;

      for (const technique of techniques) {
        const existing = techniqueEffectiveness.get(technique) || { count: 0, avgReduction: 0 };
        existing.avgReduction = (existing.avgReduction * existing.count + reduction) / (existing.count + 1);
        existing.count++;
        techniqueEffectiveness.set(technique, existing);
      }
    }

    const mostEffectiveTechniques = Array.from(techniqueEffectiveness.entries())
      .sort((a, b) => b[1].avgReduction - a[1].avgReduction)
      .slice(0, 3)
      .map(([id]) => id);

    // Calculate weekly data (last 8 weeks)
    const weeklyData = calculateWeeklyData(sessions);

    // Get unlocked achievements
    const unlockedAchievements = await prisma.deEscalationAchievement.findMany({
      where: { userId: user.id },
    });

    const unlockedIds = new Set(unlockedAchievements.map((a) => a.type + '-' + a.name));

    // Check for new achievements
    const newAchievements = await checkAndUnlockAchievements(
      user.id,
      sessions,
      currentStreak,
      longestStreak,
      techniqueEffectiveness,
      unlockedIds
    );

    // Build achievements list with progress
    const achievements: Achievement[] = ACHIEVEMENTS.map((achievement) => {
      const unlocked = unlockedAchievements.find(
        (ua) => ua.type === achievement.type && ua.name === achievement.name
      );

      return {
        ...achievement,
        unlockedAt: unlocked?.unlockedAt?.toISOString(),
        progress: calculateAchievementProgress(
          achievement,
          totalSessions,
          currentStreak,
          techniqueEffectiveness.size,
          sessions
        ),
      };
    });

    // Build recent sessions summary
    const recentSessions: SessionSummary[] = sessions.slice(0, 5).map((session) => ({
      id: session.id,
      date: session.startTime.toISOString(),
      duration: session.duration || 0,
      averageStress: session.averageStress || 0,
      peakStress: session.peakStress || 0,
      techniquesUsed: JSON.parse(session.techniquesUsed || '[]'),
      moodBefore: session.moodBefore || undefined,
      moodAfter: session.moodAfter || undefined,
      hasRecording: !!session.recordingPath,
    }));

    const progress: SessionProgress = {
      totalSessions,
      totalMinutes,
      averageStressReduction,
      streakDays: currentStreak,
      currentStreak,
      longestStreak,
      mostEffectiveTechniques,
      weeklyData,
      achievements,
      recentSessions,
    };

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Progress error:', error);
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}

function calculateStreak(
  sessions: { startTime: Date }[]
): { currentStreak: number; longestStreak: number } {
  if (sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Get unique dates (in local timezone)
  const dates = [...new Set(
    sessions.map((s) => {
      const d = new Date(s.startTime);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  )].sort().reverse();

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      // Check if most recent session is today or yesterday
      const mostRecent = dates[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

      if (mostRecent === todayStr || mostRecent === yesterdayStr) {
        tempStreak = 1;
        currentStreak = 1;
      } else {
        currentStreak = 0;
        tempStreak = 1;
      }
    } else {
      // Check if consecutive days
      const prevParts = dates[i - 1].split('-').map(Number);
      const currParts = dates[i].split('-').map(Number);
      const prevDate = new Date(prevParts[0], prevParts[1], prevParts[2]);
      const currDate = new Date(currParts[0], currParts[1], currParts[2]);

      const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        if (currentStreak > 0) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);
  currentStreak = Math.max(0, currentStreak);

  return { currentStreak, longestStreak };
}

function calculateWeeklyData(sessions: { startTime: Date; duration: number | null; averageStress: number | null }[]): WeeklyDataPoint[] {
  const weeklyData: WeeklyDataPoint[] = [];
  const now = new Date();

  // Show last 7 days (daily data for the week)
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const daySessions = sessions.filter(
      (s) => s.startTime >= dayStart && s.startTime < dayEnd
    );

    const avgStress = daySessions.length > 0
      ? daySessions.reduce((sum, s) => sum + (s.averageStress || 0), 0) / daySessions.length
      : 0;

    const minutesPracticed = Math.round(
      daySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
    );

    weeklyData.push({
      date: dayStart.toISOString().split('T')[0],
      sessions: daySessions.length,
      avgStress: Math.round(avgStress * 100) / 100,
      minutesPracticed,
    });
  }

  return weeklyData;
}

async function checkAndUnlockAchievements(
  userId: string,
  sessions: { averageStress: number | null; peakStress: number | null; techniquesUsed: string }[],
  currentStreak: number,
  longestStreak: number,
  techniqueEffectiveness: Map<string, { count: number; avgReduction: number }>,
  unlockedIds: Set<string>
): Promise<Achievement[]> {
  const newlyUnlocked: Achievement[] = [];
  const totalSessions = sessions.length;

  // Session count achievements
  const sessionMilestones = [
    { count: 1, type: 'sessions', name: 'First Steps' },
    { count: 5, type: 'sessions', name: 'Getting Started' },
    { count: 10, type: 'sessions', name: 'Dedicated Learner' },
    { count: 25, type: 'sessions', name: 'De-Escalation Pro' },
    { count: 50, type: 'sessions', name: 'Master of Calm' },
  ];

  for (const milestone of sessionMilestones) {
    if (totalSessions >= milestone.count && !unlockedIds.has(`${milestone.type}-${milestone.name}`)) {
      const achievement = ACHIEVEMENTS.find((a) => a.type === milestone.type && a.name === milestone.name);
      if (achievement) {
        await prisma.deEscalationAchievement.create({
          data: {
            userId,
            type: achievement.type,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
          },
        });
        newlyUnlocked.push(achievement);
      }
    }
  }

  // Streak achievements
  const streakMilestones = [
    { days: 3, type: 'streak', name: 'Building Momentum' },
    { days: 7, type: 'streak', name: 'Week Warrior' },
    { days: 30, type: 'streak', name: 'Consistency Champion' },
  ];

  for (const milestone of streakMilestones) {
    if (Math.max(currentStreak, longestStreak) >= milestone.days && !unlockedIds.has(`${milestone.type}-${milestone.name}`)) {
      const achievement = ACHIEVEMENTS.find((a) => a.type === milestone.type && a.name === milestone.name);
      if (achievement) {
        await prisma.deEscalationAchievement.create({
          data: {
            userId,
            type: achievement.type,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
          },
        });
        newlyUnlocked.push(achievement);
      }
    }
  }

  // Check for improvement achievements
  for (const session of sessions) {
    if (session.peakStress && session.averageStress) {
      const reduction = (session.peakStress - session.averageStress) / session.peakStress;

      if (reduction >= 0.5 && !unlockedIds.has('improvement-Stress Reducer')) {
        const achievement = ACHIEVEMENTS.find((a) => a.name === 'Stress Reducer');
        if (achievement) {
          await prisma.deEscalationAchievement.create({
            data: {
              userId,
              type: achievement.type,
              name: achievement.name,
              description: achievement.description,
              icon: achievement.icon,
            },
          });
          newlyUnlocked.push(achievement);
          unlockedIds.add('improvement-Stress Reducer');
        }
      }
    }

    if (session.averageStress && session.averageStress < 0.2 && !unlockedIds.has('improvement-Calm Master')) {
      const achievement = ACHIEVEMENTS.find((a) => a.name === 'Calm Master');
      if (achievement) {
        await prisma.deEscalationAchievement.create({
          data: {
            userId,
            type: achievement.type,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
          },
        });
        newlyUnlocked.push(achievement);
        unlockedIds.add('improvement-Calm Master');
      }
    }
  }

  return newlyUnlocked;
}

function calculateAchievementProgress(
  achievement: Achievement,
  totalSessions: number,
  currentStreak: number,
  uniqueTechniques: number,
  sessions: { averageStress: number | null; peakStress: number | null }[]
): number | undefined {
  switch (achievement.id) {
    case 'first-session':
      return Math.min(100, totalSessions * 100);
    case 'five-sessions':
      return Math.min(100, (totalSessions / 5) * 100);
    case 'ten-sessions':
      return Math.min(100, (totalSessions / 10) * 100);
    case 'twentyfive-sessions':
      return Math.min(100, (totalSessions / 25) * 100);
    case 'fifty-sessions':
      return Math.min(100, (totalSessions / 50) * 100);
    case 'three-day-streak':
      return Math.min(100, (currentStreak / 3) * 100);
    case 'seven-day-streak':
      return Math.min(100, (currentStreak / 7) * 100);
    case 'thirty-day-streak':
      return Math.min(100, (currentStreak / 30) * 100);
    case 'all-techniques':
      return Math.min(100, (uniqueTechniques / 7) * 100); // 7 default techniques
    default:
      return undefined;
  }
}
