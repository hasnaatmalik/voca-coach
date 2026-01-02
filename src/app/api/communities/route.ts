import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

// GET - List all communities
export async function GET() {
  try {
    const communities = await prisma.community.findMany({
      include: {
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ communities });
  } catch (error) {
    console.error('Error fetching communities:', error);
    return NextResponse.json({ error: 'Failed to fetch communities' }, { status: 500 });
  }
}

// POST - Create a new community
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, icon } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const slug = slugify(name);

    // Check if name or slug already exists
    const existing = await prisma.community.findFirst({
      where: {
        OR: [
          { name },
          { slug },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Community already exists' }, { status: 400 });
    }

    // Create community and add creator as admin member
    const community = await prisma.community.create({
      data: {
        name,
        slug,
        description,
        icon: icon || '🌐',
        ownerId: currentUser.userId,
        members: {
          create: {
            userId: currentUser.userId,
            role: 'admin',
          },
        },
        channels: {
          create: [
            { name: 'General', description: 'General discussion', type: 'post' },
          ],
        },
      },
      include: {
        channels: true,
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    return NextResponse.json({ community });
  } catch (error) {
    console.error('Error creating community:', error);
    return NextResponse.json({ error: 'Failed to create community' }, { status: 500 });
  }
}
