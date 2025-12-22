import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST /api/biomarkers/export - Export biomarker data
export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { format = 'csv', startDate, endDate, includeInsights = false } = await req.json();

    // Build date filter
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) {
      dateFilter.lte = new Date(endDate);
      dateFilter.lte.setHours(23, 59, 59, 999);
    }

    // Fetch biomarkers
    const biomarkers = await prisma.biomarker.findMany({
      where: {
        userId: authUser.userId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      orderBy: { date: 'asc' },
    });

    // Fetch user info
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { name: true, email: true },
    });

    // Fetch baseline if available
    const baseline = await prisma.biomarkerBaseline.findFirst({
      where: { userId: authUser.userId },
      orderBy: { calculatedAt: 'desc' },
    });

    // Fetch goals
    const goals = await prisma.biomarkerGoal.findMany({
      where: { userId: authUser.userId },
    });

    switch (format) {
      case 'csv':
        return generateCSV(biomarkers, user);
      case 'json':
        return generateJSON(biomarkers, user, baseline, goals);
      case 'pdf':
        return generatePDFData(biomarkers, user, baseline, goals);
      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}

interface BiomarkerRecord {
  id: string;
  date: Date;
  pitch: number;
  clarity: number;
  stress: number;
  pauseDuration?: number | null;
  articulationRate?: number | null;
  jitter?: number | null;
  shimmer?: number | null;
  speechRate?: number | null;
  hnr?: number | null;
  duration?: number | null;
  prompt?: string | null;
  notes?: string | null;
  overallScore?: number | null;
}

interface UserInfo {
  name: string;
  email: string;
}

function generateCSV(biomarkers: BiomarkerRecord[], user: UserInfo | null) {
  const headers = [
    'Date',
    'Time',
    'Pitch (Hz)',
    'Clarity (%)',
    'Stress (%)',
    'Pause Duration (s)',
    'Articulation Rate (wps)',
    'Jitter (%)',
    'Shimmer (%)',
    'Speech Rate (wpm)',
    'HNR (dB)',
    'Duration (s)',
    'Prompt',
    'Overall Score',
    'Notes',
  ];

  const rows = biomarkers.map(b => [
    b.date.toISOString().split('T')[0],
    b.date.toISOString().split('T')[1].substring(0, 8),
    b.pitch.toFixed(2),
    b.clarity.toFixed(2),
    b.stress.toFixed(2),
    b.pauseDuration?.toFixed(2) || '',
    b.articulationRate?.toFixed(2) || '',
    b.jitter?.toFixed(2) || '',
    b.shimmer?.toFixed(2) || '',
    b.speechRate?.toFixed(0) || '',
    b.hnr?.toFixed(2) || '',
    b.duration?.toString() || '',
    b.prompt || '',
    b.overallScore?.toFixed(0) || '',
    (b.notes || '').replace(/"/g, '""'),
  ]);

  const csv = [
    `# Voice Biomarker Export`,
    `# User: ${user?.name || 'Unknown'}`,
    `# Generated: ${new Date().toISOString()}`,
    `# Total Records: ${biomarkers.length}`,
    '',
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="biomarkers-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}

interface BaselineRecord {
  pitch: number;
  clarity: number;
  stress: number;
  pauseDuration?: number | null;
  articulationRate?: number | null;
  jitter?: number | null;
  shimmer?: number | null;
  speechRate?: number | null;
  hnr?: number | null;
  calculatedAt: Date;
  recordingCount: number;
}

interface GoalRecord {
  metric: string;
  target: number;
  direction: string;
}

function generateJSON(
  biomarkers: BiomarkerRecord[],
  user: UserInfo | null,
  baseline: BaselineRecord | null,
  goals: GoalRecord[]
) {
  const exportData = {
    meta: {
      exportDate: new Date().toISOString(),
      user: user?.name || 'Unknown',
      recordCount: biomarkers.length,
      dateRange: biomarkers.length > 0 ? {
        start: biomarkers[0].date.toISOString(),
        end: biomarkers[biomarkers.length - 1].date.toISOString(),
      } : null,
    },
    baseline: baseline ? {
      pitch: baseline.pitch,
      clarity: baseline.clarity,
      stress: baseline.stress,
      pauseDuration: baseline.pauseDuration,
      articulationRate: baseline.articulationRate,
      jitter: baseline.jitter,
      shimmer: baseline.shimmer,
      speechRate: baseline.speechRate,
      hnr: baseline.hnr,
      calculatedAt: baseline.calculatedAt,
      recordingCount: baseline.recordingCount,
    } : null,
    goals: goals.reduce((acc, g) => {
      acc[g.metric] = { target: g.target, direction: g.direction };
      return acc;
    }, {} as Record<string, { target: number; direction: string }>),
    biomarkers: biomarkers.map(b => ({
      id: b.id,
      date: b.date.toISOString(),
      pitch: b.pitch,
      clarity: b.clarity,
      stress: b.stress,
      pauseDuration: b.pauseDuration,
      articulationRate: b.articulationRate,
      jitter: b.jitter,
      shimmer: b.shimmer,
      speechRate: b.speechRate,
      hnr: b.hnr,
      duration: b.duration,
      prompt: b.prompt,
      overallScore: b.overallScore,
      notes: b.notes,
    })),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="biomarkers-${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}

function generatePDFData(
  biomarkers: BiomarkerRecord[],
  user: UserInfo | null,
  baseline: BaselineRecord | null,
  goals: GoalRecord[]
) {
  // For PDF, we'll return the data structured for client-side PDF generation
  // or use a PDF library on the server

  // Calculate summary statistics
  const stats = calculateStats(biomarkers);

  const pdfData = {
    title: 'Voice Biomarker Report',
    generatedAt: new Date().toISOString(),
    user: {
      name: user?.name || 'Anonymous',
      email: user?.email,
    },
    summary: {
      totalRecordings: biomarkers.length,
      dateRange: biomarkers.length > 0 ? {
        start: biomarkers[0].date.toISOString().split('T')[0],
        end: biomarkers[biomarkers.length - 1].date.toISOString().split('T')[0],
      } : null,
      averages: stats.averages,
    },
    baseline: baseline ? {
      pitch: baseline.pitch,
      clarity: baseline.clarity,
      stress: baseline.stress,
      recordingCount: baseline.recordingCount,
      calculatedAt: baseline.calculatedAt.toISOString().split('T')[0],
    } : null,
    goals: goals.map(g => ({
      metric: g.metric,
      target: g.target,
      direction: g.direction,
    })),
    // Include recent recordings for the report
    recentRecordings: biomarkers.slice(-10).map(b => ({
      date: b.date.toISOString().split('T')[0],
      time: b.date.toISOString().split('T')[1].substring(0, 5),
      pitch: b.pitch.toFixed(1),
      clarity: b.clarity.toFixed(0) + '%',
      stress: b.stress.toFixed(0) + '%',
      overallScore: b.overallScore?.toFixed(0) || '-',
    })),
    // Chart data for visualization
    chartData: biomarkers.map(b => ({
      date: b.date.toISOString().split('T')[0],
      pitch: b.pitch,
      clarity: b.clarity,
      stress: b.stress,
      overallScore: b.overallScore,
    })),
  };

  return NextResponse.json({ pdfData });
}

function calculateStats(biomarkers: BiomarkerRecord[]) {
  const metrics = ['pitch', 'clarity', 'stress', 'pauseDuration', 'jitter', 'shimmer', 'speechRate', 'hnr', 'overallScore'] as const;
  const averages: Record<string, number> = {};

  metrics.forEach(metric => {
    const values = biomarkers
      .map(b => b[metric])
      .filter((v): v is number => v !== null && v !== undefined);
    if (values.length > 0) {
      averages[metric] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
    }
  });

  return { averages };
}
