'use client';

import type { WeeklyProgressData } from '@/types/dashboard';

interface SparklineProps {
  data: number[];
  color: string;
  height?: number;
  width?: number;
}

// SVG-based sparkline component (no external deps)
const Sparkline = ({ data, color, height = 40, width = 120 }: SparklineProps) => {
  if (!data || data.length === 0) {
    return (
      <svg width={width} height={height} style={{ display: 'block' }}>
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#E5E7EB" strokeWidth="2" />
      </svg>
    );
  }

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const padding = 4;

  const points = data.map((val, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: padding + ((max - val) / range) * (height - padding * 2),
  }));

  const pathD = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  // Create area fill path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path
        d={areaD}
        fill={`url(#gradient-${color.replace('#', '')})`}
      />
      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Current value dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="4"
        fill="white"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
};

interface WeeklyProgressProps {
  data: WeeklyProgressData | null;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyProgress({ data }: WeeklyProgressProps) {
  if (!data) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', marginBottom: '16px' }}>
          Weekly Progress
        </h3>
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6B7280' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
          <div style={{ fontSize: '14px' }}>Complete activities to see your weekly progress</div>
        </div>
      </div>
    );
  }

  const totalSessions = data.sessions.reduce((a, b) => a + b, 0);
  const totalJournals = data.journalEntries.reduce((a, b) => a + b, 0);
  const avgMood = Math.round(data.moodTrend.reduce((a, b) => a + b, 0) / data.moodTrend.length);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>
          Weekly Progress
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: data.improvement >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '600',
          color: data.improvement >= 0 ? '#10B981' : '#EF4444'
        }}>
          <span>{data.improvement >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(data.improvement)}% vs last week</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {/* Sessions */}
        <div style={{
          background: '#F9FAFB',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#7C3AED' }}>{totalSessions}</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Sessions</div>
            </div>
            <div style={{ fontSize: '20px' }}>🎯</div>
          </div>
          <Sparkline data={data.sessions} color="#7C3AED" />
        </div>

        {/* Journal Entries */}
        <div style={{
          background: '#F9FAFB',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#EC4899' }}>{totalJournals}</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Journals</div>
            </div>
            <div style={{ fontSize: '20px' }}>📝</div>
          </div>
          <Sparkline data={data.journalEntries} color="#EC4899" />
        </div>

        {/* Mood Trend */}
        <div style={{
          background: '#F9FAFB',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#06B6D4' }}>{avgMood}%</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Avg Mood</div>
            </div>
            <div style={{ fontSize: '20px' }}>😊</div>
          </div>
          <Sparkline data={data.moodTrend} color="#06B6D4" />
        </div>
      </div>

      {/* Day labels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid #E5E7EB'
      }}>
        {DAYS.map((day, i) => (
          <div
            key={day}
            style={{
              fontSize: '11px',
              color: i === 6 ? '#7C3AED' : '#9CA3AF',
              textAlign: 'center',
              fontWeight: i === 6 ? '600' : '400'
            }}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
