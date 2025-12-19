import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();

    const sessions = await prisma.therapySession.findMany({
      where: { userId: user.userId },
      include: {
        therapist: {
          select: {
            id: true,
            name: true,
            email: true,
            therapistProfile: {
              select: {
                bio: true,
                specializations: true,
                hourlyRate: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('User therapy sessions get error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sessions' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { therapistId, scheduledAt, duration, userNote } = await req.json();

    if (!therapistId || !scheduledAt) {
      return NextResponse.json(
        { error: 'Therapist ID and scheduled time are required' },
        { status: 400 }
      );
    }

    // Verify therapist exists and is approved
    const therapist = await prisma.user.findFirst({
      where: {
        id: therapistId,
        isTherapist: true,
      },
      include: {
        therapistProfile: true,
      },
    });

    if (!therapist || !therapist.therapistProfile?.isApproved) {
      return NextResponse.json(
        { error: 'Therapist not found or not approved' },
        { status: 404 }
      );
    }

    const session = await prisma.therapySession.create({
      data: {
        userId: user.userId,
        therapistId,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 60,
        userNote: userNote || null,
        status: 'scheduled',
      },
      include: {
        therapist: {
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
      session,
    });
  } catch (error: any) {
    console.error('Therapy session booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to book session' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    const { sessionId, status } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verify this session belongs to this user
    const session = await prisma.therapySession.findFirst({
      where: {
        id: sessionId,
        userId: user.userId,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    const updatedSession = await prisma.therapySession.update({
      where: { id: sessionId },
      data: { status: status || 'cancelled' },
      include: {
        therapist: {
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
    console.error('Therapy session update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update session' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verify this session belongs to this user
    const session = await prisma.therapySession.findFirst({
      where: {
        id: sessionId,
        userId: user.userId,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    await prisma.therapySession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({
      success: true,
      message: 'Session cancelled',
    });
  } catch (error: any) {
    console.error('Therapy session delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel session' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
