'use client';

import { useState, useEffect, useCallback } from 'react';
import { JournalEntry as JournalEntryType, Pagination } from '../types';
import JournalEntry from './JournalEntry';

// Theme colors
const themeColors = {
  primary: '#D9A299',
  primaryDark: '#C08B82',
  secondary: '#DCC5B2',
  border: '#DCC5B2',
  text: '#2D2D2D',
  textMuted: '#6B6B6B',
  cream: '#FAF7F3',
  beige: '#F0E4D3',
};

// SVG Icon Components
const BookIcon = ({ color = themeColors.primaryDark, size = 48 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M8 7h8M8 11h6" />
  </svg>
);

const ListIcon = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const CalendarIcon = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const SearchIcon = ({ color = themeColors.textMuted, size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

interface JournalHistoryProps {
  onEntrySelect?: (entry: JournalEntryType) => void;
}

export default function JournalHistory({ onEntrySelect }: JournalHistoryProps) {
  const [entries, setEntries] = useState<JournalEntryType[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [moodFilter, setMoodFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const fetchEntries = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (search) params.set('search', search);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      if (moodFilter) {
        const [min, max] = moodFilter.split('-');
        params.set('moodMin', min);
        params.set('moodMax', max);
      }

      const res = await fetch(`/api/journal?${params}`);
      const data = await res.json();

      if (page === 1) {
        setEntries(data.entries || []);
      } else {
        setEntries((prev) => [...prev, ...(data.entries || [])]);
      }
      setPagination(data.pagination);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, dateFrom, dateTo, moodFilter]);

  useEffect(() => {
    fetchEntries(1);
  }, [fetchEntries]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/journal?id=${id}`, { method: 'DELETE' });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleLoadMore = () => {
    if (pagination?.hasMore) {
      fetchEntries(pagination.page + 1);
    }
  };

  const groupByDate = (entries: JournalEntryType[]) => {
    const groups: Record<string, JournalEntryType[]> = {};
    entries.forEach((entry) => {
      const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    });
    return groups;
  };

  const groupedEntries = groupByDate(entries);

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 4px 16px rgba(217, 162, 153, 0.12)',
      border: `1px solid ${themeColors.border}`,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: `1px solid ${themeColors.border}`,
        background: `linear-gradient(135deg, ${themeColors.primary}15 0%, ${themeColors.secondary}20 100%)`,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: themeColors.text, margin: 0 }}>
              Journal History
            </h2>
            <p style={{ fontSize: '13px', color: themeColors.textMuted, margin: '4px 0 0' }}>
              {pagination?.total || 0} entries
            </p>
          </div>

          {/* View Toggle */}
          <div style={{
            display: 'flex',
            background: themeColors.beige,
            borderRadius: '8px',
            padding: '4px',
          }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 12px',
                background: viewMode === 'list' ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                color: viewMode === 'list' ? themeColors.primaryDark : themeColors.textMuted,
                cursor: 'pointer',
                fontWeight: viewMode === 'list' ? '600' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ListIcon color={viewMode === 'list' ? themeColors.primaryDark : themeColors.textMuted} size={14} />
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                padding: '6px 12px',
                background: viewMode === 'calendar' ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                color: viewMode === 'calendar' ? themeColors.primaryDark : themeColors.textMuted,
                cursor: 'pointer',
                fontWeight: viewMode === 'calendar' ? '600' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CalendarIcon color={viewMode === 'calendar' ? themeColors.primaryDark : themeColors.textMuted} size={14} />
              Calendar
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}>
              <SearchIcon />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entries..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                color: themeColors.text,
                background: 'white',
              }}
            />
          </div>

          {/* Date From */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              padding: '10px 14px',
              border: `1px solid ${themeColors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              color: themeColors.text,
              background: 'white',
            }}
          />

          {/* Date To */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{
              padding: '10px 14px',
              border: `1px solid ${themeColors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              color: themeColors.text,
              background: 'white',
            }}
          />

          {/* Mood Filter */}
          <select
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              border: `1px solid ${themeColors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              background: 'white',
              color: themeColors.text,
              cursor: 'pointer',
            }}
          >
            <option value="">All Moods</option>
            <option value="1-3">Low (1-3)</option>
            <option value="4-6">Medium (4-6)</option>
            <option value="7-10">High (7-10)</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '24px',
        maxHeight: 'calc(100vh - 400px)',
        overflowY: 'auto',
      }}>
        {isLoading && entries.length === 0 ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '48px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${themeColors.border}`,
              borderTop: `3px solid ${themeColors.primaryDark}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        ) : entries.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            color: themeColors.textMuted,
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: `${themeColors.primary}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <BookIcon />
            </div>
            <p style={{ color: themeColors.text, fontWeight: '500', margin: '0 0 8px' }}>No entries found</p>
            <p style={{ fontSize: '14px', margin: 0 }}>Start journaling to see your history here</p>
          </div>
        ) : viewMode === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {Object.entries(groupedEntries).map(([date, dayEntries]) => (
              <div key={date}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: themeColors.primaryDark,
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: `1px solid ${themeColors.border}`,
                }}>
                  {date}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dayEntries.map((entry) => (
                    <JournalEntry
                      key={entry.id}
                      entry={entry}
                      onEdit={onEntrySelect}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Calendar View (simplified)
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: themeColors.primaryDark,
                  padding: '8px',
                  background: themeColors.cream,
                  borderRadius: '6px',
                }}
              >
                {day}
              </div>
            ))}
            {/* Calendar days would go here - simplified for now */}
          </div>
        )}

        {/* Load More */}
        {pagination?.hasMore && viewMode === 'list' && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '24px',
          }}>
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                background: themeColors.beige,
                border: `1px solid ${themeColors.border}`,
                borderRadius: '12px',
                fontSize: '14px',
                color: themeColors.text,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s ease',
              }}
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
