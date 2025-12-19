import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth();

    const therapists = await prisma.user.findMany({
      where: { isTherapist: true },
      select: {
        id: true,
        name: true,
        email: true,
        therapistProfile: {
          select: {
            id: true,
            bio: true,
            specializations: true,
            availability: true,
            hourlyRate: true,
            isApproved: true,
          },
        },
        _count: {
          select: {
            therapistSessions: true,
          },
        },
      },
    });

    // Filter only approved therapists for regular users
    const approvedTherapists = therapists.filter(
      t => t.therapistProfile?.isApproved
    );

    return NextResponse.json({ therapists: approvedTherapists });
  } catch (error: any) {
    console.error('Therapists list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch therapists' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
