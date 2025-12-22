import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface CorrelationResult {
  metric1: string;
  metric2: string;
  correlation: number;
  interpretation: string;
  sampleSize: number;
}

interface JournalCorrelation {
  metric: string;
  correlation: number;
  journalFactor: string;
  interpretation: string;
}

// GET /api/biomarkers/correlations - Get correlations between biomarkers and other data
export async function GET(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch biomarkers
    const biomarkers = await prisma.biomarker.findMany({
      where: {
        userId: authUser.userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    if (biomarkers.length < 5) {
      return NextResponse.json({
        message: 'Not enough data for correlation analysis. Need at least 5 recordings.',
        biomarkerCorrelations: [],
        journalCorrelations: [],
        sessionCorrelations: [],
      });
    }

    // Calculate biomarker-to-biomarker correlations
    const biomarkerCorrelations = calculateBiomarkerCorrelations(biomarkers);

    // Fetch journal entries for the same period
    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        userId: authUser.userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate journal-biomarker correlations (mood vs biomarkers)
    const journalCorrelations = calculateJournalCorrelations(biomarkers, journalEntries);

    // Fetch de-escalation sessions for session correlations
    const sessions = await prisma.session.findMany({
      where: {
        userId: authUser.userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    const sessionCorrelations = calculateSessionCorrelations(biomarkers, sessions);

    return NextResponse.json({
      biomarkerCorrelations,
      journalCorrelations,
      sessionCorrelations,
      dataSummary: {
        biomarkerCount: biomarkers.length,
        journalCount: journalEntries.length,
        sessionCount: sessions.length,
        dateRange: {
          start: startDate.toISOString(),
          end: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Correlations error:', error);
    return NextResponse.json({ error: 'Failed to calculate correlations' }, { status: 500 });
  }
}

interface BiomarkerRecord {
  pitch: number;
  clarity: number;
  stress: number;
  pauseDuration?: number | null;
  jitter?: number | null;
  shimmer?: number | null;
  speechRate?: number | null;
  hnr?: number | null;
}

function calculateBiomarkerCorrelations(biomarkers: BiomarkerRecord[]): CorrelationResult[] {
  const metrics = ['pitch', 'clarity', 'stress', 'pauseDuration', 'jitter', 'shimmer', 'speechRate', 'hnr'] as const;
  const correlations: CorrelationResult[] = [];

  // Calculate Pearson correlation between each pair of metrics
  for (let i = 0; i < metrics.length; i++) {
    for (let j = i + 1; j < metrics.length; j++) {
      const metric1 = metrics[i];
      const metric2 = metrics[j];

      const pairs = biomarkers
        .filter(b => b[metric1] != null && b[metric2] != null)
        .map(b => ({
          x: b[metric1] as number,
          y: b[metric2] as number,
        }));

      if (pairs.length >= 5) {
        const correlation = pearsonCorrelation(pairs);
        if (Math.abs(correlation) >= 0.3) { // Only include moderate+ correlations
          correlations.push({
            metric1,
            metric2,
            correlation: Math.round(correlation * 100) / 100,
            interpretation: interpretCorrelation(metric1, metric2, correlation),
            sampleSize: pairs.length,
          });
        }
      }
    }
  }

  // Sort by absolute correlation strength
  return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

interface JournalRecord {
  createdAt: Date;
  mood?: number | null;
  moodAfter?: number | null;
}

function calculateJournalCorrelations(
  biomarkers: BiomarkerRecord[],
  journalEntries: JournalRecord[]
): JournalCorrelation[] {
  const correlations: JournalCorrelation[] = [];

  if (journalEntries.length < 3) return correlations;

  // Get daily mood data
  const moodByDate = new Map<string, number>();
  journalEntries.forEach(entry => {
    if (entry.mood != null) {
      const dateKey = entry.createdAt.toISOString().split('T')[0];
      // Average if multiple entries per day
      const existing = moodByDate.get(dateKey);
      if (existing !== undefined) {
        moodByDate.set(dateKey, (existing + entry.mood) / 2);
      } else {
        moodByDate.set(dateKey, entry.mood);
      }
    }
  });

  // Match biomarkers with mood
  const metrics = ['stress', 'clarity', 'pitch'] as const;

  metrics.forEach(metric => {
    const pairs: { x: number; y: number }[] = [];

    (biomarkers as Array<BiomarkerRecord & { date: Date }>).forEach((b) => {
      const dateKey = (b as unknown as { date: Date }).date?.toISOString().split('T')[0];
      const mood = moodByDate.get(dateKey);
      if (mood !== undefined && b[metric] != null) {
        pairs.push({ x: b[metric] as number, y: mood });
      }
    });

    if (pairs.length >= 3) {
      const correlation = pearsonCorrelation(pairs);
      if (Math.abs(correlation) >= 0.2) {
        correlations.push({
          metric,
          correlation: Math.round(correlation * 100) / 100,
          journalFactor: 'mood',
          interpretation: interpretMoodCorrelation(metric, correlation),
        });
      }
    }
  });

  return correlations;
}

interface SessionRecord {
  createdAt: Date;
  calmScore?: number | null;
  emotionalScore?: number | null;
}

function calculateSessionCorrelations(
  biomarkers: BiomarkerRecord[],
  sessions: SessionRecord[]
): Array<{ description: string; correlation: number }> {
  const correlations: Array<{ description: string; correlation: number }> = [];

  if (sessions.length < 3) return correlations;

  // Get calm scores by date
  const calmByDate = new Map<string, number>();
  sessions.forEach(session => {
    if (session.calmScore != null) {
      const dateKey = session.createdAt.toISOString().split('T')[0];
      calmByDate.set(dateKey, session.calmScore);
    }
  });

  // Check stress vs session calm scores
  const pairs: { x: number; y: number }[] = [];
  (biomarkers as Array<BiomarkerRecord & { date: Date }>).forEach((b) => {
    const dateKey = (b as unknown as { date: Date }).date?.toISOString().split('T')[0];
    const calmScore = calmByDate.get(dateKey);
    if (calmScore !== undefined && b.stress != null) {
      pairs.push({ x: b.stress, y: calmScore });
    }
  });

  if (pairs.length >= 3) {
    const correlation = pearsonCorrelation(pairs);
    if (Math.abs(correlation) >= 0.2) {
      correlations.push({
        description: correlation < 0
          ? 'Higher stress in voice correlates with lower session calm scores'
          : 'Lower voice stress correlates with higher session calm scores',
        correlation: Math.round(correlation * 100) / 100,
      });
    }
  }

  return correlations;
}

function pearsonCorrelation(pairs: { x: number; y: number }[]): number {
  const n = pairs.length;
  if (n < 2) return 0;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

  pairs.forEach(({ x, y }) => {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  });

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
}

function interpretCorrelation(metric1: string, metric2: string, correlation: number): string {
  const strength = Math.abs(correlation) >= 0.7 ? 'strongly' :
    Math.abs(correlation) >= 0.5 ? 'moderately' : 'mildly';
  const direction = correlation > 0 ? 'positively' : 'negatively';

  const metricLabels: Record<string, string> = {
    pitch: 'pitch',
    clarity: 'voice clarity',
    stress: 'stress levels',
    pauseDuration: 'pause duration',
    jitter: 'jitter',
    shimmer: 'shimmer',
    speechRate: 'speech rate',
    hnr: 'voice quality (HNR)',
  };

  return `${metricLabels[metric1] || metric1} is ${strength} ${direction} correlated with ${metricLabels[metric2] || metric2}`;
}

function interpretMoodCorrelation(metric: string, correlation: number): string {
  if (metric === 'stress') {
    return correlation > 0
      ? 'Higher voice stress tends to occur on days with lower mood'
      : 'Lower voice stress tends to occur on days with higher mood';
  }
  if (metric === 'clarity') {
    return correlation > 0
      ? 'Higher voice clarity tends to occur on days with higher mood'
      : 'Voice clarity appears unrelated to daily mood';
  }
  return `${metric} shows ${Math.abs(correlation) >= 0.5 ? 'strong' : 'moderate'} correlation with mood`;
}
