import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { CrisisDetectionResult, CRISIS_RESOURCES, RiskLevel } from '@/types/de-escalation';
import { prisma } from '@/lib/prisma';

// Crisis keyword patterns organized by severity
const CRISIS_PATTERNS: Record<RiskLevel, RegExp[]> = {
  critical: [
    /\b(want to die|kill myself|end my life|suicide|suicidal)\b/i,
    /\b(going to hurt myself|harm myself|cut myself)\b/i,
    /\b(don't want to live|can't go on|no reason to live)\b/i,
    /\b(goodbye forever|final goodbye|ending it all)\b/i,
  ],
  high: [
    /\b(want to disappear|wish I was dead|better off dead)\b/i,
    /\b(can't take it anymore|can't handle this|no way out)\b/i,
    /\b(nothing matters|no one cares|all alone)\b/i,
    /\b(self-harm|hurting myself|punish myself)\b/i,
    /\b(hopeless|worthless|burden)\b/i,
  ],
  medium: [
    /\b(feeling desperate|losing hope|giving up)\b/i,
    /\b(can't cope|overwhelmed|falling apart)\b/i,
    /\b(panic attack|can't breathe|heart racing)\b/i,
    /\b(trapped|stuck|no escape)\b/i,
  ],
  low: [
    /\b(stressed|anxious|worried|scared)\b/i,
    /\b(sad|depressed|down|unhappy)\b/i,
    /\b(frustrated|angry|upset)\b/i,
    /\b(lonely|isolated|disconnected)\b/i,
  ],
  none: [],
};

// Recommended actions per risk level
const RECOMMENDED_ACTIONS: Record<RiskLevel, string> = {
  critical: 'Immediately pause session and display crisis resources. Consider contacting emergency services.',
  high: 'Display crisis resources prominently. Offer to connect with a crisis counselor.',
  medium: 'Suggest taking a break and using grounding techniques. Display support resources.',
  low: 'Continue with de-escalation techniques. Monitor for escalation.',
  none: 'Continue normal session flow.',
};

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, context, sessionId } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const fullText = context ? `${context} ${text}` : text;
    const triggers: string[] = [];
    let highestRiskLevel: RiskLevel = 'none';

    // Check patterns from most severe to least
    const riskLevels: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

    for (const level of riskLevels) {
      for (const pattern of CRISIS_PATTERNS[level]) {
        const matches = fullText.match(pattern);
        if (matches) {
          triggers.push(...matches);
          if (getRiskPriority(level) > getRiskPriority(highestRiskLevel)) {
            highestRiskLevel = level;
          }
        }
      }
    }

    const result: CrisisDetectionResult = {
      isCrisis: highestRiskLevel === 'critical' || highestRiskLevel === 'high',
      riskLevel: highestRiskLevel,
      triggers: [...new Set(triggers)], // Remove duplicates
      recommendedAction: RECOMMENDED_ACTIONS[highestRiskLevel],
      resources: highestRiskLevel !== 'none' ? CRISIS_RESOURCES : [],
      shouldPauseSession: highestRiskLevel === 'critical',
    };

    // Log crisis events to database if detected
    if (result.isCrisis && sessionId) {
      try {
        // Check if there's an active AI therapy session to link
        const aiSession = await prisma.aITherapySession.findFirst({
          where: {
            userId: user.id,
            status: 'active',
          },
          orderBy: {
            startedAt: 'desc',
          },
        });

        if (aiSession) {
          await prisma.crisisEvent.create({
            data: {
              sessionId: aiSession.id,
              triggerPhrase: triggers.join(', '),
              riskLevel: highestRiskLevel,
              category: getCrisisCategory(triggers),
              actionTaken: result.shouldPauseSession ? 'session_paused' : 'helpline_displayed',
            },
          });
        }
      } catch (dbError) {
        console.error('Failed to log crisis event:', dbError);
        // Continue - don't fail the response due to logging error
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Crisis detection error:', error);
    return NextResponse.json(
      { error: 'Failed to detect crisis' },
      { status: 500 }
    );
  }
}

function getRiskPriority(level: RiskLevel): number {
  const priorities: Record<RiskLevel, number> = {
    none: 0,
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  return priorities[level];
}

function getCrisisCategory(triggers: string[]): string {
  const triggerText = triggers.join(' ').toLowerCase();

  if (/suicide|kill|die|death|end.*life/i.test(triggerText)) {
    return 'suicidal_ideation';
  }
  if (/hurt|harm|cut|punish/i.test(triggerText)) {
    return 'self_harm';
  }
  if (/panic|can't breathe|heart/i.test(triggerText)) {
    return 'panic_attack';
  }

  return 'severe_distress';
}
