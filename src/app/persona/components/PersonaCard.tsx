'use client';

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
                color: '#6B7280',
                fontSize: '14px'
              }}
              title="Edit persona"
            >
              ✏️
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
                color: '#EF4444',
                fontSize: '14px'
              }}
              title="Delete persona"
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  );
}
