import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getModel } from '@/lib/vertex';

// GET /api/journal-sessions - Get all journal sessions
export async function GET(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionType = searchParams.get('sessionType');
    const isComplete = searchParams.get('isComplete');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId: authUser.userId };

    if (sessionType) {
      where.sessionType = sessionType;
    }

    if (isComplete !== null) {
      where.isComplete = isComplete === 'true';
    }

    const total = await prisma.journalSession.count({ where });

    const sessions = await prisma.journalSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        entries: {
          select: {
            id: true,
            title: true,
            content: true,
            mood: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { entries: true }
        }
      }
    });

    return NextResponse.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      }
    });
  } catch (error) {
    console.error('Get journal sessions error:', error);
    return NextResponse.json({ error: 'Failed to fetch journal sessions' }, { status: 500 });
  }
}

// POST /api/journal-sessions - Create a new journal session
export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      sessionType,
      title,
      moodStart,
      messages,
    } = await req.json();

    if (!sessionType) {
      return NextResponse.json({ error: 'Session type is required' }, { status: 400 });
    }

    const validTypes = ['free_write', 'guided', 'gratitude', 'cbt_exercise', 'voice'];
    if (!validTypes.includes(sessionType)) {
      return NextResponse.json({ error: 'Invalid session type' }, { status: 400 });
    }

    const session = await prisma.journalSession.create({
      data: {
        userId: authUser.userId,
        sessionType,
        title: title || null,
        moodStart: moodStart ? parseInt(moodStart) : null,
        messages: messages ? JSON.stringify(messages) : '[]',
      },
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Create journal session error:', error);
    return NextResponse.json({ error: 'Failed to create journal session' }, { status: 500 });
  }
}

// PUT /api/journal-sessions - Update a journal session
export async function PUT(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      id,
      title,
      moodEnd,
      messages,
      isComplete,
      generateSummary,
    } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.journalSession.findFirst({
      where: { id, userId: authUser.userId },
      include: { entries: true }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    let summary = existing.summary;

    // Generate AI summary if requested and session is being completed
    if (generateSummary && isComplete) {
      const sessionMessages = messages ? JSON.parse(JSON.stringify(messages)) : JSON.parse(existing.messages);
      const entriesContent = existing.entries.map(e => e.content).join('\n\n');

      const model = getModel('gemini-2.0-flash-exp');
      const prompt = `
        Summarize this therapeutic journaling session in 2-3 sentences, highlighting:
        1. Key themes or emotions discussed
        2. Any insights or breakthroughs
        3. Progress or positive shifts noticed

        Session Type: ${existing.sessionType}
        Messages: ${JSON.stringify(sessionMessages)}
        ${entriesContent ? `Entries: ${entriesContent}` : ''}

        Write a compassionate, encouraging summary.
      `;

      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        const response = await result.response;
        summary = response.text();
      } catch (err) {
        console.error('Summary generation error:', err);
        summary = 'Session completed.';
      }
    }

    const session = await prisma.journalSession.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(moodEnd !== undefined && { moodEnd: moodEnd ? parseInt(moodEnd) : null }),
        ...(messages !== undefined && { messages: JSON.stringify(messages) }),
        ...(isComplete !== undefined && { isComplete }),
        ...(summary && { summary }),
      },
      include: {
        entries: {
          select: {
            id: true,
            title: true,
            content: true,
            mood: true,
            createdAt: true,
          }
        }
      }
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Update journal session error:', error);
    return NextResponse.json({ error: 'Failed to update journal session' }, { status: 500 });
  }
}

// DELETE /api/journal-sessions - Delete a journal session
export async function DELETE(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.journalSession.findFirst({
      where: { id, userId: authUser.userId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Delete session (entries will have sessionId set to null due to SetNull)
    await prisma.journalSession.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete journal session error:', error);
    return NextResponse.json({ error: 'Failed to delete journal session' }, { status: 500 });
  }
}
