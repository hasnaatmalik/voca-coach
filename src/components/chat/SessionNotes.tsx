'use client';

import { useState, useEffect, CSSProperties } from 'react';

interface SessionNote {
  id: string;
  content: string;
  linkedMessageId?: string;
  createdAt: string;
}

interface SessionNotesProps {
  conversationId: string;
  onClose: () => void;
  onLinkToMessage?: (noteId: string) => void;
  darkMode?: boolean;
}

export default function SessionNotes({
  conversationId,
  onClose,
  onLinkToMessage,
  darkMode = false
}: SessionNotesProps) {
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load notes
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const response = await fetch(`/api/therapist/session-notes?conversationId=${conversationId}`);
        if (response.ok) {
          const data = await response.json();
          setNotes(data.notes || []);
        }
      } catch (error) {
        console.error('Failed to load notes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadNotes();
  }, [conversationId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/therapist/session-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: newNote.trim()
        })
      });

      if (response.ok) {
        const saved = await response.json();
        setNotes(prev => [saved, ...prev]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await fetch(`/api/therapist/session-notes?id=${noteId}`, {
        method: 'DELETE'
      });
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleExport = () => {
    const exportContent = notes
      .map(n => `[${new Date(n.createdAt).toLocaleString()}]\n${n.content}`)
      .join('\n\n---\n\n');

    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-notes-${conversationId.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const containerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '320px',
    background: darkMode ? '#111827' : 'white',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`
  };

  const titleStyle: CSSProperties = {
    fontWeight: '600',
    fontSize: '16px',
    color: darkMode ? '#F3F4F6' : '#1F2937'
  };

  const headerActionsStyle: CSSProperties = {
    display: 'flex',
    gap: '8px'
  };

  const iconButtonStyle: CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: 'none',
    background: darkMode ? '#374151' : '#F3F4F6',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: darkMode ? '#D1D5DB' : '#6B7280'
  };

  const inputContainerStyle: CSSProperties = {
    padding: '12px 16px',
    borderBottom: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`
  };

  const textareaStyle: CSSProperties = {
    width: '100%',
    minHeight: '80px',
    padding: '10px 12px',
    border: `1px solid ${darkMode ? '#4B5563' : '#D1D5DB'}`,
    borderRadius: '8px',
    background: darkMode ? '#1F2937' : '#F9FAFB',
    color: darkMode ? '#F3F4F6' : '#1F2937',
    fontSize: '13px',
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit'
  };

  const addButtonStyle: CSSProperties = {
    width: '100%',
    marginTop: '8px',
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
    color: 'white',
    fontSize: '13px',
    fontWeight: '500',
    cursor: saving ? 'not-allowed' : 'pointer',
    opacity: saving ? 0.7 : 1
  };

  const notesListStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '8px'
  };

  const noteItemStyle: CSSProperties = {
    padding: '12px',
    borderRadius: '8px',
    background: darkMode ? '#1F2937' : '#F9FAFB',
    marginBottom: '8px'
  };

  const noteHeaderStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  };

  const noteDateStyle: CSSProperties = {
    fontSize: '11px',
    color: darkMode ? '#9CA3AF' : '#6B7280'
  };

  const noteContentStyle: CSSProperties = {
    fontSize: '13px',
    color: darkMode ? '#D1D5DB' : '#4B5563',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap'
  };

  const deleteButtonStyle: CSSProperties = {
    padding: '2px 6px',
    borderRadius: '4px',
    border: 'none',
    background: 'transparent',
    color: '#EF4444',
    fontSize: '11px',
    cursor: 'pointer',
    opacity: 0.7
  };

  const emptyStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: darkMode ? '#9CA3AF' : '#6B7280',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>Session Notes</span>
        <div style={headerActionsStyle}>
          <button
            style={iconButtonStyle}
            onClick={handleExport}
            title="Export notes"
          >
            📥
          </button>
          <button
            style={iconButtonStyle}
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      <div style={inputContainerStyle}>
        <textarea
          style={textareaStyle}
          placeholder="Add a note about this session..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.metaKey) {
              handleAddNote();
            }
          }}
        />
        <button
          style={addButtonStyle}
          onClick={handleAddNote}
          disabled={saving || !newNote.trim()}
        >
          {saving ? 'Saving...' : 'Add Note'}
        </button>
      </div>

      <div style={notesListStyle}>
        {loading ? (
          <div style={emptyStyle}>Loading notes...</div>
        ) : notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} style={noteItemStyle}>
              <div style={noteHeaderStyle}>
                <span style={noteDateStyle}>{formatDate(note.createdAt)}</span>
                <button
                  style={deleteButtonStyle}
                  onClick={() => handleDeleteNote(note.id)}
                >
                  Delete
                </button>
              </div>
              <div style={noteContentStyle}>{note.content}</div>
            </div>
          ))
        ) : (
          <div style={emptyStyle}>
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>📝</span>
            <span>No notes yet</span>
            <span style={{ fontSize: '12px', marginTop: '4px' }}>
              Add notes to track session progress
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
