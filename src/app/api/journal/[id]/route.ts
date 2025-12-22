import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/journal/[id] - Get a single journal entry
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const entry = await prisma.journalEntry.findFirst({
      where: { id, userId: authUser.userId },
      include: {
        session: {
          select: {
            id: true,
            sessionType: true,
            title: true,
            summary: true,
            moodStart: true,
            moodEnd: true,
            createdAt: true,
          }
        }
      }
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Get journal entry error:', error);
    return NextResponse.json({ error: 'Failed to fetch journal entry' }, { status: 500 });
  }
}

// PUT /api/journal/[id] - Update a specific journal entry
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Verify ownership
    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId: authUser.userId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const {
      content,
      title,
      mood,
      moodAfter,
      distortion,
      distortions,
      userResponse,
      tags,
      aiSummary,
      gratitudeItems,
    } = body;

    const entry = await prisma.journalEntry.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(title !== undefined && { title }),
        ...(mood !== undefined && { mood: mood ? parseInt(mood) : null }),
        ...(moodAfter !== undefined && { moodAfter: moodAfter ? parseInt(moodAfter) : null }),
        ...(distortion !== undefined && { distortion }),
        ...(distortions !== undefined && { distortions: distortions ? JSON.stringify(distortions) : null }),
        ...(userResponse !== undefined && { userResponse }),
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : null }),
        ...(aiSummary !== undefined && { aiSummary }),
        ...(gratitudeItems !== undefined && { gratitudeItems: gratitudeItems ? JSON.stringify(gratitudeItems) : null }),
      },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Update journal entry error:', error);
    return NextResponse.json({ error: 'Failed to update journal entry' }, { status: 500 });
  }
}

// DELETE /api/journal/[id] - Delete a specific journal entry
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId: authUser.userId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    await prisma.journalEntry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    return NextResponse.json({ error: 'Failed to delete journal entry' }, { status: 500 });
  }
}
