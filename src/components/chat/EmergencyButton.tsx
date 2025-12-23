'use client';

import { useState, CSSProperties } from 'react';

interface EmergencyButtonProps {
  onActivate?: () => void;
  darkMode?: boolean;
}

const CRISIS_RESOURCES = [
  {
    name: 'National Suicide Prevention Lifeline',
    number: '988',
    description: 'Free, 24/7 support for people in distress',
    action: 'tel:988'
  },
  {
    name: 'Crisis Text Line',
    number: 'Text HOME to 741741',
    description: 'Text-based crisis support',
    action: 'sms:741741?body=HOME'
  },
  {
    name: 'SAMHSA National Helpline',
    number: '1-800-662-4357',
    description: 'Treatment referrals and information',
    action: 'tel:18006624357'
  },
  {
    name: 'Emergency Services',
    number: '911',
    description: 'For immediate life-threatening emergencies',
    action: 'tel:911'
  }
];

export default function EmergencyButton({
  onActivate,
  darkMode = false
}: EmergencyButtonProps) {
  const [showResources, setShowResources] = useState(false);

  const handleActivate = () => {
    setShowResources(true);
    onActivate?.();
  };

  // Fixed SOS button
  const buttonStyle: CSSProperties = {
    position: 'fixed',
    bottom: '100px',
    right: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
    border: 'none',
    color: 'white',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 90,
    transition: 'transform 0.2s'
  };

  // Modal overlay
  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const modalStyle: CSSProperties = {
    background: darkMode ? '#1F2937' : 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  };

  const headerStyle: CSSProperties = {
    background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
    padding: '24px 20px',
    color: 'white',
    textAlign: 'center'
  };

  const titleStyle: CSSProperties = {
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
    marginBottom: '8px'
  };

  const subtitleStyle: CSSProperties = {
    fontSize: '14px',
    opacity: 0.9,
    lineHeight: '1.5'
  };

  const resourcesContainerStyle: CSSProperties = {
    padding: '16px'
  };

  const resourceItemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderRadius: '12px',
    background: darkMode ? '#374151' : '#F9FAFB',
    marginBottom: '12px'
  };

  const resourceInfoStyle: CSSProperties = {
    flex: 1
  };

  const resourceNameStyle: CSSProperties = {
    fontWeight: '600',
    fontSize: '14px',
    color: darkMode ? '#F3F4F6' : '#1F2937',
    marginBottom: '4px'
  };

  const resourceDescStyle: CSSProperties = {
    fontSize: '12px',
    color: darkMode ? '#9CA3AF' : '#6B7280'
  };

  const callButtonStyle: CSSProperties = {
    padding: '10px 20px',
    borderRadius: '20px',
    border: 'none',
    background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
    color: 'white',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
  };

  const closeButtonStyle: CSSProperties = {
    width: '100%',
    padding: '14px',
    borderTop: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
    background: 'transparent',
    border: 'none',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    color: darkMode ? '#9CA3AF' : '#6B7280',
    fontSize: '14px',
    cursor: 'pointer'
  };

  const safetyTipStyle: CSSProperties = {
    padding: '12px 16px',
    background: darkMode ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.05)',
    margin: '0 16px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    color: darkMode ? '#FCA5A5' : '#DC2626',
    lineHeight: '1.5'
  };

  return (
    <>
      {/* Fixed SOS Button */}
      <button
        style={buttonStyle}
        onClick={handleActivate}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Emergency Resources"
      >
        SOS
      </button>

      {/* Resources Modal */}
      {showResources && (
        <div style={overlayStyle} onClick={() => setShowResources(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={headerStyle}>
              <h2 style={titleStyle}>🆘 You're Not Alone</h2>
              <p style={subtitleStyle}>
                If you're in crisis, please reach out. Help is available 24/7.
              </p>
            </div>

            <div style={resourcesContainerStyle}>
              {CRISIS_RESOURCES.map((resource, index) => (
                <div key={index} style={resourceItemStyle}>
                  <div style={resourceInfoStyle}>
                    <div style={resourceNameStyle}>{resource.name}</div>
                    <div style={resourceDescStyle}>{resource.description}</div>
                  </div>
                  <a
                    href={resource.action}
                    style={callButtonStyle}
                  >
                    {resource.number.startsWith('Text') ? '💬' : '📞'} {resource.number.split(' ')[0]}
                  </a>
                </div>
              ))}
            </div>

            <div style={safetyTipStyle}>
              💡 <strong>Safety Tip:</strong> If you or someone you know is in immediate danger, please call 911 or go to your nearest emergency room.
            </div>

            <button
              style={closeButtonStyle}
              onClick={() => setShowResources(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Compact inline version for chat header
export function EmergencyResourceChip({ darkMode = false }: { darkMode?: boolean }) {
  return (
    <a
      href="tel:988"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(220, 38, 38, 0.1)',
        color: '#DC2626',
        padding: '6px 12px',
        borderRadius: '16px',
        textDecoration: 'none',
        fontSize: '12px',
        fontWeight: '500'
      }}
    >
      🆘 Crisis: 988
    </a>
  );
}
