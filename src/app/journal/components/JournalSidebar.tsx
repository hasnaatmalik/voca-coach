'use client';

import { ViewMode, JournalStreak } from '../types';

interface JournalSidebarProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  streak: JournalStreak | null;
  currentMood?: number | null;
}

const VIEW_ITEMS: Array<{ mode: ViewMode; icon: string; label: string }> = [
  { mode: 'chat', icon: '💬', label: 'Chat' },
  { mode: 'write', icon: '✏️', label: 'Write' },
  { mode: 'gratitude', icon: '🙏', label: 'Gratitude' },
  { mode: 'cbt', icon: '🧠', label: 'CBT Exercise' },
  { mode: 'voice', icon: '🎙️', label: 'Voice' },
];

const NAVIGATION_ITEMS: Array<{ mode: ViewMode; icon: string; label: string }> = [
  { mode: 'history', icon: '📚', label: 'History' },
  { mode: 'analytics', icon: '📊', label: 'Analytics' },
  { mode: 'prompts', icon: '💡', label: 'Prompts' },
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
        <div style={{ fontSize: '32px', marginBottom: '4px' }}>🔥</div>
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
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
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
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
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
