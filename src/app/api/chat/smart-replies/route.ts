import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, lastMessage, isTherapist } = await req.json();

    if (!conversationId || !lastMessage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Get recent message history for context
    const recentMessages = await prisma.chatMessage.findMany({
      where: { conversationId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        content: true,
        senderId: true,
        type: true
      }
    });

    // Use AI to generate contextual replies
    if (GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const context = recentMessages
          .reverse()
          .map(m => `${m.senderId === conversation.studentId ? 'Student' : 'Therapist'}: ${m.content || '[voice/media message]'}`)
          .join('\n');

        const prompt = `You are helping generate smart reply suggestions for a mental health chat application.

The conversation is between a student and their therapist. You are generating replies for the ${isTherapist ? 'THERAPIST' : 'STUDENT'}.

Recent conversation:
${context}

Last message received: "${lastMessage}"

Generate exactly 3 short, contextual reply suggestions that the ${isTherapist ? 'therapist' : 'student'} might send. Each reply should be:
- Appropriate for a mental health support context
- Empathetic and supportive
- Brief (under 20 words)
- Natural and conversational

${isTherapist ? `
As a therapist, suggestions should:
- Use therapeutic communication techniques
- Be validating and empathetic
- Encourage the student to explore their feelings
- Avoid giving direct advice unless appropriate
` : `
As a student, suggestions should:
- Express how they're feeling
- Ask for clarification or support
- Show engagement with the conversation
- Be honest about their emotional state
`}

Return ONLY a JSON array with exactly 3 objects, each having:
- "text": the reply text
- "emoji": a single emoji that fits the tone
- "category": one of "validation", "exploration", "emotional", "gratitude", "uncertainty", "positive"

Example format:
[{"text": "That's really helpful to hear.", "emoji": "💙", "category": "positive"}]`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Parse JSON response
        const jsonStr = responseText.replace(/```json\n?|\n?```/g, '').trim();
        const replies = JSON.parse(jsonStr);

        if (Array.isArray(replies) && replies.length > 0) {
          return NextResponse.json({ replies: replies.slice(0, 3) });
        }
      } catch (error) {
        console.error('AI reply generation failed:', error);
      }
    }

    // Fallback to default replies
    const defaultReplies = isTherapist
      ? [
          { text: "Tell me more about that.", emoji: "💭", category: "exploration" },
          { text: "How does that make you feel?", emoji: "❤️", category: "emotional" },
          { text: "That sounds challenging.", emoji: "🤝", category: "validation" }
        ]
      : [
          { text: "I appreciate you listening.", emoji: "🙏", category: "gratitude" },
          { text: "I'm not sure how to explain it.", emoji: "🤔", category: "uncertainty" },
          { text: "That's helpful, thank you.", emoji: "💙", category: "positive" }
        ];

    return NextResponse.json({ replies: defaultReplies });
  } catch (error) {
    console.error('Smart replies error:', error);
    return NextResponse.json({ error: 'Failed to generate replies' }, { status: 500 });
  }
}
