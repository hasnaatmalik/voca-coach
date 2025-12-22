'use client';

interface TrendIndicatorProps {
  direction: 'up' | 'down' | 'stable';
  percentChange: number;
  metric?: string;
  isPositive?: boolean; // Whether the trend direction is good or bad
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function TrendIndicator({
  direction,
  percentChange,
  metric,
  isPositive,
  size = 'md',
  showLabel = true,
}: TrendIndicatorProps) {
  // Determine if the trend is good or bad
  const isTrendGood = isPositive !== undefined
    ? isPositive
    : direction === 'stable' || (direction === 'up' && percentChange < 20);

  // Size configurations
  const sizeConfig = {
    sm: { fontSize: '12px', iconSize: '14px', padding: '4px 8px' },
    md: { fontSize: '14px', iconSize: '18px', padding: '6px 12px' },
    lg: { fontSize: '16px', iconSize: '24px', padding: '8px 16px' },
  };

  const config = sizeConfig[size];

  // Color based on whether trend is good or bad
  const getColor = () => {
    if (direction === 'stable') return '#6B7280';
    return isTrendGood ? '#10B981' : '#EF4444';
  };

  const getBgColor = () => {
    if (direction === 'stable') return 'rgba(107, 114, 128, 0.1)';
    return isTrendGood ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
  };

  // Arrow icons
  const getArrow = () => {
    switch (direction) {
      case 'up':
        return (
          <svg
            width={config.iconSize}
            height={config.iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        );
      case 'down':
        return (
          <svg
            width={config.iconSize}
            height={config.iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        );
      default:
        return (
          <svg
            width={config.iconSize}
            height={config.iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        );
    }
  };

  const getLabel = () => {
    if (direction === 'stable') return 'Stable';
    const dirLabel = direction === 'up' ? 'Up' : 'Down';
    return `${dirLabel} ${percentChange}%`;
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: config.padding,
        borderRadius: '20px',
        background: getBgColor(),
        color: getColor(),
        fontSize: config.fontSize,
        fontWeight: 500,
      }}
    >
      {getArrow()}
      {showLabel && <span>{getLabel()}</span>}
      {metric && (
        <span style={{ color: '#6B7280', fontWeight: 400, marginLeft: '4px' }}>
          {metric}
        </span>
      )}
    </div>
  );
}

// Compact version for use in tables/lists
export function TrendArrow({
  direction,
  isPositive,
}: {
  direction: 'up' | 'down' | 'stable';
  isPositive?: boolean;
}) {
  const isTrendGood = isPositive !== undefined
    ? isPositive
    : direction === 'stable';

  const getColor = () => {
    if (direction === 'stable') return '#6B7280';
    return isTrendGood ? '#10B981' : '#EF4444';
  };

  if (direction === 'stable') {
    return (
      <span style={{ color: getColor(), fontSize: '16px' }}>→</span>
    );
  }

  return (
    <span style={{ color: getColor(), fontSize: '16px' }}>
      {direction === 'up' ? '↑' : '↓'}
    </span>
  );
}
