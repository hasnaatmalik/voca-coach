import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getModel } from '@/lib/vertex';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SCENARIOS } from '@/types/de-escalation';

// GET: Retrieve available scenarios
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get scenarios from database
    let scenarios = await prisma.deEscalationScenario.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    // If no scenarios in DB, seed with defaults
    if (scenarios.length === 0) {
      await prisma.deEscalationScenario.createMany({
        data: DEFAULT_SCENARIOS.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          difficulty: s.difficulty,
          category: s.category,
          aiPrompt: s.aiPrompt,
          icon: s.icon,
        })),
      });

      scenarios = await prisma.deEscalationScenario.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });
    }

    // Get user's session count per scenario for recommendations
    const sessionCounts = await prisma.deEscalationSession.groupBy({
      by: ['scenarioId'],
      where: { userId: user.id },
      _count: true,
    });

    const scenarioCountMap = new Map(
      sessionCounts.map((s) => [s.scenarioId, s._count])
    );

    const enrichedScenarios = scenarios.map((scenario) => ({
      ...scenario,
      practiceCount: scenarioCountMap.get(scenario.id) || 0,
      tips: DEFAULT_SCENARIOS.find((d) => d.id === scenario.id)?.tips || [],
    }));

    return NextResponse.json({ scenarios: enrichedScenarios });
  } catch (error) {
    console.error('Get scenarios error:', error);
    return NextResponse.json(
      { error: 'Failed to get scenarios' },
      { status: 500 }
    );
  }
}

// POST: Generate AI response for scenario practice
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const scenarioId = body.scenarioId;
    const userMessage = body.userMessage || body.message; // Accept both param names
    const conversationHistory = body.conversationHistory;

    if (!scenarioId || !userMessage) {
      return NextResponse.json(
        { error: 'scenarioId and message are required' },
        { status: 400 }
      );
    }

    // Get scenario from DB
    let scenario = await prisma.deEscalationScenario.findUnique({
      where: { id: scenarioId },
    });

    // Fallback to default scenarios if not in DB
    if (!scenario) {
      const defaultScenario = DEFAULT_SCENARIOS.find((s) => s.id === scenarioId);
      if (!defaultScenario) {
        return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
      }
      scenario = {
        id: defaultScenario.id,
        name: defaultScenario.name,
        description: defaultScenario.description,
        difficulty: defaultScenario.difficulty,
        category: defaultScenario.category,
        aiPrompt: defaultScenario.aiPrompt,
        icon: defaultScenario.icon,
        isActive: true,
        createdAt: new Date(),
      };
    }

    const model = getModel('gemini-2.0-flash-exp');

    // Build conversation context
    const historyContext = conversationHistory
      ?.map((msg: { role: string; content: string }) => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
      .join('\n') || '';

    const prompt = `${scenario.aiPrompt}

${historyContext ? `Previous conversation:\n${historyContext}\n` : ''}
User just said: "${userMessage}"

Respond in character, keeping the response conversational (1-3 sentences). Don't break character or mention that this is practice. React naturally to the user's de-escalation attempts. If they're doing well, show signs of calming down. If they're struggling, maintain your emotional state but don't escalate too much.

Response:`;

    const result = await model.generateContent(prompt);
    let aiResponse = result.response.text().trim();

    // Clean up any markdown or extra formatting
    aiResponse = aiResponse
      .replace(/^["']|["']$/g, '')
      .replace(/\*\*/g, '')
      .replace(/Response:/i, '')
      .trim();

    // Analyze the user's de-escalation performance
    const analysisPrompt = `Briefly analyze this de-escalation attempt (1 sentence). Did the user use effective techniques like active listening, empathy, calm tone, or asking questions?

User message: "${userMessage}"

Rate effectiveness 0-100 and note the technique used (if any). Respond in JSON:
{"score": <0-100>, "technique": "<technique or 'none'>", "feedback": "<1 sentence>"}`;

    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisText = analysisResult.response.text().trim();

    let analysis = { score: 50, technique: 'none', feedback: '' };
    try {
      const cleanAnalysis = analysisText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      analysis = JSON.parse(cleanAnalysis);
    } catch {
      // Use defaults if parsing fails
    }

    // Calculate points based on score
    const score = Math.max(0, Math.min(100, analysis.score || 50));
    const pointsEarned = Math.round(score / 5); // 0-20 points

    return NextResponse.json({
      response: aiResponse,
      pointsEarned,
      emotion: scenario.category, // Use scenario category as emotion context
      intensity: score / 100,
      analysis: {
        score,
        technique: analysis.technique,
        feedback: analysis.feedback,
      },
      scenario: {
        id: scenario.id,
        name: scenario.name,
        difficulty: scenario.difficulty,
        category: scenario.category,
      },
    });
  } catch (error) {
    console.error('Scenario response error:', error);
    return NextResponse.json(
      { error: 'Failed to generate scenario response' },
      { status: 500 }
    );
  }
}
