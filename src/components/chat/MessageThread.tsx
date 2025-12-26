'use client';

import { CSSProperties } from 'react';
import type { ChatMessage } from '@/types/chat';

// SVG Icon Components
const MicIcon = ({ color = '#6B7280', size = 12 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const ImageIcon = ({ color = '#6B7280', size = 12 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const PaperclipIcon = ({ color = '#6B7280', size = 12 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const XIcon = ({ color = '#6B7280', size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ReplyIcon = ({ color = '#7C3AED', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
);

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
    const iconColor = isOwn ? 'rgba(255,255,255,0.8)' : (darkMode ? '#D1D5DB' : '#6B7280');
    if (replyTo.type === 'voice') return <><MicIcon color={iconColor} size={12} /> Voice message</>;
    if (replyTo.type === 'image') return <><ImageIcon color={iconColor} size={12} /> Image</>;
    if (replyTo.type === 'file') return <><PaperclipIcon color={iconColor} size={12} /> File</>;
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
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
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
    const iconColor = darkMode ? '#D1D5DB' : '#6B7280';
    if (replyTo.type === 'voice') return <><MicIcon color={iconColor} size={12} /> Voice message</>;
    if (replyTo.type === 'image') return <><ImageIcon color={iconColor} size={12} /> Image</>;
    if (replyTo.type === 'file') return <><PaperclipIcon color={iconColor} size={12} /> File</>;
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
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const cancelButtonStyle: CSSProperties = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    background: darkMode ? '#374151' : '#E5E7EB',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={containerStyle}>
      <div style={barStyle} />
      <div style={contentStyle}>
        <div style={labelStyle}>Replying to {replyTo.senderName || 'Unknown'}</div>
        <div style={textStyle}>{getContentPreview()}</div>
      </div>
      <button style={cancelButtonStyle} onClick={onCancel}>
        <XIcon color={darkMode ? '#D1D5DB' : '#6B7280'} size={14} />
      </button>
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
    opacity: Math.min(1, progress * 2),
    transform: `scale(${0.5 + progress * 0.5})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={containerStyle}>
      <span style={iconStyle}>
        <ReplyIcon color="#7C3AED" size={20} />
      </span>
    </div>
  );
}
