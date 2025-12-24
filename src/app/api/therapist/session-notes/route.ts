import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Get session notes for a conversation
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    // Verify therapist is part of conversation
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation || conversation.therapistId !== currentUser.userId) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const notes = await prisma.sessionNote.findMany({
      where: {
        conversationId,
        therapistId: currentUser.userId
      },
      include: {
        linkedMessage: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error fetching session notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// POST - Add a session note
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, content, linkedMessageId, category, isPinned } = await req.json();

    if (!conversationId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify therapist is part of conversation
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation || conversation.therapistId !== currentUser.userId) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Verify linked message exists and belongs to this conversation
    if (linkedMessageId) {
      const message = await prisma.chatMessage.findUnique({
        where: { id: linkedMessageId }
      });

      if (!message || message.conversationId !== conversationId) {
        return NextResponse.json({ error: 'Invalid linked message' }, { status: 400 });
      }
    }

    const note = await prisma.sessionNote.create({
      data: {
        conversationId,
        therapistId: currentUser.userId,
        content,
        linkedMessageId: linkedMessageId || null,
        category: category || null,
        isPinned: isPinned || false
      },
      include: {
        linkedMessage: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true
          }
        }
      }
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error creating session note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

// PATCH - Update a session note
export async function PATCH(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, content, category, isPinned } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
    }

    // Verify note belongs to this therapist
    const existingNote = await prisma.sessionNote.findUnique({
      where: { id }
    });

    if (!existingNote || existingNote.therapistId !== currentUser.userId) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const updateData: {
      content?: string;
      category?: string | null;
      isPinned?: boolean;
    } = {};

    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (isPinned !== undefined) updateData.isPinned = isPinned;

    const note = await prisma.sessionNote.update({
      where: { id },
      data: updateData,
      include: {
        linkedMessage: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true
          }
        }
      }
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error updating session note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

// DELETE - Delete a session note
export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get('id');
    const conversationId = searchParams.get('conversationId');

    if (!noteId || !conversationId) {
      return NextResponse.json({ error: 'Note ID and Conversation ID required' }, { status: 400 });
    }

    // Verify therapist is part of conversation
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation || conversation.therapistId !== currentUser.userId) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Verify note exists and belongs to this therapist
    const note = await prisma.sessionNote.findUnique({
      where: { id: noteId }
    });

    if (!note || note.therapistId !== currentUser.userId) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    await prisma.sessionNote.delete({
      where: { id: noteId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
