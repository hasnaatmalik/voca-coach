import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - List posts for a community
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');

    const community = await prisma.community.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const posts = await prisma.communityPost.findMany({
      where: {
        communityId: community.id,
        ...(channelId ? { channelId } : {}),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST - Create a new post
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

    const { title, content, channelId, mediaUrl, mediaType } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const community = await prisma.community.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const post = await prisma.communityPost.create({
      data: {
        title,
        content,
        mediaUrl,
        mediaType,
        communityId: community.id,
        channelId,
        authorId: currentUser.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
