import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId, commentId, value } = await req.json(); // value is 1 or -1 or 0 (to remove)

    if (value !== 1 && value !== -1 && value !== 0) {
      return NextResponse.json({ error: 'Invalid vote value' }, { status: 400 });
    }

    if (!postId && !commentId) {
      return NextResponse.json({ error: 'Target required' }, { status: 400 });
    }

    // Handled combined unique constraint [userId, postId, commentId]
    const existingVote = await prisma.communityVote.findUnique({
      where: {
        userId_postId_commentId: {
          userId: currentUser.userId,
          postId: postId || null,
          commentId: commentId || null,
        }
      }
    });

    let diff = 0;
    if (existingVote) {
      diff = value - existingVote.value;
      if (value === 0) {
        await prisma.communityVote.delete({ where: { id: existingVote.id } });
      } else {
        await prisma.communityVote.update({
          where: { id: existingVote.id },
          data: { value }
        });
      }
    } else if (value !== 0) {
      diff = value;
      await prisma.communityVote.create({
        data: {
          userId: currentUser.userId,
          postId,
          commentId,
          value
        }
      });
    }

    // Update score on the target
    if (diff !== 0) {
      if (postId) {
        await prisma.communityPost.update({
          where: { id: postId },
          data: { score: { increment: diff } }
        });
      } else if (commentId) {
        await prisma.communityComment.update({
          where: { id: commentId },
          data: { score: { increment: diff } }
        });
      }
    }

    return NextResponse.json({ success: true, diff });
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}
