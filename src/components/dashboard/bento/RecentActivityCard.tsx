'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import BentoCard from './BentoCard';
import type { ActivityItem } from '@/types/dashboard';

interface RecentActivityCardProps {
  activities: ActivityItem[];
  onViewAll?: () => void;
}

type FilterType = 'all' | 'session' | 'journal' | 'achievement';

// SVG icons for activity types
const ActivityIcons = {
  session: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D9A299" strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    </svg>
  ),
  journal: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7AAFC9" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7AB89E" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  achievement: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E4B17A" strokeWidth="2">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  biomarker: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D9A299" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  therapy: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7AB89E" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
};

const TYPE_CONFIG: Record<string, { color: string; bg: string }> = {
  session: { color: '#D9A299', bg: 'rgba(217, 162, 153, 0.1)' },
  journal: { color: '#7AAFC9', bg: 'rgba(122, 175, 201, 0.1)' },
  chat: { color: '#7AB89E', bg: 'rgba(122, 184, 158, 0.1)' },
  achievement: { color: '#E4B17A', bg: 'rgba(228, 177, 122, 0.1)' },
  biomarker: { color: '#D9A299', bg: 'rgba(217, 162, 153, 0.1)' },
  therapy: { color: '#7AB89E', bg: 'rgba(122, 184, 158, 0.1)' },
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function RecentActivityCard({
  activities,
  onViewAll,
}: RecentActivityCardProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredActivities = activities.filter((activity) => {
    if (filter === 'all') return true;
    return activity.type === filter;
  }).slice(0, 6);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'session', label: 'Sessions' },
    { key: 'journal', label: 'Journal' },
    { key: 'achievement', label: 'Achievements' },
  ];

  return (
    <BentoCard gridArea="activity">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '160px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#2D2D2D',
          }}>
            Recent Activity
          </h3>

          {/* Filter tabs */}
          <div style={{
            display: 'flex',
            gap: '6px',
            background: '#FAF7F3',
            padding: '4px',
            borderRadius: '12px',
          }}>
            {filters.map((f) => (
              <motion.button
                key={f.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  background: filter === f.key ? 'white' : 'transparent',
                  color: filter === f.key ? '#2D2D2D' : '#9B9B9B',
                  boxShadow: filter === f.key ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {f.label}
              </motion.button>
            ))}
          </div>

          <Link
            href="/dashboard/history"
            onClick={onViewAll}
            style={{
              fontSize: '13px',
              color: '#D9A299',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            View All History
          </Link>
        </div>

        {/* Activity timeline */}
        <div style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '8px',
          flex: 1,
        }}>
          <AnimatePresence mode="popLayout">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => {
                const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.session;

                return (
                  <motion.div
                    key={activity.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                    style={{
                      flex: '0 0 auto',
                      width: '180px',
                      padding: '16px',
                      background: 'white',
                      borderRadius: '14px',
                      border: '1px solid #F0E4D3',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {/* Timeline connector dot */}
                    {index < filteredActivities.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        right: '-12px',
                        top: '50%',
                        width: '8px',
                        height: '1px',
                        background: '#DCC5B2',
                        borderStyle: 'dotted',
                      }} />
                    )}

                    {/* Icon */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: config.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                    }}>
                      {ActivityIcons[activity.type as keyof typeof ActivityIcons] || ActivityIcons.session}
                    </div>

                    {/* Title */}
                    <p style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#2D2D2D',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {activity.title}
                    </p>

                    {/* Description */}
                    <p style={{
                      fontSize: '11px',
                      color: '#9B9B9B',
                      marginBottom: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.4,
                    }}>
                      {activity.description}
                    </p>

                    {/* Timestamp */}
                    <span style={{
                      fontSize: '10px',
                      color: config.color,
                      fontWeight: '500',
                    }}>
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9B9B9B',
                  fontSize: '14px',
                }}
              >
                No recent activity
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BentoCard>
  );
}
