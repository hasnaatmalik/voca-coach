import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const therapists = await prisma.user.findMany({
      where: { isTherapist: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isTherapist: true,
        isAdmin: true,
        createdAt: true,
        therapistProfile: {
          select: {
            id: true,
            bio: true,
            specializations: true,
            availability: true,
            hourlyRate: true,
            isApproved: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            therapistSessions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ therapists });
  } catch (error: any) {
    console.error('Admin therapists list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch therapists' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();

    const { therapistId, isApproved } = await req.json();

    if (!therapistId) {
      return NextResponse.json(
        { error: 'Therapist ID is required' },
        { status: 400 }
      );
    }

    // Update therapist profile approval status
    const profile = await prisma.therapistProfile.update({
      where: { userId: therapistId },
      data: { isApproved },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('Admin therapist update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update therapist' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
