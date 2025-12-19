import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireTherapist } from '@/lib/auth';

export async function GET() {
  try {
    const therapist = await requireTherapist();

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: therapist.userId },
    });

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Therapist profile get error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: error.message === 'Therapist access required' ? 403 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const therapist = await requireTherapist();
    const { bio, specializations, availability, hourlyRate } = await req.json();

    // Check if profile already exists
    const existing = await prisma.therapistProfile.findUnique({
      where: { userId: therapist.userId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Profile already exists. Use PUT to update.' },
        { status: 409 }
      );
    }

    const profile = await prisma.therapistProfile.create({
      data: {
        userId: therapist.userId,
        bio: bio || null,
        specializations: specializations ? JSON.stringify(specializations) : null,
        availability: availability ? JSON.stringify(availability) : null,
        hourlyRate: hourlyRate || null,
        isApproved: false,
      },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('Therapist profile create error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create profile' },
      { status: error.message === 'Therapist access required' ? 403 : 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const therapist = await requireTherapist();
    const { bio, specializations, availability, hourlyRate } = await req.json();

    const profile = await prisma.therapistProfile.upsert({
      where: { userId: therapist.userId },
      update: {
        bio: bio || null,
        specializations: specializations ? JSON.stringify(specializations) : null,
        availability: availability ? JSON.stringify(availability) : null,
        hourlyRate: hourlyRate || null,
      },
      create: {
        userId: therapist.userId,
        bio: bio || null,
        specializations: specializations ? JSON.stringify(specializations) : null,
        availability: availability ? JSON.stringify(availability) : null,
        hourlyRate: hourlyRate || null,
        isApproved: false,
      },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('Therapist profile update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: error.message === 'Therapist access required' ? 403 : 500 }
    );
  }
}
