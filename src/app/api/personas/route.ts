import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/personas - Get user's custom personas
export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const personas = await prisma.customPersona.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ personas });
  } catch (error) {
    console.error('Get personas error:', error);
    return NextResponse.json({ error: 'Failed to fetch personas' }, { status: 500 });
  }
}

// POST /api/personas - Create a custom persona
export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, icon, voiceId } = await req.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const persona = await prisma.customPersona.create({
      data: {
        userId: authUser.userId,
        name,
        description,
        icon: icon || '✨',
        voiceId: voiceId || null,
      },
    });

    return NextResponse.json({ persona });
  } catch (error) {
    console.error('Create persona error:', error);
    return NextResponse.json({ error: 'Failed to create persona' }, { status: 500 });
  }
}

// DELETE /api/personas - Delete a custom persona
export async function DELETE(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const personaId = url.searchParams.get('id');

    if (!personaId) {
      return NextResponse.json({ error: 'Persona ID is required' }, { status: 400 });
    }

    await prisma.customPersona.deleteMany({
      where: {
        id: personaId,
        userId: authUser.userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete persona error:', error);
    return NextResponse.json({ error: 'Failed to delete persona' }, { status: 500 });
  }
}
