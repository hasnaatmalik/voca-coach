import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// GET /api/persona-conversations - Get user's conversation history
export async function GET(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const personaId = url.searchParams.get('personaId');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const whereClause: { userId: string; personaId?: string } = {
      userId: authUser.userId,
    };

    if (personaId) {
      whereClause.personaId = personaId;
    }

    const conversations = await prisma.personaConversation.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    // Parse messages JSON for each conversation
    const parsedConversations = conversations.map((conv) => ({
      ...conv,
      messages: JSON.parse(conv.messages) as ConversationMessage[],
    }));

    // Group by persona if no specific personaId requested
    if (!personaId) {
      const grouped: Record<string, typeof parsedConversations> = {};
      parsedConversations.forEach((conv) => {
        const key = conv.personaId || 'unknown';
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(conv);
      });
      return NextResponse.json({ conversations: parsedConversations, grouped });
    }

    return NextResponse.json({ conversations: parsedConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// POST /api/persona-conversations - Create a new conversation
export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { personaId, personaName, personaIcon, messages } = await req.json();

    if (!personaId || !personaName || !personaIcon) {
      return NextResponse.json(
        { error: 'personaId, personaName, and personaIcon are required' },
        { status: 400 }
      );
    }

    const conversation = await prisma.personaConversation.create({
      data: {
        userId: authUser.userId,
        personaId,
        personaName,
        personaIcon,
        messages: JSON.stringify(messages || []),
      },
    });

    return NextResponse.json({
      conversation: {
        ...conversation,
        messages: JSON.parse(conversation.messages),
      },
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}

// PUT /api/persona-conversations - Update a conversation (add messages)
export async function PUT(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, messages, summary } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existingConversation = await prisma.personaConversation.findFirst({
      where: { id, userId: authUser.userId },
    });

    if (!existingConversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const updateData: { messages?: string; summary?: string } = {};
    if (messages !== undefined) {
      updateData.messages = JSON.stringify(messages);
    }
    if (summary !== undefined) {
      updateData.summary = summary;
    }

    const conversation = await prisma.personaConversation.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      conversation: {
        ...conversation,
        messages: JSON.parse(conversation.messages),
      },
    });
  } catch (error) {
    console.error('Update conversation error:', error);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}

// DELETE /api/persona-conversations - Delete a conversation
export async function DELETE(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    await prisma.personaConversation.deleteMany({
      where: {
        id,
        userId: authUser.userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}
