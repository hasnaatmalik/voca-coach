'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import BentoCard from './BentoCard';
import type { UpcomingSession } from '@/types/dashboard';

interface UpcomingSessionsCardProps {
  sessions: UpcomingSession[];
  onJoinSession?: (sessionId: string) => void;
}

function formatTimeUntil(dateString: string): string {
  const now = new Date();
  const sessionDate = new Date(dateString);
  const diffMs = sessionDate.getTime() - now.getTime();

  if (diffMs < 0) return 'Starting now';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `in ${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `in ${hours}h ${minutes}m`;
  }
  return `in ${minutes}m`;
}

function formatSessionTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function UpcomingSessionsCard({
  sessions,
  onJoinSession,
}: UpcomingSessionsCardProps) {
  const [countdown, setCountdown] = useState<string>('');
  const displaySessions = sessions.slice(0, 3);
  const nextSession = displaySessions[0];

  useEffect(() => {
    if (!nextSession) return;

    const updateCountdown = () => {
      setCountdown(formatTimeUntil(nextSession.scheduledAt));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [nextSession]);

  const isStartingSoon = (dateString: string) => {
    const now = new Date();
    const sessionDate = new Date(dateString);
    const diffMs = sessionDate.getTime() - now.getTime();
    return diffMs < 15 * 60 * 1000 && diffMs > 0; // Within 15 minutes
  };

  return (
    <BentoCard gridArea="sessions">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '220px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#2D2D2D',
          }}>
            Upcoming Sessions
          </h3>
          <Link
            href="/chat"
            style={{
              fontSize: '13px',
              color: '#D9A299',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            View All
          </Link>
        </div>

        {/* Sessions list */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <AnimatePresence mode="popLayout">
            {displaySessions.length > 0 ? (
              displaySessions.map((session, index) => {
                const isFirst = index === 0;
                const startingSoon = isStartingSoon(session.scheduledAt);

                return (
                  <motion.div
                    key={session.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 4 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      background: isFirst ? 'linear-gradient(135deg, rgba(217, 162, 153, 0.08) 0%, rgba(217, 162, 153, 0.02) 100%)' : '#FAF7F3',
                      borderRadius: '12px',
                      border: isFirst ? '1px solid rgba(217, 162, 153, 0.3)' : '1px solid #F0E4D3',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Time block */}
                    <div style={{
                      padding: '8px 12px',
                      background: isFirst ? '#D9A299' : '#F0E4D3',
                      borderRadius: '8px',
                      minWidth: '70px',
                      textAlign: 'center',
                    }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: isFirst ? 'white' : '#6B6B6B',
                      }}>
                        {formatSessionTime(session.scheduledAt)}
                      </span>
                    </div>

                    {/* Session info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#2D2D2D',
                        marginBottom: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {session.therapistName || 'Practice Session'}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#9B9B9B',
                      }}>
                        {isFirst ? countdown : formatTimeUntil(session.scheduledAt)}
                      </p>
                    </div>

                    {/* Join button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onJoinSession?.(session.id)}
                      animate={startingSoon ? {
                        boxShadow: [
                          '0 0 0 0 rgba(217, 162, 153, 0.4)',
                          '0 0 0 8px rgba(217, 162, 153, 0)',
                        ],
                      } : {}}
                      transition={startingSoon ? { repeat: Infinity, duration: 1.5 } : {}}
                      style={{
                        padding: '8px 16px',
                        background: startingSoon ? '#D9A299' : 'white',
                        color: startingSoon ? 'white' : '#D9A299',
                        border: startingSoon ? 'none' : '1px solid #D9A299',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Join
                    </motion.button>
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
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                }}
              >
                {/* Calendar icon */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, rgba(217, 162, 153, 0.15) 0%, rgba(228, 177, 122, 0.15) 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D9A299" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#9B9B9B',
                  textAlign: 'center',
                }}>
                  No upcoming sessions
                </p>
                <Link href="/chat">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: '10px 20px',
                      background: '#D9A299',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Book a Session
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BentoCard>
  );
}
