import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'de-escalation');

// GET: Retrieve user's session recordings
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (sessionId) {
      // Get specific session recording
      const session = await prisma.deEscalationSession.findFirst({
        where: {
          id: sessionId,
          userId: user.id,
          recordingPath: { not: null },
        },
        include: {
          scenario: true,
        },
      });

      if (!session) {
        return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: session.id,
        audioPath: session.recordingPath,
        duration: session.duration,
        transcript: session.transcript ? JSON.parse(session.transcript) : null,
        biomarkers: session.biomarkers ? JSON.parse(session.biomarkers) : [],
        aiInterventions: JSON.parse(session.aiInterventions),
        scenario: session.scenario,
        createdAt: session.createdAt.toISOString(),
      });
    }

    // Get list of sessions with recordings
    const sessions = await prisma.deEscalationSession.findMany({
      where: {
        userId: user.id,
        recordingPath: { not: null },
      },
      orderBy: { startTime: 'desc' },
      take: limit,
      skip: offset,
      include: {
        scenario: true,
      },
    });

    const totalCount = await prisma.deEscalationSession.count({
      where: {
        userId: user.id,
        recordingPath: { not: null },
      },
    });

    const recordings = sessions.map((session) => ({
      id: session.id,
      audioPath: session.recordingPath,
      duration: session.duration,
      hasTranscript: !!session.transcript,
      averageStress: session.averageStress,
      peakStress: session.peakStress,
      scenario: session.scenario
        ? { id: session.scenario.id, name: session.scenario.name }
        : null,
      createdAt: session.createdAt.toISOString(),
    }));

    return NextResponse.json({
      recordings,
      total: totalCount,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error('Get recordings error:', error);
    return NextResponse.json(
      { error: 'Failed to get recordings' },
      { status: 500 }
    );
  }
}

// POST: Save a new session recording
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const sessionId = body.sessionId;
    const audioData = body.audioData || body.audio; // Accept both param names
    const transcript = body.transcript;
    const biomarkers = body.biomarkers;
    const aiInterventions = body.aiInterventions;
    const duration = body.duration;
    const consentGiven = body.consent !== false; // Allow consent flag in request

    if (!sessionId || !audioData) {
      return NextResponse.json(
        { error: 'sessionId and audio data are required' },
        { status: 400 }
      );
    }

    // Check user consent - either from preferences or request body
    const preferences = await prisma.userDeEscalationPrefs.findUnique({
      where: { userId: user.id },
    });

    if (!preferences?.recordingConsent && !consentGiven) {
      return NextResponse.json(
        { error: 'Recording consent not given' },
        { status: 403 }
      );
    }

    // Find or create session
    let session = await prisma.deEscalationSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    // If session doesn't exist, create it
    if (!session) {
      session = await prisma.deEscalationSession.create({
        data: {
          id: sessionId,
          userId: user.id,
          duration: duration || 0,
          startTime: new Date(),
        },
      });
    }

    // Create user directory if it doesn't exist
    const userDir = path.join(UPLOAD_DIR, user.id);
    if (!existsSync(userDir)) {
      await mkdir(userDir, { recursive: true });
    }

    // Save audio file
    const filename = `${sessionId}.webm`;
    const filePath = path.join(userDir, filename);
    const relativePath = `/uploads/de-escalation/${user.id}/${filename}`;

    // Convert base64 to buffer and save
    const audioBuffer = Buffer.from(audioData, 'base64');
    await writeFile(filePath, audioBuffer);

    // Update session with recording info
    await prisma.deEscalationSession.update({
      where: { id: sessionId },
      data: {
        recordingPath: relativePath,
        transcript: transcript ? JSON.stringify(transcript) : null,
        biomarkers: biomarkers ? JSON.stringify(biomarkers) : null,
        aiInterventions: aiInterventions ? JSON.stringify(aiInterventions) : '[]',
      },
    });

    return NextResponse.json({
      success: true,
      id: session.id,
      audioPath: relativePath,
      recordingPath: relativePath,
      sessionId,
    });
  } catch (error) {
    console.error('Save recording error:', error);
    return NextResponse.json(
      { error: 'Failed to save recording' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a session recording
export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Get session and verify ownership
    const session = await prisma.deEscalationSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Delete file if it exists
    if (session.recordingPath) {
      const filePath = path.join(process.cwd(), 'public', session.recordingPath);
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    }

    // Update session to remove recording reference
    await prisma.deEscalationSession.update({
      where: { id: sessionId },
      data: {
        recordingPath: null,
        // Keep transcript and biomarkers for analytics, just remove audio
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete recording error:', error);
    return NextResponse.json(
      { error: 'Failed to delete recording' },
      { status: 500 }
    );
  }
}
