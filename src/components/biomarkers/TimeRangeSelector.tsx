'use client';

import { useState, useEffect } from 'react';

type PresetRange = '7d' | '30d' | '90d' | '1y' | 'all';

interface TimeRangeSelectorProps {
  onChange: (range: { preset?: PresetRange; startDate?: string; endDate?: string; days?: number }) => void;
  defaultPreset?: PresetRange;
  showCustomRange?: boolean;
}

export default function TimeRangeSelector({
  onChange,
  defaultPreset = '7d',
  showCustomRange = true,
}: TimeRangeSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<PresetRange | 'custom'>(defaultPreset);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomInputs, setShowCustomInputs] = useState(false);

  const presets: { key: PresetRange; label: string; days: number }[] = [
    { key: '7d', label: '7 Days', days: 7 },
    { key: '30d', label: '30 Days', days: 30 },
    { key: '90d', label: '90 Days', days: 90 },
    { key: '1y', label: '1 Year', days: 365 },
    { key: 'all', label: 'All Time', days: 9999 },
  ];

  useEffect(() => {
    // Set default dates for custom range
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(weekAgo.toISOString().split('T')[0]);
  }, []);

  const handlePresetClick = (preset: PresetRange) => {
    setSelectedPreset(preset);
    setShowCustomInputs(false);

    const presetConfig = presets.find(p => p.key === preset);
    if (presetConfig) {
      onChange({ preset, days: presetConfig.days });
    }
  };

  const handleCustomClick = () => {
    setSelectedPreset('custom');
    setShowCustomInputs(true);
  };

  const handleCustomApply = () => {
    if (startDate && endDate) {
      onChange({ startDate, endDate });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Preset buttons */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {presets.map(preset => (
          <button
            key={preset.key}
            onClick={() => handlePresetClick(preset.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: selectedPreset === preset.key
                ? '2px solid #7C3AED'
                : '1px solid #E5E7EB',
              background: selectedPreset === preset.key
                ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
                : 'white',
              color: selectedPreset === preset.key ? '#7C3AED' : '#6B7280',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {preset.label}
          </button>
        ))}

        {showCustomRange && (
          <button
            onClick={handleCustomClick}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: selectedPreset === 'custom'
                ? '2px solid #7C3AED'
                : '1px solid #E5E7EB',
              background: selectedPreset === 'custom'
                ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
                : 'white',
              color: selectedPreset === 'custom' ? '#7C3AED' : '#6B7280',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Custom
          </button>
        )}
      </div>

      {/* Custom date range inputs */}
      {showCustomInputs && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: '#F9FAFB',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label
              style={{
                fontSize: '13px',
                color: '#6B7280',
                fontWeight: 500,
              }}
            >
              From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              max={endDate || undefined}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '13px',
                color: '#374151',
                background: 'white',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label
              style={{
                fontSize: '13px',
                color: '#6B7280',
                fontWeight: 500,
              }}
            >
              To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              min={startDate || undefined}
              max={new Date().toISOString().split('T')[0]}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '13px',
                color: '#374151',
                background: 'white',
                outline: 'none',
              }}
            />
          </div>

          <button
            onClick={handleCustomApply}
            disabled={!startDate || !endDate}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: startDate && endDate
                ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
                : '#E5E7EB',
              color: startDate && endDate ? 'white' : '#9CA3AF',
              fontSize: '13px',
              fontWeight: 500,
              cursor: startDate && endDate ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
