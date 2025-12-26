'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import {
  JournalHero,
  JournalModeGrid,
  BrowseSection,
  JournalStatsCard,
  ContentCard,
} from '@/components/journal/bento';
import JournalChat from './components/JournalChat';
import JournalEditor from './components/JournalEditor';
import JournalHistory from './components/JournalHistory';
import JournalAnalytics from './components/JournalAnalytics';
import JournalPrompts from './components/JournalPrompts';
import GratitudePrompt from './components/GratitudePrompt';
import CBTExercise from './components/CBTExercise';
import VoiceJournal from './components/VoiceJournal';
import { ViewMode, JournalStreak } from './types';

// SVG Icon Components
const ChatIcon = ({ color = 'white', size = 22 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const PencilIcon = ({ color = 'white', size = 22 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const HeartHandsIcon = ({ color = 'white', size = 22 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M11 14h2" />
    <path d="M12 14v6" />
    <path d="M4 9.5a3.5 3.5 0 1 1 7 0V11h2V9.5a3.5 3.5 0 1 1 7 0V16c0 2.21-1.79 4-4 4H8c-2.21 0-4-1.79-4-4V9.5z" />
  </svg>
);

const BrainIcon = ({ color = 'white', size = 22 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M12 18v4" />
  </svg>
);

const MicIcon = ({ color = 'white', size = 22 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const BookIcon = ({ color = 'white', size = 22 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ChartIcon = ({ color = 'white', size = 22 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const LightbulbIcon = ({ color = 'white', size = 22 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const CONTENT_CONFIG: Record<ViewMode, { title: string; subtitle: string; icon: ReactNode }> = {
  chat: { title: 'Reflective Chat', subtitle: 'Share your thoughts and I\'ll help you reflect', icon: <ChatIcon /> },
  write: { title: 'Free Write', subtitle: 'Express yourself freely', icon: <PencilIcon /> },
  gratitude: { title: 'Gratitude Journal', subtitle: 'Focus on the positive', icon: <HeartHandsIcon /> },
  cbt: { title: 'CBT Exercise', subtitle: 'Challenge negative thoughts', icon: <BrainIcon /> },
  voice: { title: 'Voice Journal', subtitle: 'Speak your thoughts aloud', icon: <MicIcon /> },
  history: { title: 'Journal History', subtitle: 'Browse your past entries', icon: <BookIcon /> },
  analytics: { title: 'Insights & Analytics', subtitle: 'Track your journaling journey', icon: <ChartIcon /> },
  prompts: { title: 'Writing Prompts', subtitle: 'Find inspiration', icon: <LightbulbIcon /> },
};

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
        background: '#FAF7F3',
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #F0E4D3',
              borderTop: '4px solid #D9A299',
              borderRadius: '50%',
              margin: '0 auto 16px',
            }}
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ color: '#6B6B6B', fontSize: '15px' }}
          >
            Loading your journal...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const showSidebar = !['analytics'].includes(viewMode);
  const contentConfig = CONTENT_CONFIG[viewMode];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF7F3',
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
        {/* Hero Section */}
        <JournalHero
          userName={user.name || 'there'}
          currentStreak={streak?.currentStreak || 0}
          totalEntries={streak?.totalEntries || 0}
        />

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: showSidebar ? '300px 1fr' : '1fr',
          gap: '24px',
          alignItems: 'start',
        }}>
          {/* Sidebar */}
          {showSidebar && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'sticky',
                top: '100px',
              }}
            >
              {/* Journal Mode Selection */}
              <JournalModeGrid
                viewMode={viewMode}
                onViewChange={handleViewChange}
              />

              {/* Browse Section */}
              <BrowseSection
                viewMode={viewMode}
                onViewChange={handleViewChange}
              />

              {/* Stats Card */}
              {streak && (
                <JournalStatsCard
                  totalEntries={streak.totalEntries}
                  currentStreak={streak.currentStreak}
                  longestStreak={streak.longestStreak}
                />
              )}
            </motion.div>
          )}

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {viewMode === 'chat' && (
              <ContentCard
                title={contentConfig.title}
                subtitle={contentConfig.subtitle}
                icon={contentConfig.icon}
                fullHeight
                noPadding
              >
                <JournalChat
                  sessionId={currentSessionId}
                  onSessionChange={setCurrentSessionId}
                  onStreakUpdate={handleStreakUpdate}
                />
              </ContentCard>
            )}

            {viewMode === 'write' && (
              <ContentCard
                title={contentConfig.title}
                subtitle={contentConfig.subtitle}
                icon={contentConfig.icon}
              >
                <JournalEditor
                  onSave={() => {
                    handleStreakUpdate();
                    if (selectedPrompt) {
                      setSelectedPrompt(null);
                    }
                  }}
                  onStreakUpdate={handleStreakUpdate}
                />
              </ContentCard>
            )}

            {viewMode === 'gratitude' && (
              <ContentCard
                title={contentConfig.title}
                subtitle={contentConfig.subtitle}
                icon={contentConfig.icon}
              >
                <GratitudePrompt
                  onSave={handleStreakUpdate}
                  onStreakUpdate={handleStreakUpdate}
                />
              </ContentCard>
            )}

            {viewMode === 'cbt' && (
              <ContentCard
                title={contentConfig.title}
                subtitle={contentConfig.subtitle}
                icon={contentConfig.icon}
              >
                <CBTExercise
                  onSave={handleStreakUpdate}
                  onStreakUpdate={handleStreakUpdate}
                />
              </ContentCard>
            )}

            {viewMode === 'voice' && (
              <ContentCard
                title={contentConfig.title}
                subtitle={contentConfig.subtitle}
                icon={contentConfig.icon}
              >
                <VoiceJournal
                  onStreakUpdate={handleStreakUpdate}
                />
              </ContentCard>
            )}

            {viewMode === 'history' && (
              <ContentCard
                title={contentConfig.title}
                subtitle={contentConfig.subtitle}
                icon={contentConfig.icon}
              >
                <JournalHistory
                  onEntrySelect={(entry) => {
                    console.log('Selected entry:', entry);
                  }}
                />
              </ContentCard>
            )}

            {viewMode === 'analytics' && (
              <ContentCard
                title={contentConfig.title}
                subtitle={contentConfig.subtitle}
                icon={contentConfig.icon}
                showBackButton
                onBack={() => setViewMode('chat')}
              >
                <JournalAnalytics />
              </ContentCard>
            )}

            {viewMode === 'prompts' && (
              <ContentCard
                title={contentConfig.title}
                subtitle={contentConfig.subtitle}
                icon={contentConfig.icon}
              >
                <JournalPrompts
                  onSelectPrompt={handlePromptSelect}
                  onViewChange={(mode) => setViewMode(mode)}
                />
              </ContentCard>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
