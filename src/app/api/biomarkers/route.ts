import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/biomarkers - Get user's biomarker history
export async function GET(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const biomarkers = await prisma.biomarker.findMany({
      where: {
        userId: authUser.userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ biomarkers });
  } catch (error) {
    console.error('Get biomarkers error:', error);
    return NextResponse.json({ error: 'Failed to fetch biomarkers' }, { status: 500 });
  }
}

// POST /api/biomarkers - Store new biomarker reading
export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pitch, clarity, stress, pauseDuration, articulationRate } = await req.json();

    if (typeof pitch !== 'number' || typeof clarity !== 'number' || typeof stress !== 'number') {
      return NextResponse.json(
        { error: 'Pitch, clarity, and stress are required' },
        { status: 400 }
      );
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert biomarker for today (update if exists, create if not)
    const biomarker = await prisma.biomarker.upsert({
      where: {
        userId_date: {
          userId: authUser.userId,
          date: today,
        },
      },
      update: {
        pitch,
        clarity,
        stress,
        pauseDuration: pauseDuration || null,
        articulationRate: articulationRate || null,
      },
      create: {
        userId: authUser.userId,
        date: today,
        pitch,
        clarity,
        stress,
        pauseDuration: pauseDuration || null,
        articulationRate: articulationRate || null,
      },
    });

    return NextResponse.json({ biomarker });
  } catch (error) {
    console.error('Create biomarker error:', error);
    return NextResponse.json({ error: 'Failed to store biomarker' }, { status: 500 });
  }
}
