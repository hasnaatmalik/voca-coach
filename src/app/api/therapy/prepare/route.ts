import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/therapy/prepare?sessionId=xxx - Get pre-session data
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Verify session belongs to user
    const session = await prisma.therapySession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
      include: {
        therapist: {
          select: { id: true, name: true, email: true }
        },
        preSessionData: true,
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get previous session summary if exists
    const previousSession = await prisma.therapySession.findFirst({
      where: {
        userId: user.id,
        therapistId: session.therapistId,
        status: 'completed',
        scheduledAt: { lt: session.scheduledAt },
      },
      orderBy: { scheduledAt: 'desc' },
      include: {
        postSessionSummary: true,
      }
    });

    return NextResponse.json({
      session,
      preSessionData: session.preSessionData,
      previousSummary: previousSession?.postSessionSummary || null,
    });
  } catch (error) {
    console.error('Error fetching pre-session data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// POST /api/therapy/prepare - Save pre-session data
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, moodRating, concernText, sessionGoals, techCheckPassed } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Verify session belongs to user
    const session = await prisma.therapySession.findFirst({
      where: { id: sessionId, userId: user.id },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if pre-session data already exists
    const existing = await prisma.preSessionData.findUnique({
      where: { sessionId },
    });

    let preSessionData;
    if (existing) {
      preSessionData = await prisma.preSessionData.update({
        where: { sessionId },
        data: {
          moodRating: moodRating ?? existing.moodRating,
          concernText: concernText ?? existing.concernText,
          sessionGoals: sessionGoals ?? existing.sessionGoals,
          techCheckPassed: techCheckPassed ?? existing.techCheckPassed,
        },
      });
    } else {
      preSessionData = await prisma.preSessionData.create({
        data: {
          sessionId,
          moodRating: moodRating || 5,
          concernText,
          sessionGoals,
          techCheckPassed: techCheckPassed || false,
        },
      });
    }

    return NextResponse.json({ preSessionData });
  } catch (error) {
    console.error('Error saving pre-session data:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
