'use client';

// SVG Icon Components
const PencilIcon = ({ color = '#6B7280', size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const TrashIcon = ({ color = '#EF4444', size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

interface Persona {
  id: string;
  name: string;
  type: 'preset' | 'custom';
  description: string;
  icon: string;
  voiceId?: string;
}

interface PersonaCardProps {
  persona: Persona;
  isSelected: boolean;
  isCompact?: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}

export default function PersonaCard({
  persona,
  isSelected,
  isCompact = false,
  onSelect,
  onEdit,
  onDelete,
  disabled = false
}: PersonaCardProps) {
  const handleMenuClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div
      onClick={!disabled ? onSelect : undefined}
      style={{
        background: isSelected ? '#ECFDF5' : 'white',
        border: isSelected ? '2px solid #7C3AED' : '1px solid #E5E7EB',
        borderRadius: '16px',
        padding: isCompact ? '12px' : '20px',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        opacity: disabled && !isSelected ? 0.5 : 1,
        position: 'relative'
      }}
    >
      {/* Icon */}
      <div style={{
        width: isCompact ? '36px' : '48px',
        height: isCompact ? '36px' : '48px',
        background: isSelected ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' : '#F3F4F6',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: isCompact ? '18px' : '24px',
        flexShrink: 0
      }}>
        {persona.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: '600',
          color: '#1F2937',
          fontSize: isCompact ? '14px' : '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {persona.name}
          {persona.type === 'custom' && (
            <span style={{
              fontSize: '10px',
              padding: '2px 6px',
              background: '#E0E7FF',
              color: '#4F46E5',
              borderRadius: '4px'
            }}>
              Custom
            </span>
          )}
        </div>
        {!isCompact && (
          <div style={{
            fontSize: '13px',
            color: '#6B7280',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {persona.description}
          </div>
        )}
      </div>

      {/* Action Menu for Custom Personas */}
      {persona.type === 'custom' && !disabled && (onEdit || onDelete) && (
        <div style={{ display: 'flex', gap: '4px' }}>
          {onEdit && (
            <button
              onClick={(e) => handleMenuClick(e, onEdit)}
              style={{
                width: '32px',
                height: '32px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Edit persona"
            >
              <PencilIcon color="#6B7280" size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => handleMenuClick(e, onDelete)}
              style={{
                width: '32px',
                height: '32px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Delete persona"
            >
              <TrashIcon color="#EF4444" size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
