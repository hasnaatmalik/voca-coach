'use client';

import { ConnectionState } from '@/lib/webrtc-manager';

interface CallStatusProps {
  state: ConnectionState;
}

const stateConfig: Record<ConnectionState, { label: string; color: string; bgColor: string; icon: string }> = {
  idle: {
    label: 'Waiting',
    color: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.2)',
    icon: '⏳',
  },
  connecting: {
    label: 'Connecting',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.2)',
    icon: '🔄',
  },
  connected: {
    label: 'Connected',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.2)',
    icon: '✓',
  },
  reconnecting: {
    label: 'Reconnecting',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.2)',
    icon: '🔄',
  },
  failed: {
    label: 'Connection Failed',
    color: '#DC2626',
    bgColor: 'rgba(220, 38, 38, 0.2)',
    icon: '✕',
  },
  closed: {
    label: 'Disconnected',
    color: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.2)',
    icon: '—',
  },
};

export default function CallStatus({ state }: CallStatusProps) {
  const config = stateConfig[state];

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 14px',
      background: config.bgColor,
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '500',
      color: 'white',
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: config.color,
        boxShadow: state === 'connected' ? `0 0 8px ${config.color}` : 'none',
        animation: state === 'connecting' || state === 'reconnecting' ? 'pulse 1.5s infinite' : 'none',
      }} />
      <span>{config.label}</span>
    </div>
  );
}
