import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Get unread message count for current user
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: { isTherapist: true },
    });

    let unreadCount = 0;
    let conversations: { id: string; studentId: string; therapistId: string }[] = [];

    if (user?.isTherapist) {
      // Therapist: get conversations where they are the therapist
      conversations = await prisma.chatConversation.findMany({
        where: { therapistId: currentUser.userId },
        select: { id: true, studentId: true, therapistId: true },
      });
    } else {
      // Student: get conversations where they are the student
      conversations = await prisma.chatConversation.findMany({
        where: { studentId: currentUser.userId },
        select: { id: true, studentId: true, therapistId: true },
      });
    }

    const conversationIds = conversations.map(c => c.id);
    
    if (conversationIds.length === 0) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const count = await prisma.chatMessage.count({
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: currentUser.userId },
        readAt: null,
      },
    });
    unreadCount = count;

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json({ error: 'Failed to fetch unread count' }, { status: 500 });
  }
}
