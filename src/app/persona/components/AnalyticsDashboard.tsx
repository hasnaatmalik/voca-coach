'use client';

import { useState, useEffect } from 'react';

interface Analytics {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  recentConversationsCount: number;
  conversationsByPersona: Record<string, number>;
  topPersonas: Array<{ name: string; count: number }>;
}

interface AnalyticsDashboardProps {
  onClose?: () => void;
}

export default function AnalyticsDashboard({ onClose }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/persona-analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
      } else {
        setError('Failed to load analytics');
      }
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #E5E7EB',
          borderTop: '3px solid #7C3AED',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ color: '#6B7280', marginTop: '12px' }}>Loading analytics...</p>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#EF4444' }}>{error}</p>
        <button
          onClick={fetchAnalytics}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            background: '#F3F4F6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const maxConversations = Math.max(...analytics.topPersonas.map(p => p.count), 1);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <h3 style={{ fontWeight: '600', color: '#1F2937', margin: 0 }}>
          📊 Analytics Dashboard
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <StatCard
            label="Total Conversations"
            value={analytics.totalConversations}
            icon="💬"
            color="#7C3AED"
          />
          <StatCard
            label="Total Messages"
            value={analytics.totalMessages}
            icon="✉️"
            color="#EC4899"
          />
          <StatCard
            label="Avg. Messages/Chat"
            value={analytics.avgMessagesPerConversation}
            icon="📊"
            color="#10B981"
          />
          <StatCard
            label="Last 7 Days"
            value={analytics.recentConversationsCount}
            icon="📅"
            color="#F59E0B"
          />
        </div>

        {/* Top Personas Chart */}
        <div style={{
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: '16px'
          }}>
            Most Used Personas
          </h4>

          {analytics.topPersonas.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#6B7280'
            }}>
              No data yet. Start chatting to see your stats!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {analytics.topPersonas.map((persona, index) => (
                <div key={persona.name}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '13px', color: '#4B5563' }}>
                      {index + 1}. {persona.name}
                    </span>
                    <span style={{ fontSize: '13px', color: '#6B7280' }}>
                      {persona.count} conversations
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: '#F3F4F6',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(persona.count / maxConversations) * 100}%`,
                      background: `linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)`,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '12px'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#15803D',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💡 Tips for Better Practice
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '13px',
            color: '#166534',
            lineHeight: '1.6'
          }}>
            <li>Practice with different personas to build versatile communication skills</li>
            <li>Try roleplay scenarios to prepare for real-life situations</li>
            <li>Use voice mode to improve your speaking confidence</li>
            <li>Review past conversations to track your progress</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        background: `${color}15`,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
      }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1F2937'
        }}>
          {value}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#6B7280'
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}
