import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { BREATHING_PATTERNS, BreathingPattern } from '@/types/de-escalation';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel - warm voice

interface BreathingPhase {
  phase: 'inhale' | 'hold' | 'exhale' | 'holdAfter';
  duration: number;
  instruction: string;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pattern, voiceId, phase, text, speechRate } = await req.json();

    const selectedVoiceId = voiceId || DEFAULT_VOICE_ID;
    let instructionText: string;

    // If raw text is provided (for generic TTS), use it directly
    if (text) {
      instructionText = text;
    } else if (pattern && BREATHING_PATTERNS[pattern as BreathingPattern]) {
      // Breathing pattern mode
      const config = BREATHING_PATTERNS[pattern as BreathingPattern];

      if (phase) {
        // Single phase instruction
        const phaseInstructions: Record<string, string> = {
          inhale: 'Breathe in slowly... filling your lungs completely.',
          hold: 'Hold... stay relaxed.',
          exhale: 'Breathe out slowly... let go of all tension.',
          holdAfter: 'Hold empty... stay calm.',
        };
        instructionText = phaseInstructions[phase] || 'Continue breathing...';
      } else {
        // Full breathing cycle introduction
        instructionText = getFullInstruction(pattern as BreathingPattern, config);
      }
    } else if (!text) {
      return NextResponse.json(
        { error: 'Either text or valid breathing pattern is required' },
        { status: 400 }
      );
    } else {
      instructionText = text;
    }

    // Determine if this is a generic TTS request (for VoiceSelector, etc.)
    const isGenericTTS = !!text;
    const config = pattern ? BREATHING_PATTERNS[pattern as BreathingPattern] : null;

    // Generate TTS audio using ElevenLabs
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json({
        text: instructionText,
        pattern: config,
        audioAvailable: false,
      });
    }

    try {
      const ttsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: instructionText,
            model_id: process.env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5',
            voice_settings: {
              stability: 0.7,         // More stable for calm delivery
              similarity_boost: 0.8,
              style: 0.1,             // Minimal style for calm tone
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        console.error('ElevenLabs TTS error:', errorText);
        return NextResponse.json({
          text: instructionText,
          pattern: config,
          audioAvailable: false,
        });
      }

      const audioBuffer = await ttsResponse.arrayBuffer();

      // For generic TTS requests, return JSON with base64 audio
      if (isGenericTTS) {
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        return NextResponse.json({
          audio: base64Audio,
          text: instructionText,
        });
      }

      // For breathing pattern requests, return raw audio
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
          'X-Instruction-Text': encodeURIComponent(instructionText),
          'X-Pattern-Name': config?.name || 'custom',
        },
      });
    } catch (ttsError) {
      console.error('TTS generation error:', ttsError);
      return NextResponse.json({
        text: instructionText,
        pattern: config,
        audioAvailable: false,
      });
    }
  } catch (error) {
    console.error('Breathing guide error:', error);
    return NextResponse.json(
      { error: 'Failed to generate breathing guide' },
      { status: 500 }
    );
  }
}

// GET: Return breathing pattern configurations
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const patterns = Object.entries(BREATHING_PATTERNS).map(([key, config]) => ({
      id: key,
      ...config,
      phases: getBreathingPhases(key as BreathingPattern, config),
    }));

    return NextResponse.json({ patterns });
  } catch (error) {
    console.error('Get breathing patterns error:', error);
    return NextResponse.json(
      { error: 'Failed to get breathing patterns' },
      { status: 500 }
    );
  }
}

function getFullInstruction(pattern: BreathingPattern, config: typeof BREATHING_PATTERNS.box): string {
  switch (pattern) {
    case 'box':
      return `Let's begin box breathing. We'll breathe in a square pattern. Breathe in for ${config.inhale} seconds, hold for ${config.hold} seconds, breathe out for ${config.exhale} seconds, and hold for ${config.holdAfter} seconds. We'll do this ${config.cycles} times. Get comfortable and let's begin.`;
    case '478':
      return `Let's practice 4-7-8 breathing for deep relaxation. Breathe in quietly through your nose for 4 counts, hold your breath for 7 counts, then exhale completely through your mouth for 8 counts. We'll do ${config.cycles} cycles together. Place your tongue against the ridge behind your upper teeth, and let's begin.`;
    case 'physiological':
      return `We're going to practice the physiological sigh, the fastest way to calm your nervous system. Take a deep breath in, then take another quick breath on top to completely fill your lungs, then let it all out slowly. We'll do this ${config.cycles} times. Ready? Let's begin.`;
    default:
      return 'Let\'s begin our breathing exercise. Follow along with me.';
  }
}

function getBreathingPhases(pattern: BreathingPattern, config: typeof BREATHING_PATTERNS.box): BreathingPhase[] {
  const phases: BreathingPhase[] = [];

  switch (pattern) {
    case 'box':
      phases.push({ phase: 'inhale', duration: config.inhale, instruction: 'Breathe in' });
      phases.push({ phase: 'hold', duration: config.hold!, instruction: 'Hold' });
      phases.push({ phase: 'exhale', duration: config.exhale, instruction: 'Breathe out' });
      phases.push({ phase: 'holdAfter', duration: config.holdAfter!, instruction: 'Hold' });
      break;
    case '478':
      phases.push({ phase: 'inhale', duration: config.inhale, instruction: 'Breathe in' });
      phases.push({ phase: 'hold', duration: config.hold!, instruction: 'Hold' });
      phases.push({ phase: 'exhale', duration: config.exhale, instruction: 'Breathe out' });
      break;
    case 'physiological':
      phases.push({ phase: 'inhale', duration: config.inhale, instruction: 'Deep breath in' });
      phases.push({ phase: 'hold', duration: config.hold!, instruction: 'Quick extra breath' });
      phases.push({ phase: 'exhale', duration: config.exhale, instruction: 'Long exhale' });
      break;
  }

  return phases;
}
