'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/community/PostCard';
import CommentSection from '@/components/community/CommentSection';
import Link from 'next/link';

const colors = {
  background: '#FAF7F3',
  surface: '#F0E4D3',
  border: '#DCC5B2',
  accent: '#D9A299',
  accentDark: '#C8847A',
  text: '#2D2D2D',
  textMuted: '#7A7A7A',
};

export default function PostDetailPage() {
  const { slug, id } = useParams() as { slug: string, id: string };
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchPostData();
    fetchComments();
  }, [id]);

  const fetchPostData = async () => {
    try {
      const res = await fetch(`/api/posts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data.post);
      } else {
        router.push(`/communities/${slug}`);
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/posts/${id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData || !post) return (
    <div style={{ minHeight: '100vh', background: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: `3px solid ${colors.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: colors.background }}>
      <Navbar
        isAuthenticated={!!user}
        userName={user?.name || 'User'}
        userEmail={user?.email || ''}
        onLogout={() => { logout(); router.push('/login'); }}
        currentPage={`/communities/${slug}/posts/${id}`}
        isAdmin={user?.isAdmin}
        isTherapist={user?.isTherapist}
      />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px' }}>
        <div>
          {/* Back Button */}
          <Link href={`/communities/${slug}`} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.textMuted,
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '24px',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to v/{slug}
          </Link>

          {/* Full Post */}
          <PostCard post={{ ...post, communitySlug: slug }} />

          {/* Comments Section */}
          <CommentSection postId={id} initialComments={comments} />
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: `1px solid ${colors.border}60` }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.text }}>
              Community
            </h3>
            <Link href={`/communities/${slug}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${colors.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                {post.community.icon || '🌐'}
              </div>
              <span style={{ fontWeight: '700', color: colors.text }}>{post.community.name}</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
