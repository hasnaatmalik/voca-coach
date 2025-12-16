import { NextResponse } from 'next/server';
import { getModel } from '@/lib/vertex';

export async function POST(req: Request) {
    try {
        const { message, personaContext } = await req.json();

        // Use flash for faster conversational responses
        const model = getModel('gemini-2.0-flash');

        const systemPrompt = `
      You are a roleplay AI.
      Adopt the following persona completely:
      "${personaContext}"
      
      Your goal is to sustain a realistic, therapeutic, or practice conversation based on this persona.
      - Keep responses concise and natural (1-3 sentences).
      - Do not break character.
      - If the user says something aggressive, react as the persona would (but keep it safe/compliant).
    `;

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: 'model',
                    parts: [{ text: "Understood. I will stay in character." }],
                }
            ],
            generationConfig: {
                maxOutputTokens: 156,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });
    } catch (error) {
        console.error('Persona Chat Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Chat failed', details: errorMessage }, { status: 500 });
    }
}
