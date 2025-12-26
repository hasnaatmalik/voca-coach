'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Session {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  notes: string | null;
  userNote: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface SessionsCardProps {
  title: string;
  icon: ReactNode;
  sessions: Session[];
  variant: 'upcoming' | 'past';
  loading?: boolean;
  emptyIcon: ReactNode;
  emptyTitle: string;
  emptySubtitle: string;
}

export default function SessionsCard({
  title,
  icon,
  sessions,
  variant,
  loading,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
}: SessionsCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
        border: '1px solid #F0E4D3',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#2D2D2D',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span>{icon}</span>
          {title}
        </h2>
        {variant === 'upcoming' && sessions.length > 0 && (
          <span style={{
            padding: '6px 14px',
            background: 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)',
            color: 'white',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '600',
          }}>
            {sessions.length} pending
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #F0E4D3',
              borderTop: '3px solid #D9A299',
              borderRadius: '50%',
              margin: '0 auto',
            }}
          />
          <p style={{ color: '#6B6B6B', marginTop: '12px', fontSize: '14px' }}>Loading...</p>
        </div>
      ) : sessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '40px' }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}
          >
            {emptyIcon}
          </motion.div>
          <p style={{ color: '#6B6B6B', fontWeight: '500' }}>{emptyTitle}</p>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
            {emptySubtitle}
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {sessions.slice(0, 5).map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4 }}
              style={{
                padding: '16px',
                borderRadius: '14px',
                background: variant === 'upcoming'
                  ? 'rgba(217, 162, 153, 0.08)'
                  : session.status === 'completed'
                    ? 'rgba(122, 184, 158, 0.08)'
                    : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${
                  variant === 'upcoming'
                    ? 'rgba(217, 162, 153, 0.2)'
                    : session.status === 'completed'
                      ? 'rgba(122, 184, 158, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)'
                }`,
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                <p style={{ fontWeight: '600', color: '#2D2D2D' }}>
                  {session.user.name}
                </p>
                <span style={{
                  padding: '4px 10px',
                  background: variant === 'upcoming'
                    ? '#ECFDF5'
                    : session.status === 'completed'
                      ? '#ECFDF5'
                      : '#FEF2F2',
                  color: variant === 'upcoming'
                    ? '#059669'
                    : session.status === 'completed'
                      ? '#059669'
                      : '#DC2626',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '500',
                  textTransform: 'capitalize',
                }}>
                  {variant === 'upcoming' ? 'Scheduled' : session.status}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#6B6B6B' }}>
                {formatDate(session.scheduledAt)}
              </p>
              {session.userNote && variant === 'upcoming' && (
                <p style={{
                  fontSize: '12px',
                  color: '#9CA3AF',
                  marginTop: '8px',
                  fontStyle: 'italic',
                  background: 'rgba(255, 255, 255, 0.5)',
                  padding: '8px 10px',
                  borderRadius: '8px',
                }}>
                  &quot;{session.userNote}&quot;
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
