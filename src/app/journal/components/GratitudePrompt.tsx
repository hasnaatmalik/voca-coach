'use client';

import { useState } from 'react';

interface GratitudePromptProps {
  onSave?: () => void;
  onStreakUpdate?: () => void;
}

const GRATITUDE_PROMPTS = [
  "What made you smile today?",
  "Who helped you recently?",
  "What's a small thing you're grateful for?",
  "What's something beautiful you noticed today?",
  "What ability or skill are you thankful for?",
  "What's a challenge that taught you something?",
];

export default function GratitudePrompt({ onSave, onStreakUpdate }: GratitudePromptProps) {
  const [items, setItems] = useState<[string, string, string]>(['', '', '']);
  const [elaborations, setElaborations] = useState<[string, string, string]>(['', '', '']);
  const [showElaborations, setShowElaborations] = useState([false, false, false]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const prompts = GRATITUDE_PROMPTS.sort(() => Math.random() - 0.5).slice(0, 3);

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items] as [string, string, string];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleElaborationChange = (index: number, value: string) => {
    const newElabs = [...elaborations] as [string, string, string];
    newElabs[index] = value;
    setElaborations(newElabs);
  };

  const toggleElaboration = (index: number) => {
    const newShow = [...showElaborations];
    newShow[index] = !newShow[index];
    setShowElaborations(newShow);
  };

  const handleSave = async () => {
    const filledItems = items.filter((item) => item.trim());
    if (filledItems.length === 0) return;

    setIsSaving(true);

    try {
      // Build content
      const content = items
        .map((item, i) => {
          if (!item.trim()) return null;
          let text = `${i + 1}. ${item}`;
          if (elaborations[i].trim()) {
            text += `\n   Why: ${elaborations[i]}`;
          }
          return text;
        })
        .filter(Boolean)
        .join('\n\n');

      await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Daily Gratitude',
          content,
          gratitudeItems: items.filter((i) => i.trim()),
          mood: 7, // Default positive mood for gratitude
        }),
      });

      // Create session
      await fetch('/api/journal-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: 'gratitude',
          title: 'Gratitude Practice',
          messages: items.map((item, i) => ({
            prompt: prompts[i],
            response: item,
            elaboration: elaborations[i] || null,
          })),
          isComplete: true,
        }),
      });

      setShowSuccess(true);
      onStreakUpdate?.();
      onSave?.();

      setTimeout(() => {
        setShowSuccess(false);
        setItems(['', '', '']);
        setElaborations(['', '', '']);
        setShowElaborations([false, false, false]);
      }, 3000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filledCount = items.filter((i) => i.trim()).length;

  if (showSuccess) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
        padding: '48px',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '16px',
          animation: 'bounce 0.5s ease',
        }}>
          🙏
        </div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#10B981',
          margin: '0 0 8px',
        }}>
          Gratitude Recorded!
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#6B7280',
        }}>
          Taking time to appreciate makes life richer
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
        borderBottom: '1px solid #A7F3D0',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '32px' }}>🙏</span>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#065F46',
            margin: 0,
          }}>
            Daily Gratitude
          </h2>
        </div>
        <p style={{
          fontSize: '14px',
          color: '#047857',
          margin: 0,
        }}>
          List three things you&apos;re grateful for today
        </p>
      </div>

      {/* Items */}
      <div style={{ padding: '24px' }}>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            style={{
              marginBottom: index < 2 ? '24px' : 0,
            }}
          >
            {/* Prompt */}
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#059669',
              marginBottom: '8px',
            }}>
              {index + 1}. {prompts[index]}
            </label>

            {/* Input */}
            <input
              value={items[index]}
              onChange={(e) => handleItemChange(index, e.target.value)}
              placeholder="I'm grateful for..."
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #D1FAE5',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                background: '#F0FDF4',
              }}
            />

            {/* Elaboration Toggle */}
            {items[index].trim() && (
              <button
                onClick={() => toggleElaboration(index)}
                style={{
                  marginTop: '8px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  color: '#059669',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {showElaborations[index] ? '− Hide' : '+ Add'} why this matters
              </button>
            )}

            {/* Elaboration Input */}
            {showElaborations[index] && (
              <textarea
                value={elaborations[index]}
                onChange={(e) => handleElaborationChange(index, e.target.value)}
                placeholder="Why does this make you grateful?"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  marginTop: '8px',
                  minHeight: '60px',
                  resize: 'vertical',
                }}
              />
            )}
          </div>
        ))}

        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '24px',
          marginBottom: '20px',
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '40px',
                height: '4px',
                borderRadius: '2px',
                background: items[i].trim() ? '#10B981' : '#E5E7EB',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={filledCount === 0 || isSaving}
          style={{
            width: '100%',
            padding: '16px',
            background: filledCount > 0 && !isSaving
              ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
              : '#E5E7EB',
            border: 'none',
            borderRadius: '14px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',
            cursor: filledCount > 0 && !isSaving ? 'pointer' : 'not-allowed',
          }}
        >
          {isSaving ? 'Saving...' : `Save ${filledCount}/3 Gratitude${filledCount !== 1 ? 's' : ''}`}
        </button>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
