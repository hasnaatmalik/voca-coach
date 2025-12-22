'use client';

import { useEffect, useRef } from 'react';
import { ConnectionState } from '@/lib/webrtc-manager';
import VideoControls from './VideoControls';
import CallStatus from './CallStatus';

interface VideoCallProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: ConnectionState;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
  onEndCall: () => void;
  remoteName?: string;
  isTherapist?: boolean;
}

export default function VideoCall({
  localStream,
  remoteStream,
  connectionState,
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  onToggleMute,
  onToggleCamera,
  onStartScreenShare,
  onStopScreenShare,
  onEndCall,
  remoteName = 'Waiting for participant...',
  isTherapist: _isTherapist = false,
}: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Set local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '400px',
      background: '#1F2937',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      {/* Remote Video (Main) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {remoteStream ? (
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
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              marginBottom: '16px',
            }}>
              {remoteName.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '500' }}>{remoteName}</div>
            <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '8px' }}>
              {connectionState === 'connecting' && 'Connecting...'}
              {connectionState === 'reconnecting' && 'Reconnecting...'}
              {connectionState === 'idle' && 'Waiting to connect...'}
            </div>
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 10,
      }}>
        <CallStatus state={connectionState} />
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div style={{
        position: 'absolute',
        bottom: '100px',
        right: '16px',
        width: '180px',
        height: '135px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#374151',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: 10,
      }}>
        {localStream && isVideoEnabled ? (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)', // Mirror the local video
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
          }}>
            {!isVideoEnabled ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>📷</div>
                <div>Camera off</div>
              </div>
            ) : (
              'Loading...'
            )}
          </div>
        )}

        {/* Muted indicator */}
        {!isAudioEnabled && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            padding: '4px 8px',
            background: '#DC2626',
            borderRadius: '4px',
            fontSize: '11px',
            color: 'white',
            fontWeight: '500',
          }}>
            Muted
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
      }}>
        <VideoControls
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
          onToggleMute={onToggleMute}
          onToggleCamera={onToggleCamera}
          onStartScreenShare={onStartScreenShare}
          onStopScreenShare={onStopScreenShare}
          onEndCall={onEndCall}
        />
      </div>

      {/* Screen sharing indicator */}
      {isScreenSharing && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          padding: '8px 16px',
          background: '#7C3AED',
          borderRadius: '8px',
          color: 'white',
          fontSize: '13px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10,
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10B981',
            animation: 'pulse 2s infinite',
          }} />
          Sharing screen
        </div>
      )}
    </div>
  );
}
