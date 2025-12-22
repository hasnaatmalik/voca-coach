'use client';

import { useState, useEffect } from 'react';

interface EmojiPickerProps {
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = {
  'People': ['😀', '😊', '🥰', '😎', '🤔', '😏', '🧐', '🤓', '😴', '🤗', '👨', '👩', '👴', '👵', '🧑‍💼', '👨‍💻', '👩‍🏫', '🧑‍⚕️', '👨‍🍳', '👩‍🎨'],
  'Emotions': ['❤️', '💚', '💙', '💜', '🖤', '💛', '🧡', '💕', '💖', '💗', '😡', '😢', '😰', '😱', '🤩', '😇', '🥳', '😤', '😌', '🤭'],
  'Nature': ['🌸', '🌺', '🌻', '🌹', '🌷', '🌱', '🌿', '🍀', '🌳', '🌴', '🌊', '⛅', '🌈', '⭐', '🌙', '☀️', '❄️', '🔥', '💧', '🌍'],
  'Objects': ['💼', '📚', '💡', '🎯', '🏆', '🎭', '🎨', '🎬', '🎤', '🎧', '💻', '📱', '⌚', '📷', '🔑', '🔒', '💎', '🛠️', '⚙️', '🧪'],
  'Symbols': ['✨', '💫', '⚡', '🔮', '🧿', '☯️', '♾️', '⚜️', '🔱', '⭕', '✅', '❌', '❓', '❗', '💯', '🎵', '🎶', '💤', '💬', '💭'],
  'Activities': ['🧘', '🏃', '🚴', '🏊', '⚽', '🏀', '🎾', '🎳', '🎮', '🎲', '🏋️', '🤸', '🧗', '🏇', '⛷️', '🏄', '🚣', '🧘‍♀️', '🧘‍♂️', '🤺'],
};

export default function EmojiPicker({ selectedEmoji, onSelect }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('People');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load recent emojis from localStorage
    const saved = localStorage.getItem('recentPersonaEmojis');
    if (saved) {
      setRecentEmojis(JSON.parse(saved));
    }
  }, []);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);

    // Update recent emojis
    const updated = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 10);
    setRecentEmojis(updated);
    localStorage.setItem('recentPersonaEmojis', JSON.stringify(updated));
  };

  const allEmojis = Object.values(EMOJI_CATEGORIES).flat();
  const filteredEmojis = searchQuery
    ? allEmojis.filter(emoji => emoji.includes(searchQuery))
    : EMOJI_CATEGORIES[activeCategory];

  return (
    <div>
      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search emojis..."
        style={{
          width: '100%',
          padding: '10px 14px',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '12px',
          outline: 'none'
        }}
      />

      {/* Selected Preview */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
        padding: '12px',
        background: '#F3F4F6',
        borderRadius: '10px'
      }}>
        <span style={{ fontSize: '32px' }}>{selectedEmoji}</span>
        <div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Selected Icon</div>
          <div style={{ fontWeight: '500', color: '#1F2937' }}>Click an emoji below to change</div>
        </div>
      </div>

      {/* Recent Emojis */}
      {recentEmojis.length > 0 && !searchQuery && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>Recent</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {recentEmojis.map((emoji, i) => (
              <button
                key={i}
                onClick={() => handleSelect(emoji)}
                style={{
                  width: '36px',
                  height: '36px',
                  fontSize: '20px',
                  background: selectedEmoji === emoji ? '#ECFDF5' : 'transparent',
                  border: selectedEmoji === emoji ? '2px solid #7C3AED' : '1px solid #E5E7EB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      {!searchQuery && (
        <div style={{
          display: 'flex',
          gap: '4px',
          overflowX: 'auto',
          marginBottom: '12px',
          paddingBottom: '4px'
        }}>
          {Object.keys(EMOJI_CATEGORIES).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as keyof typeof EMOJI_CATEGORIES)}
              style={{
                padding: '6px 12px',
                background: activeCategory === cat ? '#7C3AED' : '#F3F4F6',
                color: activeCategory === cat ? 'white' : '#4B5563',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '4px',
        maxHeight: '180px',
        overflowY: 'auto',
        padding: '4px'
      }}>
        {filteredEmojis.map((emoji, i) => (
          <button
            key={i}
            onClick={() => handleSelect(emoji)}
            style={{
              width: '36px',
              height: '36px',
              fontSize: '20px',
              background: selectedEmoji === emoji ? '#ECFDF5' : 'transparent',
              border: selectedEmoji === emoji ? '2px solid #7C3AED' : '1px solid transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
