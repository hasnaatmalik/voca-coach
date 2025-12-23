import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { HistoryItem, HistoryResponse } from '@/types/dashboard';

export async function GET(request: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const dateRange = searchParams.get('dateRange') || 'month';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Calculate date filter
    const now = new Date();
    let dateFilter: Date | undefined;

    switch (dateRange) {
      case 'week':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        dateFilter = undefined;
    }

    const items: HistoryItem[] = [];

    // Fetch items based on type filter
    const dateCondition = dateFilter ? { gte: dateFilter } : undefined;

    if (type === 'all' || type === 'sessions') {
      const sessions = await prisma.session.findMany({
        where: {
          userId: authUser.userId,
          ...(dateCondition && { createdAt: dateCondition })
        },
        orderBy: { createdAt: 'desc' },
        take: type === 'all' ? 10 : limit,
        skip: type === 'sessions' ? (page - 1) * limit : 0
      });

      sessions.forEach(s => {
        items.push({
          id: s.id,
          type: 'session',
          title: 'De-escalation Session',
          description: `Calm score: ${Math.round(s.calmScore)}% | Mood: ${s.dominantMood || 'neutral'}`,
          date: s.createdAt.toISOString(),
          metadata: {
            calmScore: s.calmScore,
            emotionalScore: s.emotionalScore,
            dominantMood: s.dominantMood,
            duration: s.duration
          }
        });
      });
    }

    if (type === 'all' || type === 'journal') {
      const journals = await prisma.journalEntry.findMany({
        where: {
          userId: authUser.userId,
          ...(dateCondition && { createdAt: dateCondition })
        },
        orderBy: { createdAt: 'desc' },
        take: type === 'all' ? 10 : limit,
        skip: type === 'journal' ? (page - 1) * limit : 0
      });

      journals.forEach(j => {
        items.push({
          id: j.id,
          type: 'journal',
          title: j.title || 'Journal Entry',
          description: j.content.slice(0, 100) + (j.content.length > 100 ? '...' : ''),
          date: j.createdAt.toISOString(),
          metadata: {
            mood: j.mood,
            moodAfter: j.moodAfter,
            distortion: j.distortion
          }
        });
      });
    }

    if (type === 'all' || type === 'biomarkers') {
      const biomarkers = await prisma.biomarker.findMany({
        where: {
          userId: authUser.userId,
          ...(dateCondition && { date: dateCondition })
        },
        orderBy: { date: 'desc' },
        take: type === 'all' ? 5 : limit,
        skip: type === 'biomarkers' ? (page - 1) * limit : 0
      });

      biomarkers.forEach(b => {
        items.push({
          id: b.id,
          type: 'biomarker',
          title: 'Voice Analysis',
          description: `Stress: ${Math.round(b.stress)}% | Clarity: ${Math.round(b.clarity)}% | Score: ${b.overallScore ? Math.round(b.overallScore) : 'N/A'}%`,
          date: b.date.toISOString(),
          metadata: {
            stress: b.stress,
            clarity: b.clarity,
            pitch: b.pitch,
            overallScore: b.overallScore
          }
        });
      });
    }

    if (type === 'all' || type === 'achievements') {
      const achievements = await prisma.deEscalationAchievement.findMany({
        where: {
          userId: authUser.userId,
          ...(dateCondition && { unlockedAt: dateCondition })
        },
        orderBy: { unlockedAt: 'desc' },
        take: type === 'all' ? 5 : limit,
        skip: type === 'achievements' ? (page - 1) * limit : 0
      });

      achievements.forEach(a => {
        items.push({
          id: a.id,
          type: 'achievement',
          title: a.name,
          description: a.description || `${a.type} achievement unlocked`,
          date: a.unlockedAt.toISOString(),
          metadata: {
            icon: a.icon,
            type: a.type
          }
        });
      });
    }

    // Sort all items by date
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Get totals for summary
    const [totalSessions, totalJournalEntries, totalBiomarkerReadings, totalAchievements] = await Promise.all([
      prisma.session.count({ where: { userId: authUser.userId } }),
      prisma.journalEntry.count({ where: { userId: authUser.userId } }),
      prisma.biomarker.count({ where: { userId: authUser.userId } }),
      prisma.deEscalationAchievement.count({ where: { userId: authUser.userId } })
    ]);

    // Paginate if viewing a specific type
    const paginatedItems = type === 'all'
      ? items.slice(0, 30)
      : items.slice((page - 1) * limit, page * limit);

    const total = type === 'all' ? items.length : {
      sessions: totalSessions,
      journal: totalJournalEntries,
      biomarkers: totalBiomarkerReadings,
      achievements: totalAchievements
    }[type] || 0;

    const response: HistoryResponse = {
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        hasMore: paginatedItems.length === limit
      },
      summary: {
        totalSessions,
        totalJournalEntries,
        totalBiomarkerReadings,
        totalAchievements
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
