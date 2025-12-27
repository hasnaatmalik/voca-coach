'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// SVG Icon Component
const LightbulbIcon = ({ color = '#E4B17A', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

interface Template {
  name: string;
  description: string;
  icon: ReactNode;
}

interface TemplatesCardProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
}

export default function TemplatesCard({
  templates,
  onSelectTemplate,
}: TemplatesCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '20px',
        border: '1px solid #DCC5B2',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
      }}>
        <LightbulbIcon color="#E4B17A" size={18} />
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#6B6B6B',
          margin: 0,
        }}>
          Quick Templates
        </h3>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        {templates.map((template, index) => (
          <motion.button
            key={template.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            whileHover={{
              scale: 1.05,
              y: -2,
              background: 'linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 100%)',
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectTemplate(template)}
            style={{
              padding: '10px 16px',
              background: 'white',
              border: '1px solid #F0E4D3',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#2D2D2D',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>{template.icon}</span>
            <span>{template.name}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
