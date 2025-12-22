import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireTherapist } from '@/lib/auth';

// GET /api/therapist/availability - Get therapist's availability slots
export async function GET() {
  try {
    const user = await requireTherapist();

    const availability = await prisma.therapistAvailability.findMany({
      where: { therapistId: user.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json({ availability });
  } catch (error) {
    if (error instanceof Error && error.message === 'Therapist access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

// POST /api/therapist/availability - Add new availability slot
export async function POST(req: Request) {
  try {
    const user = await requireTherapist();
    const body = await req.json();

    const {
      dayOfWeek,
      startTime,
      endTime,
      isRecurring = true,
      specificDate,
      isBlocked = false,
      sessionDuration = 60,
      bufferTime = 15,
      maxSessionsPerDay,
    } = body;

    // Validation
    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'dayOfWeek, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json({ error: 'dayOfWeek must be 0-6' }, { status: 400 });
    }

    // Check for overlapping slots
    const existingSlots = await prisma.therapistAvailability.findMany({
      where: {
        therapistId: user.id,
        dayOfWeek,
        isRecurring,
      },
    });

    const newStart = parseInt(startTime.replace(':', ''));
    const newEnd = parseInt(endTime.replace(':', ''));

    for (const slot of existingSlots) {
      const existingStart = parseInt(slot.startTime.replace(':', ''));
      const existingEnd = parseInt(slot.endTime.replace(':', ''));

      // Check for overlap
      if (newStart < existingEnd && newEnd > existingStart) {
        return NextResponse.json(
          { error: 'This time slot overlaps with an existing slot' },
          { status: 400 }
        );
      }
    }

    const slot = await prisma.therapistAvailability.create({
      data: {
        therapistId: user.id,
        dayOfWeek,
        startTime,
        endTime,
        isRecurring,
        specificDate: specificDate ? new Date(specificDate) : null,
        isBlocked,
        sessionDuration,
        bufferTime,
        maxSessionsPerDay,
      },
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Therapist access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error creating availability:', error);
    return NextResponse.json({ error: 'Failed to create availability' }, { status: 500 });
  }
}

// PUT /api/therapist/availability - Update availability slot
export async function PUT(req: Request) {
  try {
    const user = await requireTherapist();
    const body = await req.json();

    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Slot ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.therapistAvailability.findFirst({
      where: { id, therapistId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    const slot = await prisma.therapistAvailability.update({
      where: { id },
      data: {
        ...updates,
        specificDate: updates.specificDate ? new Date(updates.specificDate) : undefined,
      },
    });

    return NextResponse.json({ slot });
  } catch (error) {
    if (error instanceof Error && error.message === 'Therapist access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error updating availability:', error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}

// DELETE /api/therapist/availability - Delete availability slot
export async function DELETE(req: Request) {
  try {
    const user = await requireTherapist();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Slot ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.therapistAvailability.findFirst({
      where: { id, therapistId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    await prisma.therapistAvailability.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Therapist access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error deleting availability:', error);
    return NextResponse.json({ error: 'Failed to delete availability' }, { status: 500 });
  }
}
