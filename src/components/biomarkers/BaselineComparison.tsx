'use client';

import { BIOMARKER_METRICS } from '@/lib/biomarker-utils';

interface Baseline {
  pitch: number;
  pitchStdDev?: number | null;
  clarity: number;
  clarityStdDev?: number | null;
  stress: number;
  stressStdDev?: number | null;
  pauseDuration?: number | null;
  articulationRate?: number | null;
  jitter?: number | null;
  shimmer?: number | null;
  speechRate?: number | null;
  hnr?: number | null;
  recordingCount: number;
  calculatedAt: string | Date;
}

interface CurrentValues {
  pitch?: number;
  clarity?: number;
  stress?: number;
  pauseDuration?: number | null;
  articulationRate?: number | null;
  jitter?: number | null;
  shimmer?: number | null;
  speechRate?: number | null;
  hnr?: number | null;
}

interface BaselineComparisonProps {
  baseline: Baseline | null;
  current?: CurrentValues;
  onRecalculate?: () => Promise<void>;
  loading?: boolean;
}

export default function BaselineComparison({
  baseline,
  current,
  onRecalculate,
  loading = false,
}: BaselineComparisonProps) {
  const getComparisonColor = (diff: number, metric: string) => {
    // For stress, lower is better
    const isLowerBetter = metric === 'stress' || metric === 'jitter' || metric === 'shimmer';
    const isGood = isLowerBetter ? diff < 0 : diff > 0;

    if (Math.abs(diff) < 5) return '#6B7280'; // Neutral
    return isGood ? '#10B981' : '#F59E0B';
  };

  const getComparisonText = (diff: number, metric: string) => {
    if (Math.abs(diff) < 2) return 'At baseline';

    const isLowerBetter = metric === 'stress' || metric === 'jitter' || metric === 'shimmer';
    const isImproved = isLowerBetter ? diff < 0 : diff > 0;
    const direction = diff > 0 ? 'above' : 'below';

    return `${Math.abs(diff).toFixed(1)}% ${direction} baseline ${isImproved ? '(improved)' : ''}`;
  };

  if (loading) {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
          border: '1px solid rgba(124, 58, 237, 0.1)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '3px solid #E5E7EB',
            borderTopColor: '#7C3AED',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ color: '#6B7280', margin: 0 }}>Calculating baseline...</p>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!baseline) {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
          border: '1px solid rgba(124, 58, 237, 0.1)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>Baseline</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#374151' }}>
          No Baseline Yet
        </h3>
        <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#6B7280' }}>
          Record at least 7 voice samples to establish your personal baseline
        </p>
        {onRecalculate && (
          <button
            onClick={onRecalculate}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Calculate Baseline
          </button>
        )}
      </div>
    );
  }

  const metrics = [
    { key: 'pitch', label: 'Pitch', unit: 'Hz' },
    { key: 'clarity', label: 'Clarity', unit: '%' },
    { key: 'stress', label: 'Stress', unit: '%' },
    { key: 'pauseDuration', label: 'Pause Duration', unit: 's' },
    { key: 'jitter', label: 'Jitter', unit: '%' },
    { key: 'shimmer', label: 'Shimmer', unit: '%' },
    { key: 'speechRate', label: 'Speech Rate', unit: 'wpm' },
    { key: 'hnr', label: 'HNR', unit: 'dB' },
  ];

  const calculatedDate = typeof baseline.calculatedAt === 'string'
    ? new Date(baseline.calculatedAt)
    : baseline.calculatedAt;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
        border: '1px solid rgba(124, 58, 237, 0.1)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #F3E8FF 0%, #FCE7F3 100%)',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#374151' }}>
              Your Baseline
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
              Based on {baseline.recordingCount} recordings •
              Updated {calculatedDate.toLocaleDateString()}
            </p>
          </div>
          {onRecalculate && (
            <button
              onClick={onRecalculate}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #7C3AED',
                background: 'white',
                color: '#7C3AED',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Recalculate
            </button>
          )}
        </div>
      </div>

      {/* Metrics comparison */}
      <div style={{ padding: '20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {metrics.map(({ key, label, unit }) => {
            const baselineValue = baseline[key as keyof Baseline] as number | undefined;
            if (baselineValue === undefined || baselineValue === null) return null;

            const currentValue = current?.[key as keyof CurrentValues] as number | undefined;
            const diff = currentValue !== undefined
              ? ((currentValue - baselineValue) / baselineValue) * 100
              : null;

            const metricInfo = BIOMARKER_METRICS[key];

            return (
              <div
                key={key}
                style={{
                  padding: '16px',
                  background: '#F9FAFB',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: metricInfo?.color || '#7C3AED',
                    }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                    {label}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 600, color: '#1F2937' }}>
                    {baselineValue.toFixed(1)}
                  </span>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>{unit}</span>
                </div>

                {/* Standard deviation if available */}
                {baseline[`${key}StdDev` as keyof Baseline] && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#9CA3AF' }}>
                    ± {(baseline[`${key}StdDev` as keyof Baseline] as number).toFixed(2)} std dev
                  </p>
                )}

                {/* Comparison to current */}
                {diff !== null && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: 'white',
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        color: getComparisonColor(diff, key),
                        fontWeight: 500,
                      }}
                    >
                      Current: {currentValue?.toFixed(1)} {unit}
                    </p>
                    <p
                      style={{
                        margin: '2px 0 0 0',
                        fontSize: '11px',
                        color: getComparisonColor(diff, key),
                      }}
                    >
                      {getComparisonText(diff, key)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
