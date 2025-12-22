import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// In-memory cache for voices (1 hour TTL)
let voicesCache: {
  voices: Voice[];
  fetchedAt: number;
} | null = null;

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

interface VoiceLabel {
  accent?: string;
  description?: string;
  age?: string;
  gender?: string;
  use_case?: string;
}

interface Voice {
  voice_id: string;
  name: string;
  preview_url: string;
  labels: VoiceLabel;
  category?: string;
}

// GET /api/voices - Get available ElevenLabs voices
export async function GET() {
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

    // Check cache
    if (voicesCache && Date.now() - voicesCache.fetchedAt < CACHE_TTL) {
      return NextResponse.json({ voices: voicesCache.voices, cached: true });
    }

    // Fetch from ElevenLabs API
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch voices' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform and filter the voices
    const voices: Voice[] = data.voices.map((voice: Voice) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      preview_url: voice.preview_url,
      labels: voice.labels || {},
      category: voice.category,
    }));

    // Update cache
    voicesCache = {
      voices,
      fetchedAt: Date.now(),
    };

    return NextResponse.json({ voices, cached: false });
  } catch (error) {
    console.error('Get voices error:', error);
    return NextResponse.json({ error: 'Failed to fetch voices' }, { status: 500 });
  }
}
