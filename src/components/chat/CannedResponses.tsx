'use client';

import { useState, useEffect, CSSProperties } from 'react';

interface CannedResponse {
  id: string;
  category: string;
  title: string;
  content: string;
  shortcut?: string;
  usageCount: number;
}

interface CannedResponsesProps {
  onSelect: (content: string) => void;
  onClose: () => void;
  darkMode?: boolean;
}

const CATEGORIES = [
  { id: 'greeting', label: 'Greetings', icon: '👋' },
  { id: 'validation', label: 'Validation', icon: '❤️' },
  { id: 'exploration', label: 'Exploration', icon: '🔍' },
  { id: 'coping', label: 'Coping', icon: '🧘' },
  { id: 'closing', label: 'Closing', icon: '🌟' },
  { id: 'custom', label: 'Custom', icon: '✏️' }
];

const DEFAULT_RESPONSES: CannedResponse[] = [
  { id: '1', category: 'greeting', title: 'Session Start', content: "Hi! I'm glad you reached out. How are you feeling today?", usageCount: 0 },
  { id: '2', category: 'greeting', title: 'Check In', content: "Thank you for being here. What's been on your mind lately?", usageCount: 0 },
  { id: '3', category: 'validation', title: 'Acknowledge Feelings', content: "What you're feeling is completely valid. It takes courage to share these experiences.", usageCount: 0 },
  { id: '4', category: 'validation', title: 'Support', content: "That sounds really difficult. I want you to know that you're not alone in this.", usageCount: 0 },
  { id: '5', category: 'exploration', title: 'Tell More', content: "Can you tell me more about what that experience was like for you?", usageCount: 0 },
  { id: '6', category: 'exploration', title: 'Feelings', content: "How did that make you feel when it happened?", usageCount: 0 },
  { id: '7', category: 'coping', title: 'Breathing', content: "Let's try a quick breathing exercise together. Take a slow, deep breath in for 4 counts, hold for 4, and exhale for 6.", usageCount: 0 },
  { id: '8', category: 'coping', title: 'Grounding', content: "If you're feeling overwhelmed, try the 5-4-3-2-1 grounding technique: notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.", usageCount: 0 },
  { id: '9', category: 'closing', title: 'Session End', content: "I appreciate you sharing with me today. Remember, you can reach out anytime you need support.", usageCount: 0 },
  { id: '10', category: 'closing', title: 'Encouragement', content: "You're making great progress. Keep practicing the techniques we discussed, and I'll see you next time.", usageCount: 0 }
];

export default function CannedResponses({
  onSelect,
  onClose,
  darkMode = false
}: CannedResponsesProps) {
  const [responses, setResponses] = useState<CannedResponse[]>(DEFAULT_RESPONSES);
  const [activeCategory, setActiveCategory] = useState('greeting');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingResponse, setEditingResponse] = useState<CannedResponse | null>(null);

  // Load custom responses from API
  useEffect(() => {
    const loadResponses = async () => {
      try {
        const response = await fetch('/api/therapist/canned-responses');
        if (response.ok) {
          const data = await response.json();
          if (data.responses?.length > 0) {
            setResponses([...DEFAULT_RESPONSES, ...data.responses]);
          }
        }
      } catch (error) {
        console.error('Failed to load canned responses:', error);
      }
    };
    loadResponses();
  }, []);

  const handleSelect = async (response: CannedResponse) => {
    onSelect(response.content);

    // Update usage count
    try {
      await fetch('/api/therapist/canned-responses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: response.id, usageCount: response.usageCount + 1 })
      });
    } catch {}
  };

  const handleSaveResponse = async (response: Partial<CannedResponse>) => {
    try {
      const res = await fetch('/api/therapist/canned-responses', {
        method: editingResponse?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingResponse?.id ? { ...response, id: editingResponse.id } : response)
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingResponse?.id) {
          setResponses(prev => prev.map(r => r.id === saved.id ? saved : r));
        } else {
          setResponses(prev => [...prev, saved]);
        }
        setShowEditor(false);
        setEditingResponse(null);
      }
    } catch (error) {
      console.error('Failed to save response:', error);
    }
  };

  const filteredResponses = responses.filter(r => {
    const matchesCategory = activeCategory === 'all' || r.category === activeCategory;
    const matchesSearch = !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const containerStyle: CSSProperties = {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    marginBottom: '8px',
    background: darkMode ? '#1F2937' : 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    maxHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 100
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`
  };

  const titleStyle: CSSProperties = {
    fontWeight: '600',
    fontSize: '14px',
    color: darkMode ? '#F3F4F6' : '#1F2937'
  };

  const searchInputStyle: CSSProperties = {
    flex: 1,
    marginLeft: '12px',
    padding: '6px 12px',
    border: `1px solid ${darkMode ? '#4B5563' : '#D1D5DB'}`,
    borderRadius: '6px',
    background: darkMode ? '#374151' : '#F9FAFB',
    color: darkMode ? '#F3F4F6' : '#1F2937',
    fontSize: '13px',
    outline: 'none'
  };

  const closeButtonStyle: CSSProperties = {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '16px',
    color: darkMode ? '#9CA3AF' : '#6B7280',
    marginLeft: '8px'
  };

  const categoriesStyle: CSSProperties = {
    display: 'flex',
    gap: '4px',
    padding: '8px 12px',
    overflowX: 'auto',
    borderBottom: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`
  };

  const categoryButtonStyle = (active: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    borderRadius: '16px',
    border: 'none',
    background: active ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' : 'transparent',
    color: active ? 'white' : (darkMode ? '#D1D5DB' : '#6B7280'),
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  });

  const listStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '8px'
  };

  const itemStyle: CSSProperties = {
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '4px',
    background: darkMode ? '#374151' : '#F9FAFB'
  };

  const itemTitleStyle: CSSProperties = {
    fontWeight: '500',
    fontSize: '13px',
    color: darkMode ? '#F3F4F6' : '#1F2937',
    marginBottom: '4px'
  };

  const itemContentStyle: CSSProperties = {
    fontSize: '12px',
    color: darkMode ? '#D1D5DB' : '#6B7280',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };

  const addButtonStyle: CSSProperties = {
    margin: '8px',
    padding: '10px',
    borderRadius: '8px',
    border: `1px dashed ${darkMode ? '#4B5563' : '#D1D5DB'}`,
    background: 'transparent',
    color: darkMode ? '#9CA3AF' : '#6B7280',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>Quick Responses</span>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={searchInputStyle}
        />
        <button style={closeButtonStyle} onClick={onClose}>✕</button>
      </div>

      <div style={categoriesStyle}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            style={categoryButtonStyle(activeCategory === cat.id)}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <div style={listStyle}>
        {filteredResponses.length > 0 ? (
          filteredResponses.map((response) => (
            <div
              key={response.id}
              style={itemStyle}
              onClick={() => handleSelect(response)}
              onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#4B5563' : '#E5E7EB'}
              onMouseLeave={(e) => e.currentTarget.style.background = darkMode ? '#374151' : '#F9FAFB'}
            >
              <div style={itemTitleStyle}>{response.title}</div>
              <div style={itemContentStyle}>{response.content}</div>
            </div>
          ))
        ) : (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: darkMode ? '#9CA3AF' : '#6B7280',
            fontSize: '13px'
          }}>
            No responses found
          </div>
        )}
      </div>

      <button
        style={addButtonStyle}
        onClick={() => {
          setEditingResponse({ id: '', category: activeCategory, title: '', content: '', usageCount: 0 });
          setShowEditor(true);
        }}
      >
        <span>+</span>
        <span>Add Custom Response</span>
      </button>
    </div>
  );
}
