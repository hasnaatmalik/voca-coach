'use client';

import { useState, useRef, useEffect, CSSProperties } from 'react';
import type { VoiceBiomarkers } from '@/types/chat';

interface VoiceMessageProps {
  audioUrl: string;
  duration: number; // seconds
  transcript?: string;
  biomarkers?: VoiceBiomarkers;
  isOwn: boolean;
  onAnalyzeBiomarkers?: () => void;
  darkMode?: boolean;
}

const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2];

export default function VoiceMessage({
  audioUrl,
  duration,
  transcript,
  biomarkers,
  isOwn,
  onAnalyzeBiomarkers,
  darkMode = false
}: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showBiomarkers, setShowBiomarkers] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  // Generate static waveform from duration (placeholder - real waveform would be generated from audio data)
  useEffect(() => {
    const bars = [];
    for (let i = 0; i < 40; i++) {
      bars.push(0.2 + Math.random() * 0.8);
    }
    setWaveformData(bars);
  }, [audioUrl]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Update playback rate when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cyclePlaybackRate = () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    setPlaybackRate(PLAYBACK_SPEEDS[nextIndex]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '200px',
    maxWidth: '280px'
  };

  const playerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const playButtonStyle: CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    background: isOwn ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    transition: 'transform 0.2s'
  };

  const waveformContainerStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  };

  const waveformStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1px',
    height: '24px',
    cursor: 'pointer',
    position: 'relative'
  };

  const barStyle = (height: number, index: number): CSSProperties => {
    const isPassed = (index / waveformData.length) * 100 <= progress;
    return {
      width: '3px',
      height: `${Math.max(4, height * 24)}px`,
      borderRadius: '1px',
      background: isPassed
        ? (isOwn ? 'rgba(255,255,255,0.9)' : '#7C3AED')
        : (isOwn ? 'rgba(255,255,255,0.3)' : darkMode ? '#4B5563' : '#D1D5DB'),
      transition: 'background 0.1s'
    };
  };

  const timeRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    opacity: 0.7
  };

  const speedButtonStyle: CSSProperties = {
    background: isOwn ? 'rgba(255,255,255,0.2)' : darkMode ? '#374151' : '#F3F4F6',
    border: 'none',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    color: isOwn ? 'white' : darkMode ? '#D1D5DB' : '#4B5563'
  };

  const transcriptStyle: CSSProperties = {
    marginTop: '8px',
    padding: '8px 12px',
    background: isOwn ? 'rgba(255,255,255,0.1)' : darkMode ? '#374151' : '#F3F4F6',
    borderRadius: '8px',
    fontSize: '12px',
    lineHeight: '1.5',
    maxHeight: showTranscript ? '200px' : '0',
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out',
    opacity: showTranscript ? 1 : 0
  };

  const biomarkersStyle: CSSProperties = {
    marginTop: '8px',
    padding: '8px 12px',
    background: isOwn ? 'rgba(255,255,255,0.1)' : darkMode ? '#374151' : '#F3F4F6',
    borderRadius: '8px',
    fontSize: '11px'
  };

  const getBiomarkerColor = (score: number) => {
    if (score < 0.3) return '#10B981'; // Green - low stress
    if (score < 0.6) return '#F59E0B'; // Yellow - medium stress
    return '#EF4444'; // Red - high stress
  };

  return (
    <div style={containerStyle}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div style={playerStyle}>
        {/* Play/Pause button */}
        <button
          style={playButtonStyle}
          onClick={togglePlay}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div style={waveformContainerStyle}>
          {/* Waveform / Progress */}
          <div
            ref={progressRef}
            style={waveformStyle}
            onClick={handleProgressClick}
          >
            {waveformData.map((height, i) => (
              <div key={i} style={barStyle(height, i)} />
            ))}
          </div>

          {/* Time and speed */}
          <div style={timeRowStyle}>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            <button style={speedButtonStyle} onClick={cyclePlaybackRate}>
              {playbackRate}x
            </button>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        {transcript && (
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            style={{
              ...speedButtonStyle,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            📝 {showTranscript ? 'Hide' : 'Show'} transcript
          </button>
        )}

        {biomarkers ? (
          <button
            onClick={() => setShowBiomarkers(!showBiomarkers)}
            style={{
              ...speedButtonStyle,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            📊 {showBiomarkers ? 'Hide' : 'View'} analysis
          </button>
        ) : onAnalyzeBiomarkers && (
          <button
            onClick={onAnalyzeBiomarkers}
            style={{
              ...speedButtonStyle,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            🔬 Analyze voice
          </button>
        )}
      </div>

      {/* Transcript */}
      {transcript && showTranscript && (
        <div style={transcriptStyle}>
          {transcript}
        </div>
      )}

      {/* Biomarkers */}
      {biomarkers && showBiomarkers && (
        <div style={biomarkersStyle}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>Voice Analysis</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Stress Level</span>
              <span style={{ color: getBiomarkerColor(biomarkers.overallStressScore) }}>
                {Math.round(biomarkers.overallStressScore * 100)}%
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Speaking Rate</span>
              <span>{biomarkers.speakingRate} WPM</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Pitch</span>
              <span style={{ textTransform: 'capitalize' }}>{biomarkers.pitchLevel}</span>
            </div>

            {biomarkers.tremorDetected && (
              <div style={{
                marginTop: '4px',
                padding: '4px 8px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '4px',
                color: '#EF4444'
              }}>
                ⚠️ Voice tremor detected
              </div>
            )}

            {biomarkers.recommendations.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>Tips:</div>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  {biomarkers.recommendations.slice(0, 2).map((rec, i) => (
                    <li key={i} style={{ fontSize: '10px', opacity: 0.8 }}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
