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

interface ClientInsight {
  clientId: string;
  clientName: string;
  sessionsCount: number;
  nextSession: string | null;
  preSessionNotes: string | null;
  moodTrend: 'improving' | 'stable' | 'declining' | 'unknown';
  aiSummary: string;
  alerts: string[];
}

interface PreSessionNote {
  sessionId: string;
  clientName: string;
  scheduledAt: string;
  moodRating: number;
  concerns: string;
  goals: string;
}

interface CrisisAlert {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  data: string;
}

export default function TherapistDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [clientInsights, setClientInsights] = useState<ClientInsight[]>([]);
  const [preSessionNotes, setPreSessionNotes] = useState<PreSessionNote[]>([]);
  const [crisisAlerts, setCrisisAlerts] = useState<CrisisAlert[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  useEffect(() => {
    fetchSessions();
    fetchOnlineStatus();
    fetchUnreadCount();
    fetchAIInsights();
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

  const fetchAIInsights = async () => {
    try {
      const res = await fetch('/api/therapist/insights');
      if (res.ok) {
        const data = await res.json();
        setClientInsights(data.insights || []);
        setPreSessionNotes(data.upcomingWithNotes || []);
        setCrisisAlerts(data.crisisAlerts || []);
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const dismissCrisisAlert = async (alertId: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: alertId }),
      });
      setCrisisAlerts(crisisAlerts.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  const getMoodTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  const getMoodTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#10B981';
      case 'declining': return '#EF4444';
      case 'stable': return '#6B7280';
      default: return '#9CA3AF';
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

            <Link href="/therapist/availability" style={{ textDecoration: 'none' }}>
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
                    background: 'linear-gradient(135deg, #14B8A6 0%, #2DD4BF 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}>
                    🗓️
                  </div>
                  <div>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>Availability</p>
                    <p style={{ color: '#6B7280', fontSize: '14px' }}>Set your hours</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Crisis Alerts */}
          {crisisAlerts.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '24px',
              color: 'white',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '24px' }}>🚨</span>
                <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Crisis Alerts</h2>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {crisisAlerts.map(alert => (
                  <div key={alert.id} style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    padding: '16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontWeight: '600', marginBottom: '4px' }}>{alert.title}</p>
                        <p style={{ fontSize: '14px', opacity: 0.9 }}>{alert.message}</p>
                        <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => dismissCrisisAlert(alert.id)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pre-Session Notes from Clients */}
          {preSessionNotes.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '28px',
              marginBottom: '24px',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '24px' }}>📝</span>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937' }}>
                  Client Pre-Session Notes
                </h2>
              </div>
              <div style={{ display: 'grid', gap: '16px' }}>
                {preSessionNotes.map(note => (
                  <div key={note.sessionId} style={{
                    background: 'rgba(124, 58, 237, 0.05)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(124, 58, 237, 0.1)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <p style={{ fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>{note.clientName}</p>
                        <p style={{ fontSize: '13px', color: '#6B7280' }}>
                          Session: {new Date(note.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        background: note.moodRating >= 7 ? '#ECFDF5' : note.moodRating >= 4 ? '#FFFBEB' : '#FEF2F2',
                        color: note.moodRating >= 7 ? '#059669' : note.moodRating >= 4 ? '#D97706' : '#DC2626',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}>
                        Mood: {note.moodRating}/10
                      </div>
                    </div>
                    {note.concerns && (
                      <div style={{ marginBottom: '8px' }}>
                        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Concerns:</p>
                        <p style={{ fontSize: '14px', color: '#4B5563', fontStyle: 'italic' }}>"{note.concerns}"</p>
                      </div>
                    )}
                    {note.goals && (
                      <div>
                        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Goals for session:</p>
                        <p style={{ fontSize: '14px', color: '#4B5563' }}>{note.goals}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* AI Client Insights */}
          {clientInsights.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '28px',
              marginTop: '24px',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '24px' }}>🤖</span>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937' }}>
                  AI Client Briefings
                </h2>
                <span style={{
                  padding: '4px 10px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                }}>
                  BETA
                </span>
              </div>
              <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>
                AI-powered insights for your upcoming client sessions
              </p>
              <div style={{ display: 'grid', gap: '16px' }}>
                {clientInsights.map(insight => (
                  <div key={insight.clientId} style={{
                    background: 'rgba(124, 58, 237, 0.03)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid rgba(124, 58, 237, 0.08)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <p style={{ fontWeight: '700', color: '#1F2937', fontSize: '16px', marginBottom: '4px' }}>
                          {insight.clientName}
                        </p>
                        <p style={{ fontSize: '13px', color: '#6B7280' }}>
                          {insight.sessionsCount} previous sessions
                          {insight.nextSession && ` • Next: ${new Date(insight.nextSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: getMoodTrendColor(insight.moodTrend) + '15',
                        borderRadius: '8px',
                      }}>
                        <span>{getMoodTrendIcon(insight.moodTrend)}</span>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: getMoodTrendColor(insight.moodTrend),
                          textTransform: 'capitalize',
                        }}>
                          {insight.moodTrend}
                        </span>
                      </div>
                    </div>

                    {/* AI Summary */}
                    <div style={{
                      background: 'white',
                      borderRadius: '10px',
                      padding: '14px',
                      marginBottom: '12px',
                      border: '1px solid #E5E7EB',
                    }}>
                      <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.6' }}>
                        {insight.aiSummary}
                      </p>
                    </div>

                    {/* Alerts */}
                    {insight.alerts.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                        {insight.alerts.map((alert, i) => (
                          <span key={i} style={{
                            padding: '4px 10px',
                            background: '#FEF2F2',
                            color: '#DC2626',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                          }}>
                            ⚠️ {alert}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading state for insights */}
          {loadingInsights && clientInsights.length === 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              padding: '40px',
              marginTop: '24px',
              textAlign: 'center',
              color: '#6B7280',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤖</div>
              Loading AI insights...
            </div>
          )}
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
