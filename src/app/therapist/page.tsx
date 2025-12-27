'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import RoleGuard from '@/components/RoleGuard';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  TherapistHero,
  StatsGrid,
  CrisisAlertsCard,
  SessionsCard,
  AIInsightsCard,
  PreSessionNotesCard,
} from '@/components/therapist/bento';

// SVG Icon Components for SessionsCard
const CalendarIcon = ({ color = '#D9A299', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CheckCircleIcon = ({ color = '#7AB89E', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const InboxIcon = ({ color = '#D9A299', size = 48 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const StarIcon = ({ color = '#7AB89E', size = 48 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

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

  return (
    <RoleGuard requireTherapist>
      <div style={{
        minHeight: '100vh',
        background: '#FAF7F3',
      }}>
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

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '32px 24px',
          }}
        >
          {/* Hero Section with Online Toggle */}
          <TherapistHero
            userName={user?.name || ''}
            isOnline={isOnline}
            togglingOnline={togglingOnline}
            onToggleOnline={toggleOnlineStatus}
          />

          {/* Stats Grid */}
          <StatsGrid
            upcomingCount={upcomingSessions.length}
            completedCount={pastSessions.filter(s => s.status === 'completed').length}
            activeChats={unreadMessages}
          />

          {/* Crisis Alerts */}
          <CrisisAlertsCard
            alerts={crisisAlerts}
            onDismiss={dismissCrisisAlert}
          />

          {/* Pre-Session Notes */}
          <PreSessionNotesCard notes={preSessionNotes} />

          {/* Two Column Layout: Sessions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
          }}>
            <SessionsCard
              title="Upcoming Sessions"
              icon={<CalendarIcon color="#D9A299" size={20} />}
              sessions={upcomingSessions}
              variant="upcoming"
              loading={loading}
              emptyIcon={<InboxIcon color="#D9A299" size={48} />}
              emptyTitle="No upcoming sessions"
              emptySubtitle="Go online to start receiving bookings"
            />

            <SessionsCard
              title="Recent Sessions"
              icon={<CheckCircleIcon color="#7AB89E" size={20} />}
              sessions={pastSessions}
              variant="past"
              loading={loading}
              emptyIcon={<StarIcon color="#7AB89E" size={48} />}
              emptyTitle="No sessions yet"
              emptySubtitle="Your completed sessions will appear here"
            />
          </div>

          {/* AI Client Insights */}
          <AIInsightsCard
            insights={clientInsights}
            loading={loadingInsights}
          />
        </motion.main>
      </div>
    </RoleGuard>
  );
}
