'use client';

import { useState, useEffect, ReactNode } from 'react';

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
const ChartIcon = ({ color = themeColors.text, size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const ChatIcon = ({ color = themeColors.primaryDark, size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MailIcon = ({ color = themeColors.primary, size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const BarChartIcon = ({ color = themeColors.success, size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const CalendarIcon = ({ color = themeColors.warning, size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const LightbulbIcon = ({ color = themeColors.success, size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const XIcon = ({ color = '#6B6B6B', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

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
          border: `3px solid ${themeColors.border}`,
          borderTop: `3px solid ${themeColors.primaryDark}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ color: themeColors.textMuted, marginTop: '12px' }}>Loading analytics...</p>
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
        <p style={{ color: '#E07A5F' }}>{error}</p>
        <button
          onClick={fetchAnalytics}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            background: themeColors.beige,
            border: `1px solid ${themeColors.border}`,
            borderRadius: '8px',
            cursor: 'pointer',
            color: themeColors.text,
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
        borderBottom: `1px solid ${themeColors.border}`,
        background: `linear-gradient(135deg, ${themeColors.primary}10 0%, ${themeColors.secondary}15 100%)`,
      }}>
        <h3 style={{ fontWeight: '600', color: themeColors.text, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChartIcon color={themeColors.primaryDark} size={18} /> Analytics Dashboard
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              background: themeColors.beige,
              border: `1px solid ${themeColors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <XIcon color={themeColors.textMuted} size={18} />
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
            icon={<ChatIcon color={themeColors.primaryDark} size={24} />}
            color={themeColors.primaryDark}
          />
          <StatCard
            label="Total Messages"
            value={analytics.totalMessages}
            icon={<MailIcon color={themeColors.primary} size={24} />}
            color={themeColors.primary}
          />
          <StatCard
            label="Avg. Messages/Chat"
            value={analytics.avgMessagesPerConversation}
            icon={<BarChartIcon color={themeColors.success} size={24} />}
            color={themeColors.success}
          />
          <StatCard
            label="Last 7 Days"
            value={analytics.recentConversationsCount}
            icon={<CalendarIcon color={themeColors.warning} size={24} />}
            color={themeColors.warning}
          />
        </div>

        {/* Top Personas Chart */}
        <div style={{
          background: 'white',
          border: `1px solid ${themeColors.border}`,
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: themeColors.text,
            marginBottom: '16px'
          }}>
            Most Used Personas
          </h4>

          {analytics.topPersonas.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: themeColors.textMuted
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
                    <span style={{ fontSize: '13px', color: themeColors.text }}>
                      {index + 1}. {persona.name}
                    </span>
                    <span style={{ fontSize: '13px', color: themeColors.textMuted }}>
                      {persona.count} conversations
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: themeColors.beige,
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(persona.count / maxConversations) * 100}%`,
                      background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`,
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
          background: `${themeColors.success}15`,
          border: `1px solid ${themeColors.success}40`,
          borderRadius: '12px'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: themeColors.success,
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <LightbulbIcon color={themeColors.success} size={16} /> Tips for Better Practice
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '13px',
            color: themeColors.text,
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
  icon: ReactNode;
  color: string;
}) {
  return (
    <div style={{
      background: 'white',
      border: `1px solid ${themeColors.border}`,
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
      }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontSize: '24px',
          fontWeight: '700',
          color: themeColors.text
        }}>
          {value}
        </div>
        <div style={{
          fontSize: '12px',
          color: themeColors.textMuted
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}
