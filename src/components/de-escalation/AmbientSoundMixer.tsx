'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AMBIENT_SOUNDS, AmbientSound } from '@/types/de-escalation';

interface AmbientSoundMixerProps {
  onVolumeChange?: (volume: number) => void;
  defaultSound?: string;
  defaultVolume?: number;
  darkMode?: boolean;
  compact?: boolean;
}

export default function AmbientSoundMixer({
  onVolumeChange,
  defaultSound,
  defaultVolume = 0.3,
  darkMode = false,
  compact = false,
}: AmbientSoundMixerProps) {
  const [activeSound, setActiveSound] = useState<string | null>(defaultSound || null);
  const [volume, setVolume] = useState(defaultVolume);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Generate noise using Web Audio API
  const generateNoise = useCallback((type: 'white' | 'pink' | 'brown') => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;

    // Stop existing oscillator
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
    }

    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate noise based on type
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      switch (type) {
        case 'white':
          output[i] = white;
          break;
        case 'pink':
          // Simple pink noise approximation
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
          break;
        case 'brown':
          // Brown noise
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
          break;
      }
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    gainNodeRef.current = gainNode;

    whiteNoise.connect(gainNode);
    gainNode.connect(ctx.destination);
    whiteNoise.start();

    oscillatorRef.current = whiteNoise as unknown as OscillatorNode;
  }, [volume]);

  // Generate binaural beats
  const generateBinaural = useCallback((frequency: number) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;

    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
    }

    // Create two oscillators for binaural effect
    const oscLeft = ctx.createOscillator();
    const oscRight = ctx.createOscillator();
    const merger = ctx.createChannelMerger(2);
    const gainNode = ctx.createGain();

    oscLeft.frequency.value = 200; // Base frequency
    oscRight.frequency.value = 200 + frequency; // Base + binaural frequency

    oscLeft.type = 'sine';
    oscRight.type = 'sine';

    const gainLeft = ctx.createGain();
    const gainRight = ctx.createGain();
    gainLeft.gain.value = 0.5;
    gainRight.gain.value = 0.5;

    oscLeft.connect(gainLeft);
    oscRight.connect(gainRight);
    gainLeft.connect(merger, 0, 0);
    gainRight.connect(merger, 0, 1);

    gainNode.gain.value = volume;
    gainNodeRef.current = gainNode;

    merger.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscLeft.start();
    oscRight.start();

    oscillatorRef.current = oscLeft;
  }, [volume]);

  // Play or stop sound
  const toggleSound = useCallback((sound: AmbientSound) => {
    // Stop current sound
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }

    if (activeSound === sound.id && isPlaying) {
      setActiveSound(null);
      setIsPlaying(false);
      return;
    }

    setActiveSound(sound.id);
    setIsPlaying(true);

    if (sound.isGenerated) {
      // Generate using Web Audio API
      if (sound.id === 'white-noise') {
        generateNoise('white');
      } else if (sound.id === 'pink-noise') {
        generateNoise('pink');
      } else if (sound.id === 'brown-noise') {
        generateNoise('brown');
      } else if (sound.id === 'binaural-40hz') {
        generateBinaural(40);
      }
    } else if (sound.url) {
      // Play from URL with error handling
      const audio = new Audio();
      audio.loop = true;
      audio.volume = volume;

      audio.onerror = () => {
        console.warn(`Failed to load ${sound.name}, falling back to generated sound`);
        // Fallback to white noise if URL fails
        setIsPlaying(true);
        generateNoise('white');
      };

      audio.oncanplaythrough = () => {
        audioRef.current = audio;
        audio.play().catch((err) => {
          console.warn('Audio play failed:', err);
          generateNoise('white');
        });
      };

      audio.src = sound.url;
      audio.load();
    }
  }, [activeSound, isPlaying, volume, generateNoise, generateBinaural]);

  // Update volume
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    onVolumeChange?.(newVolume);

    try {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.volume = newVolume;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = newVolume;
      }
    } catch (err) {
      // Ignore volume update errors
    }
  }, [onVolumeChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const bgColor = darkMode ? '#1F2937' : 'white';
  const textColor = darkMode ? '#F9FAFB' : '#1F2937';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = darkMode ? '#374151' : '#E5E7EB';

  // Group sounds by category
  const groupedSounds = AMBIENT_SOUNDS.reduce((acc, sound) => {
    if (!acc[sound.category]) {
      acc[sound.category] = [];
    }
    acc[sound.category].push(sound);
    return acc;
  }, {} as Record<string, AmbientSound[]>);

  if (compact) {
    return (
      <div style={{
        background: bgColor,
        borderRadius: '12px',
        padding: '12px',
        border: `1px solid ${borderColor}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🎵</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: textColor }}>
              Ambient
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: mutedColor,
          }}>
            <span>🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              style={{ width: '60px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {AMBIENT_SOUNDS.slice(0, 6).map((sound) => (
            <button
              key={sound.id}
              onClick={() => toggleSound(sound)}
              style={{
                padding: '6px 10px',
                background: activeSound === sound.id && isPlaying
                  ? '#7C3AED'
                  : darkMode ? '#374151' : '#F3F4F6',
                color: activeSound === sound.id && isPlaying ? 'white' : textColor,
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{sound.icon}</span>
              {sound.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: bgColor,
      borderRadius: '16px',
      padding: '20px',
      border: `1px solid ${borderColor}`,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🎵</span>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: textColor,
            margin: 0,
          }}>
            Ambient Sounds
          </h3>
        </div>

        {isPlaying && (
          <span style={{
            padding: '4px 10px',
            background: '#10B981',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: '600',
            color: 'white',
          }}>
            Playing
          </span>
        )}
      </div>

      {/* Volume Control */}
      <div style={{
        padding: '12px',
        background: darkMode ? '#111827' : '#F9FAFB',
        borderRadius: '10px',
        marginBottom: '16px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '13px', color: mutedColor }}>Volume</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: textColor }}>
            {Math.round(volume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* Sound Categories */}
      {Object.entries(groupedSounds).map(([category, sounds]) => (
        <div key={category} style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: mutedColor,
            textTransform: 'capitalize',
            marginBottom: '8px',
          }}>
            {category}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
          }}>
            {sounds.map((sound) => (
              <button
                key={sound.id}
                onClick={() => toggleSound(sound)}
                style={{
                  padding: '12px',
                  background: activeSound === sound.id && isPlaying
                    ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
                    : darkMode ? '#374151' : '#F3F4F6',
                  color: activeSound === sound.id && isPlaying ? 'white' : textColor,
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '18px' }}>{sound.icon}</span>
                <span>{sound.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Stop All Button */}
      {isPlaying && (
        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
            }
            if (oscillatorRef.current) {
              oscillatorRef.current.stop();
              oscillatorRef.current.disconnect();
              oscillatorRef.current = null;
            }
            setActiveSound(null);
            setIsPlaying(false);
          }}
          style={{
            width: '100%',
            padding: '12px',
            background: '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>⏹️</span>
          Stop Sound
        </button>
      )}
    </div>
  );
}
