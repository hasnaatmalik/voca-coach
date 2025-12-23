'use client';

import React, { useState, useEffect } from 'react';
import { SessionProgress, Achievement, WeeklyDataPoint } from '@/types/de-escalation';

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

  const bgColor = darkMode ? '#1F2937' : 'white';
  const textColor = darkMode ? '#F9FAFB' : '#1F2937';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = darkMode ? '#374151' : '#E5E7EB';

  if (isLoading) {
    return (
      <div style={{
        background: bgColor,
        borderRadius: '16px',
        padding: '40px',
        border: `1px solid ${borderColor}`,
        textAlign: 'center',
      }}>
        <div style={{ color: mutedColor }}>Loading progress...</div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div style={{
        background: bgColor,
        borderRadius: '16px',
        padding: '40px',
        border: `1px solid ${borderColor}`,
        textAlign: 'center',
      }}>
        <div style={{ color: '#EF4444' }}>{error || 'No progress data'}</div>
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
              background: '#F59E0B',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              color: 'white',
            }}>
              🔥 {progress.currentStreak} day streak
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
            background: darkMode ? '#111827' : '#F9FAFB',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#7C3AED' }}>
              {progress.totalSessions}
            </div>
            <div style={{ fontSize: '10px', color: mutedColor }}>Sessions</div>
          </div>
          <div style={{
            padding: '10px',
            background: darkMode ? '#111827' : '#F9FAFB',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>
              {progress.totalMinutes}m
            </div>
            <div style={{ fontSize: '10px', color: mutedColor }}>Practiced</div>
          </div>
          <div style={{
            padding: '10px',
            background: darkMode ? '#111827' : '#F9FAFB',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#EC4899' }}>
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
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>📈</span>
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
            background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
            borderRadius: '999px',
            color: 'white',
          }}>
            <span style={{ fontSize: '16px' }}>🔥</span>
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
          icon="🎯"
          color="#7C3AED"
          darkMode={darkMode}
        />
        <StatCard
          label="Minutes Practiced"
          value={progress.totalMinutes.toString()}
          icon="⏱️"
          color="#10B981"
          darkMode={darkMode}
        />
        <StatCard
          label="Avg Stress Reduction"
          value={`${progress.averageStressReduction}%`}
          icon="📉"
          color="#EC4899"
          darkMode={darkMode}
        />
        <StatCard
          label="Longest Streak"
          value={`${progress.longestStreak} days`}
          icon="🏆"
          color="#F59E0B"
          darkMode={darkMode}
        />
      </div>

      {/* Weekly Activity Chart */}
      <div style={{
        padding: '20px',
        background: darkMode ? '#111827' : '#F9FAFB',
        borderRadius: '16px',
        marginBottom: '24px',
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
                  background: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.8)',
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
                    color: isToday ? '#7C3AED' : '#10B981',
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
                        ? 'linear-gradient(180deg, #7C3AED 0%, #EC4899 100%)'
                        : 'linear-gradient(180deg, #10B981 0%, #059669 100%)'
                      : darkMode ? '#374151' : '#D1D5DB',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    boxShadow: day.sessions > 0
                      ? isToday
                        ? '0 2px 8px rgba(124, 58, 237, 0.3)'
                        : '0 2px 6px rgba(16, 185, 129, 0.2)'
                      : 'none',
                    cursor: 'pointer',
                  }}
                  title={`${day.sessions} session${day.sessions !== 1 ? 's' : ''}, ${day.minutesPracticed} min practiced`}
                />

                {/* Day label */}
                <span style={{
                  fontSize: '11px',
                  fontWeight: isToday ? '700' : '500',
                  color: isToday ? '#7C3AED' : mutedColor,
                  background: isToday ? (darkMode ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.08)') : 'transparent',
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
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#10B981' }}>
              {progress.weeklyData.reduce((sum, d) => sum + d.sessions, 0)}
            </span>
            <span style={{ fontSize: '11px', color: mutedColor, marginLeft: '4px' }}>
              sessions this week
            </span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#7C3AED' }}>
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
          background: darkMode ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.05)',
          borderRadius: '12px',
          border: `1px solid ${darkMode ? 'rgba(124, 58, 237, 0.3)' : 'rgba(124, 58, 237, 0.2)'}`,
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#7C3AED',
            marginBottom: '8px',
          }}>
            💪 Your Most Effective Techniques
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
                  background: darkMode ? '#7C3AED' : 'rgba(124, 58, 237, 0.2)',
                  color: darkMode ? 'white' : '#7C3AED',
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
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  darkMode: boolean;
}) {
  return (
    <div style={{
      padding: '16px',
      background: darkMode ? '#111827' : '#F9FAFB',
      borderRadius: '12px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
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
        color: darkMode ? '#9CA3AF' : '#6B7280',
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
        ? darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)'
        : darkMode ? '#111827' : '#F3F4F6',
      borderRadius: '12px',
      textAlign: 'center',
      opacity: isUnlocked ? 1 : 0.5,
      border: isUnlocked ? '2px solid #F59E0B' : 'none',
    }}>
      <div style={{
        fontSize: '28px',
        marginBottom: '6px',
        filter: isUnlocked ? 'none' : 'grayscale(1)',
      }}>
        {achievement.icon}
      </div>
      <div style={{
        fontSize: '12px',
        fontWeight: '600',
        color: darkMode ? '#F9FAFB' : '#1F2937',
        marginBottom: '2px',
      }}>
        {achievement.name}
      </div>
      {!isUnlocked && achievement.progress !== undefined && (
        <div style={{
          height: '4px',
          background: darkMode ? '#374151' : '#E5E7EB',
          borderRadius: '2px',
          marginTop: '6px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${achievement.progress}%`,
            background: '#F59E0B',
            borderRadius: '2px',
          }} />
        </div>
      )}
    </div>
  );
}
