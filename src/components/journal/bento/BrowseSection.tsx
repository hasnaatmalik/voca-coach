'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// SVG Icon Components
const BookIcon = ({ color = 'currentColor', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ChartIcon = ({ color = 'currentColor', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const LightbulbIcon = ({ color = 'currentColor', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

type ViewMode = 'chat' | 'write' | 'gratitude' | 'cbt' | 'voice' | 'history' | 'analytics' | 'prompts';

interface BrowseSectionProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

interface NavItem {
  mode: ViewMode;
  icon: ReactNode;
  label: string;
  color: string;
}

const NAVIGATION_ITEMS: NavItem[] = [
  { mode: 'history', icon: <BookIcon color="#7AAFC9" size={18} />, label: 'History', color: '#7AAFC9' },
  { mode: 'analytics', icon: <ChartIcon color="#7AB89E" size={18} />, label: 'Analytics', color: '#7AB89E' },
  { mode: 'prompts', icon: <LightbulbIcon color="#E4B17A" size={18} />, label: 'Prompts', color: '#E4B17A' },
];

export default function BrowseSection({ viewMode, onViewChange }: BrowseSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
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
        Browse
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {NAVIGATION_ITEMS.map((item, index) => {
          const isActive = viewMode === item.mode;
          return (
            <motion.button
              key={item.mode}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              whileHover={{
                scale: 1.02,
                x: 4,
                background: '#FAF7F3',
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewChange(item.mode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '14px',
                border: 'none',
                background: isActive ? '#FAF7F3' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.3 }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: isActive ? `${item.color}20` : '#F0E4D3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </motion.div>

              <span style={{
                fontSize: '15px',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? item.color : '#4B5563',
              }}>
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    marginLeft: 'auto',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: item.color,
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
