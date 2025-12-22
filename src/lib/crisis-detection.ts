// Comprehensive Crisis Detection Service
import { getModel } from './vertex';
import { CRISIS_HELPLINES } from './ai-therapy-personas';

export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface CrisisAnalysis {
  riskLevel: RiskLevel;
  confidence: number;
  triggerPhrases: string[];
  recommendedAction: string;
  shouldAlert: boolean;
  helplines: typeof CRISIS_HELPLINES;
}

export interface CrisisContext {
  recentMessages: string[];
  sessionDuration: number;
  previousCrisisEvents: number;
  moodProgression?: number[];
}

// Enhanced keywords with variations and context patterns
const ENHANCED_CRISIS_PATTERNS = {
  critical: [
    /\b(kill|end|take)\s*(my|own)?\s*(life|self)\b/i,
    /\bsuicide\b/i,
    /\bwant\s*to\s*die\b/i,
    /\bbetter\s*off\s*dead\b/i,
    /\bend\s*it\s*all\b/i,
    /\bnot\s*wake\s*up\b/i,
    /\bno\s*reason\s*to\s*live\b/i,
    /\beveryone.*better.*without\s*me\b/i,
    /\bdon't\s*want\s*to\s*be\s*here\b/i,
    /\bplanning\s*to.*hurt\s*(myself|myself)\b/i,
  ],
  high: [
    /\bhurt\s*(my)?self\b/i,
    /\bself[\s-]?harm\b/i,
    /\bcutting\b/i,
    /\bno\s*hope\b/i,
    /\bhopeless\b/i,
    /\bworthless\b/i,
    /\bcan'?t\s*go\s*on\b/i,
    /\bgive\s*up\s*(on life|everything)\b/i,
    /\bno\s*point\b/i,
    /\bburning\s*(my)?self\b/i,
    /\bstarving\s*(my)?self\b/i,
  ],
  medium: [
    /\bcan'?t\s*cope\b/i,
    /\bbreaking\s*down\b/i,
    /\bdesperate\b/i,
    /\boverwhelmed\b/i,
    /\bexhausted.*living\b/i,
    /\btoo\s*much\s*to\s*handle\b/i,
    /\bfalling\s*apart\b/i,
    /\bdrowning\b/i,
    /\bpanic\s*attacks?\b/i,
    /\bsevere\s*(anxiety|depression)\b/i,
  ],
  low: [
    /\bstruggling\b/i,
    /\banxious\b/i,
    /\bdepressed\b/i,
    /\bsad\b/i,
    /\blonely\b/i,
    /\bisolated\b/i,
    /\bstressed\b/i,
    /\bunhappy\b/i,
  ],
};

// Quick keyword-based risk assessment
export function quickRiskAssessment(text: string): { level: RiskLevel; matches: string[] } {
  const normalizedText = text.toLowerCase();
  const matches: string[] = [];

  // Check critical patterns first
  for (const pattern of ENHANCED_CRISIS_PATTERNS.critical) {
    const match = normalizedText.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  if (matches.length > 0) {
    return { level: 'critical', matches };
  }

  // Check high patterns
  for (const pattern of ENHANCED_CRISIS_PATTERNS.high) {
    const match = normalizedText.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  if (matches.length > 0) {
    return { level: 'high', matches };
  }

  // Check medium patterns
  for (const pattern of ENHANCED_CRISIS_PATTERNS.medium) {
    const match = normalizedText.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  if (matches.length > 0) {
    return { level: 'medium', matches };
  }

  // Check low patterns
  for (const pattern of ENHANCED_CRISIS_PATTERNS.low) {
    const match = normalizedText.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  if (matches.length > 0) {
    return { level: 'low', matches };
  }

  return { level: 'none', matches: [] };
}

// AI-powered deep crisis analysis
export async function deepCrisisAnalysis(
  message: string,
  context: CrisisContext
): Promise<CrisisAnalysis> {
  // First do quick assessment
  const quickAssessment = quickRiskAssessment(message);

  // If critical or high, return immediately
  if (quickAssessment.level === 'critical' || quickAssessment.level === 'high') {
    return {
      riskLevel: quickAssessment.level,
      confidence: 0.95,
      triggerPhrases: quickAssessment.matches,
      recommendedAction: getRecommendedAction(quickAssessment.level),
      shouldAlert: true,
      helplines: CRISIS_HELPLINES,
    };
  }

  // For medium or unclear cases, use AI for deeper analysis
  try {
    const model = getModel();

    const prompt = `Analyze this message for crisis indicators. Return a JSON object (no markdown):

MESSAGE: "${message}"

CONVERSATION CONTEXT:
- Recent messages: ${context.recentMessages.slice(-3).join(' | ') || 'None'}
- Session duration: ${context.sessionDuration} minutes
- Previous crisis events in session: ${context.previousCrisisEvents}

Analyze for:
1. Suicidal ideation (explicit or implicit)
2. Self-harm indicators
3. Severe distress or hopelessness
4. Safety concerns
5. Escalating distress patterns

Return ONLY this JSON structure:
{
  "riskLevel": "none" | "low" | "medium" | "high" | "critical",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "triggers": ["specific phrases or patterns detected"]
}`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const aiAnalysis = JSON.parse(responseText);

    // Combine with quick assessment (AI can upgrade but not downgrade from critical/high)
    const finalLevel = determineLevel(quickAssessment.level, aiAnalysis.riskLevel);

    return {
      riskLevel: finalLevel,
      confidence: aiAnalysis.confidence,
      triggerPhrases: [...quickAssessment.matches, ...(aiAnalysis.triggers || [])],
      recommendedAction: getRecommendedAction(finalLevel),
      shouldAlert: finalLevel === 'critical' || finalLevel === 'high',
      helplines: CRISIS_HELPLINES,
    };
  } catch (error) {
    console.error('AI crisis analysis failed:', error);
    // Fall back to quick assessment (only 'none', 'low', or 'medium' at this point)
    return {
      riskLevel: quickAssessment.level,
      confidence: 0.7,
      triggerPhrases: quickAssessment.matches,
      recommendedAction: getRecommendedAction(quickAssessment.level),
      shouldAlert: false, // Already handled critical/high cases above
      helplines: CRISIS_HELPLINES,
    };
  }
}

function determineLevel(quickLevel: RiskLevel, aiLevel: string): RiskLevel {
  const levels = ['none', 'low', 'medium', 'high', 'critical'] as RiskLevel[];
  const quickIndex = levels.indexOf(quickLevel);
  const aiIndex = levels.indexOf(aiLevel as RiskLevel);

  // Take the higher risk level
  return levels[Math.max(quickIndex, aiIndex)] || 'none';
}

function getRecommendedAction(level: RiskLevel): string {
  switch (level) {
    case 'critical':
      return 'IMMEDIATE: Display crisis resources prominently. Alert assigned therapist. Continue supportive dialogue. Do not end session abruptly.';
    case 'high':
      return 'Display crisis resources. Ask directly about safety. Notify therapist for follow-up. Offer to connect to crisis line.';
    case 'medium':
      return 'Monitor closely. Gently explore feelings. Have resources ready. Consider suggesting professional support.';
    case 'low':
      return 'Continue therapeutic conversation. Practice active listening. Monitor for escalation.';
    default:
      return 'Continue normal therapeutic dialogue.';
  }
}

// Generate crisis response for AI therapist
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateCrisisResponse(level: RiskLevel, personaStyle?: string): string {
  if (level === 'critical') {
    return `I'm really glad you're sharing this with me, and I want you to know I'm here with you right now. What you're feeling sounds incredibly painful. Your safety matters more than anything else. Have you had any thoughts of hurting yourself? I want to make sure we can get you the right support. The 988 Suicide and Crisis Lifeline is available 24/7 - you can call or text 988 anytime.`;
  }

  if (level === 'high') {
    return `I hear how much pain you're in right now, and I'm really concerned about your wellbeing. These feelings are serious, and you deserve support. Can you tell me more about what's going on? I also want to make sure you know that crisis support is available anytime at 988 if you need to talk to someone urgently.`;
  }

  if (level === 'medium') {
    return `It sounds like you're going through an incredibly difficult time. I want to understand more about what you're experiencing. You don't have to face this alone. How have you been coping with these feelings?`;
  }

  return '';
}

// Crisis event data for logging
export interface CrisisEventData {
  sessionId: string;
  triggerPhrase: string;
  riskLevel: RiskLevel;
  actionTaken: string;
  userId: string;
  timestamp: Date;
}

// Export helplines for use elsewhere
export { CRISIS_HELPLINES };
