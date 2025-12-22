import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST - Therapist goes online
export async function POST() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: { isTherapist: true },
    });

    if (!user?.isTherapist) {
      return NextResponse.json({ error: 'Only therapists can go online' }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: currentUser.userId },
      data: { 
        isOnline: true,
        lastActiveAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, isOnline: true });
  } catch (error) {
    console.error('Error going online:', error);
    return NextResponse.json({ error: 'Failed to go online' }, { status: 500 });
  }
}

// DELETE - Therapist goes offline
export async function DELETE() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: currentUser.userId },
      data: { 
        isOnline: false,
        lastActiveAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, isOnline: false });
  } catch (error) {
    console.error('Error going offline:', error);
    return NextResponse.json({ error: 'Failed to go offline' }, { status: 500 });
  }
}

// GET - Check current online status
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: { isOnline: true, isTherapist: true },
    });

    return NextResponse.json({ 
      isOnline: user?.isOnline || false,
      isTherapist: user?.isTherapist || false,
    });
  } catch (error) {
    console.error('Error checking status:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}
