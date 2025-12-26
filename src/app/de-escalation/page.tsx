'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

// De-escalation components
import AudioWaveform from '@/components/de-escalation/AudioWaveform';
import BiometricsPanel from '@/components/de-escalation/BiometricsPanel';
import BreathingExercise from '@/components/de-escalation/BreathingExercise';
import TechniqueLibrary from '@/components/de-escalation/TechniqueLibrary';
import TranscriptViewer from '@/components/de-escalation/TranscriptViewer';
import ProgressDashboard from '@/components/de-escalation/ProgressDashboard';
import AmbientSoundMixer from '@/components/de-escalation/AmbientSoundMixer';
import CrisisAlertEnhanced from '@/components/de-escalation/CrisisAlertEnhanced';
import VoiceSelector from '@/components/de-escalation/VoiceSelector';
import ScenarioPractice from '@/components/de-escalation/ScenarioPractice';

// Bento components
import {
  DeEscalationHero,
  SessionCard,
  StressIndicator,
  QuickTipsGrid,
  TechniqueCard,
  ProgressView,
} from '@/components/de-escalation/bento';

// Types
import {
  VoiceBiomarkers,
  TranscriptSegment,
  AIIntervention,
  DeEscalationTechnique,
  BreathingPattern,
  CrisisDetectionResult,
} from '@/types/de-escalation';

interface SentimentData {
  timestamp: number;
  sentiment: string;
  intensity: number;
  emotions: {
    happy: number;
    sad: number;
    anxious: number;
    calm: number;
    neutral: number;
    frustrated: number;
  };
  aiInsight?: string;
}

type ViewMode = 'session' | 'techniques' | 'progress';

export default function DeEscalationPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Core state
  const [isRecording, setIsRecording] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [profilePic, setProfilePic] = useState<string>();
  const [viewMode, setViewMode] = useState<ViewMode>('session');

  // Biomarkers & Analysis
  const [biomarkers, setBiomarkers] = useState<VoiceBiomarkers | null>(null);
  const [biomarkersHistory, setBiomarkersHistory] = useState<VoiceBiomarkers[]>([]);
  const [stressLevel, setStressLevel] = useState(0.3);
  const [highStressStartTime, setHighStressStartTime] = useState<number | null>(null);

  // Transcript
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);

  // AI Coaching
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [aiInterventions, setAiInterventions] = useState<AIIntervention[]>([]);

  // Breathing Exercise
  const [activeBreathingPattern, setActiveBreathingPattern] = useState<BreathingPattern | null>(null);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdAfter' | null>(null);
  const [activeTechniqueId, setActiveTechniqueId] = useState<string | null>(null);

  // Crisis Detection
  const [crisisDetection, setCrisisDetection] = useState<CrisisDetectionResult | null>(null);

  // Recording Consent
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [moodBefore, setMoodBefore] = useState<number>(5);

  // Scenario Practice
  const [showScenarioPractice, setShowScenarioPractice] = useState(false);

  // Voice Settings
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>('21m00Tcm4TlvDq8ikWAM');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Sentiment (legacy compatibility)
  const [sentimentHistory, setSentimentHistory] = useState<SentimentData[]>([]);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const biomarkerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Biomarker analysis every 10 seconds (reduced to avoid rate limits)
  useEffect(() => {
    if (isRecording && !activeBreathingPattern) {
      biomarkerIntervalRef.current = setInterval(() => {
        if (audioChunksRef.current.length >= 5) {
          analyzeBiomarkers();
        }
      }, 10000);
    }

    return () => {
      if (biomarkerIntervalRef.current) {
        clearInterval(biomarkerIntervalRef.current);
      }
    };
  }, [isRecording, activeBreathingPattern]);

  // Independent transcription every 15 seconds using only NEW audio chunks
  const lastTranscribedChunkIndex = useRef<number>(0);
  useEffect(() => {
    if (!isRecording) {
      lastTranscribedChunkIndex.current = 0;
      return;
    }

    const transcriptionInterval = setInterval(() => {
      const newChunksCount = audioChunksRef.current.length - lastTranscribedChunkIndex.current;
      if (newChunksCount >= 3) {
        performTranscription();
        lastTranscribedChunkIndex.current = audioChunksRef.current.length;
      }
    }, 15000);

    return () => clearInterval(transcriptionInterval);
  }, [isRecording]);

  // AI Coaching interrupt when stress is high for 10+ seconds
  useEffect(() => {
    if (isRecording && stressLevel > 0.6) {
      if (!highStressStartTime) {
        setHighStressStartTime(Date.now());
      } else if (Date.now() - highStressStartTime > 10000 && !isPlayingAudio && !activeBreathingPattern) {
        triggerCoachingInterrupt();
        setHighStressStartTime(null);
      }
    } else {
      setHighStressStartTime(null);
    }
  }, [stressLevel, isRecording, highStressStartTime, isPlayingAudio, activeBreathingPattern]);

  // Periodic encouraging check-in every 30 seconds
  const lastCheckInRef = useRef<number>(0);
  useEffect(() => {
    if (!isRecording) {
      lastCheckInRef.current = 0;
      return;
    }

    const checkInInterval = setInterval(() => {
      const now = Date.now();
      if (!isPlayingAudio && !activeBreathingPattern && now - lastCheckInRef.current > 25000) {
        lastCheckInRef.current = now;
        triggerPeriodicCheckIn();
      }
    }, 20000);

    return () => clearInterval(checkInInterval);
  }, [isRecording, isPlayingAudio, activeBreathingPattern]);

  const getStressColor = useCallback((level: number) => {
    if (level < 0.3) return '#7AB89E';
    if (level < 0.5) return '#E4B17A';
    if (level < 0.7) return '#F97316';
    return '#EF4444';
  }, []);

  const getStressLabel = useCallback((level: number) => {
    if (level < 0.3) return 'Calm';
    if (level < 0.5) return 'Moderate';
    if (level < 0.7) return 'Elevated';
    return 'High Stress';
  }, []);

  // Start recording session
  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setSessionTime(0);
      setAiResponse(null);
      setSessionSaved(false);
      setBiomarkers(null);
      setBiomarkersHistory([]);
      setTranscriptSegments([]);
      setAiInterventions([]);
      setSentimentHistory([]);
      setStressLevel(0.3);
      setCrisisDetection(null);
      sessionIdRef.current = `session-${Date.now()}`;
    } catch (error) {
      console.error('Failed to access microphone:', error);
      alert('Please allow microphone access to start a session.');
    }
  };

  // Stop recording session
  const stopSession = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);

    if (audioChunksRef.current.length > 0) {
      await analyzeFullSession();
    }
  };

  // Analyze voice biomarkers
  const analyzeBiomarkers = async () => {
    if (audioChunksRef.current.length < 5) return;

    try {
      const firstChunk = audioChunksRef.current[0];
      const recentChunks = audioChunksRef.current.slice(-5);
      const chunksToAnalyze = [firstChunk, ...recentChunks.filter(c => c !== firstChunk)];
      const audioBlob = new Blob(chunksToAnalyze, { type: 'audio/webm' });
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        try {
          const res = await fetch('/api/de-escalation/analyze-biomarkers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: base64Audio, timestamp: sessionTime }),
          });

          if (res.ok) {
            const data: VoiceBiomarkers = await res.json();
            setBiomarkers(data);
            setBiomarkersHistory((prev) => [...prev, data]);
            setStressLevel(data.overallStressScore);

            if (data.recommendations) {
              checkForCrisis(data.recommendations.join(' '));
            }
          }
        } catch (error) {
          console.error('Biomarker analysis error:', error);
        }
      };

      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Failed to prepare audio for analysis:', error);
    }
  };

  // Perform transcription using only NEW audio chunks
  const performTranscription = async () => {
    try {
      const startIndex = lastTranscribedChunkIndex.current;
      const newChunks = audioChunksRef.current.slice(startIndex);

      if (newChunks.length < 2) return;

      const firstChunk = audioChunksRef.current[0];
      const chunksToTranscribe = startIndex === 0
        ? newChunks
        : [firstChunk, ...newChunks];

      const audioBlob = new Blob(chunksToTranscribe, { type: 'audio/webm' });
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        await transcribeAudio(base64Audio);
      };

      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Failed to prepare audio for transcription:', error);
    }
  };

  // Transcribe audio with emotion tagging
  const transcribeAudio = async (base64Audio: string) => {
    try {
      const res = await fetch('/api/de-escalation/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio, timestamp: sessionTime }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.segments && data.segments.length > 0) {
          setTranscriptSegments((prev) => [...prev, ...data.segments]);
          checkForCrisis(data.text);
        }
      }
    } catch (error) {
      console.error('Transcription error:', error);
    }
  };

  // Check for crisis indicators
  const checkForCrisis = async (text: string) => {
    try {
      const res = await fetch('/api/de-escalation/crisis-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sessionId: sessionIdRef.current }),
      });

      if (res.ok) {
        const result: CrisisDetectionResult = await res.json();
        if (result.isCrisis) {
          setCrisisDetection(result);
          if (result.shouldPauseSession) {
            triggerCrisisIntervention(result);
          }
        }
      }
    } catch (error) {
      console.error('Crisis detection error:', error);
    }
  };

  // Periodic check-in messages
  const triggerPeriodicCheckIn = async () => {
    if (isPlayingAudio) return;

    const checkInMessages = [
      "You're doing great. Keep expressing yourself freely.",
      "Nice steady pace. Remember, this is your safe space.",
      "I'm here listening. Take your time.",
      "You're making good progress. How are you feeling?",
      "Remember to breathe naturally as you speak.",
    ];

    const message = checkInMessages[Math.floor(Math.random() * checkInMessages.length)];

    const intervention: AIIntervention = {
      id: `checkin-${Date.now()}`,
      timestamp: sessionTime,
      type: 'coaching',
      message,
      triggerReason: 'Periodic check-in',
    };

    setAiInterventions((prev) => [...prev, intervention]);
    await playAIResponse(message);
  };

  // Trigger AI coaching interrupt
  const triggerCoachingInterrupt = async () => {
    if (isPlayingAudio) return;

    const coachingMessages = [
      "I notice some tension rising. Let's take a slow breath together.",
      "You're doing well. Let's pause for a calming breath.",
      "Take a moment to slow down. Breathe in... and out...",
      "I'm here with you. Let's ground ourselves with a deep breath.",
    ];

    const message = coachingMessages[Math.floor(Math.random() * coachingMessages.length)];

    const intervention: AIIntervention = {
      id: `int-${Date.now()}`,
      timestamp: sessionTime,
      type: 'coaching',
      message,
      triggerReason: 'High stress detected for 10+ seconds',
    };

    setAiInterventions((prev) => [...prev, intervention]);
    await playAIResponse(message);
  };

  // Trigger crisis intervention
  const triggerCrisisIntervention = async (detection: CrisisDetectionResult) => {
    const intervention: AIIntervention = {
      id: `crisis-${Date.now()}`,
      timestamp: sessionTime,
      type: 'crisis',
      message: 'Crisis support resources are available for you.',
      triggerReason: `Crisis detected: ${detection.triggers.join(', ')}`,
    };

    setAiInterventions((prev) => [...prev, intervention]);
  };

  // Full session analysis at end
  const analyzeFullSession = async () => {
    setIsAnalyzing(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        try {
          const res = await fetch('/api/analyze-tone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: base64Audio }),
          });

          if (res.ok) {
            const data = await res.json();
            const responseText = data.text || "Great session! You practiced staying calm and managing your stress. Remember to use these techniques throughout your day.";
            setAiResponse(responseText);
            await playAIResponse(responseText);
          } else {
            setAiResponse("Good work on completing this session. Remember: consistent practice builds resilience.");
          }
        } catch {
          setAiResponse("Session complete. Every practice session brings you closer to mastery.");
        }
        setIsAnalyzing(false);
      };

      reader.readAsDataURL(audioBlob);
    } catch {
      setIsAnalyzing(false);
    }
  };

  // Play TTS response
  const playAIResponse = async (text: string) => {
    try {
      setIsPlayingAudio(true);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceStability: 0.7,
          voiceSimilarity: 0.8,
        }),
      });

      if (res.ok) {
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.pause();
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlayingAudio(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          setIsPlayingAudio(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
      } else {
        setIsPlayingAudio(false);
      }
    } catch (error) {
      console.error('TTS playback error:', error);
      setIsPlayingAudio(false);
    }
  };

  // Save session
  const saveSession = async () => {
    if (sessionSaved) return;
    setIsSaving(true);

    try {
      const avgStress = biomarkersHistory.length > 0
        ? biomarkersHistory.reduce((sum, b) => sum + b.overallStressScore, 0) / biomarkersHistory.length
        : stressLevel;

      const peakStress = biomarkersHistory.length > 0
        ? Math.max(...biomarkersHistory.map((b) => b.overallStressScore))
        : stressLevel;

      const techniquesUsed = activeTechniqueId ? [activeTechniqueId] : [];

      const res = await fetch('/api/de-escalation/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration: sessionTime,
          averageStress: avgStress,
          peakStress: peakStress,
          techniquesUsed,
          transcript: transcriptSegments,
          biomarkers: biomarkersHistory,
          aiInterventions: aiInterventions,
          moodBefore: moodBefore,
          crisisDetected: crisisDetection?.isCrisis || false,
        }),
      });

      if (res.ok) {
        setSessionSaved(true);
      } else {
        const fallbackRes = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            duration: sessionTime,
            calmScore: Math.round((1 - avgStress) * 100),
            notes: aiResponse || null,
            sentiments: sentimentHistory,
          }),
        });
        if (fallbackRes.ok) {
          setSessionSaved(true);
        }
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle breathing exercise
  const handleStartTechnique = (technique: DeEscalationTechnique) => {
    setActiveTechniqueId(technique.id);

    if (technique.type === 'breathing') {
      const patternMap: Record<string, BreathingPattern> = {
        'box-breathing': 'box',
        '478-breathing': '478',
        'physiological-sigh': 'physiological',
      };
      const pattern = patternMap[technique.id];
      if (pattern) {
        setActiveBreathingPattern(pattern);
      }
    }
  };

  const handleBreathingComplete = () => {
    setActiveBreathingPattern(null);
    setBreathingPhase(null);
    setActiveTechniqueId(null);

    const intervention: AIIntervention = {
      id: `breathing-${Date.now()}`,
      timestamp: sessionTime,
      type: 'breathing',
      message: 'Breathing exercise completed',
      triggerReason: 'User completed breathing exercise',
    };
    setAiInterventions((prev) => [...prev, intervention]);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Waveform component for SessionCard
  const waveformComponent = (
    <AudioWaveform
      analyserNode={analyserRef.current}
      stressLevel={stressLevel}
      isRecording={isRecording}
      showBreathingGuide={!!activeBreathingPattern}
      breathingPhase={breathingPhase}
      darkMode={false}
    />
  );

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
        currentPage="/de-escalation"
      />

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Immersive Hero Header */}
        <DeEscalationHero
          isRecording={isRecording}
          sessionTime={sessionTime}
          stressLevel={stressLevel}
          onViewModeChange={setViewMode}
          currentViewMode={viewMode}
          onOpenScenarios={() => setShowScenarioPractice(true)}
          onOpenVoiceSettings={() => setShowVoiceSettings(true)}
        />

        {/* Crisis Alert */}
        <AnimatePresence>
          {crisisDetection && crisisDetection.isCrisis && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ marginBottom: '24px' }}
            >
              <CrisisAlertEnhanced
                detection={crisisDetection}
                onDismiss={() => setCrisisDetection(null)}
                darkMode={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content based on View Mode */}
        <AnimatePresence mode="wait">
          {viewMode === 'session' && (
            <motion.div
              key="session-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
                gap: '24px',
              }}
            >
              {/* Left Column - Main Session */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Breathing Exercise Overlay */}
                <AnimatePresence>
                  {activeBreathingPattern && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <BreathingExercise
                        pattern={activeBreathingPattern}
                        onComplete={handleBreathingComplete}
                        onCancel={() => {
                          setActiveBreathingPattern(null);
                          setBreathingPhase(null);
                          setActiveTechniqueId(null);
                        }}
                        onPhaseChange={setBreathingPhase}
                        darkMode={false}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Session Recording Card */}
                {!activeBreathingPattern && (
                  <SessionCard
                    isRecording={isRecording}
                    sessionTime={sessionTime}
                    stressLevel={stressLevel}
                    moodBefore={moodBefore}
                    onMoodChange={setMoodBefore}
                    onStartSession={startSession}
                    onStopSession={stopSession}
                    onSaveSession={saveSession}
                    isSaving={isSaving}
                    sessionSaved={sessionSaved}
                    recordingConsent={recordingConsent}
                    onConsentChange={setRecordingConsent}
                    waveformComponent={waveformComponent}
                    isPlayingAudio={isPlayingAudio}
                  />
                )}

                {/* Live Transcript */}
                <AnimatePresence>
                  {(isRecording || transcriptSegments.length > 0) && !activeBreathingPattern && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <TranscriptViewer
                        segments={transcriptSegments}
                        isLive={isRecording}
                        currentTimestamp={sessionTime}
                        darkMode={false}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* AI Response */}
                <AnimatePresence>
                  {isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        padding: '32px',
                        border: '1px solid #DCC5B2',
                        textAlign: 'center',
                      }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}
                      >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D9A299" strokeWidth="2">
                          <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
                          <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
                          <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
                          <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
                          <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
                          <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
                          <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
                          <path d="M6 18a4 4 0 0 1-1.967-.516" />
                          <path d="M19.967 17.484A4 4 0 0 1 18 18" />
                        </svg>
                      </motion.div>
                      <p style={{ color: '#6B6B6B', margin: 0 }}>Analyzing your session...</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {aiResponse && !isAnalyzing && !isRecording && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(122, 184, 158, 0.15) 0%, rgba(217, 162, 153, 0.15) 100%)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '24px',
                      padding: '28px',
                      border: '1px solid rgba(122, 184, 158, 0.3)',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7AB89E" strokeWidth="2">
                          <circle cx="12" cy="6" r="3" />
                          <path d="M12 9v3" />
                          <path d="M6 15c0-2 1.5-3 3-3h6c1.5 0 3 1 3 3" />
                          <path d="M4 20c0-1.5 1-3 4-3h8c3 0 4 1.5 4 3" />
                          <path d="M9 21v-2" />
                          <path d="M15 21v-2" />
                        </svg>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#2D2D2D',
                          margin: 0,
                        }}>
                          AI Coach Summary
                        </h3>
                      </div>
                      {isPlayingAudio && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            padding: '6px 14px',
                            background: '#7AB89E',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            style={{ display: 'flex', alignItems: 'center' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            </svg>
                          </motion.span>
                          Playing
                        </motion.span>
                      )}
                    </div>

                    <p style={{
                      fontSize: '15px',
                      color: '#4B5563',
                      lineHeight: 1.7,
                      fontStyle: 'italic',
                      margin: '0 0 20px 0',
                    }}>
                      "{aiResponse}"
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => playAIResponse(aiResponse)}
                      disabled={isPlayingAudio}
                      style={{
                        padding: '12px 24px',
                        background: isPlayingAudio
                          ? '#9CA3AF'
                          : 'linear-gradient(135deg, #7AB89E 0%, #10B981 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '14px',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: isPlayingAudio ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: isPlayingAudio ? 'none' : '0 4px 16px rgba(122, 184, 158, 0.3)',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </svg>
                      {isPlayingAudio ? 'Playing...' : 'Play Audio'}
                    </motion.button>
                  </motion.div>
                )}

                {/* Quick Tips */}
                {!isRecording && !aiResponse && !isAnalyzing && !activeBreathingPattern && (
                  <QuickTipsGrid
                    stressLevel={stressLevel}
                    onTechniqueSelect={(technique) => console.log('Selected:', technique)}
                  />
                )}
              </div>

              {/* Right Column - Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Stress Indicator */}
                <StressIndicator
                  stressLevel={stressLevel}
                  isRecording={isRecording}
                  showDetails={true}
                />

                {/* Biomarkers Panel */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <BiometricsPanel
                    biomarkers={biomarkers}
                    isLive={isRecording}
                    darkMode={false}
                  />
                </motion.div>

                {/* Quick Techniques */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <TechniqueLibrary
                    onStartTechnique={handleStartTechnique}
                    activeTechniqueId={activeTechniqueId}
                    darkMode={false}
                    compact={true}
                  />
                </motion.div>

                {/* Ambient Sound Mixer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <AmbientSoundMixer
                    darkMode={false}
                    compact={true}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {viewMode === 'techniques' && (
            <motion.div
              key="techniques-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '24px',
              }}
            >
              <TechniqueCard
                currentStressLevel={stressLevel}
                onSelectTechnique={(technique) => {
                  setViewMode('session');
                  handleStartTechnique({
                    id: technique.id,
                    name: technique.name,
                    description: technique.description,
                    type: technique.category === 'breathing' ? 'breathing' : 'grounding',
                    duration: parseInt(technique.duration) || 3,
                    icon: '',
                    steps: technique.steps,
                  });
                }}
              />

              <TechniqueLibrary
                onStartTechnique={(technique) => {
                  setViewMode('session');
                  handleStartTechnique(technique);
                }}
                activeTechniqueId={activeTechniqueId}
                darkMode={false}
              />
            </motion.div>
          )}

          {viewMode === 'progress' && (
            <motion.div
              key="progress-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProgressView
                stats={{
                  totalSessions: 24,
                  totalMinutes: 186,
                  avgStressReduction: 32,
                  currentStreak: 5,
                  longestStreak: 12,
                  favoriteTechnique: 'Box Breathing',
                }}
                recentSessions={[
                  {
                    id: '1',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    duration: 480,
                    stressReduction: 35,
                    techniques: ['Box Breathing', 'Grounding'],
                    moodBefore: 4,
                    moodAfter: 7,
                  },
                  {
                    id: '2',
                    date: new Date(Date.now() - 172800000).toISOString(),
                    duration: 360,
                    stressReduction: 28,
                    techniques: ['4-7-8 Breathing'],
                    moodBefore: 5,
                    moodAfter: 8,
                  },
                  {
                    id: '3',
                    date: new Date(Date.now() - 259200000).toISOString(),
                    duration: 600,
                    stressReduction: 42,
                    techniques: ['Box Breathing', 'Body Scan'],
                    moodBefore: 3,
                    moodAfter: 7,
                  },
                ]}
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ marginTop: '24px' }}
              >
                <ProgressDashboard darkMode={false} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scenario Practice Modal */}
        <AnimatePresence>
          {showScenarioPractice && (
            <ScenarioPractice
              onClose={() => setShowScenarioPractice(false)}
              onComplete={(scenarioId, score) => {
                console.log(`Completed scenario ${scenarioId} with score ${score}`);
                setShowScenarioPractice(false);
              }}
              voiceId={selectedVoiceId || undefined}
              darkMode={false}
            />
          )}
        </AnimatePresence>

        {/* Voice Settings Modal */}
        <AnimatePresence>
          {showVoiceSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
              }}
              onClick={() => setShowVoiceSettings(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  width: '100%',
                  maxWidth: '450px',
                  maxHeight: '90vh',
                  overflow: 'auto',
                  position: 'relative',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowVoiceSettings(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: '#FAF7F3',
                    border: 'none',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#6B6B6B',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </motion.button>
                <VoiceSelector
                  selectedVoiceId={selectedVoiceId}
                  onVoiceSelect={(voiceId) => setSelectedVoiceId(voiceId)}
                  onSave={(voiceId) => {
                    setSelectedVoiceId(voiceId);
                    setShowVoiceSettings(false);
                  }}
                  darkMode={false}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

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
