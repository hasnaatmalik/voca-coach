import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getPersonaById } from '@/lib/ai-therapy-personas';

// POST /api/ai-therapy/session - Create new AI therapy session
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { personaType, recordingConsent } = await req.json();

    if (!personaType) {
      return NextResponse.json({ error: 'personaType is required' }, { status: 400 });
    }

    const persona = getPersonaById(personaType);
    if (!persona) {
      return NextResponse.json({ error: 'Invalid persona type' }, { status: 400 });
    }

    // Check if user has an active session
    const activeSession = await prisma.aITherapySession.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
    });

    if (activeSession) {
      return NextResponse.json({
        error: 'You already have an active AI session',
        sessionId: activeSession.id,
      }, { status: 400 });
    }

    const session = await prisma.aITherapySession.create({
      data: {
        userId: user.id,
        personaType,
        recordingConsent: recordingConsent || false,
        status: 'active',
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Error creating AI session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// GET /api/ai-therapy/session - Get user's AI therapy sessions
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');
    const activeOnly = searchParams.get('active') === 'true';

    if (sessionId) {
      // Get specific session
      const session = await prisma.aITherapySession.findFirst({
        where: {
          id: sessionId,
          userId: user.id,
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
          summary: true,
          crisisEvents: true,
        },
      });

      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      return NextResponse.json({ session });
    }

    // Get all sessions
    const sessions = await prisma.aITherapySession.findMany({
      where: {
        userId: user.id,
        ...(activeOnly ? { status: 'active' } : {}),
      },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching AI sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// PUT /api/ai-therapy/session - End session
export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, action } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = await prisma.aITherapySession.findFirst({
      where: { id: sessionId, userId: user.id },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (action === 'end') {
      const now = new Date();
      const durationSeconds = Math.floor((now.getTime() - session.startedAt.getTime()) / 1000);

      const updatedSession = await prisma.aITherapySession.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          endedAt: now,
          durationSeconds,
        },
      });

      return NextResponse.json({ session: updatedSession });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating AI session:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
