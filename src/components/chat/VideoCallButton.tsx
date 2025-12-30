'use client';

import { motion } from 'framer-motion';

interface VideoCallButtonProps {
  onClick: () => void;
  isOnline: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
}

export function VideoCallButton({
  onClick,
  isOnline,
  isDisabled,
  isLoading,
}: VideoCallButtonProps) {
  const canCall = isOnline && !isDisabled && !isLoading;

  return (
    <div style={{ position: 'relative' }}>
      <motion.button
        whileHover={canCall ? { scale: 1.05 } : {}}
        whileTap={canCall ? { scale: 0.95 } : {}}
        onClick={canCall ? onClick : undefined}
        disabled={!canCall}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          border: 'none',
          background: canCall
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : '#e5e5e5',
          color: canCall ? 'white' : '#999',
          cursor: canCall ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          boxShadow: canCall ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none',
        }}
        title={
          !isOnline
            ? 'User is offline'
            : isLoading
            ? 'Connecting...'
            : 'Start video call'
        }
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
            </svg>
          </motion.div>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        )}
      </motion.button>

      {/* Offline indicator tooltip */}
      {!isOnline && !isLoading && (
        <div
          style={{
            position: 'absolute',
            bottom: '-36px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            fontSize: '11px',
            padding: '6px 10px',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            opacity: 0,
            transition: 'opacity 0.2s',
            pointerEvents: 'none',
          }}
          className="video-call-tooltip"
        >
          User is offline
        </div>
      )}

      <style>{`
        button:hover + div.video-call-tooltip,
        button:focus + div.video-call-tooltip {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
