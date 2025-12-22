'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

// Biomarker components
import VoiceRecorder from '@/components/biomarkers/VoiceRecorder';
import BiomarkerChart from '@/components/biomarkers/BiomarkerChart';
import RadarChart from '@/components/biomarkers/RadarChart';
import HeatmapCalendar from '@/components/biomarkers/HeatmapCalendar';
import TimeRangeSelector from '@/components/biomarkers/TimeRangeSelector';
import SessionList from '@/components/biomarkers/SessionList';
import SessionDetailModal from '@/components/biomarkers/SessionDetailModal';
import InsightCard from '@/components/biomarkers/InsightCard';
import GoalSetter from '@/components/biomarkers/GoalSetter';
import BaselineComparison from '@/components/biomarkers/BaselineComparison';
import ExportModal from '@/components/biomarkers/ExportModal';
import AlertSettings from '@/components/biomarkers/AlertSettings';
import TrendIndicator from '@/components/biomarkers/TrendIndicator';
import { calculateTrend, BIOMARKER_METRICS } from '@/lib/biomarker-utils';

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
  const [showGoalSetter, setShowGoalSetter] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'history' | 'goals'>('overview');
  const [profilePic, setProfilePic] = useState<string>();

  // Date range state
  const [dateRange, setDateRange] = useState<{
    preset?: string;
    days?: number;
    startDate?: string;
    endDate?: string;
  }>({ preset: '7d', days: 7 });

  // Alert settings (would be persisted to user preferences in production)
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

  const handleRecordingComplete = async (result: BiomarkerResult, audioBlob: Blob) => {
    try {
      // Save biomarker to database
      const res = await fetch('/api/biomarkers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result,
          prompt: result.prompt || 'free_speech',
        }),
      });

      if (res.ok) {
        // Refresh data
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
          // Handle PDF data (could open in new window or download)
          console.log('PDF data:', data);
        } else {
          // Download file
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

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #E0F2FE 0%, #F3E8FF 50%, #FCE7F3 100%)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #E5E7EB', borderTop: '4px solid #7C3AED', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ color: '#6B7280' }}>Loading...</div>
        </div>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #E0F2FE 0%, #F3E8FF 50%, #FCE7F3 100%)' }}>
      <Navbar
        isAuthenticated={true}
        userName={user.name || 'User'}
        userEmail={user.email}
        profilePic={profilePic}
        onProfilePicChange={setProfilePic}
        onLogout={handleLogout}
        currentPage="/biomarkers"
      />

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
              Voice Biomarkers Dashboard
            </h1>
            <p style={{ color: '#6B7280' }}>Track and analyze your vocal health patterns over time.</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowRecorder(!showRecorder)}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Record Voice Sample
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                background: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Export
            </button>
            <button
              onClick={() => setShowAlertSettings(true)}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                background: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Alerts
            </button>
          </div>
        </div>

        {/* Voice Recorder (collapsible) */}
        {showRecorder && (
          <div style={{ marginBottom: '32px' }}>
            <VoiceRecorder
              onAnalysisComplete={handleRecordingComplete}
              onError={err => console.error('Recording error:', err)}
            />
          </div>
        )}

        {/* Time Range Selector */}
        <div style={{ marginBottom: '24px' }}>
          <TimeRangeSelector
            defaultPreset="7d"
            onChange={range => {
              setDateRange(range);
            }}
          />
        </div>

        {/* View Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {(['overview', 'history', 'goals'] as const).map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              style={{
                padding: '10px 20px',
                borderRadius: '20px',
                border: activeView === view ? '2px solid #7C3AED' : '1px solid #E5E7EB',
                background: activeView === view ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)' : 'white',
                color: activeView === view ? '#7C3AED' : '#6B7280',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {view}
            </button>
          ))}
        </div>

        {loadingData ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            Loading biomarker data...
          </div>
        ) : biomarkers.length === 0 ? (
          <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', padding: '60px', textAlign: 'center', boxShadow: '0 8px 32px rgba(124, 58, 237, 0.08)' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>Voice Analytics</div>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#1F2937', marginBottom: '12px' }}>Start Tracking Your Voice Health</h2>
            <p style={{ color: '#6B7280', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
              Record your first voice sample to begin tracking biomarkers like pitch, clarity, stress levels, and more.
            </p>
            <button
              onClick={() => setShowRecorder(true)}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Record Your First Sample
            </button>
          </div>
        ) : (
          <>
            {activeView === 'overview' && (
              <>
                {/* Quick Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                  {/* Overall Health Score */}
                  <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)', borderRadius: '16px', padding: '24px', color: 'white' }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Health Score</div>
                    <div style={{ fontSize: '36px', fontWeight: '700' }}>
                      {insights?.overallHealthScore || Math.round((latestBiomarker?.clarity || 0) * 0.6 + (100 - (latestBiomarker?.stress || 0)) * 0.4)}
                    </div>
                    {insights?.weeklyImprovement !== undefined && (
                      <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.9 }}>
                        {insights.weeklyImprovement > 0 ? '+' : ''}{insights.weeklyImprovement.toFixed(1)}% this week
                      </div>
                    )}
                  </div>

                  {/* Latest Metrics */}
                  {latestBiomarker && (
                    <>
                      <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '14px', color: '#6B7280' }}>Clarity</span>
                          {previousBiomarker && (
                            <TrendIndicator
                              {...calculateTrend(latestBiomarker.clarity, previousBiomarker.clarity)}
                              isPositive={latestBiomarker.clarity > previousBiomarker.clarity}
                              size="sm"
                              showLabel={false}
                            />
                          )}
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#EC4899' }}>
                          {latestBiomarker.clarity.toFixed(0)}%
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '14px', color: '#6B7280' }}>Stress</span>
                          {previousBiomarker && (
                            <TrendIndicator
                              {...calculateTrend(latestBiomarker.stress, previousBiomarker.stress)}
                              isPositive={latestBiomarker.stress < previousBiomarker.stress}
                              size="sm"
                              showLabel={false}
                            />
                          )}
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: latestBiomarker.stress > 50 ? '#F59E0B' : '#10B981' }}>
                          {latestBiomarker.stress.toFixed(0)}%
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)' }}>
                        <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Recordings</div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#7C3AED' }}>
                          {biomarkers.length}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  <BiomarkerChart
                    data={getChartData('clarity')}
                    metric="clarity"
                    baseline={baseline?.clarity}
                    goal={goals.clarity?.target}
                    normalRange={BIOMARKER_METRICS.clarity?.normalRange}
                  />
                  <BiomarkerChart
                    data={getChartData('stress')}
                    metric="stress"
                    baseline={baseline?.stress}
                    goal={goals.stress?.target}
                    normalRange={BIOMARKER_METRICS.stress?.normalRange}
                  />
                </div>

                {/* Radar and Heatmap Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  {latestBiomarker && (
                    <RadarChart
                      current={latestBiomarker}
                      baseline={baseline || undefined}
                    />
                  )}
                  <HeatmapCalendar
                    data={getHeatmapData()}
                    weeks={12}
                    onDayClick={date => {
                      const sessions = biomarkers.filter(b => b.date.startsWith(date));
                      if (sessions.length > 0) setSelectedSession(sessions[0]);
                    }}
                  />
                </div>

                {/* AI Insights */}
                <div style={{ marginBottom: '32px' }}>
                  <InsightCard
                    insights={insights}
                    loading={loadingInsights}
                    onPlayTTS={handlePlayTTS}
                    onRefresh={fetchInsights}
                  />
                </div>

                {/* Baseline Comparison */}
                <div style={{ marginBottom: '32px' }}>
                  <BaselineComparison
                    baseline={baseline}
                    current={latestBiomarker}
                    onRecalculate={handleRecalculateBaseline}
                    loading={loadingBaseline}
                  />
                </div>
              </>
            )}

            {activeView === 'history' && (
              <SessionList
                sessions={biomarkers}
                onSessionClick={session => setSelectedSession(session)}
                onDeleteSession={handleDeleteSession}
                loading={loadingData}
              />
            )}

            {activeView === 'goals' && (
              <GoalSetter
                currentGoals={goals}
                onSave={handleSaveGoals}
                onGetSuggestions={handleGetSuggestions}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
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

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
