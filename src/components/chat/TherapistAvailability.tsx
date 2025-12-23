'use client';

import { useState, useEffect, CSSProperties } from 'react';
import type { UserPresence } from '@/types/chat';

interface TherapistSchedule {
  dayOfWeek: number; // 0-6, Sunday-Saturday
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

interface TherapistAvailabilityProps {
  therapistId: string;
  therapistName: string;
  presence?: UserPresence;
  schedule?: TherapistSchedule[];
  nextAvailable?: string; // ISO date string
  darkMode?: boolean;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TherapistAvailability({
  therapistId,
  therapistName,
  presence,
  schedule = [],
  nextAvailable,
  darkMode = false
}: TherapistAvailabilityProps) {
  const [expanded, setExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = presence?.status === 'online';

  const isWithinSchedule = () => {
    const now = currentTime;
    const dayOfWeek = now.getDay();
    const currentHHMM = now.toTimeString().slice(0, 5);

    const todaySchedule = schedule.find(s => s.dayOfWeek === dayOfWeek);
    if (!todaySchedule) return false;

    return currentHHMM >= todaySchedule.startTime && currentHHMM <= todaySchedule.endTime;
  };

  const getAvailabilityStatus = () => {
    if (isOnline) return { text: 'Available now', color: '#10B981' };
    if (isWithinSchedule()) return { text: 'Within office hours', color: '#F59E0B' };
    if (nextAvailable) {
      const next = new Date(nextAvailable);
      const diff = next.getTime() - currentTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (days > 0) return { text: `Available in ${days}d`, color: '#6B7280' };
      if (hours > 0) return { text: `Available in ${hours}h`, color: '#6B7280' };
      return { text: 'Available soon', color: '#F59E0B' };
    }
    return { text: 'Offline', color: '#6B7280' };
  };

  const getNextAvailableTime = () => {
    if (nextAvailable) {
      const date = new Date(nextAvailable);
      const isToday = date.toDateString() === currentTime.toDateString();
      const isTomorrow = date.toDateString() === new Date(currentTime.getTime() + 86400000).toDateString();

      const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

      if (isToday) return `Today at ${timeStr}`;
      if (isTomorrow) return `Tomorrow at ${timeStr}`;
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + ` at ${timeStr}`;
    }
    return null;
  };

  const status = getAvailabilityStatus();

  const containerStyle: CSSProperties = {
    background: darkMode ? '#1F2937' : '#F9FAFB',
    borderRadius: '12px',
    overflow: 'hidden'
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    cursor: schedule.length > 0 ? 'pointer' : 'default'
  };

  const infoStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const avatarStyle: CSSProperties = {
    position: 'relative',
    width: '40px',
    height: '40px'
  };

  const avatarImageStyle: CSSProperties = {
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
    background: isOnline ? '#10B981' : '#6B7280',
    border: `2px solid ${darkMode ? '#1F2937' : '#F9FAFB'}`
  };

  const nameStyle: CSSProperties = {
    fontWeight: '600',
    fontSize: '14px',
    color: darkMode ? '#F3F4F6' : '#1F2937'
  };

  const availabilityTextStyle: CSSProperties = {
    fontSize: '12px',
    color: status.color,
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const expandIconStyle: CSSProperties = {
    fontSize: '16px',
    color: darkMode ? '#9CA3AF' : '#6B7280',
    transition: 'transform 0.2s',
    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
  };

  const scheduleContainerStyle: CSSProperties = {
    padding: '0 16px 16px',
    borderTop: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
    marginTop: '4px',
    paddingTop: '12px'
  };

  const scheduleTitleStyle: CSSProperties = {
    fontSize: '12px',
    fontWeight: '600',
    color: darkMode ? '#D1D5DB' : '#6B7280',
    marginBottom: '8px'
  };

  const scheduleGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
    marginBottom: '12px'
  };

  const dayStyle = (hasSchedule: boolean, isToday: boolean): CSSProperties => ({
    textAlign: 'center',
    padding: '8px 4px',
    borderRadius: '6px',
    background: hasSchedule
      ? (isToday ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' : 'rgba(124, 58, 237, 0.1)')
      : 'transparent',
    color: hasSchedule
      ? (isToday ? 'white' : '#7C3AED')
      : (darkMode ? '#6B7280' : '#9CA3AF'),
    fontSize: '11px',
    fontWeight: isToday ? '600' : '400'
  });

  const nextAvailableStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: darkMode ? '#374151' : 'white',
    borderRadius: '8px',
    fontSize: '12px',
    color: darkMode ? '#D1D5DB' : '#4B5563'
  };

  const initial = therapistName.charAt(0).toUpperCase();
  const todayIndex = currentTime.getDay();

  return (
    <div style={containerStyle}>
      <div
        style={headerStyle}
        onClick={() => schedule.length > 0 && setExpanded(!expanded)}
      >
        <div style={infoStyle}>
          <div style={avatarStyle}>
            <div style={avatarImageStyle}>{initial}</div>
            <div style={statusDotStyle} />
          </div>
          <div>
            <div style={nameStyle}>{therapistName}</div>
            <div style={availabilityTextStyle}>
              <span style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: status.color
              }} />
              {status.text}
            </div>
          </div>
        </div>
        {schedule.length > 0 && (
          <span style={expandIconStyle}>▼</span>
        )}
      </div>

      {expanded && schedule.length > 0 && (
        <div style={scheduleContainerStyle}>
          <div style={scheduleTitleStyle}>Office Hours</div>
          <div style={scheduleGridStyle}>
            {DAY_NAMES.map((day, index) => {
              const daySchedule = schedule.find(s => s.dayOfWeek === index);
              return (
                <div key={day} style={dayStyle(!!daySchedule, index === todayIndex)}>
                  <div>{day}</div>
                  {daySchedule && (
                    <div style={{ fontSize: '9px', marginTop: '2px', opacity: 0.8 }}>
                      {daySchedule.startTime.slice(0, 5)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!isOnline && getNextAvailableTime() && (
            <div style={nextAvailableStyle}>
              <span>📅</span>
              <span>Next available: {getNextAvailableTime()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact badge version
export function TherapistStatusBadge({
  isOnline,
  darkMode = false
}: {
  isOnline: boolean;
  darkMode?: boolean;
}) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '12px',
      background: isOnline ? 'rgba(16, 185, 129, 0.1)' : (darkMode ? '#374151' : '#F3F4F6'),
      fontSize: '11px',
      fontWeight: '500',
      color: isOnline ? '#10B981' : (darkMode ? '#9CA3AF' : '#6B7280')
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: isOnline ? '#10B981' : '#6B7280'
      }} />
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}
