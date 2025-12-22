import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { updateStreak } from '@/lib/journal-utils';

// GET /api/journal - Get user's journal entries with filtering and pagination
export async function GET(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const moodMin = searchParams.get('moodMin');
    const moodMax = searchParams.get('moodMax');
    const tags = searchParams.get('tags');
    const hasDistortion = searchParams.get('hasDistortion');
    const sessionType = searchParams.get('sessionType');
    const sessionId = searchParams.get('sessionId');

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId: authUser.userId };

    if (search) {
      where.OR = [
        { content: { contains: search } },
        { title: { contains: search } },
      ];
    }

    if (dateFrom) {
      where.createdAt = { ...where.createdAt, gte: new Date(dateFrom) };
    }

    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt = { ...where.createdAt, lte: endDate };
    }

    if (moodMin) {
      where.mood = { ...where.mood, gte: parseInt(moodMin) };
    }

    if (moodMax) {
      where.mood = { ...where.mood, lte: parseInt(moodMax) };
    }

    if (tags) {
      // Filter entries that contain any of the specified tags
      const tagList = tags.split(',').map(t => t.trim());
      where.AND = tagList.map(tag => ({
        tags: { contains: tag }
      }));
    }

    if (hasDistortion === 'true') {
      where.OR = [
        { distortion: { not: null } },
        { distortions: { not: null } }
      ];
    } else if (hasDistortion === 'false') {
      where.distortion = null;
      where.distortions = null;
    }

    if (sessionId) {
      where.sessionId = sessionId;
    }

    if (sessionType) {
      where.session = { sessionType };
    }

    // Get total count for pagination
    const total = await prisma.journalEntry.count({ where });

    // Get entries with pagination
    const entries = await prisma.journalEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        session: {
          select: {
            id: true,
            sessionType: true,
            title: true,
          }
        }
      }
    });

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      }
    });
  } catch (error) {
    console.error('Get journal entries error:', error);
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
  }
}

// POST /api/journal - Create a new journal entry
export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      content,
      title,
      mood,
      moodAfter,
      distortion,
      distortions,
      socraticPrompt,
      userResponse,
      tags,
      isVoiceEntry,
      audioUrl,
      aiSummary,
      gratitudeItems,
      sessionId,
    } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId: authUser.userId,
        content,
        title: title || null,
        mood: mood ? parseInt(mood) : null,
        moodAfter: moodAfter ? parseInt(moodAfter) : null,
        distortion: distortion || null,
        distortions: distortions ? JSON.stringify(distortions) : null,
        socraticPrompt: socraticPrompt || null,
        userResponse: userResponse || null,
        tags: tags ? JSON.stringify(tags) : null,
        isVoiceEntry: isVoiceEntry || false,
        audioUrl: audioUrl || null,
        aiSummary: aiSummary || null,
        gratitudeItems: gratitudeItems ? JSON.stringify(gratitudeItems) : null,
        sessionId: sessionId || null,
      },
    });

    // Update streak
    const streak = await updateStreak(authUser.userId);

    return NextResponse.json({ entry, streak });
  } catch (error) {
    console.error('Create journal entry error:', error);
    return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 });
  }
}

// PUT /api/journal - Update a journal entry
export async function PUT(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      id,
      content,
      title,
      mood,
      moodAfter,
      distortion,
      distortions,
      userResponse,
      tags,
      aiSummary,
      gratitudeItems,
    } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId: authUser.userId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const entry = await prisma.journalEntry.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(title !== undefined && { title }),
        ...(mood !== undefined && { mood: mood ? parseInt(mood) : null }),
        ...(moodAfter !== undefined && { moodAfter: moodAfter ? parseInt(moodAfter) : null }),
        ...(distortion !== undefined && { distortion }),
        ...(distortions !== undefined && { distortions: distortions ? JSON.stringify(distortions) : null }),
        ...(userResponse !== undefined && { userResponse }),
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : null }),
        ...(aiSummary !== undefined && { aiSummary }),
        ...(gratitudeItems !== undefined && { gratitudeItems: gratitudeItems ? JSON.stringify(gratitudeItems) : null }),
      },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Update journal entry error:', error);
    return NextResponse.json({ error: 'Failed to update journal entry' }, { status: 500 });
  }
}

// DELETE /api/journal - Delete a journal entry
export async function DELETE(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId: authUser.userId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    await prisma.journalEntry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    return NextResponse.json({ error: 'Failed to delete journal entry' }, { status: 500 });
  }
}
