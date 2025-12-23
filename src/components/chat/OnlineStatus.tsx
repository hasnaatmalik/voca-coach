'use client';

import { CSSProperties } from 'react';
import type { UserPresence } from '@/types/chat';

interface OnlineStatusProps {
  presence?: UserPresence;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  darkMode?: boolean;
}

export default function OnlineStatus({
  presence,
  size = 'small',
  showLabel = false,
  darkMode = false
}: OnlineStatusProps) {
  const isOnline = presence?.status === 'online';
  const isAway = presence?.status === 'away';

  const getSizeStyles = () => {
    switch (size) {
      case 'large':
        return { dot: 14, fontSize: 14 };
      case 'medium':
        return { dot: 10, fontSize: 13 };
      default:
        return { dot: 8, fontSize: 12 };
    }
  };

  const getStatusColor = () => {
    if (isOnline) return '#10B981'; // Green
    if (isAway) return '#F59E0B'; // Yellow/amber
    return '#9CA3AF'; // Gray
  };

  const getStatusText = () => {
    if (isOnline) return 'Online';
    if (isAway) return 'Away';
    if (presence?.lastSeen) {
      return formatLastSeen(presence.lastSeen);
    }
    return 'Offline';
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const sizes = getSizeStyles();
  const statusColor = getStatusColor();

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const dotStyle: CSSProperties = {
    width: `${sizes.dot}px`,
    height: `${sizes.dot}px`,
    borderRadius: '50%',
    background: statusColor,
    flexShrink: 0,
    boxShadow: isOnline ? `0 0 0 2px ${darkMode ? '#1F2937' : 'white'}` : 'none'
  };

  const labelStyle: CSSProperties = {
    fontSize: `${sizes.fontSize}px`,
    color: darkMode ? '#9CA3AF' : '#6B7280'
  };

  return (
    <div style={containerStyle}>
      <div style={dotStyle} />
      {showLabel && <span style={labelStyle}>{getStatusText()}</span>}
    </div>
  );
}

// Inline badge version for headers
export function OnlineStatusBadge({
  presence,
  userName,
  darkMode = false
}: {
  presence?: UserPresence;
  userName: string;
  darkMode?: boolean;
}) {
  const isOnline = presence?.status === 'online';
  const isAway = presence?.status === 'away';

  const getStatusColor = () => {
    if (isOnline) return '#10B981';
    if (isAway) return '#F59E0B';
    return '#9CA3AF';
  };

  const getStatusText = () => {
    if (isOnline) return 'Active now';
    if (isAway) return 'Away';
    if (presence?.lastSeen) {
      const date = new Date(presence.lastSeen);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Active just now';
      if (diffMins < 60) return `Active ${diffMins}m ago`;
      if (diffHours < 24) return `Active ${diffHours}h ago`;
      return `Last seen ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
    }
    return 'Offline';
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const avatarContainerStyle: CSSProperties = {
    position: 'relative',
    width: '40px',
    height: '40px'
  };

  const avatarStyle: CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '16px'
  };

  const statusDotStyle: CSSProperties = {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: getStatusColor(),
    border: `2px solid ${darkMode ? '#1F2937' : 'white'}`
  };

  const infoStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column'
  };

  const nameStyle: CSSProperties = {
    fontWeight: '600',
    fontSize: '15px',
    color: darkMode ? '#F3F4F6' : '#1F2937'
  };

  const statusStyle: CSSProperties = {
    fontSize: '12px',
    color: isOnline ? '#10B981' : (darkMode ? '#9CA3AF' : '#6B7280')
  };

  const initial = userName.charAt(0).toUpperCase();

  return (
    <div style={containerStyle}>
      <div style={avatarContainerStyle}>
        <div style={avatarStyle}>{initial}</div>
        <div style={statusDotStyle} />
      </div>
      <div style={infoStyle}>
        <span style={nameStyle}>{userName}</span>
        <span style={statusStyle}>{getStatusText()}</span>
      </div>
    </div>
  );
}
