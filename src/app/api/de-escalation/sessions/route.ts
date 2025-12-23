import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Retrieve user's de-escalation sessions
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const sessions = await prisma.deEscalationSession.findMany({
      where: { userId: user.id },
      orderBy: { startTime: 'desc' },
      take: limit,
      skip: offset,
      include: {
        scenario: true,
      },
    });

    const total = await prisma.deEscalationSession.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime?.toISOString(),
        duration: s.duration,
        averageStress: s.averageStress,
        peakStress: s.peakStress,
        techniquesUsed: JSON.parse(s.techniquesUsed || '[]'),
        scenario: s.scenario ? { id: s.scenario.id, name: s.scenario.name } : null,
        hasRecording: !!s.recordingPath,
        moodBefore: s.moodBefore,
        moodAfter: s.moodAfter,
        crisisDetected: s.crisisDetected,
      })),
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to get sessions' },
      { status: 500 }
    );
  }
}

// POST: Create a new de-escalation session
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      duration,
      averageStress,
      peakStress,
      techniquesUsed = [],
      scenarioId,
      transcript,
      biomarkers,
      aiInterventions = [],
      moodBefore,
      moodAfter,
      crisisDetected = false,
      journalEntry,
    } = body;

    const session = await prisma.deEscalationSession.create({
      data: {
        userId: user.id,
        duration: duration || 0,
        averageStress: averageStress ?? null,
        peakStress: peakStress ?? null,
        techniquesUsed: JSON.stringify(techniquesUsed),
        scenarioId: scenarioId || null,
        transcript: transcript ? JSON.stringify(transcript) : null,
        biomarkers: biomarkers ? JSON.stringify(biomarkers) : null,
        aiInterventions: JSON.stringify(aiInterventions),
        moodBefore: moodBefore ?? null,
        moodAfter: moodAfter ?? null,
        crisisDetected,
        journalEntry: journalEntry || null,
        endTime: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      session: {
        id: session.id,
        startTime: session.startTime.toISOString(),
        duration: session.duration,
        averageStress: session.averageStress,
        peakStress: session.peakStress,
      },
    });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// PATCH: Update an existing session (e.g., add mood after, rating)
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, moodAfter, userRating, userFeedback, journalEntry } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Verify session belongs to user
    const existing = await prisma.deEscalationSession.findFirst({
      where: { id: sessionId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const updated = await prisma.deEscalationSession.update({
      where: { id: sessionId },
      data: {
        ...(moodAfter !== undefined && { moodAfter }),
        ...(userRating !== undefined && { userRating }),
        ...(userFeedback !== undefined && { userFeedback }),
        ...(journalEntry !== undefined && { journalEntry }),
      },
    });

    return NextResponse.json({
      success: true,
      session: {
        id: updated.id,
        moodAfter: updated.moodAfter,
        userRating: updated.userRating,
      },
    });
  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
