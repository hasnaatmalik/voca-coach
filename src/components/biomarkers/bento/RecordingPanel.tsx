'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

// SVG Icon Components
const MicIcon = ({ color = 'white', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const LightbulbIcon = ({ color = '#E4B17A', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const HeadphonesIcon = ({ color = '#7AAFC9', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const RulerIcon = ({ color = '#D9A299', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21.3 8.7 8.7 21.3c-.4.4-1 .4-1.4 0L2.7 16.7c-.4-.4-.4-1 0-1.4L15.3 2.7c.4-.4 1-.4 1.4 0l4.6 4.6c.4.4.4 1 0 1.4z" />
    <line x1="9" y1="11" x2="11" y2="9" />
    <line x1="6" y1="14" x2="8" y2="12" />
    <line x1="12" y1="8" x2="14" y2="6" />
  </svg>
);

const SpeechIcon = ({ color = '#7AB89E', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 10h.01" />
    <path d="M12 10h.01" />
    <path d="M16 10h.01" />
  </svg>
);

const TimerIcon = ({ color = '#9CA3AF', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

interface TipItem {
  icon: ReactNode;
  text: string;
}

interface RecordingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function RecordingPanel({
  isOpen,
  onClose,
  children,
}: RecordingPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ type: 'spring' as const, stiffness: 100, damping: 20 }}
          style={{
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              padding: '32px',
              border: '2px solid #D9A299',
              boxShadow: '0 12px 40px rgba(217, 162, 153, 0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(217, 162, 153, 0.3)',
                  }}
                >
                  <MicIcon color="white" size={24} />
                </motion.div>
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#2D2D2D',
                    margin: 0,
                  }}>
                    Record Voice Sample
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6B6B6B',
                    margin: '4px 0 0 0',
                  }}>
                    Speak naturally for accurate biomarker analysis
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: '#FAF7F3',
                  border: '1px solid #DCC5B2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6B6B6B',
                }}
              >
                ×
              </motion.button>
            </div>

            {/* Animated waveform decoration */}
            <motion.div
              style={{
                position: 'absolute',
                top: '20px',
                right: '100px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                opacity: 0.15,
                pointerEvents: 'none',
              }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [15, 30 + Math.random() * 20, 15],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8 + Math.random() * 0.4,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                  style={{
                    width: '4px',
                    borderRadius: '2px',
                    background: '#D9A299',
                  }}
                />
              ))}
            </motion.div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {children}
            </div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                marginTop: '24px',
                padding: '16px 20px',
                background: '#FAF7F3',
                borderRadius: '14px',
                border: '1px solid #F0E4D3',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '12px',
              }}>
                <LightbulbIcon color="#E4B17A" size={16} />
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#2D2D2D',
                }}>
                  Recording Tips
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
              }}>
                {([
                  { icon: <HeadphonesIcon color="#7AAFC9" size={16} />, text: 'Use a quiet room' },
                  { icon: <RulerIcon color="#D9A299" size={16} />, text: 'Keep consistent distance' },
                  { icon: <SpeechIcon color="#7AB89E" size={16} />, text: 'Speak naturally' },
                  { icon: <TimerIcon color="#9CA3AF" size={16} />, text: 'Record for 30+ seconds' },
                ] as TipItem[]).map((tip, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: '#6B6B6B',
                    }}
                  >
                    {tip.icon}
                    <span>{tip.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
