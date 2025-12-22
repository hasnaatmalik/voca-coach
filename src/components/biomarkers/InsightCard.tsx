'use client';

import { useState } from 'react';
import TrendIndicator from './TrendIndicator';

interface Trend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  percentChange: number;
  interpretation: string;
}

interface Pattern {
  description: string;
  confidence: number;
  insight: string;
}

interface Anomaly {
  date: string;
  metric: string;
  value: number;
  expected: number;
  severity: 'low' | 'medium' | 'high';
}

interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface InsightsData {
  summary: string;
  trends: Trend[];
  patterns: Pattern[];
  anomalies: Anomaly[];
  recommendations: Recommendation[];
  overallHealthScore: number;
  weeklyImprovement: number;
}

interface InsightCardProps {
  insights: InsightsData | null;
  loading?: boolean;
  onPlayTTS?: (text: string) => void;
  onRefresh?: () => void;
}

export default function InsightCard({
  insights,
  loading = false,
  onPlayTTS,
  onRefresh,
}: InsightCardProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'trends' | 'recommendations'>('summary');
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = async () => {
    if (!insights || !onPlayTTS || isPlaying) return;

    setIsPlaying(true);
    try {
      const text = `${insights.summary} ${insights.recommendations
        .slice(0, 2)
        .map(r => r.title + '. ' + r.description)
        .join(' ')}`;
      await onPlayTTS(text);
    } finally {
      setIsPlaying(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: '#FEF2F2', border: '#FECACA', text: '#EF4444' };
      case 'medium':
        return { bg: '#FFFBEB', border: '#FDE68A', text: '#F59E0B' };
      case 'low':
        return { bg: '#F0FDF4', border: '#BBF7D0', text: '#10B981' };
      default:
        return { bg: '#F9FAFB', border: '#E5E7EB', text: '#6B7280' };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vocal_health':
        return 'Voice';
      case 'stress_management':
        return 'Relax';
      case 'speech_improvement':
        return 'Speech';
      case 'general_wellness':
        return 'Wellness';
      default:
        return 'Tip';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(124, 58, 237, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              border: '3px solid #E5E7EB',
              borderTopColor: '#7C3AED',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span style={{ color: '#6B7280', fontSize: '14px' }}>Generating AI insights...</span>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!insights) {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(124, 58, 237, 0.1)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>Analysis</div>
        <p style={{ color: '#6B7280', margin: 0 }}>No insights available yet</p>
        <p style={{ color: '#9CA3AF', fontSize: '14px', marginTop: '8px' }}>
          Record some voice samples to generate AI insights
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(124, 58, 237, 0.1)',
        border: '1px solid rgba(124, 58, 237, 0.1)',
        overflow: 'hidden',
      }}
    >
      {/* Header with score */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Health score circle */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: getScoreColor(insights.overallHealthScore),
                }}
              >
                {insights.overallHealthScore}
              </span>
              <span style={{ fontSize: '10px', color: '#6B7280' }}>Score</span>
            </div>
          </div>

          <div>
            <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: 600 }}>
              AI Health Insights
            </h3>
            {insights.weeklyImprovement !== 0 && (
              <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                {insights.weeklyImprovement > 0 ? '+' : ''}
                {insights.weeklyImprovement.toFixed(1)}% this week
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {onPlayTTS && (
            <button
              onClick={handlePlayAudio}
              disabled={isPlaying}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '13px',
                fontWeight: 500,
                cursor: isPlaying ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isPlaying ? 'Playing...' : 'Listen'}
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        {(['summary', 'trends', 'recommendations'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              background: activeTab === tab ? 'white' : '#F9FAFB',
              borderBottom: activeTab === tab ? '2px solid #7C3AED' : '2px solid transparent',
              color: activeTab === tab ? '#7C3AED' : '#6B7280',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {activeTab === 'summary' && (
          <div>
            <p
              style={{
                margin: 0,
                fontSize: '15px',
                color: '#374151',
                lineHeight: 1.7,
              }}
            >
              {insights.summary}
            </p>

            {/* Patterns */}
            {insights.patterns.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  Patterns Detected
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {insights.patterns.slice(0, 3).map((pattern, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 16px',
                        background: '#F3E8FF',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#6D28D9',
                      }}
                    >
                      <strong>{pattern.description}</strong>
                      <span style={{ color: '#9333EA', marginLeft: '8px' }}>
                        ({Math.round(pattern.confidence * 100)}% confidence)
                      </span>
                      {pattern.insight && (
                        <p style={{ margin: '8px 0 0 0', color: '#7C3AED' }}>{pattern.insight}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Anomalies */}
            {insights.anomalies.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  Notable Readings
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {insights.anomalies.slice(0, 3).map((anomaly, i) => {
                    const severityColors = {
                      low: { bg: '#FEF3C7', text: '#B45309' },
                      medium: { bg: '#FED7AA', text: '#C2410C' },
                      high: { bg: '#FECACA', text: '#DC2626' },
                    };
                    const colors = severityColors[anomaly.severity];

                    return (
                      <div
                        key={i}
                        style={{
                          padding: '12px 16px',
                          background: colors.bg,
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: colors.text,
                        }}
                      >
                        <strong>{anomaly.metric}</strong> was {anomaly.value.toFixed(1)}
                        (expected ~{anomaly.expected.toFixed(1)}) on {new Date(anomaly.date).toLocaleDateString()}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trends' && (
          <div>
            {insights.trends.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {insights.trends.map((trend, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '16px',
                      background: '#F9FAFB',
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>
                        {trend.metric.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <TrendIndicator
                        direction={trend.direction}
                        percentChange={trend.percentChange}
                        isPositive={
                          trend.metric === 'stress' ? trend.direction === 'down' :
                          trend.metric === 'clarity' ? trend.direction === 'up' :
                          undefined
                        }
                        size="sm"
                      />
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>
                      {trend.interpretation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: '#9CA3AF', textAlign: 'center', padding: '32px 0' }}>
                Not enough data to calculate trends yet
              </p>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div>
            {insights.recommendations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {insights.recommendations.map((rec, i) => {
                  const colors = getPriorityColor(rec.priority);
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '16px',
                        background: colors.bg,
                        borderRadius: '12px',
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: colors.text,
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                          }}
                        >
                          {rec.priority}
                        </span>
                        <span style={{ fontSize: '12px', color: colors.text }}>
                          {getCategoryIcon(rec.category)}
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600, color: '#374151' }}>
                        {rec.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>
                        {rec.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ margin: 0, color: '#9CA3AF', textAlign: 'center', padding: '32px 0' }}>
                No recommendations at this time
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
