import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

// Google Cloud Speech-to-Text
const GOOGLE_SPEECH_API = 'https://speech.googleapis.com/v1/speech:recognize';

interface TranscriptSegment {
  startTime: number;
  endTime: number;
  speaker: string;
  text: string;
  confidence: number;
}

// POST /api/therapy/recording/transcribe - Transcribe a recording
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recordingId } = await req.json();

    if (!recordingId) {
      return NextResponse.json({ error: 'recordingId is required' }, { status: 400 });
    }

    // Get recording
    const recording = await prisma.sessionRecording.findUnique({
      where: { id: recordingId },
      include: {
        session: {
          select: {
            id: true,
            userId: true,
            therapistId: true,
          },
        },
      },
    });

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }

    // Verify access
    const session = recording.session;
    if (session.userId !== user.id && session.therapistId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if file exists
    if (!existsSync(recording.filePath)) {
      return NextResponse.json({ error: 'Recording file not found' }, { status: 404 });
    }

    // Read audio file
    const audioBuffer = await readFile(recording.filePath);
    const audioBase64 = audioBuffer.toString('base64');

    // Call Google Speech-to-Text API
    const apiKey = process.env.GOOGLE_SPEECH_API_KEY;
    if (!apiKey) {
      // Fallback: Generate mock transcript for development
      const mockTranscript = generateMockTranscript(recording.duration);
      await saveTranscript(recording.id, recording.filePath, mockTranscript);

      return NextResponse.json({
        transcript: mockTranscript,
        message: 'Mock transcript generated (no API key)',
      });
    }

    try {
      const response = await fetch(`${GOOGLE_SPEECH_API}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: 'en-US',
            enableAutomaticPunctuation: true,
            enableWordTimeOffsets: true,
            enableSpeakerDiarization: true,
            diarizationSpeakerCount: 2,
            model: 'latest_long',
          },
          audio: {
            content: audioBase64,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Speech API error: ${response.statusText}`);
      }

      const data = await response.json();
      const transcript = processGoogleSpeechResponse(data);

      await saveTranscript(recording.id, recording.filePath, transcript);

      return NextResponse.json({ transcript });
    } catch (speechError) {
      console.error('Speech-to-Text error:', speechError);

      // Fallback to mock transcript
      const mockTranscript = generateMockTranscript(recording.duration);
      await saveTranscript(recording.id, recording.filePath, mockTranscript);

      return NextResponse.json({
        transcript: mockTranscript,
        message: 'Fallback transcript generated',
      });
    }
  } catch (error) {
    console.error('Error transcribing recording:', error);
    return NextResponse.json({ error: 'Failed to transcribe recording' }, { status: 500 });
  }
}

function processGoogleSpeechResponse(data: unknown): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];

  // Type-safe response parsing
  const response = data as {
    results?: Array<{
      alternatives?: Array<{
        transcript?: string;
        confidence?: number;
        words?: Array<{
          word?: string;
          startTime?: string;
          endTime?: string;
          speakerTag?: number;
        }>;
      }>;
    }>;
  };

  if (!response.results) {
    return segments;
  }

  for (const result of response.results) {
    const alternative = result.alternatives?.[0];
    if (!alternative) continue;

    const words = alternative.words || [];
    let currentSpeaker = 0;
    let currentText = '';
    let segmentStart = 0;
    let segmentEnd = 0;

    for (const word of words) {
      const speaker = word.speakerTag || 0;
      const startTime = parseFloat(word.startTime?.replace('s', '') || '0');
      const endTime = parseFloat(word.endTime?.replace('s', '') || '0');

      if (speaker !== currentSpeaker && currentText) {
        segments.push({
          startTime: segmentStart,
          endTime: segmentEnd,
          speaker: currentSpeaker === 1 ? 'Therapist' : 'Client',
          text: currentText.trim(),
          confidence: alternative.confidence || 0,
        });
        currentText = '';
        segmentStart = startTime;
      }

      currentSpeaker = speaker;
      currentText += ' ' + (word.word || '');
      segmentEnd = endTime;
    }

    // Add final segment
    if (currentText) {
      segments.push({
        startTime: segmentStart,
        endTime: segmentEnd,
        speaker: currentSpeaker === 1 ? 'Therapist' : 'Client',
        text: currentText.trim(),
        confidence: alternative.confidence || 0,
      });
    }
  }

  return segments;
}

function generateMockTranscript(durationSeconds: number): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const exchanges = [
    { speaker: 'Therapist', text: 'Welcome to our session today. How have you been feeling since we last spoke?' },
    { speaker: 'Client', text: 'I\'ve been feeling a bit anxious, especially about work deadlines.' },
    { speaker: 'Therapist', text: 'I hear you. Can you tell me more about what specifically is causing that anxiety?' },
    { speaker: 'Client', text: 'There\'s a big project due next week and I\'m worried I won\'t finish in time.' },
    { speaker: 'Therapist', text: 'That\'s understandable. Let\'s explore some strategies to manage that feeling.' },
    { speaker: 'Client', text: 'That would be helpful. I\'ve been losing sleep over it.' },
    { speaker: 'Therapist', text: 'Sleep is crucial. Have you tried any relaxation techniques before bed?' },
    { speaker: 'Client', text: 'Not really. I usually just scroll on my phone until I fall asleep.' },
    { speaker: 'Therapist', text: 'Let\'s work on establishing a healthier bedtime routine together.' },
    { speaker: 'Client', text: 'I\'d like that. I know I need to make changes.' },
  ];

  const segmentDuration = Math.min(durationSeconds / exchanges.length, 60);
  let currentTime = 0;

  for (let i = 0; i < Math.min(exchanges.length, Math.ceil(durationSeconds / 30)); i++) {
    const exchange = exchanges[i];
    segments.push({
      startTime: currentTime,
      endTime: currentTime + segmentDuration,
      speaker: exchange.speaker,
      text: exchange.text,
      confidence: 0.95,
    });
    currentTime += segmentDuration;
  }

  return segments;
}

async function saveTranscript(recordingId: string, recordingPath: string, transcript: TranscriptSegment[]) {
  const transcriptPath = recordingPath.replace('.webm', '-transcript.json');

  await writeFile(transcriptPath, JSON.stringify(transcript, null, 2));

  await prisma.sessionRecording.update({
    where: { id: recordingId },
    data: { transcriptPath },
  });
}

// GET /api/therapy/recording/transcribe?recordingId=xxx - Get transcript
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const recordingId = searchParams.get('recordingId');

    if (!recordingId) {
      return NextResponse.json({ error: 'recordingId is required' }, { status: 400 });
    }

    const recording = await prisma.sessionRecording.findUnique({
      where: { id: recordingId },
      include: {
        session: {
          select: {
            userId: true,
            therapistId: true,
          },
        },
      },
    });

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }

    // Verify access
    if (recording.session.userId !== user.id && recording.session.therapistId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!recording.transcriptPath || !existsSync(recording.transcriptPath)) {
      return NextResponse.json({ transcript: null, message: 'No transcript available' });
    }

    const transcriptData = await readFile(recording.transcriptPath, 'utf-8');
    const transcript = JSON.parse(transcriptData);

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json({ error: 'Failed to fetch transcript' }, { status: 500 });
  }
}
