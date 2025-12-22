'use client';

import { useState, useEffect } from 'react';
import { MOOD_EMOJIS } from '../types';

interface JournalEditorProps {
  onSave?: () => void;
  onStreakUpdate?: () => void;
}

const SUGGESTED_TAGS = [
  'anxiety', 'work', 'relationships', 'self-care', 'growth',
  'gratitude', 'stress', 'happiness', 'family', 'health',
];

export default function JournalEditor({ onSave, onStreakUpdate }: JournalEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<number>(5);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [analysis, setAnalysis] = useState<{
    distortion?: string;
    reframingSuggestion?: string;
  } | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save draft
  useEffect(() => {
    const draft = localStorage.getItem('journal-draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setTitle(parsed.title || '');
        setContent(parsed.content || '');
        setMood(parsed.mood || 5);
        setTags(parsed.tags || []);
      } catch {
        // Invalid draft
      }
    }
  }, []);

  useEffect(() => {
    if (content || title) {
      const draft = { title, content, mood, tags };
      localStorage.setItem('journal-draft', JSON.stringify(draft));
    }
  }, [title, content, mood, tags]);

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags([...tags, normalizedTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAnalyze = async () => {
    if (!content.trim()) return;

    try {
      const res = await fetch('/api/journal-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, mode: 'chat' }),
      });
      const data = await res.json();
      setAnalysis({
        distortion: data.distortion,
        reframingSuggestion: data.reframingSuggestion,
      });
    } catch (err) {
      console.error('Analysis error:', err);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsSaving(true);

    try {
      // Get AI analysis if enabled
      let distortion = null;
      let aiSummary = null;

      if (showAnalysis && content.length > 50) {
        const res = await fetch('/api/journal-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content, mode: 'chat' }),
        });
        const data = await res.json();
        distortion = data.distortion;
        aiSummary = data.socraticPrompt;
      }

      // Save entry
      await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || null,
          content,
          mood,
          distortion,
          aiSummary,
          tags,
        }),
      });

      // Clear draft
      localStorage.removeItem('journal-draft');
      setLastSaved(new Date());

      // Reset form
      setTitle('');
      setContent('');
      setMood(5);
      setTags([]);
      setAnalysis(null);

      onStreakUpdate?.();
      onSave?.();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

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
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
          Write Entry
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0' }}>
          Express your thoughts freely
        </p>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '500',
            outline: 'none',
            marginBottom: '16px',
          }}
        />

        {/* Mood Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: '#4B5563',
            marginBottom: '8px',
          }}>
            How are you feeling? ({mood}/10)
          </label>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                style={{
                  width: '44px',
                  height: '44px',
                  border: mood === m ? '2px solid #7C3AED' : '1px solid #E5E7EB',
                  borderRadius: '12px',
                  background: mood === m ? '#F5F3FF' : 'white',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                {MOOD_EMOJIS[m]}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '20px' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Write freely..."
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '16px',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              fontSize: '15px',
              lineHeight: '1.7',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px',
            fontSize: '12px',
            color: '#9CA3AF',
          }}>
            <span>{wordCount} words, {charCount} characters</span>
            {lastSaved && (
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: '#4B5563',
            marginBottom: '8px',
          }}>
            Tags
          </label>

          {/* Selected Tags */}
          {tags.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '12px',
            }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: '#F5F3FF',
                    color: '#7C3AED',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: '500',
                  }}
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7C3AED',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '14px',
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Tag Input */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(tagInput);
                }
              }}
              placeholder="Add a tag..."
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleAddTag(tagInput)}
              disabled={!tagInput.trim()}
              style={{
                padding: '10px 16px',
                background: tagInput.trim() ? '#7C3AED' : '#E5E7EB',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: tagInput.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Add
            </button>
          </div>

          {/* Suggested Tags */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginTop: '12px',
          }}>
            {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 6).map((tag) => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                style={{
                  padding: '4px 10px',
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '12px',
                  color: '#6B7280',
                  cursor: 'pointer',
                }}
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* AI Analysis Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          padding: '12px 16px',
          background: '#F9FAFB',
          borderRadius: '12px',
        }}>
          <input
            type="checkbox"
            id="ai-analysis"
            checked={showAnalysis}
            onChange={(e) => setShowAnalysis(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <label htmlFor="ai-analysis" style={{
            fontSize: '14px',
            color: '#4B5563',
            cursor: 'pointer',
          }}>
            Include AI analysis (detect patterns & provide insights)
          </label>
        </div>

        {/* Analysis Preview */}
        {analysis && (
          <div style={{
            marginBottom: '20px',
            padding: '16px',
            background: '#FEF3C7',
            borderRadius: '12px',
          }}>
            {analysis.distortion && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#92400E',
                  textTransform: 'uppercase',
                }}>
                  Detected Pattern: {analysis.distortion}
                </span>
              </div>
            )}
            {analysis.reframingSuggestion && (
              <p style={{
                fontSize: '14px',
                color: '#78350F',
                margin: 0,
                lineHeight: '1.5',
              }}>
                {analysis.reframingSuggestion}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          {content.length > 50 && (
            <button
              onClick={handleAnalyze}
              style={{
                padding: '12px 24px',
                background: '#F3F4F6',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#4B5563',
                cursor: 'pointer',
              }}
            >
              Analyze
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!content.trim() || isSaving}
            style={{
              padding: '12px 32px',
              background: content.trim() && !isSaving
                ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
                : '#E5E7EB',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              cursor: content.trim() && !isSaving ? 'pointer' : 'not-allowed',
            }}
          >
            {isSaving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}
