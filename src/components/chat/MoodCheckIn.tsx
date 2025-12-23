'use client';

import { useState, CSSProperties } from 'react';

interface MoodCheckInProps {
  onSubmit: (mood: number, emotions: string[], note?: string) => void;
  onClose: () => void;
  darkMode?: boolean;
}

const EMOTIONS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '😔', label: 'Down' },
  { emoji: '🥹', label: 'Overwhelmed' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🙂', label: 'Okay' },
  { emoji: '🤔', label: 'Confused' },
  { emoji: '😍', label: 'Grateful' },
  { emoji: '💪', label: 'Strong' }
];

const MOOD_LABELS = [
  'Very Low',
  'Low',
  'Somewhat Low',
  'Below Average',
  'Okay',
  'Above Average',
  'Good',
  'Very Good',
  'Great',
  'Excellent'
];

export default function MoodCheckIn({
  onSubmit,
  onClose,
  darkMode = false
}: MoodCheckInProps) {
  const [mood, setMood] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'mood' | 'emotions' | 'note'>('mood');

  const toggleEmotion = (label: string) => {
    setSelectedEmotions(prev =>
      prev.includes(label)
        ? prev.filter(e => e !== label)
        : prev.length < 3
          ? [...prev, label]
          : prev
    );
  };

  const handleSubmit = () => {
    onSubmit(mood, selectedEmotions, note.trim() || undefined);
  };

  const getMoodColor = () => {
    if (mood >= 8) return '#10B981';
    if (mood >= 6) return '#84CC16';
    if (mood >= 4) return '#F59E0B';
    if (mood >= 2) return '#F97316';
    return '#EF4444';
  };

  const containerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const modalStyle: CSSProperties = {
    background: darkMode ? '#1F2937' : 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  };

  const headerStyle: CSSProperties = {
    background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
    padding: '20px',
    color: 'white',
    textAlign: 'center'
  };

  const titleStyle: CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0
  };

  const subtitleStyle: CSSProperties = {
    fontSize: '13px',
    opacity: 0.9,
    marginTop: '4px'
  };

  const contentStyle: CSSProperties = {
    padding: '24px'
  };

  const moodSliderContainerStyle: CSSProperties = {
    textAlign: 'center'
  };

  const moodValueStyle: CSSProperties = {
    fontSize: '48px',
    fontWeight: '700',
    color: getMoodColor(),
    marginBottom: '8px'
  };

  const moodLabelStyle: CSSProperties = {
    fontSize: '16px',
    fontWeight: '500',
    color: darkMode ? '#D1D5DB' : '#4B5563',
    marginBottom: '20px'
  };

  const sliderStyle: CSSProperties = {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    background: darkMode ? '#374151' : '#E5E7EB',
    WebkitAppearance: 'none',
    appearance: 'none',
    cursor: 'pointer'
  };

  const sliderLabelsStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
    fontSize: '11px',
    color: darkMode ? '#9CA3AF' : '#9CA3AF'
  };

  const emotionsGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px'
  };

  const emotionButtonStyle = (selected: boolean): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 8px',
    borderRadius: '12px',
    border: selected ? '2px solid #7C3AED' : `2px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
    background: selected ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  const emotionEmojiStyle: CSSProperties = {
    fontSize: '24px'
  };

  const emotionLabelStyle: CSSProperties = {
    fontSize: '10px',
    color: darkMode ? '#D1D5DB' : '#6B7280'
  };

  const noteInputStyle: CSSProperties = {
    width: '100%',
    minHeight: '100px',
    padding: '12px',
    border: `1px solid ${darkMode ? '#4B5563' : '#D1D5DB'}`,
    borderRadius: '8px',
    background: darkMode ? '#374151' : '#F9FAFB',
    color: darkMode ? '#F3F4F6' : '#1F2937',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none'
  };

  const footerStyle: CSSProperties = {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    borderTop: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`
  };

  const buttonStyle = (primary: boolean): CSSProperties => ({
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: primary ? 'none' : `1px solid ${darkMode ? '#4B5563' : '#D1D5DB'}`,
    background: primary ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' : 'transparent',
    color: primary ? 'white' : (darkMode ? '#D1D5DB' : '#6B7280'),
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  });

  const stepIndicatorStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '20px'
  };

  const stepDotStyle = (active: boolean, completed: boolean): CSSProperties => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: completed ? '#7C3AED' : (active ? '#EC4899' : (darkMode ? '#4B5563' : '#D1D5DB'))
  });

  return (
    <div style={containerStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>How are you feeling?</h3>
          <p style={subtitleStyle}>
            {step === 'mood' && 'Rate your current mood'}
            {step === 'emotions' && 'Select up to 3 emotions'}
            {step === 'note' && 'Add a note (optional)'}
          </p>
        </div>

        <div style={contentStyle}>
          <div style={stepIndicatorStyle}>
            <div style={stepDotStyle(step === 'mood', false)} />
            <div style={stepDotStyle(step === 'emotions', step === 'note')} />
            <div style={stepDotStyle(step === 'note', false)} />
          </div>

          {step === 'mood' && (
            <div style={moodSliderContainerStyle}>
              <div style={moodValueStyle}>{mood}</div>
              <div style={moodLabelStyle}>{MOOD_LABELS[mood - 1]}</div>
              <input
                type="range"
                min="1"
                max="10"
                value={mood}
                onChange={(e) => setMood(parseInt(e.target.value))}
                style={sliderStyle}
              />
              <div style={sliderLabelsStyle}>
                <span>Very Low</span>
                <span>Excellent</span>
              </div>
            </div>
          )}

          {step === 'emotions' && (
            <>
              <p style={{
                fontSize: '13px',
                color: darkMode ? '#9CA3AF' : '#6B7280',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                Selected: {selectedEmotions.length}/3
              </p>
              <div style={emotionsGridStyle}>
                {EMOTIONS.map((emotion) => (
                  <button
                    key={emotion.label}
                    style={emotionButtonStyle(selectedEmotions.includes(emotion.label))}
                    onClick={() => toggleEmotion(emotion.label)}
                  >
                    <span style={emotionEmojiStyle}>{emotion.emoji}</span>
                    <span style={emotionLabelStyle}>{emotion.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'note' && (
            <>
              <p style={{
                fontSize: '13px',
                color: darkMode ? '#9CA3AF' : '#6B7280',
                marginBottom: '12px'
              }}>
                Want to share more about how you're feeling?
              </p>
              <textarea
                style={noteInputStyle}
                placeholder="What's on your mind? (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
              />
              <p style={{
                fontSize: '11px',
                color: darkMode ? '#6B7280' : '#9CA3AF',
                textAlign: 'right',
                marginTop: '4px'
              }}>
                {note.length}/500
              </p>
            </>
          )}
        </div>

        <div style={footerStyle}>
          <button
            style={buttonStyle(false)}
            onClick={() => {
              if (step === 'mood') onClose();
              else if (step === 'emotions') setStep('mood');
              else setStep('emotions');
            }}
          >
            {step === 'mood' ? 'Cancel' : 'Back'}
          </button>
          <button
            style={buttonStyle(true)}
            onClick={() => {
              if (step === 'mood') setStep('emotions');
              else if (step === 'emotions') setStep('note');
              else handleSubmit();
            }}
          >
            {step === 'note' ? 'Send Check-in' : 'Next'}
          </button>
        </div>
      </div>

      <style jsx global>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.4);
        }
      `}</style>
    </div>
  );
}
