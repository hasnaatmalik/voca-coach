'use client';

import { motion } from 'framer-motion';

// SVG Icon Components
const FlameIcon = ({ color = 'white', size = 28 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const PencilIcon = ({ color = 'white', size = 28 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const DocumentIcon = ({ color = 'white', size = 28 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

interface JournalHeroProps {
  userName: string;
  currentStreak: number;
  totalEntries: number;
}

export default function JournalHero({
  userName,
  currentStreak,
  totalEntries,
}: JournalHeroProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        background: 'linear-gradient(135deg, #D9A299 0%, #C8847A 50%, #B4706A 100%)',
        borderRadius: '28px',
        padding: '40px 48px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '24px',
      }}
    >
      {/* Floating decorations */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, 0],
        }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '20px',
          right: '120px',
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
        }}
      />
      <motion.div
        animate={{
          y: [0, 10, 0],
          rotate: [0, -5, 0],
        }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '60px',
          width: '120px',
          height: '120px',
          borderRadius: '30px',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Floating pen icon */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: [-5, 5, -5],
        }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '40px',
          right: '180px',
          opacity: 0.3,
        }}
      >
        <PencilIcon color="white" size={40} />
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 8px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}>
            {getGreeting()}, {userName}
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.85)',
            margin: 0,
          }}>
            Reflect, grow, and understand yourself better
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '28px',
          }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <FlameIcon color="white" size={28} />
            </motion.span>
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'white',
              }}>
                {currentStreak}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: '500',
              }}>
                Day Streak
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}><DocumentIcon color="white" size={28} /></span>
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'white',
              }}>
                {totalEntries}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: '500',
              }}>
                Total Entries
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
