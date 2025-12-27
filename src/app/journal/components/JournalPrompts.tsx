'use client';

import { useState, useEffect, ReactNode } from 'react';

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

// SVG Icon Components
const SparklesIcon = ({ color = themeColors.primaryDark, size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const MirrorIcon = ({ color = themeColors.primaryDark, size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
  </svg>
);

const PrayIcon = ({ color = themeColors.success, size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M7 11v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3a4 4 0 0 0 4-4V4" />
    <path d="M17 11v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-3a4 4 0 0 1-4-4V4" />
  </svg>
);

const SproutIcon = ({ color = themeColors.warning, size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M7 20h10" />
    <path d="M12 20v-9" />
    <path d="M12 11a5 5 0 0 1 5-5c0 3.5-1.5 6.5-5 9" />
    <path d="M12 11a5 5 0 0 0-5-5c0 3.5 1.5 6.5 5 9" />
  </svg>
);

const ThoughtIcon = ({ color = themeColors.primary, size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

const HeartIcon = ({ color = '#E07A5F', size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const CheckIcon = ({ color = themeColors.success, size = 12 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const PenIcon = ({ color = themeColors.primaryDark, size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

interface Prompt {
  id: string;
  category: string;
  prompt: string;
  isAIGenerated: boolean;
}

interface JournalPromptsProps {
  onSelectPrompt?: (prompt: string) => void;
  onViewChange?: (mode: 'write' | 'chat') => void;
}

const CATEGORIES: { id: string; label: string; icon: ReactNode }[] = [
  { id: 'all', label: 'All', icon: <SparklesIcon color={themeColors.primaryDark} size={14} /> },
  { id: 'reflection', label: 'Reflection', icon: <MirrorIcon color={themeColors.primaryDark} size={14} /> },
  { id: 'gratitude', label: 'Gratitude', icon: <PrayIcon color={themeColors.success} size={14} /> },
  { id: 'growth', label: 'Growth', icon: <SproutIcon color={themeColors.warning} size={14} /> },
  { id: 'emotions', label: 'Emotions', icon: <ThoughtIcon color={themeColors.primary} size={14} /> },
  { id: 'relationships', label: 'Relationships', icon: <HeartIcon color="#E07A5F" size={14} /> },
];

const DEFAULT_PROMPTS: Prompt[] = [
  { id: '1', category: 'reflection', prompt: 'What moment today made you feel most alive?', isAIGenerated: false },
  { id: '2', category: 'reflection', prompt: 'What would you tell your past self from a year ago?', isAIGenerated: false },
  { id: '3', category: 'gratitude', prompt: 'What small thing brought you joy today?', isAIGenerated: false },
  { id: '4', category: 'gratitude', prompt: 'Who has positively impacted your life recently?', isAIGenerated: false },
  { id: '5', category: 'growth', prompt: 'What challenge helped you grow recently?', isAIGenerated: false },
  { id: '6', category: 'growth', prompt: 'What skill would you like to develop? Why?', isAIGenerated: false },
  { id: '7', category: 'emotions', prompt: 'What emotion have you been avoiding lately?', isAIGenerated: false },
  { id: '8', category: 'emotions', prompt: 'When do you feel most at peace?', isAIGenerated: false },
  { id: '9', category: 'relationships', prompt: 'What quality do you value most in your relationships?', isAIGenerated: false },
  { id: '10', category: 'relationships', prompt: 'How can you be a better friend to yourself?', isAIGenerated: false },
];

export default function JournalPrompts({ onSelectPrompt, onViewChange }: JournalPromptsProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(DEFAULT_PROMPTS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [usedPrompts, setUsedPrompts] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load used prompts from localStorage
    const saved = localStorage.getItem('used-prompts');
    if (saved) {
      setUsedPrompts(new Set(JSON.parse(saved)));
    }
  }, []);

  const handleSelectPrompt = (prompt: Prompt) => {
    // Mark as used
    const newUsed = new Set(usedPrompts);
    newUsed.add(prompt.id);
    setUsedPrompts(newUsed);
    localStorage.setItem('used-prompts', JSON.stringify([...newUsed]));

    onSelectPrompt?.(prompt.prompt);
    onViewChange?.('write');
  };

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/journal-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory === 'all' ? null : selectedCategory,
        }),
      });

      const data = await res.json();
      if (data.prompt) {
        const newPrompt: Prompt = {
          id: `ai-${Date.now()}`,
          category: data.category || 'reflection',
          prompt: data.prompt,
          isAIGenerated: true,
        };
        setPrompts([newPrompt, ...prompts]);
      }
    } catch (err) {
      console.error('Generate error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredPrompts = selectedCategory === 'all'
    ? prompts
    : prompts.filter((p) => p.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      reflection: themeColors.primaryDark,
      gratitude: themeColors.success,
      growth: themeColors.warning,
      emotions: themeColors.primary,
      relationships: '#E07A5F',
    };
    return colors[category] || themeColors.textMuted;
  };

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
        padding: '20px 24px',
        borderBottom: `1px solid ${themeColors.border}`,
        background: `linear-gradient(135deg, ${themeColors.primary}15 0%, ${themeColors.secondary}20 100%)`,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: `${themeColors.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <PenIcon color={themeColors.primaryDark} size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: themeColors.text, margin: 0 }}>
                Journal Prompts
              </h2>
              <p style={{ fontSize: '13px', color: themeColors.textMuted, margin: '4px 0 0' }}>
                Find inspiration for your next entry
              </p>
            </div>
          </div>
          <button
            onClick={handleGeneratePrompt}
            disabled={isGenerating}
            style={{
              padding: '10px 20px',
              background: isGenerating
                ? themeColors.beige
                : `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`,
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isGenerating ? 'none' : '0 4px 12px rgba(217, 162, 153, 0.35)',
            }}
          >
            {isGenerating ? (
              <>
                <span style={{
                  width: '14px',
                  height: '14px',
                  border: `2px solid ${themeColors.textMuted}`,
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                <span style={{ color: themeColors.textMuted }}>Generating...</span>
              </>
            ) : (
              <><SparklesIcon color="white" size={14} /> Generate New</>
            )}
          </button>
        </div>

        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 16px',
                background: selectedCategory === cat.id ? `${themeColors.primary}20` : 'white',
                border: selectedCategory === cat.id ? `1px solid ${themeColors.primaryDark}` : `1px solid ${themeColors.border}`,
                borderRadius: '999px',
                fontSize: '13px',
                color: selectedCategory === cat.id ? themeColors.primaryDark : themeColors.text,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: selectedCategory === cat.id ? '600' : '400',
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompts Grid */}
      <div style={{
        padding: '24px',
        maxHeight: 'calc(100vh - 400px)',
        overflowY: 'auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              style={{
                padding: '20px',
                background: usedPrompts.has(prompt.id) ? themeColors.cream : 'white',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: usedPrompts.has(prompt.id) ? 0.7 : 1,
              }}
              onClick={() => handleSelectPrompt(prompt)}
            >
              {/* Category Badge */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <span style={{
                  padding: '4px 10px',
                  background: `${getCategoryColor(prompt.category)}20`,
                  color: getCategoryColor(prompt.category),
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}>
                  {prompt.category}
                </span>
                {prompt.isAIGenerated && (
                  <span style={{
                    fontSize: '11px',
                    color: themeColors.textMuted,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <SparklesIcon color={themeColors.textMuted} size={12} /> AI Generated
                  </span>
                )}
                {usedPrompts.has(prompt.id) && (
                  <span style={{
                    fontSize: '11px',
                    color: themeColors.success,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <CheckIcon color={themeColors.success} size={12} /> Used
                  </span>
                )}
              </div>

              {/* Prompt Text */}
              <p style={{
                fontSize: '15px',
                color: themeColors.text,
                lineHeight: '1.5',
                margin: 0,
              }}>
                {prompt.prompt}
              </p>

              {/* Use Button */}
              <div style={{
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'flex-end',
              }}>
                <span style={{
                  fontSize: '13px',
                  color: themeColors.primaryDark,
                  fontWeight: '500',
                }}>
                  Use this prompt →
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            color: themeColors.textMuted,
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: `${themeColors.primary}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <PenIcon color={themeColors.primaryDark} size={28} />
            </div>
            <p style={{ margin: '0 0 16px', color: themeColors.text }}>No prompts in this category yet.</p>
            <button
              onClick={handleGeneratePrompt}
              style={{
                padding: '10px 20px',
                background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`,
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500',
                boxShadow: '0 4px 12px rgba(217, 162, 153, 0.35)',
              }}
            >
              Generate One
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
