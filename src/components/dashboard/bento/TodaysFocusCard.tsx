'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import BentoCard from './BentoCard';

interface Exercise {
  id: string;
  title: string;
  completed: boolean;
}

interface TodaysFocusCardProps {
  focusArea: string;
  description?: string;
  exercises: Exercise[];
  onToggleExercise?: (id: string) => void;
}

function ConfettiPop() {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i * 360) / 8,
    color: ['#D9A299', '#7AB89E', '#E4B17A', '#7AAFC9'][i % 4],
  }));

  return (
    <div style={{ position: 'absolute', left: '50%', top: '50%', pointerEvents: 'none' }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            scale: 0,
            x: 0,
            y: 0,
            opacity: 1,
          }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos((p.angle * Math.PI) / 180) * 30,
            y: Math.sin((p.angle * Math.PI) / 180) * 30,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

export default function TodaysFocusCard({
  focusArea,
  description = 'Focus on building stronger connections through mindful listening.',
  exercises,
  onToggleExercise,
}: TodaysFocusCardProps) {
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const completedCount = exercises.filter((e) => e.completed).length;

  const handleToggle = (id: string, wasCompleted: boolean) => {
    if (!wasCompleted) {
      setCelebratingId(id);
      setTimeout(() => setCelebratingId(null), 500);
    }
    onToggleExercise?.(id);
  };

  return (
    <BentoCard
      gridArea="focus"
      style={{
        background: 'linear-gradient(180deg, #F0E4D3 0%, #FAF7F3 100%)',
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '280px',
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            background: 'white',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D9A299" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" fill="#D9A299" />
            </svg>
          </div>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#2D2D2D',
          }}>
            Today&apos;s Focus
          </h3>
        </motion.div>

        {/* Focus area */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#2D2D2D',
            marginBottom: '8px',
          }}
        >
          {focusArea}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: '14px',
            color: '#6B6B6B',
            lineHeight: 1.5,
            marginBottom: '16px',
          }}
        >
          {description}
        </motion.p>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          <div style={{
            flex: 1,
            height: '6px',
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / exercises.length) * 100}%` }}
              transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #7AB89E, #D9A299)',
                borderRadius: '3px',
              }}
            />
          </div>
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#6B6B6B',
            whiteSpace: 'nowrap',
          }}>
            {completedCount} of {exercises.length}
          </span>
        </motion.div>

        {/* Exercises checklist */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <AnimatePresence>
            {exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={() => handleToggle(exercise.id, exercise.completed)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {/* Checkbox */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    border: exercise.completed
                      ? '2px solid #7AB89E'
                      : '2px solid #DCC5B2',
                    background: exercise.completed ? '#7AB89E' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  <AnimatePresence>
                    {exercise.completed && (
                      <motion.svg
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    )}
                  </AnimatePresence>

                  {/* Confetti */}
                  {celebratingId === exercise.id && <ConfettiPop />}
                </motion.div>

                {/* Exercise title */}
                <span style={{
                  fontSize: '14px',
                  color: exercise.completed ? '#9B9B9B' : '#2D2D2D',
                  textDecoration: exercise.completed ? 'line-through' : 'none',
                  transition: 'all 0.2s',
                }}>
                  {exercise.title}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Decorative shape */}
        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            right: '-20px',
            bottom: '-20px',
            width: '100px',
            height: '100px',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            background: 'linear-gradient(135deg, rgba(217, 162, 153, 0.2) 0%, rgba(240, 228, 211, 0.3) 100%)',
            zIndex: 0,
          }}
        />
      </div>
    </BentoCard>
  );
}
