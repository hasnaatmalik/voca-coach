'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import BentoCard from './BentoCard';

interface WeeklyData {
  day: string;
  mood: number;
  sessions: number;
  engagement: number;
}

interface WeeklyAnalyticsCardProps {
  data: WeeklyData[];
  improvement?: number;
}

const COLORS = {
  mood: { main: '#D9A299', gradient: 'rgba(217, 162, 153, 0.3)' },
  sessions: { main: '#7AAFC9', gradient: 'rgba(122, 175, 201, 0.3)' },
  engagement: { main: '#7AB89E', gradient: 'rgba(122, 184, 158, 0.3)' },
};

type MetricKey = 'mood' | 'sessions' | 'engagement';

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid #F0E4D3',
      }}
    >
      <p style={{
        fontSize: '13px',
        fontWeight: '600',
        color: '#2D2D2D',
        marginBottom: '8px',
      }}>
        {label}
      </p>
      {payload.map((entry, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '4px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: entry.color,
            }}
          />
          <span style={{ fontSize: '12px', color: '#6B6B6B', textTransform: 'capitalize' }}>
            {entry.name}:
          </span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#2D2D2D' }}>
            {entry.value}
            {entry.name === 'mood' || entry.name === 'engagement' ? '%' : ''}
          </span>
        </div>
      ))}
    </motion.div>
  );
};

export default function WeeklyAnalyticsCard({
  data,
  improvement = 0,
}: WeeklyAnalyticsCardProps) {
  const [activeMetrics, setActiveMetrics] = useState<Set<MetricKey>>(
    new Set(['mood', 'sessions', 'engagement'])
  );

  const toggleMetric = (metric: MetricKey) => {
    const newMetrics = new Set(activeMetrics);
    if (newMetrics.has(metric)) {
      if (newMetrics.size > 1) {
        newMetrics.delete(metric);
      }
    } else {
      newMetrics.add(metric);
    }
    setActiveMetrics(newMetrics);
  };

  const hasData = data && data.length > 0;

  const chartData = useMemo(() => {
    if (!hasData) {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
        day,
        mood: 0,
        sessions: 0,
        engagement: 0,
      }));
    }
    return data;
  }, [data, hasData]);

  return (
    <BentoCard gridArea="analytics">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '240px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#2D2D2D',
            }}>
              Weekly Progress
            </h3>
            {improvement !== 0 && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: improvement > 0 ? 'rgba(122, 184, 158, 0.15)' : 'rgba(228, 177, 122, 0.15)',
                  color: improvement > 0 ? '#7AB89E' : '#E4B17A',
                }}
              >
                {improvement > 0 ? '↑' : '↓'} {Math.abs(improvement)}% from last week
              </motion.span>
            )}
          </div>

          {/* Metric toggles */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['mood', 'sessions', 'engagement'] as MetricKey[]).map((metric) => (
              <motion.button
                key={metric}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleMetric(metric)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  background: activeMetrics.has(metric)
                    ? COLORS[metric].main
                    : '#F0E4D3',
                  color: activeMetrics.has(metric) ? 'white' : '#6B6B6B',
                  transition: 'all 0.2s',
                }}
              >
                {metric}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div style={{ flex: 1, position: 'relative' }}>
          <AnimatePresence mode="wait">
            {hasData ? (
              <motion.div
                key="chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ width: '100%', height: '100%' }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      {(['mood', 'sessions', 'engagement'] as MetricKey[]).map((metric) => (
                        <linearGradient key={metric} id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS[metric].main} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={COLORS[metric].main} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D3" vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#9B9B9B' }}
                      dy={10}
                    />
                    <YAxis hide domain={[0, 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                    {activeMetrics.has('mood') && (
                      <Area
                        type="monotone"
                        dataKey="mood"
                        stroke={COLORS.mood.main}
                        strokeWidth={2}
                        fill={`url(#gradient-mood)`}
                        animationDuration={1000}
                        dot={{ r: 4, fill: COLORS.mood.main, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: COLORS.mood.main }}
                      />
                    )}
                    {activeMetrics.has('sessions') && (
                      <Area
                        type="monotone"
                        dataKey="sessions"
                        stroke={COLORS.sessions.main}
                        strokeWidth={2}
                        fill={`url(#gradient-sessions)`}
                        animationDuration={1000}
                        animationBegin={200}
                        dot={{ r: 4, fill: COLORS.sessions.main, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: COLORS.sessions.main }}
                      />
                    )}
                    {activeMetrics.has('engagement') && (
                      <Area
                        type="monotone"
                        dataKey="engagement"
                        stroke={COLORS.engagement.main}
                        strokeWidth={2}
                        fill={`url(#gradient-engagement)`}
                        animationDuration={1000}
                        animationBegin={400}
                        dot={{ r: 4, fill: COLORS.engagement.main, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: COLORS.engagement.main }}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: '16px',
                }}
              >
                {/* Abstract wave pattern */}
                <div style={{
                  width: '120px',
                  height: '60px',
                  background: 'linear-gradient(90deg, #F0E4D3 0%, #DCC5B2 50%, #F0E4D3 100%)',
                  borderRadius: '30px',
                  opacity: 0.5,
                }}/>
                <p style={{
                  fontSize: '14px',
                  color: '#9B9B9B',
                  textAlign: 'center',
                }}>
                  Complete more sessions to see your trends
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '10px 20px',
                    background: '#D9A299',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Start First Session
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BentoCard>
  );
}
