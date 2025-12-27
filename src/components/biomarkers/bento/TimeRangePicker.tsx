'use client';

import { motion } from 'framer-motion';

interface TimeRange {
  preset?: string;
  days?: number;
  startDate?: string;
  endDate?: string;
}

interface TimeRangePickerProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const presets = [
  { id: '7d', label: '7 Days', days: 7 },
  { id: '14d', label: '14 Days', days: 14 },
  { id: '30d', label: '30 Days', days: 30 },
  { id: '90d', label: '90 Days', days: 90 },
];

export default function TimeRangePicker({ value, onChange }: TimeRangePickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'inline-flex',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '14px',
        padding: '4px',
        border: '1px solid #DCC5B2',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
      }}
    >
      {presets.map((preset) => (
        <motion.button
          key={preset.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange({ preset: preset.id, days: preset.days })}
          style={{
            padding: '10px 18px',
            background: value.preset === preset.id
              ? 'linear-gradient(135deg, #7AAFC9 0%, #5A9BB8 100%)'
              : 'transparent',
            color: value.preset === preset.id ? 'white' : '#6B6B6B',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {preset.label}
        </motion.button>
      ))}
    </motion.div>
  );
}
