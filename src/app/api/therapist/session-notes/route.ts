import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Store session notes in a simple format using the database
// For a production app, you'd create a dedicated SessionNote model

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

    // Session notes are not yet implemented (requires dedicated SessionNote model)
    // For now, return empty array - notes feature needs schema migration
    const notes: unknown[] = [];

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

    const { conversationId, content, linkedMessageId } = await req.json();

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

    // Session notes feature requires dedicated SessionNote model
    // For now, return a stub - notes feature needs schema migration
    const newNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      linkedMessageId: linkedMessageId || null,
      createdAt: new Date().toISOString()
    };

    // TODO: Persist note when SessionNote model is added
    console.log('Session note created (not persisted):', newNote);

    return NextResponse.json(newNote);
  } catch (error) {
    console.error('Error creating session note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
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

    // Session notes feature requires dedicated SessionNote model
    // For now, return success stub - notes feature needs schema migration
    console.log('Session note deleted (not persisted):', noteId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
