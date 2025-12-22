'use client';

import PersonaCard from './PersonaCard';

interface Persona {
  id: string;
  name: string;
  type: 'preset' | 'custom';
  description: string;
  icon: string;
  voiceId?: string;
}

interface PersonaListProps {
  personas: Persona[];
  activePersonaId: string;
  onSelect: (personaId: string) => void;
  onCreateNew: () => void;
  onEdit?: (persona: Persona) => void;
  onDelete?: (personaId: string) => void;
  isCompact?: boolean;
  disabled?: boolean;
}

export default function PersonaList({
  personas,
  activePersonaId,
  onSelect,
  onCreateNew,
  onEdit,
  onDelete,
  isCompact = false,
  disabled = false
}: PersonaListProps) {
  return (
    <div>
      <h2 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: '16px'
      }}>
        Available Personas
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {personas.map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            isSelected={activePersonaId === persona.id}
            isCompact={isCompact}
            onSelect={() => onSelect(persona.id)}
            onEdit={onEdit && persona.type === 'custom' ? () => onEdit(persona) : undefined}
            onDelete={onDelete && persona.type === 'custom' ? () => onDelete(persona.id) : undefined}
            disabled={disabled}
          />
        ))}

        {/* Create New Button */}
        {!disabled && (
          <button
            onClick={onCreateNew}
            style={{
              background: 'transparent',
              border: '2px dashed #D1D5DB',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#6B7280',
              fontWeight: '500',
              fontSize: '15px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '20px' }}>+</span>
            Create Custom Persona
          </button>
        )}
      </div>
    </div>
  );
}
