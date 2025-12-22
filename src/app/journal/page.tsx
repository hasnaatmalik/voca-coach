'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import JournalSidebar from './components/JournalSidebar';
import JournalChat from './components/JournalChat';
import JournalEditor from './components/JournalEditor';
import JournalHistory from './components/JournalHistory';
import JournalAnalytics from './components/JournalAnalytics';
import JournalPrompts from './components/JournalPrompts';
import GratitudePrompt from './components/GratitudePrompt';
import CBTExercise from './components/CBTExercise';
import VoiceJournal from './components/VoiceJournal';
import { ViewMode, JournalStreak } from './types';

export default function JournalPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [streak, setStreak] = useState<JournalStreak | null>(null);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [profilePic, setProfilePic] = useState<string>();
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchStreak = useCallback(async () => {
    try {
      const res = await fetch('/api/journal-analytics?range=all');
      const data = await res.json();
      if (data.streak) {
        setStreak(data.streak);
      }
      if (data.averageMood) {
        setCurrentMood(Math.round(data.averageMood));
      }
    } catch (err) {
      console.error('Fetch streak error:', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      // fetchStreak is an async function that fetches data - this is a valid pattern
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchStreak();
    }
  }, [user, fetchStreak]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleStreakUpdate = () => {
    fetchStreak();
  };

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
    setViewMode('write');
  };

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedPrompt(null);
  };

  if (loading || !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3E8FF 50%, #FCE7F3 100%)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #7C3AED',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <div style={{ color: '#6B7280' }}>Loading...</div>
        </div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Determine if sidebar should be shown
  const showSidebar = !['analytics'].includes(viewMode);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F9FAFB 0%, #F3E8FF 50%, #FCE7F3 100%)',
    }}>
      <Navbar
        isAuthenticated={true}
        userName={user.name || 'User'}
        userEmail={user.email}
        profilePic={profilePic}
        onProfilePicChange={setProfilePic}
        onLogout={handleLogout}
        currentPage="/journal"
        isAdmin={user.isAdmin}
        isSuperAdmin={user.isSuperAdmin}
        isTherapist={user.isTherapist}
      />

      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '32px',
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1F2937',
            margin: '0 0 8px',
          }}>
            Journal
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#6B7280',
            margin: 0,
          }}>
            Reflect, grow, and understand yourself better
          </p>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: showSidebar ? '280px 1fr' : '1fr',
          gap: '24px',
          alignItems: 'start',
        }}>
          {/* Sidebar */}
          {showSidebar && (
            <JournalSidebar
              viewMode={viewMode}
              onViewChange={handleViewChange}
              streak={streak}
              currentMood={currentMood}
            />
          )}

          {/* Main Content */}
          <div>
            {viewMode === 'chat' && (
              <JournalChat
                sessionId={currentSessionId}
                onSessionChange={setCurrentSessionId}
                onStreakUpdate={handleStreakUpdate}
              />
            )}

            {viewMode === 'write' && (
              <JournalEditor
                onSave={() => {
                  handleStreakUpdate();
                  if (selectedPrompt) {
                    setSelectedPrompt(null);
                  }
                }}
                onStreakUpdate={handleStreakUpdate}
              />
            )}

            {viewMode === 'gratitude' && (
              <GratitudePrompt
                onSave={handleStreakUpdate}
                onStreakUpdate={handleStreakUpdate}
              />
            )}

            {viewMode === 'cbt' && (
              <CBTExercise
                onSave={handleStreakUpdate}
                onStreakUpdate={handleStreakUpdate}
              />
            )}

            {viewMode === 'voice' && (
              <VoiceJournal
                onStreakUpdate={handleStreakUpdate}
              />
            )}

            {viewMode === 'history' && (
              <JournalHistory
                onEntrySelect={(entry) => {
                  console.log('Selected entry:', entry);
                }}
              />
            )}

            {viewMode === 'analytics' && (
              <div>
                {/* Back button for analytics */}
                <button
                  onClick={() => setViewMode('chat')}
                  style={{
                    marginBottom: '16px',
                    padding: '8px 16px',
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#4B5563',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  ← Back to Journal
                </button>
                <JournalAnalytics />
              </div>
            )}

            {viewMode === 'prompts' && (
              <JournalPrompts
                onSelectPrompt={handlePromptSelect}
                onViewChange={(mode) => setViewMode(mode)}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
