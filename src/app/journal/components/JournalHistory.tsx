'use client';

import { useState, useEffect, useCallback } from 'react';
import { JournalEntry as JournalEntryType, Pagination } from '../types';
import JournalEntry from './JournalEntry';

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
      boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
              Journal History
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0' }}>
              {pagination?.total || 0} entries
            </p>
          </div>

          {/* View Toggle */}
          <div style={{
            display: 'flex',
            background: '#F3F4F6',
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
                color: viewMode === 'list' ? '#7C3AED' : '#6B7280',
                cursor: 'pointer',
                fontWeight: viewMode === 'list' ? '600' : '400',
              }}
            >
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
                color: viewMode === 'calendar' ? '#7C3AED' : '#6B7280',
                cursor: 'pointer',
                fontWeight: viewMode === 'calendar' ? '600' : '400',
              }}
            >
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
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries..."
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '10px 14px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
            }}
          />

          {/* Date From */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              padding: '10px 14px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
            }}
          />

          {/* Date To */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{
              padding: '10px 14px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
            }}
          />

          {/* Mood Filter */}
          <select
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              background: 'white',
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
              border: '3px solid #E5E7EB',
              borderTop: '3px solid #7C3AED',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        ) : entries.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            color: '#6B7280',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📔</div>
            <p>No entries found</p>
            <p style={{ fontSize: '14px' }}>Start journaling to see your history here</p>
          </div>
        ) : viewMode === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {Object.entries(groupedEntries).map(([date, dayEntries]) => (
              <div key={date}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6B7280',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #F3F4F6',
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
                  color: '#6B7280',
                  padding: '8px',
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
                background: '#F3F4F6',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#4B5563',
                cursor: 'pointer',
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
