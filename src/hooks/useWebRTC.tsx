'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { WebRTCManager, ConnectionState } from '@/lib/webrtc-manager';

interface UseWebRTCOptions {
  sessionId: string;
  socket: Socket | null;
  isInitiator?: boolean;
}

export function useWebRTC({ sessionId, socket, isInitiator = false }: UseWebRTCOptions) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const managerRef = useRef<WebRTCManager | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Initialize WebRTC manager
  const initializeManager = useCallback(() => {
    if (managerRef.current) return;

    managerRef.current = new WebRTCManager({
      onRemoteStream: (stream) => {
        console.log('Received remote stream');
        setRemoteStream(stream);
      },
      onIceCandidate: (candidate) => {
        if (socket) {
          socket.emit('webrtc:ice-candidate', {
            sessionId,
            candidate: candidate.toJSON(),
          });
        }
      },
      onConnectionStateChange: (state) => {
        console.log('Connection state:', state);
        setConnectionState(state);
      },
    });
  }, [socket, sessionId]);

  // Start call
  const startCall = useCallback(async (withVideo = true) => {
    try {
      setError(null);
      setConnectionState('connecting');

      initializeManager();

      if (!managerRef.current) {
        throw new Error('Failed to initialize WebRTC manager');
      }

      await managerRef.current.initialize();

      // Get local media
      const stream = await managerRef.current.getLocalStream({
        video: withVideo,
        audio: true,
      });

      setLocalStream(stream);
      setIsVideoEnabled(stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled);

      // If we're the initiator, create and send offer
      if (isInitiator) {
        const offer = await managerRef.current.createOffer();
        socket?.emit('webrtc:offer', { sessionId, offer });
      }
    } catch (err) {
      console.error('Error starting call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
      setConnectionState('failed');
    }
  }, [initializeManager, isInitiator, socket, sessionId]);

  // End call
  const endCall = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.cleanup();
      managerRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState('closed');
    setIsScreenSharing(false);
  }, []);

  // Toggle audio
  const toggleMute = useCallback(() => {
    if (managerRef.current) {
      const newState = !isAudioEnabled;
      managerRef.current.toggleAudio(newState);
      setIsAudioEnabled(newState);

      // Notify peer of media state change
      socket?.emit('webrtc:media-state', {
        sessionId,
        audio: newState,
        video: isVideoEnabled,
      });
    }
  }, [isAudioEnabled, isVideoEnabled, socket, sessionId]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (managerRef.current) {
      const newState = !isVideoEnabled;
      managerRef.current.toggleVideo(newState);
      setIsVideoEnabled(newState);

      socket?.emit('webrtc:media-state', {
        sessionId,
        audio: isAudioEnabled,
        video: newState,
      });
    }
  }, [isVideoEnabled, isAudioEnabled, socket, sessionId]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    if (!managerRef.current) return;

    try {
      const screenStream = await managerRef.current.startScreenShare();
      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);

      // When screen share ends (user clicks "Stop Sharing")
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error('Error starting screen share:', err);
      setError('Failed to start screen sharing');
    }
  }, []);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    if (!managerRef.current) return;

    try {
      await managerRef.current.stopScreenShare();

      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }

      setIsScreenSharing(false);
    } catch (err) {
      console.error('Error stopping screen share:', err);
    }
  }, []);

  // Handle socket events for WebRTC signaling
  useEffect(() => {
    if (!socket) return;

    const handleOffer = async ({ offer, peerId }: { sessionId: string; offer: RTCSessionDescriptionInit; peerId: string }) => {
      console.log('Received offer from:', peerId);

      try {
        initializeManager();

        if (!managerRef.current) return;

        await managerRef.current.initialize();

        // Get local media if we haven't already
        if (!localStream) {
          const stream = await managerRef.current.getLocalStream({ video: true, audio: true });
          setLocalStream(stream);
        }

        const answer = await managerRef.current.handleOffer(offer);
        socket.emit('webrtc:answer', { sessionId, answer });
      } catch (err) {
        console.error('Error handling offer:', err);
        setError('Failed to handle incoming call');
      }
    };

    const handleAnswer = async ({ answer }: { sessionId: string; answer: RTCSessionDescriptionInit }) => {
      console.log('Received answer');

      try {
        if (managerRef.current) {
          await managerRef.current.handleAnswer(answer);
        }
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    };

    const handleIceCandidate = async ({ candidate }: { sessionId: string; candidate: RTCIceCandidateInit }) => {
      try {
        if (managerRef.current) {
          await managerRef.current.addIceCandidate(candidate);
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    };

    const handlePeerJoined = ({ peerId, peerName }: { sessionId: string; peerId: string; peerName: string; isTherapist: boolean }) => {
      console.log('Peer joined:', peerName);

      // If we're the initiator and a peer joins, send a new offer
      if (isInitiator && managerRef.current) {
        startCall();
      }
    };

    const handlePeerLeft = ({ peerId }: { sessionId: string; peerId: string }) => {
      console.log('Peer left:', peerId);
      setRemoteStream(null);
      setConnectionState('reconnecting');
    };

    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswer);
    socket.on('webrtc:ice-candidate', handleIceCandidate);
    socket.on('webrtc:peer-joined', handlePeerJoined);
    socket.on('webrtc:peer-left', handlePeerLeft);

    return () => {
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:answer', handleAnswer);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
      socket.off('webrtc:peer-joined', handlePeerJoined);
      socket.off('webrtc:peer-left', handlePeerLeft);
    };
  }, [socket, sessionId, isInitiator, initializeManager, localStream, startCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    connectionState,
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    error,
    startCall,
    endCall,
    toggleMute,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
  };
}
