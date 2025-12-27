'use client';

import { motion } from 'framer-motion';

interface ClientInsight {
  clientId: string;
  clientName: string;
  sessionsCount: number;
  nextSession: string | null;
  moodTrend: 'improving' | 'stable' | 'declining' | 'unknown';
  aiSummary: string;
  alerts: string[];
}

interface AIInsightsCardProps {
  insights: ClientInsight[];
  loading?: boolean;
}

export default function AIInsightsCard({ insights, loading }: AIInsightsCardProps) {
  const getMoodTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  const getMoodTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#7AB89E';
      case 'declining': return '#EF4444';
      case 'stable': return '#6B6B6B';
      default: return '#9CA3AF';
    }
  };

  if (loading && insights.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          marginTop: '24px',
          textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          border: '1px solid #F0E4D3',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          style={{ fontSize: '32px', marginBottom: '12px', display: 'inline-block' }}
        >
          🤖
        </motion.div>
        <p style={{ color: '#6B6B6B' }}>Loading AI insights...</p>
      </motion.div>
    );
  }

  if (insights.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        background: 'white',
        borderRadius: '24px',
        padding: '28px',
        marginTop: '24px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
        border: '1px solid #F0E4D3',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '8px',
      }}>
        <motion.span
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ fontSize: '24px' }}
        >
          🤖
        </motion.span>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#2D2D2D' }}>
          AI Client Briefings
        </h2>
        <span style={{
          padding: '4px 12px',
          background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
          color: 'white',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '600',
        }}>
          BETA
        </span>
      </div>
      <p style={{ color: '#6B6B6B', fontSize: '14px', marginBottom: '20px' }}>
        AI-powered insights for your upcoming client sessions
      </p>

      <div style={{ display: 'grid', gap: '16px' }}>
        {insights.map((insight, index) => (
          <motion.div
            key={insight.clientId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              background: '#FAF7F3',
              borderRadius: '18px',
              padding: '20px',
              border: '1px solid #F0E4D3',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div>
                <p style={{
                  fontWeight: '700',
                  color: '#2D2D2D',
                  fontSize: '16px',
                  marginBottom: '4px',
                }}>
                  {insight.clientName}
                </p>
                <p style={{ fontSize: '13px', color: '#6B6B6B' }}>
                  {insight.sessionsCount} previous sessions
                  {insight.nextSession && (
                    <> • Next: {new Date(insight.nextSession).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</>
                  )}
                </p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: getMoodTrendColor(insight.moodTrend) + '15',
                borderRadius: '10px',
              }}>
                <span>{getMoodTrendIcon(insight.moodTrend)}</span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: getMoodTrendColor(insight.moodTrend),
                  textTransform: 'capitalize',
                }}>
                  {insight.moodTrend}
                </span>
              </div>
            </div>

            {/* AI Summary */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: insight.alerts.length > 0 ? '12px' : '0',
              border: '1px solid #E5E7EB',
            }}>
              <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.6' }}>
                {insight.aiSummary}
              </p>
            </div>

            {/* Alerts */}
            {insight.alerts.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {insight.alerts.map((alert, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      padding: '4px 10px',
                      background: '#FEF2F2',
                      color: '#DC2626',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}
                  >
                    ⚠️ {alert}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
