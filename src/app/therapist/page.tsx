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

  useEffect(() => {
    fetchSessions();
  }, []);

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

  return (
    <RoleGuard requireTherapist>
      <div style={{ minHeight: '100vh' }}>
        {user && (
          <Navbar
            isAuthenticated={true}
            userName={user.name}
            userEmail={user.email}
            onLogout={handleLogout}
            currentPage="/therapist"
            isAdmin={user.isAdmin}
            isTherapist={user.isTherapist}
          />
        )}
        
        <div style={{ minHeight: 'calc(100vh - 72px)', padding: '32px 24px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Therapist Dashboard</h1>
            <p className="text-gray-600">Manage your therapy sessions and profile</p>
            <Link href="/therapist/profile" className="font-medium mt-2 inline-block" style={{ color: 'var(--primary)' }}>
              Edit Profile →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Sessions" value={sessions.length} icon="💬" />
                <StatCard title="Upcoming" value={upcomingSessions.length} icon="📅" />
                <StatCard title="Completed" value={pastSessions.filter(s => s.status === 'completed').length} icon="✅" />
              </div>

              {/* Upcoming Sessions */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Sessions</h2>
                {upcomingSessions.length === 0 ? (
                  <p className="text-gray-600 py-8 text-center">No upcoming sessions</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <SessionCard key={session.id} session={session} onUpdate={fetchSessions} />
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
                    {pastSessions.slice(0, 10).map((session) => (
                      <SessionCard key={session.id} session={session} onUpdate={fetchSessions} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </RoleGuard>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-purple-light)' }}>
          <span className="text-3xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function SessionCard({ session, onUpdate }: { session: Session; onUpdate: () => void }) {
  const [notes, setNotes] = useState(session.notes || '');
  const [saving, setSaving] = useState(false);

  const saveNotes = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/therapist/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, notes }),
      });
      if (res.ok) {
        alert('Notes saved');
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
      alert('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const markCompleted = async () => {
    try {
      const res = await fetch('/api/therapist/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, status: 'completed' }),
      });
      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{session.user.name}</h3>
          <p className="text-sm text-gray-600">{session.user.email}</p>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(session.scheduledAt).toLocaleString()} • {session.duration} min
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{
          backgroundColor: session.status === 'completed' ? 'var(--bg-green-light)' :
                         session.status === 'cancelled' ? 'var(--bg-pink-light)' :
                         'var(--bg-purple-light)',
          color: session.status === 'completed' ? 'var(--accent)' :
                session.status === 'cancelled' ? 'var(--secondary)' :
                'var(--primary)'
        }}>
          {session.status}
        </span>
      </div>

      {session.userNote && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-sm font-medium text-gray-700">Client Note:</p>
          <p className="text-sm text-gray-600">{session.userNote}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Session Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="Add your session notes..."
        />
        <div className="flex gap-2">
          <button
            onClick={saveNotes}
            disabled={saving}
            className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:bg-gray-300"
          style={{ background: 'var(--bg-gradient-purple)' }}
          >
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
          {session.status === 'scheduled' && new Date(session.scheduledAt) < new Date() && (
            <button
              onClick={markCompleted}
              className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
              style={{ background: 'var(--tertiary)' }}
            >
              Mark Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
