import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/sessions - Get user's sessions
export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.session.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// POST /api/sessions - Create a new session
export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { duration, calmScore, notes } = await req.json();

    if (typeof duration !== 'number' || typeof calmScore !== 'number') {
      return NextResponse.json(
        { error: 'Duration and calmScore are required' },
        { status: 400 }
      );
    }

    const session = await prisma.session.create({
      data: {
        userId: authUser.userId,
        duration,
        calmScore,
        notes: notes || null,
      },
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
