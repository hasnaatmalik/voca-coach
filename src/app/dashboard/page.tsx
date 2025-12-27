'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import AvailableTherapistsModal from '@/components/AvailableTherapistsModal';
import { BentoDashboard, BentoDashboardSkeleton } from '@/components/dashboard/bento';
import type {
  DashboardStats,
  SentimentData,
  WeeklyProgressData,
  UpcomingSession,
  DashboardAchievement,
  ActivityItem,
  DashboardRecommendation,
  TodaySummary
} from '@/types/dashboard';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userName, setUserName] = useState('User');
  const [loadingData, setLoadingData] = useState(true);
  const [profilePic, setProfilePic] = useState<string | undefined>();
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [showTherapistModal, setShowTherapistModal] = useState(false);
  const [availableTherapistCount, setAvailableTherapistCount] = useState(0);

  // Enhanced dashboard state
  const [empathyScore, setEmpathyScore] = useState<number>(0);
  const [engagementScore, setEngagementScore] = useState<number>(0);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgressData | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [achievements, setAchievements] = useState<DashboardAchievement[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<DashboardRecommendation[]>([]);
  const [todaySummary, setTodaySummary] = useState<TodaySummary | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchAvailableCount();
      fetchRecommendations();
    }
  }, [user]);

  const fetchAvailableCount = async () => {
    try {
      const res = await fetch('/api/therapists/available');
      if (res.ok) {
        const data = await res.json();
        setAvailableTherapistCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch available count:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('/api/dashboard/recommendations');
      if (res.ok) {
        const data = await res.json();
        setAiRecommendations(data.recommendations || []);
        if (data.todaySummary) {
          setTodaySummary({
            ...data.todaySummary,
            targetSessions: 3,
            minutesPracticed: 0
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setUserName(data.userName || 'User');
        setSentimentData(data.sentimentData || null);

        // Set enhanced dashboard data
        setEmpathyScore(data.empathyScore || 0);
        setEngagementScore(data.engagementScore || 0);
        setWeeklyProgress(data.weeklyProgress || null);
        setUpcomingSessions(data.upcomingSessions || []);
        setAchievements(data.achievements || []);
        setRecentActivity(data.recentActivity || []);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleProfilePicChange = (imageUrl: string) => {
    setProfilePic(imageUrl);
  };

  const handleStartSession = () => {
    router.push('/de-escalation');
  };

  const handleBookTherapist = () => {
    setShowTherapistModal(true);
  };

  if (loading || !user || loadingData) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF7F3' }}>
        <BentoDashboardSkeleton />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F3' }}>
      {/* Navbar */}
      <Navbar
        isAuthenticated={true}
        userName={userName}
        userEmail={user.email}
        profilePic={profilePic}
        onProfilePicChange={handleProfilePicChange}
        onLogout={handleLogout}
        currentPage="/dashboard"
        isAdmin={user.isAdmin}
        isSuperAdmin={user.isSuperAdmin}
        isTherapist={user.isTherapist}
      />

      {/* Bento Dashboard */}
      <BentoDashboard
        user={{
          name: userName,
          email: user.email,
          avatar: profilePic,
          streak: stats?.streak || 0,
          isTherapist: user.isTherapist,
        }}
        stats={stats}
        weeklyProgress={weeklyProgress}
        upcomingSessions={upcomingSessions}
        achievements={achievements}
        recentActivity={recentActivity}
        aiRecommendations={aiRecommendations}
        todaySummary={todaySummary}
        sentimentData={sentimentData}
        empathyScore={empathyScore}
        engagementScore={engagementScore}
        availableTherapistCount={availableTherapistCount}
        onStartSession={handleStartSession}
        onBookTherapist={handleBookTherapist}
        onLogout={handleLogout}
      />

      {/* Available Therapists Modal */}
      <AvailableTherapistsModal
        isOpen={showTherapistModal}
        onClose={() => setShowTherapistModal(false)}
      />
    </div>
  );
}
