'use client';

import { useState } from 'react';
import { MOOD_EMOJIS, CBTThoughtRecord } from '../types';

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
        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
        padding: '48px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🧠</div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#7C3AED',
          margin: '0 0 16px',
        }}>
          Great Work!
        </h2>
        {improvement > 0 && (
          <p style={{
            fontSize: '16px',
            color: '#10B981',
            margin: '0 0 8px',
          }}>
            Your mood improved by {improvement} points!
          </p>
        )}
        <p style={{
          fontSize: '14px',
          color: '#6B7280',
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
            background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
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
      boxShadow: '0 4px 16px rgba(124, 58, 237, 0.08)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
        borderBottom: '1px solid #DDD6FE',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '28px' }}>🧠</span>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#5B21B6',
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
                background: i <= step ? '#7C3AED' : '#E5E7EB',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#7C3AED',
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
          color: '#1F2937',
          margin: '0 0 8px',
        }}>
          {currentStep.title}
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#6B7280',
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
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                marginBottom: '16px',
              }}
            />
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: '#4B5563',
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
                    border: record.emotionIntensity === n ? '2px solid #7C3AED' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    background: record.emotionIntensity === n ? '#F5F3FF' : 'white',
                    cursor: 'pointer',
                    fontSize: '18px',
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
                background: '#F0FDF4',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid #BBF7D0',
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#059669',
                  marginBottom: '6px',
                }}>
                  AI Suggestion
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#166534',
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
                    background: '#10B981',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: 'white',
                    cursor: 'pointer',
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
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>
        ) : step === 6 ? (
          // Outcome with new emotion rating
          <div>
            <p style={{
              fontSize: '14px',
              color: '#4B5563',
              marginBottom: '16px',
            }}>
              After reframing your thought, how intense is your emotion now?
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '16px',
            }}>
              <span>Before: {MOOD_EMOJIS[record.emotionIntensity]} ({record.emotionIntensity})</span>
              <span style={{ color: '#9CA3AF' }}>→</span>
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
                    border: record.newEmotionIntensity === n ? '2px solid #10B981' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    background: record.newEmotionIntensity === n ? '#ECFDF5' : 'white',
                    cursor: 'pointer',
                    fontSize: '18px',
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
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              fontSize: '15px',
              outline: 'none',
              resize: 'vertical',
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
              background: step === 0 ? '#E5E7EB' : '#F3F4F6',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              color: step === 0 ? '#9CA3AF' : '#4B5563',
              cursor: step === 0 ? 'not-allowed' : 'pointer',
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
                background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                cursor: isSaving ? 'not-allowed' : 'pointer',
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
                background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
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
