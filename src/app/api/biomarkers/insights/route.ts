import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getModel } from '@/lib/vertex';

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
  overallScore?: number | null;
}

interface InsightResponse {
  summary: string;
  trends: Array<{
    metric: string;
    direction: 'up' | 'down' | 'stable';
    percentChange: number;
    interpretation: string;
  }>;
  patterns: Array<{
    description: string;
    confidence: number;
    insight: string;
  }>;
  anomalies: Array<{
    date: string;
    metric: string;
    value: number;
    expected: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  correlations: Array<{
    description: string;
    strength: number;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
  }>;
  overallHealthScore: number;
  weeklyImprovement: number;
}

const INSIGHTS_PROMPT = `You are an expert voice biomarker analyst and mental health consultant. Analyze the provided voice biomarker history and generate comprehensive insights.

Given this biomarker data history, provide a detailed analysis in the following JSON format:
{
  "summary": "<2-3 sentence executive summary of voice health trends and overall status>",
  "trends": [
    {
      "metric": "<metric name>",
      "direction": "<up|down|stable>",
      "percentChange": <number>,
      "interpretation": "<what this trend means for the user>"
    }
  ],
  "patterns": [
    {
      "description": "<pattern observed, e.g., 'stress peaks on weekdays'>",
      "confidence": <0.0-1.0>,
      "insight": "<actionable insight about this pattern>"
    }
  ],
  "anomalies": [
    {
      "date": "<ISO date string>",
      "metric": "<affected metric>",
      "value": <observed value>,
      "expected": <expected value>,
      "severity": "<low|medium|high>"
    }
  ],
  "correlations": [
    {
      "description": "<correlation found between metrics or behaviors>",
      "strength": <0.0-1.0>
    }
  ],
  "recommendations": [
    {
      "title": "<short actionable title>",
      "description": "<detailed recommendation>",
      "priority": "<high|medium|low>",
      "category": "<vocal_health|stress_management|speech_improvement|general_wellness>"
    }
  ],
  "overallHealthScore": <0-100>,
  "weeklyImprovement": <percentage change from last week>
}

Focus on:
- Identifying concerning patterns in stress levels
- Recognizing improvements in clarity and articulation
- Detecting signs of vocal fatigue or strain (jitter/shimmer)
- Providing actionable, specific recommendations
- Being encouraging while remaining clinically accurate

Return ONLY the JSON object, no markdown formatting or explanation.`;

export async function POST(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { days = 30 } = await req.json();

    // Fetch biomarker history
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const biomarkers = await prisma.biomarker.findMany({
      where: {
        userId: authUser.userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    if (biomarkers.length === 0) {
      return NextResponse.json({
        summary: 'No biomarker data available yet. Record your first voice sample to start receiving insights.',
        trends: [],
        patterns: [],
        anomalies: [],
        correlations: [],
        recommendations: [{
          title: 'Start Recording',
          description: 'Record your first voice sample to begin tracking your voice biomarkers and receive personalized insights.',
          priority: 'high',
          category: 'general_wellness',
        }],
        overallHealthScore: 0,
        weeklyImprovement: 0,
      });
    }

    // Calculate basic statistics for context
    const stats = calculateBasicStats(biomarkers);

    // Prepare data summary for AI
    const dataSummary = {
      totalRecordings: biomarkers.length,
      dateRange: {
        start: biomarkers[0].date.toISOString(),
        end: biomarkers[biomarkers.length - 1].date.toISOString(),
      },
      averages: stats.averages,
      trends: stats.trends,
      recentRecordings: biomarkers.slice(-7).map(b => ({
        date: b.date.toISOString(),
        pitch: b.pitch,
        clarity: b.clarity,
        stress: b.stress,
        pauseDuration: b.pauseDuration,
        jitter: b.jitter,
        shimmer: b.shimmer,
        speechRate: b.speechRate,
        hnr: b.hnr,
        overallScore: b.overallScore,
      })),
    };

    // Get AI insights
    const model = getModel('gemini-2.0-flash-exp');
    const result = await model.generateContent([
      { text: INSIGHTS_PROMPT },
      { text: `\n\nBiomarker data to analyze:\n${JSON.stringify(dataSummary, null, 2)}` },
    ]);

    const responseText = result.response.text();

    // Parse JSON response
    let insights: InsightResponse;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse insights response:', responseText);
      // Return fallback insights
      insights = generateFallbackInsights(biomarkers, stats);
    }

    // Validate and normalize the response
    insights = normalizeInsights(insights, stats);

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Insights generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

function calculateBasicStats(biomarkers: BiomarkerRecord[]) {
  const metrics = ['pitch', 'clarity', 'stress', 'pauseDuration', 'jitter', 'shimmer', 'speechRate', 'hnr'] as const;

  const averages: Record<string, number> = {};
  const trends: Record<string, { direction: string; change: number }> = {};

  metrics.forEach(metric => {
    const values = biomarkers
      .map(b => b[metric])
      .filter((v): v is number => v !== null && v !== undefined);

    if (values.length > 0) {
      averages[metric] = values.reduce((a, b) => a + b, 0) / values.length;

      // Calculate trend (compare first half to second half)
      if (values.length >= 4) {
        const mid = Math.floor(values.length / 2);
        const firstHalf = values.slice(0, mid);
        const secondHalf = values.slice(mid);

        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        const change = firstAvg !== 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

        trends[metric] = {
          direction: Math.abs(change) < 5 ? 'stable' : change > 0 ? 'up' : 'down',
          change: Math.round(change * 10) / 10,
        };
      }
    }
  });

  return { averages, trends };
}

function generateFallbackInsights(
  biomarkers: BiomarkerRecord[],
  stats: { averages: Record<string, number>; trends: Record<string, { direction: string; change: number }> }
): InsightResponse {
  const avgClarity = stats.averages.clarity ?? 75;
  const avgStress = stats.averages.stress ?? 40;
  const overallScore = Math.round(avgClarity * 0.6 + (100 - avgStress) * 0.4);

  return {
    summary: `Based on ${biomarkers.length} recordings, your voice health score is ${overallScore}/100. ` +
      `Average clarity is ${avgClarity.toFixed(0)}% and stress level is ${avgStress.toFixed(0)}%.`,
    trends: Object.entries(stats.trends).map(([metric, data]) => ({
      metric,
      direction: data.direction as 'up' | 'down' | 'stable',
      percentChange: Math.abs(data.change),
      interpretation: `Your ${metric} has ${data.direction === 'stable' ? 'remained stable' : `${data.direction === 'up' ? 'increased' : 'decreased'} by ${Math.abs(data.change).toFixed(0)}%`}`,
    })),
    patterns: [],
    anomalies: [],
    correlations: [],
    recommendations: [
      {
        title: 'Stay Consistent',
        description: 'Continue recording regularly to build a comprehensive picture of your voice health.',
        priority: 'medium',
        category: 'general_wellness',
      },
      {
        title: 'Practice Deep Breathing',
        description: 'Deep breathing exercises before speaking can help reduce vocal tension.',
        priority: 'low',
        category: 'stress_management',
      },
    ],
    overallHealthScore: overallScore,
    weeklyImprovement: 0,
  };
}

function normalizeInsights(
  insights: InsightResponse,
  stats: { averages: Record<string, number>; trends: Record<string, { direction: string; change: number }> }
): InsightResponse {
  // Ensure all required fields exist with valid values
  return {
    summary: insights.summary || 'Analysis complete.',
    trends: Array.isArray(insights.trends) ? insights.trends : [],
    patterns: Array.isArray(insights.patterns) ? insights.patterns : [],
    anomalies: Array.isArray(insights.anomalies) ? insights.anomalies : [],
    correlations: Array.isArray(insights.correlations) ? insights.correlations : [],
    recommendations: Array.isArray(insights.recommendations) ? insights.recommendations.slice(0, 5) : [],
    overallHealthScore: typeof insights.overallHealthScore === 'number'
      ? Math.min(100, Math.max(0, insights.overallHealthScore))
      : Math.round((stats.averages.clarity ?? 75) * 0.6 + (100 - (stats.averages.stress ?? 40)) * 0.4),
    weeklyImprovement: typeof insights.weeklyImprovement === 'number' ? insights.weeklyImprovement : 0,
  };
}
