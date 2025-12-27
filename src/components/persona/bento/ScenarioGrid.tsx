'use client';

import { motion } from 'framer-motion';
import { Scenario } from '@/app/persona/scenarios';

// SVG Icon Component
const TargetIcon = ({ color = '#D9A299', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

interface ScenarioGridProps {
  scenarios: Scenario[];
  onStartScenario: (scenario: Scenario) => void;
  onClose: () => void;
}

const DIFFICULTY_CONFIG = {
  easy: { bg: '#E8F5E9', color: '#2E7D32', label: 'Easy' },
  medium: { bg: '#FFF8E1', color: '#F57C00', label: 'Medium' },
  hard: { bg: '#FFEBEE', color: '#C62828', label: 'Hard' },
};

export default function ScenarioGrid({
  scenarios,
  onStartScenario,
  onClose,
}: ScenarioGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        border: '1px solid #DCC5B2',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '24px 28px',
        borderBottom: '1px solid #F0E4D3',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#FAF7F3',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            style={{ fontSize: '24px' }}
          >
            <TargetIcon color="#D9A299" size={24} />
          </motion.div>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#2D2D2D',
              margin: 0,
            }}>
              Practice Scenarios
            </h3>
            <p style={{
              fontSize: '13px',
              color: '#6B6B6B',
              margin: '4px 0 0',
            }}>
              Real-world conversation practice
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: '1px solid #DCC5B2',
            background: 'white',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6B6B6B',
          }}
        >
          ×
        </motion.button>
      </div>

      {/* Scenarios */}
      <div style={{
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        maxHeight: '500px',
        overflowY: 'auto',
      }}>
        {scenarios.map((scenario, index) => {
          const diffConfig = DIFFICULTY_CONFIG[scenario.difficulty];
          return (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              style={{
                background: '#FAF7F3',
                borderRadius: '18px',
                padding: '20px',
                border: '1px solid #F0E4D3',
                cursor: 'pointer',
              }}
              onClick={() => onStartScenario(scenario)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
              }}>
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 3, delay: index * 0.2 }}
                  style={{
                    width: '50px',
                    height: '50px',
                    background: 'white',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    flexShrink: 0,
                  }}
                >
                  {scenario.icon}
                </motion.div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px',
                  }}>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#2D2D2D',
                    }}>
                      {scenario.name}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: diffConfig.bg,
                      color: diffConfig.color,
                      fontWeight: '600',
                    }}>
                      {diffConfig.label}
                    </span>
                  </div>

                  <p style={{
                    fontSize: '13px',
                    color: '#6B6B6B',
                    margin: '0 0 12px',
                    lineHeight: 1.4,
                  }}>
                    {scenario.description}
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartScenario(scenario);
                    }}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>▶</span> Start Practice
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
