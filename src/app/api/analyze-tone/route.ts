import { NextResponse } from 'next/server';
import { getModel } from '@/lib/vertex';

export async function POST(req: Request) {
    try {
        const { audio } = await req.json();

        if (!audio) {
            return NextResponse.json({ error: 'No audio data' }, { status: 400 });
        }

        const model = getModel('gemini-2.0-flash');

        const prompt = `
      You are an affective listening AI. 
      Analyze the emotional tone of this audio. 
      If the speaker sounds stressed, angry, or high-arousal, respond with a DE-ESCALATING statement.
      Your response should be:
      1. Short (1-2 sentences).
      2. Empathetic but grounding.
      3. Designed to be spoken slowly.
      
      Output ONLY the text response.
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: audio,
                    mimeType: 'audio/webm' // Assuming webm from MediaRecorder
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });
    } catch (error) {
        console.error('Gemini Analysis Error:', error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}
