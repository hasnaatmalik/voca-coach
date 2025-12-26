'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// SVG Icon Components
const ChartIcon = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const ClipboardIcon = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const TargetIcon = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const MicIcon = ({ color = 'currentColor', size = 28 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const TrendUpIcon = ({ color = '#7AAFC9', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const ExportIcon = ({ color = '#6B6B6B', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const BellIcon = ({ color = '#6B6B6B', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

interface BiomarkersHeroProps {
  activeView: 'overview' | 'history' | 'goals';
  onViewChange: (view: 'overview' | 'history' | 'goals') => void;
  onRecordClick: () => void;
  onExportClick: () => void;
  onAlertsClick: () => void;
  recordingsCount: number;
  isRecording?: boolean;
}

export default function BiomarkersHero({
  activeView,
  onViewChange,
  onRecordClick,
  onExportClick,
  onAlertsClick,
  recordingsCount,
  isRecording,
}: BiomarkersHeroProps) {
  const viewModes: { id: 'overview' | 'history' | 'goals'; label: string; icon: ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <ChartIcon /> },
    { id: 'history', label: 'History', icon: <ClipboardIcon /> },
    { id: 'goals', label: 'Goals', icon: <TargetIcon /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 50%, rgba(122, 175, 201, 0.2) 100%)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '24px',
        border: '1px solid #DCC5B2',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating decorative elements */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, 0],
        }}
        transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          right: '8%',
          top: '15%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(122, 175, 201, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{
          y: [0, 10, 0],
          x: [0, -8, 0],
        }}
        transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          right: '20%',
          bottom: '10%',
          width: '80px',
          height: '80px',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          background: 'rgba(217, 162, 153, 0.15)',
          pointerEvents: 'none',
        }}
      />

      {/* Waveform decoration */}
      <motion.div
        style={{
          position: 'absolute',
          right: '5%',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: [20, 40 + Math.random() * 30, 20],
            }}
            transition={{
              repeat: Infinity,
              duration: 1 + Math.random() * 0.5,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
            style={{
              width: '4px',
              borderRadius: '2px',
              background: 'linear-gradient(180deg, #7AAFC9 0%, #D9A299 100%)',
            }}
          />
        ))}
      </motion.div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '20px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Left side - Title & Stats */}
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#2D2D2D',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span>Voice Biomarkers</span>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <MicIcon color="#D9A299" size={28} />
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              color: '#6B6B6B',
              fontSize: '15px',
              marginBottom: '16px',
            }}
          >
            Track and analyze your vocal health patterns over time
          </motion.p>

          {/* Stats badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(122, 175, 201, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <TrendUpIcon color="#7AAFC9" size={16} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#7AAFC9' }}>
                {recordingsCount} Recordings
              </span>
            </div>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#EF4444',
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444' }}>
                  Recording...
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Right side - Controls */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '12px',
        }}>
          {/* View Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '14px',
              padding: '4px',
              border: '1px solid rgba(220, 197, 178, 0.5)',
            }}
          >
            {viewModes.map((mode) => (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewChange(mode.id)}
                style={{
                  padding: '10px 18px',
                  background: activeView === mode.id
                    ? 'linear-gradient(135deg, #7AAFC9 0%, #5A9BB8 100%)'
                    : 'transparent',
                  color: activeView === mode.id ? 'white' : '#6B6B6B',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <span>{mode.icon}</span>
                {mode.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'flex',
              gap: '8px',
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(122, 175, 201, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onRecordClick}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(217, 162, 153, 0.25)',
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <MicIcon color="white" size={18} />
              </motion.span>
              Record Sample
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExportClick}
              style={{
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #DCC5B2',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                color: '#6B6B6B',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ExportIcon color="#6B6B6B" size={16} />
              Export
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAlertsClick}
              style={{
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #DCC5B2',
                borderRadius: '12px',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Alert Settings"
            >
              <BellIcon color="#6B6B6B" size={18} />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
