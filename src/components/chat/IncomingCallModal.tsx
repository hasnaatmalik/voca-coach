'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CallParticipant } from '@/hooks/useVideoCall';

interface IncomingCallModalProps {
  isOpen: boolean;
  caller: CallParticipant | null;
  onAccept: () => void;
  onDecline: () => void;
}

export function IncomingCallModal({
  isOpen,
  caller,
  onAccept,
  onDecline,
}: IncomingCallModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play ringtone
  useEffect(() => {
    if (isOpen) {
      // Create oscillator-based ringtone (no external file needed)
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      const playTone = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 440;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      };

      const interval = setInterval(playTone, 1500);
      playTone();

      return () => {
        clearInterval(interval);
        audioContext.close();
      };
    }
  }, [isOpen]);

  if (!isOpen || !caller) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            style={{
              background: 'linear-gradient(145deg, #1e1e2e 0%, #2d2d44 100%)',
              borderRadius: '32px',
              padding: '48px',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              minWidth: '360px',
            }}
          >
            {/* Animated Avatar with Ring */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
              {/* Pulsing rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 2.5],
                    opacity: [0.3, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: 'easeOut',
                  }}
                  style={{
                    position: 'absolute',
                    inset: '-10px',
                    borderRadius: '50%',
                    border: '2px solid #667eea',
                  }}
                />
              ))}
              
              {/* Avatar */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  fontWeight: 600,
                  color: 'white',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {caller.name.charAt(0).toUpperCase()}
              </motion.div>
            </div>

            {/* Caller Info */}
            <h2 style={{ 
              color: 'white', 
              fontSize: '24px', 
              fontWeight: 600, 
              margin: '0 0 8px',
            }}>
              {caller.name}
            </h2>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: '16px',
              margin: '0 0 8px',
            }}>
              {caller.isTherapist ? 'Therapist' : 'Student'}
            </p>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.5)', 
              fontSize: '14px',
              margin: '0 0 32px',
            }}>
              Incoming video call...
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
              {/* Decline Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDecline}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  <line x1="23" y1="1" x2="1" y2="23" />
                </svg>
              </motion.button>

              {/* Accept Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 4px 20px rgba(74, 222, 128, 0.4)',
                    '0 4px 40px rgba(74, 222, 128, 0.6)',
                    '0 4px 20px rgba(74, 222, 128, 0.4)',
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                onClick={onAccept}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </motion.button>
            </div>

            {/* Button Labels */}
            <div style={{ 
              display: 'flex', 
              gap: '24px', 
              justifyContent: 'center',
              marginTop: '12px',
            }}>
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '12px',
                width: '70px',
                textAlign: 'center',
              }}>
                Decline
              </span>
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '12px',
                width: '70px',
                textAlign: 'center',
              }}>
                Accept
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
