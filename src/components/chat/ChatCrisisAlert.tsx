'use client';

import { useState, CSSProperties } from 'react';
import { CrisisAlert } from '@/types/chat';

interface ChatCrisisAlertProps {
  alert: CrisisAlert;
  isTherapist?: boolean;
  onDismiss?: () => void;
  onAcknowledge?: () => void;
  darkMode?: boolean;
}

const CRISIS_HELPLINES = [
  { name: 'National Suicide Prevention Lifeline', number: '988', available: '24/7' },
  { name: 'Crisis Text Line', number: 'Text HOME to 741741', available: '24/7' },
  { name: 'SAMHSA National Helpline', number: '1-800-662-4357', available: '24/7' },
];

export default function ChatCrisisAlert({
  alert,
  isTherapist = false,
  onDismiss,
  onAcknowledge,
  darkMode = false
}: ChatCrisisAlertProps) {
  const [expanded, setExpanded] = useState(
    alert.riskLevel === 'critical' || alert.riskLevel === 'high'
  );
  const [showResources, setShowResources] = useState(false);

  const getAlertStyle = (): CSSProperties => {
    switch (alert.riskLevel) {
      case 'critical':
        return {
          background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
          borderColor: '#991B1B'
        };
      case 'high':
        return {
          background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
          borderColor: '#9A3412'
        };
      case 'medium':
        return {
          background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
          borderColor: '#92400E'
        };
      default:
        return {
          background: darkMode ? '#374151' : '#F3F4F6',
          borderColor: darkMode ? '#4B5563' : '#D1D5DB'
        };
    }
  };

  const getIcon = () => {
    switch (alert.riskLevel) {
      case 'critical': return '🆘';
      case 'high': return '⚠️';
      case 'medium': return '💛';
      default: return '💙';
    }
  };

  const getTitle = () => {
    if (isTherapist) {
      switch (alert.riskLevel) {
        case 'critical': return 'CRITICAL: Immediate attention required';
        case 'high': return 'HIGH RISK: Client needs support';
        case 'medium': return 'Concern detected in message';
        default: return 'Notice';
      }
    }
    switch (alert.riskLevel) {
      case 'critical': return "You're Not Alone - Help Is Available";
      case 'high': return "We're Here For You";
      case 'medium': return 'Support Resources Available';
      default: return 'Wellness Check';
    }
  };

  const getMessage = () => {
    if (isTherapist) {
      return `Crisis indicators detected in conversation`;
    }
    switch (alert.riskLevel) {
      case 'critical':
        return "It sounds like you're going through something really difficult. Your life matters, and there are people who want to help you right now.";
      case 'high':
        return "We're concerned about what you're sharing. Please know that support is available, and you don't have to face this alone.";
      case 'medium':
        return 'If you\'re struggling, remember that reaching out for help is a sign of strength.';
      default:
        return '';
    }
  };

  const alertStyles = getAlertStyle();
  const isHighPriority = alert.riskLevel === 'critical' || alert.riskLevel === 'high';
  const textColor = isHighPriority ? 'white' : (darkMode ? '#F3F4F6' : '#1F2937');

  const containerStyle: CSSProperties = {
    ...alertStyles,
    border: `2px solid ${alertStyles.borderColor}`,
    borderRadius: '12px',
    overflow: 'hidden',
    margin: '8px 0',
    animation: alert.riskLevel === 'critical' ? 'crisis-pulse 2s infinite' : 'none'
  };

  const headerStyle: CSSProperties = {
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    color: textColor
  };

  const iconStyle: CSSProperties = {
    fontSize: '20px',
    marginRight: '10px'
  };

  const titleStyle: CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    margin: 0
  };

  const contentStyle: CSSProperties = {
    padding: '0 16px 16px',
    color: textColor
  };

  const messageStyle: CSSProperties = {
    fontSize: '13px',
    lineHeight: '1.5',
    margin: '0 0 12px',
    opacity: 0.95
  };

  const resourcesContainerStyle: CSSProperties = {
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px'
  };

  const helplineStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0'
  };

  const phoneButtonStyle: CSSProperties = {
    background: 'white',
    color: alert.riskLevel === 'critical' ? '#DC2626' : '#EA580C',
    padding: '6px 12px',
    borderRadius: '16px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '12px'
  };

  const buttonStyle: CSSProperties = {
    padding: '8px 16px',
    background: isHighPriority ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  };

  const toggleStyle: CSSProperties = {
    fontSize: '18px',
    opacity: 0.8
  };

  return (
    <>
      <style jsx global>{`
        @keyframes crisis-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
      `}</style>

      <div style={containerStyle}>
        <div style={headerStyle} onClick={() => setExpanded(!expanded)}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={iconStyle}>{getIcon()}</span>
            <h4 style={titleStyle}>{getTitle()}</h4>
          </div>
          <span style={toggleStyle}>{expanded ? '−' : '+'}</span>
        </div>

        {expanded && (
          <div style={contentStyle}>
            <p style={messageStyle}>{getMessage()}</p>

            {/* Therapist view - show triggers and actions */}
            {isTherapist && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '12px'
                }}>
                  <strong>Alert Level:</strong> {alert.riskLevel}
                  {alert.messageId && (
                    <div style={{ marginTop: '4px' }}>
                      <strong>Message ID:</strong> {alert.messageId.slice(0, 8)}...
                    </div>
                  )}
                </div>

                {onAcknowledge && (
                  <button
                    style={{ ...buttonStyle, width: '100%', marginTop: '8px' }}
                    onClick={onAcknowledge}
                  >
                    Acknowledge Alert
                  </button>
                )}
              </div>
            )}

            {/* Student view - show resources */}
            {!isTherapist && (
              <>
                {!showResources && isHighPriority && (
                  <button
                    style={{ ...buttonStyle, width: '100%', marginBottom: '12px' }}
                    onClick={() => setShowResources(true)}
                  >
                    View Crisis Resources
                  </button>
                )}

                {(showResources || alert.riskLevel === 'critical') && (
                  <div style={resourcesContainerStyle}>
                    <h5 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 10px' }}>
                      24/7 Crisis Support:
                    </h5>
                    {CRISIS_HELPLINES.map((helpline, index) => (
                      <div key={index} style={{
                        ...helplineStyle,
                        borderTop: index > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                      }}>
                        <div>
                          <div style={{ fontWeight: '500', fontSize: '13px' }}>{helpline.name}</div>
                          <div style={{ fontSize: '11px', opacity: 0.8 }}>{helpline.available}</div>
                        </div>
                        <a
                          href={helpline.number.startsWith('Text') ? '#' : `tel:${helpline.number.replace(/\D/g, '')}`}
                          style={phoneButtonStyle}
                        >
                          {helpline.number.startsWith('Text') ? '💬 Text' : helpline.number}
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {alert.riskLevel === 'critical' && (
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    lineHeight: '1.5'
                  }}>
                    💬 <strong>You can also:</strong>
                    <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
                      <li>Text HOME to 741741 (Crisis Text Line)</li>
                      <li>Go to your nearest emergency room</li>
                      <li>Call a trusted friend or family member</li>
                    </ul>
                  </div>
                )}
              </>
            )}

            {onDismiss && alert.riskLevel !== 'critical' && (
              <button
                style={{
                  ...buttonStyle,
                  width: '100%',
                  background: 'rgba(255,255,255,0.2)',
                  marginTop: '8px'
                }}
                onClick={onDismiss}
              >
                I understand
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Inline crisis chip for quick access
export function CrisisHelpChip({ darkMode = false }: { darkMode?: boolean }) {
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
      🆘 Crisis Line: 988
    </a>
  );
}
