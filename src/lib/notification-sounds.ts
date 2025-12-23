'use client';

// Sound notification system for chat

type SoundType = 'message' | 'sent' | 'typing' | 'notification' | 'crisis';

interface SoundConfig {
  src: string;
  volume: number;
  preload: boolean;
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  message: {
    src: '/sounds/message-received.mp3',
    volume: 0.5,
    preload: true
  },
  sent: {
    src: '/sounds/message-sent.mp3',
    volume: 0.3,
    preload: true
  },
  typing: {
    src: '/sounds/typing.mp3',
    volume: 0.2,
    preload: false
  },
  notification: {
    src: '/sounds/notification.mp3',
    volume: 0.6,
    preload: true
  },
  crisis: {
    src: '/sounds/alert.mp3',
    volume: 0.8,
    preload: true
  }
};

// Fallback sounds using Web Audio API for when audio files aren't available
const FALLBACK_FREQUENCIES: Record<SoundType, { freq: number; duration: number; type: OscillatorType }> = {
  message: { freq: 800, duration: 0.15, type: 'sine' },
  sent: { freq: 600, duration: 0.1, type: 'sine' },
  typing: { freq: 400, duration: 0.05, type: 'sine' },
  notification: { freq: 1000, duration: 0.2, type: 'sine' },
  crisis: { freq: 1200, duration: 0.3, type: 'square' }
};

class NotificationSoundManager {
  private audioCache: Map<SoundType, HTMLAudioElement> = new Map();
  private audioContext: AudioContext | null = null;
  private muted: boolean = false;
  private volume: number = 1.0;
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadMutePreference();
    }
  }

  // Initialize audio context (must be called after user interaction)
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Try to preload audio files
      for (const [type, config] of Object.entries(SOUND_CONFIGS)) {
        if (config.preload) {
          this.preloadSound(type as SoundType);
        }
      }
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize sound manager:', error);
    }
  }

  // Preload a sound file
  private preloadSound(type: SoundType): void {
    const config = SOUND_CONFIGS[type];
    const audio = new Audio(config.src);
    audio.volume = config.volume * this.volume;
    audio.preload = 'auto';
    this.audioCache.set(type, audio);
  }

  // Play a sound
  async play(type: SoundType): Promise<void> {
    if (this.muted) return;

    try {
      // Try to play from cache first
      let audio = this.audioCache.get(type);

      if (audio) {
        audio.currentTime = 0;
        audio.volume = SOUND_CONFIGS[type].volume * this.volume;
        await audio.play();
        return;
      }

      // Try to create and play new audio
      const config = SOUND_CONFIGS[type];
      audio = new Audio(config.src);
      audio.volume = config.volume * this.volume;

      audio.onerror = () => {
        // Fallback to Web Audio API
        this.playFallbackSound(type);
      };

      await audio.play();
      this.audioCache.set(type, audio);
    } catch (error) {
      // Fallback to Web Audio API tone
      this.playFallbackSound(type);
    }
  }

  // Play a fallback sound using Web Audio API
  private playFallbackSound(type: SoundType): void {
    if (this.muted) return;

    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const config = FALLBACK_FREQUENCIES[type];
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.freq, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.3 * this.volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + config.duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + config.duration);
    } catch (error) {
      console.warn('Failed to play fallback sound:', error);
    }
  }

  // Play message received sound
  playMessageReceived(): void {
    this.play('message');
  }

  // Play message sent sound
  playMessageSent(): void {
    this.play('sent');
  }

  // Play notification sound
  playNotification(): void {
    this.play('notification');
  }

  // Play crisis alert sound
  playCrisisAlert(): void {
    this.play('crisis');
  }

  // Set mute state
  setMuted(muted: boolean): void {
    this.muted = muted;
    this.saveMutePreference();
  }

  // Toggle mute
  toggleMute(): boolean {
    this.muted = !this.muted;
    this.saveMutePreference();
    return this.muted;
  }

  // Get mute state
  isMuted(): boolean {
    return this.muted;
  }

  // Set volume (0-1)
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.saveVolumePreference();

    // Update cached audio volumes
    for (const [type, audio] of this.audioCache.entries()) {
      audio.volume = SOUND_CONFIGS[type].volume * this.volume;
    }
  }

  // Get volume
  getVolume(): number {
    return this.volume;
  }

  // Save mute preference
  private saveMutePreference(): void {
    try {
      localStorage.setItem('chat_sounds_muted', String(this.muted));
    } catch {}
  }

  // Load mute preference
  private loadMutePreference(): void {
    try {
      const muted = localStorage.getItem('chat_sounds_muted');
      if (muted !== null) {
        this.muted = muted === 'true';
      }
      const volume = localStorage.getItem('chat_sounds_volume');
      if (volume !== null) {
        this.volume = parseFloat(volume);
      }
    } catch {}
  }

  // Save volume preference
  private saveVolumePreference(): void {
    try {
      localStorage.setItem('chat_sounds_volume', String(this.volume));
    } catch {}
  }
}

// Singleton instance
export const notificationSounds = new NotificationSoundManager();

// React hook for sound controls
import { useState, useEffect, useCallback } from 'react';

export function useNotificationSounds() {
  const [muted, setMutedState] = useState(false);
  const [volume, setVolumeState] = useState(1.0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setMutedState(notificationSounds.isMuted());
    setVolumeState(notificationSounds.getVolume());
  }, []);

  const initialize = useCallback(async () => {
    await notificationSounds.initialize();
    setInitialized(true);
  }, []);

  const setMuted = useCallback((value: boolean) => {
    notificationSounds.setMuted(value);
    setMutedState(value);
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = notificationSounds.toggleMute();
    setMutedState(newMuted);
    return newMuted;
  }, []);

  const setVolume = useCallback((value: number) => {
    notificationSounds.setVolume(value);
    setVolumeState(value);
  }, []);

  const playMessageReceived = useCallback(() => {
    notificationSounds.playMessageReceived();
  }, []);

  const playMessageSent = useCallback(() => {
    notificationSounds.playMessageSent();
  }, []);

  const playNotification = useCallback(() => {
    notificationSounds.playNotification();
  }, []);

  const playCrisisAlert = useCallback(() => {
    notificationSounds.playCrisisAlert();
  }, []);

  return {
    muted,
    volume,
    initialized,
    initialize,
    setMuted,
    toggleMute,
    setVolume,
    playMessageReceived,
    playMessageSent,
    playNotification,
    playCrisisAlert
  };
}
