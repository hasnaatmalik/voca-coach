'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// SVG Icon Components
const TargetIcon = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const BookIcon = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ChartIcon = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

type ViewMode = 'preview' | 'chat' | 'create' | 'edit' | 'history' | 'analytics' | 'scenarios';

interface QuickActionsBarProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

const ACTIONS: { mode: ViewMode; icon: ReactNode; iconActive: ReactNode; label: string }[] = [
  { mode: 'scenarios', icon: <TargetIcon color="#6B6B6B" size={16} />, iconActive: <TargetIcon color="white" size={16} />, label: 'Scenarios' },
  { mode: 'history', icon: <BookIcon color="#6B6B6B" size={16} />, iconActive: <BookIcon color="white" size={16} />, label: 'History' },
  { mode: 'analytics', icon: <ChartIcon color="#6B6B6B" size={16} />, iconActive: <ChartIcon color="white" size={16} />, label: 'Analytics' },
];

export default function QuickActionsBar({ viewMode, onViewChange }: QuickActionsBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'inline-flex',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '6px',
        border: '1px solid #DCC5B2',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
      }}
    >
      {ACTIONS.map((action, index) => {
        const isActive = viewMode === action.mode;
        return (
          <motion.button
            key={action.mode}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange(action.mode)}
            style={{
              padding: '10px 18px',
              background: isActive
                ? 'linear-gradient(135deg, #7AAFC9 0%, #5A9BB8 100%)'
                : 'transparent',
              color: isActive ? 'white' : '#6B6B6B',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>{isActive ? action.iconActive : action.icon}</span>
            <span>{action.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
