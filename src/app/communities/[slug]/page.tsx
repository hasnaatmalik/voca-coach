'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/community/PostCard';
import { motion, AnimatePresence } from 'framer-motion';

const colors = {
  background: '#FAF7F3',
  surface: '#F0E4D3',
  border: '#DCC5B2',
  accent: '#D9A299',
  accentDark: '#C8847A',
  text: '#2D2D2D',
  textMuted: '#7A7A7A',
};

export default function CommunityDetailPage() {
  const { slug } = useParams() as { slug: string };
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', channelId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCommunityData();
    fetchPosts();
  }, [slug]);

  const fetchCommunityData = async () => {
    try {
      const res = await fetch(`/api/communities/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setCommunity(data.community);
        setIsMember(data.community.isMember);
        if (data.community.channels?.[0]) {
          setNewPost(prev => ({ ...prev, channelId: data.community.channels[0].id }));
        }
      } else {
        router.push('/communities');
      }
    } catch (error) {
      console.error('Failed to fetch community:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/communities/${slug}/posts`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    const action = isMember ? 'leave' : 'join';
    try {
      const res = await fetch(`/api/communities/${slug}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setIsMember(!isMember);
        fetchCommunityData(); // Refresh member count
      }
    } catch (error) {
      console.error('Failed to join/leave:', error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/communities/${slug}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts([data.post, ...posts]);
        setShowCreatePost(false);
        setNewPost({ ...newPost, title: '', content: '' });
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || loadingData || !community) return (
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
        currentPage={`/communities/${slug}`}
        isAdmin={user?.isAdmin}
        isTherapist={user?.isTherapist}
      />

      {/* Hero Header */}
      <div style={{ background: 'white', borderBottom: `1px solid ${colors.border}40`, paddingTop: '40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 40px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '24px',
                background: `${colors.accent}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)',
              }}>
                {community.icon || '🌐'}
              </div>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: colors.text, marginBottom: '4px', letterSpacing: '-0.02em' }}>
                  {community.name}
                </h1>
                <p style={{ fontSize: '16px', color: colors.textMuted, margin: 0 }}>
                  v/{community.slug} • {community._count.members} members
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleJoinLeave}
                style={{
                  padding: '12px 28px',
                  background: isMember ? 'white' : colors.accent,
                  color: isMember ? colors.text : 'white',
                  borderRadius: '100px',
                  border: isMember ? `1px solid ${colors.border}` : 'none',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {isMember ? 'Joined' : 'Join Community'}
              </button>
              {isMember && (
                <button
                  onClick={() => setShowCreatePost(true)}
                  style={{
                    padding: '12px 28px',
                    background: colors.text,
                    color: 'white',
                    borderRadius: '100px',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Create Post
                </button>
              )}
            </div>
          </div>
          
          <p style={{ maxWidth: '700px', fontSize: '16px', color: colors.textMuted, marginTop: '24px', lineHeight: '1.6' }}>
            {community.description}
          </p>
        </div>
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px' }}>
        {/* Feed */}
        <div>
          <AnimatePresence>
            {showCreatePost && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden', marginBottom: '32px' }}
              >
                <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: `1px solid ${colors.border}60` }}>
                  <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>Create a Post</h3>
                  <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                      type="text"
                      placeholder="Title"
                      required
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      style={{ padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '16px' }}
                    />
                    <textarea
                      placeholder="What's on your mind?"
                      required
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      style={{ padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '16px', minHeight: '150px' }}
                    />
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setShowCreatePost(false)}
                        style={{ padding: '10px 20px', borderRadius: '100px', border: `1px solid ${colors.border}`, background: 'none', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{ padding: '10px 24px', borderRadius: '100px', border: 'none', background: colors.accent, color: 'white', fontWeight: '700', cursor: 'pointer', opacity: isSubmitting ? 0.6 : 1 }}
                      >
                        {isSubmitting ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {posts.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center', background: 'white', borderRadius: '24px', border: `1px solid ${colors.border}40` }}>
              <p style={{ color: colors.textMuted, fontSize: '18px' }}>No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post.id} post={{ ...post, communitySlug: slug }} compact />
            ))
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: `1px solid ${colors.border}60` }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.text }}>
              About Community
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: colors.textMuted }}>Created</span>
                <span style={{ fontWeight: '600' }}>{new Date(community.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: colors.textMuted }}>Members</span>
                <span style={{ fontWeight: '600' }}>{community._count.members}</span>
              </div>
            </div>
          </div>
          
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: `1px solid ${colors.border}60` }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.text }}>
              Community Rules
            </h3>
            <ul style={{ padding: '0 0 0 20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: colors.textMuted }}>
              <li>Be respectful to others</li>
              <li>No spam or self-promotion</li>
              <li>Keep discussions relevant</li>
              <li>Have fun and support each other!</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
