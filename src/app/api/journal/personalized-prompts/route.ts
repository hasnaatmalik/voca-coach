import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getModel } from '@/lib/vertex';

const GRATITUDE_CATEGORIES = {
  relationships: [
    "Who made a positive impact on your life recently?",
    "What relationship are you most thankful for right now?",
    "Who believed in you when you needed it most?",
  ],
  moments: [
    "What made you smile today?",
    "What's a peaceful moment you experienced recently?",
    "What's something beautiful you noticed today?",
  ],
  personal: [
    "What ability or skill are you thankful for?",
    "What personal strength helped you recently?",
    "What's something about yourself you appreciate?",
  ],
  simple: [
    "What's a small thing you're grateful for?",
    "What simple pleasure did you enjoy today?",
    "What comfort do you often take for granted?",
  ],
  growth: [
    "What's a challenge that taught you something valuable?",
    "What opportunity are you grateful to have?",
    "What lesson from the past are you thankful for now?",
  ],
};

function getRandomFallbackPrompts(): string[] {
  const categories = Object.keys(GRATITUDE_CATEGORIES) as (keyof typeof GRATITUDE_CATEGORIES)[];
  const shuffled = [...categories].sort(() => Math.random() - 0.5).slice(0, 3);
  return shuffled.map(cat => {
    const prompts = GRATITUDE_CATEGORIES[cat];
    return prompts[Math.floor(Math.random() * prompts.length)];
  });
}

export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type = 'gratitude' } = await req.json().catch(() => ({}));

    if (type !== 'gratitude') {
      return NextResponse.json({ prompts: getRandomFallbackPrompts() });
    }

    // Fetch user's recent journal data for personalization
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [entries, sessions, user] = await Promise.all([
      prisma.journalEntry.findMany({
        where: {
          userId: authUser.userId,
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          content: true,
          tags: true,
          mood: true,
          gratitudeItems: true,
        },
      }),
      prisma.journalSession.findMany({
        where: {
          userId: authUser.userId,
          sessionType: 'gratitude',
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          messages: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: authUser.userId },
        select: { name: true },
      }),
    ]);

    // If no history, return random prompts
    if (entries.length === 0 && sessions.length === 0) {
      return NextResponse.json({ prompts: getRandomFallbackPrompts() });
    }

    // Extract context for personalization
    const recentTags = entries.flatMap(e => e.tags || []).slice(0, 10);
    const recentGratitudeItems = entries.flatMap(e => e.gratitudeItems || []).slice(0, 10);
    const averageMood = entries.filter(e => e.mood).length > 0
      ? entries.filter(e => e.mood).reduce((sum, e) => sum + (e.mood || 0), 0) / entries.filter(e => e.mood).length
      : null;

    // Extract previous gratitude responses to avoid repetition
    const previousResponses: string[] = [];
    sessions.forEach(session => {
      if (session.messages && Array.isArray(session.messages)) {
        (session.messages as { response?: string }[]).forEach(msg => {
          if (msg.response) previousResponses.push(msg.response);
        });
      }
    });

    try {
      const model = getModel('gemini-2.0-flash-exp');

      const prompt = `You are a compassionate gratitude coach. Generate 3 personalized gratitude prompts for a user based on their journal history.

User Context:
- Name: ${user?.name || 'User'}
- Recent mood average: ${averageMood ? `${averageMood.toFixed(1)}/10` : 'Not tracked'}
- Topics they write about: ${recentTags.length > 0 ? recentTags.join(', ') : 'Various topics'}
- Recent gratitude items: ${recentGratitudeItems.length > 0 ? recentGratitudeItems.slice(0, 5).join('; ') : 'None recorded'}
- Previous responses to avoid repetition: ${previousResponses.slice(0, 5).join('; ') || 'None'}

Generate prompts that:
1. Are personalized to their interests and life context
2. Encourage deeper reflection than generic prompts
3. Are different from their recent gratitude items
4. Are warm, inviting, and specific
5. Each prompt should explore a different aspect of gratitude (relationships, moments, growth, simple pleasures, personal strengths)

${averageMood !== null && averageMood < 5 ? 'Note: Their mood has been lower lately. Generate gentle, accessible prompts that don\'t feel overwhelming.' : ''}
${averageMood !== null && averageMood >= 7 ? 'Note: They\'re in a positive state. You can ask more reflective, deeper questions.' : ''}

Return ONLY valid JSON in this exact format:
{
  "prompts": [
    "First personalized gratitude question?",
    "Second personalized gratitude question?",
    "Third personalized gratitude question?"
  ]
}`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      });

      const responseText = result.response.text();
      const parsed = JSON.parse(responseText);

      if (parsed.prompts && Array.isArray(parsed.prompts) && parsed.prompts.length >= 3) {
        return NextResponse.json({ prompts: parsed.prompts.slice(0, 3), personalized: true });
      }
    } catch (aiError) {
      console.error('AI prompt generation failed:', aiError);
    }

    // Fallback to random prompts
    return NextResponse.json({ prompts: getRandomFallbackPrompts(), personalized: false });
  } catch (error) {
    console.error('Personalized prompts error:', error);
    return NextResponse.json({ prompts: getRandomFallbackPrompts(), personalized: false });
  }
}
