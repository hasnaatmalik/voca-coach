import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// POST - Analyze message sentiment and mood
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, text, includeVoiceBiomarkers } = await req.json();

    if (!messageId && !text) {
      return NextResponse.json({ error: 'Message ID or text required' }, { status: 400 });
    }

    let messageText = text;
    let voiceBiomarkers = null;
    let message = null;

    // If messageId provided, get the message
    if (messageId) {
      message = await prisma.chatMessage.findUnique({
        where: { id: messageId },
        include: { conversation: true }
      });

      if (!message) {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 });
      }

      // Verify user is part of conversation
      if (message.conversation.studentId !== currentUser.userId &&
          message.conversation.therapistId !== currentUser.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      messageText = message.content || message.transcript || '';

      if (includeVoiceBiomarkers && message.biomarkers) {
        voiceBiomarkers = JSON.parse(message.biomarkers);
      }
    }

    if (!messageText) {
      return NextResponse.json({ error: 'No text content to analyze' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Analyze sentiment with Gemini
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Analyze the emotional content of this message from a mental health support chat.

Message: "${messageText}"

${voiceBiomarkers ? `
Voice biomarkers data (if available):
- Stress score: ${voiceBiomarkers.overallStressScore}
- Speaking rate: ${voiceBiomarkers.speakingRate} WPM
- Pitch level: ${voiceBiomarkers.pitchLevel}
- Tremor detected: ${voiceBiomarkers.tremorDetected}
` : ''}

Return ONLY a JSON object with these fields:
{
  "moodScore": <number 1-10, where 1 is very negative and 10 is very positive>,
  "primaryEmotion": "<string: one of 'happy', 'sad', 'anxious', 'angry', 'fearful', 'hopeful', 'neutral', 'confused', 'relieved', 'frustrated'>",
  "secondaryEmotions": [<array of up to 2 additional emotions from the same list>],
  "intensity": "<string: 'low', 'medium', 'high'>",
  "concerns": [<array of up to 3 short strings identifying any mental health concerns, or empty array>],
  "positiveIndicators": [<array of up to 3 short strings identifying positive signs, or empty array>],
  "suggestedApproach": "<string: brief suggestion for how to respond therapeutically>"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Parse JSON response
    let sentiment;
    try {
      const jsonStr = responseText.replace(/```json\n?|\n?```/g, '').trim();
      sentiment = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse sentiment:', responseText);
      sentiment = {
        moodScore: 5,
        primaryEmotion: 'neutral',
        secondaryEmotions: [],
        intensity: 'medium',
        concerns: [],
        positiveIndicators: [],
        suggestedApproach: 'Continue with empathetic listening'
      };
    }

    // Validate and normalize
    sentiment.moodScore = Math.max(1, Math.min(10, sentiment.moodScore || 5));

    // If we have a message, update it with sentiment data
    if (message && messageId) {
      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { sentiment: JSON.stringify(sentiment) }
      });
    }

    return NextResponse.json({
      success: true,
      sentiment,
      voiceBiomarkers
    });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

// GET - Get conversation mood summary
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    // Verify user is part of conversation
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.studentId !== currentUser.userId &&
        conversation.therapistId !== currentUser.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get recent messages with sentiment data
    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId,
        isDeleted: false,
        sentiment: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        sentiment: true,
        createdAt: true,
        senderId: true
      }
    });

    // Calculate mood progression
    const studentMessages = messages
      .filter(m => m.senderId === conversation.studentId)
      .map(m => ({
        timestamp: m.createdAt,
        sentiment: m.sentiment ? JSON.parse(m.sentiment) : null
      }))
      .filter(m => m.sentiment)
      .reverse();

    const moodProgression = studentMessages.map(m => ({
      timestamp: m.timestamp,
      moodScore: m.sentiment.moodScore,
      primaryEmotion: m.sentiment.primaryEmotion
    }));

    // Calculate averages
    const avgMood = studentMessages.length > 0
      ? studentMessages.reduce((sum, m) => sum + m.sentiment.moodScore, 0) / studentMessages.length
      : 5;

    // Get emotion frequency
    const emotionCounts: Record<string, number> = {};
    studentMessages.forEach(m => {
      const emotion = m.sentiment.primaryEmotion;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    return NextResponse.json({
      moodProgression,
      averageMood: Math.round(avgMood * 10) / 10,
      emotionFrequency: emotionCounts,
      totalAnalyzed: studentMessages.length
    });
  } catch (error) {
    console.error('Mood summary error:', error);
    return NextResponse.json({ error: 'Failed to get mood summary' }, { status: 500 });
  }
}
