'use client';

import { motion } from 'framer-motion';
import BentoCard from './BentoCard';

interface MoodData {
  emoji: string;
  label: string;
  value: number;
  color: string;
}

interface MoodTrackerCardProps {
  moods: MoodData[];
  dominantMood?: string;
}

const defaultMoods: MoodData[] = [
  { emoji: '😊', label: 'Happy', value: 0, color: '#7AB89E' },
  { emoji: '😌', label: 'Calm', value: 0, color: '#7AAFC9' },
  { emoji: '😐', label: 'Neutral', value: 0, color: '#9B9B9B' },
  { emoji: '😰', label: 'Anxious', value: 0, color: '#E4B17A' },
  { emoji: '😤', label: 'Frustrated', value: 0, color: '#D9A299' },
];

export default function MoodTrackerCard({
  moods = defaultMoods,
  dominantMood,
}: MoodTrackerCardProps) {
  const sortedMoods = [...moods].sort((a, b) => b.value - a.value);
  const highestMood = sortedMoods[0];
  const isDominant = (label: string) =>
    dominantMood ? label.toLowerCase() === dominantMood.toLowerCase() : label === highestMood?.label;

  return (
    <BentoCard gridArea="mood">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '240px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#2D2D2D',
          }}>
            Mood Analysis
          </h3>
          {highestMood && highestMood.value > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: `${highestMood.color}15`,
                borderRadius: '20px',
              }}
            >
              <span style={{ fontSize: '14px' }}>{highestMood.emoji}</span>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: highestMood.color,
              }}>
                Mostly {highestMood.label}
              </span>
            </motion.div>
          )}
        </div>

        {/* Emotion bars */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          flex: 1,
        }}>
          {moods.map((mood, index) => {
            const isHighest = isDominant(mood.label);
            return (
              <motion.div
                key={mood.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {/* Emoji */}
                <motion.span
                  animate={isHighest ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    fontSize: '20px',
                    width: '32px',
                    textAlign: 'center',
                    filter: isHighest ? 'none' : 'grayscale(0.3)',
                  }}
                >
                  {mood.emoji}
                </motion.span>

                {/* Label */}
                <span style={{
                  fontSize: '13px',
                  color: isHighest ? '#2D2D2D' : '#6B6B6B',
                  fontWeight: isHighest ? '600' : '400',
                  width: '70px',
                }}>
                  {mood.label}
                </span>

                {/* Progress bar */}
                <div style={{
                  flex: 1,
                  height: '8px',
                  background: '#F0E4D3',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${mood.value}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: mood.color,
                      borderRadius: '4px',
                      boxShadow: isHighest ? `0 0 12px ${mood.color}50` : 'none',
                    }}
                  />
                </div>

                {/* Percentage */}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: isHighest ? mood.color : '#9B9B9B',
                    width: '40px',
                    textAlign: 'right',
                  }}
                >
                  {mood.value}%
                </motion.span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </BentoCard>
  );
}
