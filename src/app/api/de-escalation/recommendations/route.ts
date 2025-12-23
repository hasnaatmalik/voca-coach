import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getModel } from '@/lib/vertex';
import {
  DEFAULT_TECHNIQUES,
  DEFAULT_SCENARIOS,
  PersonalizedRecommendations,
} from '@/types/de-escalation';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's recent sessions
    const recentSessions = await prisma.deEscalationSession.findMany({
      where: { userId: user.id },
      orderBy: { startTime: 'desc' },
      take: 20,
    });

    // Get user preferences
    const preferences = await prisma.userDeEscalationPrefs.findUnique({
      where: { userId: user.id },
    });

    // Calculate technique effectiveness from session history
    const techniqueUsage: Map<string, { count: number; avgStressReduction: number }> = new Map();

    for (const session of recentSessions) {
      const techniques: string[] = JSON.parse(session.techniquesUsed || '[]');
      const stressReduction = session.peakStress && session.averageStress
        ? (session.peakStress - session.averageStress) / session.peakStress
        : 0;

      for (const techniqueId of techniques) {
        const existing = techniqueUsage.get(techniqueId) || { count: 0, avgStressReduction: 0 };
        existing.avgStressReduction = (existing.avgStressReduction * existing.count + stressReduction) / (existing.count + 1);
        existing.count += 1;
        techniqueUsage.set(techniqueId, existing);
      }
    }

    // Sort techniques by effectiveness
    const sortedTechniques = Array.from(techniqueUsage.entries())
      .sort((a, b) => b[1].avgStressReduction - a[1].avgStressReduction)
      .slice(0, 3);

    // Get preferred techniques or recommend based on history
    const preferredTechniqueIds: string[] = preferences?.preferredTechniques
      ? JSON.parse(preferences.preferredTechniques)
      : sortedTechniques.map(([id]) => id);

    // Build recommended techniques list
    const suggestedTechniques = DEFAULT_TECHNIQUES
      .filter((t) => preferredTechniqueIds.includes(t.id) || !preferredTechniqueIds.length)
      .slice(0, 3)
      .map((technique) => ({
        ...technique,
        effectiveness: techniqueUsage.get(technique.id)?.avgStressReduction
          ? Math.round(techniqueUsage.get(technique.id)!.avgStressReduction * 100)
          : undefined,
      }));

    // If user hasn't used any techniques, recommend defaults
    if (suggestedTechniques.length === 0) {
      suggestedTechniques.push(
        { ...DEFAULT_TECHNIQUES[0], effectiveness: undefined }, // Box breathing
        { ...DEFAULT_TECHNIQUES[3], effectiveness: undefined }, // 5-4-3-2-1 grounding
        { ...DEFAULT_TECHNIQUES[2], effectiveness: undefined }, // Physiological sigh
      );
    }

    // Calculate scenario recommendations based on category gaps
    const scenarioCategories = new Set(
      recentSessions
        .filter((s) => s.scenarioId)
        .map((s) => {
          const scenario = DEFAULT_SCENARIOS.find((sc) => sc.id === s.scenarioId);
          return scenario?.category;
        })
        .filter(Boolean)
    );

    const suggestedScenarios = DEFAULT_SCENARIOS
      .filter((s) => !scenarioCategories.has(s.category) || scenarioCategories.size === 0)
      .slice(0, 2);

    // Generate insights based on recent activity
    const insights: string[] = [];

    if (recentSessions.length > 0) {
      const avgStress = recentSessions.reduce((sum, s) => sum + (s.averageStress || 0), 0) / recentSessions.length;

      if (avgStress < 0.3) {
        insights.push('Your stress levels have been well-managed in recent sessions. Great work!');
      } else if (avgStress > 0.6) {
        insights.push('You\'ve been experiencing higher stress lately. Consider practicing breathing exercises daily.');
      }

      const weekOldSessions = recentSessions.filter(
        (s) => new Date(s.startTime) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      if (weekOldSessions.length === 0) {
        insights.push('It\'s been a while since your last session. Regular practice helps build resilience.');
      } else if (weekOldSessions.length >= 5) {
        insights.push('You\'ve been consistent with your practice this week. Keep it up!');
      }
    } else {
      insights.push('Welcome! Start with a simple breathing exercise to get familiar with the system.');
      insights.push('Box breathing is a great first technique - it\'s used by Navy SEALs to stay calm under pressure.');
    }

    // Calculate next milestone
    const totalSessions = recentSessions.length;
    const milestones = [
      { count: 1, name: 'First Steps', description: 'Complete your first session' },
      { count: 5, name: 'Getting Started', description: 'Complete 5 sessions' },
      { count: 10, name: 'Building Habits', description: 'Complete 10 sessions' },
      { count: 25, name: 'Dedicated Practitioner', description: 'Complete 25 sessions' },
      { count: 50, name: 'De-Escalation Expert', description: 'Complete 50 sessions' },
      { count: 100, name: 'Master of Calm', description: 'Complete 100 sessions' },
    ];

    const nextMilestone = milestones.find((m) => m.count > totalSessions);

    const recommendations: PersonalizedRecommendations = {
      suggestedTechniques,
      suggestedScenarios,
      insights,
      nextMilestone: nextMilestone
        ? {
            name: nextMilestone.name,
            progress: Math.round((totalSessions / nextMilestone.count) * 100),
            description: nextMilestone.description,
          }
        : undefined,
    };

    // Add personalized practice reminder if needed
    const lastSession = recentSessions[0];
    if (lastSession) {
      const hoursSinceLastSession = (Date.now() - new Date(lastSession.startTime).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSession > 48) {
        recommendations.practiceReminder = 'Consider a quick 2-minute breathing exercise to maintain your practice streak.';
      }
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

// POST: Get AI-powered personalized recommendation
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentMood, specificConcern } = await req.json();

    const model = getModel('gemini-2.0-flash-exp');

    const techniques = DEFAULT_TECHNIQUES.map((t) => `${t.name}: ${t.description}`).join('\n');

    const prompt = `You are a de-escalation coach. Based on the user's current state, recommend the most appropriate technique.

Available techniques:
${techniques}

User's current mood (1-10 scale, 10 being most stressed): ${currentMood || 5}
${specificConcern ? `Specific concern: ${specificConcern}` : ''}

Recommend ONE technique that best fits their current state. Explain why briefly (1-2 sentences).

Respond in JSON:
{"techniqueId": "<id from list>", "reason": "<brief explanation>", "urgency": "<low|medium|high>"}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    let recommendation;
    try {
      const cleanText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      recommendation = JSON.parse(cleanText);
    } catch {
      // Default recommendation
      recommendation = {
        techniqueId: 'box-breathing',
        reason: 'Box breathing is a versatile technique that works well for most stress levels.',
        urgency: 'medium',
      };
    }

    const technique = DEFAULT_TECHNIQUES.find((t) => t.id === recommendation.techniqueId);

    return NextResponse.json({
      technique: technique || DEFAULT_TECHNIQUES[0],
      reason: recommendation.reason,
      urgency: recommendation.urgency,
    });
  } catch (error) {
    console.error('Personalized recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to get personalized recommendation' },
      { status: 500 }
    );
  }
}
