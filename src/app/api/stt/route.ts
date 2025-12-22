import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// POST /api/stt - Convert speech to text using ElevenLabs
export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Convert File to Blob for ElevenLabs API
    const arrayBuffer = await audioFile.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: audioFile.type || 'audio/webm' });

    // Create form data for ElevenLabs API
    const elevenLabsFormData = new FormData();
    elevenLabsFormData.append('file', blob, audioFile.name || 'recording.webm');
    elevenLabsFormData.append('model_id', 'scribe_v1'); // ElevenLabs Scribe model

    // Call ElevenLabs Speech-to-Text API
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: elevenLabsFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs STT error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Speech-to-text conversion failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      text: data.text || '',
      language: data.language_code,
      confidence: data.language_probability,
    });
  } catch (error) {
    console.error('STT error:', error);
    return NextResponse.json(
      { error: 'Speech-to-text conversion failed' },
      { status: 500 }
    );
  }
}
