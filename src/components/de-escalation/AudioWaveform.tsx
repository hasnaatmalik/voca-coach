'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface AudioWaveformProps {
  analyserNode: AnalyserNode | null;
  stressLevel: number; // 0-1 for color coding
  isRecording: boolean;
  showBreathingGuide?: boolean;
  breathingPhase?: 'inhale' | 'hold' | 'exhale' | 'holdAfter' | null;
  darkMode?: boolean;
}

export default function AudioWaveform({
  analyserNode,
  stressLevel,
  isRecording,
  showBreathingGuide = false,
  breathingPhase = null,
  darkMode = false,
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const breathingProgress = useRef(0);

  // Get color based on stress level
  const getStressColor = useCallback((level: number, alpha: number = 1) => {
    if (level < 0.3) {
      return `rgba(16, 185, 129, ${alpha})`; // Green - calm
    } else if (level < 0.5) {
      return `rgba(245, 158, 11, ${alpha})`; // Amber - moderate
    } else if (level < 0.7) {
      return `rgba(249, 115, 22, ${alpha})`; // Orange - elevated
    } else {
      return `rgba(239, 68, 68, ${alpha})`; // Red - high
    }
  }, []);

  // Draw frequency bars visualization
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = darkMode ? '#1F2937' : '#F9FAFB';
    ctx.fillRect(0, 0, width, height);

    if (analyserNode && isRecording) {
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteFrequencyData(dataArray);

      // Draw frequency bars
      const barCount = 48;
      const barWidth = (width / barCount) * 0.7;
      const gap = (width / barCount) * 0.3;

      for (let i = 0; i < barCount; i++) {
        // Sample from different parts of frequency spectrum
        const dataIndex = Math.floor((i / barCount) * bufferLength * 0.6);
        const value = dataArray[dataIndex];
        const barHeight = (value / 255) * height * 0.8;

        const x = i * (barWidth + gap) + gap / 2;
        const y = height - barHeight;

        // Create gradient based on stress level
        const gradient = ctx.createLinearGradient(x, height, x, y);
        gradient.addColorStop(0, getStressColor(stressLevel, 0.3));
        gradient.addColorStop(0.5, getStressColor(stressLevel, 0.7));
        gradient.addColorStop(1, getStressColor(stressLevel, 1));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [barWidth / 2, barWidth / 2, 0, 0]);
        ctx.fill();

        // Add glow effect for higher values
        if (value > 150) {
          ctx.shadowColor = getStressColor(stressLevel, 0.5);
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Draw center line
      ctx.strokeStyle = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    } else {
      // Draw idle state - subtle wave animation
      const time = Date.now() / 1000;
      ctx.strokeStyle = darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(124, 58, 237, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * 0.02 + time * 2) * 10 + Math.sin(x * 0.01 + time) * 5;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Draw breathing guide overlay
    if (showBreathingGuide && breathingPhase) {
      breathingProgress.current = (breathingProgress.current + 0.02) % 1;

      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(width, height) * 0.35;
      let currentRadius = maxRadius * 0.3;

      // Calculate radius based on breathing phase
      switch (breathingPhase) {
        case 'inhale':
          currentRadius = maxRadius * (0.3 + breathingProgress.current * 0.7);
          break;
        case 'hold':
        case 'holdAfter':
          currentRadius = maxRadius;
          break;
        case 'exhale':
          currentRadius = maxRadius * (1 - breathingProgress.current * 0.7);
          break;
      }

      // Draw breathing circle
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw pulsing glow
      const gradient = ctx.createRadialGradient(
        centerX, centerY, currentRadius * 0.8,
        centerX, centerY, currentRadius * 1.2
      );
      gradient.addColorStop(0, 'rgba(124, 58, 237, 0.1)');
      gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [analyserNode, isRecording, stressLevel, showBreathingGuide, breathingPhase, darkMode, getStressColor]);

  useEffect(() => {
    // Handle canvas resize
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Start animation
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '120px',
      borderRadius: '16px',
      overflow: 'hidden',
      background: darkMode
        ? 'linear-gradient(180deg, #1F2937 0%, #111827 100%)'
        : 'linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%)',
      border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      {/* Recording indicator */}
      {isRecording && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: 'rgba(239, 68, 68, 0.9)',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: '600',
          color: 'white',
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'white',
            animation: 'pulse 1s ease-in-out infinite',
          }} />
          REC
        </div>
      )}

      {/* Breathing phase indicator */}
      {showBreathingGuide && breathingPhase && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '6px 16px',
          background: 'rgba(124, 58, 237, 0.9)',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: '600',
          color: 'white',
          textTransform: 'capitalize',
        }}>
          {breathingPhase === 'holdAfter' ? 'Hold' : breathingPhase}
        </div>
      )}

      {/* Stress level indicator */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        padding: '4px 10px',
        background: getStressColor(stressLevel, 0.9),
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: '600',
        color: 'white',
      }}>
        {Math.round(stressLevel * 100)}% stress
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
