'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { IncomingCallModal } from '@/components/chat/IncomingCallModal';
import { VideoCallModal } from '@/components/chat/VideoCallModal';
import { WEBRTC_CONFIG, MEDIA_CONSTRAINTS, CALL_TIMEOUT } from '@/lib/webrtc.config';
import type { CallStatus, CallParticipant } from '@/hooks/useVideoCall';

interface IncomingCallData {
  callId: string;
  callerId: string;
  callerName: string;
  callerIsTherapist: boolean;
  conversationId: string;
}

interface GlobalVideoCallContextType {
  incomingCall: IncomingCallData | null;
  isInCall: boolean;
  acceptCall: () => void;
  declineCall: () => void;
}

const GlobalVideoCallContext = createContext<GlobalVideoCallContextType | null>(null);

export function useGlobalVideoCall() {
  const context = useContext(GlobalVideoCallContext);
  if (!context) {
    throw new Error('useGlobalVideoCall must be used within GlobalVideoCallProvider');
  }
  return context;
}

export function GlobalVideoCallProvider({ children }: { children: ReactNode }) {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  
  // Call state
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callId, setCallId] = useState<string | null>(null);
  const [participant, setParticipant] = useState<CallParticipant | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);
  
  // Refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    pendingCandidatesRef.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    setDuration(0);
  }, []);

  // Get local media
  const getLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('[GlobalVideoCall] Failed to get media:', error);
      return null;
    }
  }, []);

  // Initialize peer connection
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(WEBRTC_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket && callId) {
        socket.emit('webrtc:ice-candidate', {
          sessionId: callId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('[GlobalVideoCall] Remote track received');
      setRemoteStream(event.streams[0]);
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[GlobalVideoCall] ICE state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setCallStatus('connected');
      } else if (pc.iceConnectionState === 'disconnected') {
        setCallStatus('reconnecting');
      } else if (pc.iceConnectionState === 'failed') {
        setCallStatus('failed');
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [socket, callId]);

  // Accept the incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall || !socket || !user) return;
    
    console.log('[GlobalVideoCall] Accepting call:', incomingCall.callId);
    
    // Clear timeout
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    // Get media first
    const stream = await getLocalMedia();
    if (!stream) {
      console.error('[GlobalVideoCall] Failed to get media for call');
      setIncomingCall(null);
      return;
    }

    setCallStatus('connecting');
    setCallId(incomingCall.callId);
    setParticipant({
      id: incomingCall.callerId,
      name: incomingCall.callerName,
      isTherapist: incomingCall.callerIsTherapist,
    });

    // Create peer connection and add tracks
    const pc = createPeerConnection();
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Join the call session room
    socket.emit('join:session', incomingCall.callId);

    // Emit acceptance - this tells caller to create offer
    socket.emit('video-call:accept' as never, {
      callId: incomingCall.callId,
      accepterId: user.id,
      accepterName: user.name,
    } as never);

    setIncomingCall(null);
  }, [incomingCall, socket, user, getLocalMedia, createPeerConnection]);

  // Decline the call
  const declineCall = useCallback(() => {
    if (!incomingCall || !socket || !user) return;

    socket.emit('video-call:decline' as never, {
      callId: incomingCall.callId,
      declinerId: user.id,
    } as never);

    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    setIncomingCall(null);
  }, [incomingCall, socket, user]);

  // End the call
  const endCall = useCallback(() => {
    if (!socket || !callId || !user) return;

    socket.emit('video-call:end' as never, {
      callId,
      endedBy: user.id,
    } as never);

    socket.emit('leave:session', callId);
    cleanup();
    setCallStatus('idle');
    setCallId(null);
    setParticipant(null);
  }, [socket, callId, user, cleanup]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, []);

  // Listen for incoming calls and WebRTC signaling
  useEffect(() => {
    if (!socket || !isConnected || !user) return;

    // Incoming call
    const handleIncomingCall = (data: IncomingCallData) => {
      if (data.callerId === user.id) return;
      if (incomingCall || callStatus !== 'idle') return;

      console.log('[GlobalVideoCall] Incoming call from:', data.callerName);
      setIncomingCall(data);

      // Auto-decline after timeout
      timeoutIdRef.current = setTimeout(() => {
        console.log('[GlobalVideoCall] Call timeout');
        socket.emit('video-call:decline' as never, {
          callId: data.callId,
          declinerId: user.id,
        } as never);
        setIncomingCall(null);
      }, CALL_TIMEOUT);
    };

    // WebRTC offer received (we are the answerer)
    const handleOffer = async (data: { sessionId: string; offer: RTCSessionDescriptionInit; peerId: string }) => {
      if (data.sessionId !== callId || !peerConnectionRef.current) return;

      console.log('[GlobalVideoCall] Received offer');
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        
        // Add pending candidates
        for (const candidate of pendingCandidatesRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidatesRef.current = [];

        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        socket.emit('webrtc:answer', {
          sessionId: callId,
          answer: peerConnectionRef.current.localDescription!,
        });

        // Start duration timer
        durationIntervalRef.current = setInterval(() => {
          setDuration(d => d + 1);
        }, 1000);
      } catch (error) {
        console.error('[GlobalVideoCall] Failed to handle offer:', error);
      }
    };

    // ICE candidate received
    const handleIceCandidate = async (data: { sessionId: string; candidate: RTCIceCandidateInit; peerId: string }) => {
      if (data.sessionId !== callId) return;

      if (peerConnectionRef.current?.remoteDescription) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
          console.error('[GlobalVideoCall] Failed to add ICE candidate:', error);
        }
      } else {
        pendingCandidatesRef.current.push(data.candidate);
      }
    };

    // Call ended by other party
    const handleCallEnded = (data: { callId: string }) => {
      if (incomingCall?.callId === data.callId) {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        setIncomingCall(null);
      }
      if (callId === data.callId) {
        cleanup();
        setCallStatus('ended');
        setCallId(null);
        setParticipant(null);
        // Reset to idle after showing ended state briefly
        setTimeout(() => setCallStatus('idle'), 2000);
      }
    };

    socket.on('video-call:incoming' as never, handleIncomingCall as never);
    socket.on('video-call:ended' as never, handleCallEnded as never);
    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:ice-candidate', handleIceCandidate);

    return () => {
      socket.off('video-call:incoming' as never, handleIncomingCall as never);
      socket.off('video-call:ended' as never, handleCallEnded as never);
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
    };
  }, [socket, isConnected, user, incomingCall, callId, callStatus, cleanup]);

  const isInCall = callStatus !== 'idle' && callStatus !== 'ended';

  return (
    <GlobalVideoCallContext.Provider value={{ incomingCall, isInCall, acceptCall, declineCall }}>
      {children}
      
      {/* Global Incoming Call Modal */}
      <IncomingCallModal
        isOpen={!!incomingCall}
        caller={incomingCall ? {
          id: incomingCall.callerId,
          name: incomingCall.callerName,
          isTherapist: incomingCall.callerIsTherapist,
        } : null}
        onAccept={acceptCall}
        onDecline={declineCall}
      />

      {/* Global Video Call Modal - shows when in a call */}
      <VideoCallModal
        isOpen={isInCall && callStatus !== 'incoming'}
        status={callStatus}
        localStream={localStream}
        remoteStream={remoteStream}
        participant={participant}
        duration={duration}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={false}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={() => {}} // Not implemented in global provider
        onEndCall={endCall}
      />
    </GlobalVideoCallContext.Provider>
  );
}
