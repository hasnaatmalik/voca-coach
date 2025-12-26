'use client';

import { useState, useEffect, useCallback } from 'react';
import { JournalStreak, MoodTrend, DistortionStats, TagCloud } from '../types';

// Theme colors
const themeColors = {
  primary: '#D9A299',
  primaryDark: '#C08B82',
  secondary: '#DCC5B2',
  border: '#DCC5B2',
  text: '#2D2D2D',
  textMuted: '#6B6B6B',
  cream: '#FAF7F3',
  beige: '#F0E4D3',
  success: '#7AB89E',
  warning: '#E4B17A',
};

// SVG Icon Components
const FlameIcon = ({ color = themeColors.warning, size = 32 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const NotesIcon = ({ color = themeColors.primaryDark, size = 32 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const TrendUpIcon = ({ color = themeColors.success, size = 32 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const TrendDownIcon = ({ color = '#E07A5F', size = 32 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

const SearchIcon = ({ color = themeColors.text, size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const TagIcon = ({ color = themeColors.text, size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z" />
    <path d="M7 7h.01" />
  </svg>
);

const CalendarIcon = ({ color = themeColors.text, size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChartIcon = ({ color = themeColors.primaryDark, size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

interface AnalyticsData {
  streak: JournalStreak | null;
  moodTrends: MoodTrend[];
  distortionStats: DistortionStats[];
  tagCloud: TagCloud[];
  weeklyActivity: number[];
  totalSessions: number;
  averageMood: number | null;
  moodImprovement: number | null;
}

export default function JournalAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('month');

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/journal-analytics?range=${dateRange}`);
      const analytics = await res.json();
      setData(analytics);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return '#E07A5F';
    if (mood <= 5) return themeColors.warning;
    if (mood <= 7) return themeColors.primary;
    return themeColors.success;
  };

  if (isLoading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '48px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 16px rgba(217, 162, 153, 0.12)',
        border: `1px solid ${themeColors.border}`,
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${themeColors.border}`,
          borderTop: `3px solid ${themeColors.primaryDark}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '48px',
        textAlign: 'center',
        boxShadow: '0 4px 16px rgba(217, 162, 153, 0.12)',
        border: `1px solid ${themeColors.border}`,
      }}>
        <p style={{ color: themeColors.textMuted }}>Unable to load analytics</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '20px 24px',
        boxShadow: '0 4px 16px rgba(217, 162, 153, 0.12)',
        border: `1px solid ${themeColors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: `${themeColors.primary}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ChartIcon color={themeColors.primaryDark} size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: themeColors.text, margin: 0 }}>
              Journal Analytics
            </h2>
            <p style={{ fontSize: '13px', color: themeColors.textMuted, margin: '4px 0 0' }}>
              Insights from your journaling journey
            </p>
          </div>
        </div>

        {/* Date Range Toggle */}
        <div style={{
          display: 'flex',
          background: themeColors.beige,
          borderRadius: '8px',
          padding: '4px',
        }}>
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              style={{
                padding: '6px 12px',
                background: dateRange === range ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                color: dateRange === range ? themeColors.primaryDark : themeColors.textMuted,
                cursor: 'pointer',
                fontWeight: dateRange === range ? '600' : '400',
                textTransform: 'capitalize',
              }}
            >
              {range === 'all' ? 'All Time' : `This ${range.charAt(0).toUpperCase() + range.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {/* Streak Card */}
        <div style={{
          background: `linear-gradient(135deg, ${themeColors.warning}20 0%, ${themeColors.warning}35 100%)`,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${themeColors.warning}30`,
        }}>
          <div style={{ marginBottom: '8px' }}><FlameIcon color={themeColors.warning} size={32} /></div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: themeColors.warning }}>
            {data.streak?.currentStreak || 0}
          </div>
          <div style={{ fontSize: '14px', color: themeColors.text }}>Day Streak</div>
          <div style={{ fontSize: '12px', color: themeColors.textMuted, marginTop: '4px' }}>
            Best: {data.streak?.longestStreak || 0} days
          </div>
        </div>

        {/* Total Entries */}
        <div style={{
          background: `linear-gradient(135deg, ${themeColors.primary}20 0%, ${themeColors.primary}35 100%)`,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${themeColors.primary}30`,
        }}>
          <div style={{ marginBottom: '8px' }}><NotesIcon color={themeColors.primaryDark} size={32} /></div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: themeColors.primaryDark }}>
            {data.streak?.totalEntries || 0}
          </div>
          <div style={{ fontSize: '14px', color: themeColors.text }}>Total Entries</div>
        </div>

        {/* Average Mood */}
        {typeof data.averageMood === 'number' && (
          <div style={{
            background: `linear-gradient(135deg, ${getMoodColor(data.averageMood)}20 0%, ${getMoodColor(data.averageMood)}35 100%)`,
            borderRadius: '16px',
            padding: '20px',
            border: `1px solid ${getMoodColor(data.averageMood)}30`,
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: `${getMoodColor(data.averageMood)}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              fontSize: '18px',
            }}>
              {data.averageMood <= 3 ? '😔' : data.averageMood <= 5 ? '😐' : data.averageMood <= 7 ? '🙂' : '😊'}
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: getMoodColor(data.averageMood) }}>
              {data.averageMood.toFixed(1)}
            </div>
            <div style={{ fontSize: '14px', color: themeColors.text }}>Avg Mood</div>
          </div>
        )}

        {/* Mood Improvement */}
        {typeof data.moodImprovement === 'number' && (
          <div style={{
            background: data.moodImprovement >= 0
              ? `linear-gradient(135deg, ${themeColors.success}20 0%, ${themeColors.success}35 100%)`
              : `linear-gradient(135deg, #E07A5F20 0%, #E07A5F35 100%)`,
            borderRadius: '16px',
            padding: '20px',
            border: `1px solid ${data.moodImprovement >= 0 ? themeColors.success : '#E07A5F'}30`,
          }}>
            <div style={{ marginBottom: '8px' }}>
              {data.moodImprovement >= 0 ? <TrendUpIcon color={themeColors.success} size={32} /> : <TrendDownIcon color="#E07A5F" size={32} />}
            </div>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: data.moodImprovement >= 0 ? themeColors.success : '#E07A5F',
            }}>
              {data.moodImprovement >= 0 ? '+' : ''}{data.moodImprovement.toFixed(1)}
            </div>
            <div style={{
              fontSize: '14px',
              color: themeColors.text,
            }}>
              Mood Change
            </div>
          </div>
        )}
      </div>

      {/* Mood Trend Chart */}
      {data.moodTrends?.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(217, 162, 153, 0.12)',
          border: `1px solid ${themeColors.border}`,
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: themeColors.text, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ChartIcon color={themeColors.primaryDark} size={18} /> Mood Trend
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px',
            height: '120px',
            padding: '0 8px',
          }}>
            {data.moodTrends.slice(-14).map((trend, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: '32px',
                    height: `${trend.mood * 10}%`,
                    background: getMoodColor(trend.mood),
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s',
                  }}
                />
                <span style={{
                  fontSize: '10px',
                  color: themeColors.textMuted,
                  marginTop: '4px',
                }}>
                  {new Date(trend.date).toLocaleDateString('en-US', { day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distortions & Tags */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
      }}>
        {/* Top Distortions */}
        {data.distortionStats?.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(217, 162, 153, 0.12)',
            border: `1px solid ${themeColors.border}`,
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: themeColors.text, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SearchIcon color={themeColors.primaryDark} size={16} /> Common Patterns
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.distortionStats.slice(0, 5).map((stat) => (
                <div key={stat.type}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}>
                    <span style={{ fontSize: '13px', color: themeColors.text }}>{stat.type}</span>
                    <span style={{ fontSize: '12px', color: themeColors.textMuted }}>
                      {stat.count} ({stat.percentage}%)
                    </span>
                  </div>
                  <div style={{
                    height: '6px',
                    background: themeColors.beige,
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${stat.percentage}%`,
                      height: '100%',
                      background: themeColors.warning,
                      borderRadius: '3px',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tag Cloud */}
        {data.tagCloud?.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(217, 162, 153, 0.12)',
            border: `1px solid ${themeColors.border}`,
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: themeColors.text, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TagIcon color={themeColors.primaryDark} size={16} /> Common Themes
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              {data.tagCloud.slice(0, 15).map((tag) => {
                const maxCount = Math.max(...data.tagCloud.map((t) => t.count));
                const scale = 0.8 + (tag.count / maxCount) * 0.4;
                return (
                  <span
                    key={tag.tag}
                    style={{
                      padding: '6px 12px',
                      background: `${themeColors.primary}20`,
                      color: themeColors.primaryDark,
                      borderRadius: '999px',
                      fontSize: `${12 * scale}px`,
                      fontWeight: tag.count > maxCount * 0.5 ? '600' : '400',
                      border: `1px solid ${themeColors.primary}30`,
                    }}
                  >
                    {tag.tag}
                    <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.7 }}>
                      {tag.count}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Weekly Activity */}
      {data.weeklyActivity?.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(217, 162, 153, 0.12)',
          border: `1px solid ${themeColors.border}`,
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: themeColors.text, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon color={themeColors.primaryDark} size={16} /> Weekly Activity
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
              const count = data.weeklyActivity[i] || 0;
              const maxCount = Math.max(...data.weeklyActivity, 1);
              const intensity = count / maxCount;
              return (
                <div key={day} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: count > 0
                        ? `rgba(217, 162, 153, ${0.25 + intensity * 0.5})`
                        : themeColors.beige,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: count > 0 ? themeColors.primaryDark : themeColors.textMuted,
                      marginBottom: '4px',
                    }}
                  >
                    {count}
                  </div>
                  <span style={{ fontSize: '11px', color: themeColors.textMuted }}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
