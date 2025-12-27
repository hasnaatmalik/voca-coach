'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { renderIconById, ICON_DEFINITIONS } from '@/app/persona/components/IconPicker';

// SVG Icon Components
const PencilIcon = ({ color = 'currentColor', size = 12 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const TrashIcon = ({ color = 'currentColor', size = 12 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

// Helper to check if a string is a valid icon ID
const isIconId = (icon: string): boolean => {
  return ICON_DEFINITIONS.some(def => def.id === icon);
};

// Render icon - handles both icon IDs and direct ReactNode/emojis
const renderPersonaIcon = (icon: string | ReactNode, size: number = 32): ReactNode => {
  if (typeof icon === 'string' && isIconId(icon)) {
    return renderIconById(icon, size);
  }
  return icon;
};

interface Persona {
  id: string;
  name: string;
  type: 'preset' | 'custom';
  description: string;
  icon: string | ReactNode;
}

interface PersonaGridProps {
  personas: Persona[];
  activePersonaId: string;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  onEdit: (persona: Persona) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export default function PersonaGrid({
  personas,
  activePersonaId,
  onSelect,
  onCreateNew,
  onEdit,
  onDelete,
  disabled = false,
}: PersonaGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '24px',
        border: '1px solid #DCC5B2',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#2D2D2D',
          margin: 0,
        }}>
          Your Personas
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateNew}
          disabled={disabled}
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #7AB89E 0%, #5A9880 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <span>+</span> New
        </motion.button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
      }}>
        {personas.map((persona, index) => {
          const isActive = persona.id === activePersonaId;
          return (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
              onClick={() => !disabled && onSelect(persona.id)}
              style={{
                padding: '16px',
                background: isActive
                  ? 'linear-gradient(135deg, #7AAFC9 0%, #5A9BB8 100%)'
                  : '#FAF7F3',
                borderRadius: '16px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                border: isActive ? '2px solid transparent' : '1px solid #F0E4D3',
                position: 'relative',
                opacity: disabled ? 0.7 : 1,
              }}
            >
              {/* Custom badge */}
              {persona.type === 'custom' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isActive ? 'rgba(255,255,255,0.8)' : '#7AB89E',
                  }}
                />
              )}

              <motion.div
                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2.5 }}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: isActive
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(220, 197, 178, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                {renderPersonaIcon(persona.icon, 28)}
              </motion.div>

              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: isActive ? 'white' : '#2D2D2D',
                marginBottom: '4px',
              }}>
                {persona.name}
              </div>

              <div style={{
                fontSize: '12px',
                color: isActive ? 'rgba(255,255,255,0.8)' : '#6B6B6B',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {persona.description}
              </div>

              {/* Action buttons for custom personas */}
              {persona.type === 'custom' && !disabled && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    display: 'flex',
                    gap: '4px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(persona)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive ? 'rgba(255,255,255,0.2)' : 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PencilIcon color={isActive ? 'white' : '#6B6B6B'} size={12} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(persona.id)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive ? 'rgba(255,255,255,0.2)' : 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TrashIcon color={isActive ? 'white' : '#EF4444'} size={12} />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
