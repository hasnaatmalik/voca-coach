'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  const [darkMode, setDarkMode] = useState(false);
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

  // Colors based on dark mode
  const bgColor = darkMode ? '#111827' : '#F8FAFC';
  const cardBg = darkMode ? '#1F2937' : 'white';
  const textColor = darkMode ? '#F9FAFB' : '#1F2937';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = darkMode ? '#374151' : '#E5E7EB';

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
    }, 15000); // Reduced frequency to avoid rate limits

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

    // First check-in after 20 seconds, then every 30 seconds
    const checkInInterval = setInterval(() => {
      const now = Date.now();
      // Ensure at least 25 seconds between check-ins and not playing audio
      if (!isPlayingAudio && !activeBreathingPattern && now - lastCheckInRef.current > 25000) {
        lastCheckInRef.current = now;
        triggerPeriodicCheckIn();
      }
    }, 20000);

    return () => clearInterval(checkInInterval);
  }, [isRecording, isPlayingAudio, activeBreathingPattern]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStressColor = useCallback((level: number) => {
    if (level < 0.3) return '#10B981';
    if (level < 0.5) return '#F59E0B';
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

      // Set up Web Audio API for visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Set up MediaRecorder
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

    // Final analysis
    if (audioChunksRef.current.length > 0) {
      await analyzeFullSession();
    }
  };

  // Analyze voice biomarkers
  const analyzeBiomarkers = async () => {
    if (audioChunksRef.current.length < 5) return;

    try {
      // WebM requires the first chunk (contains headers) + recent chunks for valid audio
      const firstChunk = audioChunksRef.current[0];
      const recentChunks = audioChunksRef.current.slice(-5);
      // Combine first chunk (headers) with recent audio data
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

            // Check for crisis keywords in recommendations
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

  // Perform transcription using only NEW audio chunks (with header from first chunk)
  const performTranscription = async () => {
    try {
      // Get chunks from last transcribed position
      const startIndex = lastTranscribedChunkIndex.current;
      const newChunks = audioChunksRef.current.slice(startIndex);

      if (newChunks.length < 2) return;

      // Include first chunk (headers) + new chunks for valid WebM
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

          // Check transcript for crisis keywords
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
            // Don't auto-stop, but show prominent alert
            triggerCrisisIntervention(result);
          }
        }
      }
    } catch (error) {
      console.error('Crisis detection error:', error);
    }
  };

  // Periodic check-in messages (encouraging, not stress-based)
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

      // Get techniques used from active technique history
      const techniquesUsed = activeTechniqueId ? [activeTechniqueId] : [];

      // Save to de-escalation sessions endpoint
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
        // Fallback to general sessions API
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

  if (loading || !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bgColor,
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
          <div style={{ color: mutedColor }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bgColor }}>
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
        {/* Header with View Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: textColor,
              marginBottom: '4px',
            }}>
              De-Escalation Training
            </h1>
            <p style={{ color: mutedColor, margin: 0 }}>
              Practice calming techniques with real-time voice analysis
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* View Mode Toggle */}
            <div style={{
              display: 'flex',
              background: darkMode ? '#374151' : '#F3F4F6',
              borderRadius: '10px',
              padding: '4px',
            }}>
              {(['session', 'techniques', 'progress'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: '8px 16px',
                    background: viewMode === mode
                      ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
                      : 'transparent',
                    color: viewMode === mode ? 'white' : textColor,
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Scenario Practice Button */}
            <button
              onClick={() => setShowScenarioPractice(true)}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🎭</span>
              Scenarios
            </button>

            {/* Voice Settings Button */}
            <button
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              style={{
                padding: '10px',
                background: showVoiceSettings ? '#7C3AED' : (darkMode ? '#374151' : '#F3F4F6'),
                color: showVoiceSettings ? 'white' : textColor,
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '18px',
              }}
              title="Voice Settings"
            >
              🎙️
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                padding: '10px',
                background: darkMode ? '#374151' : '#F3F4F6',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Crisis Alert */}
        {crisisDetection && crisisDetection.isCrisis && (
          <div style={{ marginBottom: '24px' }}>
            <CrisisAlertEnhanced
              detection={crisisDetection}
              onDismiss={() => setCrisisDetection(null)}
              darkMode={darkMode}
            />
          </div>
        )}

        {/* Main Content based on View Mode */}
        {viewMode === 'session' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: '24px',
          }}>
            {/* Left Column - Main Session */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Breathing Exercise Overlay */}
              {activeBreathingPattern && (
                <BreathingExercise
                  pattern={activeBreathingPattern}
                  onComplete={handleBreathingComplete}
                  onCancel={() => {
                    setActiveBreathingPattern(null);
                    setBreathingPhase(null);
                    setActiveTechniqueId(null);
                  }}
                  onPhaseChange={setBreathingPhase}
                  darkMode={darkMode}
                />
              )}

              {/* Recording Card */}
              {!activeBreathingPattern && (
                <div style={{
                  background: cardBg,
                  borderRadius: '20px',
                  padding: '32px',
                  border: `1px solid ${borderColor}`,
                }}>
                  {/* Audio Waveform */}
                  <AudioWaveform
                    analyserNode={analyserRef.current}
                    stressLevel={stressLevel}
                    isRecording={isRecording}
                    showBreathingGuide={!!activeBreathingPattern}
                    breathingPhase={breathingPhase}
                    darkMode={darkMode}
                  />

                  {/* Session Timer & Controls */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '24px',
                  }}>
                    <div>
                      <div style={{
                        fontSize: '36px',
                        fontWeight: '700',
                        color: textColor,
                        fontFamily: 'monospace',
                      }}>
                        {formatTime(sessionTime)}
                      </div>
                      {isRecording && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '4px',
                        }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: getStressColor(stressLevel),
                          }} />
                          <span style={{
                            fontSize: '14px',
                            color: getStressColor(stressLevel),
                            fontWeight: '500',
                          }}>
                            {getStressLabel(stressLevel)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      {!isRecording ? (
                        <>
                          {/* Mood Check Before Session */}
                          {!sessionSaved && sessionTime === 0 && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginRight: '16px',
                            }}>
                              <span style={{ fontSize: '13px', color: mutedColor }}>
                                Mood:
                              </span>
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={moodBefore}
                                onChange={(e) => setMoodBefore(parseInt(e.target.value))}
                                style={{ width: '80px' }}
                              />
                              <span style={{ fontSize: '13px', color: textColor }}>
                                {moodBefore}
                              </span>
                            </div>
                          )}

                          <button
                            onClick={startSession}
                            style={{
                              padding: '14px 32px',
                              background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '12px',
                              fontWeight: '600',
                              fontSize: '16px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <span>🎙️</span>
                            Start Session
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={stopSession}
                          style={{
                            padding: '14px 32px',
                            background: '#EF4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '600',
                            fontSize: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <span>⏹️</span>
                          End Session
                        </button>
                      )}

                      {!isRecording && sessionTime > 0 && !sessionSaved && (
                        <button
                          onClick={saveSession}
                          disabled={isSaving}
                          style={{
                            padding: '14px 32px',
                            background: isSaving ? '#9CA3AF' : '#10B981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '600',
                            fontSize: '16px',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isSaving ? 'Saving...' : 'Save Session'}
                        </button>
                      )}

                      {sessionSaved && (
                        <span style={{
                          padding: '14px 20px',
                          color: '#10B981',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          ✓ Saved!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recording Consent Toggle */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '16px',
                    padding: '12px',
                    background: darkMode ? '#111827' : '#F9FAFB',
                    borderRadius: '10px',
                  }}>
                    <input
                      type="checkbox"
                      id="consent"
                      checked={recordingConsent}
                      onChange={(e) => setRecordingConsent(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label
                      htmlFor="consent"
                      style={{ fontSize: '13px', color: mutedColor, cursor: 'pointer' }}
                    >
                      Save session recording for playback
                    </label>
                  </div>
                </div>
              )}

              {/* Live Transcript */}
              {(isRecording || transcriptSegments.length > 0) && !activeBreathingPattern && (
                <TranscriptViewer
                  segments={transcriptSegments}
                  isLive={isRecording}
                  currentTimestamp={sessionTime}
                  darkMode={darkMode}
                />
              )}

              {/* AI Response */}
              {isAnalyzing && (
                <div style={{
                  background: cardBg,
                  borderRadius: '16px',
                  padding: '24px',
                  border: `1px solid ${borderColor}`,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '12px' }}>🤔</div>
                  <p style={{ color: mutedColor }}>Analyzing your session...</p>
                </div>
              )}

              {aiResponse && !isAnalyzing && !isRecording && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>🧘</span>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: textColor,
                        margin: 0,
                      }}>
                        AI Coach Summary
                      </h3>
                    </div>
                    {isPlayingAudio && (
                      <span style={{
                        padding: '4px 10px',
                        background: '#10B981',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'white',
                      }}>
                        🔊 Playing
                      </span>
                    )}
                  </div>

                  <p style={{
                    fontSize: '15px',
                    color: darkMode ? '#D1D5DB' : '#4B5563',
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                    margin: '0 0 16px 0',
                  }}>
                    "{aiResponse}"
                  </p>

                  <button
                    onClick={() => playAIResponse(aiResponse)}
                    disabled={isPlayingAudio}
                    style={{
                      padding: '10px 20px',
                      background: isPlayingAudio ? '#9CA3AF' : '#10B981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: isPlayingAudio ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>🔊</span>
                    {isPlayingAudio ? 'Playing...' : 'Play Audio'}
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Biomarkers Panel */}
              <BiometricsPanel
                biomarkers={biomarkers}
                isLive={isRecording}
                darkMode={darkMode}
              />

              {/* Quick Techniques */}
              <TechniqueLibrary
                onStartTechnique={handleStartTechnique}
                activeTechniqueId={activeTechniqueId}
                darkMode={darkMode}
                compact={true}
              />

              {/* Ambient Sound Mixer */}
              <AmbientSoundMixer
                darkMode={darkMode}
                compact={true}
              />

              {/* Quick Progress */}
              <ProgressDashboard
                darkMode={darkMode}
                compact={true}
              />
            </div>
          </div>
        )}

        {viewMode === 'techniques' && (
          <TechniqueLibrary
            onStartTechnique={(technique) => {
              setViewMode('session');
              handleStartTechnique(technique);
            }}
            activeTechniqueId={activeTechniqueId}
            darkMode={darkMode}
          />
        )}

        {viewMode === 'progress' && (
          <ProgressDashboard darkMode={darkMode} />
        )}

        {/* Quick Tips (shown when not recording and no response) */}
        {viewMode === 'session' && !isRecording && !aiResponse && !isAnalyzing && !activeBreathingPattern && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '24px',
          }}>
            {[
              { icon: '🫁', title: 'Breathe', desc: 'Deep breaths lower stress hormones' },
              { icon: '🐢', title: 'Slow Down', desc: 'Speak 20% slower than normal' },
              { icon: '👂', title: 'Pause', desc: 'Take 2-second pauses between thoughts' },
              { icon: '🌍', title: 'Ground', desc: 'Notice 5 things you can see around you' },
            ].map((tip, i) => (
              <div
                key={i}
                style={{
                  background: cardBg,
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'center',
                  border: `1px solid ${borderColor}`,
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{tip.icon}</div>
                <div style={{ fontWeight: '600', color: textColor, marginBottom: '4px' }}>
                  {tip.title}
                </div>
                <div style={{ fontSize: '13px', color: mutedColor }}>{tip.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Scenario Practice Modal */}
        {showScenarioPractice && (
          <ScenarioPractice
            onClose={() => setShowScenarioPractice(false)}
            onComplete={(scenarioId, score) => {
              console.log(`Completed scenario ${scenarioId} with score ${score}`);
              setShowScenarioPractice(false);
            }}
            voiceId={selectedVoiceId || undefined}
            darkMode={darkMode}
          />
        )}

        {/* Voice Settings Modal */}
        {showVoiceSettings && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}>
            <div style={{
              background: darkMode ? '#1F2937' : 'white',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '450px',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
            }}>
              <button
                onClick={() => setShowVoiceSettings(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: mutedColor,
                  zIndex: 1,
                }}
              >
                ×
              </button>
              <VoiceSelector
                selectedVoiceId={selectedVoiceId}
                onVoiceSelect={(voiceId) => setSelectedVoiceId(voiceId)}
                onSave={(voiceId) => {
                  setSelectedVoiceId(voiceId);
                  setShowVoiceSettings(false);
                }}
                darkMode={darkMode}
              />
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          main > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
