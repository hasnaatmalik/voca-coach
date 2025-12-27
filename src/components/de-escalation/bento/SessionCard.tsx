'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

// SVG Icon Components
const SpeakerIcon = ({ color = '#7AB89E', size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const SadFaceIcon = ({ color = '#D9A299', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const HappyFaceIcon = ({ color = '#7AB89E', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const MicIcon = ({ color = 'white', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const StopIcon = ({ color = 'white', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2">
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
);

const SaveIcon = ({ color = 'white', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const LoaderIcon = ({ color = 'white', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" opacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
  </svg>
);

interface SessionCardProps {
  isRecording: boolean;
  sessionTime: number;
  stressLevel: number;
  moodBefore: number;
  onMoodChange: (mood: number) => void;
  onStartSession: () => void;
  onStopSession: () => void;
  onSaveSession: () => void;
  isSaving: boolean;
  sessionSaved: boolean;
  recordingConsent: boolean;
  onConsentChange: (consent: boolean) => void;
  waveformComponent: ReactNode;
  isPlayingAudio: boolean;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getStressColor = (level: number) => {
  if (level < 0.3) return '#7AB89E';
  if (level < 0.5) return '#E4B17A';
  if (level < 0.7) return '#F97316';
  return '#EF4444';
};

const getStressLabel = (level: number) => {
  if (level < 0.3) return 'Calm';
  if (level < 0.5) return 'Moderate';
  if (level < 0.7) return 'Elevated';
  return 'High Stress';
};

export default function SessionCard({
  isRecording,
  sessionTime,
  stressLevel,
  moodBefore,
  onMoodChange,
  onStartSession,
  onStopSession,
  onSaveSession,
  isSaving,
  sessionSaved,
  recordingConsent,
  onConsentChange,
  waveformComponent,
  isPlayingAudio,
}: SessionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid #DCC5B2',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Waveform */}
      <div style={{ marginBottom: '24px' }}>
        {waveformComponent}
      </div>

      {/* Session Timer & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        {/* Timer & Status */}
        <div>
          <motion.div
            key={sessionTime}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: '48px',
              fontWeight: '700',
              color: '#2D2D2D',
              fontFamily: 'monospace',
              lineHeight: 1,
            }}
          >
            {formatTime(sessionTime)}
          </motion.div>

          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '8px',
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: getStressColor(stressLevel),
                    boxShadow: `0 0 12px ${getStressColor(stressLevel)}60`,
                  }}
                />
                <span style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: getStressColor(stressLevel),
                }}>
                  {getStressLabel(stressLevel)}
                </span>

                {isPlayingAudio && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      padding: '4px 10px',
                      background: '#7AB89E',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}
                  >
                    <SpeakerIcon color="white" size={12} /> AI Speaking
                  </motion.span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Pre-session Mood */}
          <AnimatePresence>
            {!isRecording && sessionTime === 0 && !sessionSaved && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: '#FAF7F3',
                  borderRadius: '14px',
                  border: '1px solid #F0E4D3',
                }}
              >
                <span style={{ fontSize: '13px', color: '#6B6B6B', fontWeight: '500' }}>
                  Current Mood
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <SadFaceIcon />
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={moodBefore}
                    onChange={(e) => onMoodChange(parseInt(e.target.value))}
                    style={{
                      width: '100px',
                      accentColor: '#D9A299',
                    }}
                  />
                  <HappyFaceIcon />
                  <motion.span
                    key={moodBefore}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: '28px',
                      height: '28px',
                      background: '#D9A299',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: '700',
                    }}
                  >
                    {moodBefore}
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          {!isRecording ? (
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(217, 162, 153, 0.35)' }}
              whileTap={{ scale: 0.97 }}
              onClick={onStartSession}
              style={{
                padding: '16px 36px',
                background: 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px rgba(217, 162, 153, 0.3)',
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <MicIcon />
              </motion.span>
              Start Session
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStopSession}
              style={{
                padding: '16px 36px',
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
              }}
            >
              <StopIcon />
              End Session
            </motion.button>
          )}

          {/* Save Button */}
          <AnimatePresence>
            {!isRecording && sessionTime > 0 && !sessionSaved && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSaveSession}
                disabled={isSaving}
                style={{
                  padding: '16px 32px',
                  background: isSaving
                    ? '#9CA3AF'
                    : 'linear-gradient(135deg, #7AB89E 0%, #10B981 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(122, 184, 158, 0.3)',
                }}
              >
                {isSaving ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <LoaderIcon />
                    </motion.span>
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon />
                    Save Session
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Saved Badge */}
          <AnimatePresence>
            {sessionSaved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'rgba(122, 184, 158, 0.15)',
                  borderRadius: '12px',
                  color: '#7AB89E',
                  fontWeight: '600',
                }}
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 300 }}
                >
                  ✓
                </motion.span>
                Saved!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recording Consent */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '20px',
          padding: '14px 18px',
          background: '#FAF7F3',
          borderRadius: '14px',
          border: '1px solid #F0E4D3',
        }}
      >
        <input
          type="checkbox"
          id="consent"
          checked={recordingConsent}
          onChange={(e) => onConsentChange(e.target.checked)}
          style={{
            width: '18px',
            height: '18px',
            cursor: 'pointer',
            accentColor: '#D9A299',
          }}
        />
        <label
          htmlFor="consent"
          style={{
            fontSize: '13px',
            color: '#6B6B6B',
            cursor: 'pointer',
          }}
        >
          Save session recording for playback and progress tracking
        </label>
      </motion.div>
    </motion.div>
  );
}
