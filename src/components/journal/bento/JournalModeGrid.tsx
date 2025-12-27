'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// SVG Icon Components
const ChatIcon = ({ color = 'currentColor', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const PencilIcon = ({ color = 'currentColor', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const HeartHandsIcon = ({ color = 'currentColor', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M11 14h2" />
    <path d="M12 14v6" />
    <path d="M4 9.5a3.5 3.5 0 1 1 7 0V11h2V9.5a3.5 3.5 0 1 1 7 0V16c0 2.21-1.79 4-4 4H8c-2.21 0-4-1.79-4-4V9.5z" />
  </svg>
);

const BrainIcon = ({ color = 'currentColor', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M12 18v4" />
  </svg>
);

const MicIcon = ({ color = 'currentColor', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

type ViewMode = 'chat' | 'write' | 'gratitude' | 'cbt' | 'voice' | 'history' | 'analytics' | 'prompts';

interface JournalModeGridProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

interface ModeItem {
  mode: ViewMode;
  icon: ReactNode;
  iconActive: ReactNode;
  label: string;
  description: string;
  gradient: string;
}

const MODES: ModeItem[] = [
  {
    mode: 'chat',
    icon: <ChatIcon color="#7AAFC9" size={20} />,
    iconActive: <ChatIcon color="white" size={20} />,
    label: 'Chat',
    description: 'Guided reflection',
    gradient: 'linear-gradient(135deg, #7AAFC9 0%, #5A9BB8 100%)',
  },
  {
    mode: 'write',
    icon: <PencilIcon color="#7AB89E" size={20} />,
    iconActive: <PencilIcon color="white" size={20} />,
    label: 'Write',
    description: 'Free journaling',
    gradient: 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)',
  },
  {
    mode: 'gratitude',
    icon: <HeartHandsIcon color="#E4B17A" size={20} />,
    iconActive: <HeartHandsIcon color="white" size={20} />,
    label: 'Gratitude',
    description: 'Daily thankfulness',
    gradient: 'linear-gradient(135deg, #E4B17A 0%, #D4A06A 100%)',
  },
  {
    mode: 'cbt',
    icon: <BrainIcon color="#A78BFA" size={20} />,
    iconActive: <BrainIcon color="white" size={20} />,
    label: 'CBT',
    description: 'Thought exercises',
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
  },
  {
    mode: 'voice',
    icon: <MicIcon color="#D9A299" size={20} />,
    iconActive: <MicIcon color="white" size={20} />,
    label: 'Voice',
    description: 'Speak your thoughts',
    gradient: 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)',
  },
];

export default function JournalModeGrid({ viewMode, onViewChange }: JournalModeGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '20px',
        border: '1px solid #DCC5B2',
      }}
    >
      <div style={{
        fontSize: '12px',
        fontWeight: '600',
        color: '#6B6B6B',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '16px',
        paddingLeft: '4px',
      }}>
        Journal Mode
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {MODES.map((item, index) => {
          const isActive = viewMode === item.mode;
          return (
            <motion.button
              key={item.mode}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewChange(item.mode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '14px',
                border: isActive ? '2px solid transparent' : '1px solid transparent',
                background: isActive ? item.gradient : '#FAF7F3',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle shimmer on active */}
              {isActive && (
                <motion.div
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                    pointerEvents: 'none',
                  }}
                />
              )}

              <motion.div
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                {isActive ? item.iconActive : item.icon}
              </motion.div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: isActive ? 'white' : '#2D2D2D',
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: isActive ? 'rgba(255, 255, 255, 0.8)' : '#9CA3AF',
                  marginTop: '2px',
                }}>
                  {item.description}
                </div>
              </div>

              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
