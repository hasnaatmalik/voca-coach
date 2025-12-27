'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AMBIENT_SOUNDS, AmbientSound } from '@/types/de-escalation';

// SVG Icon Components
const MusicIcon = ({ color = '#7AAFC9', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const VolumeIcon = ({ color = '#7AB89E', size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const StopIcon = ({ color = 'white', size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
);

// Map sound IDs to icons
const getSoundIcon = (soundId: string, color: string = '#6B7280') => {
  const icons: Record<string, React.ReactNode> = {
    'rain': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M16 13v8" /><path d="M8 13v8" /><path d="M12 15v8" />
        <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
      </svg>
    ),
    'forest': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z" />
        <path d="M7 16v6" />
        <path d="M13 19v3" />
        <path d="M17 22v-5c0-1.5.5-3 1.5-4 1-1 1.5-2.5 1.5-4a6 6 0 0 0-12 0c0 1.5.5 3 1.5 4 1 1 1.5 2.5 1.5 4v5" />
      </svg>
    ),
    'ocean': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      </svg>
    ),
    'white-noise': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
        <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
        <circle cx="12" cy="12" r="2" />
        <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
        <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
      </svg>
    ),
    'pink-noise': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M2 10c0-3.866 3.582-7 8-7s8 3.134 8 7v4c0 3.866-3.582 7-8 7s-8-3.134-8-7v-4z" />
        <path d="M6 8v8" /><path d="M10 6v12" /><path d="M14 8v8" />
      </svg>
    ),
    'brown-noise': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M3 12h4l3-9 4 18 3-9h4" />
      </svg>
    ),
    'binaural-40hz': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      </svg>
    ),
  };
  return icons[soundId] || <MusicIcon color={color} size={18} />;
};

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
            <MusicIcon color="#7AAFC9" size={16} />
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
            <VolumeIcon color="#7AB89E" size={14} />
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
              {getSoundIcon(sound.id, activeSound === sound.id && isPlaying ? 'white' : textColor)}
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
          <MusicIcon color="#7AAFC9" size={20} />
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
                {getSoundIcon(sound.id, activeSound === sound.id && isPlaying ? 'white' : textColor)}
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
          <StopIcon color="white" size={14} />
          Stop Sound
        </button>
      )}
    </div>
  );
}
