'use client';

import { CSSProperties, useState } from 'react';
import type { ChatMessage, GroupedReaction, ChatReaction } from '@/types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showReadReceipt?: boolean;
  currentUserId: string;
  onReact?: (emoji: string) => void;
  onRemoveReaction?: (emoji: string) => void;
  onEdit?: (content: string) => void;
  onDelete?: () => void;
  onReply?: () => void;
  darkMode?: boolean;
}

// Group reactions for display
function groupReactions(reactions: ChatReaction[], currentUserId: string): GroupedReaction[] {
  const grouped = new Map<string, GroupedReaction>();

  for (const r of reactions) {
    const existing = grouped.get(r.emoji);
    if (existing) {
      existing.count++;
      existing.users.push({ userId: r.userId, userName: r.userName });
      if (r.userId === currentUserId) existing.hasUserReacted = true;
    } else {
      grouped.set(r.emoji, {
        emoji: r.emoji,
        count: 1,
        users: [{ userId: r.userId, userName: r.userName }],
        hasUserReacted: r.userId === currentUserId
      });
    }
  }

  return Array.from(grouped.values());
}

const QUICK_REACTIONS = ['👍', '❤️', '😊', '😮', '😢'];

export default function MessageBubble({
  message,
  isOwn,
  showReadReceipt,
  currentUserId,
  onReact,
  onRemoveReaction,
  onEdit,
  onDelete,
  onReply,
  darkMode = false
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupedReactions = groupReactions(message.reactions, currentUserId);

  // Handle deleted messages
  if (message.isDeleted) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        marginBottom: '12px'
      }}>
        <div style={{
          padding: '12px 16px',
          borderRadius: '16px',
          background: darkMode ? '#374151' : '#F3F4F6',
          color: darkMode ? '#9CA3AF' : '#6B7280',
          fontStyle: 'italic',
          fontSize: '14px'
        }}>
          This message was deleted
        </div>
      </div>
    );
  }

  const containerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: isOwn ? 'flex-end' : 'flex-start',
    marginBottom: '12px',
    position: 'relative'
  };

  const bubbleStyle: CSSProperties = {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
    background: isOwn
      ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
      : darkMode ? '#374151' : 'white',
    color: isOwn ? 'white' : darkMode ? '#F3F4F6' : '#1F2937',
    boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
    position: 'relative'
  };

  const replyPreviewStyle: CSSProperties = {
    padding: '8px 12px',
    marginBottom: '8px',
    borderLeft: '3px solid',
    borderColor: isOwn ? 'rgba(255,255,255,0.5)' : '#7C3AED',
    background: isOwn ? 'rgba(255,255,255,0.15)' : darkMode ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.08)',
    borderRadius: '4px',
    fontSize: '12px'
  };

  const timeStyle: CSSProperties = {
    fontSize: '11px',
    marginTop: '6px',
    opacity: 0.7,
    textAlign: 'right',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px'
  };

  const actionsStyle: CSSProperties = {
    position: 'absolute',
    top: '-8px',
    right: isOwn ? 'auto' : '-8px',
    left: isOwn ? '-8px' : 'auto',
    display: showActions ? 'flex' : 'none',
    gap: '4px',
    background: darkMode ? '#1F2937' : 'white',
    borderRadius: '20px',
    padding: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 10
  };

  const actionButtonStyle: CSSProperties = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    transition: 'background 0.2s'
  };

  const reactionPickerStyle: CSSProperties = {
    position: 'absolute',
    bottom: '100%',
    left: isOwn ? 'auto' : '0',
    right: isOwn ? '0' : 'auto',
    marginBottom: '4px',
    background: darkMode ? '#1F2937' : 'white',
    borderRadius: '24px',
    padding: '6px 10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: showReactionPicker ? 'flex' : 'none',
    gap: '4px',
    zIndex: 11
  };

  const reactionsContainerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '8px'
  };

  const reactionBadgeStyle = (hasUserReacted: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '12px',
    background: hasUserReacted
      ? isOwn ? 'rgba(255,255,255,0.25)' : 'rgba(124, 58, 237, 0.15)'
      : isOwn ? 'rgba(255,255,255,0.15)' : darkMode ? '#374151' : '#F3F4F6',
    fontSize: '13px',
    cursor: 'pointer',
    border: hasUserReacted ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent'
  });

  const handleReactionClick = (reaction: GroupedReaction) => {
    if (reaction.hasUserReacted) {
      onRemoveReaction?.(reaction.emoji);
    } else {
      onReact?.(reaction.emoji);
    }
  };

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactionPicker(false);
      }}
    >
      {/* Action buttons */}
      <div style={actionsStyle}>
        <button
          style={actionButtonStyle}
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          title="React"
        >
          😊
        </button>
        <button style={actionButtonStyle} onClick={onReply} title="Reply">
          ↩️
        </button>
        {isOwn && (
          <>
            <button style={actionButtonStyle} onClick={() => onEdit?.(message.content || '')} title="Edit">
              ✏️
            </button>
            <button style={actionButtonStyle} onClick={onDelete} title="Delete">
              🗑️
            </button>
          </>
        )}
      </div>

      {/* Reaction picker */}
      <div style={reactionPickerStyle}>
        {QUICK_REACTIONS.map(emoji => (
          <button
            key={emoji}
            style={{
              ...actionButtonStyle,
              fontSize: '18px'
            }}
            onClick={() => {
              onReact?.(emoji);
              setShowReactionPicker(false);
            }}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div style={bubbleStyle}>
        {/* Reply preview */}
        {message.replyToPreview && (
          <div style={replyPreviewStyle}>
            <div style={{ fontWeight: '600', marginBottom: '2px' }}>
              {message.replyToPreview.senderName}
            </div>
            <div style={{ opacity: 0.8 }}>
              {message.replyToPreview.type === 'voice' ? '🎤 Voice message' :
               message.replyToPreview.type === 'image' ? '🖼️ Image' :
               message.replyToPreview.type === 'file' ? '📎 File' :
               message.replyToPreview.content?.substring(0, 50)}
              {message.replyToPreview.content && message.replyToPreview.content.length > 50 ? '...' : ''}
            </div>
          </div>
        )}

        {/* Message content based on type */}
        {message.type === 'text' && (
          <p style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
            {message.content}
          </p>
        )}

        {message.type === 'voice' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: isOwn ? 'rgba(255,255,255,0.2)' : '#7C3AED',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              ▶
            </button>
            <div style={{ flex: 1 }}>
              <div style={{
                height: '24px',
                background: isOwn ? 'rgba(255,255,255,0.2)' : darkMode ? '#4B5563' : '#E5E7EB',
                borderRadius: '12px'
              }} />
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>
                {message.mediaDuration ? `${Math.floor(message.mediaDuration / 60)}:${(message.mediaDuration % 60).toString().padStart(2, '0')}` : '0:00'}
              </div>
            </div>
          </div>
        )}

        {message.type === 'image' && message.mediaUrl && (
          <div style={{ marginBottom: '8px' }}>
            <img
              src={message.mediaUrl}
              alt="Shared image"
              style={{
                maxWidth: '100%',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            />
            {message.content && (
              <p style={{ fontSize: '14px', marginTop: '8px' }}>{message.content}</p>
            )}
          </div>
        )}

        {message.type === 'file' && (
          <a
            href={message.mediaUrl}
            download={message.fileName}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: isOwn ? 'rgba(255,255,255,0.15)' : darkMode ? '#4B5563' : '#F3F4F6',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <span style={{ fontSize: '24px' }}>📎</span>
            <div>
              <div style={{ fontWeight: '500', fontSize: '13px' }}>{message.fileName}</div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>
                {message.mediaSize ? `${(message.mediaSize / 1024).toFixed(1)} KB` : 'Download'}
              </div>
            </div>
          </a>
        )}

        {/* Reactions */}
        {groupedReactions.length > 0 && (
          <div style={reactionsContainerStyle}>
            {groupedReactions.map(r => (
              <button
                key={r.emoji}
                style={reactionBadgeStyle(r.hasUserReacted)}
                onClick={() => handleReactionClick(r)}
              >
                <span>{r.emoji}</span>
                <span>{r.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Time and status */}
        <div style={timeStyle}>
          {message.isEdited && <span style={{ fontSize: '10px' }}>(edited)</span>}
          <span>{formatTime(message.createdAt)}</span>
          {isOwn && (
            <span style={{ fontSize: '10px' }}>
              {message.readAt ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
