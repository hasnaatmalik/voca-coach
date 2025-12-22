'use client';

import { useEffect, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface Session {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  notes: string | null;
  userNote: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function TherapistDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    fetchSessions();
    fetchOnlineStatus();
    fetchUnreadCount();
  }, []);

  const fetchOnlineStatus = async () => {
    try {
      const res = await fetch('/api/therapist/online');
      if (res.ok) {
        const data = await res.json();
        setIsOnline(data.isOnline);
      }
    } catch (error) {
      console.error('Failed to fetch online status:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setUnreadMessages(data.conversations?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const toggleOnlineStatus = async () => {
    setTogglingOnline(true);
    try {
      const res = await fetch('/api/therapist/online', {
        method: isOnline ? 'DELETE' : 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setIsOnline(data.isOnline);
      }
    } catch (error) {
      console.error('Failed to toggle online status:', error);
    } finally {
      setTogglingOnline(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/therapist/sessions');
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
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <RoleGuard requireTherapist>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F5F3FF 0%, #FDF8F3 100%)' }}>
        {user && (
          <Navbar
            isAuthenticated={true}
            userName={user.name}
            userEmail={user.email}
            onLogout={handleLogout}
            currentPage="/therapist"
            isAdmin={user.isAdmin}
            isSuperAdmin={user.isSuperAdmin}
            isTherapist={user.isTherapist}
          />
        )}
        
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
          {/* Header Section */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
                  Welcome back, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p style={{ color: '#6B7280', fontSize: '16px' }}>
                  Manage your therapy sessions and connect with students
                </p>
              </div>
              
              {/* Online Status Toggle */}
              <button
                onClick={toggleOnlineStatus}
                disabled={togglingOnline}
                style={{
                  padding: '16px 32px',
                  background: isOnline 
                    ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
                    : 'rgba(255, 255, 255, 0.9)',
                  border: isOnline ? 'none' : '2px solid #E5E7EB',
                  borderRadius: '16px',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: isOnline ? 'white' : '#6B7280',
                  cursor: togglingOnline ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: isOnline ? '0 8px 24px rgba(16, 185, 129, 0.4)' : '0 4px 16px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                }}
              >
                <span style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: isOnline ? 'white' : '#9CA3AF',
                  boxShadow: isOnline ? '0 0 12px white' : 'none',
                  animation: isOnline ? 'pulse 2s infinite' : 'none',
                }} />
                {togglingOnline ? 'Updating...' : (isOnline ? '🟢 Online - Accepting Clients' : 'Go Online')}
              </button>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}>
                  📅
                </div>
                <div>
                  <p style={{ fontSize: '32px', fontWeight: '700', color: '#1F2937' }}>{upcomingSessions.length}</p>
                  <p style={{ color: '#6B7280', fontSize: '14px' }}>Upcoming Sessions</p>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}>
                  ✅
                </div>
                <div>
                  <p style={{ fontSize: '32px', fontWeight: '700', color: '#1F2937' }}>{pastSessions.filter(s => s.status === 'completed').length}</p>
                  <p style={{ color: '#6B7280', fontSize: '14px' }}>Completed Sessions</p>
                </div>
              </div>
            </div>

            <Link href="/therapist/chat" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}>
                    💬
                  </div>
                  <div>
                    <p style={{ fontSize: '32px', fontWeight: '700', color: '#1F2937' }}>{unreadMessages}</p>
                    <p style={{ color: '#6B7280', fontSize: '14px' }}>Active Chats</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/therapist/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}>
                    👤
                  </div>
                  <div>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>Edit Profile</p>
                    <p style={{ color: '#6B7280', fontSize: '14px' }}>Update your info</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Two Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            {/* Upcoming Sessions */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937' }}>
                  📅 Upcoming Sessions
                </h2>
                <span style={{
                  padding: '6px 12px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                }}>
                  {upcomingSessions.length} pending
                </span>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                  Loading...
                </div>
              ) : upcomingSessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                  <p style={{ color: '#6B7280' }}>No upcoming sessions</p>
                  <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
                    Go online to start receiving bookings
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {upcomingSessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(124, 58, 237, 0.05)',
                        border: '1px solid rgba(124, 58, 237, 0.1)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <p style={{ fontWeight: '600', color: '#1F2937' }}>{session.user.name}</p>
                        <span style={{
                          padding: '4px 8px',
                          background: '#ECFDF5',
                          color: '#059669',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                        }}>
                          Scheduled
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#6B7280' }}>
                        {formatDate(session.scheduledAt)}
                      </p>
                      {session.userNote && (
                        <p style={{
                          fontSize: '12px',
                          color: '#9CA3AF',
                          marginTop: '8px',
                          fontStyle: 'italic',
                        }}>
                          "{session.userNote}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937' }}>
                  ✅ Recent Sessions
                </h2>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                  Loading...
                </div>
              ) : pastSessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌟</div>
                  <p style={{ color: '#6B7280' }}>No sessions yet</p>
                  <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
                    Your completed sessions will appear here
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {pastSessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: session.status === 'completed' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                        border: `1px solid ${session.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <p style={{ fontWeight: '600', color: '#1F2937' }}>{session.user.name}</p>
                        <span style={{
                          padding: '4px 8px',
                          background: session.status === 'completed' ? '#ECFDF5' : '#FEF2F2',
                          color: session.status === 'completed' ? '#059669' : '#DC2626',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          textTransform: 'capitalize',
                        }}>
                          {session.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#6B7280' }}>
                        {formatDate(session.scheduledAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <style jsx global>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
        `}</style>
      </div>
    </RoleGuard>
  );
}
