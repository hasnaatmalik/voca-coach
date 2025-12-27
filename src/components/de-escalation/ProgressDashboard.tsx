'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { SessionProgress, Achievement, WeeklyDataPoint } from '@/types/de-escalation';

// Theme colors
const accentColor = '#D9A299';
const accentColorDark = '#C08B82';
const secondaryColor = '#DCC5B2';

// SVG Icon Components
const ChartUpIcon = ({ color = accentColor, size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <polyline points="22 4 12 14 8 10 2 16" />
  </svg>
);

const FlameIcon = ({ color = '#E4B17A', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const TargetIcon = ({ color = accentColor, size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const ClockIcon = ({ color = '#7AB89E', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const TrendDownIcon = ({ color = '#7AB89E', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

const TrophyIcon = ({ color = '#E4B17A', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const MuscleIcon = ({ color = accentColor, size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M6.5 6.5c1.5-1.5 3.5-.5 4 1l2.5 5c.5 1 1.5 2 3 2h4" />
    <path d="M4 14c1.5 0 2.5 1 3 2l1 2c.5 1 1.5 2 3 2h6" />
    <path d="M7 8l-3 3" />
    <path d="M5 11l-2 2" />
  </svg>
);

// Map achievement types to icons
const getAchievementIcon = (achievement: Achievement, size: number = 28) => {
  const icons: Record<string, ReactNode> = {
    streak: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#E4B17A" strokeWidth="2">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
    sessions: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    techniques: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#7AB89E" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    improvement: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={accentColorDark} strokeWidth="2">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  };
  return icons[achievement.type] || icons.sessions;
};

interface ProgressDashboardProps {
  darkMode?: boolean;
  compact?: boolean;
}

export default function ProgressDashboard({
  darkMode = false,
  compact = false,
}: ProgressDashboardProps) {
  const [progress, setProgress] = useState<SessionProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/de-escalation/progress');
      if (res.ok) {
        const data = await res.json();
        setProgress(data);
      } else {
        setError('Failed to load progress');
      }
    } catch {
      setError('Failed to load progress');
    } finally {
      setIsLoading(false);
    }
  };

  const bgColor = darkMode ? '#1F2937' : 'rgba(255, 255, 255, 0.95)';
  const textColor = darkMode ? '#F9FAFB' : '#2D2D2D';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B6B6B';
  const borderColor = darkMode ? '#374151' : '#DCC5B2';
  const cardBg = darkMode ? '#111827' : '#F0E4D3';

  if (isLoading) {
    return (
      <div style={{
        background: bgColor,
        borderRadius: '20px',
        padding: '40px',
        border: `1px solid ${borderColor}`,
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ color: mutedColor }}>Loading progress...</div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div style={{
        background: bgColor,
        borderRadius: '20px',
        padding: '40px',
        border: `1px solid ${borderColor}`,
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ color: accentColorDark }}>{error || 'No progress data'}</div>
      </div>
    );
  }

  // Calculate max for chart scaling
  const maxSessions = Math.max(...progress.weeklyData.map(d => d.sessions), 1);

  if (compact) {
    return (
      <div style={{
        background: bgColor,
        borderRadius: '16px',
        padding: '16px',
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: textColor, margin: 0 }}>
            Progress
          </h3>
          {progress.currentStreak > 0 && (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              background: 'linear-gradient(135deg, #E4B17A 0%, #D9A299 100%)',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              color: 'white',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FlameIcon color="white" size={12} /> {progress.currentStreak} day streak</span>
            </span>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}>
          <div style={{
            padding: '10px',
            background: cardBg,
            borderRadius: '10px',
            textAlign: 'center',
            border: `1px solid ${borderColor}`,
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: accentColor }}>
              {progress.totalSessions}
            </div>
            <div style={{ fontSize: '10px', color: mutedColor }}>Sessions</div>
          </div>
          <div style={{
            padding: '10px',
            background: cardBg,
            borderRadius: '10px',
            textAlign: 'center',
            border: `1px solid ${borderColor}`,
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#7AB89E' }}>
              {progress.totalMinutes}m
            </div>
            <div style={{ fontSize: '10px', color: mutedColor }}>Practiced</div>
          </div>
          <div style={{
            padding: '10px',
            background: cardBg,
            borderRadius: '10px',
            textAlign: 'center',
            border: `1px solid ${borderColor}`,
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: accentColorDark }}>
              {progress.averageStressReduction}%
            </div>
            <div style={{ fontSize: '10px', color: mutedColor }}>Reduction</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: bgColor,
      borderRadius: '20px',
      padding: '24px',
      border: `1px solid ${borderColor}`,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: `linear-gradient(135deg, ${accentColor} 0%, #DCC5B2 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(217, 162, 153, 0.3)',
          }}>
            <ChartUpIcon color="white" size={18} />
          </div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: textColor,
            margin: 0,
          }}>
            Your Progress
          </h2>
        </div>

        {/* Streak Badge */}
        {progress.currentStreak > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: 'linear-gradient(135deg, #E4B17A 0%, #D9A299 100%)',
            borderRadius: '999px',
            color: 'white',
            boxShadow: '0 2px 8px rgba(228, 177, 122, 0.3)',
          }}>
            <FlameIcon color="white" size={16} />
            <span style={{ fontWeight: '700' }}>{progress.currentStreak}</span>
            <span style={{ fontSize: '12px' }}>day streak</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <StatCard
          label="Total Sessions"
          value={progress.totalSessions.toString()}
          icon={<TargetIcon color={accentColor} size={24} />}
          color={accentColor}
          darkMode={darkMode}
          cardBg={cardBg}
          borderColor={borderColor}
        />
        <StatCard
          label="Minutes Practiced"
          value={progress.totalMinutes.toString()}
          icon={<ClockIcon color="#7AB89E" size={24} />}
          color="#7AB89E"
          darkMode={darkMode}
          cardBg={cardBg}
          borderColor={borderColor}
        />
        <StatCard
          label="Avg Stress Reduction"
          value={`${progress.averageStressReduction}%`}
          icon={<TrendDownIcon color="#7AB89E" size={24} />}
          color="#7AB89E"
          darkMode={darkMode}
          cardBg={cardBg}
          borderColor={borderColor}
        />
        <StatCard
          label="Longest Streak"
          value={`${progress.longestStreak} days`}
          icon={<TrophyIcon color="#E4B17A" size={24} />}
          color="#E4B17A"
          darkMode={darkMode}
          cardBg={cardBg}
          borderColor={borderColor}
        />
      </div>

      {/* Weekly Activity Chart */}
      <div style={{
        padding: '20px',
        background: cardBg,
        borderRadius: '16px',
        marginBottom: '24px',
        border: `1px solid ${borderColor}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: textColor,
            margin: 0,
          }}>
            Weekly Activity
          </h3>
          <span style={{
            fontSize: '11px',
            color: mutedColor,
          }}>
            Last 7 days
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height: '140px',
          gap: '6px',
          paddingBottom: '28px',
          position: 'relative',
        }}>
          {/* Background grid lines */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  height: '1px',
                  background: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(220, 197, 178, 0.5)',
                }}
              />
            ))}
          </div>

          {progress.weeklyData.map((day, index) => {
            const isToday = index === progress.weeklyData.length - 1;
            // Calculate bar height: min 12px for empty, scale to 100px max for sessions
            const barHeight = day.sessions > 0
              ? Math.max(24, Math.round((day.sessions / Math.max(maxSessions, 1)) * 100))
              : 12;

            return (
              <div
                key={day.date}
                style={{
                  flex: 1,
                  minWidth: '36px',
                  maxWidth: '50px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {/* Session count badge */}
                {day.sessions > 0 && (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: isToday ? accentColor : '#7AB89E',
                    background: darkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    minWidth: '20px',
                    textAlign: 'center',
                  }}>
                    {day.sessions}
                  </span>
                )}

                {/* Bar */}
                <div
                  style={{
                    width: '100%',
                    height: `${barHeight}px`,
                    background: day.sessions > 0
                      ? isToday
                        ? `linear-gradient(180deg, ${accentColor} 0%, ${accentColorDark} 100%)`
                        : 'linear-gradient(180deg, #DCC5B2 0%, #F0E4D3 100%)'
                      : darkMode ? '#374151' : '#E5DDD3',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    boxShadow: day.sessions > 0
                      ? isToday
                        ? '0 2px 8px rgba(217, 162, 153, 0.3)'
                        : '0 2px 6px rgba(220, 197, 178, 0.2)'
                      : 'none',
                    cursor: 'pointer',
                  }}
                  title={`${day.sessions} session${day.sessions !== 1 ? 's' : ''}, ${day.minutesPracticed} min practiced`}
                />

                {/* Day label */}
                <span style={{
                  fontSize: '11px',
                  fontWeight: isToday ? '700' : '500',
                  color: isToday ? accentColor : mutedColor,
                  background: isToday ? (darkMode ? 'rgba(217, 162, 153, 0.1)' : 'rgba(217, 162, 153, 0.15)') : 'transparent',
                  padding: isToday ? '2px 6px' : '2px 4px',
                  borderRadius: '4px',
                }}>
                  {isToday ? 'Today' : new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Summary below chart */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          paddingTop: '12px',
          borderTop: `1px solid ${borderColor}`,
        }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#7AB89E' }}>
              {progress.weeklyData.reduce((sum, d) => sum + d.sessions, 0)}
            </span>
            <span style={{ fontSize: '11px', color: mutedColor, marginLeft: '4px' }}>
              sessions this week
            </span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: '700', color: accentColor }}>
              {progress.weeklyData.reduce((sum, d) => sum + d.minutesPracticed, 0)}
            </span>
            <span style={{ fontSize: '11px', color: mutedColor, marginLeft: '4px' }}>
              min practiced
            </span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {progress.achievements.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: textColor,
            margin: '0 0 12px 0',
          }}>
            Achievements
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px',
          }}>
            {progress.achievements.slice(0, 6).map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                darkMode={darkMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* Most Effective Techniques */}
      {progress.mostEffectiveTechniques.length > 0 && (
        <div style={{
          padding: '16px',
          background: darkMode ? 'rgba(217, 162, 153, 0.1)' : 'rgba(217, 162, 153, 0.1)',
          borderRadius: '12px',
          border: `1px solid ${darkMode ? 'rgba(217, 162, 153, 0.3)' : 'rgba(217, 162, 153, 0.3)'}`,
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: accentColorDark,
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <MuscleIcon color={accentColorDark} size={16} />
            Your Most Effective Techniques
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            {progress.mostEffectiveTechniques.map((techniqueId) => (
              <span
                key={techniqueId}
                style={{
                  padding: '6px 12px',
                  background: darkMode ? accentColor : 'rgba(217, 162, 153, 0.2)',
                  color: darkMode ? 'white' : accentColorDark,
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '500',
                  textTransform: 'capitalize',
                }}
              >
                {techniqueId.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StatCard({
  label,
  value,
  icon,
  color,
  darkMode,
  cardBg,
  borderColor,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  color: string;
  darkMode: boolean;
  cardBg: string;
  borderColor: string;
}) {
  return (
    <div style={{
      padding: '16px',
      background: cardBg,
      borderRadius: '12px',
      textAlign: 'center',
      border: `1px solid ${borderColor}`,
    }}>
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{
        fontSize: '24px',
        fontWeight: '700',
        color,
        marginBottom: '4px',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '11px',
        color: darkMode ? '#9CA3AF' : '#6B6B6B',
      }}>
        {label}
      </div>
    </div>
  );
}

function AchievementBadge({
  achievement,
  darkMode,
}: {
  achievement: Achievement;
  darkMode: boolean;
}) {
  const isUnlocked = !!achievement.unlockedAt;

  return (
    <div style={{
      padding: '12px',
      background: isUnlocked
        ? darkMode ? 'rgba(228, 177, 122, 0.15)' : 'rgba(228, 177, 122, 0.15)'
        : darkMode ? '#111827' : '#F0E4D3',
      borderRadius: '12px',
      textAlign: 'center',
      opacity: isUnlocked ? 1 : 0.5,
      border: isUnlocked ? '2px solid #E4B17A' : '1px solid #DCC5B2',
    }}>
      <div style={{
        marginBottom: '6px',
        filter: isUnlocked ? 'none' : 'grayscale(1)',
        display: 'flex',
        justifyContent: 'center',
      }}>
        {getAchievementIcon(achievement, 28)}
      </div>
      <div style={{
        fontSize: '12px',
        fontWeight: '600',
        color: darkMode ? '#F9FAFB' : '#2D2D2D',
        marginBottom: '2px',
      }}>
        {achievement.name}
      </div>
      {!isUnlocked && achievement.progress !== undefined && (
        <div style={{
          height: '4px',
          background: darkMode ? '#374151' : '#DCC5B2',
          borderRadius: '2px',
          marginTop: '6px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${achievement.progress}%`,
            background: '#E4B17A',
            borderRadius: '2px',
          }} />
        </div>
      )}
    </div>
  );
}
