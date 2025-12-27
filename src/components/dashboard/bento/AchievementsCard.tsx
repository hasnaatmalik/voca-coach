'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import BentoCard from './BentoCard';
import type { DashboardAchievement } from '@/types/dashboard';

interface AchievementsCardProps {
  streak: number;
  longestStreak?: number;
  achievements: DashboardAchievement[];
}

const MILESTONES = [3, 7, 14, 30, 60, 100];

function getNextMilestone(currentStreak: number): number {
  for (const milestone of MILESTONES) {
    if (currentStreak < milestone) return milestone;
  }
  return currentStreak + 30; // After 100, add 30 more
}

function getWeekDots(streak: number): boolean[] {
  return Array.from({ length: 7 }, (_, i) => i < Math.min(streak, 7));
}

export default function AchievementsCard({
  streak,
  longestStreak = streak,
  achievements,
}: AchievementsCardProps) {
  const nextMilestone = useMemo(() => getNextMilestone(streak), [streak]);
  const weekDots = useMemo(() => getWeekDots(streak), [streak]);
  const progressToMilestone = useMemo(() => {
    const prevMilestone = MILESTONES.find((m, i) =>
      m <= streak && (!MILESTONES[i + 1] || MILESTONES[i + 1] > streak)
    ) || 0;
    return ((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
  }, [streak, nextMilestone]);

  const daysToMilestone = nextMilestone - streak;
  const displayAchievements = achievements.slice(0, 5);

  return (
    <BentoCard gridArea="achievements">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '220px',
      }}>
        {/* Header */}
        <h3 style={{
          fontSize: '15px',
          fontWeight: '600',
          color: '#2D2D2D',
          marginBottom: '16px',
        }}>
          Achievements & Streak
        </h3>

        {/* Streak display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px',
        }}>
          {/* Streak icon with animation */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut',
            }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: streak === 0
                ? '#E5E7EB'
                : 'linear-gradient(135deg, #E4B17A 0%, #D9A299 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: streak === 0 ? 'none' : '0 4px 12px rgba(228, 177, 122, 0.3)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </motion.div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <motion.span
                key={streak}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#2D2D2D',
                }}
              >
                {streak}
              </motion.span>
              <span style={{
                fontSize: '14px',
                color: '#6B6B6B',
              }}>
                day streak
              </span>
            </div>
            {longestStreak > streak && (
              <span style={{
                fontSize: '12px',
                color: '#9B9B9B',
              }}>
                Best: {longestStreak} days
              </span>
            )}
          </div>
        </div>

        {/* Week calendar dots */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
        }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{
                fontSize: '10px',
                color: '#9B9B9B',
                fontWeight: '500',
              }}>
                {day}
              </span>
              <motion.div
                animate={weekDots[index] ? {
                  background: '#7AB89E',
                  boxShadow: '0 0 8px rgba(122, 184, 158, 0.4)',
                } : {}}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: weekDots[index] ? '#7AB89E' : '#F0E4D3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {weekDots[index] && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                  >
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </motion.svg>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Milestone progress */}
        <div style={{
          background: '#FAF7F3',
          borderRadius: '12px',
          padding: '12px 14px',
          marginBottom: '16px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: '12px', color: '#6B6B6B' }}>
              {daysToMilestone} more day{daysToMilestone !== 1 ? 's' : ''} to {nextMilestone}-day badge!
            </span>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              background: 'rgba(217, 162, 153, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D9A299" strokeWidth="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 22V8a4 4 0 0 1 4 0v14" />
                <circle cx="12" cy="8" r="4" />
              </svg>
            </div>
          </div>
          <div style={{
            height: '6px',
            background: '#F0E4D3',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToMilestone}%` }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #D9A299, #E4B17A)',
                borderRadius: '3px',
              }}
            />
          </div>
        </div>

        {/* Badges */}
        {displayAchievements.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}>
            {displayAchievements.map((achievement, index) => {
              const isUnlocked = !!achievement.unlockedAt;
              const isNewest = index === 0 && isUnlocked;

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  style={{
                    position: 'relative',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: isUnlocked
                      ? 'linear-gradient(135deg, #D9A299 0%, #E4B17A 100%)'
                      : '#E0E0E0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    filter: isUnlocked ? 'none' : 'grayscale(1)',
                    opacity: isUnlocked ? 1 : 0.5,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {achievement.icon}

                  {/* Sparkle for newest */}
                  {isNewest && (
                    <motion.div
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                      }}
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#7AB89E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </motion.div>
                  )}

                  {/* Progress ring for locked */}
                  {!isUnlocked && achievement.progress !== undefined && (
                    <svg
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transform: 'rotate(-90deg)',
                      }}
                      width="44"
                      height="44"
                    >
                      <circle
                        cx="22"
                        cy="22"
                        r="20"
                        fill="none"
                        stroke="#D9A299"
                        strokeWidth="2"
                        strokeDasharray={`${(achievement.progress / 100) * 126} 126`}
                        opacity={0.5}
                      />
                    </svg>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </BentoCard>
  );
}
