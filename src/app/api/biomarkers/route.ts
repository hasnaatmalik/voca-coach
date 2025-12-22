import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/biomarkers - Get user's biomarker history
export async function GET(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '7');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    let startDate: Date;
    let endDate: Date;

    if (startDateParam && endDateParam) {
      // Custom date range
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Days-based range
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
    }

    const biomarkers = await prisma.biomarker.findMany({
      where: {
        userId: authUser.userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    // Calculate summary statistics
    const stats = calculateStats(biomarkers);

    return NextResponse.json({
      biomarkers,
      stats,
      count: biomarkers.length,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get biomarkers error:', error);
    return NextResponse.json({ error: 'Failed to fetch biomarkers' }, { status: 500 });
  }
}

// POST /api/biomarkers - Store new biomarker reading
export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const {
      pitch,
      clarity,
      stress,
      pauseDuration,
      articulationRate,
      jitter,
      shimmer,
      speechRate,
      hnr,
      duration,
      audioUrl,
      prompt,
      notes,
      overallScore,
      observations,
      recommendations,
    } = data;

    if (typeof pitch !== 'number' || typeof clarity !== 'number' || typeof stress !== 'number') {
      return NextResponse.json(
        { error: 'Pitch, clarity, and stress are required' },
        { status: 400 }
      );
    }

    // Create new biomarker (allowing multiple per day)
    const biomarker = await prisma.biomarker.create({
      data: {
        userId: authUser.userId,
        date: new Date(),
        pitch,
        clarity,
        stress,
        pauseDuration: pauseDuration ?? null,
        articulationRate: articulationRate ?? null,
        jitter: jitter ?? null,
        shimmer: shimmer ?? null,
        speechRate: speechRate ?? null,
        hnr: hnr ?? null,
        duration: duration ?? null,
        audioUrl: audioUrl ?? null,
        prompt: prompt ?? null,
        notes: notes ?? null,
        overallScore: overallScore ?? null,
        observations: observations ? JSON.stringify(observations) : null,
        recommendations: recommendations ? JSON.stringify(recommendations) : null,
      },
    });

    // Check for alerts based on the new biomarker
    await checkAndCreateAlerts(authUser.userId, biomarker);

    return NextResponse.json({ biomarker });
  } catch (error) {
    console.error('Create biomarker error:', error);
    return NextResponse.json({ error: 'Failed to store biomarker' }, { status: 500 });
  }
}

// DELETE /api/biomarkers - Delete a biomarker by ID
export async function DELETE(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Biomarker ID required' }, { status: 400 });
    }

    // Verify ownership before deleting
    const biomarker = await prisma.biomarker.findFirst({
      where: {
        id,
        userId: authUser.userId,
      },
    });

    if (!biomarker) {
      return NextResponse.json({ error: 'Biomarker not found' }, { status: 404 });
    }

    await prisma.biomarker.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete biomarker error:', error);
    return NextResponse.json({ error: 'Failed to delete biomarker' }, { status: 500 });
  }
}

// Calculate summary statistics for a set of biomarkers
interface BiomarkerRecord {
  pitch: number;
  clarity: number;
  stress: number;
  pauseDuration?: number | null;
  articulationRate?: number | null;
  jitter?: number | null;
  shimmer?: number | null;
  speechRate?: number | null;
  hnr?: number | null;
  overallScore?: number | null;
}

function calculateStats(biomarkers: BiomarkerRecord[]) {
  if (biomarkers.length === 0) {
    return null;
  }

  const metrics = ['pitch', 'clarity', 'stress', 'pauseDuration', 'articulationRate', 'jitter', 'shimmer', 'speechRate', 'hnr', 'overallScore'] as const;
  const stats: Record<string, { mean: number; min: number; max: number; stdDev: number }> = {};

  metrics.forEach(metric => {
    const values = biomarkers
      .map(b => b[metric])
      .filter((v): v is number => v !== null && v !== undefined);

    if (values.length > 0) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      stats[metric] = {
        mean: Math.round(mean * 100) / 100,
        min: Math.min(...values),
        max: Math.max(...values),
        stdDev: Math.round(Math.sqrt(variance) * 100) / 100,
      };
    }
  });

  return stats;
}

// Check if any alerts should be created based on the new biomarker
async function checkAndCreateAlerts(userId: string, biomarker: BiomarkerRecord) {
  const alerts: Array<{
    type: string;
    metric: string;
    title: string;
    message: string;
    value: number;
    threshold: number;
  }> = [];

  // Check stress levels
  if (biomarker.stress >= 80) {
    alerts.push({
      type: 'critical',
      metric: 'stress',
      title: 'High Stress Detected',
      message: 'Your stress level is significantly elevated. Consider taking a break or practicing relaxation techniques.',
      value: biomarker.stress,
      threshold: 80,
    });
  } else if (biomarker.stress >= 60) {
    alerts.push({
      type: 'warning',
      metric: 'stress',
      title: 'Elevated Stress',
      message: 'Your stress level is higher than normal. Some deep breathing may help.',
      value: biomarker.stress,
      threshold: 60,
    });
  }

  // Check clarity
  if (biomarker.clarity < 50) {
    alerts.push({
      type: 'warning',
      metric: 'clarity',
      title: 'Low Voice Clarity',
      message: 'Your voice clarity is lower than usual. Make sure you\'re well hydrated.',
      value: biomarker.clarity,
      threshold: 50,
    });
  }

  // Check jitter (vocal cord health indicator)
  if (biomarker.jitter && biomarker.jitter > 2) {
    alerts.push({
      type: 'warning',
      metric: 'jitter',
      title: 'Elevated Jitter',
      message: 'Voice stability shows some variation. Rest your voice if you\'ve been speaking a lot.',
      value: biomarker.jitter,
      threshold: 2,
    });
  }

  // Create alerts in the database
  for (const alert of alerts) {
    await prisma.biomarkerAlert.create({
      data: {
        userId,
        type: alert.type,
        metric: alert.metric,
        title: alert.title,
        message: alert.message,
        value: alert.value,
        threshold: alert.threshold,
      },
    });
  }
}
