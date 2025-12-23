'use client';

import { useState, useEffect, CSSProperties } from 'react';
import type { SmartReply } from '@/types/chat';

interface SmartRepliesProps {
  conversationId: string;
  lastMessage?: string;
  isTherapist?: boolean;
  onSelect: (reply: string) => void;
  darkMode?: boolean;
}

export default function SmartReplies({
  conversationId,
  lastMessage,
  isTherapist = false,
  onSelect,
  darkMode = false
}: SmartRepliesProps) {
  const [replies, setReplies] = useState<SmartReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!lastMessage) {
      setReplies([]);
      return;
    }

    const fetchReplies = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/chat/smart-replies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            lastMessage,
            isTherapist
          })
        });

        if (response.ok) {
          const data = await response.json();
          setReplies(data.replies || []);
          setVisible(true);
        }
      } catch (error) {
        console.error('Failed to fetch smart replies:', error);
        // Fallback to default replies
        setReplies(getDefaultReplies(isTherapist));
      } finally {
        setLoading(false);
      }
    };

    // Debounce the fetch
    const timeout = setTimeout(fetchReplies, 500);
    return () => clearTimeout(timeout);
  }, [conversationId, lastMessage, isTherapist]);

  const handleSelect = (reply: SmartReply) => {
    onSelect(reply.text);
    setVisible(false);
  };

  if (!visible || replies.length === 0) return null;

  const containerStyle: CSSProperties = {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    padding: '8px 16px',
    borderTop: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
    background: darkMode ? '#1F2937' : '#FAFAFA'
  };

  const chipStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: darkMode ? '#374151' : 'white',
    border: `1px solid ${darkMode ? '#4B5563' : '#E5E7EB'}`,
    borderRadius: '16px',
    fontSize: '13px',
    color: darkMode ? '#D1D5DB' : '#4B5563',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const loadingStyle: CSSProperties = {
    ...containerStyle,
    justifyContent: 'center',
    color: darkMode ? '#9CA3AF' : '#6B7280',
    fontSize: '12px'
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <span style={{ animation: 'pulse 1s infinite' }}>Generating suggestions...</span>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {replies.map((reply, index) => (
        <button
          key={index}
          style={chipStyle}
          onClick={() => handleSelect(reply)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#7C3AED';
            e.currentTarget.style.color = '#7C3AED';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = darkMode ? '#4B5563' : '#E5E7EB';
            e.currentTarget.style.color = darkMode ? '#D1D5DB' : '#4B5563';
          }}
        >
          {reply.emoji && <span>{reply.emoji}</span>}
          {reply.text}
        </button>
      ))}
    </div>
  );
}

// Default replies when API fails
function getDefaultReplies(isTherapist: boolean): SmartReply[] {
  if (isTherapist) {
    return [
      { text: "Tell me more about that.", emoji: "💭", category: "exploration" },
      { text: "How does that make you feel?", emoji: "❤️", category: "emotional" },
      { text: "That sounds challenging.", emoji: "🤝", category: "validation" }
    ];
  }
  return [
    { text: "I appreciate you listening.", emoji: "🙏", category: "gratitude" },
    { text: "I'm not sure how to explain it.", emoji: "🤔", category: "uncertainty" },
    { text: "That's helpful, thank you.", emoji: "💙", category: "positive" }
  ];
}
