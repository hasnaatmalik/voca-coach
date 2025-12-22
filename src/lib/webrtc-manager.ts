// WebRTC connection manager for peer-to-peer video calls

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'failed' | 'closed';

export interface WebRTCCallbacks {
  onRemoteStream: (stream: MediaStream) => void;
  onIceCandidate: (candidate: RTCIceCandidate) => void;
  onConnectionStateChange: (state: ConnectionState) => void;
  onDataChannelMessage?: (message: string) => void;
}

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private callbacks: WebRTCCallbacks;

  // Free STUN servers from Google
  private iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ];

  constructor(callbacks: WebRTCCallbacks) {
    this.callbacks = callbacks;
  }

  async initialize(): Promise<void> {
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers,
      iceCandidatePoolSize: 10,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.peerConnection) return;

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.callbacks.onIceCandidate(event.candidate);
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.callbacks.onRemoteStream(event.streams[0]);
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      let mappedState: ConnectionState = 'idle';

      switch (state) {
        case 'connecting':
          mappedState = 'connecting';
          break;
        case 'connected':
          mappedState = 'connected';
          break;
        case 'disconnected':
          mappedState = 'reconnecting';
          break;
        case 'failed':
          mappedState = 'failed';
          break;
        case 'closed':
          mappedState = 'closed';
          break;
        default:
          mappedState = 'idle';
      }

      this.callbacks.onConnectionStateChange(mappedState);
    };

    // Handle ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
    };

    // Handle data channel
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };
  }

  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onmessage = (event) => {
      this.callbacks.onDataChannelMessage?.(event.data);
    };

    this.dataChannel.onopen = () => {
      console.log('Data channel opened');
    };

    this.dataChannel.onclose = () => {
      console.log('Data channel closed');
    };
  }

  async getLocalStream(constraints: MediaStreamConstraints = { video: true, audio: true }): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Add tracks to peer connection
      if (this.peerConnection) {
        this.localStream.getTracks().forEach((track) => {
          if (this.localStream && this.peerConnection) {
            this.peerConnection.addTrack(track, this.localStream);
          }
        });
      }

      return this.localStream;
    } catch (error) {
      console.error('Error getting local stream:', error);

      // If video fails, try audio only
      if (constraints.video) {
        console.log('Video failed, trying audio only');
        return this.getLocalStream({ video: false, audio: true });
      }

      throw error;
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    // Create data channel for chat (only caller creates it)
    this.dataChannel = this.peerConnection.createDataChannel('chat');
    this.setupDataChannel();

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    await this.peerConnection.setLocalDescription(offer);

    return offer;
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    return answer;
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  async startScreenShare(): Promise<MediaStream> {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });

    // Replace video track with screen share track
    if (this.peerConnection && this.localStream) {
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find(
        (s) => s.track?.kind === 'video'
      );

      if (sender) {
        await sender.replaceTrack(videoTrack);
      }
    }

    return screenStream;
  }

  async stopScreenShare(): Promise<void> {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      const sender = this.peerConnection?.getSenders().find(
        (s) => s.track?.kind === 'video'
      );

      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }
    }
  }

  sendMessage(message: string): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(message);
    }
  }

  cleanup(): void {
    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  getStream(): MediaStream | null {
    return this.localStream;
  }

  getConnectionState(): ConnectionState {
    if (!this.peerConnection) return 'idle';

    const state = this.peerConnection.connectionState;
    switch (state) {
      case 'connecting':
        return 'connecting';
      case 'connected':
        return 'connected';
      case 'disconnected':
        return 'reconnecting';
      case 'failed':
        return 'failed';
      case 'closed':
        return 'closed';
      default:
        return 'idle';
    }
  }
}
