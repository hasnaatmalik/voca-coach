'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// SVG Icon Components
const NotesIcon = ({ color = '#7AAFC9', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const FlameIcon = ({ color = '#D9A299', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const TrophyIcon = ({ color = '#7AB89E', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

interface StatItem {
  value: number;
  label: string;
  icon: ReactNode;
  color: string;
}

interface JournalStatsCardProps {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
}

export default function JournalStatsCard({
  totalEntries,
  currentStreak,
  longestStreak,
}: JournalStatsCardProps) {
  const stats: StatItem[] = [
    {
      value: totalEntries,
      label: 'Entries',
      icon: <NotesIcon color="#7AAFC9" size={20} />,
      color: '#7AAFC9',
    },
    {
      value: currentStreak,
      label: 'Streak',
      icon: <FlameIcon color="#D9A299" size={20} />,
      color: '#D9A299',
    },
    {
      value: longestStreak,
      label: 'Best',
      icon: <TrophyIcon color="#7AB89E" size={20} />,
      color: '#7AB89E',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
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
        Your Journey
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '12px 8px',
              borderRadius: '14px',
              background: `${stat.color}10`,
            }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: index * 0.5 }}
              style={{ marginBottom: '4px', display: 'flex', justifyContent: 'center' }}
            >
              {stat.icon}
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
              style={{
                fontSize: '22px',
                fontWeight: '700',
                color: stat.color,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </motion.div>

            <div style={{
              fontSize: '11px',
              color: '#9CA3AF',
              marginTop: '4px',
              fontWeight: '500',
            }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
