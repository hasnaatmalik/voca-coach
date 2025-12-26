'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import BentoCard from './BentoCard';
import type { DashboardRecommendation } from '@/types/dashboard';

interface AIInsightsCardProps {
  recommendations: DashboardRecommendation[];
  onDismiss?: (id: string) => void;
  onFeedback?: (id: string, helpful: boolean) => void;
}

const PRIORITY_COLORS = {
  high: '#D9A299',
  medium: '#E4B17A',
  low: '#7AAFC9',
};

// SVG Icon components
const TypeIcons = {
  technique: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D9A299" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  journal: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7AAFC9" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  session: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7AB89E" strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    </svg>
  ),
  insight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E4B17A" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
};

export default function AIInsightsCard({
  recommendations,
  onDismiss,
  onFeedback,
}: AIInsightsCardProps) {
  const [isTyping, setIsTyping] = useState(true);
  const [visibleRecommendations, setVisibleRecommendations] = useState<DashboardRecommendation[]>([]);

  useEffect(() => {
    // Show typing indicator briefly
    const typingTimer = setTimeout(() => {
      setIsTyping(false);
      setVisibleRecommendations(recommendations.slice(0, 3));
    }, 800);

    return () => clearTimeout(typingTimer);
  }, [recommendations]);

  const handleDismiss = (id: string) => {
    setVisibleRecommendations((prev) => prev.filter((r) => r.id !== id));
    onDismiss?.(id);
  };

  return (
    <BentoCard gridArea="insights">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '220px',
      }}>
        {/* Header with AI avatar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(217, 162, 153, 0.3)',
                '0 0 0 8px rgba(217, 162, 153, 0)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D9A299 0%, #E4B17A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="3" />
              <line x1="12" y1="8" x2="12" y2="11" />
              <circle cx="8" cy="16" r="1" fill="white" />
              <circle cx="16" cy="16" r="1" fill="white" />
            </svg>
          </motion.div>
          <div>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#2D2D2D',
            }}>
              AI Insights
            </h3>
            <span style={{
              fontSize: '11px',
              color: '#9B9B9B',
            }}>
              Based on your recent sessions
            </span>
          </div>
        </div>

        {/* Typing indicator or insights */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          overflowY: 'auto',
        }}>
          <AnimatePresence mode="popLayout">
            {isTyping ? (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '12px',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6,
                      delay: i * 0.1,
                    }}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#D9A299',
                    }}
                  />
                ))}
              </motion.div>
            ) : visibleRecommendations.length > 0 ? (
              visibleRecommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    position: 'relative',
                    padding: '14px',
                    background: `linear-gradient(135deg, ${PRIORITY_COLORS[rec.priority]}10 0%, transparent 100%)`,
                    borderRadius: '12px',
                    border: `1px solid ${PRIORITY_COLORS[rec.priority]}30`,
                  }}
                >
                  {/* Dismiss button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDismiss(rec.id)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: '#9B9B9B',
                    }}
                  >
                    ×
                  </motion.button>

                  {/* Icon and title */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px',
                  }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: `${PRIORITY_COLORS[rec.priority]}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {TypeIcons[rec.type]}
                    </span>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#2D2D2D',
                    }}>
                      {rec.title}
                    </span>
                  </div>

                  {/* Message */}
                  <p style={{
                    fontSize: '12px',
                    color: '#6B6B6B',
                    lineHeight: 1.4,
                    marginBottom: '10px',
                  }}>
                    {rec.message}
                  </p>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    {rec.action && (
                      <Link
                        href={rec.action.href}
                        style={{
                          fontSize: '12px',
                          color: PRIORITY_COLORS[rec.priority],
                          textDecoration: 'none',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {rec.action.label} →
                      </Link>
                    )}

                    {/* Feedback buttons */}
                    <div style={{
                      display: 'flex',
                      gap: '6px',
                    }}>
                      <motion.button
                        whileHover={{ scale: 1.1, background: 'rgba(122, 184, 158, 0.15)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onFeedback?.(rec.id, true)}
                        style={{
                          width: '28px',
                          height: '28px',
                          border: 'none',
                          borderRadius: '8px',
                          background: 'rgba(122, 184, 158, 0.08)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7AB89E" strokeWidth="2">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                        </svg>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1, background: 'rgba(217, 162, 153, 0.15)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onFeedback?.(rec.id, false)}
                        style={{
                          width: '28px',
                          height: '28px',
                          border: 'none',
                          borderRadius: '8px',
                          background: 'rgba(217, 162, 153, 0.08)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D9A299" strokeWidth="2">
                          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  color: '#9B9B9B',
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'rgba(228, 177, 122, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E4B17A" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                </div>
                <p style={{ fontSize: '13px', textAlign: 'center' }}>
                  Complete a few sessions to get personalized insights
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BentoCard>
  );
}
