import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireTherapist } from '@/lib/auth';

export async function GET() {
  try {
    const therapist = await requireTherapist();

    const sessions = await prisma.therapySession.findMany({
      where: { therapistId: therapist.userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('Therapist sessions get error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sessions' },
      { status: error.message === 'Therapist access required' ? 403 : 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const therapist = await requireTherapist();
    const { sessionId, notes, status } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verify this session belongs to this therapist
    const session = await prisma.therapySession.findFirst({
      where: {
        id: sessionId,
        therapistId: therapist.userId,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    const updates: any = {};
    if (notes !== undefined) updates.notes = notes;
    if (status !== undefined) updates.status = status;

    const updatedSession = await prisma.therapySession.update({
      where: { id: sessionId },
      data: updates,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      session: updatedSession,
    });
  } catch (error: any) {
    console.error('Therapist session update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update session' },
      { status: error.message === 'Therapist access required' ? 403 : 500 }
    );
  }
}
