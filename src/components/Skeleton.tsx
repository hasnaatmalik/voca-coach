'use client';

import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  variant = 'rectangular',
  style
}) => {
  const getRadius = () => {
    switch (variant) {
      case 'text':
        return '4px';
      case 'circular':
        return '50%';
      case 'rectangular':
      default:
        return typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
      <div
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          borderRadius: getRadius(),
          background: 'linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          ...style
        }}
      />
    </>
  );
};

// Dashboard Skeleton Layout
export const DashboardSkeleton: React.FC = () => {
  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Skeleton */}
      <div style={{ marginBottom: '24px' }}>
        <Skeleton height={14} width="200px" style={{ marginBottom: '16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Skeleton height={32} width="250px" style={{ marginBottom: '8px' }} />
            <Skeleton height={16} width="150px" />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Skeleton height={40} width="100px" borderRadius={12} />
            <Skeleton height={40} width="120px" borderRadius={12} />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        {/* Left Column */}
        <div>
          {/* Points of Improvement Card */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
          }}>
            <Skeleton height={24} width="60%" style={{ marginBottom: '8px' }} />
            <Skeleton height={16} width="40%" style={{ marginBottom: '32px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Skeleton variant="circular" width={120} height={120} />
                  <Skeleton height={14} width="80px" style={{ marginTop: '12px' }} />
                  <Skeleton height={12} width="60px" style={{ marginTop: '4px' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Emotions Analysis Card */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
          }}>
            <Skeleton height={24} width="50%" style={{ marginBottom: '20px' }} />
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Skeleton variant="circular" width={44} height={44} />
                <div style={{ flex: 1 }}>
                  <Skeleton height={8} borderRadius={4} />
                </div>
                <Skeleton height={14} width="40px" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Live Stats Panel */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
          }}>
            <Skeleton height={20} width="60%" style={{ marginBottom: '20px' }} />
            <Skeleton height={80} borderRadius={12} style={{ marginBottom: '20px' }} />
            <Skeleton height={16} width="40%" style={{ marginBottom: '12px' }} />
            <Skeleton height={32} style={{ marginBottom: '8px' }} />
            <Skeleton height={32} />
          </div>

          {/* Upcoming Sessions */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
          }}>
            <Skeleton height={20} width="70%" style={{ marginBottom: '16px' }} />
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                background: '#F9FAFB',
                borderRadius: '12px',
                marginBottom: '8px'
              }}>
                <Skeleton variant="circular" width={40} height={40} />
                <div style={{ flex: 1 }}>
                  <Skeleton height={14} width="80%" style={{ marginBottom: '4px' }} />
                  <Skeleton height={12} width="60%" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
          }}>
            <Skeleton height={20} width="50%" style={{ marginBottom: '20px' }} />
            <Skeleton height={100} borderRadius={12} />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '24px',
        marginTop: '24px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
      }}>
        <Skeleton height={20} width="40%" style={{ marginBottom: '20px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 16px',
              background: '#F9FAFB',
              borderRadius: '16px'
            }}>
              <Skeleton variant="circular" width={48} height={48} style={{ marginBottom: '8px' }} />
              <Skeleton height={14} width="60px" style={{ marginBottom: '4px' }} />
              <Skeleton height={10} width="80px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
