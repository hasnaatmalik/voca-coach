import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// POST - Transcribe a voice message
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const messageId = formData.get('messageId') as string;
    const audioFile = formData.get('audio') as File | null;
    const action = formData.get('action') as string || 'transcribe'; // 'transcribe' or 'analyze'

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    // Get the message
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: { conversation: true }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Verify user is part of conversation
    if (message.conversation.studentId !== currentUser.userId &&
        message.conversation.therapistId !== currentUser.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Handle transcription
    if (action === 'transcribe' || !message.transcript) {
      if (!ELEVENLABS_API_KEY) {
        return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
      }

      // Get audio data - either from uploaded file or stored path
      let audioBuffer: Buffer;

      if (audioFile) {
        const arrayBuffer = await audioFile.arrayBuffer();
        audioBuffer = Buffer.from(arrayBuffer);
      } else if (message.mediaUrl) {
        // Read from stored file
        const filePath = path.join(process.cwd(), 'public', message.mediaUrl);
        if (!existsSync(filePath)) {
          return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
        }
        const fs = await import('fs/promises');
        audioBuffer = await fs.readFile(filePath);
      } else {
        return NextResponse.json({ error: 'No audio data available' }, { status: 400 });
      }

      // Call ElevenLabs STT API
      const sttFormData = new FormData();
      // Convert Buffer to ArrayBuffer for Blob compatibility
      const audioArrayBuffer = audioBuffer.buffer.slice(
        audioBuffer.byteOffset,
        audioBuffer.byteOffset + audioBuffer.byteLength
      ) as ArrayBuffer;
      sttFormData.append('file', new Blob([audioArrayBuffer], { type: 'audio/webm' }), 'audio.webm');
      sttFormData.append('model_id', 'scribe_v1');

      const sttResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: sttFormData
      });

      if (!sttResponse.ok) {
        console.error('ElevenLabs STT error:', await sttResponse.text());
        return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
      }

      const sttResult = await sttResponse.json();
      const transcript = sttResult.text || '';

      // Update message with transcript
      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { transcript }
      });

      return NextResponse.json({
        success: true,
        transcript,
        language: sttResult.language,
        confidence: sttResult.confidence
      });
    }

    // Handle biomarker analysis (on-demand)
    if (action === 'analyze') {
      if (!GEMINI_API_KEY) {
        return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
      }

      // Get audio data
      let audioBase64: string;

      if (audioFile) {
        const arrayBuffer = await audioFile.arrayBuffer();
        audioBase64 = Buffer.from(arrayBuffer).toString('base64');
      } else if (message.mediaUrl) {
        const filePath = path.join(process.cwd(), 'public', message.mediaUrl);
        if (!existsSync(filePath)) {
          return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
        }
        const fs = await import('fs/promises');
        const buffer = await fs.readFile(filePath);
        audioBase64 = buffer.toString('base64');
      } else {
        return NextResponse.json({ error: 'No audio data available' }, { status: 400 });
      }

      // Call Gemini for biomarker analysis
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `Analyze this voice recording for stress and emotional indicators. Return a JSON object with ONLY these fields:
{
  "speakingRate": <number in words per minute, estimated>,
  "pitchLevel": "<string: low|normal|elevated|high>",
  "volumeIntensity": <number 0-1>,
  "pauseFrequency": "<string: low|normal|healthy>",
  "tremorDetected": <boolean>,
  "overallStressScore": <number 0-1, where 0 is calm and 1 is highly stressed>,
  "recommendations": [<array of 2-3 short recommendation strings>]
}

Analyze the audio for:
- Speaking pace and rhythm
- Voice tremor or shakiness
- Pitch variations indicating stress
- Breathing patterns
- Overall vocal tension

Return ONLY the JSON object, no other text.`;

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType: 'audio/webm',
            data: audioBase64
          }
        }
      ]);

      const responseText = result.response.text().trim();

      // Parse the JSON response
      let biomarkers;
      try {
        // Remove markdown code blocks if present
        const jsonStr = responseText.replace(/```json\n?|\n?```/g, '').trim();
        biomarkers = JSON.parse(jsonStr);
      } catch (e) {
        console.error('Failed to parse biomarkers:', responseText);
        // Return default values
        biomarkers = {
          speakingRate: 120,
          pitchLevel: 'normal',
          volumeIntensity: 0.5,
          pauseFrequency: 'normal',
          tremorDetected: false,
          overallStressScore: 0.3,
          recommendations: ['Take slow, deep breaths', 'Speak at a comfortable pace']
        };
      }

      // Validate and clamp values
      biomarkers.speakingRate = Math.max(60, Math.min(200, biomarkers.speakingRate || 120));
      biomarkers.overallStressScore = Math.max(0, Math.min(1, biomarkers.overallStressScore || 0.3));
      biomarkers.volumeIntensity = Math.max(0, Math.min(1, biomarkers.volumeIntensity || 0.5));
      biomarkers.analyzedAt = new Date().toISOString();

      // Update message with biomarkers
      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { biomarkers: JSON.stringify(biomarkers) }
      });

      return NextResponse.json({
        success: true,
        biomarkers
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Voice API error:', error);
    return NextResponse.json({ error: 'Voice processing failed' }, { status: 500 });
  }
}

// GET - Get voice message details including transcript and biomarkers
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: { conversation: true }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Verify user is part of conversation
    if (message.conversation.studentId !== currentUser.userId &&
        message.conversation.therapistId !== currentUser.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      id: message.id,
      mediaUrl: message.mediaUrl,
      duration: message.mediaDuration,
      transcript: message.transcript,
      biomarkers: message.biomarkers ? JSON.parse(message.biomarkers) : null
    });
  } catch (error) {
    console.error('Voice API error:', error);
    return NextResponse.json({ error: 'Failed to get voice message' }, { status: 500 });
  }
}
