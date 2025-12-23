'use client';

import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface BreakpointConfig {
  mobile: number;
  tablet: number;
}

const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  mobile: 640,
  tablet: 1024
};

export function useBreakpoint(config: BreakpointConfig = DEFAULT_BREAKPOINTS): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < config.mobile) {
        setBreakpoint('mobile');
      } else if (width < config.tablet) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    // Set initial value
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [config.mobile, config.tablet]);

  return breakpoint;
}

// Helper hook to get responsive styles
export function useResponsiveStyles<T extends Record<string, React.CSSProperties>>(
  styles: {
    mobile?: Partial<T>;
    tablet?: Partial<T>;
    desktop: T;
  }
): T {
  const breakpoint = useBreakpoint();

  switch (breakpoint) {
    case 'mobile':
      return { ...styles.desktop, ...styles.mobile } as T;
    case 'tablet':
      return { ...styles.desktop, ...styles.tablet } as T;
    case 'desktop':
    default:
      return styles.desktop;
  }
}

// Helper to get grid columns based on breakpoint
export function getGridColumns(breakpoint: Breakpoint): string {
  switch (breakpoint) {
    case 'mobile':
      return '1fr';
    case 'tablet':
      return 'repeat(2, 1fr)';
    case 'desktop':
    default:
      return '1fr 320px';
  }
}

// Helper to check if mobile
export function useIsMobile(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'mobile';
}

// Helper to check if tablet or smaller
export function useIsTabletOrSmaller(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'mobile' || breakpoint === 'tablet';
}

export default useBreakpoint;
