'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import CircularProgress from '@/components/CircularProgress';
import EmotionScale from '@/components/EmotionScale';
import LiveStatsPanel from '@/components/LiveStatsPanel';
import StatusBadge from '@/components/StatusBadge';
import Navbar from '@/components/Navbar';
import AvailableTherapistsModal from '@/components/AvailableTherapistsModal';

interface Stats {
  sessionCount: number;
  avgCalmScore: number;
  journalCount: number;
  streak: number;
}

interface Activity {
  type: 'session' | 'journal';
  time: string;
  action: string;
  result: string;
}

interface SentimentData {
  avgEmotions: {
    happy: number;
    sad: number;
    anxious: number;
    calm: number;
    neutral: number;
    frustrated: number;
  };
  dominantMood: string;
  emotionalStability: number;
  recentSessions: Array<{
    date: string;
    dominantMood: string;
    emotionalScore: number;
    moodChanges: number;
  }>;
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [userName, setUserName] = useState('User');
  const [loadingData, setLoadingData] = useState(true);
  const [profilePic, setProfilePic] = useState<string | undefined>();
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [showTherapistModal, setShowTherapistModal] = useState(false);
  const [availableTherapistCount, setAvailableTherapistCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchAvailableCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setActivity(data.activity || []);
        setUserName(data.userName || 'User');
        setSentimentData(data.sentimentData || null);
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
    console.log('Profile picture updated:', imageUrl);
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #7C3AED',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div style={{ color: '#6B7280' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
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

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Welcome Section with Status Badge */}
        <div style={{ marginBottom: '24px' }}>
          <StatusBadge status="info" label="Professional therapy enhancement tool only" />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
                Session Overview
              </h1>
              <p style={{ color: '#6B7280' }}>Welcome back, {userName.split(' ')[0]}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                padding: '10px 20px',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#4B5563',
                cursor: 'pointer'
              }}>
                View all
              </button>
              <a href="/de-escalation" style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'inline-block',
                textDecoration: 'none'
              }}>
                Start Session
              </a>
              <button
                onClick={() => setShowTherapistModal(true)}
                style={{
                  padding: '10px 20px',
                  background: availableTherapistCount > 0 
                    ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' 
                    : 'white',
                  border: availableTherapistCount > 0 ? 'none' : '1px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: availableTherapistCount > 0 ? 'white' : '#4B5563',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: availableTherapistCount > 0 ? '#10B981' : '#9CA3AF',
                  boxShadow: availableTherapistCount > 0 ? '0 0 8px #10B981' : 'none',
                }} />
                {availableTherapistCount > 0 
                  ? `${availableTherapistCount} Therapist${availableTherapistCount > 1 ? 's' : ''} Online`
                  : 'Talk to Therapist'}
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          {/* Left Column - Main Content */}
          <div>
            {/* Points of Improvement */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '24px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
                Points of Improvement
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
                Metrics based on your previous conversation
              </p>

              {/* Circular Progress Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                <CircularProgress
                  percentage={sentimentData?.emotionalStability || stats?.avgCalmScore || 62}
                  label="Emotional Stability"
                  description="positive mood patterns"
                  color="purple"
                />
                <CircularProgress percentage={81} label="Empathy" description="client engagement" color="pink" />
                <CircularProgress percentage={80} label="Engagement" description="speaking patterns" color="cyan" />
              </div>
            </div>

            {/* Emotions Analysis */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937', marginBottom: '20px' }}>
                Emotional Analysis
              </h2>

              {sentimentData ? (
                <>
                  <EmotionScale emoji="😊" label="Happy" percentage={Math.round(sentimentData.avgEmotions.happy * 100)} color="#10B981" />
                  <EmotionScale emoji="😌" label="Calm" percentage={Math.round(sentimentData.avgEmotions.calm * 100)} color="#06B6D4" />
                  <EmotionScale emoji="😐" label="Neutral" percentage={Math.round(sentimentData.avgEmotions.neutral * 100)} color="#6B7280" />
                  <EmotionScale emoji="😰" label="Anxious" percentage={Math.round(sentimentData.avgEmotions.anxious * 100)} color="#F59E0B" />
                  <EmotionScale emoji="😔" label="Sad" percentage={Math.round(sentimentData.avgEmotions.sad * 100)} color="#3B82F6" />
                  <EmotionScale emoji="😤" label="Frustrated" percentage={Math.round(sentimentData.avgEmotions.frustrated * 100)} color="#EF4444" />
                </>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>
                  Complete a therapy session with sentiment analysis to see your emotional patterns
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Live Stats Panel */}
          <div>
            <LiveStatsPanel
              currentMood={(sentimentData?.dominantMood && sentimentData.dominantMood.charAt(0).toUpperCase() + sentimentData.dominantMood.slice(1)) || "Engaged"}
              moodEmoji=""
              stats={[
                { label: 'Sessions', value: `${stats?.sessionCount || 0}` },
                { label: 'Emotional Stability', value: `${sentimentData?.emotionalStability || stats?.avgCalmScore || 0}%` }
              ]}
              recommendations={sentimentData?.recentSessions && sentimentData.recentSessions.length > 0 ? [
                { 
                  type: 'info', 
                  message: `Recent mood: ${sentimentData.recentSessions[0]?.dominantMood}`, 
                  timestamp: "Latest session" 
                }
              ] : [
                { type: 'info', message: "Complete a session to see mood insights", timestamp: "" }
              ]}
            />
          </div>
        </div>
      </main>

      {/* Available Therapists Modal */}
      <AvailableTherapistsModal
        isOpen={showTherapistModal}
        onClose={() => setShowTherapistModal(false)}
      />
    </div>
  );
}
