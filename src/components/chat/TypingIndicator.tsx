'use client';

import { CSSProperties } from 'react';

interface TypingIndicatorProps {
  userName: string;
  darkMode?: boolean;
}

export default function TypingIndicator({ userName, darkMode = false }: TypingIndicatorProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    color: darkMode ? '#9CA3AF' : '#6B7280',
    animation: 'fadeIn 0.2s ease-in-out'
  };

  const dotContainerStyle: CSSProperties = {
    display: 'flex',
    gap: '3px',
    alignItems: 'center'
  };

  const dotStyle: CSSProperties = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: darkMode ? '#6B7280' : '#9CA3AF',
    animation: 'bounce 1.4s infinite ease-in-out'
  };

  return (
    <div style={containerStyle}>
      <div style={dotContainerStyle}>
        <span style={{ ...dotStyle, animationDelay: '0s' }} />
        <span style={{ ...dotStyle, animationDelay: '0.2s' }} />
        <span style={{ ...dotStyle, animationDelay: '0.4s' }} />
      </div>
      <span>{userName} is typing...</span>

      <style jsx global>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-4px);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
