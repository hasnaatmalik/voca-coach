'use client';

import React from 'react';

interface Stat {
  label: string;
  value: string | number;
  icon?: string;
}

interface Recommendation {
  type: 'info' | 'warning' | 'success';
  message: string;
  timestamp?: string;
}

interface AIInsight {
  title: string;
  message: string;
  type: 'technique' | 'journal' | 'session' | 'insight';
  priority: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    href: string;
  };
}

interface TodaySummary {
  sessionsCompleted: number;
  targetSessions?: number;
  journalEntries: number;
  focusArea: string;
}

interface LiveStatsPanelProps {
  currentMood?: string;
  moodEmoji?: string;
  stats?: Stat[];
  recommendations?: Recommendation[];
  transcript?: string;
  // Enhanced props
  aiInsight?: AIInsight;
  todaySummary?: TodaySummary;
  showProgressRing?: boolean;
}

const LiveStatsPanel: React.FC<LiveStatsPanelProps> = ({
  currentMood = 'Neutral',
  moodEmoji = '😐',
  stats = [],
  recommendations = [],
  transcript,
  aiInsight,
  todaySummary,
  showProgressRing = false
}) => {
  const getRecommendationStyle = (type: Recommendation['type']) => {
    const styles = {
      info: { bg: '#EFF6FF', border: '#3B82F6', color: '#1E40AF' },
      warning: { bg: '#FEF3E7', border: '#F59E0B', color: '#92400E' },
      success: { bg: '#F0FDF4', border: '#10B981', color: '#065F46' }
    };
    return styles[type];
  };

  const getInsightPriorityStyle = (priority: AIInsight['priority']) => {
    const styles = {
      high: { bg: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)', text: 'white' },
      medium: { bg: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)', text: 'white' },
      low: { bg: '#F3F4F6', text: '#1F2937' }
    };
    return styles[priority];
  };

  // Calculate today's progress percentage
  const todayProgress = todaySummary
    ? Math.min(100, ((todaySummary.sessionsCompleted + todaySummary.journalEntries) / 4) * 100)
    : 0;

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 4px 16px rgba(124, 58, 237, 0.12)'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', marginBottom: '20px' }}>
        Live Statistics
      </h3>

      {/* Today's Progress Ring (optional) */}
      {showProgressRing && todaySummary && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px',
          padding: '16px',
          background: '#F9FAFB',
          borderRadius: '12px'
        }}>
          <div style={{ position: 'relative', width: '60px', height: '60px' }}>
            <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="6"
              />
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - todayProgress / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(0deg)',
              fontSize: '14px',
              fontWeight: '700',
              color: '#1F2937'
            }}>
              {Math.round(todayProgress)}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>Today&apos;s Progress</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              {todaySummary.sessionsCompleted} sessions, {todaySummary.journalEntries} journals
            </div>
            <div style={{
              fontSize: '11px',
              color: '#7C3AED',
              marginTop: '4px',
              fontWeight: '500'
            }}>
              Focus: {todaySummary.focusArea}
            </div>
          </div>
        </div>
      )}

      {/* Current Mood */}
      <div style={{
        background: 'linear-gradient(135deg, #F5F3FF 0%, #ECFEFF 100%)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ fontSize: '32px' }}>{moodEmoji}</div>
        <div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '2px' }}>Current Mood</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>{currentMood}</div>
        </div>
      </div>

      {/* AI Insight Card */}
      {aiInsight && (
        <div style={{
          background: getInsightPriorityStyle(aiInsight.priority).bg,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          color: getInsightPriorityStyle(aiInsight.priority).text
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>
              {aiInsight.type === 'technique' && '💡'}
              {aiInsight.type === 'journal' && '📝'}
              {aiInsight.type === 'session' && '🎯'}
              {aiInsight.type === 'insight' && '✨'}
            </span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{aiInsight.title}</span>
          </div>
          <p style={{
            fontSize: '13px',
            lineHeight: '1.5',
            margin: 0,
            opacity: aiInsight.priority === 'low' ? 0.8 : 1
          }}>
            {aiInsight.message}
          </p>
          {aiInsight.action && (
            <a
              href={aiInsight.action.href}
              style={{
                display: 'inline-block',
                marginTop: '12px',
                padding: '8px 16px',
                background: aiInsight.priority === 'low' ? 'white' : 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: aiInsight.priority === 'low' ? '#7C3AED' : 'inherit',
                textDecoration: 'none'
              }}
            >
              {aiInsight.action.label} →
            </a>
          )}
        </div>
      )}

      {/* Stats */}
      {stats.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '12px' }}>
            Your Stats
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.map((stat, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>
                  {stat.icon && <span style={{ marginRight: '6px' }}>{stat.icon}</span>}
                  {stat.label}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '12px' }}>
            Recommendations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recommendations.map((rec, i) => {
              const style = getRecommendationStyle(rec.type);
              return (
                <div
                  key={i}
                  style={{
                    background: style.bg,
                    borderLeft: `3px solid ${style.border}`,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: style.color,
                    lineHeight: '1.4'
                  }}
                >
                  {rec.message}
                  {rec.timestamp && (
                    <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>
                      {rec.timestamp}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Transcript */}
      {transcript && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '8px' }}>
            Live Transcript
          </div>
          <div style={{
            background: '#F9FAFB',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '13px',
            color: '#4B5563',
            lineHeight: '1.6',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {transcript}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStatsPanel;
