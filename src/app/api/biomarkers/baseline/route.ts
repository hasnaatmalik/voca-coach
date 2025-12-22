import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/biomarkers/baseline - Get user's current baseline
export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseline = await prisma.biomarkerBaseline.findFirst({
      where: { userId: authUser.userId },
      orderBy: { calculatedAt: 'desc' },
    });

    if (!baseline) {
      return NextResponse.json({
        baseline: null,
        message: 'No baseline established yet. Record at least 7 voice samples to calculate your baseline.',
      });
    }

    return NextResponse.json({ baseline });
  } catch (error) {
    console.error('Get baseline error:', error);
    return NextResponse.json({ error: 'Failed to fetch baseline' }, { status: 500 });
  }
}

// POST /api/biomarkers/baseline - Calculate and store new baseline
export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { days = 30 } = await req.json().catch(() => ({}));

    // Fetch biomarkers for baseline calculation
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const biomarkers = await prisma.biomarker.findMany({
      where: {
        userId: authUser.userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    if (biomarkers.length < 7) {
      return NextResponse.json({
        error: `Need at least 7 recordings to calculate baseline. You have ${biomarkers.length}.`,
        recordingsNeeded: 7 - biomarkers.length,
      }, { status: 400 });
    }

    // Calculate statistics for each metric
    const metrics = ['pitch', 'clarity', 'stress', 'pauseDuration', 'articulationRate', 'jitter', 'shimmer', 'speechRate', 'hnr'] as const;

    const stats: Record<string, { mean: number; stdDev: number }> = {};

    metrics.forEach(metric => {
      const values = biomarkers
        .map(b => b[metric])
        .filter((v): v is number => v !== null && v !== undefined);

      if (values.length > 0) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        stats[metric] = {
          mean: Math.round(mean * 100) / 100,
          stdDev: Math.round(Math.sqrt(variance) * 100) / 100,
        };
      }
    });

    // Create or update baseline
    const baseline = await prisma.biomarkerBaseline.create({
      data: {
        userId: authUser.userId,
        pitch: stats.pitch?.mean ?? 0,
        pitchStdDev: stats.pitch?.stdDev ?? null,
        clarity: stats.clarity?.mean ?? 0,
        clarityStdDev: stats.clarity?.stdDev ?? null,
        stress: stats.stress?.mean ?? 0,
        stressStdDev: stats.stress?.stdDev ?? null,
        pauseDuration: stats.pauseDuration?.mean ?? null,
        articulationRate: stats.articulationRate?.mean ?? null,
        jitter: stats.jitter?.mean ?? null,
        shimmer: stats.shimmer?.mean ?? null,
        speechRate: stats.speechRate?.mean ?? null,
        hnr: stats.hnr?.mean ?? null,
        recordingCount: biomarkers.length,
      },
    });

    // Optionally clean up old baselines (keep only last 5)
    const oldBaselines = await prisma.biomarkerBaseline.findMany({
      where: { userId: authUser.userId },
      orderBy: { calculatedAt: 'desc' },
      skip: 5,
    });

    if (oldBaselines.length > 0) {
      await prisma.biomarkerBaseline.deleteMany({
        where: {
          id: { in: oldBaselines.map(b => b.id) },
        },
      });
    }

    return NextResponse.json({
      baseline,
      message: `Baseline calculated from ${biomarkers.length} recordings.`,
    });
  } catch (error) {
    console.error('Calculate baseline error:', error);
    return NextResponse.json({ error: 'Failed to calculate baseline' }, { status: 500 });
  }
}

// DELETE /api/biomarkers/baseline - Delete baseline history
export async function DELETE(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const keepLatest = url.searchParams.get('keepLatest') === 'true';

    if (keepLatest) {
      // Keep the latest baseline, delete others
      const latest = await prisma.biomarkerBaseline.findFirst({
        where: { userId: authUser.userId },
        orderBy: { calculatedAt: 'desc' },
      });

      if (latest) {
        await prisma.biomarkerBaseline.deleteMany({
          where: {
            userId: authUser.userId,
            id: { not: latest.id },
          },
        });
      }
    } else {
      // Delete all baselines
      await prisma.biomarkerBaseline.deleteMany({
        where: { userId: authUser.userId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete baseline error:', error);
    return NextResponse.json({ error: 'Failed to delete baseline' }, { status: 500 });
  }
}
