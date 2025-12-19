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
        isTherapist={user.isTherapist}
      />
      
      <div style={{ minHeight: 'calc(100vh - 72px)', padding: '32px 24px' }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Therapy Sessions</h1>
          <p className="text-gray-600">View and manage your therapy appointments</p>
          <Link href="/therapy/book" className="font-medium mt-2 inline-block" style={{ color: 'var(--primary)' }}>
            Book New Session →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
          </div>
        ) : (
          <>
            {/* Upcoming Sessions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Sessions</h2>
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No upcoming sessions</p>
                  <Link
                    href="/therapy/book"
                    className="inline-block px-6 py-3 text-white rounded-xl font-semibold transition-colors"
                    style={{ background: 'var(--bg-gradient-purple)' }}
                  >
                    Book a Session
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-xl p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">
                            Session with {session.therapist.name}
                          </h3>
                          <p className="text-sm text-gray-600">{session.therapist.email}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            📅 {new Date(session.scheduledAt).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">⏱️ {session.duration} minutes</p>
                        </div>
                        <button
                          onClick={() => cancelSession(session.id)}
                          className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                          style={{ background: 'var(--secondary)' }}
                        >
                          Cancel
                        </button>
                      </div>

                      {session.userNote && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-700">Your Note:</p>
                          <p className="text-sm text-gray-600">{session.userNote}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Sessions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Past Sessions</h2>
              {pastSessions.length === 0 ? (
                <p className="text-gray-600 py-8 text-center">No past sessions</p>
              ) : (
                <div className="space-y-4">
                  {pastSessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-xl p-5 opacity-75">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">
                            Session with {session.therapist.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(session.scheduledAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{
                          backgroundColor: session.status === 'completed' ? 'var(--bg-green-light)' : 
                                         session.status === 'cancelled' ? 'var(--bg-pink-light)' : 'var(--bg-purple-light)',
                          color: session.status === 'completed' ? 'var(--accent)' : 
                                session.status === 'cancelled' ? 'var(--secondary)' : 'var(--primary)'
                        }}>
                          {session.status}
                        </span>
                      </div>

                      {session.notes && (
                        <div className="bg-gray-50 rounded-lg p-3 mt-3">
                          <p className="text-sm font-medium text-gray-700">Therapist Notes:</p>
                          <p className="text-sm text-gray-600">{session.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
