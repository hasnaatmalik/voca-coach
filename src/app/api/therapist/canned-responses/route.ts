import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Get therapist's canned responses
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const responses = await prisma.cannedResponse.findMany({
      where: { therapistId: currentUser.userId },
      orderBy: [
        { category: 'asc' },
        { usageCount: 'desc' }
      ]
    });

    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Error fetching canned responses:', error);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}

// POST - Create new canned response
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, title, content, shortcut } = await req.json();

    if (!category || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const response = await prisma.cannedResponse.create({
      data: {
        therapistId: currentUser.userId,
        category,
        title,
        content,
        shortcut: shortcut || null
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating canned response:', error);
    return NextResponse.json({ error: 'Failed to create response' }, { status: 500 });
  }
}

// PUT - Update canned response
export async function PUT(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, category, title, content, shortcut } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Response ID required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.cannedResponse.findUnique({
      where: { id }
    });

    if (!existing || existing.therapistId !== currentUser.userId) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }

    const response = await prisma.cannedResponse.update({
      where: { id },
      data: {
        category: category || existing.category,
        title: title || existing.title,
        content: content || existing.content,
        shortcut: shortcut !== undefined ? shortcut : existing.shortcut
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating canned response:', error);
    return NextResponse.json({ error: 'Failed to update response' }, { status: 500 });
  }
}

// PATCH - Update usage count
export async function PATCH(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, usageCount } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Response ID required' }, { status: 400 });
    }

    await prisma.cannedResponse.update({
      where: { id },
      data: { usageCount }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating usage count:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE - Delete canned response
export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Response ID required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.cannedResponse.findUnique({
      where: { id }
    });

    if (!existing || existing.therapistId !== currentUser.userId) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }

    await prisma.cannedResponse.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting canned response:', error);
    return NextResponse.json({ error: 'Failed to delete response' }, { status: 500 });
  }
}
