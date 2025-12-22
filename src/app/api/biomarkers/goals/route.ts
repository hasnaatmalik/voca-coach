import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { BIOMARKER_METRICS, getSuggestedGoals } from '@/lib/biomarker-utils';

// GET /api/biomarkers/goals - Get user's biomarker goals
export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goals = await prisma.biomarkerGoal.findMany({
      where: { userId: authUser.userId },
    });

    // Transform to a map for easier consumption
    const goalsMap: Record<string, { target: number; direction: string }> = {};
    goals.forEach(g => {
      goalsMap[g.metric] = { target: g.target, direction: g.direction };
    });

    return NextResponse.json({ goals: goalsMap });
  } catch (error) {
    console.error('Get goals error:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

// POST /api/biomarkers/goals - Create or update goals
export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { goals } = await req.json();

    if (!goals || typeof goals !== 'object') {
      return NextResponse.json({ error: 'Invalid goals data' }, { status: 400 });
    }

    // Validate and upsert each goal
    const results = [];
    for (const [metric, data] of Object.entries(goals)) {
      if (!BIOMARKER_METRICS[metric]) {
        continue; // Skip invalid metrics
      }

      const { target, direction } = data as { target: number; direction: string };

      if (typeof target !== 'number') {
        continue;
      }

      const goal = await prisma.biomarkerGoal.upsert({
        where: {
          userId_metric: {
            userId: authUser.userId,
            metric,
          },
        },
        update: {
          target,
          direction: direction || 'maintain',
        },
        create: {
          userId: authUser.userId,
          metric,
          target,
          direction: direction || 'maintain',
        },
      });

      results.push(goal);
    }

    return NextResponse.json({ goals: results });
  } catch (error) {
    console.error('Update goals error:', error);
    return NextResponse.json({ error: 'Failed to update goals' }, { status: 500 });
  }
}

// DELETE /api/biomarkers/goals - Delete a goal
export async function DELETE(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const metric = url.searchParams.get('metric');

    if (!metric) {
      return NextResponse.json({ error: 'Metric parameter required' }, { status: 400 });
    }

    await prisma.biomarkerGoal.deleteMany({
      where: {
        userId: authUser.userId,
        metric,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete goal error:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}

// PUT /api/biomarkers/goals/suggested - Get AI-suggested goals based on baseline
export async function PUT() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's baseline or calculate from recent data
    let baseline = await prisma.biomarkerBaseline.findFirst({
      where: { userId: authUser.userId },
      orderBy: { calculatedAt: 'desc' },
    });

    if (!baseline) {
      // Calculate baseline from recent biomarkers
      const recentBiomarkers = await prisma.biomarker.findMany({
        where: { userId: authUser.userId },
        orderBy: { date: 'desc' },
        take: 10,
      });

      if (recentBiomarkers.length < 3) {
        return NextResponse.json({
          error: 'Not enough data to suggest goals. Record at least 3 voice samples first.',
        }, { status: 400 });
      }

      // Calculate averages
      const avgBaseline: Record<string, number> = {};
      const metrics = ['pitch', 'clarity', 'stress', 'pauseDuration', 'articulationRate', 'jitter', 'shimmer', 'speechRate', 'hnr'] as const;

      metrics.forEach(metric => {
        const values = recentBiomarkers
          .map(b => b[metric])
          .filter((v): v is number => v !== null && v !== undefined);
        if (values.length > 0) {
          avgBaseline[metric] = values.reduce((a, b) => a + b, 0) / values.length;
        }
      });

      // Generate suggested goals
      const suggestions = getSuggestedGoals(avgBaseline);
      return NextResponse.json({ suggestions, basedOn: 'recent_data' });
    }

    // Use existing baseline for suggestions
    const baselineValues: Record<string, number> = {
      pitch: baseline.pitch,
      clarity: baseline.clarity,
      stress: baseline.stress,
    };

    if (baseline.pauseDuration) baselineValues.pauseDuration = baseline.pauseDuration;
    if (baseline.articulationRate) baselineValues.articulationRate = baseline.articulationRate;
    if (baseline.jitter) baselineValues.jitter = baseline.jitter;
    if (baseline.shimmer) baselineValues.shimmer = baseline.shimmer;
    if (baseline.speechRate) baselineValues.speechRate = baseline.speechRate;
    if (baseline.hnr) baselineValues.hnr = baseline.hnr;

    const suggestions = getSuggestedGoals(baselineValues);
    return NextResponse.json({ suggestions, basedOn: 'baseline' });
  } catch (error) {
    console.error('Get suggested goals error:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
