import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;
    const currentUser = await getCurrentUser();

    const community = await prisma.community.findUnique({
      where: { slug },
      include: {
        channels: true,
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
        members: currentUser ? {
          where: { userId: currentUser.userId },
        } : false,
      },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const isMember = community.members && community.members.length > 0;
    const membership = isMember ? community.members[0] : null;

    return NextResponse.json({
      community: {
        ...community,
        members: undefined, // remove raw members array
        isMember,
        role: membership?.role || null,
      }
    });
  } catch (error) {
    console.error('Error fetching community details:', error);
    return NextResponse.json({ error: 'Failed to fetch community details' }, { status: 500 });
  }
}
