'use client';

import { useState, useCallback, CSSProperties } from 'react';
import type { ChatMessage } from '@/types/chat';

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'voice': return '🎤';
      case 'image': return '🖼️';
      case 'file': return '📎';
      default: return '💬';
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
        <button style={backButtonStyle} onClick={onClose}>←</button>
        <div style={inputContainerStyle}>
          <span style={searchIconStyle}>🔍</span>
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
          style={filterButtonStyle(filter === 'text')}
          onClick={() => setFilter('text')}
        >
          💬 Text
        </button>
        <button
          style={filterButtonStyle(filter === 'voice')}
          onClick={() => setFilter('voice')}
        >
          🎤 Voice
        </button>
        <button
          style={filterButtonStyle(filter === 'media')}
          onClick={() => setFilter('media')}
        >
          📎 Media
        </button>
      </div>

      <div style={resultsContainerStyle}>
        {loading ? (
          <div style={emptyStyle}>
            <span style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</span>
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
                <span style={resultSenderStyle}>
                  {getTypeIcon(result.message.type)} {result.message.sender?.name || 'Unknown'}
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
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</span>
            <span>No messages found</span>
            <span style={{ fontSize: '12px', marginTop: '4px' }}>Try different keywords</span>
          </div>
        ) : (
          <div style={emptyStyle}>
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>💬</span>
            <span>Search your messages</span>
            <span style={{ fontSize: '12px', marginTop: '4px' }}>Type at least 2 characters</span>
          </div>
        )}
      </div>
    </div>
  );
}
