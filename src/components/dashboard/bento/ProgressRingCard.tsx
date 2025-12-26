'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import BentoCard from './BentoCard';

interface MiniMetric {
  label: string;
  value: number;
  color: string;
}

interface ProgressRingCardProps {
  mainProgress: number;
  mainLabel: string;
  metrics: MiniMetric[];
}

const SIZE = 200;
const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProgressRingCard({
  mainProgress,
  mainLabel,
  metrics,
}: ProgressRingCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Animated progress value
  const springProgress = useSpring(0, { stiffness: 30, damping: 20 });
  const strokeDashoffset = useTransform(
    springProgress,
    [0, 100],
    [CIRCUMFERENCE, 0]
  );
  const displayValue = useTransform(springProgress, (v) => Math.round(v));
  const [displayNumber, setDisplayNumber] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    springProgress.set(mainProgress);

    const unsubscribe = displayValue.on('change', (v) => {
      setDisplayNumber(v);
    });

    return () => unsubscribe();
  }, [mainProgress, springProgress, displayValue]);

  // Position mini metrics around the ring (bottom half to avoid title)
  const getMetricPosition = (index: number, total: number) => {
    if (total === 1) {
      // Single metric: position at bottom
      const angle = 90 * (Math.PI / 180);
      const distance = RADIUS + 45;
      return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
    }

    // Multiple metrics: spread across bottom arc (from bottom-left to bottom-right)
    const startAngle = 150; // bottom-left
    const endAngle = 30; // bottom-right
    const spreadAngle = 360 - startAngle + endAngle; // going clockwise through bottom
    const angleStep = spreadAngle / (total - 1);
    const angle = (startAngle + index * angleStep) * (Math.PI / 180);

    const distance = RADIUS + 45;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  };

  return (
    <BentoCard gridArea="progress" variant="default">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '280px',
        position: 'relative',
      }}>
        {/* Header */}
        <motion.h3
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            fontSize: '15px',
            fontWeight: '600',
            color: '#2D2D2D',
          }}
        >
          Overall Progress
        </motion.h3>

        {/* Main ring container */}
        <div style={{
          position: 'relative',
          width: SIZE,
          height: SIZE,
          marginTop: '20px',
        }}>
          {/* SVG Progress Ring */}
          <svg
            width={SIZE}
            height={SIZE}
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Gradient definition */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D9A299" />
                <stop offset="100%" stopColor="#DCC5B2" />
              </linearGradient>
            </defs>

            {/* Background circle */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#F0E4D3"
              strokeWidth={STROKE_WIDTH}
            />

            {/* Progress circle */}
            <motion.circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              style={{ strokeDashoffset }}
            />
          </svg>

          {/* Center content - glassmorphism */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              x: '-50%',
              y: '-50%',
              width: SIZE - STROKE_WIDTH * 4,
              height: SIZE - STROKE_WIDTH * 4,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.05)',
            }}
          >
            <motion.span
              style={{
                fontSize: '42px',
                fontWeight: '700',
                color: '#2D2D2D',
                lineHeight: 1,
              }}
            >
              {displayNumber}%
            </motion.span>
            <span style={{
              fontSize: '13px',
              color: '#6B6B6B',
              marginTop: '4px',
            }}>
              {mainLabel}
            </span>
          </motion.div>

          {/* Mini metrics orbiting */}
          {metrics.map((metric, index) => {
            const pos = getMetricPosition(index, metrics.length);
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{
                  delay: 0.8 + index * 0.15,
                  type: 'spring',
                  stiffness: 100,
                }}
                whileHover={{
                  scale: 1.1,
                  boxShadow: `0 4px 20px ${metric.color}40`,
                }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  x: `calc(-50% + ${pos.x}px)`,
                  y: `calc(-50% + ${pos.y}px)`,
                  background: 'white',
                  borderRadius: '20px',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #F0E4D3',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: metric.color,
                    boxShadow: `0 0 8px ${metric.color}60`,
                  }}
                />
                <span style={{ fontSize: '12px', color: '#6B6B6B' }}>
                  {metric.label}
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#2D2D2D',
                }}>
                  {metric.value}%
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </BentoCard>
  );
}
