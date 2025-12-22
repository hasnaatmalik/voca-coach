import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getModel } from '@/lib/vertex';

// GET /api/therapy/summary?sessionId=xxx - Get session summary
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Get session with all related data
    const session = await prisma.therapySession.findFirst({
      where: {
        id: sessionId,
        OR: [
          { userId: user.id },
          { therapistId: user.id },
        ],
      },
      include: {
        user: { select: { id: true, name: true } },
        therapist: { select: { id: true, name: true } },
        preSessionData: true,
        postSessionSummary: true,
        recordings: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}

// POST /api/therapy/summary - Generate or create summary
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, action, moodAfter, rating, feedbackText, feedbackCategories } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Verify session access
    const session = await prisma.therapySession.findFirst({
      where: {
        id: sessionId,
        OR: [
          { userId: user.id },
          { therapistId: user.id },
        ],
      },
      include: {
        preSessionData: true,
        postSessionSummary: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Generate AI summary
    if (action === 'generate') {
      try {
        const model = getModel();

        const prompt = `Generate a therapy session summary. Return a JSON object (no markdown, just JSON):
{
  "aiHighlights": ["key highlight 1", "key highlight 2", "key highlight 3"],
  "keyTopics": ["topic 1", "topic 2"],
  "homework": ["suggested action 1", "suggested action 2"]
}

Session context:
- Duration: ${session.duration} minutes
- Pre-session mood: ${session.preSessionData?.moodRating || 'Not recorded'}/10
- Pre-session concerns: ${session.preSessionData?.concernText || 'Not specified'}
- Pre-session goals: ${session.preSessionData?.sessionGoals || 'Not specified'}
- Therapist notes: ${session.notes || 'None'}

Generate supportive, actionable insights based on this therapy session.`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();

        // Clean up response
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        let parsedResponse;
        try {
          parsedResponse = JSON.parse(responseText);
        } catch {
          parsedResponse = {
            aiHighlights: ['Session completed successfully'],
            keyTopics: ['Personal growth', 'Emotional wellness'],
            homework: ['Practice self-care', 'Reflect on today\'s discussion'],
          };
        }

        // Create or update summary
        const summary = await prisma.postSessionSummary.upsert({
          where: { sessionId },
          update: {
            aiHighlights: JSON.stringify(parsedResponse.aiHighlights),
            keyTopics: JSON.stringify(parsedResponse.keyTopics),
            homework: JSON.stringify(parsedResponse.homework),
            moodBefore: session.preSessionData?.moodRating,
          },
          create: {
            sessionId,
            aiHighlights: JSON.stringify(parsedResponse.aiHighlights),
            keyTopics: JSON.stringify(parsedResponse.keyTopics),
            homework: JSON.stringify(parsedResponse.homework),
            moodBefore: session.preSessionData?.moodRating,
          },
        });

        return NextResponse.json({ summary });
      } catch (aiError) {
        console.error('AI generation error:', aiError);
        return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
      }
    }

    // Save feedback
    if (action === 'feedback') {
      const summary = await prisma.postSessionSummary.upsert({
        where: { sessionId },
        update: {
          moodAfter,
          rating,
          feedbackText,
          feedbackCategories: feedbackCategories ? JSON.stringify(feedbackCategories) : undefined,
        },
        create: {
          sessionId,
          moodAfter,
          rating,
          feedbackText,
          feedbackCategories: feedbackCategories ? JSON.stringify(feedbackCategories) : undefined,
          moodBefore: session.preSessionData?.moodRating,
        },
      });

      return NextResponse.json({ summary });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing summary:', error);
    return NextResponse.json({ error: 'Failed to process summary' }, { status: 500 });
  }
}
