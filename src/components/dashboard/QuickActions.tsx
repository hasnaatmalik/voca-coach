'use client';

import { useRouter } from 'next/navigation';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  color: string;
  description: string;
}

const DEFAULT_ACTIONS: QuickAction[] = [
  {
    id: 'session',
    label: 'Start Session',
    icon: '🎯',
    href: '/de-escalation',
    color: '#7C3AED',
    description: 'De-escalation practice'
  },
  {
    id: 'journal',
    label: 'Write Journal',
    icon: '📝',
    href: '/journal',
    color: '#EC4899',
    description: 'Reflect on your day'
  },
  {
    id: 'biomarkers',
    label: 'Voice Check',
    icon: '🎤',
    href: '/biomarkers',
    color: '#06B6D4',
    description: 'Analyze your voice'
  },
  {
    id: 'persona',
    label: 'AI Chat',
    icon: '💬',
    href: '/persona',
    color: '#10B981',
    description: 'Practice conversations'
  },
  {
    id: 'therapy',
    label: 'Book Therapy',
    icon: '📅',
    href: '/therapy',
    color: '#F59E0B',
    description: 'Schedule a session'
  },
  {
    id: 'chat',
    label: 'Chat Room',
    icon: '💭',
    href: '/chat',
    color: '#8B5CF6',
    description: 'Talk to therapist'
  }
];

interface QuickActionsProps {
  actions?: QuickAction[];
}

export default function QuickActions({ actions = DEFAULT_ACTIONS }: QuickActionsProps) {
  const router = useRouter();

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', marginBottom: '20px' }}>
        Quick Actions
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px'
      }}>
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => router.push(action.href)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 16px',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${action.color}10`;
              e.currentTarget.style.borderColor = `${action.color}40`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F9FAFB';
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `${action.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              {action.icon}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
              {action.label}
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280', textAlign: 'center' }}>
              {action.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
