'use client';

interface VideoControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
  onEndCall: () => void;
}

export default function VideoControls({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  onToggleMute,
  onToggleCamera,
  onStartScreenShare,
  onStopScreenShare,
  onEndCall,
}: VideoControlsProps) {
  const buttonStyle = (active: boolean, isEnd = false) => ({
    width: isEnd ? '64px' : '52px',
    height: '52px',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    background: isEnd
      ? '#DC2626'
      : active
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(220, 38, 38, 0.8)',
  });

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '12px 20px',
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
    }}>
      {/* Mute/Unmute */}
      <button
        onClick={onToggleMute}
        style={buttonStyle(isAudioEnabled)}
        title={isAudioEnabled ? 'Mute' : 'Unmute'}
      >
        {isAudioEnabled ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </button>

      {/* Camera On/Off */}
      <button
        onClick={onToggleCamera}
        style={buttonStyle(isVideoEnabled)}
        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoEnabled ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        )}
      </button>

      {/* Screen Share */}
      <button
        onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
        style={{
          ...buttonStyle(!isScreenSharing),
          background: isScreenSharing ? '#7C3AED' : 'rgba(255, 255, 255, 0.2)',
        }}
        title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </button>

      {/* End Call */}
      <button
        onClick={onEndCall}
        style={buttonStyle(false, true)}
        title="End call"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 16.92c-.5.49-2.18 1.92-4.5 2.92-1.06.46-2.06.66-3.18.66a9.91 9.91 0 0 1-6.16-2.18c-.7-.55-1.34-1.16-1.91-1.8" />
          <path d="M1 7.08c.5-.49 2.18-1.92 4.5-2.92 1.06-.46 2.06-.66 3.18-.66a9.91 9.91 0 0 1 6.16 2.18c.7.55 1.34 1.16 1.91 1.8" />
          <line x1="23" y1="1" x2="1" y2="23" />
        </svg>
      </button>
    </div>
  );
}
