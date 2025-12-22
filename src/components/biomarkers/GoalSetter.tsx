'use client';

import { useState, useEffect } from 'react';
import { BIOMARKER_METRICS } from '@/lib/biomarker-utils';

interface Goal {
  target: number;
  direction: 'increase' | 'decrease' | 'maintain';
}

interface GoalSetterProps {
  currentGoals: Record<string, Goal>;
  onSave: (goals: Record<string, Goal>) => Promise<void>;
  onGetSuggestions?: () => Promise<Record<string, Goal>>;
}

export default function GoalSetter({
  currentGoals,
  onSave,
  onGetSuggestions,
}: GoalSetterProps) {
  const [goals, setGoals] = useState<Record<string, Goal>>(currentGoals);
  const [saving, setSaving] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Core metrics to always show
  const coreMetrics = ['clarity', 'stress', 'pitch'];
  const advancedMetrics = ['pauseDuration', 'jitter', 'shimmer', 'speechRate', 'hnr', 'articulationRate'];

  useEffect(() => {
    setGoals(currentGoals);
  }, [currentGoals]);

  const handleChange = (metric: string, field: 'target' | 'direction', value: number | string) => {
    setGoals(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [field]: field === 'target' ? Number(value) : value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(goals);
    } finally {
      setSaving(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!onGetSuggestions) return;
    setLoadingSuggestions(true);
    try {
      const suggestions = await onGetSuggestions();
      setGoals(prev => ({ ...prev, ...suggestions }));
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleRemoveGoal = (metric: string) => {
    setGoals(prev => {
      const newGoals = { ...prev };
      delete newGoals[metric];
      return newGoals;
    });
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'increase':
        return 'Up';
      case 'decrease':
        return 'Down';
      default:
        return 'Stable';
    }
  };

  const renderMetricGoal = (metricKey: string) => {
    const metric = BIOMARKER_METRICS[metricKey];
    if (!metric) return null;

    const goal = goals[metricKey];
    const hasGoal = goal !== undefined;

    return (
      <div
        key={metricKey}
        style={{
          padding: '16px',
          background: hasGoal ? '#F9FAFB' : 'white',
          borderRadius: '12px',
          border: `1px solid ${hasGoal ? metric.color + '40' : '#E5E7EB'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: metric.color,
              }}
            />
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
              {metric.label}
            </span>
          </div>
          {hasGoal && (
            <button
              onClick={() => handleRemoveGoal(metricKey)}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: 'none',
                background: '#FEE2E2',
                color: '#EF4444',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              x
            </button>
          )}
        </div>

        {hasGoal ? (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            {/* Target input */}
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                Target ({metric.unit})
              </label>
              <input
                type="number"
                value={goal.target}
                onChange={e => handleChange(metricKey, 'target', e.target.value)}
                step={metricKey === 'pitch' || metricKey === 'speechRate' ? 1 : 0.1}
                min={metric.normalRange.min * 0.5}
                max={metric.normalRange.max * 1.5}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Direction selector */}
            <div>
              <label style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                Direction
              </label>
              <select
                value={goal.direction}
                onChange={e => handleChange(metricKey, 'direction', e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="increase">Increase</option>
                <option value="decrease">Decrease</option>
                <option value="maintain">Maintain</option>
              </select>
            </div>
          </div>
        ) : (
          <button
            onClick={() => handleChange(metricKey, 'target', (metric.normalRange.min + metric.normalRange.max) / 2)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px dashed #D1D5DB',
              background: 'white',
              color: '#6B7280',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            + Set Goal
          </button>
        )}

        {/* Normal range hint */}
        <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#9CA3AF' }}>
          Normal range: {metric.normalRange.min} - {metric.normalRange.max} {metric.unit}
        </p>
      </div>
    );
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(124, 58, 237, 0.1)',
        border: '1px solid rgba(124, 58, 237, 0.1)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>
            Personal Goals
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
            Set targets for your voice biomarkers
          </p>
        </div>
        {onGetSuggestions && (
          <button
            onClick={handleGetSuggestions}
            disabled={loadingSuggestions}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #7C3AED',
              background: 'white',
              color: '#7C3AED',
              fontSize: '13px',
              fontWeight: 500,
              cursor: loadingSuggestions ? 'not-allowed' : 'pointer',
              opacity: loadingSuggestions ? 0.6 : 1,
            }}
          >
            {loadingSuggestions ? 'Loading...' : 'Get AI Suggestions'}
          </button>
        )}
      </div>

      {/* Core metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {coreMetrics.map(renderMetricGoal)}
      </div>

      {/* Advanced metrics toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          background: '#F9FAFB',
          color: '#6B7280',
          fontSize: '13px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: showAdvanced ? '16px' : '0',
        }}
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Metrics
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Advanced metrics */}
      {showAdvanced && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {advancedMetrics.map(renderMetricGoal)}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
          color: 'white',
          fontSize: '15px',
          fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.8 : 1,
          marginTop: '16px',
        }}
      >
        {saving ? 'Saving...' : 'Save Goals'}
      </button>
    </div>
  );
}
