'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ChatNotificationBadgeProps {
  isTherapist?: boolean;
}

export default function ChatNotificationBadge({ isTherapist = false }: ChatNotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 10 seconds
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/chat/unread');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const chatUrl = isTherapist ? '/therapist/chat' : '/chat';

  return (
    <Link
      href={chatUrl}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: unreadCount > 0 ? 'rgba(124, 58, 237, 0.1)' : 'rgba(255, 255, 255, 0.5)',
        transition: 'all 0.2s',
        textDecoration: 'none',
      }}
    >
      <span style={{ fontSize: '20px' }}>💬</span>
      
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          minWidth: '20px',
          height: '20px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
          color: 'white',
          fontSize: '11px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 6px',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
          animation: 'pulse-badge 2s infinite',
        }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
      
      <style jsx global>{`
        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </Link>
  );
}
