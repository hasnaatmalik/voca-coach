'use client';

import { useState } from 'react';
import { MOOD_EMOJIS, CBTThoughtRecord } from '../types';

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

// SVG Icon Component
const BrainIcon = ({ color = themeColors.primaryDark, size = 64 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M12 18v4" />
  </svg>
);

const CheckCircleIcon = ({ color = themeColors.success, size = 64 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const LightbulbIcon = ({ color = themeColors.warning, size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

interface CBTExerciseProps {
  onSave?: () => void;
  onStreakUpdate?: () => void;
}

const STEPS = [
  { key: 'situation', title: 'Situation', prompt: 'What happened? Describe the triggering event.' },
  { key: 'automaticThought', title: 'Automatic Thought', prompt: 'What went through your mind? What were you thinking?' },
  { key: 'emotion', title: 'Emotion', prompt: 'What emotion did you feel? How intense was it?' },
  { key: 'evidenceFor', title: 'Evidence For', prompt: 'What facts support this thought?' },
  { key: 'evidenceAgainst', title: 'Evidence Against', prompt: 'What facts contradict this thought?' },
  { key: 'balancedThought', title: 'Balanced Thought', prompt: 'What\'s a more balanced way to see this?' },
  { key: 'outcome', title: 'Outcome', prompt: 'How do you feel now? Rate your new emotion.' },
];

export default function CBTExercise({ onSave, onStreakUpdate }: CBTExerciseProps) {
  const [step, setStep] = useState(0);
  const [record, setRecord] = useState<CBTThoughtRecord>({
    situation: '',
    automaticThought: '',
    emotion: '',
    emotionIntensity: 5,
    evidenceFor: '',
    evidenceAgainst: '',
    balancedThought: '',
    newEmotionIntensity: 5,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleNext = async () => {
    if (step === 4 && !aiSuggestion) {
      // After evidence against, get AI suggestion for balanced thought
      setIsAnalyzing(true);
      try {
        const res = await fetch('/api/journal-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Situation: ${record.situation}\nThought: ${record.automaticThought}\nEmotion: ${record.emotion}\nEvidence For: ${record.evidenceFor}\nEvidence Against: ${record.evidenceAgainst}`,
            mode: 'cbt',
          }),
        });
        const data = await res.json();
        if (data.reframingSuggestion) {
          setAiSuggestion(data.reframingSuggestion);
        }
      } catch (err) {
        console.error('AI analysis error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }
    setStep(step + 1);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Build content summary
      const content = `
Situation: ${record.situation}

Automatic Thought: ${record.automaticThought}

Emotion: ${record.emotion} (Intensity: ${record.emotionIntensity}/10)

Evidence For: ${record.evidenceFor}

Evidence Against: ${record.evidenceAgainst}

Balanced Thought: ${record.balancedThought}

New Emotion Intensity: ${record.newEmotionIntensity}/10
      `.trim();

      await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'CBT Thought Record',
          content,
          mood: record.emotionIntensity,
          moodAfter: record.newEmotionIntensity,
        }),
      });

      // Create session
      await fetch('/api/journal-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: 'cbt_exercise',
          title: 'Thought Record Exercise',
          moodStart: record.emotionIntensity,
          moodEnd: record.newEmotionIntensity,
          messages: [record],
          isComplete: true,
        }),
      });

      setShowSuccess(true);
      onStreakUpdate?.();
      onSave?.();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (showSuccess) {
    const improvement = record.newEmotionIntensity - record.emotionIntensity;
    return (
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 4px 16px rgba(217, 162, 153, 0.12)',
        border: `1px solid ${themeColors.border}`,
        padding: '48px',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <CheckCircleIcon />
        </div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: themeColors.success,
          margin: '0 0 16px',
        }}>
          Great Work!
        </h2>
        {improvement > 0 && (
          <p style={{
            fontSize: '16px',
            color: themeColors.success,
            margin: '0 0 8px',
          }}>
            Your mood improved by {improvement} points!
          </p>
        )}
        <p style={{
          fontSize: '14px',
          color: themeColors.textMuted,
        }}>
          You&apos;ve successfully completed a thought record
        </p>
        <button
          onClick={() => {
            setShowSuccess(false);
            setStep(0);
            setRecord({
              situation: '',
              automaticThought: '',
              emotion: '',
              emotionIntensity: 5,
              evidenceFor: '',
              evidenceAgainst: '',
              balancedThought: '',
              newEmotionIntensity: 5,
            });
            setAiSuggestion(null);
          }}
          style={{
            marginTop: '24px',
            padding: '12px 24px',
            background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`,
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(217, 162, 153, 0.35)',
            transition: 'all 0.2s',
          }}
        >
          Start New Exercise
        </button>
      </div>
    );
  }

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

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
        background: `linear-gradient(135deg, ${themeColors.primary}15 0%, ${themeColors.secondary}20 100%)`,
        borderBottom: `1px solid ${themeColors.border}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `${themeColors.primary}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <BrainIcon size={24} />
          </div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: themeColors.text,
            margin: 0,
          }}>
            CBT Thought Record
          </h2>
        </div>

        {/* Progress Bar */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginTop: '12px',
        }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: i <= step ? themeColors.primaryDark : themeColors.border,
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
        <div style={{
          fontSize: '12px',
          color: themeColors.primaryDark,
          marginTop: '8px',
        }}>
          Step {step + 1} of {STEPS.length}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: themeColors.text,
          margin: '0 0 8px',
        }}>
          {currentStep.title}
        </h3>
        <p style={{
          fontSize: '14px',
          color: themeColors.textMuted,
          margin: '0 0 16px',
        }}>
          {currentStep.prompt}
        </p>

        {/* Different inputs based on step */}
        {step === 2 ? (
          // Emotion step with intensity slider
          <div>
            <input
              value={record.emotion}
              onChange={(e) => setRecord({ ...record, emotion: e.target.value })}
              placeholder="e.g., Anxious, Sad, Frustrated"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                marginBottom: '16px',
                color: themeColors.text,
              }}
            />
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: themeColors.text,
              marginBottom: '12px',
            }}>
              Intensity: {record.emotionIntensity}/10
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setRecord({ ...record, emotionIntensity: n })}
                  style={{
                    width: '44px',
                    height: '44px',
                    border: record.emotionIntensity === n ? `2px solid ${themeColors.primaryDark}` : `1px solid ${themeColors.border}`,
                    borderRadius: '12px',
                    background: record.emotionIntensity === n ? `${themeColors.primary}15` : 'white',
                    cursor: 'pointer',
                    fontSize: '18px',
                    transition: 'all 0.2s',
                  }}
                >
                  {MOOD_EMOJIS[n]}
                </button>
              ))}
            </div>
          </div>
        ) : step === 5 ? (
          // Balanced thought with AI suggestion
          <div>
            {aiSuggestion && (
              <div style={{
                padding: '14px 16px',
                background: `${themeColors.warning}15`,
                borderRadius: '12px',
                marginBottom: '16px',
                border: `1px solid ${themeColors.warning}40`,
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: themeColors.warning,
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <LightbulbIcon />
                  AI Suggestion
                </div>
                <p style={{
                  fontSize: '14px',
                  color: themeColors.text,
                  margin: 0,
                  lineHeight: '1.5',
                }}>
                  {aiSuggestion}
                </p>
                <button
                  onClick={() => setRecord({ ...record, balancedThought: aiSuggestion })}
                  style={{
                    marginTop: '10px',
                    padding: '6px 12px',
                    background: themeColors.primaryDark,
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Use This
                </button>
              </div>
            )}
            <textarea
              value={record.balancedThought}
              onChange={(e) => setRecord({ ...record, balancedThought: e.target.value })}
              placeholder="Write a more balanced perspective..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '14px 16px',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                resize: 'vertical',
                color: themeColors.text,
              }}
            />
          </div>
        ) : step === 6 ? (
          // Outcome with new emotion rating
          <div>
            <p style={{
              fontSize: '14px',
              color: themeColors.text,
              marginBottom: '16px',
            }}>
              After reframing your thought, how intense is your emotion now?
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '16px',
              fontSize: '14px',
              color: themeColors.textMuted,
            }}>
              <span>Before: {MOOD_EMOJIS[record.emotionIntensity]} ({record.emotionIntensity})</span>
              <span style={{ color: themeColors.border }}>→</span>
              <span>Now: {MOOD_EMOJIS[record.newEmotionIntensity]} ({record.newEmotionIntensity})</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setRecord({ ...record, newEmotionIntensity: n })}
                  style={{
                    width: '44px',
                    height: '44px',
                    border: record.newEmotionIntensity === n ? `2px solid ${themeColors.success}` : `1px solid ${themeColors.border}`,
                    borderRadius: '12px',
                    background: record.newEmotionIntensity === n ? `${themeColors.success}15` : 'white',
                    cursor: 'pointer',
                    fontSize: '18px',
                    transition: 'all 0.2s',
                  }}
                >
                  {MOOD_EMOJIS[n]}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Text input for other steps
          <textarea
            value={record[currentStep.key as keyof CBTThoughtRecord] as string}
            onChange={(e) => setRecord({ ...record, [currentStep.key]: e.target.value })}
            placeholder="Type here..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '14px 16px',
              border: `1px solid ${themeColors.border}`,
              borderRadius: '12px',
              fontSize: '15px',
              outline: 'none',
              resize: 'vertical',
              color: themeColors.text,
            }}
          />
        )}

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '24px',
        }}>
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            style={{
              padding: '12px 24px',
              background: step === 0 ? themeColors.border : themeColors.beige,
              border: step === 0 ? 'none' : `1px solid ${themeColors.border}`,
              borderRadius: '12px',
              fontSize: '14px',
              color: step === 0 ? themeColors.textMuted : themeColors.text,
              cursor: step === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Back
          </button>

          {isLastStep ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: '12px 32px',
                background: isSaving
                  ? themeColors.border
                  : `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`,
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                boxShadow: isSaving ? 'none' : '0 4px 12px rgba(217, 162, 153, 0.35)',
                transition: 'all 0.2s',
              }}
            >
              {isSaving ? 'Saving...' : 'Complete Exercise'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={isAnalyzing}
              style={{
                padding: '12px 32px',
                background: isAnalyzing
                  ? themeColors.border
                  : `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`,
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                boxShadow: isAnalyzing ? 'none' : '0 4px 12px rgba(217, 162, 153, 0.35)',
                transition: 'all 0.2s',
              }}
            >
              {isAnalyzing ? 'Analyzing...' : 'Next'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
