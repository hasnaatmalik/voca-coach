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

    const {
      name,
      description,
      icon,
      voiceId,
      voiceStability,
      voiceSimilarity,
      voiceStyle,
      voiceSpeakerBoost,
      speechRate
    } = await req.json();

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
        voiceStability: voiceStability ?? 0.5,
        voiceSimilarity: voiceSimilarity ?? 0.8,
        voiceStyle: voiceStyle ?? 0.0,
        voiceSpeakerBoost: voiceSpeakerBoost ?? true,
        speechRate: speechRate ?? 1.0,
      },
    });

    return NextResponse.json({ persona });
  } catch (error) {
    console.error('Create persona error:', error);
    return NextResponse.json({ error: 'Failed to create persona' }, { status: 500 });
  }
}

// PUT /api/personas - Update a custom persona
export async function PUT(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      id,
      name,
      description,
      icon,
      voiceId,
      voiceStability,
      voiceSimilarity,
      voiceStyle,
      voiceSpeakerBoost,
      speechRate
    } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Persona ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existingPersona = await prisma.customPersona.findFirst({
      where: { id, userId: authUser.userId }
    });

    if (!existingPersona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    const persona = await prisma.customPersona.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(icon && { icon }),
        voiceId: voiceId !== undefined ? voiceId : existingPersona.voiceId,
        voiceStability: voiceStability !== undefined ? voiceStability : existingPersona.voiceStability,
        voiceSimilarity: voiceSimilarity !== undefined ? voiceSimilarity : existingPersona.voiceSimilarity,
        voiceStyle: voiceStyle !== undefined ? voiceStyle : existingPersona.voiceStyle,
        voiceSpeakerBoost: voiceSpeakerBoost !== undefined ? voiceSpeakerBoost : existingPersona.voiceSpeakerBoost,
        speechRate: speechRate !== undefined ? speechRate : existingPersona.speechRate,
      },
    });

    return NextResponse.json({ persona });
  } catch (error) {
    console.error('Update persona error:', error);
    return NextResponse.json({ error: 'Failed to update persona' }, { status: 500 });
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
