'use client';

import { CSSProperties } from 'react';
import type { ChatMessage } from '@/types/chat';

interface ReplyPreviewProps {
  replyTo: {
    id: string;
    content?: string | null;
    senderName: string;
    type: string;
  };
  onClick?: () => void;
  isOwn?: boolean;
  darkMode?: boolean;
}

export function ReplyPreview({
  replyTo,
  onClick,
  isOwn = false,
  darkMode = false
}: ReplyPreviewProps) {
  const getContentPreview = () => {
    if (replyTo.type === 'voice') return '🎤 Voice message';
    if (replyTo.type === 'image') return '🖼️ Image';
    if (replyTo.type === 'file') return '📎 File';
    if (!replyTo.content) return 'Message';
    return replyTo.content.length > 50
      ? replyTo.content.slice(0, 50) + '...'
      : replyTo.content;
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'stretch',
    gap: '8px',
    padding: '6px 10px',
    background: isOwn ? 'rgba(255,255,255,0.1)' : (darkMode ? '#374151' : '#F3F4F6'),
    borderRadius: '8px',
    marginBottom: '6px',
    cursor: onClick ? 'pointer' : 'default',
    maxWidth: '100%',
    overflow: 'hidden'
  };

  const barStyle: CSSProperties = {
    width: '3px',
    borderRadius: '2px',
    background: 'linear-gradient(180deg, #7C3AED 0%, #EC4899 100%)',
    flexShrink: 0
  };

  const contentStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden'
  };

  const senderStyle: CSSProperties = {
    fontSize: '11px',
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: '2px'
  };

  const textStyle: CSSProperties = {
    fontSize: '12px',
    color: isOwn ? 'rgba(255,255,255,0.8)' : (darkMode ? '#D1D5DB' : '#6B7280'),
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  return (
    <div style={containerStyle} onClick={onClick}>
      <div style={barStyle} />
      <div style={contentStyle}>
        <div style={senderStyle}>{replyTo.senderName}</div>
        <div style={textStyle}>{getContentPreview()}</div>
      </div>
    </div>
  );
}

// Reply input bar that shows when replying to a message
interface ReplyInputBarProps {
  replyTo: ChatMessage;
  onCancel: () => void;
  darkMode?: boolean;
}

export function ReplyInputBar({
  replyTo,
  onCancel,
  darkMode = false
}: ReplyInputBarProps) {
  const getContentPreview = () => {
    if (replyTo.type === 'voice') return '🎤 Voice message';
    if (replyTo.type === 'image') return '🖼️ Image';
    if (replyTo.type === 'file') return '📎 File';
    if (!replyTo.content) return 'Message';
    return replyTo.content.length > 60
      ? replyTo.content.slice(0, 60) + '...'
      : replyTo.content;
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    background: darkMode ? '#1F2937' : '#F9FAFB',
    borderTop: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`
  };

  const barStyle: CSSProperties = {
    width: '3px',
    height: '32px',
    borderRadius: '2px',
    background: 'linear-gradient(180deg, #7C3AED 0%, #EC4899 100%)',
    flexShrink: 0
  };

  const contentStyle: CSSProperties = {
    flex: 1,
    minWidth: 0
  };

  const labelStyle: CSSProperties = {
    fontSize: '11px',
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: '2px'
  };

  const textStyle: CSSProperties = {
    fontSize: '13px',
    color: darkMode ? '#D1D5DB' : '#6B7280',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const cancelButtonStyle: CSSProperties = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    background: darkMode ? '#374151' : '#E5E7EB',
    color: darkMode ? '#D1D5DB' : '#6B7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  };

  return (
    <div style={containerStyle}>
      <div style={barStyle} />
      <div style={contentStyle}>
        <div style={labelStyle}>Replying to {replyTo.sender?.name || 'Unknown'}</div>
        <div style={textStyle}>{getContentPreview()}</div>
      </div>
      <button style={cancelButtonStyle} onClick={onCancel}>✕</button>
    </div>
  );
}

// Swipe-to-reply hint overlay
interface SwipeHintProps {
  direction: 'left' | 'right';
  progress: number; // 0-1
  darkMode?: boolean;
}

export function SwipeReplyHint({
  direction,
  progress,
  darkMode = false
}: SwipeHintProps) {
  if (progress < 0.1) return null;

  const containerStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    [direction]: 0,
    width: `${Math.min(80, progress * 100)}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(${direction === 'left' ? '90deg' : '270deg'}, rgba(124, 58, 237, ${progress * 0.3}), transparent)`,
    pointerEvents: 'none'
  };

  const iconStyle: CSSProperties = {
    fontSize: '20px',
    opacity: Math.min(1, progress * 2),
    transform: `scale(${0.5 + progress * 0.5})`
  };

  return (
    <div style={containerStyle}>
      <span style={iconStyle}>↩️</span>
    </div>
  );
}
