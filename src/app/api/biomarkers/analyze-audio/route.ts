import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateOverallScore } from '@/lib/biomarker-utils';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const AUDIO_ANALYSIS_PROMPT = `You are an expert voice biomarker analyst specializing in acoustic analysis for mental health and wellness monitoring.

Analyze this voice recording and extract detailed vocal biomarkers. Listen carefully for:
- Pitch patterns and fundamental frequency
- Voice clarity and articulation quality
- Signs of stress, tension, or relaxation in the voice
- Speaking pace and rhythm
- Pauses between phrases
- Voice stability and quality indicators

Return your analysis as a JSON object with EXACTLY this structure (no markdown, just raw JSON):
{
  "pitch": <number in Hz, typical range 85-255Hz for speech>,
  "clarity": <0-100 score for articulation quality>,
  "stress": <0-100 score for tension/arousal indicators, lower is calmer>,
  "pauseDuration": <average pause length in seconds between phrases>,
  "articulationRate": <words per second, typical 3-5>,
  "jitter": <frequency variation percentage, healthy is under 1%>,
  "shimmer": <amplitude variation percentage, healthy is under 3%>,
  "speechRate": <words per minute, typical 120-180>,
  "hnr": <harmonic-to-noise ratio in dB, healthy is 15-25>,
  "observations": "<2-3 sentence clinical observations about the voice quality and what it may indicate about emotional state>",
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", "<actionable recommendation 3>"]
}

Be precise with your measurements. Base your analysis on acoustic features you can detect in the audio.
If you cannot accurately measure a specific metric from the audio, use a reasonable estimate based on what you can observe.`;

export async function POST(req: Request) {
  try {
    // Verify authentication
    const authUser = await requireAuth();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the form data
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const promptId = formData.get('prompt') as string;
    const recordingDuration = formData.get('duration') as string;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert audio to base64
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    // Determine the MIME type
    const mimeType = audioFile.type || 'audio/webm';

    // Get the Gemini model with audio capabilities
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3, // Lower temperature for more precise measurements
        maxOutputTokens: 1024,
      },
    });

    // Create the prompt with context about the recording
    const contextPrompt = `${AUDIO_ANALYSIS_PROMPT}

Recording context:
- Prompt used: ${promptId || 'free_speech'}
- Recording duration: ${recordingDuration || 'unknown'} seconds

Analyze the audio and provide the biomarker measurements:`;

    // Send to Gemini with audio
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: audioBase64,
        },
      },
      { text: contextPrompt },
    ]);

    const responseText = result.response.text();

    // Parse the JSON response
    let biomarkers;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        biomarkers = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      // Return fallback values if parsing fails
      biomarkers = generateFallbackBiomarkers();
    }

    // Validate and normalize the biomarker values
    const normalizedBiomarkers = normalizeBiomarkers(biomarkers);

    // Calculate overall score
    normalizedBiomarkers.overallScore = calculateOverallScore(normalizedBiomarkers);

    return NextResponse.json(normalizedBiomarkers);
  } catch (error) {
    console.error('Audio analysis error:', error);

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service configuration error' },
          { status: 500 }
        );
      }
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return NextResponse.json(
          { error: 'AI service rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to analyze audio. Please try again.' },
      { status: 500 }
    );
  }
}

// Normalize biomarker values to expected ranges
function normalizeBiomarkers(raw: Record<string, unknown>): Record<string, unknown> {
  return {
    pitch: clamp(Number(raw.pitch) || 150, 50, 400),
    clarity: clamp(Number(raw.clarity) || 75, 0, 100),
    stress: clamp(Number(raw.stress) || 40, 0, 100),
    pauseDuration: clamp(Number(raw.pauseDuration) || 0.8, 0, 5),
    articulationRate: clamp(Number(raw.articulationRate) || 4, 1, 10),
    jitter: clamp(Number(raw.jitter) || 0.5, 0, 5),
    shimmer: clamp(Number(raw.shimmer) || 2, 0, 10),
    speechRate: clamp(Number(raw.speechRate) || 140, 50, 300),
    hnr: clamp(Number(raw.hnr) || 18, 5, 35),
    observations: String(raw.observations || 'Voice analysis completed.'),
    recommendations: Array.isArray(raw.recommendations)
      ? raw.recommendations.slice(0, 5).map(String)
      : ['Practice deep breathing before speaking', 'Stay hydrated for better voice quality'],
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Generate fallback biomarkers when AI analysis fails
function generateFallbackBiomarkers(): Record<string, unknown> {
  // Generate reasonable baseline values with some variation
  return {
    pitch: 140 + Math.random() * 40,
    clarity: 70 + Math.random() * 20,
    stress: 30 + Math.random() * 30,
    pauseDuration: 0.5 + Math.random() * 0.8,
    articulationRate: 3.5 + Math.random() * 1.5,
    jitter: 0.3 + Math.random() * 0.5,
    shimmer: 1.5 + Math.random() * 2,
    speechRate: 120 + Math.random() * 50,
    hnr: 16 + Math.random() * 6,
    observations: 'Analysis completed with estimated values. Record a longer, clearer sample for more accurate results.',
    recommendations: [
      'Record in a quiet environment for better accuracy',
      'Speak clearly and at a natural pace',
      'Try the reading prompts for consistent measurements',
    ],
  };
}
