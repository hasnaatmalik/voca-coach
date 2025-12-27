'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

// Biomarker components
import VoiceRecorder from '@/components/biomarkers/VoiceRecorder';
import BiomarkerChart from '@/components/biomarkers/BiomarkerChart';
import RadarChart from '@/components/biomarkers/RadarChart';
import HeatmapCalendar from '@/components/biomarkers/HeatmapCalendar';
import SessionList from '@/components/biomarkers/SessionList';
import SessionDetailModal from '@/components/biomarkers/SessionDetailModal';
import InsightCard from '@/components/biomarkers/InsightCard';
import GoalSetter from '@/components/biomarkers/GoalSetter';
import BaselineComparison from '@/components/biomarkers/BaselineComparison';
import ExportModal from '@/components/biomarkers/ExportModal';
import AlertSettings from '@/components/biomarkers/AlertSettings';
import { BIOMARKER_METRICS } from '@/lib/biomarker-utils';

// Bento components
import {
  BiomarkersHero,
  HealthScoreCard,
  QuickStatsGrid,
  ChartCardWrapper,
  RecordingPanel,
  EmptyStateCard,
  TimeRangePicker,
} from '@/components/biomarkers/bento';

// SVG Icon Components
const TargetIcon = ({ color = '#D9A299', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const CalmFaceIcon = ({ color = '#7AB89E', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const ChartIcon = ({ color = '#7AAFC9', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const CalendarIcon = ({ color = '#E4B17A', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const AIBrainIcon = ({ color = '#D9A299', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M12 18v4" />
  </svg>
);

const RulerIcon = ({ color = '#9CA3AF', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21.3 8.7 8.7 21.3c-.4.4-1 .4-1.4 0L2.7 16.7c-.4-.4-.4-1 0-1.4L15.3 2.7c.4-.4 1-.4 1.4 0l4.6 4.6c.4.4.4 1 0 1.4z" />
    <line x1="9" y1="11" x2="11" y2="9" />
    <line x1="6" y1="14" x2="8" y2="12" />
    <line x1="12" y1="8" x2="14" y2="6" />
  </svg>
);

const ClipboardIcon = ({ color = '#7AAFC9', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

interface Biomarker {
  id: string;
  date: string;
  pitch: number;
  clarity: number;
  stress: number;
  pauseDuration?: number | null;
  articulationRate?: number | null;
  jitter?: number | null;
  shimmer?: number | null;
  speechRate?: number | null;
  hnr?: number | null;
  duration?: number | null;
  prompt?: string | null;
  notes?: string | null;
  overallScore?: number | null;
  observations?: string | null;
  recommendations?: string | null;
}

interface Baseline {
  pitch: number;
  pitchStdDev?: number | null;
  clarity: number;
  clarityStdDev?: number | null;
  stress: number;
  stressStdDev?: number | null;
  pauseDuration?: number | null;
  articulationRate?: number | null;
  jitter?: number | null;
  shimmer?: number | null;
  speechRate?: number | null;
  hnr?: number | null;
  recordingCount: number;
  calculatedAt: string;
}

interface Goal {
  target: number;
  direction: 'increase' | 'decrease' | 'maintain';
}

interface InsightsData {
  summary: string;
  trends: Array<{
    metric: string;
    direction: 'up' | 'down' | 'stable';
    percentChange: number;
    interpretation: string;
  }>;
  patterns: Array<{ description: string; confidence: number; insight: string }>;
  anomalies: Array<{ date: string; metric: string; value: number; expected: number; severity: 'low' | 'medium' | 'high' }>;
  recommendations: Array<{ title: string; description: string; priority: 'high' | 'medium' | 'low'; category: string }>;
  overallHealthScore: number;
  weeklyImprovement: number;
}

interface BiomarkerResult {
  pitch: number;
  clarity: number;
  stress: number;
  pauseDuration?: number;
  articulationRate?: number;
  jitter?: number;
  shimmer?: number;
  speechRate?: number;
  hnr?: number;
  overallScore?: number;
  observations?: string;
  recommendations?: string[];
  prompt?: string;
}

interface AlertConfig {
  enabled: boolean;
  threshold?: number;
}

interface AlertSettingsState {
  stress: AlertConfig;
  clarity: AlertConfig;
  jitter: AlertConfig;
  recordingReminder: AlertConfig;
  achievements: AlertConfig;
}

export default function BiomarkerDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Data state
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [goals, setGoals] = useState<Record<string, Goal>>({});
  const [insights, setInsights] = useState<InsightsData | null>(null);

  // UI state
  const [loadingData, setLoadingData] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingBaseline, setLoadingBaseline] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Biomarker | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'history' | 'goals'>('overview');
  const [profilePic, setProfilePic] = useState<string>();

  // Date range state
  const [dateRange, setDateRange] = useState<{
    preset?: string;
    days?: number;
    startDate?: string;
    endDate?: string;
  }>({ preset: '7d', days: 7 });

  // Alert settings
  const [alertSettings, setAlertSettings] = useState<AlertSettingsState>({
    stress: { enabled: true, threshold: 70 },
    clarity: { enabled: true, threshold: 50 },
    jitter: { enabled: false, threshold: 2 },
    recordingReminder: { enabled: true, threshold: 3 },
    achievements: { enabled: true },
  });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchBiomarkers();
      fetchBaseline();
      fetchGoals();
    }
  }, [user, dateRange]);

  const fetchBiomarkers = async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.days) params.set('days', dateRange.days.toString());
      if (dateRange.startDate) params.set('startDate', dateRange.startDate);
      if (dateRange.endDate) params.set('endDate', dateRange.endDate);

      const res = await fetch(`/api/biomarkers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBiomarkers(data.biomarkers || []);
        if (data.biomarkers?.length > 0) {
          fetchInsights();
        }
      }
    } catch (error) {
      console.error('Failed to fetch biomarkers:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchBaseline = async () => {
    try {
      const res = await fetch('/api/biomarkers/baseline');
      if (res.ok) {
        const data = await res.json();
        setBaseline(data.baseline || null);
      }
    } catch (error) {
      console.error('Failed to fetch baseline:', error);
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/biomarkers/goals');
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals || {});
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    }
  };

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch('/api/biomarkers/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: dateRange.days || 30 }),
      });
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleRecordingComplete = async (result: BiomarkerResult) => {
    try {
      const res = await fetch('/api/biomarkers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result,
          prompt: result.prompt || 'free_speech',
        }),
      });

      if (res.ok) {
        await fetchBiomarkers();
        setShowRecorder(false);
      }
    } catch (error) {
      console.error('Failed to save biomarker:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/biomarkers?id=${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        setBiomarkers(prev => prev.filter(b => b.id !== sessionId));
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleSaveGoals = async (newGoals: Record<string, Goal>) => {
    try {
      const res = await fetch('/api/biomarkers/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals: newGoals }),
      });
      if (res.ok) {
        setGoals(newGoals);
      }
    } catch (error) {
      console.error('Failed to save goals:', error);
    }
  };

  const handleGetSuggestions = async (): Promise<Record<string, Goal>> => {
    try {
      const res = await fetch('/api/biomarkers/goals', { method: 'PUT' });
      if (res.ok) {
        const data = await res.json();
        return data.suggestions || {};
      }
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    }
    return {};
  };

  const handleRecalculateBaseline = async () => {
    setLoadingBaseline(true);
    try {
      const res = await fetch('/api/biomarkers/baseline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 }),
      });
      if (res.ok) {
        const data = await res.json();
        setBaseline(data.baseline);
      }
    } catch (error) {
      console.error('Failed to recalculate baseline:', error);
    } finally {
      setLoadingBaseline(false);
    }
  };

  const handleExport = async (options: { format: 'csv' | 'json' | 'pdf'; startDate?: string; endDate?: string }) => {
    try {
      const res = await fetch('/api/biomarkers/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (res.ok) {
        if (options.format === 'pdf') {
          const data = await res.json();
          console.log('PDF data:', data);
        } else {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `biomarkers.${options.format}`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handlePlayTTS = async (text: string) => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();
      }
    } catch (error) {
      console.error('TTS failed:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Calculate stats
  const latestBiomarker = biomarkers[0];
  const previousBiomarker = biomarkers[1];

  const getHeatmapData = () => {
    const countByDate = new Map<string, { count: number; totalScore: number }>();
    biomarkers.forEach(b => {
      const dateKey = b.date.split('T')[0];
      const existing = countByDate.get(dateKey) || { count: 0, totalScore: 0 };
      existing.count++;
      existing.totalScore += b.overallScore || (b.clarity * 0.6 + (100 - b.stress) * 0.4);
      countByDate.set(dateKey, existing);
    });

    return Array.from(countByDate.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      avgScore: data.totalScore / data.count,
    }));
  };

  const getChartData = (metric: keyof Biomarker) => {
    return biomarkers
      .slice()
      .reverse()
      .map(b => ({
        date: b.date,
        value: b[metric] as number,
        id: b.id,
      }))
      .filter(d => d.value !== undefined && d.value !== null);
  };

  const healthScore = insights?.overallHealthScore ||
    Math.round((latestBiomarker?.clarity || 0) * 0.6 + (100 - (latestBiomarker?.stress || 0)) * 0.4);

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
              borderTop: '4px solid #7AAFC9',
              borderRadius: '50%',
              margin: '0 auto 16px',
            }}
          />
          <div style={{ color: '#6B6B6B' }}>Loading...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F3' }}>
      <Navbar
        isAuthenticated={true}
        userName={user.name || 'User'}
        userEmail={user.email}
        profilePic={profilePic}
        onProfilePicChange={setProfilePic}
        onLogout={handleLogout}
        currentPage="/biomarkers"
      />

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Immersive Hero Header */}
        <BiomarkersHero
          activeView={activeView}
          onViewChange={setActiveView}
          onRecordClick={() => setShowRecorder(!showRecorder)}
          onExportClick={() => setShowExportModal(true)}
          onAlertsClick={() => setShowAlertSettings(true)}
          recordingsCount={biomarkers.length}
          isRecording={showRecorder}
        />

        {/* Recording Panel */}
        <RecordingPanel
          isOpen={showRecorder}
          onClose={() => setShowRecorder(false)}
        >
          <VoiceRecorder
            onAnalysisComplete={handleRecordingComplete}
            onError={err => console.error('Recording error:', err)}
          />
        </RecordingPanel>

        {/* Time Range Picker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '24px' }}
        >
          <TimeRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
        </motion.div>

        {/* Loading State */}
        {loadingData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '60px',
              color: '#6B6B6B',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid #F0E4D3',
                borderTopColor: '#7AAFC9',
                borderRadius: '50%',
                margin: '0 auto 16px',
              }}
            />
            Loading biomarker data...
          </motion.div>
        )}

        {/* Empty State */}
        {!loadingData && biomarkers.length === 0 && (
          <EmptyStateCard onRecordClick={() => setShowRecorder(true)} />
        )}

        {/* Main Content */}
        {!loadingData && biomarkers.length > 0 && (
          <AnimatePresence mode="wait">
            {activeView === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Health Score and Quick Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(280px, 1fr) minmax(0, 2fr)',
                  gap: '24px',
                  marginBottom: '24px',
                }}>
                  <HealthScoreCard
                    score={healthScore}
                    weeklyImprovement={insights?.weeklyImprovement}
                    previousScore={previousBiomarker ?
                      Math.round((previousBiomarker.clarity * 0.6) + ((100 - previousBiomarker.stress) * 0.4)) :
                      undefined
                    }
                  />

                  <QuickStatsGrid
                    clarity={latestBiomarker?.clarity || 0}
                    stress={latestBiomarker?.stress || 0}
                    pitch={latestBiomarker?.pitch}
                    recordingsCount={biomarkers.length}
                    previousClarity={previousBiomarker?.clarity}
                    previousStress={previousBiomarker?.stress}
                    speechRate={latestBiomarker?.speechRate || undefined}
                  />
                </div>

                {/* Charts Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: '24px',
                  marginBottom: '24px',
                }}>
                  <ChartCardWrapper
                    title="Clarity Trend"
                    subtitle="Voice clarity over time"
                    icon={<TargetIcon color="#D9A299" />}
                    accentColor="#D9A299"
                  >
                    <BiomarkerChart
                      data={getChartData('clarity')}
                      metric="clarity"
                      baseline={baseline?.clarity}
                      goal={goals.clarity?.target}
                      normalRange={BIOMARKER_METRICS.clarity?.normalRange}
                    />
                  </ChartCardWrapper>

                  <ChartCardWrapper
                    title="Stress Levels"
                    subtitle="Vocal stress indicators"
                    icon={<CalmFaceIcon color="#7AB89E" />}
                    accentColor="#7AB89E"
                  >
                    <BiomarkerChart
                      data={getChartData('stress')}
                      metric="stress"
                      baseline={baseline?.stress}
                      goal={goals.stress?.target}
                      normalRange={BIOMARKER_METRICS.stress?.normalRange}
                    />
                  </ChartCardWrapper>
                </div>

                {/* Radar and Heatmap Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: '24px',
                  marginBottom: '24px',
                }}>
                  {latestBiomarker && (
                    <ChartCardWrapper
                      title="Voice Profile"
                      subtitle="Multi-dimensional analysis"
                      icon={<ChartIcon color="#7AAFC9" />}
                      accentColor="#7AAFC9"
                    >
                      <RadarChart
                        current={latestBiomarker}
                        baseline={baseline || undefined}
                      />
                    </ChartCardWrapper>
                  )}

                  <ChartCardWrapper
                    title="Recording Activity"
                    subtitle="12-week overview"
                    icon={<CalendarIcon color="#E4B17A" />}
                    accentColor="#E4B17A"
                  >
                    <HeatmapCalendar
                      data={getHeatmapData()}
                      weeks={12}
                      onDayClick={date => {
                        const sessions = biomarkers.filter(b => b.date.startsWith(date));
                        if (sessions.length > 0) setSelectedSession(sessions[0]);
                      }}
                    />
                  </ChartCardWrapper>
                </div>

                {/* AI Insights */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ marginBottom: '24px' }}
                >
                  <ChartCardWrapper
                    title="AI Insights"
                    subtitle="Personalized recommendations"
                    icon={<AIBrainIcon color="#D9A299" />}
                    accentColor="#D9A299"
                    fullWidth
                  >
                    <InsightCard
                      insights={insights}
                      loading={loadingInsights}
                      onPlayTTS={handlePlayTTS}
                      onRefresh={fetchInsights}
                    />
                  </ChartCardWrapper>
                </motion.div>

                {/* Baseline Comparison */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <ChartCardWrapper
                    title="Baseline Comparison"
                    subtitle="Compare to your personal baseline"
                    icon={<RulerIcon color="#9CA3AF" />}
                    accentColor="#9CA3AF"
                    fullWidth
                  >
                    <BaselineComparison
                      baseline={baseline}
                      current={latestBiomarker}
                      onRecalculate={handleRecalculateBaseline}
                      loading={loadingBaseline}
                    />
                  </ChartCardWrapper>
                </motion.div>
              </motion.div>
            )}

            {activeView === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ChartCardWrapper
                  title="Recording History"
                  subtitle="All your voice samples"
                  icon={<ClipboardIcon color="#7AAFC9" />}
                  accentColor="#7AAFC9"
                  fullWidth
                >
                  <SessionList
                    sessions={biomarkers}
                    onSessionClick={session => setSelectedSession(session)}
                    onDeleteSession={handleDeleteSession}
                    loading={loadingData}
                  />
                </ChartCardWrapper>
              </motion.div>
            )}

            {activeView === 'goals' && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ChartCardWrapper
                  title="Voice Goals"
                  subtitle="Set and track your improvement targets"
                  icon={<TargetIcon color="#D9A299" />}
                  accentColor="#D9A299"
                  fullWidth
                >
                  <GoalSetter
                    currentGoals={goals}
                    onSave={handleSaveGoals}
                    onGetSuggestions={handleGetSuggestions}
                  />
                </ChartCardWrapper>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {selectedSession && (
          <SessionDetailModal
            session={selectedSession}
            baseline={baseline || undefined}
            onClose={() => setSelectedSession(null)}
            onDelete={handleDeleteSession}
            onPlayTTS={handlePlayTTS}
          />
        )}

        {showExportModal && (
          <ExportModal
            onClose={() => setShowExportModal(false)}
            onExport={handleExport}
          />
        )}

        {showAlertSettings && (
          <AlertSettings
            settings={alertSettings}
            onSave={async settings => setAlertSettings(settings)}
            onClose={() => setShowAlertSettings(false)}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media (max-width: 768px) {
          main > div > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
