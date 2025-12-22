import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { quickRiskAssessment, deepCrisisAnalysis, CRISIS_HELPLINES, RiskLevel } from '@/lib/crisis-detection';

// POST /api/ai-therapy/crisis - Analyze message for crisis indicators
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, sessionId, useDeepAnalysis } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Quick assessment first (fast)
    const quickResult = quickRiskAssessment(message);

    // If critical/high or deep analysis requested
    if (
      quickResult.level === 'critical' ||
      quickResult.level === 'high' ||
      useDeepAnalysis
    ) {
      // Get context if session provided
      let context = {
        recentMessages: [] as string[],
        sessionDuration: 0,
        previousCrisisEvents: 0,
      };

      if (sessionId) {
        // Get session context
        const session = await prisma.aITherapySession.findUnique({
          where: { id: sessionId },
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 5,
              select: { content: true },
            },
            crisisEvents: true,
          },
        });

        if (session) {
          context = {
            recentMessages: session.messages.map((m) => m.content).reverse(),
            sessionDuration: session.durationSeconds
              ? Math.floor(session.durationSeconds / 60)
              : Math.floor((Date.now() - session.startedAt.getTime()) / 60000),
            previousCrisisEvents: session.crisisEvents.length,
          };
        }
      }

      // Deep AI analysis
      const deepResult = await deepCrisisAnalysis(message, context);

      // Log crisis event if significant
      if (
        sessionId &&
        (deepResult.riskLevel === 'critical' || deepResult.riskLevel === 'high')
      ) {
        await logCrisisEvent(
          sessionId,
          deepResult.triggerPhrases.join(', '),
          deepResult.riskLevel,
          deepResult.recommendedAction
        );

        // Create notification for any assigned therapist
        await notifyTherapistIfAssigned(user.id, deepResult.riskLevel);
      }

      return NextResponse.json({
        analysis: deepResult,
        requiresIntervention:
          deepResult.riskLevel === 'critical' || deepResult.riskLevel === 'high',
      });
    }

    // Return quick assessment for low/medium/none
    return NextResponse.json({
      analysis: {
        riskLevel: quickResult.level,
        confidence: 0.85,
        triggerPhrases: quickResult.matches,
        recommendedAction:
          quickResult.level === 'medium'
            ? 'Monitor closely and have crisis resources ready'
            : 'Continue normal therapeutic dialogue',
        shouldAlert: false,
        helplines: quickResult.level === 'medium' ? CRISIS_HELPLINES : [],
      },
      requiresIntervention: false,
    });
  } catch (error) {
    console.error('Crisis analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze message' }, { status: 500 });
  }
}

// GET /api/ai-therapy/crisis?sessionId=xxx - Get crisis events for session
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

    // Verify session access
    const session = await prisma.aITherapySession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const events = await prisma.crisisEvent.findMany({
      where: { sessionId },
      orderBy: { detectedAt: 'desc' },
    });

    return NextResponse.json({ events, helplines: CRISIS_HELPLINES });
  } catch (error) {
    console.error('Error fetching crisis events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

async function logCrisisEvent(
  sessionId: string,
  triggerPhrase: string,
  riskLevel: RiskLevel,
  actionTaken: string
) {
  try {
    await prisma.crisisEvent.create({
      data: {
        sessionId,
        triggerPhrase,
        riskLevel,
        actionTaken,
        resolved: false,
      },
    });
  } catch (error) {
    console.error('Failed to log crisis event:', error);
  }
}

async function notifyTherapistIfAssigned(userId: string, riskLevel: RiskLevel) {
  try {
    // Check if user has any upcoming sessions with a therapist
    const upcomingSession = await prisma.therapySession.findFirst({
      where: {
        userId,
        status: { in: ['scheduled', 'confirmed'] },
        scheduledAt: {
          gte: new Date(),
        },
      },
      include: {
        therapist: true,
        user: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });

    if (upcomingSession) {
      // Create notification for therapist
      await prisma.notification.create({
        data: {
          userId: upcomingSession.therapistId,
          type: 'crisis_alert',
          title: 'Crisis Alert',
          message: `${riskLevel.toUpperCase()} risk detected for client ${upcomingSession.user.name}. Review recommended before next session.`,
          data: JSON.stringify({
            clientId: userId,
            clientName: upcomingSession.user.name,
            riskLevel,
            sessionId: upcomingSession.id,
          }),
        },
      });
    }
  } catch (error) {
    console.error('Failed to notify therapist:', error);
  }
}
