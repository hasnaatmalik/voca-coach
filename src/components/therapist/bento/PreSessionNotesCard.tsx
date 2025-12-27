'use client';

import { motion } from 'framer-motion';

interface PreSessionNote {
  sessionId: string;
  clientName: string;
  scheduledAt: string;
  moodRating: number;
  concerns: string;
  goals: string;
}

interface PreSessionNotesCardProps {
  notes: PreSessionNote[];
}

export default function PreSessionNotesCard({ notes }: PreSessionNotesCardProps) {
  if (notes.length === 0) return null;

  const getMoodColor = (rating: number) => {
    if (rating >= 7) return { bg: '#ECFDF5', text: '#059669' };
    if (rating >= 4) return { bg: '#FFFBEB', text: '#D97706' };
    return { bg: '#FEF2F2', text: '#DC2626' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white',
        borderRadius: '24px',
        padding: '28px',
        marginBottom: '24px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
        border: '1px solid #F0E4D3',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <span style={{ fontSize: '24px' }}>📝</span>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#2D2D2D' }}>
          Client Pre-Session Notes
        </h2>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {notes.map((note, index) => {
          const moodStyle = getMoodColor(note.moodRating);
          return (
            <motion.div
              key={note.sessionId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                background: '#FAF7F3',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #F0E4D3',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div>
                  <p style={{
                    fontWeight: '600',
                    color: '#2D2D2D',
                    marginBottom: '4px',
                  }}>
                    {note.clientName}
                  </p>
                  <p style={{ fontSize: '13px', color: '#6B6B6B' }}>
                    Session: {new Date(note.scheduledAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div style={{
                  padding: '6px 14px',
                  background: moodStyle.bg,
                  color: moodStyle.text,
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                }}>
                  Mood: {note.moodRating}/10
                </div>
              </div>

              {note.concerns && (
                <div style={{ marginBottom: '10px' }}>
                  <p style={{
                    fontSize: '12px',
                    color: '#6B6B6B',
                    marginBottom: '4px',
                    fontWeight: '500',
                  }}>
                    Concerns:
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#4B5563',
                    fontStyle: 'italic',
                    background: 'white',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                  }}>
                    &quot;{note.concerns}&quot;
                  </p>
                </div>
              )}

              {note.goals && (
                <div>
                  <p style={{
                    fontSize: '12px',
                    color: '#6B6B6B',
                    marginBottom: '4px',
                    fontWeight: '500',
                  }}>
                    Goals for session:
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#4B5563',
                    background: 'white',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                  }}>
                    {note.goals}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
