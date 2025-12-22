import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Get all conversations for current user (therapist sees student chats, students see therapist chats)
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

    let conversations;
    
    if (user?.isTherapist) {
      // Therapist: get conversations where they are the therapist
      conversations = await prisma.chatConversation.findMany({
        where: { therapistId: currentUser.userId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Get student names
      const studentIds = conversations.map(c => c.studentId);
      const students = await prisma.user.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, name: true, email: true },
      });

      const studentMap = new Map(students.map(s => [s.id, s]));
      
      return NextResponse.json({
        conversations: conversations.map(c => ({
          ...c,
          otherUser: studentMap.get(c.studentId),
          unreadCount: 0, // TODO: count unread
        })),
      });
    } else {
      // Student: get conversations where they are the student
      conversations = await prisma.chatConversation.findMany({
        where: { studentId: currentUser.userId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Get therapist names
      const therapistIds = conversations.map(c => c.therapistId);
      const therapists = await prisma.user.findMany({
        where: { id: { in: therapistIds } },
        select: { id: true, name: true, email: true, isOnline: true },
      });

      const therapistMap = new Map(therapists.map(t => [t.id, t]));
      
      return NextResponse.json({
        conversations: conversations.map(c => ({
          ...c,
          otherUser: therapistMap.get(c.therapistId),
          unreadCount: 0,
        })),
      });
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// POST - Create or get conversation with a therapist
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { therapistId } = await req.json();
    
    if (!therapistId) {
      return NextResponse.json({ error: 'Therapist ID required' }, { status: 400 });
    }

    // Check therapist exists and is online
    const therapist = await prisma.user.findUnique({
      where: { id: therapistId },
      select: { isTherapist: true, isOnline: true, name: true },
    });

    if (!therapist?.isTherapist) {
      return NextResponse.json({ error: 'Invalid therapist' }, { status: 400 });
    }

    // Create or get existing conversation
    let conversation = await prisma.chatConversation.findUnique({
      where: {
        studentId_therapistId: {
          studentId: currentUser.userId,
          therapistId: therapistId,
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          studentId: currentUser.userId,
          therapistId: therapistId,
        },
      });
    }

    return NextResponse.json({ conversation, therapist });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
