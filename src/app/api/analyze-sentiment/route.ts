import { NextResponse } from 'next/server';
import { getModel } from '@/lib/vertex';

export async function POST(req: Request) {
    try {
        const { audio, timestamp } = await req.json();

        if (!audio) {
            return NextResponse.json({ error: 'No audio data' }, { status: 400 });
        }

        const model = getModel('gemini-2.0-flash-exp');

        const prompt = `
Analyze the emotional content of this audio snippet from a therapy session.

Return a JSON object with the following structure (ONLY JSON, no markdown):
{
  "sentiment": "<one of: positive, neutral, negative, anxious, calm, frustrated>",
  "intensity": <0-1 float representing how strong the emotion is>,
  "emotions": {
    "happy": <0-1 float>,
    "sad": <0-1 float>,
    "anxious": <0-1 float>,
    "calm": <0-1 float>,
    "neutral": <0-1 float>,
    "frustrated": <0-1 float>
  },
  "aiInsight": "<brief 1-sentence insight about the emotional state>"
}

Guidelines:
- Be accurate and empathetic
- Intensity should reflect how pronounced the emotion is
- Emotions should sum to approximately 1.0
- AI insight should be supportive and professional
`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: audio,
                    mimeType: 'audio/webm'
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Parse JSON from response
        let sentimentData;
        try {
            // Remove markdown code blocks if present
            const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            sentimentData = JSON.parse(cleanText);
        } catch (parseError) {
            console.error('Failed to parse Gemini response as JSON:', text);
            // Fallback response
            sentimentData = {
                sentiment: 'neutral',
                intensity: 0.5,
                emotions: {
                    happy: 0.2,
                    sad: 0.1,
                    anxious: 0.1,
                    calm: 0.3,
                    neutral: 0.3,
                    frustrated: 0.0
                },
                aiInsight: 'Emotional tone detected, continue monitoring.'
            };
        }

        return NextResponse.json({
            ...sentimentData,
            timestamp: timestamp || 0
        });
    } catch (error) {
        console.error('Sentiment Analysis Error:', error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}
