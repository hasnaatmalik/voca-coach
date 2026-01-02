'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
  id: string;
  content: string;
  score: number;
  createdAt: string;
  author: { name: string; id: string };
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
}

const colors = {
  background: '#FAF7F3',
  surface: '#F0E4D3',
  border: '#DCC5B2',
  accent: '#D9A299',
  accentDark: '#C8847A',
  text: '#2D2D2D',
  textMuted: '#7A7A7A',
};

const CommentItem: React.FC<{ comment: Comment; postId: string; depth: number }> = ({ comment, postId, depth }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replies, setReplies] = useState<Comment[]>(comment.replies || []);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, parentId: comment.id }),
      });
      const data = await res.json();
      if (data.comment) {
        setReplies([data.comment, ...replies]);
        setReplyContent('');
        setShowReplyForm(false);
      }
    } catch (error) {
      console.error('Failed to post reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      marginTop: '16px',
      paddingLeft: depth > 0 ? '16px' : '0',
      borderLeft: depth > 0 ? `2px solid ${colors.border}40` : 'none',
    }}>
      <div style={{ padding: '8px 0' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: colors.text }}>
            u/{comment.author.name}
          </span>
          <span style={{ fontSize: '12px', color: colors.textMuted }}>
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p style={{
          fontSize: '15px',
          color: colors.text,
          margin: 0,
          lineHeight: '1.5',
        }}>
          {comment.content}
        </p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            style={{
              background: 'none',
              border: 'none',
              color: colors.textMuted,
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Reply
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showReplyForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginTop: '8px' }}
          >
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="What are your thoughts?"
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                background: colors.background,
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                disabled={isSubmitting}
                onClick={handleReply}
                style={{
                  padding: '8px 16px',
                  background: colors.accent,
                  color: 'white',
                  borderRadius: '100px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </button>
              <button
                onClick={() => setShowReplyForm(false)}
                style={{
                  padding: '8px 16px',
                  background: 'none',
                  color: colors.textMuted,
                  borderRadius: '100px',
                  border: `1px solid ${colors.border}`,
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {replies.map(reply => (
        <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
      ))}
    </div>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({ postId, initialComments }) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      });
      const data = await res.json();
      if (data.comment) {
        setComments([data.comment, ...comments]);
        setCommentText('');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, marginBottom: '16px' }}>
        Comments
      </h3>

      <div style={{ marginBottom: '24px' }}>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '16px',
            borderRadius: '16px',
            border: `1px solid ${colors.border}`,
            background: 'white',
            fontSize: '15px',
            outline: 'none',
            resize: 'vertical',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button
            disabled={isSubmitting}
            onClick={handlePostComment}
            style={{
              padding: '10px 24px',
              background: colors.accent,
              color: 'white',
              borderRadius: '100px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
              boxShadow: '0 4px 12px rgba(217, 162, 153, 0.3)',
            }}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${colors.border}40`, paddingTop: '8px' }}>
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} postId={postId} depth={0} />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
