'use client';

import { motion } from 'framer-motion';

interface ChatHeaderProps {
  name: string;
  isOnline: boolean;
  lastActiveAt?: string;
  onVideoCall?: () => void;
  isVideoCallEnabled?: boolean;
}

export default function ChatHeader({ 
  name, 
  isOnline, 
  lastActiveAt, 
  onVideoCall,
  isVideoCallEnabled = true,
}: ChatHeaderProps) {
  const formatLastSeen = (dateStr?: string) => {
    if (!dateStr) return 'Offline';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const canCall = isOnline && isVideoCallEnabled && onVideoCall;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '18px 24px',
        borderBottom: '1px solid #F0E4D3',
        background: '#FAF7F3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ position: 'relative' }}>
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '18px',
              boxShadow: '0 4px 12px rgba(122, 184, 158, 0.3)',
            }}
          >
            {name.charAt(0)}
          </motion.div>
          <motion.div
            animate={isOnline ? { scale: [1, 1.3, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: isOnline ? '#7AB89E' : '#9CA3AF',
              border: '2px solid white',
              boxShadow: isOnline ? '0 0 8px rgba(122, 184, 158, 0.5)' : 'none',
            }}
          />
        </div>
        <div>
          <h3 style={{
            fontWeight: '700',
            color: '#2D2D2D',
            fontSize: '16px',
          }}>
            {name}
          </h3>
          <p style={{
            fontSize: '13px',
            color: isOnline ? '#7AB89E' : '#6B6B6B',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            {isOnline ? (
              <>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#7AB89E',
                }} />
                Online
              </>
            ) : (
              formatLastSeen(lastActiveAt)
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {/* Video Call Button */}
        {onVideoCall && (
          <motion.button
            whileHover={canCall ? { scale: 1.05 } : {}}
            whileTap={canCall ? { scale: 0.95 } : {}}
            onClick={canCall ? onVideoCall : undefined}
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
              boxShadow: canCall ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none',
            }}
            title={!isOnline ? 'User is offline' : 'Start video call'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            border: '1px solid #DCC5B2',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}
          title="Search messages"
        >
          🔍
        </motion.button>
      </div>
    </motion.div>
  );
}
