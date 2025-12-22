import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getModel } from '@/lib/vertex';
import { getPersonaById, generateAIResponsePrompt, CRISIS_KEYWORDS } from '@/lib/ai-therapy-personas';

// Crisis detection function
function detectCrisis(text: string): { isCrisis: boolean; level: string; triggers: string[] } {
  const lowerText = text.toLowerCase();
  const triggers: string[] = [];
  let level = 'none';

  for (const keyword of CRISIS_KEYWORDS.critical) {
    if (lowerText.includes(keyword)) {
      triggers.push(keyword);
      level = 'critical';
    }
  }

  if (level !== 'critical') {
    for (const keyword of CRISIS_KEYWORDS.high) {
      if (lowerText.includes(keyword)) {
        triggers.push(keyword);
        level = 'high';
      }
    }
  }

  if (level === 'none') {
    for (const keyword of CRISIS_KEYWORDS.medium) {
      if (lowerText.includes(keyword)) {
        triggers.push(keyword);
        level = 'medium';
      }
    }
  }

  return {
    isCrisis: level === 'critical' || level === 'high',
    level,
    triggers,
  };
}

// POST /api/ai-therapy/message - Process user message and get AI response
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, content, timestamp } = await req.json();

    if (!sessionId || !content) {
      return NextResponse.json({ error: 'sessionId and content are required' }, { status: 400 });
    }

    // Get session
    const session = await prisma.aITherapySession.findFirst({
      where: { id: sessionId, userId: user.id, status: 'active' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20, // Last 20 messages for context
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Active session not found' }, { status: 404 });
    }

    const persona = getPersonaById(session.personaType);
    if (!persona) {
      return NextResponse.json({ error: 'Invalid persona' }, { status: 500 });
    }

    // Check for crisis content
    const crisisCheck = detectCrisis(content);

    if (crisisCheck.isCrisis) {
      // Log crisis event
      await prisma.crisisEvent.create({
        data: {
          sessionId,
          triggerPhrase: crisisCheck.triggers.join(', '),
          riskLevel: crisisCheck.level,
          actionTaken: 'helpline_displayed',
        },
      });
    }

    // Save user message
    const userMessage = await prisma.aITherapyMessage.create({
      data: {
        sessionId,
        role: 'user',
        content,
        timestamp: timestamp || 0,
      },
    });

    // Build conversation history
    const conversationHistory = session.messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Therapist'}: ${m.content}`)
      .join('\n');

    // Determine current emotional state based on recent messages
    let currentEmotion = 'neutral';
    if (session.messages.length > 0) {
      const lastUserMessages = session.messages.filter(m => m.role === 'user').slice(-3);
      if (lastUserMessages.some(m => m.sentiment)) {
        currentEmotion = lastUserMessages[lastUserMessages.length - 1]?.sentiment || 'neutral';
      }
    }

    // Generate AI response
    const model = getModel();
    const prompt = generateAIResponsePrompt(persona, conversationHistory, currentEmotion, content);

    let aiResponseText = '';

    try {
      const result = await model.generateContent(prompt);
      aiResponseText = result.response.text().trim();

      // Clean up any markdown or special characters
      aiResponseText = aiResponseText
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#{1,6}\s/g, '')
        .replace(/`/g, '');
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      aiResponseText = "I hear you, and I want to help. Could you tell me more about what you're experiencing?";
    }

    // If crisis detected, append safety message
    if (crisisCheck.level === 'critical') {
      aiResponseText += "\n\nI want you to know that I care about your safety. If you're having thoughts of suicide or self-harm, please reach out to the 988 Suicide and Crisis Lifeline by calling or texting 988. You're not alone in this.";
    }

    // Save AI response
    const aiMessage = await prisma.aITherapyMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: aiResponseText,
        timestamp: (timestamp || 0) + 1,
      },
    });

    // Update user message with sentiment (simple detection)
    const sentimentKeywords = {
      anxious: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'fear'],
      sad: ['sad', 'depressed', 'down', 'hopeless', 'lonely', 'unhappy'],
      angry: ['angry', 'frustrated', 'mad', 'annoyed', 'irritated'],
      happy: ['happy', 'good', 'great', 'excited', 'grateful', 'thankful'],
      calm: ['calm', 'peaceful', 'relaxed', 'content'],
    };

    let detectedSentiment = 'neutral';
    const lowerContent = content.toLowerCase();

    for (const [sentiment, keywords] of Object.entries(sentimentKeywords)) {
      if (keywords.some(k => lowerContent.includes(k))) {
        detectedSentiment = sentiment;
        break;
      }
    }

    await prisma.aITherapyMessage.update({
      where: { id: userMessage.id },
      data: { sentiment: detectedSentiment },
    });

    return NextResponse.json({
      userMessage,
      aiMessage,
      aiResponse: aiResponseText,
      voiceId: persona.voiceId,
      crisisDetected: crisisCheck.isCrisis,
      crisisLevel: crisisCheck.level,
    });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
