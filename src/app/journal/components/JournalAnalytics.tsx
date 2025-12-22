'use client';

import { useState, useEffect, useCallback } from 'react';
import { JournalStreak, MoodTrend, DistortionStats, TagCloud } from '../types';

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
    if (mood <= 3) return '#EF4444';
    if (mood <= 5) return '#F59E0B';
    if (mood <= 7) return '#3B82F6';
    return '#10B981';
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
        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #E5E7EB',
          borderTop: '3px solid #7C3AED',
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
        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
      }}>
        <p style={{ color: '#6B7280' }}>Unable to load analytics</p>
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
        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
            Journal Analytics
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0' }}>
            Insights from your journaling journey
          </p>
        </div>

        {/* Date Range Toggle */}
        <div style={{
          display: 'flex',
          background: '#F3F4F6',
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
                color: dateRange === range ? '#7C3AED' : '#6B7280',
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
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          borderRadius: '16px',
          padding: '20px',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔥</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#92400E' }}>
            {data.streak?.currentStreak || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#B45309' }}>Day Streak</div>
          <div style={{ fontSize: '12px', color: '#D97706', marginTop: '4px' }}>
            Best: {data.streak?.longestStreak || 0} days
          </div>
        </div>

        {/* Total Entries */}
        <div style={{
          background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
          borderRadius: '16px',
          padding: '20px',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#3730A3' }}>
            {data.streak?.totalEntries || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#4338CA' }}>Total Entries</div>
        </div>

        {/* Average Mood */}
        {typeof data.averageMood === 'number' && (
          <div style={{
            background: `linear-gradient(135deg, ${getMoodColor(data.averageMood)}15 0%, ${getMoodColor(data.averageMood)}25 100%)`,
            borderRadius: '16px',
            padding: '20px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>
              {data.averageMood <= 3 ? '😔' : data.averageMood <= 5 ? '😐' : data.averageMood <= 7 ? '🙂' : '😊'}
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: getMoodColor(data.averageMood) }}>
              {data.averageMood.toFixed(1)}
            </div>
            <div style={{ fontSize: '14px', color: getMoodColor(data.averageMood) }}>Avg Mood</div>
          </div>
        )}

        {/* Mood Improvement */}
        {typeof data.moodImprovement === 'number' && (
          <div style={{
            background: data.moodImprovement >= 0
              ? 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)'
              : 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>
              {data.moodImprovement >= 0 ? '📈' : '📉'}
            </div>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: data.moodImprovement >= 0 ? '#059669' : '#DC2626',
            }}>
              {data.moodImprovement >= 0 ? '+' : ''}{data.moodImprovement.toFixed(1)}
            </div>
            <div style={{
              fontSize: '14px',
              color: data.moodImprovement >= 0 ? '#047857' : '#B91C1C',
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
          boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', margin: '0 0 20px' }}>
            Mood Trend
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
                  color: '#9CA3AF',
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
            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', margin: '0 0 16px' }}>
              🔍 Common Patterns
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.distortionStats.slice(0, 5).map((stat) => (
                <div key={stat.type}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}>
                    <span style={{ fontSize: '13px', color: '#4B5563' }}>{stat.type}</span>
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      {stat.count} ({stat.percentage}%)
                    </span>
                  </div>
                  <div style={{
                    height: '6px',
                    background: '#F3F4F6',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${stat.percentage}%`,
                      height: '100%',
                      background: '#F59E0B',
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
            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', margin: '0 0 16px' }}>
              🏷️ Common Themes
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
                      background: '#F5F3FF',
                      color: '#7C3AED',
                      borderRadius: '999px',
                      fontSize: `${12 * scale}px`,
                      fontWeight: tag.count > maxCount * 0.5 ? '600' : '400',
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
          boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', margin: '0 0 16px' }}>
            📅 Weekly Activity
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
                        ? `rgba(124, 58, 237, ${0.2 + intensity * 0.6})`
                        : '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: count > 0 ? '#7C3AED' : '#9CA3AF',
                      marginBottom: '4px',
                    }}
                  >
                    {count}
                  </div>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>{day}</span>
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
