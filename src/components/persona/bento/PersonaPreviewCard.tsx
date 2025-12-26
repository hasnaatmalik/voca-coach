'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { renderIconById, ICON_DEFINITIONS } from '@/app/persona/components/IconPicker';

// Theme colors
const themeColors = {
  primary: '#D9A299',
  primaryDark: '#C08B82',
  secondary: '#DCC5B2',
  border: '#DCC5B2',
  text: '#2D2D2D',
  textMuted: '#6B6B6B',
  cream: '#FAF7F3',
  beige: '#F0E4D3',
  success: '#7AB89E',
  warning: '#E4B17A',
};

// Helper to check if a string is a valid icon ID
const isIconId = (icon: string): boolean => {
  return ICON_DEFINITIONS.some(def => def.id === icon);
};

// Render icon - handles both icon IDs and direct ReactNode/emojis
const renderPersonaIcon = (icon: string | ReactNode, size: number = 56): ReactNode => {
  if (typeof icon === 'string' && isIconId(icon)) {
    return renderIconById(icon, size);
  }
  return icon;
};

// SVG Icon Components
const SparklesIcon = ({ color = themeColors.success, size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const TheaterMaskIcon = ({ color = themeColors.primaryDark, size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M5.5 5.5A2.5 2.5 0 0 1 8 3h8a2.5 2.5 0 0 1 2.5 2.5v2.9a10 10 0 0 1-5 8.7 10 10 0 0 1-5-8.7v-2.9z" />
    <path d="M6 16c1.5 1 3 1.5 6 1.5s4.5-.5 6-1.5" />
    <circle cx="9" cy="10" r="1" fill={color} />
    <circle cx="15" cy="10" r="1" fill={color} />
  </svg>
);

const PencilIcon = ({ color = themeColors.textMuted, size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const ChatIcon = ({ color = 'white', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

interface Persona {
  id: string;
  name: string;
  type: 'preset' | 'custom';
  description: string;
  icon: string | ReactNode;
}

interface PersonaPreviewCardProps {
  persona: Persona | undefined;
  onStartChat: () => void;
  onEdit: (persona: Persona) => void;
}

export default function PersonaPreviewCard({
  persona,
  onStartChat,
  onEdit,
}: PersonaPreviewCardProps) {
  if (!persona) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderRadius: '28px',
        padding: '48px',
        border: '1px solid #DCC5B2',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background decoration */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-20%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${themeColors.secondary} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '-40%',
          right: '-20%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${themeColors.primary} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          style={{
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 100%)',
            borderRadius: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '56px',
            margin: '0 auto 28px',
            border: '2px solid #DCC5B2',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
          }}
        >
          {renderPersonaIcon(persona.icon, 56)}
        </motion.div>

        {/* Name */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#2D2D2D',
            margin: '0 0 12px',
          }}
        >
          {persona.name}
        </motion.h2>

        {/* Type badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            background: persona.type === 'custom' ? `${themeColors.success}20` : `${themeColors.primary}20`,
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            color: persona.type === 'custom' ? themeColors.success : themeColors.primaryDark,
            marginBottom: '20px',
          }}
        >
          {persona.type === 'custom' ? <><SparklesIcon color={themeColors.success} size={14} /> Custom</> : <><TheaterMaskIcon color={themeColors.primaryDark} size={14} /> Preset</>}
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            color: '#6B6B6B',
            fontSize: '16px',
            lineHeight: 1.6,
            maxWidth: '400px',
            margin: '0 auto 32px',
          }}
        >
          {persona.description}
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {persona.type === 'custom' && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onEdit(persona)}
              style={{
                padding: '14px 28px',
                background: '#FAF7F3',
                color: '#6B6B6B',
                border: '1px solid #DCC5B2',
                borderRadius: '14px',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <PencilIcon color="#6B6B6B" size={16} /> Edit Persona
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(217, 162, 153, 0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onStartChat}
            style={{
              padding: '16px 40px',
              background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`,
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(217, 162, 153, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ChatIcon color="white" size={20} />
            </motion.span>
            Start Conversation
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
