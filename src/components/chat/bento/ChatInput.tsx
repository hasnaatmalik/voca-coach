'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';

// SVG Icon Components
const MicIcon = ({ color = '#6B6B6B', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const PaperclipIcon = ({ color = '#6B6B6B', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const SendIcon = ({ color = 'white', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const XIcon = ({ color = '#6B6B6B', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface ReplyPreview {
  id: string;
  senderName: string;
  content?: string | null;
  type?: string;
}

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  replyPreview?: ReplyPreview | null;
  onCancelReply?: () => void;
}

const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(({
  value,
  onChange,
  onSubmit,
  replyPreview,
  onCancelReply,
}, ref) => {
  const hasContent = value.trim().length > 0;

  return (
    <div>
      {/* Reply Preview */}
      {replyPreview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 24px',
            borderTop: '1px solid #F0E4D3',
            background: '#FAF7F3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{
            borderLeft: '3px solid #D9A299',
            paddingLeft: '12px',
          }}>
            <div style={{ fontSize: '12px', color: '#D9A299', fontWeight: '600' }}>
              Replying to {replyPreview.senderName}
            </div>
            <div style={{ fontSize: '13px', color: '#6B6B6B', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {replyPreview.type === 'voice' ? (
                <><MicIcon color="#6B6B6B" size={14} /> Voice message</>
              ) : (
                replyPreview.content?.substring(0, 50)
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCancelReply}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6B6B6B',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <XIcon color="#6B6B6B" size={18} />
          </motion.button>
        </motion.div>
      )}

      {/* Input Form */}
      <form
        onSubmit={onSubmit}
        style={{
          padding: '16px 24px',
          borderTop: '1px solid #F0E4D3',
          background: 'white',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        {/* Attachment */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.05, background: '#F0E4D3' }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            border: '1px solid #DCC5B2',
            background: '#FAF7F3',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Attach file"
        >
          <PaperclipIcon color="#6B6B6B" size={18} />
        </motion.button>

        {/* Input */}
        <input
          ref={ref}
          value={value}
          onChange={onChange}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '14px 20px',
            border: '1px solid #DCC5B2',
            borderRadius: '16px',
            fontSize: '15px',
            outline: 'none',
            background: '#FAF7F3',
            transition: 'all 0.2s',
          }}
        />

        {/* Voice */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.05, background: '#F0E4D3' }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            border: '1px solid #DCC5B2',
            background: '#FAF7F3',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Voice message"
        >
          <MicIcon color="#6B6B6B" size={18} />
        </motion.button>

        {/* Send */}
        <motion.button
          type="submit"
          disabled={!hasContent}
          whileHover={hasContent ? { scale: 1.05 } : {}}
          whileTap={hasContent ? { scale: 0.95 } : {}}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: hasContent
              ? 'linear-gradient(135deg, #D9A299 0%, #C8847A 100%)'
              : '#E5E7EB',
            color: hasContent ? 'white' : '#9CA3AF',
            border: 'none',
            cursor: hasContent ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: hasContent ? '0 4px 12px rgba(217, 162, 153, 0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <SendIcon color={hasContent ? 'white' : '#9CA3AF'} size={18} />
        </motion.button>
      </form>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
