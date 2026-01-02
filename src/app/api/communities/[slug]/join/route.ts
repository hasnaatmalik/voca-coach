import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const community = await prisma.community.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const { action } = await req.json(); // "join" or "leave"

    if (action === 'join') {
      await prisma.communityMember.upsert({
        where: {
          communityId_userId: {
            communityId: community.id,
            userId: currentUser.userId,
          },
        },
        update: {},
        create: {
          communityId: community.id,
          userId: currentUser.userId,
          role: 'member',
        },
      });
    } else if (action === 'leave') {
      await prisma.communityMember.deleteMany({
        where: {
          communityId: community.id,
          userId: currentUser.userId,
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error join/leave community:', error);
    return NextResponse.json({ error: 'Failed to update membership' }, { status: 500 });
  }
}
