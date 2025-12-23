import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TranscriptSegment } from '@/types/de-escalation';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Lazy initialization to properly read env vars at runtime
let genAI: GoogleGenerativeAI | null = null;
function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

// Helper to strip data URL prefix and get clean base64
function parseAudioData(audio: string): { data: string; mimeType: string } {
  let audioData = audio;
  let mimeType = 'audio/webm';

  if (typeof audio === 'string' && audio.includes(',')) {
    const parts = audio.split(',');
    if (parts[0].includes('audio/')) {
      const mimeMatch = parts[0].match(/audio\/[a-z0-9]+/);
      if (mimeMatch) {
        mimeType = mimeMatch[0];
      }
    }
    audioData = parts[1];
  }

  return { data: audioData, mimeType };
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { audio, timestamp = 0 } = await req.json();

    if (!audio) {
      return NextResponse.json({ error: 'No audio data provided' }, { status: 400 });
    }

    // Parse audio data (strip data URL prefix if present)
    const { data: audioData, mimeType } = parseAudioData(audio);

    // Validate audio data length
    if (!audioData || audioData.length < 100) {
      return NextResponse.json({
        text: '',
        segments: [],
        dominantEmotion: 'neutral',
        averageIntensity: 0,
      });
    }

    // Step 1: Transcribe using ElevenLabs STT
    let transcribedText = '';

    if (ELEVENLABS_API_KEY) {
      try {
        // Convert base64 to buffer
        const audioBuffer = Buffer.from(audioData, 'base64');
        const audioBlob = new Blob([audioBuffer], { type: mimeType });

        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model_id', 'scribe_v1');

        const sttResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          body: formData,
        });

        if (sttResponse.ok) {
          const sttResult = await sttResponse.json();
          transcribedText = sttResult.text || '';
        }
      } catch (sttError) {
        console.error('ElevenLabs STT error:', sttError);
      }
    }

    // Fallback to Gemini for transcription if ElevenLabs fails
    if (!transcribedText) {
      try {
        const model = getGenAI().getGenerativeModel({
          model: 'gemini-2.0-flash-exp',
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          },
        });
        const transcribePrompt = `Transcribe this audio accurately. Output ONLY the transcribed text, nothing else.`;

        const transcribeResult = await model.generateContent([
          {
            inlineData: {
              mimeType: mimeType,
              data: audioData,
            },
          },
          { text: transcribePrompt },
        ]);

        transcribedText = transcribeResult.response.text().trim();
      } catch (geminiError) {
        console.error('Gemini transcription failed:', geminiError);
        // Return empty result if transcription fails
        return NextResponse.json({
          text: '',
          segments: [],
          dominantEmotion: 'neutral',
          averageIntensity: 0,
        });
      }
    }

    if (!transcribedText || transcribedText.length < 2) {
      return NextResponse.json({
        text: '',
        segments: [],
        dominantEmotion: 'neutral',
        averageIntensity: 0,
      });
    }

    // Step 2: Analyze emotions in the transcript using Gemini
    const emotionModel = getGenAI().getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });
    const emotionPrompt = `Analyze the emotional content of this speech transcript. Break it into segments based on emotional shifts.

Transcript: "${transcribedText}"

For each segment, identify:
1. The text of that segment
2. The primary emotion (choose from: calm, anxious, frustrated, happy, sad, neutral, angry, fearful)
3. Emotional intensity (0-1 scale)
4. Whether it contains trigger words that might indicate distress

Respond with a JSON object (no markdown, no code blocks):
{
  "segments": [
    {
      "text": "<segment text>",
      "emotion": "<emotion>",
      "intensity": <0-1>,
      "isTriggerWord": <boolean>
    }
  ],
  "dominantEmotion": "<most prevalent emotion>",
  "averageIntensity": <0-1>
}`;

    const emotionResult = await emotionModel.generateContent(emotionPrompt);
    const emotionText = emotionResult.response.text().trim();

    let analysisData;
    try {
      const cleanText = emotionText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      analysisData = JSON.parse(cleanText);
    } catch {
      // Default response if parsing fails
      analysisData = {
        segments: [{
          text: transcribedText,
          emotion: 'neutral',
          intensity: 0.3,
          isTriggerWord: false,
        }],
        dominantEmotion: 'neutral',
        averageIntensity: 0.3,
      };
    }

    // Add timestamps and IDs to segments
    const segmentDuration = 5; // Assume ~5 seconds per segment
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const segments: TranscriptSegment[] = analysisData.segments.map(
      (seg: { text: string; emotion: string; intensity: number; isTriggerWord?: boolean }, index: number) => ({
        id: `seg-${uniqueId}-${index}`,
        timestamp: timestamp + (index * segmentDuration),
        duration: segmentDuration,
        text: seg.text,
        emotion: seg.emotion,
        intensity: Math.max(0, Math.min(1, seg.intensity || 0.3)),
        isTriggerWord: seg.isTriggerWord || false,
      })
    );

    return NextResponse.json({
      text: transcribedText,
      segments,
      dominantEmotion: analysisData.dominantEmotion || 'neutral',
      averageIntensity: Math.max(0, Math.min(1, analysisData.averageIntensity || 0.3)),
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
