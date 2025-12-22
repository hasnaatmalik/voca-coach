import { NextResponse } from 'next/server';
import { getModel } from '@/lib/vertex';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Persona system prompts
const PERSONA_PROMPTS: Record<string, string> = {
  p1: `You are a Calm Mentor - a patient and understanding guide who helps people stay grounded. 
    Speak slowly, calmly, and with reassurance. Use simple, grounding language.
    Focus on breathing, mindfulness, and staying present.`,
  p2: `You are a Supportive Friend - an empathetic listener who validates feelings.
    Be warm, caring, and understanding. Acknowledge emotions without judgment.
    Offer gentle encouragement and support.`,
  p3: `You are playing the role of a Difficult Boss for practice purposes.
    Be demanding, impatient, and slightly unreasonable (but not abusive).
    This helps the user practice de-escalation in workplace scenarios.
    After 3-4 exchanges, start becoming more reasonable if the user handles it well.`,
  p4: `You are playing the role of an Anxious Client for practice purposes.
    Be worried, ask many questions, and express concerns repeatedly.
    This helps the user practice calming anxious individuals.
    Gradually calm down if the user provides reassurance effectively.`,
};

export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, personaId, conversationHistory } = await req.json();

    if (!message || !personaId) {
      return NextResponse.json(
        { error: 'Message and personaId are required' },
        { status: 400 }
      );
    }

    const model = getModel('gemini-2.0-flash-exp');

    // Build conversation context - check preset first, then custom personas
    let systemPrompt: string;

    if (PERSONA_PROMPTS[personaId]) {
      // Use preset persona prompt
      systemPrompt = PERSONA_PROMPTS[personaId];
    } else {
      // Fetch custom persona from database
      const customPersona = await prisma.customPersona.findFirst({
        where: {
          id: personaId,
          userId: authUser.userId
        }
      });

      if (customPersona) {
        // Use custom persona description as system prompt
        systemPrompt = `You are ${customPersona.name}. ${customPersona.description}

Stay in character at all times. Respond naturally as this persona would.
Be conversational and engaging while maintaining your persona's personality.`;
      } else {
        // Fallback for invalid persona ID
        systemPrompt = 'You are a helpful and empathetic conversation partner.';
      }
    }

    const historyContext = conversationHistory?.length > 0
      ? `\n\nConversation so far:\n${conversationHistory.map((m: {role: string, content: string}) => 
          `${m.role === 'user' ? 'User' : 'You'}: ${m.content}`
        ).join('\n')}`
      : '';

    const prompt = `${systemPrompt}

Keep your responses concise (2-3 sentences max) and conversational.
Respond naturally as this persona would.
${historyContext}

User: ${message}

Respond:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Persona chat error:', error);
    return NextResponse.json(
      { error: 'Chat failed' },
      { status: 500 }
    );
  }
}
