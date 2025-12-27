'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface HealthScoreCardProps {
  score: number;
  weeklyImprovement?: number;
  previousScore?: number;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return { primary: '#7AB89E', secondary: '#10B981' };
  if (score >= 60) return { primary: '#7AAFC9', secondary: '#3B82F6' };
  if (score >= 40) return { primary: '#E4B17A', secondary: '#F59E0B' };
  return { primary: '#D9A299', secondary: '#EF4444' };
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
};

export default function HealthScoreCard({
  score,
  weeklyImprovement,
  previousScore,
}: HealthScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  // Animate the score counter
  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const startScore = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(startScore + (score - startScore) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '32px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 12px 40px ${colors.primary}40`,
      }}
    >
      {/* Background decoration */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-30%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          pointerEvents: 'none',
        }}
      />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Circular Progress */}
        <div style={{ position: 'relative', width: '140px', height: '140px' }}>
          {/* Background circle */}
          <svg
            width="140"
            height="140"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="12"
            />
          </svg>

          {/* Progress circle */}
          <svg
            width="140"
            height="140"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: 'rotate(-90deg)',
            }}
          >
            <motion.circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke="white"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{
                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))',
              }}
            />
          </svg>

          {/* Score display */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            <motion.div
              key={displayScore}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              style={{
                fontSize: '36px',
                fontWeight: '800',
                lineHeight: 1,
              }}
            >
              {displayScore}
            </motion.div>
            <div style={{
              fontSize: '12px',
              opacity: 0.9,
              marginTop: '4px',
              fontWeight: '500',
            }}>
              / 100
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            opacity: 0.9,
            marginBottom: '8px',
            fontWeight: '500',
          }}>
            Overall Health Score
          </div>
          <motion.div
            key={getScoreLabel(score)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '12px',
            }}
          >
            {getScoreLabel(score)}
          </motion.div>

          {/* Weekly improvement */}
          {weeklyImprovement !== undefined && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              <motion.span
                animate={{ y: weeklyImprovement > 0 ? [-2, 2, -2] : [2, -2, 2] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                {weeklyImprovement > 0 ? '↑' : weeklyImprovement < 0 ? '↓' : '→'}
              </motion.span>
              {weeklyImprovement > 0 ? '+' : ''}{weeklyImprovement.toFixed(1)}% this week
            </motion.div>
          )}

          {/* Comparison with previous */}
          {previousScore !== undefined && previousScore !== score && (
            <div style={{
              marginTop: '12px',
              fontSize: '12px',
              opacity: 0.8,
            }}>
              Previous: {previousScore} ({score > previousScore ? '+' : ''}{score - previousScore})
            </div>
          )}
        </div>
      </div>

      {/* Mini sparkline visualization */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '24px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '2px',
        opacity: 0.4,
      }}>
        {[65, 70, 68, 75, 72, 78, score].map((val, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${val / 2}px` }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
            style={{
              width: '4px',
              background: 'white',
              borderRadius: '2px',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
