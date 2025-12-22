'use client';

import { useState } from 'react';

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
      icon: 'Alert',
      color: '#EF4444',
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
      icon: 'Warning',
      color: '#F59E0B',
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
      icon: 'Health',
      color: '#8B5CF6',
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
      icon: 'Bell',
      color: '#06B6D4',
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
      icon: 'Trophy',
      color: '#10B981',
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
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '20px',
          maxWidth: '500px',
          width: '95%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>
              Alert Settings
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
              Configure when you want to receive notifications
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: '#F3F4F6',
              color: '#6B7280',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            x
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {alertTypes.map((alert, index) => (
            <div
              key={alert.key}
              style={{
                padding: '16px',
                background: settings[alert.key].enabled ? '#F9FAFB' : 'white',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                marginBottom: index < alertTypes.length - 1 ? '12px' : 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: `${alert.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: '20px', color: alert.color }}>
                      {alert.icon}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                      {alert.title}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                      {alert.description}
                    </p>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => handleToggle(alert.key)}
                  style={{
                    width: '48px',
                    height: '28px',
                    borderRadius: '14px',
                    border: 'none',
                    background: settings[alert.key].enabled ? alert.color : '#E5E7EB',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: 'white',
                      position: 'absolute',
                      top: '3px',
                      left: settings[alert.key].enabled ? '23px' : '3px',
                      transition: 'left 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  />
                </button>
              </div>

              {/* Threshold slider */}
              {alert.hasThreshold && settings[alert.key].enabled && (
                <div style={{ marginTop: '16px', paddingLeft: '52px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', color: '#6B7280' }}>
                      {alert.thresholdLabel}
                    </label>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: alert.color }}>
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
                      height: '6px',
                      borderRadius: '3px',
                      appearance: 'none',
                      background: (() => {
                        const min = alert.thresholdMin ?? 0;
                        const max = alert.thresholdMax ?? 100;
                        const value = settings[alert.key].threshold ?? alert.defaultThreshold ?? 50;
                        const percent = ((value - min) / (max - min)) * 100;
                        return `linear-gradient(to right, ${alert.color} 0%, ${alert.color} ${percent}%, #E5E7EB ${percent}%, #E5E7EB 100%)`;
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
            padding: '16px 24px',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              background: 'white',
              color: '#6B7280',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
