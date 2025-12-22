'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
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
      hourlyRate: number | null;
    } | null;
  };
}

export default function UserTherapySessions() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchSessions();
  }, [user, router]);

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
        alert('Session cancelled');
      }
    } catch (error) {
      console.error('Failed to cancel session:', error);
      alert('Failed to cancel session');
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
        day: 'numeric',
        year: 'numeric'
      }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', text: '📅 Scheduled' };
      case 'completed': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563EB', text: '✅ Completed' };
      case 'cancelled': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#DC2626', text: '❌ Cancelled' };
      default: return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6B7280', text: status };
    }
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F5F3FF 0%, #FDF8F3 100%)' }}>
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
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
              My Sessions 📅
            </h1>
            <p style={{ color: '#6B7280' }}>Manage your therapy appointments</p>
          </div>
          <Link
            href="/therapy/book"
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
              color: 'white',
              borderRadius: '14px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '15px',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)',
              transition: 'all 0.3s ease',
            }}
          >
            ➕ Book New Session
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '3px solid #E5E7EB',
              borderTopColor: '#7C3AED',
              borderRadius: '50%',
              margin: '0 auto',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        ) : (
          <>
            {/* Upcoming Sessions */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  🗓️
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1F2937' }}>
                    Upcoming Sessions
                  </h2>
                  <p style={{ fontSize: '14px', color: '#6B7280' }}>
                    {upcomingSessions.length} session{upcomingSessions.length !== 1 ? 's' : ''} scheduled
                  </p>
                </div>
              </div>

              {upcomingSessions.length === 0 ? (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '48px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>
                    No upcoming sessions
                  </h3>
                  <p style={{ color: '#6B7280', marginBottom: '20px' }}>
                    Book a session with a therapist to get started
                  </p>
                  <Link
                    href="/therapy/book"
                    style={{
                      display: 'inline-block',
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                      color: 'white',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      fontWeight: '600',
                    }}
                  >
                    Browse Therapists
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {upcomingSessions.map((session) => {
                    const dateInfo = formatDate(session.scheduledAt);
                    const statusInfo = getStatusColor(session.status);
                    
                    return (
                      <div
                        key={session.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '20px',
                          padding: '24px',
                          border: '1px solid rgba(255, 255, 255, 0.5)',
                          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)',
                          display: 'flex',
                          gap: '24px',
                          alignItems: 'center',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                      >
                        {/* Date Card */}
                        <div style={{
                          width: '80px',
                          height: '90px',
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          flexShrink: 0,
                        }}>
                          <span style={{ fontSize: '12px', opacity: 0.9, textTransform: 'uppercase' }}>
                            {dateInfo.month}
                          </span>
                          <span style={{ fontSize: '32px', fontWeight: '700', lineHeight: 1 }}>
                            {dateInfo.day}
                          </span>
                          <span style={{ fontSize: '12px', opacity: 0.9 }}>
                            {dateInfo.weekday}
                          </span>
                        </div>

                        {/* Session Details */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>
                              Session with {session.therapist.name}
                            </h3>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: statusInfo.bg,
                              color: statusInfo.color,
                            }}>
                              {statusInfo.text}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#6B7280', fontSize: '14px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              ⏰ {dateInfo.time}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              ⏱️ {session.duration} minutes
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              📧 {session.therapist.email}
                            </span>
                          </div>

                          {session.userNote && (
                            <p style={{
                              marginTop: '12px',
                              padding: '10px 14px',
                              background: 'rgba(124, 58, 237, 0.05)',
                              borderRadius: '10px',
                              fontSize: '13px',
                              color: '#6B7280',
                              fontStyle: 'italic',
                            }}>
                              "{session.userNote}"
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            onClick={() => cancelSession(session.id)}
                            style={{
                              padding: '10px 20px',
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#DC2626',
                              border: 'none',
                              borderRadius: '10px',
                              fontWeight: '600',
                              fontSize: '13px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Sessions */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  📜
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1F2937' }}>
                    Past Sessions
                  </h2>
                  <p style={{ fontSize: '14px', color: '#6B7280' }}>
                    Your session history
                  </p>
                </div>
              </div>

              {pastSessions.length === 0 ? (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '48px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌟</div>
                  <p style={{ color: '#6B7280' }}>No past sessions yet</p>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)',
                  overflow: 'hidden',
                }}>
                  {pastSessions.map((session, index) => {
                    const dateInfo = formatDate(session.scheduledAt);
                    const statusInfo = getStatusColor(session.status);
                    
                    return (
                      <div
                        key={session.id}
                        style={{
                          padding: '20px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px',
                          borderBottom: index < pastSessions.length - 1 ? '1px solid #F3F4F6' : 'none',
                        }}
                      >
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '12px',
                          background: statusInfo.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          flexShrink: 0,
                        }}>
                          {session.status === 'completed' ? '✅' : session.status === 'cancelled' ? '❌' : '📅'}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>
                            Session with {session.therapist.name}
                          </p>
                          <p style={{ fontSize: '13px', color: '#6B7280' }}>
                            {dateInfo.full} at {dateInfo.time}
                          </p>
                        </div>
                        
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: statusInfo.bg,
                          color: statusInfo.color,
                          textTransform: 'capitalize',
                        }}>
                          {session.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
