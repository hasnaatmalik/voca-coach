import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/journal - Get user's journal entries
export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entries = await prisma.journalEntry.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Get journal entries error:', error);
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
  }
}

// POST /api/journal - Create a new journal entry
export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, distortion, socraticPrompt, userResponse } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId: authUser.userId,
        content,
        distortion: distortion || null,
        socraticPrompt: socraticPrompt || null,
        userResponse: userResponse || null,
      },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Create journal entry error:', error);
    return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 });
  }
}
