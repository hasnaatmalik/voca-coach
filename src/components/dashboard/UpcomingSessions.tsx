'use client';

import { useRouter } from 'next/navigation';
import type { UpcomingSession } from '@/types/dashboard';

interface UpcomingSessionsProps {
  sessions: UpcomingSession[];
}

function formatTimeUntil(date: Date): { text: string; isStartingSoon: boolean } {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins <= 0) {
    return { text: 'Starting now', isStartingSoon: true };
  }
  if (diffMins < 30) {
    return { text: `In ${diffMins} min`, isStartingSoon: true };
  }
  if (diffMins < 60) {
    return { text: `In ${diffMins} min`, isStartingSoon: false };
  }
  if (diffHours < 24) {
    return { text: `In ${diffHours}h ${diffMins % 60}m`, isStartingSoon: false };
  }
  if (diffDays === 1) {
    return { text: 'Tomorrow', isStartingSoon: false };
  }
  return { text: `In ${diffDays} days`, isStartingSoon: false };
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleDateString('en-US', options);
}

export default function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  const router = useRouter();

  if (!sessions || sessions.length === 0) {
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
          Upcoming Sessions
        </h3>
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#6B7280' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
          <div style={{ fontSize: '14px', marginBottom: '16px' }}>No upcoming sessions</div>
          <button
            onClick={() => router.push('/therapy')}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Book a Session
          </button>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>
          Upcoming Sessions
        </h3>
        <button
          onClick={() => router.push('/therapy')}
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
          + Book
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sessions.map((session) => {
          const timeInfo = formatTimeUntil(new Date(session.scheduledAt));

          return (
            <div
              key={session.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: timeInfo.isStartingSoon ? 'rgba(16, 185, 129, 0.08)' : '#F9FAFB',
                borderRadius: '12px',
                border: timeInfo.isStartingSoon ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  {session.therapistName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
                    {session.therapistName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    {formatDateTime(session.scheduledAt)} • {session.duration} min
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: timeInfo.isStartingSoon ? '#10B981' : '#6B7280'
                }}>
                  {timeInfo.text}
                </span>
                {timeInfo.isStartingSoon && (
                  <button
                    onClick={() => router.push(`/therapy/session/${session.id}`)}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
