'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CallStatus, CallParticipant } from '@/hooks/useVideoCall';

interface VideoCallModalProps {
  isOpen: boolean;
  status: CallStatus;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  participant: CallParticipant | null;
  duration: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
  onMinimize?: () => void;
}

// Format seconds to mm:ss
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function VideoCallModal({
  isOpen,
  status,
  localStream,
  remoteStream,
  participant,
  duration,
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
  onMinimize,
}: VideoCallModalProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!isOpen) return null;

  const isConnecting = status === 'connecting' || status === 'calling';
  const isConnected = status === 'connected';
  const isReconnecting = status === 'reconnecting';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: isMinimized ? 'auto 20px 100px auto' : 0,
            zIndex: 9999,
            background: isMinimized ? 'transparent' : 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Main Video Area */}
          <motion.div
            layout
            style={{
              width: isMinimized ? '280px' : '100%',
              height: isMinimized ? '200px' : '100%',
              maxWidth: isMinimized ? '280px' : '100%',
              position: 'relative',
              borderRadius: isMinimized ? '16px' : 0,
              overflow: 'hidden',
              boxShadow: isMinimized ? '0 8px 32px rgba(0, 0, 0, 0.3)' : 'none',
            }}
          >
            {/* Remote Video (Full Screen) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#1a1a2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {remoteStream && isConnected ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    color: 'white',
                  }}
                >
                  {/* Avatar placeholder */}
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                      fontWeight: 600,
                      color: 'white',
                    }}
                  >
                    {participant?.name.charAt(0).toUpperCase() || '?'}
                  </div>
                  <p style={{ fontSize: '20px', fontWeight: 500, margin: 0 }}>
                    {participant?.name || 'Unknown'}
                  </p>
                  <p style={{ fontSize: '14px', opacity: 0.7, margin: 0 }}>
                    {isConnecting && 'Connecting...'}
                    {isReconnecting && 'Reconnecting...'}
                    {status === 'calling' && 'Calling...'}
                  </p>

                  {/* Connection animation */}
                  {(isConnecting || status === 'calling') && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#667eea',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Local Video (Picture-in-Picture) */}
            {localStream && !isMinimized && (
              <motion.div
                drag
                dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
                dragElastic={0.1}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  position: 'absolute',
                  right: '20px',
                  bottom: '100px',
                  width: '200px',
                  height: '150px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'grab',
                }}
              >
                {isVideoOff ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: '#2d2d44',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <line x1="3.27" y1="6.96" x2="12" y2="12.01" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </div>
                ) : (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'scaleX(-1)', // Mirror local video
                    }}
                  />
                )}
              </motion.div>
            )}

            {/* Top Bar */}
            {!isMinimized && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
                }}
              >
                {/* Call info */}
                <div style={{ color: 'white' }}>
                  <p style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                    {participant?.name || 'Video Call'}
                  </p>
                  {isConnected && (
                    <p style={{ fontSize: '14px', opacity: 0.8, margin: '4px 0 0' }}>
                      {formatDuration(duration)}
                    </p>
                  )}
                </div>

                {/* Minimize button */}
                <button
                  onClick={() => {
                    setIsMinimized(true);
                    onMinimize?.();
                  }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="4 14 10 14 10 20" />
                    <polyline points="20 10 14 10 14 4" />
                    <line x1="14" y1="10" x2="21" y2="3" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                </button>
              </div>
            )}

            {/* Expand button for minimized state */}
            {isMinimized && (
              <button
                onClick={() => setIsMinimized(false)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </button>
            )}

            {/* Controls Bar */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                position: 'absolute',
                bottom: isMinimized ? '8px' : '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: isMinimized ? '8px' : '16px',
                padding: isMinimized ? '8px' : '16px 24px',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50px',
              }}
            >
              {/* Mute Button */}
              <ControlButton
                onClick={onToggleMute}
                isActive={!isMuted}
                activeColor="#4ade80"
                icon={
                  isMuted ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  )
                }
                isSmall={isMinimized}
              />

              {/* Video Button */}
              <ControlButton
                onClick={onToggleVideo}
                isActive={!isVideoOff}
                activeColor="#4ade80"
                icon={
                  isVideoOff ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  )
                }
                isSmall={isMinimized}
              />

              {/* Screen Share Button */}
              {!isMinimized && (
                <ControlButton
                  onClick={onToggleScreenShare}
                  isActive={isScreenSharing}
                  activeColor="#60a5fa"
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  }
                  isSmall={isMinimized}
                />
              )}

              {/* End Call Button */}
              <button
                onClick={onEndCall}
                style={{
                  width: isMinimized ? '40px' : '56px',
                  height: isMinimized ? '40px' : '56px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <svg width={isMinimized ? '20' : '24'} height={isMinimized ? '20' : '24'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  <line x1="23" y1="1" x2="1" y2="23" />
                </svg>
              </button>
            </motion.div>

            {/* Connection Quality Indicator */}
            {isConnected && !isMinimized && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '120px',
                  left: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '20px',
                  color: 'white',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      style={{
                        width: '3px',
                        height: `${bar * 3 + 4}px`,
                        borderRadius: '1px',
                        background: bar <= 3 ? '#4ade80' : 'rgba(255,255,255,0.3)',
                      }}
                    />
                  ))}
                </div>
                Good connection
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Control Button Component
function ControlButton({
  onClick,
  isActive,
  activeColor,
  icon,
  isSmall,
}: {
  onClick: () => void;
  isActive: boolean;
  activeColor: string;
  icon: React.ReactNode;
  isSmall?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: isSmall ? '40px' : '52px',
        height: isSmall ? '40px' : '52px',
        borderRadius: '50%',
        border: 'none',
        background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(239, 68, 68, 0.8)',
        color: isActive ? 'white' : 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s, background 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        if (isActive) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.background = isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(239, 68, 68, 0.8)';
      }}
    >
      {icon}
    </button>
  );
}
