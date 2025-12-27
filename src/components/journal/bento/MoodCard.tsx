'use client';

import { motion } from 'framer-motion';

interface MoodCardProps {
  currentMood: number | null;
}

const MOOD_CONFIG: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: '😢', label: 'Very Low', color: '#EF4444' },
  2: { emoji: '😞', label: 'Low', color: '#F97316' },
  3: { emoji: '😔', label: 'Down', color: '#F59E0B' },
  4: { emoji: '😕', label: 'Meh', color: '#EAB308' },
  5: { emoji: '😐', label: 'Neutral', color: '#84CC16' },
  6: { emoji: '🙂', label: 'Okay', color: '#22C55E' },
  7: { emoji: '😊', label: 'Good', color: '#10B981' },
  8: { emoji: '😄', label: 'Great', color: '#14B8A6' },
  9: { emoji: '😁', label: 'Amazing', color: '#06B6D4' },
  10: { emoji: '🤩', label: 'Fantastic', color: '#7AAFC9' },
};

export default function MoodCard({ currentMood }: MoodCardProps) {
  const mood = currentMood ? Math.max(1, Math.min(10, Math.round(currentMood))) : null;
  const moodData = mood ? MOOD_CONFIG[mood] : null;

  if (!mood || !moodData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid #DCC5B2',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>😶</div>
        <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
          No mood tracked yet
        </div>
      </motion.div>
    );
  }

  const progressPercentage = (mood / 10) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid #DCC5B2',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Mood glow */}
      <motion.div
        animate={{
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ repeat: Infinity, duration: 3 }}
        style={{
          position: 'absolute',
          top: '-30%',
          right: '-30%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${moodData.color} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{ fontSize: '42px' }}
          >
            {moodData.emoji}
          </motion.div>

          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '12px',
              color: '#6B6B6B',
              fontWeight: '500',
              marginBottom: '4px',
            }}>
              Average Mood
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: moodData.color,
            }}>
              {moodData.label}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#9CA3AF',
              fontWeight: '600',
            }}>
              {mood}/10
            </div>
          </div>
        </div>

        {/* Mood bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: '16px',
            height: '8px',
            background: '#F0E4D3',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${moodData.color}88 0%, ${moodData.color} 100%)`,
              borderRadius: '4px',
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
