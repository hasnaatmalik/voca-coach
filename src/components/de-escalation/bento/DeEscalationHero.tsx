'use client';

import { motion } from 'framer-motion';

// SVG Icon Components
const MicIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const MeditationIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="6" r="3" />
    <path d="M12 9v3" />
    <path d="M6 15c0-2 1.5-3 3-3h6c1.5 0 3 1 3 3" />
    <path d="M4 20c0-1.5 1-3 4-3h8c3 0 4 1.5 4 3" />
    <path d="M9 21v-2" />
    <path d="M15 21v-2" />
  </svg>
);

const ChartIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const MaskIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

interface DeEscalationHeroProps {
  isRecording: boolean;
  sessionTime: number;
  stressLevel: number;
  onViewModeChange: (mode: 'session' | 'techniques' | 'progress') => void;
  currentViewMode: 'session' | 'techniques' | 'progress';
  onOpenScenarios: () => void;
  onOpenVoiceSettings: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getStressGradient = (level: number) => {
  if (level < 0.3) return 'linear-gradient(135deg, #7AB89E 0%, #10B981 100%)';
  if (level < 0.5) return 'linear-gradient(135deg, #E4B17A 0%, #F59E0B 100%)';
  if (level < 0.7) return 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)';
  return 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
};

export default function DeEscalationHero({
  isRecording,
  sessionTime,
  stressLevel,
  onViewModeChange,
  currentViewMode,
  onOpenScenarios,
  onOpenVoiceSettings,
}: DeEscalationHeroProps) {
  const viewModes = [
    { id: 'session', label: 'Session', icon: MicIcon },
    { id: 'techniques', label: 'Techniques', icon: MeditationIcon },
    { id: 'progress', label: 'Progress', icon: ChartIcon },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 50%, rgba(217, 162, 153, 0.3) 100%)',
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
          y: [0, -10, 0],
          rotate: [0, 5, 0],
        }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          right: '10%',
          top: '20%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217, 162, 153, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{
          y: [0, 8, 0],
          x: [0, -5, 0],
        }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          right: '25%',
          bottom: '10%',
          width: '60px',
          height: '60px',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          background: 'rgba(122, 184, 158, 0.15)',
          pointerEvents: 'none',
        }}
      />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '20px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Left side - Title & Session Info */}
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
            }}
          >
            De-Escalation Training
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
            Practice calming techniques with real-time voice analysis
          </motion.p>

          {/* Live Session Badge */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(239, 68, 68, 0.4)',
                    '0 0 0 8px rgba(239, 68, 68, 0)',
                  ],
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#EF4444',
                }}
              />
              <span style={{
                fontSize: '24px',
                fontWeight: '700',
                fontFamily: 'monospace',
                color: '#2D2D2D',
              }}>
                {formatTime(sessionTime)}
              </span>
              <motion.div
                style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  background: getStressGradient(stressLevel),
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                {stressLevel < 0.3 ? 'Calm' : stressLevel < 0.5 ? 'Moderate' : stressLevel < 0.7 ? 'Elevated' : 'High'}
              </motion.div>
            </motion.div>
          )}
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
                onClick={() => onViewModeChange(mode.id)}
                style={{
                  padding: '10px 18px',
                  background: currentViewMode === mode.id
                    ? 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)'
                    : 'transparent',
                  color: currentViewMode === mode.id ? 'white' : '#6B6B6B',
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
                <mode.icon color={currentViewMode === mode.id ? 'white' : '#6B6B6B'} />
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
              whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(217, 162, 153, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenScenarios}
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
              <MaskIcon color="white" />
              Scenarios
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenVoiceSettings}
              style={{
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #DCC5B2',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
              }}
              title="Voice Settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D9A299" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
