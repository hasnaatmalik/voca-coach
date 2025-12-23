import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Get messages for a conversation
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // For pagination

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    // Verify user is part of conversation
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.studentId !== currentUser.userId && conversation.therapistId !== currentUser.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Build query with optional pagination
    const whereClause: { conversationId: string; isDeleted?: boolean; createdAt?: { lt: Date } } = {
      conversationId,
      isDeleted: false
    };

    if (before) {
      whereClause.createdAt = { lt: new Date(before) };
    }

    const messages = await prisma.chatMessage.findMany({
      where: whereClause,
      include: {
        reactions: true,
        replyTo: {
          select: {
            id: true,
            content: true,
            type: true,
            senderId: true
          }
        },
        conversation: {
          include: {
            student: { select: { id: true, name: true } },
            therapist: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: limit
    });

    // Format messages with sender names
    const formattedMessages = messages.map(msg => {
      const sender = msg.senderId === msg.conversation.studentId
        ? msg.conversation.student
        : msg.conversation.therapist;

      const replySender = msg.replyTo
        ? (msg.replyTo.senderId === msg.conversation.studentId
          ? msg.conversation.student
          : msg.conversation.therapist)
        : null;

      return {
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        sender: { name: sender.name },
        content: msg.content,
        type: msg.type,
        mediaUrl: msg.mediaUrl,
        mediaDuration: msg.mediaDuration,
        mediaSize: msg.mediaSize,
        fileName: msg.fileName,
        mimeType: msg.mimeType,
        transcript: msg.transcript,
        sentiment: msg.sentiment,
        biomarkers: msg.biomarkers,
        crisisLevel: msg.crisisLevel,
        replyToId: msg.replyToId,
        replyToPreview: msg.replyTo ? {
          id: msg.replyTo.id,
          content: msg.replyTo.content,
          senderName: replySender?.name || 'Unknown',
          type: msg.replyTo.type
        } : null,
        isEdited: msg.isEdited,
        isDeleted: msg.isDeleted,
        readAt: msg.readAt?.toISOString() || null,
        reactions: msg.reactions.map(r => ({
          id: r.id,
          messageId: r.messageId,
          userId: r.userId,
          emoji: r.emoji,
          createdAt: r.createdAt.toISOString()
        })),
        createdAt: msg.createdAt.toISOString(),
        updatedAt: msg.updatedAt.toISOString()
      };
    });

    // Mark messages as read (using readAt now)
    const now = new Date();
    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: currentUser.userId },
        readAt: null,
      },
      data: { readAt: now },
    });

    return NextResponse.json({
      messages: formattedMessages,
      hasMore: messages.length === limit
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST - Send a message (fallback for non-socket clients)
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      conversationId,
      content,
      type = 'text',
      mediaUrl,
      mediaDuration,
      mediaSize,
      fileName,
      mimeType,
      replyToId
    } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    if (type === 'text' && !content?.trim()) {
      return NextResponse.json({ error: 'Content required for text messages' }, { status: 400 });
    }

    // Verify user is part of conversation
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: {
        student: { select: { id: true, name: true } },
        therapist: { select: { id: true, name: true } }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.studentId !== currentUser.userId && conversation.therapistId !== currentUser.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: currentUser.userId,
        content: content?.trim() || null,
        type,
        mediaUrl,
        mediaDuration,
        mediaSize,
        fileName,
        mimeType,
        replyToId
      },
      include: {
        reactions: true,
        replyTo: {
          select: {
            id: true,
            content: true,
            type: true,
            senderId: true
          }
        }
      }
    });

    // Update conversation timestamp
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    const sender = currentUser.userId === conversation.studentId
      ? conversation.student
      : conversation.therapist;

    const replySender = message.replyTo
      ? (message.replyTo.senderId === conversation.studentId
        ? conversation.student
        : conversation.therapist)
      : null;

    return NextResponse.json({
      message: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        sender: { name: sender.name },
        content: message.content,
        type: message.type,
        mediaUrl: message.mediaUrl,
        mediaDuration: message.mediaDuration,
        mediaSize: message.mediaSize,
        fileName: message.fileName,
        mimeType: message.mimeType,
        transcript: message.transcript,
        sentiment: message.sentiment,
        crisisLevel: message.crisisLevel,
        replyToId: message.replyToId,
        replyToPreview: message.replyTo ? {
          id: message.replyTo.id,
          content: message.replyTo.content,
          senderName: replySender?.name || 'Unknown',
          type: message.replyTo.type
        } : null,
        isEdited: message.isEdited,
        isDeleted: message.isDeleted,
        readAt: null,
        reactions: [],
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
