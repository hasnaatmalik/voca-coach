'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

// SVG Face Icons for stress levels
const CalmFaceIcon = ({ color = '#7AB89E' }: { color?: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const NeutralFaceIcon = ({ color = '#E4B17A' }: { color?: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="15" x2="16" y2="15" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const WorriedFaceIcon = ({ color = '#F97316' }: { color?: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const StressedFaceIcon = ({ color = '#EF4444' }: { color?: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <path d="M7.5 7l2 1" />
    <path d="M16.5 7l-2 1" />
  </svg>
);

interface StressIndicatorProps {
  stressLevel: number;
  isRecording: boolean;
  showDetails?: boolean;
}

const getStressConfig = (level: number): {
  color: string;
  gradient: string;
  label: string;
  description: string;
  icon: ReactNode;
  pulseSpeed: number;
} => {
  if (level < 0.3) {
    return {
      color: '#7AB89E',
      gradient: 'linear-gradient(135deg, #7AB89E 0%, #10B981 100%)',
      label: 'Calm',
      description: 'Your voice is steady and relaxed',
      icon: <CalmFaceIcon />,
      pulseSpeed: 3,
    };
  }
  if (level < 0.5) {
    return {
      color: '#E4B17A',
      gradient: 'linear-gradient(135deg, #E4B17A 0%, #F59E0B 100%)',
      label: 'Moderate',
      description: 'Slight tension detected',
      icon: <NeutralFaceIcon />,
      pulseSpeed: 2,
    };
  }
  if (level < 0.7) {
    return {
      color: '#F97316',
      gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
      label: 'Elevated',
      description: 'Try a breathing technique',
      icon: <WorriedFaceIcon />,
      pulseSpeed: 1.5,
    };
  }
  return {
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    label: 'High Stress',
    description: 'Take a moment to breathe deeply',
    icon: <StressedFaceIcon />,
    pulseSpeed: 1,
  };
};

export default function StressIndicator({
  stressLevel,
  isRecording,
  showDetails = true,
}: StressIndicatorProps) {
  const config = getStressConfig(stressLevel);
  const percentage = Math.round(stressLevel * 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (stressLevel * circumference);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '28px',
        border: '1px solid #DCC5B2',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#2D2D2D',
          margin: 0,
        }}>
          Stress Level
        </h3>
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '20px',
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#EF4444',
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#EF4444' }}>
                LIVE
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Circular Gauge */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px',
      }}>
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
              r="45"
              fill="none"
              stroke="#F0E4D3"
              strokeWidth="10"
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
              r="45"
              fill="none"
              stroke={config.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                filter: `drop-shadow(0 0 8px ${config.color}40)`,
              }}
            />
          </svg>

          {/* Pulsing glow effect */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.05, 1],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  repeat: Infinity,
                  duration: config.pulseSpeed,
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${config.color}30 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />
            )}
          </AnimatePresence>

          {/* Center content */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            <motion.div
              key={percentage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ marginBottom: '2px' }}
            >
              {config.icon}
            </motion.div>
            <motion.span
              key={`${percentage}-value`}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: config.color,
              }}
            >
              {percentage}%
            </motion.span>
          </div>
        </div>
      </div>

      {/* Status Label */}
      <motion.div
        key={config.label}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          padding: '12px 20px',
          background: config.gradient,
          borderRadius: '14px',
          marginBottom: showDetails ? '16px' : 0,
        }}
      >
        <span style={{
          fontSize: '16px',
          fontWeight: '700',
          color: 'white',
        }}>
          {config.label}
        </span>
      </motion.div>

      {/* Description */}
      <AnimatePresence>
        {showDetails && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              fontSize: '14px',
              color: '#6B6B6B',
              textAlign: 'center',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {config.description}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Mini stress history (when recording) */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              marginTop: '20px',
              padding: '16px',
              background: '#FAF7F3',
              borderRadius: '12px',
              border: '1px solid #F0E4D3',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B6B6B' }}>
                Session Trend
              </span>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                Last 30s
              </span>
            </div>

            {/* Mini bar chart */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '3px',
              height: '40px',
            }}>
              {[0.4, 0.5, 0.6, 0.55, 0.45, 0.4, 0.35, stressLevel].map((level, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${level * 100}%` }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  style={{
                    flex: 1,
                    background: i === 7 ? config.gradient : '#DCC5B2',
                    borderRadius: '2px',
                    minHeight: '4px',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
