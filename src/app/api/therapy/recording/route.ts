import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'recordings');

// GET /api/therapy/recording?sessionId=xxx - Get recording info
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Verify session access
    const session = await prisma.therapySession.findFirst({
      where: {
        id: sessionId,
        OR: [
          { userId: user.id },
          { therapistId: user.id },
        ],
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const recordings = await prisma.sessionRecording.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ recordings });
  } catch (error) {
    console.error('Error fetching recordings:', error);
    return NextResponse.json({ error: 'Failed to fetch recordings' }, { status: 500 });
  }
}

// POST /api/therapy/recording - Upload recording chunk
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const sessionId = formData.get('sessionId') as string;
    const file = formData.get('file') as File;
    const duration = parseInt(formData.get('duration') as string) || 0;

    if (!sessionId || !file) {
      return NextResponse.json({ error: 'sessionId and file are required' }, { status: 400 });
    }

    // Verify session access and consent
    const session = await prisma.therapySession.findFirst({
      where: {
        id: sessionId,
        OR: [
          { userId: user.id },
          { therapistId: user.id },
        ],
      },
      include: {
        recordings: {
          where: {
            userConsent: true,
            therapistConsent: true,
          },
          take: 1,
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if both parties consented
    const existingRecording = session.recordings[0];
    if (!existingRecording) {
      return NextResponse.json({ error: 'Recording consent not given by both parties' }, { status: 403 });
    }

    // Ensure upload directory exists
    const sessionDir = path.join(UPLOADS_DIR, sessionId);
    if (!existsSync(sessionDir)) {
      await mkdir(sessionDir, { recursive: true });
    }

    // Save file
    const timestamp = Date.now();
    const fileName = `recording-${timestamp}.webm`;
    const filePath = path.join(sessionDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Update recording record
    const recording = await prisma.sessionRecording.update({
      where: { id: existingRecording.id },
      data: {
        filePath,
        duration,
      },
    });

    return NextResponse.json({ recording });
  } catch (error) {
    console.error('Error uploading recording:', error);
    return NextResponse.json({ error: 'Failed to upload recording' }, { status: 500 });
  }
}
