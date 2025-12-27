'use client';

import { useState, useCallback, CSSProperties } from 'react';
import type { ChatMessage } from '@/types/chat';

// SVG Icon Components
const SearchIcon = ({ color = '#6B7280', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ArrowLeftIcon = ({ color = '#6B7280', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ChatIcon = ({ color = '#D9A299', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MicIcon = ({ color = '#7AB89E', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const ImageIcon = ({ color = '#7AAFC9', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const PaperclipIcon = ({ color = '#E4B17A', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const LoaderIcon = ({ color = '#D9A299', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

interface MessageSearchProps {
  conversationId: string;
  onMessageSelect: (messageId: string) => void;
  onClose: () => void;
  darkMode?: boolean;
}

interface SearchResult {
  message: ChatMessage;
  highlight: string;
}

export default function MessageSearch({
  conversationId,
  onMessageSelect,
  onClose,
  darkMode = false
}: MessageSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'text' | 'voice' | 'media'>('all');

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        conversationId,
        query: query.trim(),
        type: filter
      });

      const response = await fetch(`/api/chat/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, query, filter]);

  // Debounced search
  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value.trim().length >= 2) {
      const timeout = setTimeout(handleSearch, 300);
      return () => clearTimeout(timeout);
    } else {
      setResults([]);
    }
  };

  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} style={{ background: '#FEF3C7', borderRadius: '2px', padding: '0 2px' }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTypeIcon = (type: string, darkMode: boolean) => {
    const color = darkMode ? '#D1D5DB' : '#6B7280';
    switch (type) {
      case 'voice': return <MicIcon color={color} size={14} />;
      case 'image': return <ImageIcon color={color} size={14} />;
      case 'file': return <PaperclipIcon color={color} size={14} />;
      default: return <ChatIcon color={color} size={14} />;
    }
  };

  const containerStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: darkMode ? '#111827' : 'white',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`
  };

  const backButtonStyle: CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: darkMode ? '#D1D5DB' : '#6B7280'
  };

  const inputContainerStyle: CSSProperties = {
    flex: 1,
    position: 'relative'
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    paddingLeft: '36px',
    border: `1px solid ${darkMode ? '#4B5563' : '#D1D5DB'}`,
    borderRadius: '8px',
    background: darkMode ? '#1F2937' : '#F9FAFB',
    color: darkMode ? '#F3F4F6' : '#1F2937',
    fontSize: '14px',
    outline: 'none'
  };

  const searchIconStyle: CSSProperties = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: darkMode ? '#9CA3AF' : '#6B7280',
    pointerEvents: 'none'
  };

  const filterRowStyle: CSSProperties = {
    display: 'flex',
    gap: '8px',
    padding: '8px 16px',
    borderBottom: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`
  };

  const filterButtonStyle = (active: boolean): CSSProperties => ({
    padding: '4px 12px',
    borderRadius: '16px',
    border: 'none',
    background: active ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' : (darkMode ? '#374151' : '#F3F4F6'),
    color: active ? 'white' : (darkMode ? '#D1D5DB' : '#6B7280'),
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer'
  });

  const resultsContainerStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '8px'
  };

  const resultItemStyle: CSSProperties = {
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '4px',
    background: darkMode ? '#1F2937' : '#F9FAFB'
  };

  const resultHeaderStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  };

  const resultSenderStyle: CSSProperties = {
    fontWeight: '500',
    fontSize: '13px',
    color: darkMode ? '#D1D5DB' : '#4B5563'
  };

  const resultDateStyle: CSSProperties = {
    fontSize: '11px',
    color: darkMode ? '#9CA3AF' : '#9CA3AF'
  };

  const resultContentStyle: CSSProperties = {
    fontSize: '13px',
    color: darkMode ? '#F3F4F6' : '#1F2937',
    lineHeight: '1.4'
  };

  const emptyStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: darkMode ? '#9CA3AF' : '#6B7280',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button style={backButtonStyle} onClick={onClose}>
          <ArrowLeftIcon color={darkMode ? '#D1D5DB' : '#6B7280'} size={18} />
        </button>
        <div style={inputContainerStyle}>
          <span style={searchIconStyle}>
            <SearchIcon color={darkMode ? '#9CA3AF' : '#6B7280'} size={16} />
          </span>
          <input
            type="text"
            placeholder="Search messages..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            style={inputStyle}
            autoFocus
          />
        </div>
      </div>

      <div style={filterRowStyle}>
        <button
          style={filterButtonStyle(filter === 'all')}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          style={{ ...filterButtonStyle(filter === 'text'), display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={() => setFilter('text')}
        >
          <ChatIcon color={filter === 'text' ? 'white' : (darkMode ? '#D1D5DB' : '#6B7280')} size={14} /> Text
        </button>
        <button
          style={{ ...filterButtonStyle(filter === 'voice'), display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={() => setFilter('voice')}
        >
          <MicIcon color={filter === 'voice' ? 'white' : (darkMode ? '#D1D5DB' : '#6B7280')} size={14} /> Voice
        </button>
        <button
          style={{ ...filterButtonStyle(filter === 'media'), display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={() => setFilter('media')}
        >
          <PaperclipIcon color={filter === 'media' ? 'white' : (darkMode ? '#D1D5DB' : '#6B7280')} size={14} /> Media
        </button>
      </div>

      <div style={resultsContainerStyle}>
        {loading ? (
          <div style={emptyStyle}>
            <span style={{ marginBottom: '8px' }}>
              <LoaderIcon color="#D9A299" size={24} />
            </span>
            <span>Searching...</span>
          </div>
        ) : results.length > 0 ? (
          results.map((result) => (
            <div
              key={result.message.id}
              style={resultItemStyle}
              onClick={() => onMessageSelect(result.message.id)}
              onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#374151' : '#E5E7EB'}
              onMouseLeave={(e) => e.currentTarget.style.background = darkMode ? '#1F2937' : '#F9FAFB'}
            >
              <div style={resultHeaderStyle}>
                <span style={{ ...resultSenderStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {getTypeIcon(result.message.type, darkMode)} {result.message.senderName || 'Unknown'}
                </span>
                <span style={resultDateStyle}>{formatDate(result.message.createdAt)}</span>
              </div>
              <div style={resultContentStyle}>
                {highlightMatch(
                  result.message.content || result.message.transcript || '[Media]',
                  query
                )}
              </div>
            </div>
          ))
        ) : query.trim().length >= 2 ? (
          <div style={emptyStyle}>
            <span style={{ marginBottom: '12px' }}>
              <SearchIcon color="#D9A299" size={32} />
            </span>
            <span>No messages found</span>
            <span style={{ fontSize: '12px', marginTop: '4px' }}>Try different keywords</span>
          </div>
        ) : (
          <div style={emptyStyle}>
            <span style={{ marginBottom: '12px' }}>
              <ChatIcon color="#D9A299" size={32} />
            </span>
            <span>Search your messages</span>
            <span style={{ fontSize: '12px', marginTop: '4px' }}>Type at least 2 characters</span>
          </div>
        )}
      </div>
    </div>
  );
}
