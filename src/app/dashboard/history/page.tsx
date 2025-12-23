'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import type { HistoryItem, HistoryResponse } from '@/types/dashboard';

type FilterType = 'all' | 'sessions' | 'journal' | 'biomarkers' | 'achievements';
type DateRange = 'week' | 'month' | '3months' | 'all';

const FILTER_TABS: { value: FilterType; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '📊' },
  { value: 'sessions', label: 'Sessions', icon: '🎯' },
  { value: 'journal', label: 'Journal', icon: '📝' },
  { value: 'biomarkers', label: 'Biomarkers', icon: '🎤' },
  { value: 'achievements', label: 'Achievements', icon: '🏆' }
];

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: '3months', label: 'Last 3 months' },
  { value: 'all', label: 'All time' }
];

const TYPE_COLORS: Record<string, string> = {
  session: '#7C3AED',
  journal: '#EC4899',
  biomarker: '#06B6D4',
  achievement: '#F59E0B'
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [summary, setSummary] = useState({
    totalSessions: 0,
    totalJournalEntries: 0,
    totalBiomarkerReadings: 0,
    totalAchievements: 0
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeFilter, dateRange, page]);

  const fetchHistory = async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({
        type: activeFilter,
        dateRange,
        page: page.toString(),
        limit: '20'
      });

      const res = await fetch(`/api/dashboard/history?${params}`);
      if (res.ok) {
        const data: HistoryResponse = await res.json();
        if (page === 1) {
          setItems(data.items);
        } else {
          setItems(prev => [...prev, ...data.items]);
        }
        setHasMore(data.pagination.hasMore);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setPage(1);
    setItems([]);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setPage(1);
    setItems([]);
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #E5E7EB',
          borderTop: '4px solid #7C3AED',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Navbar
        isAuthenticated={true}
        userName={user.name || 'User'}
        userEmail={user.email}
        currentPage="/dashboard/history"
        isAdmin={user.isAdmin}
        isSuperAdmin={user.isSuperAdmin}
        isTherapist={user.isTherapist}
      />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 0',
              background: 'transparent',
              border: 'none',
              fontSize: '14px',
              color: '#6B7280',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
            Activity History
          </h1>
          <p style={{ color: '#6B7280' }}>
            View all your sessions, journal entries, and achievements
          </p>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {[
            { label: 'Sessions', value: summary.totalSessions, icon: '🎯', color: '#7C3AED' },
            { label: 'Journal Entries', value: summary.totalJournalEntries, icon: '📝', color: '#EC4899' },
            { label: 'Voice Analyses', value: summary.totalBiomarkerReadings, icon: '🎤', color: '#06B6D4' },
            { label: 'Achievements', value: summary.totalAchievements, icon: '🏆', color: '#F59E0B' }
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                border: '1px solid #E5E7EB'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Type Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            background: '#F3F4F6',
            padding: '4px',
            borderRadius: '12px'
          }}>
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleFilterChange(tab.value)}
                style={{
                  padding: '10px 16px',
                  background: activeFilter === tab.value ? 'white' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: activeFilter === tab.value ? '600' : '400',
                  color: activeFilter === tab.value ? '#7C3AED' : '#6B7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: activeFilter === tab.value ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Date Range Dropdown */}
          <select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value as DateRange)}
            style={{
              padding: '10px 16px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '14px',
              color: '#1F2937',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {DATE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* History List */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E5E7EB'
        }}>
          {loadingData && items.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #E5E7EB',
                borderTop: '3px solid #7C3AED',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} />
              <div style={{ color: '#6B7280' }}>Loading history...</div>
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6B7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                No items found
              </div>
              <div style={{ fontSize: '14px' }}>
                Try adjusting your filters or complete some activities
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      padding: '16px 20px',
                      background: '#F9FAFB',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F3F4F6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F9FAFB';
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: `${TYPE_COLORS[item.type] || '#6B7280'}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      flexShrink: 0
                    }}>
                      {item.type === 'session' ? '🎯' : null}
                      {item.type === 'journal' ? '📝' : null}
                      {item.type === 'biomarker' ? '🎤' : null}
                      {item.type === 'achievement' ? (String(item.metadata?.icon || '🏆')) : null}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '4px'
                      }}>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#1F2937'
                        }}>
                          {item.title}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#9CA3AF',
                          flexShrink: 0,
                          marginLeft: '12px'
                        }}>
                          {formatDate(item.date)}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#6B7280',
                        lineHeight: '1.5'
                      }}>
                        {item.description}
                      </div>
                      <div style={{
                        display: 'inline-block',
                        marginTop: '8px',
                        padding: '4px 10px',
                        background: `${TYPE_COLORS[item.type] || '#6B7280'}10`,
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: TYPE_COLORS[item.type] || '#6B7280',
                        textTransform: 'capitalize'
                      }}>
                        {item.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={loadingData}
                    style={{
                      padding: '12px 24px',
                      background: loadingData ? '#E5E7EB' : 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                      color: loadingData ? '#9CA3AF' : 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: loadingData ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loadingData ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
