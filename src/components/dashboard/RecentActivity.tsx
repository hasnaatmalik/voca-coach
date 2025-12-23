'use client';

import { useRouter } from 'next/navigation';
import type { ActivityItem } from '@/types/dashboard';

interface RecentActivityProps {
  activities: ActivityItem[];
  maxItems?: number;
  onViewAll?: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  session: '🎯',
  journal: '📝',
  chat: '💬',
  achievement: '🏆',
  biomarker: '🎤',
  therapy: '📅'
};

const TYPE_COLORS: Record<string, string> = {
  session: '#7C3AED',
  journal: '#EC4899',
  chat: '#10B981',
  achievement: '#F59E0B',
  biomarker: '#06B6D4',
  therapy: '#8B5CF6'
};

const TYPE_LINKS: Record<string, string> = {
  session: '/de-escalation',
  journal: '/journal',
  chat: '/chat',
  achievement: '/de-escalation/achievements',
  biomarker: '/biomarkers',
  therapy: '/therapy'
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function RecentActivity({
  activities,
  maxItems = 10,
  onViewAll
}: RecentActivityProps) {
  const router = useRouter();
  const displayActivities = activities.slice(0, maxItems);

  if (!activities || activities.length === 0) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', marginBottom: '16px' }}>
          Recent Activity
        </h3>
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6B7280' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>No recent activity</div>
          <div style={{ fontSize: '12px' }}>Start a session or write in your journal to begin</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>
          Recent Activity
        </h3>
        {onViewAll && activities.length > maxItems && (
          <button
            onClick={onViewAll}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6B7280',
              cursor: 'pointer'
            }}
          >
            View All
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {displayActivities.map((activity, index) => {
          const icon = activity.icon || TYPE_ICONS[activity.type] || '📌';
          const color = TYPE_COLORS[activity.type] || '#6B7280';
          const link = TYPE_LINKS[activity.type] || '/dashboard';

          return (
            <div
              key={activity.id || index}
              onClick={() => router.push(link)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                background: '#F9FAFB',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F3F4F6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F9FAFB';
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0
              }}>
                {icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1F2937',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {activity.title}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {activity.description}
                </div>
              </div>
              <div style={{
                fontSize: '11px',
                color: '#9CA3AF',
                flexShrink: 0
              }}>
                {formatRelativeTime(activity.timestamp)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
