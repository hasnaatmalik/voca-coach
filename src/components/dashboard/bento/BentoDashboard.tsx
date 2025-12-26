'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState } from 'react';
import BentoGrid from './BentoGrid';
import WelcomeBanner from './WelcomeBanner';
import ProgressRingCard from './ProgressRingCard';
import TodaysFocusCard from './TodaysFocusCard';
import QuickActionsCard from './QuickActionsCard';
import WeeklyAnalyticsCard from './WeeklyAnalyticsCard';
import MoodTrackerCard from './MoodTrackerCard';
import UpcomingSessionsCard from './UpcomingSessionsCard';
import AchievementsCard from './AchievementsCard';
import AIInsightsCard from './AIInsightsCard';
import RecentActivityCard from './RecentActivityCard';
import type {
  DashboardStats,
  SentimentData,
  WeeklyProgressData,
  UpcomingSession,
  DashboardAchievement,
  ActivityItem,
  DashboardRecommendation,
  TodaySummary,
} from '@/types/dashboard';

export interface BentoDashboardProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    streak: number;
    isTherapist?: boolean;
  };
  stats: DashboardStats | null;
  weeklyProgress: WeeklyProgressData | null;
  upcomingSessions: UpcomingSession[];
  achievements: DashboardAchievement[];
  recentActivity: ActivityItem[];
  aiRecommendations: DashboardRecommendation[];
  todaySummary: TodaySummary | null;
  sentimentData: SentimentData | null;
  empathyScore?: number;
  engagementScore?: number;
  availableTherapistCount: number;
  onStartSession: () => void;
  onBookTherapist: () => void;
  onLogout: () => void;
}

export default function BentoDashboard({
  user,
  stats,
  weeklyProgress,
  upcomingSessions,
  achievements,
  recentActivity,
  aiRecommendations,
  todaySummary,
  sentimentData,
  empathyScore = 0,
  engagementScore = 0,
  availableTherapistCount,
  onStartSession,
  onBookTherapist,
}: BentoDashboardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [exercises, setExercises] = useState([
    { id: '1', title: 'Practice active listening', completed: false },
    { id: '2', title: 'Reflective journaling', completed: true },
    { id: '3', title: 'Empathy exercise', completed: false },
  ]);

  // Transform data for components
  const mainProgress = useMemo(() => {
    return sentimentData?.emotionalStability || stats?.avgCalmScore || 0;
  }, [sentimentData, stats]);

  const progressMetrics = useMemo(() => [
    { label: 'Empathy', value: empathyScore, color: '#D9A299' },
    { label: 'Engagement', value: engagementScore, color: '#7AAFC9' },
    { label: 'Stability', value: sentimentData?.emotionalStability || 0, color: '#7AB89E' },
  ], [empathyScore, engagementScore, sentimentData]);

  const moodData = useMemo(() => {
    if (!sentimentData?.avgEmotions) {
      return [
        { emoji: '😊', label: 'Happy', value: 0, color: '#7AB89E' },
        { emoji: '😌', label: 'Calm', value: 0, color: '#7AAFC9' },
        { emoji: '😐', label: 'Neutral', value: 0, color: '#9B9B9B' },
        { emoji: '😰', label: 'Anxious', value: 0, color: '#E4B17A' },
        { emoji: '😤', label: 'Frustrated', value: 0, color: '#D9A299' },
      ];
    }

    return [
      { emoji: '😊', label: 'Happy', value: Math.round(sentimentData.avgEmotions.happy * 100), color: '#7AB89E' },
      { emoji: '😌', label: 'Calm', value: Math.round(sentimentData.avgEmotions.calm * 100), color: '#7AAFC9' },
      { emoji: '😐', label: 'Neutral', value: Math.round(sentimentData.avgEmotions.neutral * 100), color: '#9B9B9B' },
      { emoji: '😰', label: 'Anxious', value: Math.round(sentimentData.avgEmotions.anxious * 100), color: '#E4B17A' },
      { emoji: '😤', label: 'Frustrated', value: Math.round(sentimentData.avgEmotions.frustrated * 100), color: '#D9A299' },
    ];
  }, [sentimentData]);

  const weeklyChartData = useMemo(() => {
    if (!weeklyProgress) return [];

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      day,
      mood: weeklyProgress.moodTrend[i] || 0,
      sessions: weeklyProgress.sessions[i] || 0,
      engagement: Math.round(Math.random() * 40 + 60), // Simulated engagement data
    }));
  }, [weeklyProgress]);

  const handleToggleExercise = (id: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === id ? { ...ex, completed: !ex.completed } : ex
      )
    );
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: '100vh',
        background: '#FAF7F3',
        paddingTop: '100px',
        paddingBottom: '40px',
      }}
    >
      {/* Subtle noise texture overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 32px',
        position: 'relative',
        zIndex: 1,
      }}>
        <BentoGrid>
          {/* Welcome Banner */}
          <WelcomeBanner
            userName={user.name}
            streak={user.streak}
            availableTherapistCount={availableTherapistCount}
            onStartSession={onStartSession}
            onTalkToTherapist={onBookTherapist}
          />

          {/* Progress Ring */}
          <ProgressRingCard
            mainProgress={mainProgress}
            mainLabel="Overall Progress"
            metrics={progressMetrics}
          />

          {/* Today's Focus */}
          <TodaysFocusCard
            focusArea={todaySummary?.focusArea || 'Active Listening'}
            description="Focus on building stronger connections through mindful listening and empathetic responses."
            exercises={exercises}
            onToggleExercise={handleToggleExercise}
          />

          {/* Quick Actions */}
          <QuickActionsCard />

          {/* Weekly Analytics */}
          <WeeklyAnalyticsCard
            data={weeklyChartData}
            improvement={weeklyProgress?.improvement || 0}
          />

          {/* Mood Tracker */}
          <MoodTrackerCard
            moods={moodData}
            dominantMood={sentimentData?.dominantMood}
          />

          {/* Upcoming Sessions */}
          <UpcomingSessionsCard
            sessions={upcomingSessions}
            onJoinSession={(id) => console.log('Join session:', id)}
          />

          {/* Achievements */}
          <AchievementsCard
            streak={stats?.streak || user.streak}
            longestStreak={stats?.streak || user.streak}
            achievements={achievements}
          />

          {/* AI Insights */}
          <AIInsightsCard
            recommendations={aiRecommendations}
            onDismiss={(id) => console.log('Dismiss:', id)}
            onFeedback={(id, helpful) => console.log('Feedback:', id, helpful)}
          />

          {/* Recent Activity */}
          <RecentActivityCard
            activities={recentActivity}
            onViewAll={() => console.log('View all')}
          />
        </BentoGrid>
      </div>
    </motion.div>
  );
}
