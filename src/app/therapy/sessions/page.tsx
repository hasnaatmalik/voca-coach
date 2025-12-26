'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import {
  SessionsHero,
  SessionCard,
  EmptyState,
  SuccessBanner,
} from '@/components/therapy/bento';

interface Session {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  notes: string | null;
  userNote: string | null;
  therapist: {
    id: string;
    name: string;
    email: string;
    therapistProfile: {
      bio: string | null;
      specializations: string | null;
    } | null;
  };
}

function SessionsContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookedMessage, setShowBookedMessage] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchSessions();

    if (searchParams.get('booked') === 'true') {
      setShowBookedMessage(true);
      setTimeout(() => setShowBookedMessage(false), 5000);
    }
  }, [user, router, searchParams]);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/therapy/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to cancel this session?')) return;

    try {
      const res = await fetch('/api/therapy/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, status: 'cancelled' }),
      });
      if (res.ok) {
        fetchSessions();
      }
    } catch (error) {
      console.error('Failed to cancel session:', error);
    }
  };

  const upcomingSessions = sessions.filter(
    (s) => new Date(s.scheduledAt) > new Date() && s.status === 'scheduled'
  );
  const pastSessions = sessions.filter(
    (s) => new Date(s.scheduledAt) <= new Date() || s.status !== 'scheduled'
  );

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F3' }}>
      <Navbar
        isAuthenticated={true}
        userName={user.name}
        userEmail={user.email}
        onLogout={handleLogout}
        currentPage="/therapy/sessions"
        isAdmin={user.isAdmin}
        isSuperAdmin={user.isSuperAdmin}
        isTherapist={user.isTherapist}
      />

      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {/* Success Message */}
        <SuccessBanner
          show={showBookedMessage}
          message="Session booked successfully!"
        />

        {/* Header */}
        <SessionsHero
          upcomingCount={upcomingSessions.length}
          pastCount={pastSessions.length}
        />

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 0' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid #F0E4D3',
                borderTop: '3px solid #7AB89E',
                borderRadius: '50%',
                margin: '0 auto',
              }}
            />
          </motion.div>
        ) : (
          <>
            {/* Upcoming Sessions */}
            {upcomingSessions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '40px' }}
              >
                <h2 style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#6B6B6B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '16px',
                }}>
                  Upcoming
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {upcomingSessions.map((session, index) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      variant="upcoming"
                      onCancel={() => cancelSession(session.id)}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {upcomingSessions.length === 0 && pastSessions.length === 0 && (
              <EmptyState
                icon="calendar"
                title="No sessions yet"
                description="Book your first free session with a therapist"
                actionText="Browse Therapists"
                actionHref="/therapy/book"
              />
            )}

            {/* Past Sessions */}
            {pastSessions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#6B6B6B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '16px',
                }}>
                  Past Sessions
                </h2>

                <motion.div
                  style={{
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    border: '1px solid #DCC5B2',
                    overflow: 'hidden',
                  }}
                >
                  {pastSessions.map((session, index) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      variant="past"
                      index={index}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function UserTherapySessions() {
  return (
    <Suspense
      fallback={
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAF7F3',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #F0E4D3',
            borderTop: '3px solid #7AB89E',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style jsx global>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      }
    >
      <SessionsContent />
    </Suspense>
  );
}
