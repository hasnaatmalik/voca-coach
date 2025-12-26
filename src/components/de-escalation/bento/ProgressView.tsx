'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// SVG Icon Components
const ChartIcon = ({ color = '#D9A299' }: { color?: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const MicIcon = ({ color = '#D9A299' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const ClockIcon = ({ color = '#7AAFC9' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const TrendDownIcon = ({ color = '#7AB89E' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const FireIcon = ({ color = '#E4B17A' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const StarIcon = ({ color = '#E4B17A' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const SadFaceIcon = ({ color = '#D9A299', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const NeutralFaceIcon = ({ color = '#E4B17A', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="15" x2="16" y2="15" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const SlightSmileFaceIcon = ({ color = '#7AB89E', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1 1.5 4 1.5 4-1.5 4-1.5" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const HappyFaceIcon = ({ color = '#10B981', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

interface SessionHistory {
  id: string;
  date: string;
  duration: number;
  stressReduction: number;
  techniques: string[];
  moodBefore: number;
  moodAfter: number;
}

interface ProgressStats {
  totalSessions: number;
  totalMinutes: number;
  avgStressReduction: number;
  currentStreak: number;
  longestStreak: number;
  favoriteTechnique: string;
}

interface ProgressViewProps {
  stats: ProgressStats;
  recentSessions: SessionHistory[];
  weeklyData?: { day: string; sessions: number; minutes: number }[];
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  return `${mins}m`;
};

const getMoodIcon = (mood: number): ReactNode => {
  if (mood <= 3) return <SadFaceIcon />;
  if (mood <= 5) return <NeutralFaceIcon />;
  if (mood <= 7) return <SlightSmileFaceIcon />;
  return <HappyFaceIcon />;
};

export default function ProgressView({
  stats,
  recentSessions,
  weeklyData = [
    { day: 'Mon', sessions: 2, minutes: 15 },
    { day: 'Tue', sessions: 1, minutes: 8 },
    { day: 'Wed', sessions: 3, minutes: 22 },
    { day: 'Thu', sessions: 0, minutes: 0 },
    { day: 'Fri', sessions: 2, minutes: 12 },
    { day: 'Sat', sessions: 1, minutes: 10 },
    { day: 'Sun', sessions: 0, minutes: 0 },
  ],
}: ProgressViewProps) {
  const maxMinutes = Math.max(...weeklyData.map((d) => d.minutes), 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
      }}
    >
      {/* Stats Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '28px',
          border: '1px solid #DCC5B2',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#2D2D2D',
            margin: 0,
          }}>
            Your Progress
          </h3>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <ChartIcon />
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {[
            { label: 'Total Sessions', value: stats.totalSessions, icon: <MicIcon />, color: '#D9A299' },
            { label: 'Total Minutes', value: stats.totalMinutes, icon: <ClockIcon />, color: '#7AAFC9' },
            { label: 'Avg Stress Reduction', value: `${stats.avgStressReduction}%`, icon: <TrendDownIcon />, color: '#7AB89E' },
            { label: 'Current Streak', value: `${stats.currentStreak} days`, icon: <FireIcon />, color: '#E4B17A' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              style={{
                padding: '16px',
                background: '#FAF7F3',
                borderRadius: '16px',
                border: '1px solid #F0E4D3',
                textAlign: 'center',
              }}
            >
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: stat.color,
                marginBottom: '4px',
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6B6B6B',
                fontWeight: '500',
              }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Favorite Technique */}
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, #D9A29915 0%, #D9A29905 100%)',
          borderRadius: '14px',
          border: '1px solid #D9A29930',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <StarIcon />
            <div>
              <div style={{
                fontSize: '12px',
                color: '#6B6B6B',
                fontWeight: '500',
                marginBottom: '2px',
              }}>
                Most Used Technique
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#D9A299',
              }}>
                {stats.favoriteTechnique}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Weekly Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '28px',
          border: '1px solid #DCC5B2',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#2D2D2D',
            margin: 0,
          }}>
            This Week
          </h3>
          <span style={{
            fontSize: '12px',
            color: '#6B6B6B',
            background: '#FAF7F3',
            padding: '6px 12px',
            borderRadius: '20px',
          }}>
            {weeklyData.reduce((sum, d) => sum + d.minutes, 0)} min total
          </span>
        </div>

        {/* Bar Chart */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height: '140px',
          marginBottom: '12px',
          padding: '0 8px',
        }}>
          {weeklyData.map((day, i) => {
            const height = (day.minutes / maxMinutes) * 100;
            const isToday = i === new Date().getDay() - 1 || (i === 6 && new Date().getDay() === 0);

            return (
              <div key={day.day} style={{ textAlign: 'center', flex: 1 }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
                  style={{
                    width: '32px',
                    margin: '0 auto',
                    background: isToday
                      ? 'linear-gradient(180deg, #D9A299 0%, #C8847A 100%)'
                      : day.minutes > 0
                        ? 'linear-gradient(180deg, #DCC5B2 0%, #F0E4D3 100%)'
                        : '#F0E4D3',
                    borderRadius: '8px 8px 4px 4px',
                    minHeight: '8px',
                    position: 'relative',
                  }}
                >
                  {day.minutes > 0 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                      style={{
                        position: 'absolute',
                        top: '-22px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: isToday ? '#D9A299' : '#6B6B6B',
                      }}
                    >
                      {day.minutes}m
                    </motion.span>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Day Labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 8px',
        }}>
          {weeklyData.map((day, i) => {
            const isToday = i === new Date().getDay() - 1 || (i === 6 && new Date().getDay() === 0);
            return (
              <span
                key={day.day}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: isToday ? '700' : '500',
                  color: isToday ? '#D9A299' : '#9CA3AF',
                }}
              >
                {day.day}
              </span>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          gridColumn: 'span 2',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '28px',
          border: '1px solid #DCC5B2',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#2D2D2D',
            margin: 0,
          }}>
            Recent Sessions
          </h3>
          <span style={{
            fontSize: '12px',
            color: '#6B6B6B',
          }}>
            Last 5 sessions
          </span>
        </div>

        {recentSessions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#9CA3AF',
          }}>
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D9A299" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <p style={{ margin: 0 }}>No sessions yet. Start your first practice!</p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {recentSessions.slice(0, 5).map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: '#FAF7F3',
                  borderRadius: '14px',
                  border: '1px solid #F0E4D3',
                }}
              >
                {/* Date */}
                <div style={{
                  width: '60px',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#2D2D2D',
                  }}>
                    {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#9CA3AF',
                  }}>
                    {new Date(session.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>

                {/* Divider */}
                <div style={{
                  width: '1px',
                  height: '36px',
                  background: '#DCC5B2',
                }} />

                {/* Session Info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '6px',
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2D2D2D',
                    }}>
                      {formatDuration(session.duration)} session
                    </span>
                    <span style={{
                      padding: '3px 10px',
                      background: session.stressReduction >= 20
                        ? '#7AB89E20'
                        : session.stressReduction >= 10
                          ? '#E4B17A20'
                          : '#F0E4D3',
                      color: session.stressReduction >= 20
                        ? '#7AB89E'
                        : session.stressReduction >= 10
                          ? '#E4B17A'
                          : '#9CA3AF',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}>
                      -{session.stressReduction}% stress
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    {session.techniques.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        style={{
                          padding: '2px 8px',
                          background: '#DCC5B220',
                          borderRadius: '6px',
                          fontSize: '10px',
                          color: '#6B6B6B',
                          fontWeight: '500',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mood Change */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  {getMoodIcon(session.moodBefore)}
                  <span style={{ color: '#9CA3AF' }}>→</span>
                  {getMoodIcon(session.moodAfter)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
