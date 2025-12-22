import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/journal-export - Export journal entries
export async function GET(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build date filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateFilter: any = {};
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.lte = endDate;
    }

    // Fetch entries
    const entries = await prisma.journalEntry.findMany({
      where: {
        userId: authUser.userId,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        session: {
          select: {
            sessionType: true,
            title: true,
          },
        },
      },
    });

    // Fetch streak
    const streak = await prisma.journalStreak.findUnique({
      where: { userId: authUser.userId },
    });

    if (format === 'json') {
      // Return as JSON
      return NextResponse.json({
        exportedAt: new Date().toISOString(),
        totalEntries: entries.length,
        streak: streak
          ? {
              currentStreak: streak.currentStreak,
              longestStreak: streak.longestStreak,
              totalEntries: streak.totalEntries,
            }
          : null,
        entries: entries.map((entry) => ({
          id: entry.id,
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          moodAfter: entry.moodAfter,
          distortion: entry.distortion,
          tags: entry.tags ? JSON.parse(entry.tags) : [],
          gratitudeItems: entry.gratitudeItems ? JSON.parse(entry.gratitudeItems) : [],
          isVoiceEntry: entry.isVoiceEntry,
          sessionType: entry.session?.sessionType,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        })),
      });
    } else if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Date',
        'Title',
        'Content',
        'Mood',
        'Mood After',
        'Distortion',
        'Tags',
        'Type',
      ];

      const rows = entries.map((entry) => [
        new Date(entry.createdAt).toLocaleDateString(),
        entry.title || '',
        entry.content.replace(/"/g, '""').replace(/\n/g, ' '),
        entry.mood?.toString() || '',
        entry.moodAfter?.toString() || '',
        entry.distortion || '',
        entry.tags ? JSON.parse(entry.tags).join(', ') : '',
        entry.session?.sessionType || 'free_write',
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="journal-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'markdown') {
      // Generate Markdown
      let markdown = `# Journal Export\n\n`;
      markdown += `Exported on: ${new Date().toLocaleDateString()}\n`;
      markdown += `Total Entries: ${entries.length}\n\n`;

      if (streak) {
        markdown += `## Stats\n`;
        markdown += `- Current Streak: ${streak.currentStreak} days\n`;
        markdown += `- Longest Streak: ${streak.longestStreak} days\n`;
        markdown += `- Total Entries: ${streak.totalEntries}\n\n`;
      }

      markdown += `---\n\n`;

      // Group by date
      const grouped: Record<string, typeof entries> = {};
      entries.forEach((entry) => {
        const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(entry);
      });

      Object.entries(grouped).forEach(([date, dayEntries]) => {
        markdown += `## ${date}\n\n`;
        dayEntries.forEach((entry) => {
          if (entry.title) {
            markdown += `### ${entry.title}\n\n`;
          }
          if (entry.mood) {
            markdown += `**Mood:** ${entry.mood}/10`;
            if (entry.moodAfter) {
              markdown += ` → ${entry.moodAfter}/10`;
            }
            markdown += `\n\n`;
          }
          markdown += `${entry.content}\n\n`;
          if (entry.distortion) {
            markdown += `> *Pattern detected: ${entry.distortion}*\n\n`;
          }
          if (entry.tags) {
            const tags = JSON.parse(entry.tags);
            markdown += `Tags: ${tags.map((t: string) => `\`${t}\``).join(' ')}\n\n`;
          }
          markdown += `---\n\n`;
        });
      });

      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="journal-export-${new Date().toISOString().split('T')[0]}.md"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export journal' }, { status: 500 });
  }
}
