'use client';

import { motion } from 'framer-motion';

interface Session {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  notes: string | null;
  userNote: string | null;
  therapist: {
    id: string;
    name: string;
    email: string;
    therapistProfile: {
      bio: string | null;
      specializations: string | null;
    } | null;
  };
}

interface SessionCardProps {
  session: Session;
  variant: 'upcoming' | 'past';
  onCancel?: () => void;
  index: number;
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  scheduled: { bg: 'rgba(122, 184, 158, 0.1)', color: '#5A9880' },
  completed: { bg: 'rgba(122, 175, 201, 0.1)', color: '#5A9BB8' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.1)', color: '#DC2626' },
};

export default function SessionCard({
  session,
  variant,
  onCancel,
  index,
}: SessionCardProps) {
  const date = new Date(session.scheduledAt);
  const statusStyle = STATUS_STYLES[session.status] || STATUS_STYLES.scheduled;

  const formatDate = () => ({
    day: date.getDate(),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    full: date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
  });

  const dateInfo = formatDate();

  if (variant === 'upcoming') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.01, y: -2 }}
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid #DCC5B2',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Date Badge */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          style={{
            width: '70px',
            height: '78px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(122, 184, 158, 0.3)',
          }}
        >
          <span style={{ fontSize: '11px', opacity: 0.9, textTransform: 'uppercase', fontWeight: '600' }}>
            {dateInfo.month}
          </span>
          <span style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1 }}>
            {dateInfo.day}
          </span>
        </motion.div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '17px',
            fontWeight: '600',
            color: '#2D2D2D',
            marginBottom: '4px',
          }}>
            {session.therapist.name}
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6B6B6B',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>{dateInfo.weekday}</span>
            <span style={{ color: '#DCC5B2' }}>•</span>
            <span>{dateInfo.time}</span>
            <span style={{ color: '#DCC5B2' }}>•</span>
            <span>{session.duration} min</span>
          </p>
          {session.userNote && (
            <p style={{
              fontSize: '13px',
              color: '#9CA3AF',
              marginTop: '8px',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>💭</span>
              &quot;{session.userNote}&quot;
            </p>
          )}
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            style={{
              padding: '10px 18px',
              background: '#FAF7F3',
              color: '#6B6B6B',
              border: '1px solid #DCC5B2',
              borderRadius: '10px',
              fontWeight: '500',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </motion.button>
        )}
      </motion.div>
    );
  }

  // Past session variant
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        borderBottom: '1px solid #F0E4D3',
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{
          fontWeight: '500',
          color: '#2D2D2D',
          marginBottom: '2px',
          fontSize: '15px',
        }}>
          {session.therapist.name}
        </p>
        <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
          {dateInfo.full}
        </p>
      </div>

      <span style={{
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '500',
        background: statusStyle.bg,
        color: statusStyle.color,
        textTransform: 'capitalize',
      }}>
        {session.status}
      </span>
    </motion.div>
  );
}
