import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/sessions - Get user's sessions
export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.session.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        sentiments: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// POST /api/sessions - Create a new session
export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { duration, calmScore, notes, sentiments } = await req.json();

    if (typeof duration !== 'number' || typeof calmScore !== 'number') {
      return NextResponse.json(
        { error: 'Duration and calmScore are required' },
        { status: 400 }
      );
    }

    // Calculate sentiment-based metrics if sentiments are provided
    let dominantMood = null;
    let moodChanges = null;
    let emotionalScore = null;

    if (sentiments && Array.isArray(sentiments) && sentiments.length > 0) {
      // Calculate dominant mood (most frequent sentiment)
      const moodCounts: { [key: string]: number } = {};
      sentiments.forEach((s: any) => {
        moodCounts[s.sentiment] = (moodCounts[s.sentiment] || 0) + 1;
      });
      dominantMood = Object.keys(moodCounts).reduce((a, b) =>
        moodCounts[a] > moodCounts[b] ? a : b
      );

      // Count mood changes (when sentiment changes from one snapshot to next)
      moodChanges = 0;
      for (let i = 1; i < sentiments.length; i++) {
        if (sentiments[i].sentiment !== sentiments[i - 1].sentiment) {
          moodChanges++;
        }
      }

      // Calculate emotional score (average intensity of positive emotions)
      const avgIntensity = sentiments.reduce((sum: number, s: any) => {
        const emotions = typeof s.emotions === 'string' ? JSON.parse(s.emotions) : s.emotions;
        const positiveScore = (emotions.happy || 0) + (emotions.calm || 0);
        return sum + positiveScore;
      }, 0) / sentiments.length;
      emotionalScore = Math.round(avgIntensity * 100);
    }

    const session = await prisma.session.create({
      data: {
        userId: authUser.userId,
        duration,
        calmScore,
        notes: notes || null,
        dominantMood,
        moodChanges,
        emotionalScore,
        sentiments: sentiments ? {
          create: sentiments.map((s: any) => ({
            timestamp: s.timestamp,
            sentiment: s.sentiment,
            intensity: s.intensity,
            emotions: typeof s.emotions === 'string' ? s.emotions : JSON.stringify(s.emotions),
            aiInsight: s.aiInsight
          }))
        } : undefined
      }
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
