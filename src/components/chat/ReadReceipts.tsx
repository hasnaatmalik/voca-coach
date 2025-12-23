'use client';

import { CSSProperties } from 'react';

interface ReadReceiptsProps {
  status: 'sending' | 'sent' | 'delivered' | 'read';
  readAt?: string | null;
  isOwn: boolean;
  darkMode?: boolean;
}

export default function ReadReceipts({
  status,
  readAt,
  isOwn,
  darkMode = false
}: ReadReceiptsProps) {
  if (!isOwn) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="31.4">
              <animate attributeName="stroke-dashoffset" dur="1s" values="31.4;0" fill="freeze" />
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
            </circle>
          </svg>
        );
      case 'sent':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        );
      case 'delivered':
        return (
          <svg width="16" height="14" viewBox="0 0 28 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
            <polyline points="26 6 15 17 12 14" style={{ opacity: 0.6 }} />
          </svg>
        );
      case 'read':
        return (
          <svg width="16" height="14" viewBox="0 0 28 24" fill="none" stroke="#7C3AED" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
            <polyline points="26 6 15 17 12 14" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return 'Sending...';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'read':
        if (readAt) {
          const date = new Date(readAt);
          return `Read at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        return 'Read';
      default:
        return '';
    }
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '2px'
  };

  const iconStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    color: status === 'read' ? '#7C3AED' : (isOwn ? 'rgba(255,255,255,0.6)' : (darkMode ? '#9CA3AF' : '#9CA3AF'))
  };

  return (
    <div style={containerStyle} title={getStatusText()}>
      <span style={iconStyle}>{getStatusIcon()}</span>
    </div>
  );
}

// Larger version with text for message details
export function ReadReceiptsDetailed({
  status,
  readAt,
  sentAt,
  darkMode = false
}: {
  status: 'sending' | 'sent' | 'delivered' | 'read';
  readAt?: string | null;
  sentAt?: string;
  darkMode?: boolean;
}) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '11px',
    color: darkMode ? '#9CA3AF' : '#6B7280'
  };

  const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={containerStyle}>
      {sentAt && (
        <div style={rowStyle}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Sent: {formatTime(sentAt)}</span>
        </div>
      )}
      {status === 'read' && readAt && (
        <div style={{ ...rowStyle, color: '#7C3AED' }}>
          <svg width="14" height="12" viewBox="0 0 28 24" fill="none" stroke="#7C3AED" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
            <polyline points="26 6 15 17 12 14" />
          </svg>
          <span>Read: {formatTime(readAt)}</span>
        </div>
      )}
    </div>
  );
}
