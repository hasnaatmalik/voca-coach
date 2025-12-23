'use client';

import { useState, useEffect, CSSProperties } from 'react';

interface SessionSummary {
  id: string;
  date: string;
  duration: number;
  messageCount: number;
  topics: string[];
  mood?: number;
}

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  mood: number;
  preview: string;
}

interface BiomarkerData {
  date: string;
  stressScore: number;
  speakingRate: number;
}

interface ClientHistoryProps {
  studentId: string;
  studentName: string;
  onClose: () => void;
  onViewSession?: (sessionId: string) => void;
  darkMode?: boolean;
}

export default function ClientHistorySidebar({
  studentId,
  studentName,
  onClose,
  onViewSession,
  darkMode = false
}: ClientHistoryProps) {
  const [activeTab, setActiveTab] = useState<'sessions' | 'journal' | 'biomarkers'>('sessions');
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [biomarkers, setBiomarkers] = useState<BiomarkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [moodTrend, setMoodTrend] = useState<{ avg: number; trend: 'up' | 'down' | 'stable' }>({ avg: 5, trend: 'stable' });

  // Load client history data
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const [sessionsRes, journalsRes, biomarkersRes] = await Promise.all([
          fetch(`/api/therapist/client-history/sessions?studentId=${studentId}`),
          fetch(`/api/therapist/client-history/journals?studentId=${studentId}`),
          fetch(`/api/therapist/client-history/biomarkers?studentId=${studentId}`)
        ]);

        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessions(data.sessions || []);
        }

        if (journalsRes.ok) {
          const data = await journalsRes.json();
          setJournals(data.entries || []);
          if (data.moodTrend) {
            setMoodTrend(data.moodTrend);
          }
        }

        if (biomarkersRes.ok) {
          const data = await biomarkersRes.json();
          setBiomarkers(data.biomarkers || []);
        }
      } catch (error) {
        console.error('Failed to load client history:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [studentId]);

  const getMoodColor = (mood: number) => {
    if (mood >= 7) return '#10B981';
    if (mood >= 4) return '#F59E0B';
    return '#EF4444';
  };

  const getMoodLabel = (mood: number) => {
    if (mood >= 8) return 'Great';
    if (mood >= 6) return 'Good';
    if (mood >= 4) return 'Okay';
    if (mood >= 2) return 'Low';
    return 'Very Low';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const containerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '360px',
    background: darkMode ? '#111827' : 'white',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100
  };

  const headerStyle: CSSProperties = {
    padding: '16px',
    borderBottom: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`
  };

  const headerTopStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  };

  const clientInfoStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const avatarStyle: CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '18px'
  };

  const nameStyle: CSSProperties = {
    fontWeight: '600',
    fontSize: '16px',
    color: darkMode ? '#F3F4F6' : '#1F2937'
  };

  const closeButtonStyle: CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '18px',
    color: darkMode ? '#9CA3AF' : '#6B7280'
  };

  const moodSummaryStyle: CSSProperties = {
    display: 'flex',
    gap: '16px',
    marginTop: '12px'
  };

  const moodCardStyle: CSSProperties = {
    flex: 1,
    padding: '10px 12px',
    borderRadius: '8px',
    background: darkMode ? '#1F2937' : '#F9FAFB'
  };

  const moodLabelStyle: CSSProperties = {
    fontSize: '11px',
    color: darkMode ? '#9CA3AF' : '#6B7280',
    marginBottom: '4px'
  };

  const moodValueStyle: CSSProperties = {
    fontSize: '18px',
    fontWeight: '600'
  };

  const tabsStyle: CSSProperties = {
    display: 'flex',
    borderBottom: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`
  };

  const tabStyle = (active: boolean): CSSProperties => ({
    flex: 1,
    padding: '12px',
    border: 'none',
    background: 'transparent',
    borderBottom: active ? '2px solid #7C3AED' : '2px solid transparent',
    color: active ? '#7C3AED' : (darkMode ? '#9CA3AF' : '#6B7280'),
    fontWeight: active ? '600' : '400',
    fontSize: '13px',
    cursor: 'pointer'
  });

  const contentStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '12px'
  };

  const sessionItemStyle: CSSProperties = {
    padding: '12px',
    borderRadius: '8px',
    background: darkMode ? '#1F2937' : '#F9FAFB',
    marginBottom: '8px',
    cursor: 'pointer'
  };

  const sessionHeaderStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  };

  const sessionDateStyle: CSSProperties = {
    fontWeight: '500',
    fontSize: '13px',
    color: darkMode ? '#F3F4F6' : '#1F2937'
  };

  const sessionStatsStyle: CSSProperties = {
    fontSize: '11px',
    color: darkMode ? '#9CA3AF' : '#6B7280'
  };

  const topicsStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '8px'
  };

  const topicTagStyle: CSSProperties = {
    padding: '2px 8px',
    borderRadius: '10px',
    background: 'rgba(124, 58, 237, 0.1)',
    color: '#7C3AED',
    fontSize: '10px'
  };

  const journalItemStyle: CSSProperties = {
    padding: '12px',
    borderRadius: '8px',
    background: darkMode ? '#1F2937' : '#F9FAFB',
    marginBottom: '8px'
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

  const initial = studentName.charAt(0).toUpperCase();

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={headerTopStyle}>
          <div style={clientInfoStyle}>
            <div style={avatarStyle}>{initial}</div>
            <div>
              <div style={nameStyle}>{studentName}</div>
              <div style={{ fontSize: '12px', color: darkMode ? '#9CA3AF' : '#6B7280' }}>
                {sessions.length} sessions
              </div>
            </div>
          </div>
          <button style={closeButtonStyle} onClick={onClose}>✕</button>
        </div>

        <div style={moodSummaryStyle}>
          <div style={moodCardStyle}>
            <div style={moodLabelStyle}>Average Mood</div>
            <div style={{ ...moodValueStyle, color: getMoodColor(moodTrend.avg) }}>
              {moodTrend.avg.toFixed(1)} / 10
            </div>
          </div>
          <div style={moodCardStyle}>
            <div style={moodLabelStyle}>Trend</div>
            <div style={moodValueStyle}>
              {moodTrend.trend === 'up' ? '📈 Improving' :
               moodTrend.trend === 'down' ? '📉 Declining' : '➡️ Stable'}
            </div>
          </div>
        </div>
      </div>

      <div style={tabsStyle}>
        <button
          style={tabStyle(activeTab === 'sessions')}
          onClick={() => setActiveTab('sessions')}
        >
          Sessions
        </button>
        <button
          style={tabStyle(activeTab === 'journal')}
          onClick={() => setActiveTab('journal')}
        >
          Journal
        </button>
        <button
          style={tabStyle(activeTab === 'biomarkers')}
          onClick={() => setActiveTab('biomarkers')}
        >
          Voice Data
        </button>
      </div>

      <div style={contentStyle}>
        {loading ? (
          <div style={emptyStyle}>Loading...</div>
        ) : activeTab === 'sessions' ? (
          sessions.length > 0 ? (
            sessions.map((session) => (
              <div
                key={session.id}
                style={sessionItemStyle}
                onClick={() => onViewSession?.(session.id)}
              >
                <div style={sessionHeaderStyle}>
                  <span style={sessionDateStyle}>{formatDate(session.date)}</span>
                  <span style={sessionStatsStyle}>
                    {session.messageCount} messages
                  </span>
                </div>
                {session.mood && (
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: getMoodColor(session.mood) }}>●</span>
                    {' '}{getMoodLabel(session.mood)} ({session.mood}/10)
                  </div>
                )}
                {session.topics.length > 0 && (
                  <div style={topicsStyle}>
                    {session.topics.map((topic, i) => (
                      <span key={i} style={topicTagStyle}>{topic}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={emptyStyle}>
              <span style={{ fontSize: '32px', marginBottom: '12px' }}>💬</span>
              <span>No session history yet</span>
            </div>
          )
        ) : activeTab === 'journal' ? (
          journals.length > 0 ? (
            journals.map((entry) => (
              <div key={entry.id} style={journalItemStyle}>
                <div style={sessionHeaderStyle}>
                  <span style={sessionDateStyle}>{entry.title}</span>
                  <span style={{ color: getMoodColor(entry.mood) }}>
                    {entry.mood}/10
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: darkMode ? '#9CA3AF' : '#6B7280', marginBottom: '4px' }}>
                  {formatDate(entry.date)}
                </div>
                <div style={{ fontSize: '12px', color: darkMode ? '#D1D5DB' : '#4B5563', lineHeight: '1.4' }}>
                  {entry.preview}
                </div>
              </div>
            ))
          ) : (
            <div style={emptyStyle}>
              <span style={{ fontSize: '32px', marginBottom: '12px' }}>📓</span>
              <span>No journal entries</span>
            </div>
          )
        ) : (
          biomarkers.length > 0 ? (
            <>
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                background: darkMode ? '#1F2937' : '#F9FAFB',
                marginBottom: '12px'
              }}>
                <div style={{ fontWeight: '500', fontSize: '13px', marginBottom: '8px', color: darkMode ? '#F3F4F6' : '#1F2937' }}>
                  Voice Stress Trend
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '60px' }}>
                  {biomarkers.slice(-10).map((b, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${b.stressScore * 100}%`,
                        background: getMoodColor(10 - b.stressScore * 10),
                        borderRadius: '2px',
                        minHeight: '4px'
                      }}
                      title={`${formatDate(b.date)}: ${Math.round(b.stressScore * 100)}% stress`}
                    />
                  ))}
                </div>
              </div>
              {biomarkers.slice(0, 5).map((b, i) => (
                <div key={i} style={journalItemStyle}>
                  <div style={sessionHeaderStyle}>
                    <span style={sessionDateStyle}>{formatDate(b.date)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>Stress: </span>
                      <span style={{ color: getMoodColor(10 - b.stressScore * 10) }}>
                        {Math.round(b.stressScore * 100)}%
                      </span>
                    </div>
                    <div>
                      <span style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>Rate: </span>
                      <span>{b.speakingRate} WPM</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div style={emptyStyle}>
              <span style={{ fontSize: '32px', marginBottom: '12px' }}>🎤</span>
              <span>No voice data available</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
