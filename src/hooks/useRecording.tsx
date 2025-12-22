'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  hasConsent: boolean;
  bothConsented: boolean;
}

interface UseRecordingOptions {
  sessionId: string;
  onError?: (error: string) => void;
}

export function useRecording({ sessionId, onError }: UseRecordingOptions) {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    hasConsent: false,
    bothConsented: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check consent status
  const checkConsent = useCallback(async () => {
    try {
      const response = await fetch(`/api/therapy/recording/consent?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setState((prev) => ({
          ...prev,
          hasConsent: data.myConsent || false,
          bothConsented: data.bothConsented || false,
        }));
        return data;
      }
    } catch (error) {
      console.error('Failed to check consent:', error);
    }
    return null;
  }, [sessionId]);

  // Update consent
  const updateConsent = useCallback(
    async (consent: boolean) => {
      try {
        const response = await fetch('/api/therapy/recording/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, consent }),
        });

        if (response.ok) {
          const data = await response.json();
          setState((prev) => ({
            ...prev,
            hasConsent: consent,
            bothConsented: data.bothConsented || false,
          }));
          return data;
        }
      } catch (error) {
        console.error('Failed to update consent:', error);
        onError?.('Failed to update recording consent');
      }
      return null;
    },
    [sessionId, onError]
  );

  // Start recording
  const startRecording = useCallback(
    async (stream: MediaStream) => {
      if (!state.bothConsented) {
        onError?.('Both parties must consent to recording');
        return false;
      }

      try {
        streamRef.current = stream;
        chunksRef.current = [];

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9,opus',
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          if (chunksRef.current.length > 0) {
            await uploadRecording();
          }
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(5000); // Collect data every 5 seconds

        // Start duration timer
        timerRef.current = setInterval(() => {
          setState((prev) => ({
            ...prev,
            duration: prev.duration + 1,
          }));
        }, 1000);

        setState((prev) => ({
          ...prev,
          isRecording: true,
          isPaused: false,
        }));

        return true;
      } catch (error) {
        console.error('Failed to start recording:', error);
        onError?.('Failed to start recording');
        return false;
      }
    },
    [state.bothConsented, onError]
  );

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, []);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isRecording: false,
      isPaused: false,
    }));
  }, []);

  // Upload recording
  const uploadRecording = useCallback(async () => {
    if (chunksRef.current.length === 0) return;

    try {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('file', blob, `session-${Date.now()}.webm`);
      formData.append('duration', String(state.duration));

      const response = await fetch('/api/therapy/recording', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      chunksRef.current = [];
      return await response.json();
    } catch (error) {
      console.error('Failed to upload recording:', error);
      onError?.('Failed to upload recording');
    }
  }, [sessionId, state.duration, onError]);

  // Request transcription
  const requestTranscription = useCallback(
    async (recordingId: string) => {
      try {
        const response = await fetch('/api/therapy/recording/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recordingId }),
        });

        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Failed to transcribe:', error);
        onError?.('Failed to transcribe recording');
      }
      return null;
    },
    [onError]
  );

  // Format duration as MM:SS
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  // Check consent on mount
  useEffect(() => {
    checkConsent();
  }, [checkConsent]);

  return {
    ...state,
    formattedDuration: formatDuration(state.duration),
    checkConsent,
    updateConsent,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    requestTranscription,
  };
}
