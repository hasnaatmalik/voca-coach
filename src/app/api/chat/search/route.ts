import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const query = searchParams.get('query');
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    // Verify user is part of conversation
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.studentId !== currentUser.userId &&
        conversation.therapistId !== currentUser.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Build search conditions
    const searchTerm = query.trim().toLowerCase();

    // SQLite doesn't have full-text search, so we use LIKE
    // In production with PostgreSQL, you'd use ts_query
    const typeFilter = type === 'all' ? {} :
      type === 'media' ? { type: { in: ['image', 'file'] } } :
      { type };

    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId,
        isDeleted: false,
        ...typeFilter,
        OR: [
          { content: { contains: searchTerm } },
          { transcript: { contains: searchTerm } },
          { fileName: { contains: searchTerm } }
        ]
      },
      include: {
        conversation: {
          include: {
            student: { select: { id: true, name: true } },
            therapist: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Format results with sender info and highlight context
    const results = messages.map(msg => {
      const sender = msg.senderId === msg.conversation.studentId
        ? msg.conversation.student
        : msg.conversation.therapist;

      const contentToSearch = (msg.content || msg.transcript || msg.fileName || '').toLowerCase();
      const matchIndex = contentToSearch.indexOf(searchTerm);

      // Extract highlight context (50 chars around match)
      let highlight = msg.content || msg.transcript || '';
      if (matchIndex >= 0 && highlight.length > 100) {
        const start = Math.max(0, matchIndex - 30);
        const end = Math.min(highlight.length, matchIndex + searchTerm.length + 30);
        highlight = (start > 0 ? '...' : '') + highlight.slice(start, end) + (end < highlight.length ? '...' : '');
      }

      return {
        message: {
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          sender: { name: sender.name },
          content: msg.content,
          type: msg.type,
          mediaUrl: msg.mediaUrl,
          fileName: msg.fileName,
          transcript: msg.transcript,
          createdAt: msg.createdAt.toISOString()
        },
        highlight
      };
    });

    return NextResponse.json({
      results,
      total: results.length,
      query: searchTerm
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
