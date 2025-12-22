'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { BIOMARKER_METRICS, formatDate, formatTime } from '@/lib/biomarker-utils';

interface DataPoint {
  date: string;
  value: number;
  id?: string;
}

interface BiomarkerChartProps {
  data: DataPoint[];
  metric: string;
  title?: string;
  showArea?: boolean;
  height?: number;
  baseline?: number;
  goal?: number;
  normalRange?: { min: number; max: number };
  color?: string;
  showTooltip?: boolean;
  onClick?: (dataPoint: DataPoint) => void;
}

export default function BiomarkerChart({
  data,
  metric,
  title,
  showArea = true,
  height = 200,
  baseline,
  goal,
  normalRange,
  color,
  showTooltip = true,
  onClick,
}: BiomarkerChartProps) {
  const metricInfo = BIOMARKER_METRICS[metric];
  const chartColor = color || metricInfo?.color || '#7C3AED';
  const displayTitle = title || metricInfo?.label || metric;
  const unit = metricInfo?.unit || '';

  // Transform data for Recharts
  const chartData = data.map(d => ({
    ...d,
    dateDisplay: formatDate(d.date),
    timeDisplay: formatTime(d.date),
    fullDate: d.date,
  }));

  // Calculate min/max for Y axis
  const values = data.map(d => d.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const padding = (dataMax - dataMin) * 0.1 || 10;
  const yMin = Math.floor(Math.min(dataMin - padding, normalRange?.min || dataMin));
  const yMax = Math.ceil(Math.max(dataMax + padding, normalRange?.max || dataMax));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: DataPoint & { dateDisplay: string; timeDisplay: string } }> }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
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
          <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
            {point.dateDisplay} at {point.timeDisplay}
          </p>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '18px',
              fontWeight: 600,
              color: chartColor,
            }}
          >
            {point.value.toFixed(1)} {unit}
          </p>
          {baseline && (
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#9CA3AF' }}>
              Baseline: {baseline.toFixed(1)} {unit}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (data: any) => {
    if (onClick && data?.activePayload?.[0]) {
      onClick(data.activePayload[0].payload as DataPoint);
    }
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
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: '#1F2937',
            }}
          >
            {displayTitle}
          </h3>
          {metricInfo?.description && (
            <p
              style={{
                margin: '2px 0 0 0',
                fontSize: '12px',
                color: '#6B7280',
              }}
            >
              {metricInfo.description}
            </p>
          )}
        </div>

        {/* Current value indicator */}
        {data.length > 0 && (
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: chartColor,
              }}
            >
              {data[data.length - 1].value.toFixed(1)}
            </span>
            <span
              style={{
                fontSize: '14px',
                color: '#6B7280',
                marginLeft: '4px',
              }}
            >
              {unit}
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={height}>
          {showArea ? (
            <AreaChart data={chartData} onClick={handleClick}>
              <defs>
                <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="dateDisplay"
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                width={40}
              />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}

              {/* Normal range shading */}
              {normalRange && (
                <ReferenceArea
                  y1={normalRange.min}
                  y2={normalRange.max}
                  fill="#10B981"
                  fillOpacity={0.1}
                />
              )}

              {/* Baseline reference line */}
              {baseline && (
                <ReferenceLine
                  y={baseline}
                  stroke="#9CA3AF"
                  strokeDasharray="5 5"
                  label={{
                    value: 'Baseline',
                    position: 'right',
                    fontSize: 10,
                    fill: '#9CA3AF',
                  }}
                />
              )}

              {/* Goal reference line */}
              {goal && (
                <ReferenceLine
                  y={goal}
                  stroke="#10B981"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Goal',
                    position: 'right',
                    fontSize: 10,
                    fill: '#10B981',
                  }}
                />
              )}

              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#gradient-${metric})`}
                dot={{ fill: chartColor, strokeWidth: 0, r: 3 }}
                activeDot={{ fill: chartColor, strokeWidth: 2, stroke: 'white', r: 5 }}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} onClick={handleClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="dateDisplay"
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                width={40}
              />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}

              {baseline && (
                <ReferenceLine
                  y={baseline}
                  stroke="#9CA3AF"
                  strokeDasharray="5 5"
                />
              )}

              <Line
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                dot={{ fill: chartColor, strokeWidth: 0, r: 3 }}
                activeDot={{ fill: chartColor, strokeWidth: 2, stroke: 'white', r: 5 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      ) : (
        <div
          style={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9CA3AF',
            fontSize: '14px',
          }}
        >
          No data available for this period
        </div>
      )}
    </div>
  );
}
