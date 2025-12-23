'use client';

import { useState, CSSProperties } from 'react';
import type { GroupedReaction } from '@/types/chat';

interface ReactionPickerProps {
  messageId: string;
  existingReactions?: GroupedReaction[];
  onReact: (emoji: string) => void;
  onUnreact: (emoji: string) => void;
  currentUserId: string;
  darkMode?: boolean;
}

const QUICK_REACTIONS = ['❤️', '👍', '😊', '🙏', '💪', '🤗'];

const FULL_EMOJI_SET = {
  'Frequently Used': ['❤️', '👍', '😊', '🙏', '💪', '🤗', '😢', '🥺'],
  'Supportive': ['💙', '💜', '🫂', '✨', '🌟', '🌈', '☀️', '🌻'],
  'Emotional': ['😊', '😢', '😮', '🥹', '😌', '🥰', '🤔', '😔'],
  'Encouraging': ['💪', '👏', '🎉', '🙌', '✊', '🔥', '⭐', '🏆'],
  'Acknowledgment': ['👍', '👌', '✅', '🤝', '💯', '📝', '✨', '💡']
};

export default function ReactionPicker({
  messageId,
  existingReactions = [],
  onReact,
  onUnreact,
  currentUserId,
  darkMode = false
}: ReactionPickerProps) {
  const [showFullPicker, setShowFullPicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Frequently Used');

  const userReactions = existingReactions
    .filter(r => r.users.some(u => u.id === currentUserId))
    .map(r => r.emoji);

  const handleEmojiClick = (emoji: string) => {
    if (userReactions.includes(emoji)) {
      onUnreact(emoji);
    } else {
      onReact(emoji);
    }
    setShowFullPicker(false);
  };

  const quickBarStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    background: darkMode ? '#374151' : 'white',
    borderRadius: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  };

  const emojiButtonStyle = (isActive: boolean): CSSProperties => ({
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    background: isActive ? 'rgba(124, 58, 237, 0.2)' : 'transparent',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s, background 0.15s'
  });

  const expandButtonStyle: CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    background: darkMode ? '#4B5563' : '#F3F4F6',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '4px'
  };

  const fullPickerStyle: CSSProperties = {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    marginBottom: '8px',
    background: darkMode ? '#1F2937' : 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    padding: '8px',
    width: '280px',
    zIndex: 100
  };

  const categoryTabsStyle: CSSProperties = {
    display: 'flex',
    gap: '4px',
    marginBottom: '8px',
    overflowX: 'auto',
    paddingBottom: '4px'
  };

  const categoryTabStyle = (isActive: boolean): CSSProperties => ({
    padding: '4px 8px',
    borderRadius: '12px',
    border: 'none',
    background: isActive ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' : 'transparent',
    color: isActive ? 'white' : (darkMode ? '#9CA3AF' : '#6B7280'),
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  });

  const emojiGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '4px'
  };

  const gridEmojiStyle: CSSProperties = {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={quickBarStyle}>
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            style={emojiButtonStyle(userReactions.includes(emoji))}
            onClick={() => handleEmojiClick(emoji)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {emoji}
          </button>
        ))}
        <button
          style={expandButtonStyle}
          onClick={() => setShowFullPicker(!showFullPicker)}
        >
          {showFullPicker ? '✕' : '+'}
        </button>
      </div>

      {showFullPicker && (
        <div style={fullPickerStyle}>
          <div style={categoryTabsStyle}>
            {Object.keys(FULL_EMOJI_SET).map((category) => (
              <button
                key={category}
                style={categoryTabStyle(activeCategory === category)}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div style={emojiGridStyle}>
            {FULL_EMOJI_SET[activeCategory as keyof typeof FULL_EMOJI_SET].map((emoji) => (
              <button
                key={emoji}
                style={{
                  ...gridEmojiStyle,
                  background: userReactions.includes(emoji) ? 'rgba(124, 58, 237, 0.2)' : 'transparent'
                }}
                onClick={() => handleEmojiClick(emoji)}
                onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#374151' : '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.background = userReactions.includes(emoji) ? 'rgba(124, 58, 237, 0.2)' : 'transparent'}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Display existing reactions on a message
export function ReactionDisplay({
  reactions,
  onReact,
  onUnreact,
  currentUserId,
  darkMode = false
}: {
  reactions: GroupedReaction[];
  onReact: (emoji: string) => void;
  onUnreact: (emoji: string) => void;
  currentUserId: string;
  darkMode?: boolean;
}) {
  if (reactions.length === 0) return null;

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '4px'
  };

  const reactionBadgeStyle = (hasReacted: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '12px',
    background: hasReacted ? 'rgba(124, 58, 237, 0.15)' : (darkMode ? '#374151' : '#F3F4F6'),
    border: hasReacted ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent',
    cursor: 'pointer',
    fontSize: '13px'
  });

  const countStyle: CSSProperties = {
    fontSize: '11px',
    fontWeight: '500',
    color: darkMode ? '#D1D5DB' : '#6B7280'
  };

  return (
    <div style={containerStyle}>
      {reactions.map((reaction) => {
        const hasReacted = reaction.users.some(u => u.id === currentUserId);
        return (
          <button
            key={reaction.emoji}
            style={reactionBadgeStyle(hasReacted)}
            onClick={() => hasReacted ? onUnreact(reaction.emoji) : onReact(reaction.emoji)}
            title={reaction.users.map(u => u.name).join(', ')}
          >
            <span>{reaction.emoji}</span>
            <span style={countStyle}>{reaction.count}</span>
          </button>
        );
      })}
    </div>
  );
}
