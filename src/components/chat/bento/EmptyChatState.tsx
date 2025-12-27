'use client';

import { motion } from 'framer-motion';

// SVG Icon Components
const ChatIcon = ({ color = '#D9A299', size = 48 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const WaveIcon = ({ color = '#D9A299', size = 40 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.5 12.5c0-3.04-2.46-5.5-5.5-5.5-3.04 0-5.5 2.46-5.5 5.5" />
    <path d="M8.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
    <path d="M12 22v-6" />
    <path d="M7 22h10" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

interface EmptyChatStateProps {
  variant: 'no-conversation' | 'no-messages';
}

export default function EmptyChatState({ variant }: EmptyChatStateProps) {
  if (variant === 'no-conversation') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          background: '#FAF7F3',
          padding: '40px',
        }}
      >
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 100%)',
            border: '2px solid #DCC5B2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
          }}
        >
          <ChatIcon color="#D9A299" size={48} />
        </motion.div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#2D2D2D',
          marginBottom: '8px',
        }}>
          Select a conversation
        </h3>
        <p style={{ color: '#6B6B6B', fontSize: '15px' }}>
          Choose a therapist to start chatting
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        textAlign: 'center',
        padding: '60px 40px',
      }}
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 100%)',
          border: '2px solid #DCC5B2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <WaveIcon color="#D9A299" size={40} />
      </motion.div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#2D2D2D',
        marginBottom: '8px',
      }}>
        Say hello!
      </h3>
      <p style={{ color: '#6B6B6B', fontSize: '14px' }}>
        Start a conversation with your therapist
      </p>
    </motion.div>
  );
}
