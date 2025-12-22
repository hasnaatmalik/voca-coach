import { NextResponse } from 'next/server';
import { getModel } from '@/lib/vertex';
import { getCurrentUser } from '@/lib/auth';
import { COGNITIVE_DISTORTIONS } from '@/lib/journal-utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Distortion {
  type: string;
  confidence: number;
  excerpt: string;
}

interface InsightResponse {
  distortions: Distortion[];
  socraticPrompt: string;
  followUpQuestions: string[];
  moodIndicators: {
    detected: string;
    intensity: number;
  };
  crisisDetected: boolean;
  crisisLevel?: 'low' | 'medium' | 'high';
  suggestedResources?: string[];
  reframingSuggestion?: string;
}

// Crisis keywords used for detection (referenced in detectCrisis function)
const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
  'self-harm', 'hurt myself', 'cutting', 'not worth living',
  'no point in living', 'better off dead', 'can\'t go on',
] as const;
void CRISIS_KEYWORDS; // Exported for reference

const CRISIS_RESOURCES = [
  '988 Suicide & Crisis Lifeline: Call or text 988',
  'Crisis Text Line: Text HOME to 741741',
  'International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/',
];

function detectCrisis(message: string): { detected: boolean; level: 'low' | 'medium' | 'high' } {
  const lowerMessage = message.toLowerCase();

  const highRiskTerms = ['suicide', 'suicidal', 'kill myself', 'end my life', 'want to die'];
  const mediumRiskTerms = ['self-harm', 'hurt myself', 'cutting', 'not worth living'];
  const lowRiskTerms = ['no point', 'hopeless', 'can\'t go on', 'give up'];

  for (const term of highRiskTerms) {
    if (lowerMessage.includes(term)) {
      return { detected: true, level: 'high' };
    }
  }

  for (const term of mediumRiskTerms) {
    if (lowerMessage.includes(term)) {
      return { detected: true, level: 'medium' };
    }
  }

  for (const term of lowRiskTerms) {
    if (lowerMessage.includes(term)) {
      return { detected: true, level: 'low' };
    }
  }

  return { detected: false, level: 'low' };
}

export async function POST(req: Request) {
  try {
    // Verify authentication
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, context = [], mode = 'chat' } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check for crisis keywords
    const crisisCheck = detectCrisis(message);

    // Build context for the AI
    const conversationHistory = context
      .slice(-6)
      .map((m: Message) => `${m.role === 'user' ? 'User' : 'Therapist'}: ${m.content}`)
      .join('\n');

    const model = getModel('gemini-2.0-flash-exp');

    // Different prompts based on mode
    let systemPrompt = '';

    if (mode === 'gratitude') {
      systemPrompt = `
        You are a compassionate gratitude coach. Help the user explore their gratitude more deeply.
        - Ask meaningful follow-up questions about their gratitude items
        - Help them connect gratitude to their values and goals
        - Encourage specific, detailed appreciation
        - Keep responses warm and encouraging
      `;
    } else if (mode === 'cbt') {
      systemPrompt = `
        You are an expert CBT therapist guiding a thought record exercise.
        - Help identify automatic thoughts clearly
        - Guide them to examine evidence for and against
        - Suggest balanced, realistic alternative thoughts
        - Be supportive while gently challenging distortions
      `;
    } else {
      systemPrompt = `
        You are an expert CBT (Cognitive Behavioral Therapy) therapist with a compassionate, supportive approach.
        Your role is to:
        1. First validate the user's emotions - make them feel heard
        2. Identify cognitive distortions if present (be specific with evidence)
        3. Ask thought-provoking Socratic questions to help them reframe
        4. Provide gentle guidance without being preachy

        Important guidelines:
        - Match the user's emotional tone
        - Don't rush to fix - sometimes just listening is enough
        - Use "I notice..." or "I wonder..." instead of direct challenges
        - Keep responses conversational and warm
      `;
    }

    const prompt = `
      ${systemPrompt}

      ${crisisCheck.detected ? `
        IMPORTANT: The user may be in distress. Respond with extra care and compassion.
        Prioritize their safety and emotional wellbeing.
        If crisis level is high, gently acknowledge their pain and remind them that support is available.
      ` : ''}

      Previous conversation:
      ${conversationHistory || 'No previous context'}

      Current user message: "${message}"

      Analyze and respond in JSON format:
      {
        "distortions": [
          {
            "type": "Name of cognitive distortion (from: ${COGNITIVE_DISTORTIONS.join(', ')})",
            "confidence": 0.0 to 1.0,
            "excerpt": "specific part of message showing distortion"
          }
        ],
        "socraticPrompt": "Your main therapeutic response - a compassionate question or reflection",
        "followUpQuestions": ["Optional additional questions for deeper exploration"],
        "moodIndicators": {
          "detected": "primary emotion (e.g., anxious, sad, frustrated, hopeful)",
          "intensity": 0.0 to 1.0
        },
        "reframingSuggestion": "If distortions detected, suggest a balanced alternative perspective"
      }

      Rules:
      - distortions array can be empty if none detected (that's okay!)
      - socraticPrompt should be your main response - warm, validating, and thoughtful
      - followUpQuestions should be 0-2 optional deeper questions
      - reframingSuggestion only if distortions are present
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const response = await result.response;
    const parsed = JSON.parse(response.text());

    // Build final response
    const insightResponse: InsightResponse = {
      distortions: parsed.distortions || [],
      socraticPrompt: parsed.socraticPrompt || "I hear you. Tell me more about what's on your mind.",
      followUpQuestions: parsed.followUpQuestions || [],
      moodIndicators: parsed.moodIndicators || { detected: 'neutral', intensity: 0.5 },
      crisisDetected: crisisCheck.detected,
      ...(crisisCheck.detected && {
        crisisLevel: crisisCheck.level,
        suggestedResources: CRISIS_RESOURCES,
      }),
      ...(parsed.reframingSuggestion && { reframingSuggestion: parsed.reframingSuggestion }),
    };

    // For backward compatibility, also include legacy fields
    const legacyResponse = {
      ...insightResponse,
      distortion: insightResponse.distortions.length > 0
        ? insightResponse.distortions[0].type
        : null,
    };

    return NextResponse.json(legacyResponse);
  } catch (error) {
    console.error('Journal Analysis Error:', error);
    return NextResponse.json({
      distortions: [],
      distortion: null,
      socraticPrompt: "I'm listening. Tell me more about that?",
      followUpQuestions: [],
      moodIndicators: { detected: 'neutral', intensity: 0.5 },
      crisisDetected: false,
    });
  }
}
