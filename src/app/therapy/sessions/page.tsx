'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

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

export default function UserTherapySessions() {
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
    
    // Show success message if just booked
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

  const upcomingSessions = sessions.filter(s => 
    new Date(s.scheduledAt) > new Date() && s.status === 'scheduled'
  );
  const pastSessions = sessions.filter(s => 
    new Date(s.scheduledAt) <= new Date() || s.status !== 'scheduled'
  );

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric'
      }),
    };
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'scheduled': return { bg: '#ECFDF5', color: '#059669' };
      case 'completed': return { bg: '#EFF6FF', color: '#2563EB' };
      case 'cancelled': return { bg: '#FEF2F2', color: '#DC2626' };
      default: return { bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh' }}>
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
      
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Success Message */}
        {showBookedMessage && (
          <div style={{
            padding: '16px 20px',
            background: '#ECFDF5',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid #A7F3D0'
          }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            <span style={{ color: '#059669', fontWeight: '500' }}>Session booked successfully!</span>
          </div>
        )}

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
              My Sessions
            </h1>
            <p style={{ color: '#9CA3AF', fontSize: '15px' }}>
              {upcomingSessions.length} upcoming · {pastSessions.length} past
            </p>
          </div>
          <Link
            href="/therapy/book"
            style={{
              padding: '12px 24px',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            + Book Session
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #E5E7EB',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              margin: '0 auto',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        ) : (
          <>
            {/* Upcoming Sessions */}
            {upcomingSessions.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '16px'
                }}>
                  Upcoming
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {upcomingSessions.map((session) => {
                    const dateInfo = formatDate(session.scheduledAt);
                    
                    return (
                      <div
                        key={session.id}
                        style={{
                          background: 'white',
                          borderRadius: '14px',
                          padding: '20px',
                          border: '1px solid #E5E7EB',
                          display: 'flex',
                          gap: '20px',
                          alignItems: 'center',
                        }}
                      >
                        {/* Date */}
                        <div style={{
                          width: '60px',
                          height: '68px',
                          borderRadius: '12px',
                          background: 'var(--primary)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          flexShrink: 0,
                        }}>
                          <span style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase' }}>
                            {dateInfo.month}
                          </span>
                          <span style={{ fontSize: '24px', fontWeight: '700', lineHeight: 1 }}>
                            {dateInfo.day}
                          </span>
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>
                            {session.therapist.name}
                          </h3>
                          <p style={{ fontSize: '14px', color: '#6B7280' }}>
                            {dateInfo.weekday} at {dateInfo.time} · {session.duration} min
                          </p>
                          {session.userNote && (
                            <p style={{
                              fontSize: '13px',
                              color: '#9CA3AF',
                              marginTop: '8px',
                              fontStyle: 'italic'
                            }}>
                              &quot;{session.userNote}&quot;
                            </p>
                          )}
                        </div>

                        {/* Cancel */}
                        <button
                          onClick={() => cancelSession(session.id)}
                          style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            color: '#9CA3AF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontWeight: '500',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {upcomingSessions.length === 0 && pastSessions.length === 0 && (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '60px 40px',
                textAlign: 'center',
                border: '1px solid #E5E7EB',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>
                  No sessions yet
                </h3>
                <p style={{ color: '#6B7280', marginBottom: '24px' }}>
                  Book your first free session with a therapist
                </p>
                <Link
                  href="/therapy/book"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: '600',
                  }}
                >
                  Browse Therapists
                </Link>
              </div>
            )}

            {/* Past Sessions */}
            {pastSessions.length > 0 && (
              <div>
                <h2 style={{ 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '16px'
                }}>
                  Past Sessions
                </h2>
                
                <div style={{
                  background: 'white',
                  borderRadius: '14px',
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                }}>
                  {pastSessions.map((session, index) => {
                    const dateInfo = formatDate(session.scheduledAt);
                    const statusStyle = getStatusStyle(session.status);
                    
                    return (
                      <div
                        key={session.id}
                        style={{
                          padding: '16px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          borderBottom: index < pastSessions.length - 1 ? '1px solid #F3F4F6' : 'none',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: '500', color: '#1F2937', marginBottom: '2px', fontSize: '15px' }}>
                            {session.therapist.name}
                          </p>
                          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
                            {dateInfo.full}
                          </p>
                        </div>
                        
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          textTransform: 'capitalize',
                        }}>
                          {session.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
