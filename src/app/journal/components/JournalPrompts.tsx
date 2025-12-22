'use client';

import { useState, useEffect } from 'react';

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

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'reflection', label: 'Reflection', icon: '🪞' },
  { id: 'gratitude', label: 'Gratitude', icon: '🙏' },
  { id: 'growth', label: 'Growth', icon: '🌱' },
  { id: 'emotions', label: 'Emotions', icon: '💭' },
  { id: 'relationships', label: 'Relationships', icon: '❤️' },
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
      reflection: '#7C3AED',
      gratitude: '#10B981',
      growth: '#F59E0B',
      emotions: '#EC4899',
      relationships: '#EF4444',
    };
    return colors[category] || '#6B7280';
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
              Journal Prompts
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0' }}>
              Find inspiration for your next entry
            </p>
          </div>
          <button
            onClick={handleGeneratePrompt}
            disabled={isGenerating}
            style={{
              padding: '10px 20px',
              background: isGenerating
                ? '#E5E7EB'
                : 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isGenerating ? (
              <>
                <span style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                Generating...
              </>
            ) : (
              <>✨ Generate New</>
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
                background: selectedCategory === cat.id ? '#F5F3FF' : 'transparent',
                border: selectedCategory === cat.id ? '1px solid #7C3AED' : '1px solid #E5E7EB',
                borderRadius: '999px',
                fontSize: '13px',
                color: selectedCategory === cat.id ? '#7C3AED' : '#4B5563',
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
                background: usedPrompts.has(prompt.id) ? '#F9FAFB' : 'white',
                border: '1px solid #E5E7EB',
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
                  background: `${getCategoryColor(prompt.category)}15`,
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
                    color: '#9CA3AF',
                  }}>
                    ✨ AI Generated
                  </span>
                )}
                {usedPrompts.has(prompt.id) && (
                  <span style={{
                    fontSize: '11px',
                    color: '#10B981',
                  }}>
                    ✓ Used
                  </span>
                )}
              </div>

              {/* Prompt Text */}
              <p style={{
                fontSize: '15px',
                color: '#1F2937',
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
                  color: '#7C3AED',
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
            color: '#6B7280',
          }}>
            <p>No prompts in this category yet.</p>
            <button
              onClick={handleGeneratePrompt}
              style={{
                marginTop: '12px',
                padding: '10px 20px',
                background: '#7C3AED',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
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
