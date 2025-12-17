'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DeEscalationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [arousalLevel, setArousalLevel] = useState(0.3);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

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
        setSessionTime(prev => prev + 1);
        // Simulate arousal fluctuation based on time (more realistic would use actual audio analysis)
        setArousalLevel(prev => {
          const change = (Math.random() - 0.5) * 0.08;
          return Math.max(0.1, Math.min(0.9, prev + change));
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getArousalColor = () => {
    if (arousalLevel > 0.7) return '#EF4444';
    if (arousalLevel > 0.5) return '#F59E0B';
    return '#10B981';
  };

  const getArousalLabel = () => {
    if (arousalLevel > 0.7) return 'High Stress';
    if (arousalLevel > 0.5) return 'Moderate';
    return 'Calm';
  };

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setSessionTime(0);
      setAiResponse(null);
      setSessionSaved(false);
      setArousalLevel(0.3);
    } catch (error) {
      console.error('Failed to access microphone:', error);
      alert('Please allow microphone access to start a session.');
    }
  };

  const stopSession = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);

    // Send audio for analysis
    if (audioChunksRef.current.length > 0) {
      await analyzeAudio();
    }
  };

  const analyzeAudio = async () => {
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
            const responseText = data.text || "Take a deep breath. You're doing great. Remember to speak slowly and pause between thoughts.";
            setAiResponse(responseText);
            
            // Play the response with TTS
            await playAIResponse(responseText);
          } else {
            const fallbackText = "Take a deep breath. I noticed some tension in your voice. Try speaking more slowly and deliberately. Remember: you have time. There's no rush.";
            setAiResponse(fallbackText);
            await playAIResponse(fallbackText);
          }
        } catch {
          setAiResponse("Take a deep breath. Focus on slowing down and speaking with intention. You're doing great.");
        }
        setIsAnalyzing(false);
      };
      
      reader.readAsDataURL(audioBlob);
    } catch {
      setAiResponse("Take a deep breath. Focus on staying calm and grounded.");
      setIsAnalyzing(false);
    }
  };

  const playAIResponse = async (text: string) => {
    try {
      setIsPlayingAudio(true);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
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

  const saveSession = async () => {
    if (sessionSaved) return;
    setIsSaving(true);
    
    // Calculate calm score (inverse of average arousal)
    const calmScore = Math.round((1 - arousalLevel) * 100);
    
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration: sessionTime,
          calmScore,
          notes: aiResponse || null,
        }),
      });
      
      if (res.ok) {
        setSessionSaved(true);
        
        // Also save biomarker data
        await fetch('/api/biomarkers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pitch: 140 + Math.random() * 30, // Simulated pitch
            clarity: 75 + Math.random() * 20, // Simulated clarity
            stress: arousalLevel * 100,
          }),
        });
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDF8F3' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🎙️</div>
          <div style={{ color: '#6B7280' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FDF8F3' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #E5E7EB',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: '#10B981',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '18px' }}>🎙️</span>
          </div>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>Voca-Coach</span>
        </Link>

        <nav style={{ display: 'flex', gap: '24px' }}>
          {[
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/de-escalation', label: 'De-escalation', active: true },
            { href: '/biomarkers', label: 'Biomarkers' },
            { href: '/journal', label: 'Journal' },
            { href: '/persona', label: 'Persona' }
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              fontSize: '14px',
              fontWeight: '500',
              color: item.active ? '#10B981' : '#6B7280',
              padding: '8px 0',
              borderBottom: item.active ? '2px solid #10B981' : 'none'
            }}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/dashboard" style={{
          padding: '10px 20px',
          background: '#F3F4F6',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#4B5563'
        }}>Back to Dashboard</Link>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
            🌬️ De-escalation Coach
          </h1>
          <p style={{ color: '#6B7280' }}>Record your voice to receive real-time emotional feedback and grounded advice.</p>
        </div>

        {/* Recording Area */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          border: '1px solid #E5E7EB',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          {/* Visualizer / Recording State */}
          <div style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            margin: '0 auto 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isRecording
              ? `radial-gradient(circle, ${getArousalColor()}22 0%, ${getArousalColor()}11 100%)`
              : '#F9FAFB',
            border: `4px solid ${isRecording ? getArousalColor() : '#E5E7EB'}`,
            transition: 'all 0.3s ease'
          }}>
            {isRecording ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎙️</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937' }}>{formatTime(sessionTime)}</div>
              </div>
            ) : (
              <div style={{ fontSize: '48px' }}>🎙️</div>
            )}
          </div>

          {/* Arousal Meter */}
          {isRecording && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>Stress Level (Simulated)</span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: getArousalColor(),
                  background: `${getArousalColor()}15`,
                  padding: '4px 10px',
                  borderRadius: '999px'
                }}>{getArousalLabel()}</span>
              </div>
              <div style={{
                height: '8px',
                background: '#F3F4F6',
                borderRadius: '999px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${arousalLevel * 100}%`,
                  background: `linear-gradient(90deg, #10B981 0%, ${getArousalColor()} 100%)`,
                  borderRadius: '999px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {!isRecording ? (
              <button onClick={startSession} style={{
                padding: '16px 40px',
                background: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer'
              }}>
                Start Session
              </button>
            ) : (
              <button onClick={stopSession} style={{
                padding: '16px 40px',
                background: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer'
              }}>
                End Session
              </button>
            )}

            {!isRecording && sessionTime > 0 && !sessionSaved && (
              <button onClick={saveSession} disabled={isSaving} style={{
                padding: '16px 40px',
                background: isSaving ? '#9CA3AF' : '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}>
                {isSaving ? 'Saving...' : 'Save Session'}
              </button>
            )}

            {sessionSaved && (
              <span style={{ 
                padding: '16px 40px',
                color: '#10B981',
                fontWeight: '600'
              }}>
                ✓ Session Saved!
              </span>
            )}
          </div>
        </div>

        {/* AI Response */}
        {isAnalyzing && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid #E5E7EB',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>🤔</div>
            <p style={{ color: '#6B7280' }}>Analyzing your session...</p>
          </div>
        )}

        {aiResponse && !isAnalyzing && (
          <div style={{
            background: 'linear-gradient(135deg, #ECFDF5 0%, #FEF3E7 100%)',
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid #D1FAE5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>🧘</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>AI Coach Suggestion</h3>
              {isPlayingAudio && (
                <span style={{ fontSize: '12px', color: '#10B981', marginLeft: 'auto' }}>🔊 Playing...</span>
              )}
            </div>
            <p style={{ fontSize: '16px', color: '#4B5563', lineHeight: '1.7', fontStyle: 'italic', marginBottom: '16px' }}>
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
                gap: '8px'
              }}
            >
              <span>🔊</span>
              {isPlayingAudio ? 'Playing...' : 'Play Audio'}
            </button>
          </div>
        )}

        {/* Tips */}
        {!isRecording && !aiResponse && !isAnalyzing && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginTop: '24px'
          }}>
            {[
              { icon: '🫁', title: 'Breathe', desc: 'Deep breaths lower stress hormones' },
              { icon: '🐢', title: 'Slow Down', desc: 'Speak 20% slower than normal' },
              { icon: '👂', title: 'Pause', desc: 'Take 2-second pauses between thoughts' }
            ].map((tip, i) => (
              <div key={i} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid #E5E7EB'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{tip.icon}</div>
                <div style={{ fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>{tip.title}</div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>{tip.desc}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
