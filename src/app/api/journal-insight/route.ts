import { NextResponse } from 'next/server';
import { getModel } from '@/lib/vertex';

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        // Using a more capable model for reasoning if available, else Flash
        const model = getModel('gemini-2.0-flash');

        const prompt = `
      You are an expert CBT (Cognitive Behavioral Therapy) therapist.
      Analyze the user's journal entry: "${message}"
      
      Tasks:
      1. Identify if there is a cognitive distortion (e.g., All-or-Nothing, Catastrophizing, Emotional Reasoning). If none, say "None".
      2. Generate a Compassionate Socratic Question to help the user challenge this thought.
      
      Respond in JSON format:
      {
        "distortion": "Name of distortion OR null",
        "socraticPrompt": "The question to ask the user"
      }
    `;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
        });

        const response = await result.response;
        const json = JSON.parse(response.text());

        return NextResponse.json(json);
    } catch (error) {
        console.error('Journal Analysis Error:', error);
        return NextResponse.json({
            distortion: null,
            socraticPrompt: "I'm listening. Tell me more about that?"
        });
    }
}
