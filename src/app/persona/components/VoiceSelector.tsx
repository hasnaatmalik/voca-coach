'use client';

import { useState, useEffect, useRef } from 'react';

interface VoiceLabel {
  accent?: string;
  description?: string;
  age?: string;
  gender?: string;
  use_case?: string;
}

interface Voice {
  voice_id: string;
  name: string;
  preview_url: string;
  labels: VoiceLabel;
  category?: string;
}

interface VoiceSelectorProps {
  selectedVoiceId?: string;
  onSelect: (voiceId: string) => void;
}

export default function VoiceSelector({ selectedVoiceId, onSelect }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/voices');
      if (res.ok) {
        const data = await res.json();
        setVoices(data.voices || []);
      } else {
        setError('Failed to load voices');
      }
    } catch {
      setError('Failed to load voices');
    } finally {
      setLoading(false);
    }
  };

  const playPreview = (voice: Voice) => {
    if (playingVoiceId === voice.voice_id) {
      // Stop playing
      audioRef.current?.pause();
      setPlayingVoiceId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.src = voice.preview_url;
      audioRef.current.play();
      setPlayingVoiceId(voice.voice_id);
    }
  };

  const filteredVoices = voices.filter((voice) => {
    const query = searchQuery.toLowerCase();
    return (
      voice.name.toLowerCase().includes(query) ||
      voice.labels.accent?.toLowerCase().includes(query) ||
      voice.labels.gender?.toLowerCase().includes(query)
    );
  });

  const getVoiceLabels = (voice: Voice) => {
    const labels = [];
    if (voice.labels.gender) labels.push(voice.labels.gender);
    if (voice.labels.accent) labels.push(voice.labels.accent);
    if (voice.labels.age) labels.push(voice.labels.age);
    return labels.join(' | ');
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{
          width: '24px',
          height: '24px',
          border: '3px solid #E5E7EB',
          borderTop: '3px solid #7C3AED',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ color: '#6B7280', marginTop: '8px', fontSize: '14px' }}>Loading voices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#EF4444' }}>
        {error}
        <button
          onClick={fetchVoices}
          style={{
            display: 'block',
            margin: '12px auto 0',
            padding: '8px 16px',
            background: '#F3F4F6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#4B5563'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <audio
        ref={audioRef}
        onEnded={() => setPlayingVoiceId(null)}
        style={{ display: 'none' }}
      />

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search voices..."
        style={{
          width: '100%',
          padding: '12px 16px',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          fontSize: '14px',
          marginBottom: '12px',
          outline: 'none'
        }}
      />

      <div style={{
        maxHeight: '250px',
        overflowY: 'auto',
        border: '1px solid #E5E7EB',
        borderRadius: '12px'
      }}>
        {filteredVoices.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>
            No voices found
          </div>
        ) : (
          filteredVoices.map((voice) => (
            <div
              key={voice.voice_id}
              onClick={() => onSelect(voice.voice_id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid #E5E7EB',
                cursor: 'pointer',
                background: selectedVoiceId === voice.voice_id ? '#ECFDF5' : 'white',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: '500',
                  color: '#1F2937',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {voice.name}
                  {selectedVoiceId === voice.voice_id && (
                    <span style={{
                      background: '#7C3AED',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      Selected
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                  {getVoiceLabels(voice)}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playPreview(voice);
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  background: playingVoiceId === voice.voice_id ? '#7C3AED' : '#F3F4F6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  color: playingVoiceId === voice.voice_id ? 'white' : '#4B5563'
                }}
              >
                {playingVoiceId === voice.voice_id ? '⏹' : '▶'}
              </button>
            </div>
          ))
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
