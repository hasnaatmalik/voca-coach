'use client';

import { useState, useEffect, useCallback } from 'react';

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
};

// Icon component
const HeartIcon = ({ color = themeColors.primaryDark, size = 28 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CheckCircleIcon = ({ color = themeColors.success, size = 64 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const RefreshIcon = ({ color = themeColors.primaryDark, size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const SparklesIcon = ({ color = themeColors.primaryDark, size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <path d="M5 19l.5 1.5L7 21l-1.5.5L5 23l-.5-1.5L3 21l1.5-.5L5 19z" />
    <path d="M19 10l.5 1.5L21 12l-1.5.5L19 14l-.5-1.5L17 12l1.5-.5L19 10z" />
  </svg>
);

interface GratitudePromptProps {
  onSave?: () => void;
  onStreakUpdate?: () => void;
}

const GRATITUDE_PROMPTS_BY_CATEGORY = {
  relationships: [
    "Who made a positive impact on your life recently?",
    "What relationship are you most thankful for right now?",
    "Who believed in you when you needed it most?",
    "What's a kind thing someone did for you lately?",
    "Who inspires you to be a better person?",
  ],
  moments: [
    "What made you smile today?",
    "What's a peaceful moment you experienced recently?",
    "What's something beautiful you noticed today?",
    "What unexpected joy did you encounter this week?",
    "What made you laugh recently?",
  ],
  personal: [
    "What ability or skill are you thankful for?",
    "What personal strength helped you recently?",
    "What's something about yourself you appreciate?",
    "What progress have you made that you're proud of?",
    "What part of your daily routine brings you comfort?",
  ],
  simple: [
    "What's a small thing you're grateful for?",
    "What simple pleasure did you enjoy today?",
    "What comfort do you often take for granted?",
    "What basic need are you thankful to have met?",
    "What everyday convenience are you grateful for?",
  ],
  growth: [
    "What's a challenge that taught you something valuable?",
    "What opportunity are you grateful to have?",
    "What lesson from the past are you thankful for now?",
    "What new experience enriched your life recently?",
    "What mistake led to unexpected growth?",
  ],
  present: [
    "What about this exact moment are you grateful for?",
    "What's good in your life right now?",
    "What are you looking forward to?",
    "What made today better than yesterday?",
    "What's one thing going well in your life?",
  ],
};

const getRandomPrompts = (): string[] => {
  const categories = Object.keys(GRATITUDE_PROMPTS_BY_CATEGORY) as (keyof typeof GRATITUDE_PROMPTS_BY_CATEGORY)[];
  const shuffledCategories = [...categories].sort(() => Math.random() - 0.5).slice(0, 3);

  return shuffledCategories.map(category => {
    const prompts = GRATITUDE_PROMPTS_BY_CATEGORY[category];
    return prompts[Math.floor(Math.random() * prompts.length)];
  });
};

export default function GratitudePrompt({ onSave, onStreakUpdate }: GratitudePromptProps) {
  const [items, setItems] = useState<[string, string, string]>(['', '', '']);
  const [elaborations, setElaborations] = useState<[string, string, string]>(['', '', '']);
  const [showElaborations, setShowElaborations] = useState([false, false, false]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [prompts, setPrompts] = useState<string[]>(getRandomPrompts);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);

  const refreshPrompts = useCallback(() => {
    setPrompts(getRandomPrompts());
    setIsPersonalized(false);
  }, []);

  const generatePersonalizedPrompts = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/journal/personalized-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'gratitude' }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.prompts && data.prompts.length >= 3) {
          setPrompts(data.prompts.slice(0, 3));
          setIsPersonalized(true);
        }
      } else {
        // Fallback to random prompts if personalization fails
        refreshPrompts();
      }
    } catch (err) {
      console.error('Failed to generate personalized prompts:', err);
      refreshPrompts();
    } finally {
      setIsGenerating(false);
    }
  }, [refreshPrompts]);

  // Generate personalized prompts on mount
  useEffect(() => {
    generatePersonalizedPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        boxShadow: '0 4px 16px rgba(217, 162, 153, 0.12)',
        border: `1px solid ${themeColors.border}`,
        padding: '48px',
        textAlign: 'center',
      }}>
        <div style={{
          marginBottom: '16px',
          animation: 'bounce 0.5s ease',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <CheckCircleIcon />
        </div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: themeColors.success,
          margin: '0 0 8px',
        }}>
          Gratitude Recorded!
        </h2>
        <p style={{
          fontSize: '14px',
          color: themeColors.textMuted,
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
      boxShadow: '0 4px 16px rgba(217, 162, 153, 0.12)',
      border: `1px solid ${themeColors.border}`,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        background: `linear-gradient(135deg, ${themeColors.primary}15 0%, ${themeColors.secondary}20 100%)`,
        borderBottom: `1px solid ${themeColors.border}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: `${themeColors.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <HeartIcon />
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: themeColors.text,
                margin: 0,
              }}>
                Daily Gratitude
              </h2>
              <p style={{
                fontSize: '14px',
                color: themeColors.textMuted,
                margin: 0,
              }}>
                List three things you&apos;re grateful for today
              </p>
            </div>
          </div>

          {/* Refresh / Personalize Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={generatePersonalizedPrompts}
              disabled={isGenerating}
              title="Generate personalized questions"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: isPersonalized ? `${themeColors.primary}20` : 'white',
                border: `1px solid ${isPersonalized ? themeColors.primary : themeColors.border}`,
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '500',
                color: themeColors.primaryDark,
                cursor: isGenerating ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                opacity: isGenerating ? 0.7 : 1,
              }}
            >
              <SparklesIcon size={14} />
              {isGenerating ? 'Generating...' : 'For You'}
            </button>
            <button
              onClick={refreshPrompts}
              disabled={isGenerating}
              title="Get different questions"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                background: 'white',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '10px',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isGenerating ? 0.5 : 1,
              }}
            >
              <RefreshIcon size={16} />
            </button>
          </div>
        </div>
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
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: themeColors.primaryDark,
              marginBottom: '8px',
              minHeight: '20px',
            }}>
              <span>{index + 1}.</span>
              {isGenerating ? (
                <span style={{
                  display: 'inline-block',
                  height: '14px',
                  width: '200px',
                  background: `linear-gradient(90deg, ${themeColors.border} 25%, ${themeColors.cream} 50%, ${themeColors.border} 75%)`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  borderRadius: '4px',
                }} />
              ) : (
                <span>{prompts[index]}</span>
              )}
              {isPersonalized && index === 0 && !isGenerating && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: themeColors.primary,
                  background: `${themeColors.primary}15`,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Personalized
                </span>
              )}
            </label>

            {/* Input */}
            <input
              value={items[index]}
              onChange={(e) => handleItemChange(index, e.target.value)}
              placeholder="I'm grateful for..."
              style={{
                width: '100%',
                padding: '14px 16px',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                background: themeColors.cream,
                color: themeColors.text,
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
                  color: themeColors.primaryDark,
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
                  border: `1px solid ${themeColors.border}`,
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  marginTop: '8px',
                  minHeight: '60px',
                  resize: 'vertical',
                  color: themeColors.text,
                  background: 'white',
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
                background: items[i].trim() ? themeColors.primaryDark : themeColors.border,
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
              ? `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`
              : themeColors.border,
            border: 'none',
            borderRadius: '14px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',
            cursor: filledCount > 0 && !isSaving ? 'pointer' : 'not-allowed',
            boxShadow: filledCount > 0 && !isSaving ? '0 4px 12px rgba(217, 162, 153, 0.35)' : 'none',
            transition: 'all 0.2s',
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
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
