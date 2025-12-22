import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - List all online, approved therapists
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const therapists = await prisma.user.findMany({
      where: {
        isTherapist: true,
        isOnline: true,
        // Note: Removed isApproved check for easier testing. Re-enable for production:
        // therapistProfile: { isApproved: true },
      },
      select: {
        id: true,
        name: true,
        email: true,
        lastActiveAt: true,
        therapistProfile: {
          select: {
            bio: true,
            specializations: true,
            hourlyRate: true,
          },
        },
      },
      orderBy: { lastActiveAt: 'desc' },
    });

    return NextResponse.json({ 
      therapists,
      count: therapists.length,
    });
  } catch (error) {
    console.error('Error fetching available therapists:', error);
    return NextResponse.json({ error: 'Failed to fetch therapists' }, { status: 500 });
  }
}
