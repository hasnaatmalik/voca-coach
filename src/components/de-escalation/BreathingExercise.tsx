'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BreathingPattern, BREATHING_PATTERNS } from '@/types/de-escalation';

interface BreathingExerciseProps {
  pattern: BreathingPattern;
  onComplete: () => void;
  onCancel: () => void;
  onPhaseChange?: (phase: 'inhale' | 'hold' | 'exhale' | 'holdAfter' | null) => void;
  voiceGuidance?: boolean;
  darkMode?: boolean;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'holdAfter';

export default function BreathingExercise({
  pattern,
  onComplete,
  onCancel,
  onPhaseChange,
  voiceGuidance = true,
  darkMode = false,
}: BreathingExerciseProps) {
  const config = BREATHING_PATTERNS[pattern];
  const [currentCycle, setCurrentCycle] = useState(1);
  const [currentPhase, setCurrentPhase] = useState<Phase>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [isStarted, setIsStarted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCompletedRef = useRef(false);
  const currentCycleRef = useRef(1);

  // Keep ref in sync with state
  useEffect(() => {
    currentCycleRef.current = currentCycle;
  }, [currentCycle]);

  // Notify parent of phase changes via useEffect (not during setState)
  useEffect(() => {
    if (isStarted && !isCompletedRef.current) {
      onPhaseChange?.(currentPhase);
    }
  }, [currentPhase, isStarted, onPhaseChange]);

  // Get phase duration
  const getPhaseDuration = useCallback((phase: Phase): number => {
    switch (phase) {
      case 'inhale': return config.inhale;
      case 'hold': return config.hold || 0;
      case 'exhale': return config.exhale;
      case 'holdAfter': return config.holdAfter || 0;
    }
  }, [config]);

  // Get next phase
  const getNextPhase = useCallback((current: Phase): Phase | null => {
    const phases: Phase[] = ['inhale'];
    if (config.hold) phases.push('hold');
    phases.push('exhale');
    if (config.holdAfter) phases.push('holdAfter');

    const currentIndex = phases.indexOf(current);
    if (currentIndex < phases.length - 1) {
      return phases[currentIndex + 1];
    }
    return null; // End of cycle
  }, [config]);

  // Play voice guidance
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const playGuidance = useCallback(async (phase: Phase) => {
    if (!voiceGuidance) return;

    try {
      const text = {
        inhale: 'Breathe in',
        hold: 'Hold',
        exhale: 'Breathe out',
        holdAfter: 'Hold',
      }[phase];

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceStability: 0.8,
          voiceSimilarity: 0.8,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Wait for previous play to finish before pausing
        if (playPromiseRef.current) {
          try {
            await playPromiseRef.current;
          } catch {
            // Ignore errors from previous play
          }
        }

        if (audioRef.current) {
          audioRef.current.pause();
          URL.revokeObjectURL(audioRef.current.src);
        }

        const audio = new Audio(url);
        audioRef.current = audio;
        playPromiseRef.current = audio.play();
        playPromiseRef.current.catch(() => {
          // Ignore AbortError - it's expected when audio is interrupted
        });
      }
    } catch (error) {
      console.error('Voice guidance error:', error);
    }
  }, [voiceGuidance]);

  // Countdown before starting
  useEffect(() => {
    if (!isStarted && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0 && !isStarted) {
      setIsStarted(true);
      playGuidance('inhale');
    }
  }, [countdown, isStarted, playGuidance]);

  // Main breathing loop
  useEffect(() => {
    if (!isStarted || !isPlaying) return;

    const phaseDuration = getPhaseDuration(currentPhase);
    const intervalMs = 50; // Update every 50ms for smooth animation
    const progressIncrement = (intervalMs / 1000) / phaseDuration;

    intervalRef.current = setInterval(() => {
      setPhaseProgress((prev) => {
        const next = prev + progressIncrement;

        if (next >= 1) {
          // Phase complete
          const nextPhase = getNextPhase(currentPhase);

          if (nextPhase) {
            setCurrentPhase(nextPhase);
            playGuidance(nextPhase);
            return 0;
          } else {
            // Cycle complete - use ref to get current value
            if (currentCycleRef.current < config.cycles) {
              currentCycleRef.current += 1;
              setCurrentCycle(currentCycleRef.current);
              setCurrentPhase('inhale');
              playGuidance('inhale');
              return 0;
            } else {
              // All cycles complete
              clearInterval(intervalRef.current!);
              isCompletedRef.current = true;
              // Use setTimeout to defer the callback
              setTimeout(() => {
                onPhaseChange?.(null);
                onComplete();
              }, 0);
              return 1;
            }
          }
        }

        return next;
      });
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStarted, isPlaying, currentPhase, currentCycle, config.cycles, getPhaseDuration, getNextPhase, onComplete, onPhaseChange, playGuidance]);

  // Update parent with phase changes
  useEffect(() => {
    if (isStarted) {
      onPhaseChange?.(currentPhase);
    }
  }, [currentPhase, isStarted, onPhaseChange]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handlePauseResume = () => {
    setIsPlaying(!isPlaying);
  };

  const handleCancel = () => {
    onPhaseChange?.(null);
    onCancel();
  };

  // Calculate circle scale based on phase and progress
  const getCircleScale = () => {
    switch (currentPhase) {
      case 'inhale':
        return 0.5 + phaseProgress * 0.5; // 0.5 -> 1.0
      case 'hold':
      case 'holdAfter':
        return currentPhase === 'hold' ? 1.0 : 0.5;
      case 'exhale':
        return 1.0 - phaseProgress * 0.5; // 1.0 -> 0.5
    }
  };

  const phaseLabel = {
    inhale: 'Breathe In',
    hold: 'Hold',
    exhale: 'Breathe Out',
    holdAfter: 'Hold',
  };

  const phaseColor = {
    inhale: '#10B981',
    hold: '#F59E0B',
    exhale: '#7C3AED',
    holdAfter: '#F59E0B',
  };

  const bgColor = darkMode ? '#1F2937' : 'white';
  const textColor = darkMode ? '#F9FAFB' : '#1F2937';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B7280';

  return (
    <div style={{
      background: bgColor,
      borderRadius: '24px',
      padding: '32px',
      textAlign: 'center',
      border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: textColor,
          margin: '0 0 4px 0',
        }}>
          {config.name}
        </h3>
        <p style={{ fontSize: '14px', color: mutedColor, margin: 0 }}>
          {config.description}
        </p>
      </div>

      {/* Countdown or Main Animation */}
      {!isStarted ? (
        <div style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          margin: '0 auto 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: darkMode
            ? 'linear-gradient(135deg, #374151 0%, #1F2937 100%)'
            : 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
          border: `4px solid ${darkMode ? '#4B5563' : '#D1D5DB'}`,
        }}>
          <span style={{
            fontSize: '64px',
            fontWeight: '700',
            color: '#7C3AED',
          }}>
            {countdown || 'Go!'}
          </span>
        </div>
      ) : (
        <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 32px' }}>
          {/* Outer ring - progress */}
          <svg
            width="200"
            height="200"
            style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
          >
            <circle
              cx="100"
              cy="100"
              r="96"
              fill="none"
              stroke={darkMode ? '#374151' : '#E5E7EB'}
              strokeWidth="8"
            />
            <circle
              cx="100"
              cy="100"
              r="96"
              fill="none"
              stroke={phaseColor[currentPhase]}
              strokeWidth="8"
              strokeDasharray={`${phaseProgress * 603} 603`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.05s linear' }}
            />
          </svg>

          {/* Animated breathing circle */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${getCircleScale()})`,
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${phaseColor[currentPhase]}40 0%, ${phaseColor[currentPhase]}20 100%)`,
            border: `3px solid ${phaseColor[currentPhase]}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.3s ease-out',
          }}>
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: phaseColor[currentPhase],
            }}>
              {phaseLabel[currentPhase]}
            </span>
            <span style={{
              fontSize: '28px',
              fontWeight: '700',
              color: textColor,
            }}>
              {Math.ceil(getPhaseDuration(currentPhase) * (1 - phaseProgress))}
            </span>
          </div>
        </div>
      )}

      {/* Cycle Progress */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', color: mutedColor, marginBottom: '8px' }}>
          Cycle {currentCycle} of {config.cycles}
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
        }}>
          {Array.from({ length: config.cycles }).map((_, i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: i < currentCycle
                  ? '#7C3AED'
                  : i === currentCycle - 1
                    ? phaseColor[currentPhase]
                    : darkMode ? '#374151' : '#E5E7EB',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={handlePauseResume}
          style={{
            padding: '12px 24px',
            background: isPlaying ? '#F59E0B' : '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Resume'}
        </button>
        <button
          onClick={handleCancel}
          style={{
            padding: '12px 24px',
            background: darkMode ? '#374151' : '#F3F4F6',
            color: textColor,
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>

      {/* Phase Sequence Reference */}
      <div style={{
        marginTop: '24px',
        padding: '12px',
        background: darkMode ? '#111827' : '#F9FAFB',
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        fontSize: '12px',
        color: mutedColor,
      }}>
        <span style={{ color: currentPhase === 'inhale' ? '#10B981' : mutedColor }}>
          In: {config.inhale}s
        </span>
        {config.hold && (
          <span style={{ color: currentPhase === 'hold' ? '#F59E0B' : mutedColor }}>
            Hold: {config.hold}s
          </span>
        )}
        <span style={{ color: currentPhase === 'exhale' ? '#7C3AED' : mutedColor }}>
          Out: {config.exhale}s
        </span>
        {config.holdAfter && (
          <span style={{ color: currentPhase === 'holdAfter' ? '#F59E0B' : mutedColor }}>
            Hold: {config.holdAfter}s
          </span>
        )}
      </div>
    </div>
  );
}
