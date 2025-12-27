'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

// SVG Icon Components
const SparkleIcon = ({ color = '#7C3AED', size = 12 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
  </svg>
);

const StarIcon = ({ filled, color = '#F59E0B', size = 32 }: { filled: boolean; color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

interface SessionData {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  notes: string | null;
  user: { id: string; name: string };
  therapist: { id: string; name: string };
  preSessionData: {
    moodRating: number;
    concernText: string | null;
    sessionGoals: string | null;
  } | null;
  postSessionSummary: {
    aiHighlights: string | null;
    keyTopics: string | null;
    homework: string | null;
    moodBefore: number | null;
    moodAfter: number | null;
    rating: number | null;
    feedbackText: string | null;
  } | null;
}

function SummaryContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Feedback form
  const [moodAfter, setMoodAfter] = useState(5);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategories, setFeedbackCategories] = useState<Record<string, boolean>>({
    helpful: false,
    understood: false,
    practical: false,
    wouldRecommend: false,
  });

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/therapy/summary?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);

        // Pre-fill feedback if exists
        if (data.session.postSessionSummary) {
          const summary = data.session.postSessionSummary;
          if (summary.moodAfter) setMoodAfter(summary.moodAfter);
          if (summary.rating) setRating(summary.rating);
          if (summary.feedbackText) setFeedbackText(summary.feedbackText);
        }
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    if (!sessionId) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/therapy/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, action: 'generate' }),
      });

      if (response.ok) {
        await fetchSession();
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setGenerating(false);
    }
  };

  const saveFeedback = async () => {
    if (!sessionId) return;

    setSaving(true);
    try {
      await fetch('/api/therapy/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: 'feedback',
          moodAfter,
          rating,
          feedbackText,
          feedbackCategories,
        }),
      });

      await fetchSession();
    } catch (error) {
      console.error('Error saving feedback:', error);
    } finally {
      setSaving(false);
    }
  };

  const parseJSON = (str: string | null) => {
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%)' }}>
        <Navbar isAuthenticated={true} userName={user.name} userEmail={user.email} onLogout={logout} />
        <div style={{ padding: '100px', textAlign: 'center', color: '#6B7280' }}>
          Loading session summary...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%)' }}>
        <Navbar isAuthenticated={true} userName={user.name} userEmail={user.email} onLogout={logout} />
        <div style={{ padding: '100px', textAlign: 'center', color: '#6B7280' }}>
          Session not found
        </div>
      </div>
    );
  }

  const summary = session.postSessionSummary;
  const highlights = parseJSON(summary?.aiHighlights || null);
  const topics = parseJSON(summary?.keyTopics || null);
  const homework = parseJSON(summary?.homework || null);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%)' }}>
      <Navbar isAuthenticated={true} userName={user.name} userEmail={user.email} onLogout={logout} />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
            Session Summary
          </h1>
          <p style={{ color: '#6B7280' }}>
            {new Date(session.scheduledAt).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })} with {session.therapist.name}
          </p>
        </div>

        {/* Mood Comparison */}
        {session.preSessionData && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
              Mood Check
            </h2>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>Before</div>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '700',
                  color: session.preSessionData.moodRating >= 7 ? '#10B981' : session.preSessionData.moodRating >= 4 ? '#F59E0B' : '#DC2626',
                }}>
                  {session.preSessionData.moodRating}
                </div>
                <div style={{ fontSize: '13px', color: '#9CA3AF' }}>/10</div>
              </div>
              <div style={{ fontSize: '24px', color: '#9CA3AF' }}>→</div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>After</div>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '700',
                  color: moodAfter >= 7 ? '#10B981' : moodAfter >= 4 ? '#F59E0B' : '#DC2626',
                }}>
                  {summary?.moodAfter || moodAfter}
                </div>
                <div style={{ fontSize: '13px', color: '#9CA3AF' }}>/10</div>
              </div>
            </div>

            {!summary?.moodAfter && (
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '13px', color: '#6B7280', display: 'block', marginBottom: '8px' }}>
                  How are you feeling now?
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodAfter}
                  onChange={(e) => setMoodAfter(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#7C3AED' }}
                />
              </div>
            )}
          </div>
        )}

        {/* AI Summary */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>
              Session Highlights
            </h2>
            {!summary?.aiHighlights && (
              <button
                onClick={generateSummary}
                disabled={generating}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  opacity: generating ? 0.7 : 1,
                }}
              >
                {generating ? 'Generating...' : 'Generate Summary'}
              </button>
            )}
          </div>

          {highlights.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {highlights.map((highlight: string, i: number) => (
                <li key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: i < highlights.length - 1 ? '1px solid #F3F4F6' : 'none',
                }}>
                  <span style={{ color: '#7C3AED', display: 'flex', alignItems: 'center', paddingTop: '4px' }}>
                    <SparkleIcon color="#7C3AED" size={12} />
                  </span>
                  <span style={{ color: '#4B5563' }}>{highlight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#9CA3AF', fontStyle: 'italic' }}>
              No highlights generated yet. Click "Generate Summary" to create AI-powered insights.
            </p>
          )}
        </div>

        {/* Key Topics */}
        {topics.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
              Topics Discussed
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {topics.map((topic: string, i: number) => (
                <span key={i} style={{
                  padding: '6px 14px',
                  background: 'rgba(124, 58, 237, 0.1)',
                  color: '#7C3AED',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500',
                }}>
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Homework */}
        {homework.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
              Action Items
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {homework.map((item: string, i: number) => (
                <li key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 0',
                }}>
                  <input type="checkbox" style={{ accentColor: '#7C3AED' }} />
                  <span style={{ color: '#4B5563' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rating & Feedback */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>
            Rate Your Session
          </h2>

          {/* Star Rating */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <StarIcon
                    filled={star <= (summary?.rating || rating)}
                    color={star <= (summary?.rating || rating) ? '#F59E0B' : '#D1D5DB'}
                    size={32}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Categories */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Object.entries({
                helpful: 'Helpful',
                understood: 'Felt Understood',
                practical: 'Practical Advice',
                wouldRecommend: 'Would Recommend',
              }).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFeedbackCategories({ ...feedbackCategories, [key]: !feedbackCategories[key] })}
                  style={{
                    padding: '8px 16px',
                    background: feedbackCategories[key] ? 'rgba(124, 58, 237, 0.1)' : '#F3F4F6',
                    color: feedbackCategories[key] ? '#7C3AED' : '#6B7280',
                    border: feedbackCategories[key] ? '1px solid #7C3AED' : '1px solid transparent',
                    borderRadius: '20px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Feedback */}
          <div style={{ marginBottom: '20px' }}>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Any additional thoughts about your session? (Optional)"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical',
              }}
            />
          </div>

          <button
            onClick={saveFeedback}
            disabled={saving}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Feedback'}
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.push('/therapy/book')}
            style={{
              flex: 1,
              padding: '14px',
              background: 'white',
              color: '#7C3AED',
              border: '2px solid #7C3AED',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Book Next Session
          </button>
          <button
            onClick={() => router.push('/therapy/sessions')}
            style={{
              flex: 1,
              padding: '14px',
              background: '#6B7280',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Back to Sessions
          </button>
        </div>
      </main>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SummaryContent />
    </Suspense>
  );
}
