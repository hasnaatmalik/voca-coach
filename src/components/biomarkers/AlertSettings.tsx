'use client';

import { useState } from 'react';

// Icon components
const AlertIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ClarityIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const HealthIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const BellIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const TrophyIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

// Theme colors
const themeColors = {
  primary: '#D9A299',
  primaryDark: '#C08B82',
  secondary: '#DCC5B2',
  background: '#FAF7F3',
  cardBg: '#F0E4D3',
  border: '#DCC5B2',
  text: '#2D2D2D',
  textMuted: '#6B6B6B',
  // Alert-specific themed colors
  alertStress: '#D9A299',
  alertClarity: '#E4B17A',
  alertJitter: '#C08B82',
  alertReminder: '#7AB89E',
  alertAchievements: '#DCC5B2',
};

interface AlertConfig {
  enabled: boolean;
  threshold?: number;
}

interface AlertSettings {
  stress: AlertConfig;
  clarity: AlertConfig;
  jitter: AlertConfig;
  recordingReminder: AlertConfig;
  achievements: AlertConfig;
}

interface AlertSettingsProps {
  settings: AlertSettings;
  onSave: (settings: AlertSettings) => Promise<void>;
  onClose: () => void;
}

export default function AlertSettingsComponent({
  settings: initialSettings,
  onSave,
  onClose,
}: AlertSettingsProps) {
  const [settings, setSettings] = useState<AlertSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleToggle = (key: keyof AlertSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const handleThresholdChange = (key: keyof AlertSettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], threshold: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(settings);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const alertTypes = [
    {
      key: 'stress' as const,
      title: 'High Stress Alert',
      description: 'Get notified when your stress level exceeds the threshold',
      Icon: AlertIcon,
      color: themeColors.alertStress,
      hasThreshold: true,
      thresholdLabel: 'Stress threshold (%)',
      thresholdMin: 50,
      thresholdMax: 90,
      defaultThreshold: 70,
    },
    {
      key: 'clarity' as const,
      title: 'Low Clarity Warning',
      description: 'Alert when voice clarity drops below threshold',
      Icon: ClarityIcon,
      color: themeColors.alertClarity,
      hasThreshold: true,
      thresholdLabel: 'Clarity threshold (%)',
      thresholdMin: 30,
      thresholdMax: 70,
      defaultThreshold: 50,
    },
    {
      key: 'jitter' as const,
      title: 'Vocal Health Alert',
      description: 'Notify when jitter indicates potential vocal strain',
      Icon: HealthIcon,
      color: themeColors.alertJitter,
      hasThreshold: true,
      thresholdLabel: 'Jitter threshold (%)',
      thresholdMin: 1,
      thresholdMax: 5,
      defaultThreshold: 2,
    },
    {
      key: 'recordingReminder' as const,
      title: 'Recording Reminders',
      description: 'Remind you to record if you haven\'t in a while',
      Icon: BellIcon,
      color: themeColors.alertReminder,
      hasThreshold: true,
      thresholdLabel: 'Days without recording',
      thresholdMin: 1,
      thresholdMax: 7,
      defaultThreshold: 3,
    },
    {
      key: 'achievements' as const,
      title: 'Achievements',
      description: 'Celebrate streaks, improvements, and goal achievements',
      Icon: TrophyIcon,
      color: themeColors.primaryDark,
      hasThreshold: false,
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
        background: 'rgba(45, 45, 45, 0.4)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '16px',
          maxWidth: '420px',
          width: '95%',
          maxHeight: 'calc(100vh - 100px)',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(217, 162, 153, 0.25)',
          border: `1px solid ${themeColors.border}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: `1px solid ${themeColors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: `linear-gradient(135deg, ${themeColors.primary}10 0%, ${themeColors.secondary}10 100%)`,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: themeColors.text }}>
              Alert Settings
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: themeColors.textMuted }}>
              Configure notifications
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: 'none',
              background: themeColors.cardBg,
              color: themeColors.textMuted,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            x
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '12px 16px', background: themeColors.background }}>
          {alertTypes.map((alert, index) => (
            <div
              key={alert.key}
              style={{
                padding: '10px 12px',
                background: settings[alert.key].enabled ? themeColors.cardBg : 'white',
                borderRadius: '10px',
                border: `1px solid ${themeColors.border}`,
                marginBottom: index < alertTypes.length - 1 ? '8px' : 0,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '10px', flex: 1, alignItems: 'center' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: `${alert.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <alert.Icon color={alert.color} size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: themeColors.text }}>
                      {alert.title}
                    </h3>
                    <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: themeColors.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {alert.description}
                    </p>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => handleToggle(alert.key)}
                  style={{
                    width: '40px',
                    height: '22px',
                    borderRadius: '11px',
                    border: 'none',
                    background: settings[alert.key].enabled ? alert.color : themeColors.border,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                    marginLeft: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: settings[alert.key].enabled ? '20px' : '2px',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  />
                </button>
              </div>

              {/* Threshold slider */}
              {alert.hasThreshold && settings[alert.key].enabled && (
                <div style={{ marginTop: '10px', paddingLeft: '42px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '10px', color: themeColors.textMuted }}>
                      {alert.thresholdLabel}
                    </label>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: alert.color }}>
                      {settings[alert.key].threshold ?? alert.defaultThreshold}
                      {alert.key === 'recordingReminder' ? ' days' : '%'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={alert.thresholdMin ?? 0}
                    max={alert.thresholdMax ?? 100}
                    value={settings[alert.key].threshold ?? alert.defaultThreshold ?? 50}
                    onChange={e => handleThresholdChange(alert.key, parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '2px',
                      appearance: 'none',
                      background: (() => {
                        const min = alert.thresholdMin ?? 0;
                        const max = alert.thresholdMax ?? 100;
                        const value = settings[alert.key].threshold ?? alert.defaultThreshold ?? 50;
                        const percent = ((value - min) / (max - min)) * 100;
                        return `linear-gradient(to right, ${alert.color} 0%, ${alert.color} ${percent}%, ${themeColors.border} ${percent}%, ${themeColors.border} 100%)`;
                      })(),
                      cursor: 'pointer',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: `1px solid ${themeColors.border}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            background: 'white',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: `1px solid ${themeColors.border}`,
              background: 'white',
              color: themeColors.textMuted,
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              border: 'none',
              background: saving ? themeColors.border : `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
              color: saving ? themeColors.textMuted : themeColors.text,
              fontSize: '12px',
              fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 2px 8px rgba(217, 162, 153, 0.3)',
              transition: 'all 0.2s',
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
