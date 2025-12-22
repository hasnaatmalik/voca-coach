import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/therapy/recording/consent?sessionId=xxx - Get consent status
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

    // Get session to verify access
    const session = await prisma.therapySession.findFirst({
      where: {
        id: sessionId,
        OR: [
          { userId: user.id },
          { therapistId: user.id },
        ],
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get existing recording consent
    const recording = await prisma.sessionRecording.findFirst({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    const isTherapist = session.therapistId === user.id;

    return NextResponse.json({
      userConsent: recording?.userConsent || false,
      therapistConsent: recording?.therapistConsent || false,
      myConsent: isTherapist ? recording?.therapistConsent : recording?.userConsent,
      bothConsented: recording?.userConsent && recording?.therapistConsent,
      recordingId: recording?.id,
    });
  } catch (error) {
    console.error('Error fetching consent:', error);
    return NextResponse.json({ error: 'Failed to fetch consent' }, { status: 500 });
  }
}

// POST /api/therapy/recording/consent - Update consent
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, consent } = await req.json();

    if (!sessionId || typeof consent !== 'boolean') {
      return NextResponse.json({ error: 'sessionId and consent are required' }, { status: 400 });
    }

    // Get session to verify access
    const session = await prisma.therapySession.findFirst({
      where: {
        id: sessionId,
        OR: [
          { userId: user.id },
          { therapistId: user.id },
        ],
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const isTherapist = session.therapistId === user.id;

    // Get or create recording record
    let recording = await prisma.sessionRecording.findFirst({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    if (recording) {
      // Update existing
      recording = await prisma.sessionRecording.update({
        where: { id: recording.id },
        data: isTherapist ? { therapistConsent: consent } : { userConsent: consent },
      });
    } else {
      // Create new
      recording = await prisma.sessionRecording.create({
        data: {
          sessionId,
          filePath: '',
          duration: 0,
          userConsent: isTherapist ? false : consent,
          therapistConsent: isTherapist ? consent : false,
        },
      });
    }

    return NextResponse.json({
      userConsent: recording.userConsent,
      therapistConsent: recording.therapistConsent,
      bothConsented: recording.userConsent && recording.therapistConsent,
      recordingId: recording.id,
    });
  } catch (error) {
    console.error('Error updating consent:', error);
    return NextResponse.json({ error: 'Failed to update consent' }, { status: 500 });
  }
}
