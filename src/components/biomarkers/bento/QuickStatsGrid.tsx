'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// SVG Icon Components
const TargetIcon = ({ color = '#D9A299' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const CalmFaceIcon = ({ color = '#7AB89E' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const StressedFaceIcon = ({ color = '#E4B17A' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <path d="M7.5 7l2 1" />
    <path d="M16.5 7l-2 1" />
  </svg>
);

const MicIcon = ({ color = '#7AAFC9' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const SpeechIcon = ({ color = '#9CA3AF' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 10h.01" />
    <path d="M12 10h.01" />
    <path d="M16 10h.01" />
  </svg>
);

interface StatItem {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  color: string;
  icon: ReactNode;
}

interface QuickStatsGridProps {
  clarity: number;
  stress: number;
  pitch?: number;
  recordingsCount: number;
  previousClarity?: number;
  previousStress?: number;
  speechRate?: number;
}

const getTrend = (current: number, previous: number | undefined): { direction: 'up' | 'down' | 'stable'; value: number } => {
  if (previous === undefined) return { direction: 'stable', value: 0 };
  const diff = current - previous;
  if (Math.abs(diff) < 1) return { direction: 'stable', value: 0 };
  return {
    direction: diff > 0 ? 'up' : 'down',
    value: Math.abs(diff),
  };
};

export default function QuickStatsGrid({
  clarity,
  stress,
  pitch,
  recordingsCount,
  previousClarity,
  previousStress,
  speechRate,
}: QuickStatsGridProps) {
  const clarityTrend = getTrend(clarity, previousClarity);
  const stressTrend = getTrend(stress, previousStress);

  const stats: StatItem[] = [
    {
      label: 'Clarity',
      value: clarity.toFixed(0),
      unit: '%',
      trend: clarityTrend.direction,
      trendValue: clarityTrend.value,
      color: '#D9A299',
      icon: <TargetIcon color="#D9A299" />,
    },
    {
      label: 'Stress Level',
      value: stress.toFixed(0),
      unit: '%',
      trend: stressTrend.direction,
      trendValue: stressTrend.value,
      color: stress > 50 ? '#E4B17A' : '#7AB89E',
      icon: stress > 50 ? <StressedFaceIcon color="#E4B17A" /> : <CalmFaceIcon color="#7AB89E" />,
    },
    {
      label: 'Total Recordings',
      value: recordingsCount,
      color: '#7AAFC9',
      icon: <MicIcon color="#7AAFC9" />,
    },
    {
      label: 'Speech Rate',
      value: speechRate ? speechRate.toFixed(0) : 'N/A',
      unit: speechRate ? ' wpm' : '',
      color: '#9CA3AF',
      icon: <SpeechIcon color="#9CA3AF" />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
      }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          variants={cardVariants}
          whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)' }}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #DCC5B2',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background glow */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${stat.color}15 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Header with icon and trend */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <motion.span
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4, delay: index * 0.5 }}
                style={{ fontSize: '24px' }}
              >
                {stat.icon}
              </motion.span>

              {stat.trend && stat.trend !== 'stable' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    background: stat.trend === 'up'
                      ? (stat.label === 'Stress Level' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)')
                      : (stat.label === 'Stress Level' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                    fontSize: '11px',
                    fontWeight: '600',
                    color: stat.trend === 'up'
                      ? (stat.label === 'Stress Level' ? '#EF4444' : '#10B981')
                      : (stat.label === 'Stress Level' ? '#10B981' : '#EF4444'),
                  }}
                >
                  <span>{stat.trend === 'up' ? '↑' : '↓'}</span>
                  {stat.trendValue?.toFixed(1)}%
                </motion.div>
              )}
            </div>

            {/* Value */}
            <motion.div
              key={stat.value}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                fontSize: '32px',
                fontWeight: '700',
                color: stat.color,
                lineHeight: 1,
                marginBottom: '4px',
              }}
            >
              {stat.value}
              {stat.unit && (
                <span style={{ fontSize: '16px', fontWeight: '500', opacity: 0.7 }}>
                  {stat.unit}
                </span>
              )}
            </motion.div>

            {/* Label */}
            <div style={{
              fontSize: '13px',
              color: '#6B6B6B',
              fontWeight: '500',
            }}>
              {stat.label}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
