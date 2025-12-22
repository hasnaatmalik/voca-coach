import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getModel } from '@/lib/vertex';

// GET /api/journal-prompts - Get prompts by category
export async function GET(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');

    const prompts = await prisma.journalPrompt.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Get prompts error:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

// POST /api/journal-prompts - Generate a personalized prompt
export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category } = await req.json();

    // Get recent entries for personalization
    const recentEntries = await prisma.journalEntry.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        content: true,
        mood: true,
        distortion: true,
        tags: true,
      },
    });

    const model = getModel('gemini-2.0-flash-exp');

    const categoryContext = category
      ? `Focus on the category: ${category}`
      : 'Choose any appropriate category';

    const entriesContext = recentEntries.length > 0
      ? `Based on recent journal themes: ${recentEntries.map(e => e.content.substring(0, 100)).join(' | ')}`
      : 'This is a new user with no previous entries';

    const prompt = `
      Generate a thoughtful, therapeutic journaling prompt.

      ${categoryContext}
      ${entriesContext}

      Categories to choose from: reflection, gratitude, growth, emotions, relationships

      Requirements:
      - Make it personal and engaging
      - Avoid clichés
      - Encourage deep self-reflection
      - Keep it to 1-2 sentences

      Respond in JSON:
      {
        "category": "the category",
        "prompt": "the journaling prompt"
      }
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const response = await result.response;
    const data = JSON.parse(response.text());

    // Save the AI-generated prompt
    const savedPrompt = await prisma.journalPrompt.create({
      data: {
        category: data.category || category || 'reflection',
        prompt: data.prompt,
        isAIGenerated: true,
      },
    });

    return NextResponse.json({
      id: savedPrompt.id,
      category: savedPrompt.category,
      prompt: savedPrompt.prompt,
      isAIGenerated: true,
    });
  } catch (error) {
    console.error('Generate prompt error:', error);
    return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 });
  }
}
