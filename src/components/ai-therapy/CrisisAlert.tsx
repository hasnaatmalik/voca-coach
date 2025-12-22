'use client';

import { useState } from 'react';
import { CRISIS_HELPLINES } from '@/lib/ai-therapy-personas';

interface CrisisAlertProps {
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  onDismiss?: () => void;
  showResources?: boolean;
}

export default function CrisisAlert({ riskLevel, onDismiss, showResources = true }: CrisisAlertProps) {
  // Initialize expanded based on risk level - high/critical are always expanded initially
  const shouldBeExpanded = riskLevel === 'critical' || riskLevel === 'high';
  const [expanded, setExpanded] = useState(shouldBeExpanded);

  if (riskLevel === 'low' || riskLevel === 'none') return null;

  const getAlertStyle = () => {
    switch (riskLevel) {
      case 'critical':
        return {
          background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
          border: '2px solid #991B1B',
        };
      case 'high':
        return {
          background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
          border: '2px solid #9A3412',
        };
      case 'medium':
        return {
          background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
          border: '2px solid #92400E',
        };
      default:
        return {
          background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
          border: '2px solid #374151',
        };
    }
  };

  const getTitle = () => {
    switch (riskLevel) {
      case 'critical':
        return 'You\'re Not Alone - Help Is Available';
      case 'high':
        return 'We\'re Here For You';
      case 'medium':
        return 'Support Resources Available';
      default:
        return 'Wellness Check';
    }
  };

  const getMessage = () => {
    switch (riskLevel) {
      case 'critical':
        return 'It sounds like you\'re going through something really difficult. Your life matters, and there are people who want to help you right now.';
      case 'high':
        return 'We\'re concerned about what you\'re sharing. Please know that support is available, and you don\'t have to face this alone.';
      case 'medium':
        return 'If you\'re struggling, remember that reaching out for help is a sign of strength.';
      default:
        return '';
    }
  };

  return (
    <div
      style={{
        ...getAlertStyle(),
        borderRadius: '16px',
        color: 'white',
        overflow: 'hidden',
        margin: '16px 0',
        animation: riskLevel === 'critical' ? 'pulse 2s infinite' : 'none',
      }}
    >
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>
            {riskLevel === 'critical' ? '🆘' : riskLevel === 'high' ? '⚠️' : '💛'}
          </span>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>{getTitle()}</h3>
            {!expanded && (
              <p style={{ fontSize: '13px', opacity: 0.9, margin: '4px 0 0' }}>
                Click to see support resources
              </p>
            )}
          </div>
        </div>
        <span style={{ fontSize: '20px' }}>{expanded ? '−' : '+'}</span>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: '0 20px 20px' }}>
          <p style={{ fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px', opacity: 0.95 }}>
            {getMessage()}
          </p>

          {showResources && (
            <>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                }}
              >
                <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 12px' }}>
                  24/7 Crisis Support:
                </h4>
                {CRISIS_HELPLINES.map((helpline, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderTop: index > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>{helpline.name}</div>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>{helpline.available}</div>
                    </div>
                    <a
                      href={`tel:${helpline.number.replace(/\D/g, '')}`}
                      style={{
                        background: 'white',
                        color: riskLevel === 'critical' ? '#DC2626' : '#EA580C',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                    >
                      {helpline.number}
                    </a>
                  </div>
                ))}
              </div>

              {riskLevel === 'critical' && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}
                >
                  💬 <strong>You can also:</strong>
                  <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                    <li>Text HOME to 741741 (Crisis Text Line)</li>
                    <li>Go to your nearest emergency room</li>
                    <li>Call a trusted friend or family member</li>
                  </ul>
                </div>
              )}
            </>
          )}

          {onDismiss && riskLevel !== 'critical' && (
            <button
              onClick={onDismiss}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                marginTop: '12px',
              }}
            >
              I understand
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Smaller inline version for chat
export function CrisisResourceChip() {
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
        borderRadius: '20px',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: '500',
      }}
    >
      🆘 Crisis Line: 988
    </a>
  );
}
