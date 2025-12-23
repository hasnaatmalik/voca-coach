'use client';

import React, { useState } from 'react';
import { CrisisDetectionResult, CRISIS_RESOURCES, CrisisResource } from '@/types/de-escalation';

interface CrisisAlertEnhancedProps {
  detection: CrisisDetectionResult;
  onDismiss?: () => void;
  onContactEmergency?: () => void;
  darkMode?: boolean;
}

export default function CrisisAlertEnhanced({
  detection,
  onDismiss,
  onContactEmergency,
  darkMode = false,
}: CrisisAlertEnhancedProps) {
  const [isExpanded, setIsExpanded] = useState(detection.riskLevel === 'critical');
  const [showAllResources, setShowAllResources] = useState(false);

  if (detection.riskLevel === 'none') {
    return null;
  }

  const getRiskConfig = () => {
    switch (detection.riskLevel) {
      case 'critical':
        return {
          bgColor: 'rgba(220, 38, 38, 0.1)',
          borderColor: '#DC2626',
          textColor: '#DC2626',
          icon: '🆘',
          title: 'Crisis Support Available',
          subtitle: 'We\'re here to help you.',
        };
      case 'high':
        return {
          bgColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: '#EF4444',
          textColor: '#EF4444',
          icon: '⚠️',
          title: 'Support Resources',
          subtitle: 'You don\'t have to face this alone.',
        };
      case 'medium':
        return {
          bgColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: '#F59E0B',
          textColor: '#F59E0B',
          icon: '💛',
          title: 'Feeling Overwhelmed?',
          subtitle: 'Here are some resources that might help.',
        };
      default:
        return {
          bgColor: 'rgba(107, 114, 128, 0.1)',
          borderColor: '#6B7280',
          textColor: '#6B7280',
          icon: '💭',
          title: 'Support Available',
          subtitle: 'Resources are here if you need them.',
        };
    }
  };

  const config = getRiskConfig();
  const resources = detection.resources.length > 0 ? detection.resources : CRISIS_RESOURCES;

  return (
    <div style={{
      background: darkMode ? '#1F2937' : config.bgColor,
      border: `2px solid ${config.borderColor}`,
      borderRadius: '16px',
      overflow: 'hidden',
      animation: detection.riskLevel === 'critical' ? 'pulse-border 2s ease-in-out infinite' : 'none',
    }}>
      {/* Header - Always Visible */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '24px',
            animation: detection.riskLevel === 'critical' ? 'pulse 1s ease-in-out infinite' : 'none',
          }}>
            {config.icon}
          </span>
          <div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: config.textColor,
              marginBottom: '2px',
            }}>
              {config.title}
            </div>
            <div style={{
              fontSize: '13px',
              color: darkMode ? '#9CA3AF' : '#6B7280',
            }}>
              {config.subtitle}
            </div>
          </div>
        </div>

        <span style={{
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s ease',
          fontSize: '20px',
        }}>
          ▼
        </span>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{
          padding: '0 20px 20px',
          borderTop: `1px solid ${darkMode ? '#374151' : config.borderColor}33`,
        }}>
          {/* Main Message */}
          <div style={{
            padding: '16px',
            background: darkMode ? '#111827' : 'white',
            borderRadius: '12px',
            marginTop: '16px',
            marginBottom: '16px',
          }}>
            <p style={{
              fontSize: '14px',
              color: darkMode ? '#D1D5DB' : '#4B5563',
              lineHeight: '1.6',
              margin: 0,
            }}>
              {detection.riskLevel === 'critical' && (
                <>
                  <strong>Your safety matters most right now.</strong> If you're in immediate danger,
                  please contact emergency services (911) or go to your nearest emergency room.
                  You deserve support, and help is available 24/7.
                </>
              )}
              {detection.riskLevel === 'high' && (
                <>
                  It sounds like you're going through a really difficult time. That takes courage
                  to acknowledge. There are people who want to help and support you through this.
                </>
              )}
              {detection.riskLevel === 'medium' && (
                <>
                  Whatever you're experiencing right now is valid. Sometimes talking to someone
                  can help make things feel more manageable.
                </>
              )}
              {detection.riskLevel === 'low' && (
                <>
                  It's okay to seek support when things feel hard. Here are some resources
                  available to you.
                </>
              )}
            </p>
          </div>

          {/* Crisis Resources */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: darkMode ? '#F9FAFB' : '#1F2937',
              marginBottom: '12px',
            }}>
              📞 24/7 Support Lines
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(showAllResources ? resources : resources.slice(0, 2)).map((resource, index) => (
                <ResourceCard
                  key={index}
                  resource={resource}
                  isPrimary={index === 0 && detection.riskLevel === 'critical'}
                  darkMode={darkMode}
                />
              ))}
            </div>

            {resources.length > 2 && (
              <button
                onClick={() => setShowAllResources(!showAllResources)}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: config.textColor,
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                {showAllResources ? 'Show less' : `Show ${resources.length - 2} more resources`}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {detection.riskLevel === 'critical' && onContactEmergency && (
              <button
                onClick={onContactEmergency}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#DC2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>📞</span>
                Call Emergency
              </button>
            )}

            {onDismiss && (
              <button
                onClick={onDismiss}
                style={{
                  flex: detection.riskLevel === 'critical' ? 0.5 : 1,
                  padding: '14px',
                  background: darkMode ? '#374151' : '#F3F4F6',
                  color: darkMode ? '#F9FAFB' : '#4B5563',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                I'm Okay
              </button>
            )}
          </div>

          {/* Recommended Action */}
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: darkMode ? '#111827' : 'rgba(124, 58, 237, 0.05)',
            borderRadius: '10px',
            borderLeft: '3px solid #7C3AED',
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#7C3AED',
              marginBottom: '4px',
            }}>
              💡 Suggested Action
            </div>
            <div style={{
              fontSize: '13px',
              color: darkMode ? '#D1D5DB' : '#4B5563',
            }}>
              {detection.recommendedAction}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
        }
      `}</style>
    </div>
  );
}

function ResourceCard({
  resource,
  isPrimary,
  darkMode,
}: {
  resource: CrisisResource;
  isPrimary: boolean;
  darkMode: boolean;
}) {
  return (
    <a
      href={resource.url || `tel:${resource.contact.replace(/\D/g, '')}`}
      target={resource.url ? '_blank' : undefined}
      rel={resource.url ? 'noopener noreferrer' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        background: isPrimary
          ? '#DC2626'
          : darkMode ? '#111827' : 'white',
        borderRadius: '12px',
        textDecoration: 'none',
        border: isPrimary ? 'none' : `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
        transition: 'transform 0.2s ease',
      }}
    >
      <div>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: isPrimary ? 'white' : darkMode ? '#F9FAFB' : '#1F2937',
          marginBottom: '2px',
        }}>
          {resource.name}
        </div>
        <div style={{
          fontSize: '18px',
          fontWeight: '700',
          color: isPrimary ? 'white' : '#7C3AED',
          fontFamily: 'monospace',
        }}>
          {resource.contact}
        </div>
        {resource.description && (
          <div style={{
            fontSize: '12px',
            color: isPrimary ? 'rgba(255,255,255,0.8)' : darkMode ? '#9CA3AF' : '#6B7280',
            marginTop: '2px',
          }}>
            {resource.description}
          </div>
        )}
      </div>

      <span style={{
        fontSize: '24px',
        marginLeft: '12px',
      }}>
        {resource.url ? '🔗' : '📞'}
      </span>
    </a>
  );
}
