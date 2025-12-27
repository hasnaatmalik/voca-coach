'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

// SVG Icon Components
const CameraIcon = ({ color = '#6B7280', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const MicrophoneIcon = ({ color = '#6B7280', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const CheckIcon = ({ color = '#10B981', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ color = '#EF4444', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface SessionData {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  therapist: {
    id: string;
    name: string;
    email: string;
  };
}

interface PreSessionData {
  moodRating: number;
  concernText: string | null;
  sessionGoals: string | null;
  techCheckPassed: boolean;
}

function PrepareContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [session, setSession] = useState<SessionData | null>(null);
  const [preSessionData, setPreSessionData] = useState<PreSessionData>({
    moodRating: 5,
    concernText: '',
    sessionGoals: '',
    techCheckPassed: false,
  });
  const [previousSummary, setPreviousSummary] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timeUntilSession, setTimeUntilSession] = useState<string>('');
  const [canJoin, setCanJoin] = useState(false);

  // Tech check state
  const [cameraWorking, setCameraWorking] = useState<boolean | null>(null);
  const [micWorking, setMicWorking] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;

    const updateCountdown = () => {
      const now = new Date();
      const sessionTime = new Date(session.scheduledAt);
      const diff = sessionTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilSession('Session is starting now!');
        setCanJoin(true);
      } else if (diff <= 5 * 60 * 1000) {
        // Within 5 minutes
        setCanJoin(true);
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeUntilSession(`Starting in ${mins}:${String(secs).padStart(2, '0')}`);
      } else {
        setCanJoin(false);
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        if (hours > 0) {
          setTimeUntilSession(`${hours}h ${mins}m until session`);
        } else {
          setTimeUntilSession(`${mins} minutes until session`);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/therapy/prepare?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
        if (data.preSessionData) {
          setPreSessionData(data.preSessionData);
        }
        setPreviousSummary(data.previousSummary);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/therapy/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ...preSessionData,
        }),
      });
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const testCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setCameraWorking(true);
    } catch (error) {
      setCameraWorking(false);
    }
  };

  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Simple audio level check
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      setMicWorking(true);
      stream.getTracks().forEach(track => track.stop());
      audioContext.close();
    } catch (error) {
      setMicWorking(false);
    }
  };

  const handleTechCheck = async () => {
    await testCamera();
    await testMicrophone();
    setPreSessionData({ ...preSessionData, techCheckPassed: true });
  };

  const handleJoinSession = () => {
    // Stop any preview streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    handleSave();
    router.push(`/therapy/session/${sessionId}`);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%)' }}>
        <Navbar isAuthenticated={true} userName={user.name} userEmail={user.email} onLogout={logout} />
        <div style={{ padding: '100px', textAlign: 'center', color: '#6B7280' }}>
          Loading session details...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%)' }}>
        <Navbar isAuthenticated={true} userName={user.name} userEmail={user.email} onLogout={logout} />
        <div style={{ padding: '100px', textAlign: 'center', color: '#6B7280' }}>
          Session not found
        </div>
      </div>
    );
  }

  const sessionDate = new Date(session.scheduledAt);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%)' }}>
      <Navbar isAuthenticated={true} userName={user.name} userEmail={user.email} onLogout={logout} />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Session Header */}
        <div style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
          borderRadius: '20px',
          padding: '28px',
          color: 'white',
          marginBottom: '24px',
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
            Upcoming Session with
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
            {session.therapist.name}
          </h1>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Date</div>
              <div style={{ fontWeight: '600' }}>
                {sessionDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Time</div>
              <div style={{ fontWeight: '600' }}>
                {sessionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Duration</div>
              <div style={{ fontWeight: '600' }}>{session.duration} minutes</div>
            </div>
          </div>

          {/* Countdown */}
          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '600',
          }}>
            {timeUntilSession}
          </div>
        </div>

        {/* Mood Check-in */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
            How are you feeling right now?
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="range"
              min="1"
              max="10"
              value={preSessionData.moodRating}
              onChange={(e) => setPreSessionData({ ...preSessionData, moodRating: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#7C3AED' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6B7280' }}>
              <span>1 - Very Low</span>
              <span style={{ fontWeight: '600', color: '#7C3AED', fontSize: '18px' }}>{preSessionData.moodRating}</span>
              <span>10 - Great</span>
            </div>
          </div>
        </div>

        {/* What's on your mind */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '12px' }}>
            What's on your mind today?
          </h2>
          <textarea
            value={preSessionData.concernText || ''}
            onChange={(e) => setPreSessionData({ ...preSessionData, concernText: e.target.value })}
            placeholder="Share what you'd like to discuss in today's session..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '14px',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Session Goals */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '12px' }}>
            Goals for this session
          </h2>
          <textarea
            value={preSessionData.sessionGoals || ''}
            onChange={(e) => setPreSessionData({ ...preSessionData, sessionGoals: e.target.value })}
            placeholder="What do you hope to achieve in today's session?"
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '14px',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Previous Session Summary */}
        {previousSummary && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '12px' }}>
              From Your Last Session
            </h2>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>
              {previousSummary.aiHighlights ? (
                <p>{String(previousSummary.aiHighlights)}</p>
              ) : (
                <p>Your last session notes will appear here.</p>
              )}
            </div>
          </div>
        )}

        {/* Tech Check */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
            Technical Check
          </h2>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              flex: 1,
              padding: '12px',
              background: cameraWorking === null ? '#F3F4F6' : cameraWorking ? '#D1FAE5' : '#FEE2E2',
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>
                {cameraWorking === null ? (
                  <CameraIcon color="#6B7280" size={24} />
                ) : cameraWorking ? (
                  <CheckIcon color="#10B981" size={24} />
                ) : (
                  <XIcon color="#EF4444" size={24} />
                )}
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>Camera</div>
            </div>
            <div style={{
              flex: 1,
              padding: '12px',
              background: micWorking === null ? '#F3F4F6' : micWorking ? '#D1FAE5' : '#FEE2E2',
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>
                {micWorking === null ? (
                  <MicrophoneIcon color="#6B7280" size={24} />
                ) : micWorking ? (
                  <CheckIcon color="#10B981" size={24} />
                ) : (
                  <XIcon color="#EF4444" size={24} />
                )}
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>Microphone</div>
            </div>
          </div>

          {/* Video preview */}
          {cameraWorking && (
            <div style={{
              marginBottom: '16px',
              borderRadius: '10px',
              overflow: 'hidden',
              background: '#000',
            }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
            </div>
          )}

          <button
            onClick={handleTechCheck}
            style={{
              width: '100%',
              padding: '12px',
              background: preSessionData.techCheckPassed ? '#10B981' : '#6B7280',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {preSessionData.techCheckPassed ? (
              <>
                Tech Check Passed
                <CheckIcon color="white" size={16} />
              </>
            ) : (
              'Run Tech Check'
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              padding: '14px',
              background: 'white',
              color: '#7C3AED',
              border: '2px solid #7C3AED',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Progress'}
          </button>
          <button
            onClick={handleJoinSession}
            disabled={!canJoin}
            style={{
              flex: 2,
              padding: '14px',
              background: canJoin ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' : '#D1D5DB',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: canJoin ? 'pointer' : 'not-allowed',
            }}
          >
            {canJoin ? 'Join Session' : 'Session Not Started Yet'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function PreparePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrepareContent />
    </Suspense>
  );
}
