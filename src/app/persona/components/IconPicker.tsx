'use client';

import { useState } from 'react';

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (iconId: string) => void;
}

interface IconDefinition {
  id: string;
  name: string;
  render: (color: string, size: number) => React.ReactNode;
}

// Theme colors from globals.css - wellness theme
const THEME = {
  cream: '#FAF7F3',
  beige: '#F0E4D3',
  tan: '#DCC5B2',
  rose: '#D9A299',
  roseDark: '#C8847A',
  text: '#2D2D2D',
  textMuted: '#6B6B6B',
  success: '#7AB89E',
};

// Single accent color for all icons - using the primary rose color
const ICON_COLOR = THEME.rose;

const ICON_DEFINITIONS: IconDefinition[] = [
  // People & Wellness
  {
    id: 'meditation',
    name: 'Meditation',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="6" r="3" />
        <path d="M12 9v4" />
        <path d="M8 17.5c0-2.5 1.79-4.5 4-4.5s4 2 4 4.5" />
        <path d="M6 20c0-1.5.5-3 2-4" />
        <path d="M18 20c0-1.5-.5-3-2-4" />
      </svg>
    ),
  },
  {
    id: 'heart',
    name: 'Heart',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    id: 'smile',
    name: 'Smile',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  {
    id: 'leaf',
    name: 'Leaf',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    ),
  },
  {
    id: 'brain',
    name: 'Brain',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
        <path d="M12 5v13" />
        <path d="M7 9.5h2" />
        <path d="M15 9.5h2" />
        <path d="M7 14.5h2" />
        <path d="M15 14.5h2" />
      </svg>
    ),
  },
  // Work & Focus
  {
    id: 'briefcase',
    name: 'Briefcase',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    id: 'target',
    name: 'Target',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: 'lightbulb',
    name: 'Lightbulb',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
      </svg>
    ),
  },
  {
    id: 'clock',
    name: 'Clock',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    id: 'award',
    name: 'Award',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  // Communication
  {
    id: 'chat',
    name: 'Chat',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'users',
    name: 'Users',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'worried',
    name: 'Worried',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 15s1.5 2 4 2 4-2 4-2" />
        <path d="M9 9h.01" />
        <path d="M15 9h.01" />
        <path d="M8 6s1-1 2-1" />
        <path d="M16 6s-1-1-2-1" />
      </svg>
    ),
  },
  {
    id: 'headphones',
    name: 'Headphones',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
        <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
  },
  {
    id: 'coffee',
    name: 'Coffee',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" y1="2" x2="6" y2="4" />
        <line x1="10" y1="2" x2="10" y2="4" />
        <line x1="14" y1="2" x2="14" y2="4" />
      </svg>
    ),
  },
  // Creative & Energy
  {
    id: 'sparkles',
    name: 'Sparkles',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
      </svg>
    ),
  },
  {
    id: 'star',
    name: 'Star',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
  },
  {
    id: 'music',
    name: 'Music',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    id: 'flame',
    name: 'Flame',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
  },
  {
    id: 'zap',
    name: 'Zap',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  // Other useful icons
  {
    id: 'microphone',
    name: 'Microphone',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  {
    id: 'book',
    name: 'Book',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    id: 'shield',
    name: 'Shield',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: 'compass',
    name: 'Compass',
    render: (color, size) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
];

// Group icons by category
const ICON_CATEGORIES = {
  'Wellness': ['meditation', 'heart', 'smile', 'leaf', 'brain'],
  'Focus': ['briefcase', 'target', 'lightbulb', 'clock', 'award'],
  'Social': ['chat', 'users', 'worried', 'headphones', 'coffee'],
  'Creative': ['sparkles', 'star', 'music', 'flame', 'zap'],
  'Tools': ['microphone', 'book', 'shield', 'compass'],
};

export default function IconPicker({ selectedIcon, onSelect }: IconPickerProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof ICON_CATEGORIES>('Wellness');

  const selectedIconDef = ICON_DEFINITIONS.find(i => i.id === selectedIcon);
  const categoryIcons = ICON_CATEGORIES[activeCategory].map(id =>
    ICON_DEFINITIONS.find(i => i.id === id)
  ).filter(Boolean) as IconDefinition[];

  return (
    <div>
      {/* Selected Preview */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        padding: '14px',
        background: THEME.beige,
        borderRadius: '14px',
        border: `1px solid ${THEME.tan}`,
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: THEME.cream,
          border: `1px solid ${THEME.tan}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {selectedIconDef ? selectedIconDef.render(ICON_COLOR, 28) : (
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={THEME.textMuted} strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          )}
        </div>
        <div>
          <div style={{ fontSize: '12px', color: THEME.textMuted }}>Selected Icon</div>
          <div style={{ fontWeight: '600', color: THEME.text, fontSize: '14px' }}>
            {selectedIconDef?.name || 'Choose an icon'}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        marginBottom: '16px',
        paddingBottom: '4px'
      }}>
        {Object.keys(ICON_CATEGORIES).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat as keyof typeof ICON_CATEGORIES)}
            style={{
              padding: '8px 14px',
              background: activeCategory === cat ? THEME.rose : THEME.cream,
              color: activeCategory === cat ? 'white' : THEME.textMuted,
              border: `1px solid ${activeCategory === cat ? THEME.rose : THEME.tan}`,
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Icon Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '10px',
      }}>
        {categoryIcons.map((iconDef) => {
          const isSelected = selectedIcon === iconDef.id;
          return (
            <button
              key={iconDef.id}
              onClick={() => onSelect(iconDef.id)}
              title={iconDef.name}
              style={{
                width: '56px',
                height: '56px',
                background: isSelected ? `${THEME.rose}15` : THEME.cream,
                border: isSelected ? `2px solid ${THEME.rose}` : `1px solid ${THEME.tan}`,
                borderRadius: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              {iconDef.render(isSelected ? THEME.roseDark : THEME.rose, 26)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Export helper to render an icon by ID (for use in other components)
export function renderIconById(iconId: string, size: number = 32): React.ReactNode {
  const iconDef = ICON_DEFINITIONS.find(i => i.id === iconId);
  if (!iconDef) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={THEME.textMuted} strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    );
  }
  return iconDef.render(ICON_COLOR, size);
}

// Export icon definitions for external use
export { ICON_DEFINITIONS, THEME as ACCENT_COLORS };
