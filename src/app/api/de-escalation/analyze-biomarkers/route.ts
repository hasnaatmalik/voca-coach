import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VoiceBiomarkers } from '@/types/de-escalation';

// Lazy initialization to properly read env vars at runtime
let genAI: GoogleGenerativeAI | null = null;
function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

// Generate default biomarkers for when analysis isn't possible
function getDefaultBiomarkers(timestamp?: number): VoiceBiomarkers {
  return {
    speakingRate: 140,
    pitchLevel: 'normal',
    volumeIntensity: 0.5,
    pauseFrequency: 'normal',
    tremorDetected: false,
    overallStressScore: 0.3,
    recommendations: [
      'Continue speaking at a steady pace',
      'Take occasional deep breaths',
      'You\'re doing well - maintain this calm energy',
    ],
    timestamp,
  };
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { audio, timestamp } = await req.json();

    if (!audio) {
      return NextResponse.json({ error: 'No audio data provided' }, { status: 400 });
    }

    // Strip data URL prefix if present (e.g., "data:audio/webm;base64,")
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

    // Validate that we have actual audio data (base64 should be at least a few hundred chars for meaningful audio)
    if (!audioData || audioData.length < 100) {
      console.log('Audio data too short for analysis, returning defaults');
      return NextResponse.json(getDefaultBiomarkers(timestamp));
    }

    const model = getGenAI().getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3, // Lower temperature for more precise measurements
        maxOutputTokens: 1024,
      },
    });

    const prompt = `You are an expert voice biomarker analyst. Analyze this audio recording and extract the following voice characteristics that indicate stress or emotional state:

1. **Speaking Rate (WPM)**: Estimate words per minute. Normal is 120-150 WPM. Above 180 indicates stress.
2. **Pitch Level**: Classify as "low", "normal", "elevated", or "high". Elevated/high pitch often indicates stress.
3. **Volume Intensity**: Rate 0-1 scale. Higher values indicate louder, more forceful speech.
4. **Pause Frequency**: "low" (rushed, no pauses), "normal", or "healthy" (deliberate pauses).
5. **Tremor Detection**: boolean - does the voice show shakiness or trembling?
6. **Overall Stress Score**: 0-1 scale combining all factors. 0 = very calm, 1 = very stressed.
7. **Recommendations**: 2-3 specific, actionable suggestions based on what you observe.

Respond ONLY with a valid JSON object in this exact format (no markdown, no code blocks):
{
  "speakingRate": <number>,
  "pitchLevel": "<low|normal|elevated|high>",
  "volumeIntensity": <0-1>,
  "pauseFrequency": "<low|normal|healthy>",
  "tremorDetected": <boolean>,
  "overallStressScore": <0-1>,
  "recommendations": ["<suggestion1>", "<suggestion2>", "<suggestion3>"]
}`;

    let result;
    try {
      // Note: inlineData should come first for better results with audio
      result = await model.generateContent([
        {
          inlineData: {
            mimeType: mimeType,
            data: audioData,
          },
        },
        { text: prompt },
      ]);
    } catch (geminiError) {
      // If Gemini fails (e.g., audio too short, invalid format), return defaults
      console.error('Gemini analysis failed, returning defaults:', geminiError);
      return NextResponse.json(getDefaultBiomarkers(timestamp));
    }

    const responseText = result.response.text().trim();

    // Parse the response, handling potential markdown wrapping
    let biomarkers: VoiceBiomarkers;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        biomarkers = JSON.parse(jsonMatch[0]);
      } else {
        const cleanText = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        biomarkers = JSON.parse(cleanText);
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      // Return reasonable defaults if parsing fails
      return NextResponse.json(getDefaultBiomarkers(timestamp));
    }

    // Validate and clamp values
    biomarkers.speakingRate = Math.max(60, Math.min(300, biomarkers.speakingRate || 140));
    biomarkers.volumeIntensity = Math.max(0, Math.min(1, biomarkers.volumeIntensity || 0.5));
    biomarkers.overallStressScore = Math.max(0, Math.min(1, biomarkers.overallStressScore || 0.3));

    if (!['low', 'normal', 'elevated', 'high'].includes(biomarkers.pitchLevel)) {
      biomarkers.pitchLevel = 'normal';
    }
    if (!['low', 'normal', 'healthy'].includes(biomarkers.pauseFrequency)) {
      biomarkers.pauseFrequency = 'normal';
    }

    if (timestamp !== undefined) {
      biomarkers.timestamp = timestamp;
    }

    return NextResponse.json(biomarkers);
  } catch (error) {
    console.error('Biomarker analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze voice biomarkers' },
      { status: 500 }
    );
  }
}
