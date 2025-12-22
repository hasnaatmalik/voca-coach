'use client';

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { BIOMARKER_METRICS, normalizeMetricValue } from '@/lib/biomarker-utils';

interface BiomarkerData {
  pitch?: number;
  clarity?: number;
  stress?: number;
  pauseDuration?: number | null;
  articulationRate?: number | null;
  jitter?: number | null;
  shimmer?: number | null;
  speechRate?: number | null;
  hnr?: number | null;
}

interface RadarChartProps {
  current: BiomarkerData;
  baseline?: BiomarkerData;
  title?: string;
  height?: number;
  showLegend?: boolean;
}

export default function RadarChart({
  current,
  baseline,
  title = 'Voice Health Overview',
  height = 350,
  showLegend = true,
}: RadarChartProps) {
  // Define which metrics to show on the radar (most meaningful ones)
  const radarMetrics = ['clarity', 'stress', 'jitter', 'shimmer', 'hnr', 'speechRate'];

  // Transform data for radar chart
  const chartData = radarMetrics
    .filter(key => current[key as keyof BiomarkerData] !== undefined && current[key as keyof BiomarkerData] !== null)
    .map(key => {
      const metric = BIOMARKER_METRICS[key];
      const currentValue = current[key as keyof BiomarkerData] as number;
      const baselineValue = baseline?.[key as keyof BiomarkerData] as number | undefined;

      // Normalize values to 0-100 scale for fair comparison
      const normalizedCurrent = normalizeMetricValue(currentValue, metric);
      const normalizedBaseline = baselineValue !== undefined
        ? normalizeMetricValue(baselineValue, metric)
        : undefined;

      return {
        metric: metric.label,
        shortLabel: metric.label.split(' ')[0], // First word only
        current: Math.round(normalizedCurrent),
        baseline: normalizedBaseline !== undefined ? Math.round(normalizedBaseline) : undefined,
        rawCurrent: currentValue,
        rawBaseline: baselineValue,
        unit: metric.unit,
        fullMark: 100,
      };
    });

  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{
      dataKey: string;
      payload: { metric: string; rawCurrent: number; rawBaseline?: number; unit: string; current: number; baseline?: number };
    }>
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            background: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid #E5E7EB',
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: '#1F2937' }}>
            {data.metric}
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#7C3AED' }}>
            Current: {data.rawCurrent?.toFixed(2)} {data.unit} ({data.current}%)
          </p>
          {data.rawBaseline !== undefined && (
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#9CA3AF' }}>
              Baseline: {data.rawBaseline?.toFixed(2)} {data.unit} ({data.baseline}%)
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
        border: '1px solid rgba(124, 58, 237, 0.1)',
      }}
    >
      <h3
        style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: 600,
          color: '#1F2937',
        }}
      >
        {title}
      </h3>

      {chartData.length >= 3 ? (
        <ResponsiveContainer width="100%" height={height}>
          <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis
              dataKey="shortLabel"
              tick={{ fontSize: 11, fill: '#6B7280' }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              tickCount={5}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Baseline area */}
            {baseline && chartData.some(d => d.baseline !== undefined) && (
              <Radar
                name="Baseline"
                dataKey="baseline"
                stroke="#9CA3AF"
                fill="#9CA3AF"
                fillOpacity={0.2}
                strokeWidth={1}
                strokeDasharray="5 5"
              />
            )}

            {/* Current values */}
            <Radar
              name="Current"
              dataKey="current"
              stroke="#7C3AED"
              fill="#7C3AED"
              fillOpacity={0.3}
              strokeWidth={2}
              dot={{
                r: 4,
                fill: '#7C3AED',
                stroke: 'white',
                strokeWidth: 2,
              }}
            />

            {showLegend && baseline && <Legend />}
          </RechartsRadarChart>
        </ResponsiveContainer>
      ) : (
        <div
          style={{
            height,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9CA3AF',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0 }}>Not enough data for radar view</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
            Record more biomarkers to see the full overview
          </p>
        </div>
      )}

      {/* Legend for metrics meaning */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          background: '#F9FAFB',
          borderRadius: '8px',
          fontSize: '11px',
          color: '#6B7280',
        }}
      >
        <p style={{ margin: 0, fontWeight: 500, marginBottom: '4px' }}>
          Score interpretation:
        </p>
        <p style={{ margin: 0 }}>
          Higher scores (outer edge) = healthier values. All metrics are normalized to a 0-100 scale.
        </p>
      </div>
    </div>
  );
}
