import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getModel } from '@/lib/vertex';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

interface AnalysisResult {
  sentiment: {
    overall: string;
    userSentiment: string;
    progression: string[];
  };
  keyTopics: string[];
  communicationSkills: {
    strengths: string[];
    areasForImprovement: string[];
  };
  suggestions: string[];
  conversationQuality: number; // 1-10
}

// POST /api/persona-analytics - Analyze a conversation
export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, messages } = await req.json();

    // Either analyze by conversation ID or by provided messages
    let messagesToAnalyze: ConversationMessage[];

    if (conversationId) {
      const conversation = await prisma.personaConversation.findFirst({
        where: { id: conversationId, userId: authUser.userId }
      });

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      messagesToAnalyze = JSON.parse(conversation.messages);
    } else if (messages && Array.isArray(messages)) {
      messagesToAnalyze = messages;
    } else {
      return NextResponse.json(
        { error: 'Either conversationId or messages array is required' },
        { status: 400 }
      );
    }

    if (messagesToAnalyze.length < 2) {
      return NextResponse.json(
        { error: 'Conversation too short to analyze' },
        { status: 400 }
      );
    }

    // Format conversation for analysis
    const conversationText = messagesToAnalyze
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const model = getModel('gemini-2.0-flash-exp');

    const prompt = `Analyze this conversation and provide a structured analysis. Return ONLY valid JSON.

Conversation:
${conversationText}

Provide the following analysis in JSON format:
{
  "sentiment": {
    "overall": "positive/negative/neutral/mixed",
    "userSentiment": "description of user's emotional state throughout",
    "progression": ["sentiment at start", "sentiment in middle", "sentiment at end"]
  },
  "keyTopics": ["topic1", "topic2", "topic3"],
  "communicationSkills": {
    "strengths": ["strength1", "strength2"],
    "areasForImprovement": ["area1", "area2"]
  },
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "conversationQuality": 7
}

Focus on:
1. How well the user communicated
2. Key themes discussed
3. Emotional progression
4. Actionable suggestions for improvement`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis: AnalysisResult = JSON.parse(cleanText);

    // If we have a conversationId, save the summary
    if (conversationId) {
      const summaryText = `Topics: ${analysis.keyTopics.join(', ')}. ${analysis.sentiment.overall} conversation.`;
      await prisma.personaConversation.update({
        where: { id: conversationId },
        data: { summary: summaryText }
      });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to analyze conversation' }, { status: 500 });
  }
}

// GET /api/persona-analytics - Get aggregate analytics for user
export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all conversations for the user
    const conversations = await prisma.personaConversation.findMany({
      where: { userId: authUser.userId }
    });

    // Calculate aggregate statistics
    const totalConversations = conversations.length;

    // Group by persona
    const conversationsByPersona: Record<string, number> = {};
    let totalMessages = 0;

    conversations.forEach((conv) => {
      const key = conv.personaName || 'Unknown';
      conversationsByPersona[key] = (conversationsByPersona[key] || 0) + 1;

      const messages = JSON.parse(conv.messages) as ConversationMessage[];
      totalMessages += messages.length;
    });

    const avgMessagesPerConversation = totalConversations > 0
      ? Math.round(totalMessages / totalConversations)
      : 0;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentConversations = conversations.filter(
      (conv) => new Date(conv.createdAt) >= sevenDaysAgo
    );

    // Most active personas
    const sortedPersonas = Object.entries(conversationsByPersona)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return NextResponse.json({
      analytics: {
        totalConversations,
        totalMessages,
        avgMessagesPerConversation,
        recentConversationsCount: recentConversations.length,
        conversationsByPersona,
        topPersonas: sortedPersonas.map(([name, count]) => ({ name, count })),
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
