// Biomarker utility functions for calculations, formatting, and reference data

export interface BiomarkerData {
  id: string;
  date: string;
  pitch: number;
  clarity: number;
  stress: number;
  pauseDuration?: number | null;
  articulationRate?: number | null;
  jitter?: number | null;
  shimmer?: number | null;
  speechRate?: number | null;
  hnr?: number | null;
  duration?: number | null;
  overallScore?: number | null;
}

export interface BiomarkerMetricInfo {
  key: string;
  label: string;
  unit: string;
  description: string;
  normalRange: { min: number; max: number };
  warningRange: { min: number; max: number };
  higherIsBetter: boolean;
  color: string;
}

// Reference data for all biomarkers
export const BIOMARKER_METRICS: Record<string, BiomarkerMetricInfo> = {
  pitch: {
    key: 'pitch',
    label: 'Pitch (F0)',
    unit: 'Hz',
    description: 'Fundamental frequency of voice',
    normalRange: { min: 85, max: 255 },
    warningRange: { min: 70, max: 300 },
    higherIsBetter: false, // neutral
    color: '#7C3AED',
  },
  clarity: {
    key: 'clarity',
    label: 'Clarity',
    unit: '%',
    description: 'Articulation quality and pronunciation clarity',
    normalRange: { min: 70, max: 100 },
    warningRange: { min: 50, max: 100 },
    higherIsBetter: true,
    color: '#EC4899',
  },
  stress: {
    key: 'stress',
    label: 'Stress Level',
    unit: '%',
    description: 'Voice tension and arousal indicators',
    normalRange: { min: 0, max: 40 },
    warningRange: { min: 0, max: 70 },
    higherIsBetter: false,
    color: '#F59E0B',
  },
  pauseDuration: {
    key: 'pauseDuration',
    label: 'Pause Duration',
    unit: 's',
    description: 'Average pause length between phrases',
    normalRange: { min: 0.3, max: 1.5 },
    warningRange: { min: 0.1, max: 3.0 },
    higherIsBetter: false,
    color: '#06B6D4',
  },
  articulationRate: {
    key: 'articulationRate',
    label: 'Articulation Rate',
    unit: 'wps',
    description: 'Words spoken per second',
    normalRange: { min: 3.0, max: 5.0 },
    warningRange: { min: 2.0, max: 7.0 },
    higherIsBetter: false,
    color: '#10B981',
  },
  jitter: {
    key: 'jitter',
    label: 'Jitter',
    unit: '%',
    description: 'Frequency variation between cycles (vocal cord health)',
    normalRange: { min: 0, max: 1.0 },
    warningRange: { min: 0, max: 2.0 },
    higherIsBetter: false,
    color: '#8B5CF6',
  },
  shimmer: {
    key: 'shimmer',
    label: 'Shimmer',
    unit: '%',
    description: 'Amplitude variation (breath support indicator)',
    normalRange: { min: 0, max: 3.0 },
    warningRange: { min: 0, max: 6.0 },
    higherIsBetter: false,
    color: '#F472B6',
  },
  speechRate: {
    key: 'speechRate',
    label: 'Speech Rate',
    unit: 'wpm',
    description: 'Words per minute',
    normalRange: { min: 120, max: 180 },
    warningRange: { min: 80, max: 220 },
    higherIsBetter: false,
    color: '#34D399',
  },
  hnr: {
    key: 'hnr',
    label: 'HNR',
    unit: 'dB',
    description: 'Harmonic-to-Noise Ratio (voice quality)',
    normalRange: { min: 15, max: 25 },
    warningRange: { min: 10, max: 30 },
    higherIsBetter: true,
    color: '#60A5FA',
  },
};

// Reading prompts for voice biomarker capture
export const READING_PROMPTS = [
  {
    id: 'rainbow',
    title: 'The Rainbow Passage',
    text: 'When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow. The rainbow is a division of white light into many beautiful colors.',
    duration: 15,
  },
  {
    id: 'grandfather',
    title: 'The Grandfather Passage',
    text: 'You wish to know all about my grandfather. Well, he is nearly ninety-three years old. Yet he still thinks as swiftly as ever.',
    duration: 12,
  },
  {
    id: 'north_wind',
    title: 'The North Wind and the Sun',
    text: 'The North Wind and the Sun were disputing which was the stronger, when a traveler came along wrapped in a warm cloak.',
    duration: 12,
  },
  {
    id: 'caterpillar',
    title: 'The Caterpillar',
    text: 'Do you not see that caterpillar crawling on the wall? We watched it crawl up the wall, then down again.',
    duration: 10,
  },
  {
    id: 'free_speech',
    title: 'Free Speech',
    text: 'Speak freely about your day, your thoughts, or anything on your mind. There is no right or wrong answer.',
    duration: 30,
  },
];

// Calculate overall health score from biomarkers
export function calculateOverallScore(biomarker: Partial<BiomarkerData>): number {
  let totalWeight = 0;
  let weightedScore = 0;

  const weights: Record<string, number> = {
    clarity: 20,
    stress: 25,
    jitter: 15,
    shimmer: 15,
    hnr: 15,
    speechRate: 10,
  };

  Object.entries(weights).forEach(([key, weight]) => {
    const value = biomarker[key as keyof BiomarkerData] as number | undefined;
    if (value !== undefined && value !== null) {
      const metric = BIOMARKER_METRICS[key];
      if (metric) {
        const normalized = normalizeMetricValue(value, metric);
        weightedScore += normalized * weight;
        totalWeight += weight;
      }
    }
  });

  if (totalWeight === 0) {
    // Fallback to core metrics
    const clarity = biomarker.clarity ?? 75;
    const stress = biomarker.stress ?? 50;
    return Math.round((clarity * 0.6 + (100 - stress) * 0.4));
  }

  return Math.round(weightedScore / totalWeight);
}

// Normalize a metric value to 0-100 scale
export function normalizeMetricValue(value: number, metric: BiomarkerMetricInfo): number {
  const { normalRange, higherIsBetter } = metric;
  const mid = (normalRange.min + normalRange.max) / 2;
  const range = normalRange.max - normalRange.min;

  // How far from optimal (0 = at midpoint, 1 = at edge of normal range)
  const deviation = Math.abs(value - mid) / (range / 2);

  // Score: 100 at midpoint, decreasing as we deviate
  let score = Math.max(0, 100 - deviation * 30);

  // If outside normal range, penalize more
  if (value < normalRange.min || value > normalRange.max) {
    score = Math.max(0, score - 20);
  }

  // For metrics where higher is better, adjust accordingly
  if (higherIsBetter) {
    if (value >= normalRange.max) {
      score = 100;
    } else if (value < normalRange.min) {
      score = Math.max(0, (value / normalRange.min) * 60);
    }
  } else if (metric.key === 'stress') {
    // For stress, lower is better
    score = Math.max(0, 100 - value);
  }

  return Math.min(100, Math.max(0, score));
}

// Format duration in seconds to MM:SS
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format time for display
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Calculate trend direction and percentage
export function calculateTrend(
  current: number,
  previous: number
): { direction: 'up' | 'down' | 'stable'; percentChange: number } {
  if (previous === 0) {
    return { direction: 'stable', percentChange: 0 };
  }

  const percentChange = ((current - previous) / previous) * 100;

  if (Math.abs(percentChange) < 2) {
    return { direction: 'stable', percentChange: 0 };
  }

  return {
    direction: percentChange > 0 ? 'up' : 'down',
    percentChange: Math.abs(Math.round(percentChange * 10) / 10),
  };
}

// Get color based on metric value status
export function getMetricStatusColor(
  value: number,
  metric: BiomarkerMetricInfo
): 'green' | 'amber' | 'red' {
  const { normalRange, warningRange } = metric;

  if (value >= normalRange.min && value <= normalRange.max) {
    return 'green';
  }

  if (value >= warningRange.min && value <= warningRange.max) {
    return 'amber';
  }

  return 'red';
}

// Calculate statistics for a set of biomarker readings
export function calculateStats(biomarkers: BiomarkerData[]): Record<string, {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
}> {
  const stats: Record<string, { values: number[] }> = {};

  const numericKeys = ['pitch', 'clarity', 'stress', 'pauseDuration', 'articulationRate', 'jitter', 'shimmer', 'speechRate', 'hnr'];

  biomarkers.forEach(b => {
    numericKeys.forEach(key => {
      const value = b[key as keyof BiomarkerData] as number | undefined;
      if (value !== undefined && value !== null) {
        if (!stats[key]) stats[key] = { values: [] };
        stats[key].values.push(value);
      }
    });
  });

  const result: Record<string, { mean: number; stdDev: number; min: number; max: number }> = {};

  Object.entries(stats).forEach(([key, { values }]) => {
    if (values.length === 0) return;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    result[key] = {
      mean: Math.round(mean * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  });

  return result;
}

// Get suggested goal values based on current baseline
export function getSuggestedGoals(baseline: Record<string, number>): Record<string, { target: number; direction: 'increase' | 'decrease' | 'maintain' }> {
  const goals: Record<string, { target: number; direction: 'increase' | 'decrease' | 'maintain' }> = {};

  Object.entries(BIOMARKER_METRICS).forEach(([key, metric]) => {
    const current = baseline[key];
    if (current === undefined) return;

    const { normalRange, higherIsBetter } = metric;
    const mid = (normalRange.min + normalRange.max) / 2;

    if (higherIsBetter) {
      // Target the upper end of normal range
      goals[key] = {
        target: normalRange.max,
        direction: current < normalRange.max ? 'increase' : 'maintain',
      };
    } else if (key === 'stress') {
      // Stress: aim for lower end
      goals[key] = {
        target: normalRange.min + (normalRange.max - normalRange.min) * 0.25,
        direction: current > normalRange.min ? 'decrease' : 'maintain',
      };
    } else {
      // Most metrics: aim for middle of normal range
      goals[key] = {
        target: mid,
        direction: current < mid ? 'increase' : current > mid ? 'decrease' : 'maintain',
      };
    }
  });

  return goals;
}

// Detect anomalies in biomarker readings
export function detectAnomalies(
  current: BiomarkerData,
  baseline: Record<string, { mean: number; stdDev: number }>
): Array<{ metric: string; value: number; expected: number; severity: 'low' | 'medium' | 'high' }> {
  const anomalies: Array<{ metric: string; value: number; expected: number; severity: 'low' | 'medium' | 'high' }> = [];

  Object.entries(baseline).forEach(([key, { mean, stdDev }]) => {
    const value = current[key as keyof BiomarkerData] as number | undefined;
    if (value === undefined || value === null || stdDev === 0) return;

    const zScore = Math.abs((value - mean) / stdDev);

    if (zScore >= 2) {
      anomalies.push({
        metric: key,
        value,
        expected: mean,
        severity: zScore >= 3 ? 'high' : zScore >= 2.5 ? 'medium' : 'low',
      });
    }
  });

  return anomalies;
}
