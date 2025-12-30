'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import { WEBRTC_CONFIG, MEDIA_CONSTRAINTS, SCREEN_SHARE_CONSTRAINTS, CALL_TIMEOUT } from '@/lib/webrtc.config';

export type CallStatus = 
  | 'idle' 
  | 'calling' 
  | 'incoming' 
  | 'connecting' 
  | 'connected' 
  | 'reconnecting'
  | 'ended' 
  | 'declined' 
  | 'missed' 
  | 'failed';

export interface CallParticipant {
  id: string;
  name: string;
  isTherapist: boolean;
}

export interface VideoCallState {
  status: CallStatus;
  callId: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  duration: number;
  participant: CallParticipant | null;
  error: string | null;
}

interface UseVideoCallOptions {
  conversationId: string | null;
  userId: string;
  userName: string;
  isTherapist: boolean;
  onCallEnded?: (duration: number) => void;
}

export function useVideoCall({
  conversationId,
  userId,
  userName,
  isTherapist,
  onCallEnded,
}: UseVideoCallOptions) {
  const { socket, isConnected } = useSocket();
  
  // State
  const [state, setState] = useState<VideoCallState>({
    status: 'idle',
    callId: null,
    localStream: null,
    remoteStream: null,
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    duration: 0,
    participant: null,
    error: null,
  });

  // Refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Helper to update state
  const updateState = useCallback((updates: Partial<VideoCallState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clean up media streams
  const cleanupMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
  }, []);

  // Clean up peer connection
  const cleanupPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    pendingCandidatesRef.current = [];
  }, []);

  // Clean up timers
  const cleanupTimers = useCallback(() => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  // Full cleanup
  const cleanup = useCallback(() => {
    cleanupMedia();
    cleanupPeerConnection();
    cleanupTimers();
    
    const duration = callStartTimeRef.current 
      ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
      : 0;
    
    callStartTimeRef.current = null;
    
    return duration;
  }, [cleanupMedia, cleanupPeerConnection, cleanupTimers]);

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(WEBRTC_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket && state.callId) {
        socket.emit('webrtc:ice-candidate', {
          sessionId: state.callId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      updateState({ remoteStream });
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[VideoCall] ICE state:', pc.iceConnectionState);
      
      switch (pc.iceConnectionState) {
        case 'connected':
        case 'completed':
          updateState({ status: 'connected' });
          break;
        case 'disconnected':
          updateState({ status: 'reconnecting' });
          break;
        case 'failed':
          updateState({ status: 'failed', error: 'Connection failed' });
          break;
        case 'closed':
          // Connection closed
          break;
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[VideoCall] Connection state:', pc.connectionState);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [socket, state.callId, updateState]);

  // Get local media stream
  const getLocalStream = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      localStreamRef.current = stream;
      updateState({ localStream: stream });
      return stream;
    } catch (error) {
      console.error('[VideoCall] Failed to get media:', error);
      updateState({ error: 'Could not access camera/microphone' });
      return null;
    }
  }, [updateState]);

  // Add local tracks to peer connection
  const addLocalTracks = useCallback((pc: RTCPeerConnection, stream: MediaStream) => {
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });
  }, []);

  // Process pending ICE candidates
  const processPendingCandidates = useCallback(async (pc: RTCPeerConnection) => {
    for (const candidate of pendingCandidatesRef.current) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('[VideoCall] Failed to add pending candidate:', error);
      }
    }
    pendingCandidatesRef.current = [];
  }, []);

  // Start call duration timer
  const startDurationTimer = useCallback(() => {
    callStartTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        const duration = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        updateState({ duration });
      }
    }, 1000);
  }, [updateState]);

  // Initiate a call
  const initiateCall = useCallback(async (participantId: string, participantName: string, participantIsTherapist: boolean) => {
    if (!socket || !isConnected || !conversationId) {
      updateState({ error: 'Not connected' });
      return;
    }

    try {
      // Get local media first
      const stream = await getLocalStream();
      if (!stream) return;

      const callId = `call-${conversationId}-${Date.now()}`;
      
      updateState({
        status: 'calling',
        callId,
        participant: {
          id: participantId,
          name: participantName,
          isTherapist: participantIsTherapist,
        },
        error: null,
      });

      // Emit call initiation
      socket.emit('video-call:initiate' as never, {
        conversationId,
        callId,
        callerId: userId,
        callerName: userName,
        callerIsTherapist: isTherapist,
        receiverId: participantId,
      } as never);

      // Set timeout for unanswered call
      callTimeoutRef.current = setTimeout(() => {
        if (state.status === 'calling') {
          socket.emit('video-call:timeout' as never, { callId } as never);
          const duration = cleanup();
          updateState({ status: 'missed', callId: null });
          onCallEnded?.(duration);
        }
      }, CALL_TIMEOUT);

    } catch (error) {
      console.error('[VideoCall] Failed to initiate call:', error);
      cleanup();
      updateState({ status: 'failed', error: 'Failed to start call' });
    }
  }, [socket, isConnected, conversationId, userId, userName, isTherapist, getLocalStream, cleanup, updateState, state.status, onCallEnded]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!socket || !state.callId) return;

    try {
      // Get local media
      const stream = await getLocalStream();
      if (!stream) return;

      updateState({ status: 'connecting' });

      // Initialize peer connection
      const pc = initializePeerConnection();
      addLocalTracks(pc, stream);

      // Emit acceptance
      socket.emit('video-call:accept' as never, {
        callId: state.callId,
        accepterId: userId,
        accepterName: userName,
      } as never);

      // Clear timeout
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }

    } catch (error) {
      console.error('[VideoCall] Failed to accept call:', error);
      cleanup();
      updateState({ status: 'failed', error: 'Failed to accept call' });
    }
  }, [socket, state.callId, userId, userName, getLocalStream, initializePeerConnection, addLocalTracks, cleanup, updateState]);

  // Decline incoming call
  const declineCall = useCallback(() => {
    if (!socket || !state.callId) return;

    socket.emit('video-call:decline' as never, {
      callId: state.callId,
      declinerId: userId,
    } as never);

    cleanup();
    updateState({ status: 'idle', callId: null, participant: null });
  }, [socket, state.callId, userId, cleanup, updateState]);

  // End active call
  const endCall = useCallback(() => {
    if (!socket || !state.callId) return;

    socket.emit('video-call:end' as never, {
      callId: state.callId,
      endedBy: userId,
    } as never);

    const duration = cleanup();
    updateState({ 
      status: 'ended', 
      callId: null, 
      localStream: null, 
      remoteStream: null,
      participant: null,
      duration: 0,
    });
    onCallEnded?.(duration);
  }, [socket, state.callId, userId, cleanup, updateState, onCallEnded]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        updateState({ isMuted: !audioTrack.enabled });
        
        // Notify peer
        if (socket && state.callId) {
          socket.emit('webrtc:media-state', {
            sessionId: state.callId,
            audio: audioTrack.enabled,
            video: !state.isVideoOff,
          });
        }
      }
    }
  }, [socket, state.callId, state.isVideoOff, updateState]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        updateState({ isVideoOff: !videoTrack.enabled });
        
        // Notify peer
        if (socket && state.callId) {
          socket.emit('webrtc:media-state', {
            sessionId: state.callId,
            audio: !state.isMuted,
            video: videoTrack.enabled,
          });
        }
      }
    }
  }, [socket, state.callId, state.isMuted, updateState]);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    if (!peerConnectionRef.current || !localStreamRef.current) return;

    try {
      if (state.isScreenSharing) {
        // Stop screen share
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
        }

        // Replace with camera
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
        updateState({ isScreenSharing: false });
      } else {
        // Start screen share
        const screenStream = await navigator.mediaDevices.getDisplayMedia(SCREEN_SHARE_CONSTRAINTS);
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender && screenTrack) {
          await sender.replaceTrack(screenTrack);
        }

        // Handle screen share stop
        screenTrack.onended = () => {
          toggleScreenShare();
        };

        updateState({ isScreenSharing: true });
      }
    } catch (error) {
      console.error('[VideoCall] Screen share error:', error);
    }
  }, [state.isScreenSharing, updateState]);

  // Reset to idle state
  const resetCall = useCallback(() => {
    cleanup();
    updateState({
      status: 'idle',
      callId: null,
      localStream: null,
      remoteStream: null,
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      duration: 0,
      participant: null,
      error: null,
    });
  }, [cleanup, updateState]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Incoming call
    const handleIncomingCall = (data: {
      callId: string;
      callerId: string;
      callerName: string;
      callerIsTherapist: boolean;
      conversationId: string;
    }) => {
      // Accept incoming calls when idle, regardless of which conversation is selected
      // This ensures calls are received even if user is on a different page/conversation
      if (state.status === 'idle') {
        console.log('[VideoCall] Incoming call from:', data.callerName, 'for conversation:', data.conversationId);
        updateState({
          status: 'incoming',
          callId: data.callId,
          participant: {
            id: data.callerId,
            name: data.callerName,
            isTherapist: data.callerIsTherapist,
          },
        });

        // Auto-decline after timeout
        callTimeoutRef.current = setTimeout(() => {
          if (state.status === 'incoming') {
            declineCall();
          }
        }, CALL_TIMEOUT);
      }
    };

    // Call accepted - initiator creates offer
    const handleCallAccepted = async (data: { callId: string }) => {
      if (data.callId !== state.callId) return;

      try {
        updateState({ status: 'connecting' });
        
        const pc = initializePeerConnection();
        if (localStreamRef.current) {
          addLocalTracks(pc, localStreamRef.current);
        }

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('webrtc:offer', {
          sessionId: state.callId!,
          offer: pc.localDescription!,
        });

        startDurationTimer();
      } catch (error) {
        console.error('[VideoCall] Failed to create offer:', error);
        updateState({ status: 'failed', error: 'Connection failed' });
      }
    };

    // Call declined
    const handleCallDeclined = (data: { callId: string }) => {
      if (data.callId !== state.callId) return;
      cleanup();
      updateState({ status: 'declined', callId: null, participant: null });
    };

    // Call ended by peer
    const handleCallEnded = (data: { callId: string }) => {
      if (data.callId !== state.callId) return;
      const duration = cleanup();
      updateState({ 
        status: 'ended', 
        callId: null, 
        localStream: null, 
        remoteStream: null,
        participant: null,
      });
      onCallEnded?.(duration);
    };

    // WebRTC offer received
    const handleOffer = async (data: { sessionId: string; offer: RTCSessionDescriptionInit; peerId: string }) => {
      if (data.sessionId !== state.callId || !peerConnectionRef.current) return;

      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        await processPendingCandidates(peerConnectionRef.current);

        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        socket.emit('webrtc:answer', {
          sessionId: state.callId!,
          answer: peerConnectionRef.current.localDescription!,
        });

        startDurationTimer();
      } catch (error) {
        console.error('[VideoCall] Failed to handle offer:', error);
        updateState({ status: 'failed', error: 'Connection failed' });
      }
    };

    // WebRTC answer received
    const handleAnswer = async (data: { sessionId: string; answer: RTCSessionDescriptionInit; peerId: string }) => {
      if (data.sessionId !== state.callId || !peerConnectionRef.current) return;

      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        await processPendingCandidates(peerConnectionRef.current);
      } catch (error) {
        console.error('[VideoCall] Failed to handle answer:', error);
      }
    };

    // ICE candidate received
    const handleIceCandidate = async (data: { sessionId: string; candidate: RTCIceCandidateInit; peerId: string }) => {
      if (data.sessionId !== state.callId) return;

      if (peerConnectionRef.current?.remoteDescription) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
          console.error('[VideoCall] Failed to add ICE candidate:', error);
        }
      } else {
        // Queue candidate for later
        pendingCandidatesRef.current.push(data.candidate);
      }
    };

    // Peer media state changed
    const handlePeerMediaState = (data: { sessionId: string; peerId: string; audio: boolean; video: boolean }) => {
      if (data.sessionId !== state.callId) return;
      // Could update UI to show peer's mute/video state
      console.log('[VideoCall] Peer media state:', data);
    };

    socket.on('video-call:incoming' as never, handleIncomingCall as never);
    socket.on('video-call:accepted' as never, handleCallAccepted as never);
    socket.on('video-call:declined' as never, handleCallDeclined as never);
    socket.on('video-call:ended' as never, handleCallEnded as never);
    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswer);
    socket.on('webrtc:ice-candidate', handleIceCandidate);
    socket.on('webrtc:peer-media-state', handlePeerMediaState);

    return () => {
      socket.off('video-call:incoming' as never, handleIncomingCall as never);
      socket.off('video-call:accepted' as never, handleCallAccepted as never);
      socket.off('video-call:declined' as never, handleCallDeclined as never);
      socket.off('video-call:ended' as never, handleCallEnded as never);
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:answer', handleAnswer);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
      socket.off('webrtc:peer-media-state', handlePeerMediaState);
    };
  }, [
    socket, 
    isConnected, 
    conversationId, 
    state.callId, 
    state.status,
    initializePeerConnection, 
    addLocalTracks, 
    processPendingCandidates,
    startDurationTimer,
    cleanup, 
    updateState,
    declineCall,
    onCallEnded,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    ...state,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    resetCall,
    isCallActive: ['calling', 'incoming', 'connecting', 'connected', 'reconnecting'].includes(state.status),
  };
}
