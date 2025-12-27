'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket, useSocketRoom } from './useSocket';
import type {
  ChatMessage,
  ChatConversation,
  TypingIndicator,
  UserPresence,
  QueuedMessage,
  CrisisAlert,
  ChatReaction,
  GroupedReaction
} from '@/types/chat';
import type { ChatMessage as SocketChatMessage, ChatReaction as SocketReaction } from '@/lib/socket-events';

// Local storage key for offline message queue
const QUEUE_STORAGE_KEY = 'voca_chat_queue';

// Convert socket message to our chat message type
function socketToChat(msg: SocketChatMessage, currentUserId: string): ChatMessage {
  return {
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    content: msg.content,
    type: msg.type,
    mediaUrl: msg.mediaUrl,
    mediaDuration: msg.mediaDuration,
    mediaSize: msg.mediaSize,
    fileName: msg.fileName,
    mimeType: msg.mimeType,
    transcript: msg.transcript,
    sentiment: msg.sentiment ? JSON.parse(msg.sentiment) : undefined,
    biomarkers: undefined, // parsed on demand
    crisisLevel: msg.crisisLevel as ChatMessage['crisisLevel'],
    replyToId: msg.replyToId,
    replyToPreview: msg.replyToPreview ? {
      id: msg.replyToPreview.id,
      content: msg.replyToPreview.content,
      senderName: msg.replyToPreview.senderName,
      type: msg.replyToPreview.type as ChatMessage['type']
    } : undefined,
    isEdited: msg.isEdited,
    reactions: msg.reactions?.map(r => ({
      id: r.id,
      messageId: r.messageId,
      userId: r.userId,
      userName: r.userName,
      emoji: r.emoji,
      createdAt: r.createdAt
    })) || [],
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt
  };
}

// Group reactions for display
export function groupReactions(reactions: ChatReaction[], currentUserId: string): GroupedReaction[] {
  const grouped = new Map<string, GroupedReaction>();

  for (const r of reactions) {
    const existing = grouped.get(r.emoji);
    if (existing) {
      existing.count++;
      existing.users.push({ userId: r.userId, userName: r.userName });
      if (r.userId === currentUserId) existing.hasUserReacted = true;
    } else {
      grouped.set(r.emoji, {
        emoji: r.emoji,
        count: 1,
        users: [{ userId: r.userId, userName: r.userName }],
        hasUserReacted: r.userId === currentUserId
      });
    }
  }

  return Array.from(grouped.values());
}

interface UseChatOptions {
  userId: string;
  onCrisisAlert?: (alert: CrisisAlert) => void;
  onNewMessage?: (message: ChatMessage) => void;
}

export function useChat({ userId, onCrisisAlert, onNewMessage }: UseChatOptions) {
  const { socket, isConnected, isConnecting, connect, error: socketError } = useSocket();

  // State
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator>>(new Map());
  const [presenceMap, setPresenceMap] = useState<Map<string, UserPresence>>(new Map());
  const [messageQueue, setMessageQueue] = useState<QueuedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for callbacks
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastTypingSent = useRef<number>(0);

  // Join conversation room when selected
  useSocketRoom('conversation', selectedConversationId);

  // Initialize socket connection
  useEffect(() => {
    const initSocket = async () => {
      if (isConnected || isConnecting) return;

      try {
        // Get socket token
        const res = await fetch('/api/socket/token');
        if (res.ok) {
          const { token } = await res.json();
          await connect(token);
        }
      } catch (err) {
        console.error('Failed to initialize socket:', err);
      }
    };

    initSocket();
  }, [connect, isConnected, isConnecting]);

  // Load queued messages from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as QueuedMessage[];
        setMessageQueue(parsed.filter(m => m.status !== 'sent'));
      }
    } catch (err) {
      console.error('Failed to load message queue:', err);
    }
  }, []);

  // Save queue to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(messageQueue));
    } catch (err) {
      console.error('Failed to save message queue:', err);
    }
  }, [messageQueue]);

  // Process queued messages when reconnected
  useEffect(() => {
    if (!isConnected || !socket) return;

    const processingQueue = messageQueue.filter(m => m.status === 'queued');
    processingQueue.forEach(msg => {
      setMessageQueue(prev => prev.map(m =>
        m.id === msg.id ? { ...m, status: 'sending' } : m
      ));

      if (msg.type === 'text' && msg.content) {
        socket.emit('chat:send', {
          conversationId: msg.conversationId,
          content: msg.content,
          replyToId: msg.replyToId
        });
      }
      // Voice and media handled separately

      // Remove from queue after a delay
      setTimeout(() => {
        setMessageQueue(prev => prev.filter(m => m.id !== msg.id));
      }, 1000);
    });
  }, [isConnected, socket, messageQueue]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // New message
    const handleMessage = (msg: SocketChatMessage) => {
      const chatMsg = socketToChat(msg, userId);

      setMessages(prev => {
        // Check if message already exists (optimistic update)
        const exists = prev.some(m => m.id === msg.id);
        if (exists) {
          return prev.map(m => m.id === msg.id ? chatMsg : m);
        }
        return [...prev, chatMsg];
      });

      // Update conversation last message
      setConversations(prev => prev.map(c =>
        c.id === msg.conversationId ? {
          ...c,
          lastMessage: {
            content: msg.content,
            type: msg.type,
            createdAt: msg.createdAt,
            senderId: msg.senderId
          },
          unreadCount: msg.senderId !== userId ? c.unreadCount + 1 : c.unreadCount,
          updatedAt: msg.createdAt
        } : c
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));

      onNewMessage?.(chatMsg);
    };

    // Message edited
    const handleMessageEdited = (data: { messageId: string; content: string; updatedAt: string }) => {
      setMessages(prev => prev.map(m =>
        m.id === data.messageId ? { ...m, content: data.content, isEdited: true, updatedAt: data.updatedAt } : m
      ));
    };

    // Message deleted
    const handleMessageDeleted = (data: { messageId: string }) => {
      setMessages(prev => prev.map(m =>
        m.id === data.messageId ? { ...m, isDeleted: true, content: null } : m
      ));
    };

    // Reaction added
    const handleReactionAdded = (data: { messageId: string; reaction: SocketReaction }) => {
      setMessages(prev => prev.map(m => {
        if (m.id !== data.messageId) return m;
        const newReaction: ChatReaction = {
          id: data.reaction.id,
          messageId: data.reaction.messageId,
          userId: data.reaction.userId,
          userName: data.reaction.userName,
          emoji: data.reaction.emoji,
          createdAt: data.reaction.createdAt
        };
        return { ...m, reactions: [...m.reactions, newReaction] };
      }));
    };

    // Reaction removed
    const handleReactionRemoved = (data: { messageId: string; userId: string; emoji: string }) => {
      setMessages(prev => prev.map(m => {
        if (m.id !== data.messageId) return m;
        return {
          ...m,
          reactions: m.reactions.filter(r => !(r.userId === data.userId && r.emoji === data.emoji))
        };
      }));
    };

    // Typing indicator
    const handleTyping = (data: { conversationId: string; userId: string; userName: string; isTyping: boolean }) => {
      if (data.userId === userId) return; // Ignore own typing

      setTypingUsers(prev => {
        const next = new Map(prev);
        if (data.isTyping) {
          next.set(data.userId, {
            conversationId: data.conversationId,
            userId: data.userId,
            userName: data.userName,
            isTyping: true,
            timestamp: Date.now()
          });

          // Auto-clear after 3 seconds
          const existingTimeout = typingTimeouts.current.get(data.userId);
          if (existingTimeout) clearTimeout(existingTimeout);

          typingTimeouts.current.set(data.userId, setTimeout(() => {
            setTypingUsers(p => {
              const n = new Map(p);
              n.delete(data.userId);
              return n;
            });
          }, 3000));
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    };

    // Read receipts
    const handleRead = (data: { conversationId: string; messageIds: string[]; readAt: string; readBy: string }) => {
      if (data.readBy === userId) return; // Ignore own reads

      setMessages(prev => prev.map(m =>
        data.messageIds.includes(m.id) ? { ...m, readAt: data.readAt } : m
      ));
    };

    // Crisis alert
    const handleCrisisAlert = (data: CrisisAlert) => {
      onCrisisAlert?.(data);
    };

    // Presence changes
    const handlePresence = (data: UserPresence) => {
      setPresenceMap(prev => new Map(prev).set(data.userId, data));

      // Update conversation online status
      setConversations(prev => prev.map(c =>
        c.otherUser.id === data.userId ? {
          ...c,
          otherUser: {
            ...c.otherUser,
            isOnline: data.status === 'online',
            lastActiveAt: data.lastSeen
          }
        } : c
      ));
    };

    const handlePresenceBulk = (data: UserPresence[]) => {
      setPresenceMap(prev => {
        const next = new Map(prev);
        data.forEach(p => next.set(p.userId, p));
        return next;
      });
    };

    // Biomarkers ready (for voice messages)
    const handleBiomarkersReady = (data: { messageId: string; biomarkers: string }) => {
      setMessages(prev => prev.map(m =>
        m.id === data.messageId ? { ...m, biomarkers: JSON.parse(data.biomarkers) } : m
      ));
    };

    socket.on('chat:message', handleMessage);
    socket.on('chat:message-edited', handleMessageEdited);
    socket.on('chat:message-deleted', handleMessageDeleted);
    socket.on('chat:reaction-added', handleReactionAdded);
    socket.on('chat:reaction-removed', handleReactionRemoved);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:read', handleRead);
    socket.on('chat:crisis-alert', handleCrisisAlert);
    socket.on('presence:changed', handlePresence);
    socket.on('presence:bulk', handlePresenceBulk);
    socket.on('chat:biomarkers-ready', handleBiomarkersReady);

    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('chat:message-edited', handleMessageEdited);
      socket.off('chat:message-deleted', handleMessageDeleted);
      socket.off('chat:reaction-added', handleReactionAdded);
      socket.off('chat:reaction-removed', handleReactionRemoved);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:read', handleRead);
      socket.off('chat:crisis-alert', handleCrisisAlert);
      socket.off('presence:changed', handlePresence);
      socket.off('presence:bulk', handlePresenceBulk);
      socket.off('chat:biomarkers-ready', handleBiomarkersReady);
    };
  }, [socket, isConnected, userId, onCrisisAlert, onNewMessage]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    console.log('[useChat] fetchConversations called');
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat');
      console.log('[useChat] fetchConversations response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('[useChat] fetchConversations data:', data);
        const convos: ChatConversation[] = data.conversations.map((c: {
          id: string;
          otherUser: { id: string; name: string; isOnline?: boolean; lastActiveAt?: string };
          messages: Array<{ content: string; createdAt: string; senderId: string }>;
          unreadCount?: number;
          updatedAt: string;
          createdAt: string;
        }) => ({
          id: c.id,
          otherUser: {
            id: c.otherUser?.id || '',
            name: c.otherUser?.name || 'Unknown',
            isOnline: c.otherUser?.isOnline || false,
            lastActiveAt: c.otherUser?.lastActiveAt
          },
          lastMessage: c.messages?.[0] ? {
            content: c.messages[0].content,
            type: 'text' as const,
            createdAt: c.messages[0].createdAt,
            senderId: c.messages[0].senderId
          } : undefined,
          unreadCount: c.unreadCount || 0,
          updatedAt: c.updatedAt,
          createdAt: c.createdAt
        }));
        console.log('[useChat] Setting conversations:', convos);
        setConversations(convos);

        // Request presence for all other users
        if (socket && isConnected) {
          const userIds = convos.map(c => c.otherUser.id);
          socket.emit('presence:get', { userIds });
        }
      }
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Failed to fetch conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [socket, isConnected]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        const msgs: ChatMessage[] = data.messages.map((m: {
          id: string;
          conversationId: string;
          senderId: string;
          content: string | null;
          type?: string;
          mediaUrl?: string;
          mediaDuration?: number;
          mediaSize?: number;
          fileName?: string;
          mimeType?: string;
          transcript?: string;
          sentiment?: string;
          crisisLevel?: string;
          replyToId?: string;
          isEdited?: boolean;
          isDeleted?: boolean;
          readAt?: string;
          createdAt: string;
          updatedAt?: string;
          reactions?: Array<{
            id: string;
            messageId: string;
            userId: string;
            emoji: string;
            createdAt: string;
          }>;
          sender?: { name: string };
        }) => ({
          id: m.id,
          conversationId: m.conversationId,
          senderId: m.senderId,
          senderName: m.sender?.name || '',
          content: m.content,
          type: (m.type || 'text') as ChatMessage['type'],
          mediaUrl: m.mediaUrl,
          mediaDuration: m.mediaDuration,
          mediaSize: m.mediaSize,
          fileName: m.fileName,
          mimeType: m.mimeType,
          transcript: m.transcript,
          sentiment: m.sentiment ? JSON.parse(m.sentiment) : undefined,
          crisisLevel: m.crisisLevel as ChatMessage['crisisLevel'],
          replyToId: m.replyToId,
          isEdited: m.isEdited || false,
          isDeleted: m.isDeleted || false,
          reactions: m.reactions?.map(r => ({
            id: r.id,
            messageId: r.messageId,
            userId: r.userId,
            userName: '',
            emoji: r.emoji,
            createdAt: r.createdAt
          })) || [],
          readAt: m.readAt,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt || m.createdAt
        }));
        setMessages(msgs);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  }, []);

  // Select conversation
  const selectConversation = useCallback((conversationId: string | null) => {
    setSelectedConversationId(conversationId);
    setMessages([]);
    setTypingUsers(new Map());

    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [fetchMessages]);

  // Polling fallback: Refetch messages periodically (always run for reliability)
  useEffect(() => {
    if (!selectedConversationId) return;

    const pollInterval = setInterval(() => {
      console.log('[useChat] Polling messages');
      fetchMessages(selectedConversationId);
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [selectedConversationId, fetchMessages]);

  // Send text message
  const sendMessage = useCallback((content: string, replyToId?: string) => {
    if (!selectedConversationId || !content.trim()) return;

    if (socket && isConnected) {
      socket.emit('chat:send', {
        conversationId: selectedConversationId,
        content: content.trim(),
        replyToId
      });
    } else {
      // Queue message for later
      const queued: QueuedMessage = {
        id: `temp-${Date.now()}`,
        conversationId: selectedConversationId,
        type: 'text',
        content: content.trim(),
        replyToId,
        status: 'queued',
        retryCount: 0,
        createdAt: Date.now()
      };
      setMessageQueue(prev => [...prev, queued]);
    }
  }, [socket, isConnected, selectedConversationId]);

  // Send voice message
  const sendVoiceMessage = useCallback(async (audioBlob: Blob, duration: number, replyToId?: string) => {
    if (!selectedConversationId) return;

    if (socket && isConnected) {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        socket.emit('chat:send-voice', {
          conversationId: selectedConversationId,
          audioBase64: base64,
          duration,
          replyToId
        });
      };
      reader.readAsDataURL(audioBlob);
    }
  }, [socket, isConnected, selectedConversationId]);

  // Send media message (after upload)
  const sendMediaMessage = useCallback((
    type: 'image' | 'file',
    mediaUrl: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
    caption?: string,
    replyToId?: string
  ) => {
    if (!selectedConversationId || !socket || !isConnected) return;

    socket.emit('chat:send-media', {
      conversationId: selectedConversationId,
      type,
      mediaUrl,
      fileName,
      fileSize,
      mimeType,
      content: caption,
      replyToId
    });
  }, [socket, isConnected, selectedConversationId]);

  // Edit message
  const editMessage = useCallback((messageId: string, content: string) => {
    if (!selectedConversationId || !socket || !isConnected) return;

    socket.emit('chat:edit', {
      messageId,
      conversationId: selectedConversationId,
      content
    });
  }, [socket, isConnected, selectedConversationId]);

  // Delete message
  const deleteMessage = useCallback((messageId: string) => {
    if (!selectedConversationId || !socket || !isConnected) return;

    socket.emit('chat:delete', {
      messageId,
      conversationId: selectedConversationId
    });
  }, [socket, isConnected, selectedConversationId]);

  // Add reaction
  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (!selectedConversationId || !socket || !isConnected) return;

    socket.emit('chat:react', {
      messageId,
      conversationId: selectedConversationId,
      emoji
    });
  }, [socket, isConnected, selectedConversationId]);

  // Remove reaction
  const removeReaction = useCallback((messageId: string, emoji: string) => {
    if (!selectedConversationId || !socket || !isConnected) return;

    socket.emit('chat:unreact', {
      messageId,
      conversationId: selectedConversationId,
      emoji
    });
  }, [socket, isConnected, selectedConversationId]);

  // Send typing indicator (debounced)
  const sendTyping = useCallback((isTyping: boolean) => {
    if (!selectedConversationId || !socket || !isConnected) return;

    const now = Date.now();
    if (isTyping && now - lastTypingSent.current < 2000) return;
    lastTypingSent.current = now;

    socket.emit('chat:typing', {
      conversationId: selectedConversationId,
      isTyping
    });
  }, [socket, isConnected, selectedConversationId]);

  // Mark messages as read
  const markAsRead = useCallback((messageIds: string[]) => {
    if (!selectedConversationId || !socket || !isConnected || messageIds.length === 0) return;

    socket.emit('chat:mark-read', {
      conversationId: selectedConversationId,
      messageIds
    });

    // Update local state
    setConversations(prev => prev.map(c =>
      c.id === selectedConversationId ? { ...c, unreadCount: 0 } : c
    ));
  }, [socket, isConnected, selectedConversationId]);

  // Start new conversation
  const startConversation = useCallback(async (therapistId: string): Promise<string | null> => {
    console.log('[useChat] startConversation called with therapistId:', therapistId);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapistId })
      });
      console.log('[useChat] startConversation response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('[useChat] startConversation response data:', data);
        await fetchConversations();
        return data.conversation.id;
      } else {
        const errorData = await res.json();
        console.error('[useChat] startConversation error:', errorData);
      }
    } catch (err) {
      console.error('Failed to start conversation:', err);
    }
    return null;
  }, [fetchConversations]);

  // Get typing users for current conversation
  const currentTypingUsers = Array.from(typingUsers.values())
    .filter(t => t.conversationId === selectedConversationId);

  // Get selected conversation
  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;

  return {
    // State
    conversations,
    selectedConversation,
    selectedConversationId,
    messages,
    typingUsers: currentTypingUsers,
    presenceMap,
    messageQueue,
    isConnected,
    isConnecting,
    isLoading,
    error: error || socketError,

    // Actions
    fetchConversations,
    selectConversation,
    sendMessage,
    sendVoiceMessage,
    sendMediaMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    sendTyping,
    markAsRead,
    startConversation
  };
}
