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
    // Poll every 30 seconds (reduced frequency)
    const interval = setInterval(fetchUnreadCount, 30000);
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
        background: unreadCount > 0 ? 'rgba(217, 162, 153, 0.15)' : 'transparent',
        transition: 'all 0.2s',
        textDecoration: 'none',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D9A299" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          minWidth: '18px',
          height: '18px',
          borderRadius: '9px',
          background: 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)',
          color: 'white',
          fontSize: '10px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 5px',
          boxShadow: '0 2px 8px rgba(217, 162, 153, 0.5)',
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
