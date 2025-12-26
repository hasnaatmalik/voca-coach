'use client';

import { ReactNode } from 'react';
import { ViewMode, JournalStreak } from '../types';

// SVG Icon Components
const ChatIcon = ({ color = '#4B5563', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const PencilIcon = ({ color = '#4B5563', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const HeartHandsIcon = ({ color = '#4B5563', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 14h2" />
    <path d="M12 14v6" />
    <path d="M4 9.5a3.5 3.5 0 1 1 7 0V11h2V9.5a3.5 3.5 0 1 1 7 0V16c0 2.21-1.79 4-4 4H8c-2.21 0-4-1.79-4-4V9.5z" />
  </svg>
);

const BrainIcon = ({ color = '#4B5563', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M12 18v4" />
  </svg>
);

const MicIcon = ({ color = '#4B5563', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const BookIcon = ({ color = '#4B5563', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ChartIcon = ({ color = '#4B5563', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const LightbulbIcon = ({ color = '#4B5563', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const FlameIcon = ({ color = '#92400E', size = 32 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

interface JournalSidebarProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  streak: JournalStreak | null;
  currentMood?: number | null;
}

const VIEW_ITEMS: Array<{ mode: ViewMode; icon: ReactNode; label: string }> = [
  { mode: 'chat', icon: <ChatIcon />, label: 'Chat' },
  { mode: 'write', icon: <PencilIcon />, label: 'Write' },
  { mode: 'gratitude', icon: <HeartHandsIcon />, label: 'Gratitude' },
  { mode: 'cbt', icon: <BrainIcon />, label: 'CBT Exercise' },
  { mode: 'voice', icon: <MicIcon />, label: 'Voice' },
];

const NAVIGATION_ITEMS: Array<{ mode: ViewMode; icon: ReactNode; label: string }> = [
  { mode: 'history', icon: <BookIcon />, label: 'History' },
  { mode: 'analytics', icon: <ChartIcon />, label: 'Analytics' },
  { mode: 'prompts', icon: <LightbulbIcon />, label: 'Prompts' },
];

export default function JournalSidebar({
  viewMode,
  onViewChange,
  streak,
  currentMood,
}: JournalSidebarProps) {
  const getMoodEmoji = (mood: number): string => {
    const emojis: Record<number, string> = {
      1: '😢', 2: '😞', 3: '😔', 4: '😕', 5: '😐',
      6: '🙂', 7: '😊', 8: '😄', 9: '😁', 10: '🤩',
    };
    return emojis[Math.max(1, Math.min(10, Math.round(mood)))] || '😐';
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      height: 'fit-content',
      position: 'sticky',
      top: '100px',
    }}>
      {/* Streak Display */}
      <div style={{
        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        borderRadius: '16px',
        padding: '16px',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'center' }}><FlameIcon color="#92400E" size={32} /></div>
        <div style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#92400E',
        }}>
          {streak?.currentStreak || 0}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#B45309',
          fontWeight: '500',
        }}>
          Day Streak
        </div>
        {streak && streak.longestStreak > 0 && (
          <div style={{
            fontSize: '11px',
            color: '#D97706',
            marginTop: '4px',
          }}>
            Best: {streak.longestStreak} days
          </div>
        )}
      </div>

      {/* Current Mood */}
      {currentMood && (
        <div style={{
          background: '#F5F3FF',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '24px' }}>{getMoodEmoji(currentMood)}</span>
          <div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Current Mood</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#7C3AED' }}>
              {currentMood}/10
            </div>
          </div>
        </div>
      )}

      {/* Journaling Modes */}
      <div>
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px',
        }}>
          Journal Mode
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {VIEW_ITEMS.map((item) => (
            <button
              key={item.mode}
              onClick={() => onViewChange(item.mode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: viewMode === item.mode
                  ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
                  : 'transparent',
                color: viewMode === item.mode ? 'white' : '#4B5563',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: viewMode === item.mode ? '600' : '500',
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{
        height: '1px',
        background: '#E5E7EB',
      }} />

      {/* Navigation */}
      <div>
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px',
        }}>
          Browse
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAVIGATION_ITEMS.map((item) => (
            <button
              key={item.mode}
              onClick={() => onViewChange(item.mode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: viewMode === item.mode
                  ? '#F3F4F6'
                  : 'transparent',
                color: viewMode === item.mode ? '#7C3AED' : '#4B5563',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: viewMode === item.mode ? '600' : '500',
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      {streak && (
        <div style={{
          background: '#F9FAFB',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#6B7280',
            marginBottom: '12px',
          }}>
            Your Journey
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#7C3AED' }}>
                {streak.totalEntries}
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Entries</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#EC4899' }}>
                {streak.currentStreak}
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Streak</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#10B981' }}>
                {streak.longestStreak}
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Best</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
