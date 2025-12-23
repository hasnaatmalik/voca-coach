import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  ChatMessage as SocketChatMessage,
  ChatReaction as SocketChatReaction,
  PresenceData
} from '../src/lib/socket-events';
import { ROOM_NAMES } from '../src/lib/socket-events';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'voca-coach-secret-key';

// In-memory presence store (for quick lookups)
const presenceStore = new Map<string, PresenceData>();

// Crisis resources for alerts
const CRISIS_RESOURCES = [
  { name: '988 Suicide & Crisis Lifeline', contact: '988', description: '24/7 support for people in distress', url: 'https://988lifeline.org' },
  { name: 'Crisis Text Line', contact: 'Text HOME to 741741', description: 'Free 24/7 text support', url: 'https://www.crisistextline.org' },
  { name: 'Emergency Services', contact: '911', description: 'For immediate danger' }
];

// Simple crisis keyword detection (matches existing pattern)
function detectCrisisLevel(text: string): { level: string | null; category: string | null } {
  const lowerText = text.toLowerCase();

  const criticalPatterns = [
    /\b(kill|end|take)\s*(my|own)?\s*(life|self)\b/i,
    /\bsuicide\b/i,
    /\bwant\s*to\s*die\b/i,
    /\bend\s*it\s*all\b/i
  ];

  const highPatterns = [
    /\bhurt\s*(my)?self\b/i,
    /\bself[\s-]?harm\b/i,
    /\bno\s*hope\b/i,
    /\bhopeless\b/i
  ];

  for (const pattern of criticalPatterns) {
    if (pattern.test(lowerText)) {
      return { level: 'critical', category: 'suicidal_ideation' };
    }
  }

  for (const pattern of highPatterns) {
    if (pattern.test(lowerText)) {
      return { level: 'high', category: 'self_harm' };
    }
  }

  return { level: null, category: null };
}

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type TypedIO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  isTherapist: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

// Authenticate socket connection
async function authenticateSocket(socket: TypedSocket): Promise<SocketData | null> {
  try {
    // Get token from handshake auth or query
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token || typeof token !== 'string') {
      console.log('Socket auth failed: No token provided');
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Get user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, isTherapist: true }
    });

    if (!user) {
      console.log('Socket auth failed: User not found');
      return null;
    }

    return {
      userId: user.id,
      userName: user.name,
      isTherapist: user.isTherapist
    };
  } catch (error) {
    console.log('Socket auth failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export function setupSocketHandlers(io: TypedIO) {
  // Authentication middleware
  io.use(async (socket, next) => {
    const userData = await authenticateSocket(socket);

    if (!userData) {
      return next(new Error('Authentication failed'));
    }

    socket.data = userData;
    next();
  });

  io.on('connection', async (socket) => {
    const { userId, userName, isTherapist } = socket.data;
    console.log(`User connected: ${userName} (${userId}), isTherapist: ${isTherapist}`);

    // Automatically join user's personal room for notifications
    socket.join(ROOM_NAMES.user(userId));

    // Set user as online
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: true, lastActiveAt: new Date() }
      });

      const presenceData: PresenceData = {
        userId,
        userName,
        status: 'online',
        lastSeen: new Date().toISOString()
      };
      presenceStore.set(userId, presenceData);
      io.emit('presence:changed', presenceData);
    } catch (error) {
      console.error('Error setting online status:', error);
    }

    // =====================================
    // ROOM MANAGEMENT
    // =====================================

    socket.on('join:user-room', () => {
      socket.join(ROOM_NAMES.user(userId));
    });

    socket.on('join:session', (sessionId) => {
      const room = ROOM_NAMES.session(sessionId);
      socket.join(room);
      console.log(`${userName} joined session room: ${sessionId}`);

      // Notify others in the room
      socket.to(room).emit('webrtc:peer-joined', {
        sessionId,
        peerId: socket.id,
        peerName: userName,
        isTherapist
      });
    });

    socket.on('leave:session', (sessionId) => {
      const room = ROOM_NAMES.session(sessionId);
      socket.leave(room);
      console.log(`${userName} left session room: ${sessionId}`);

      // Notify others
      socket.to(room).emit('webrtc:peer-left', {
        sessionId,
        peerId: socket.id
      });
    });

    socket.on('join:conversation', (conversationId) => {
      socket.join(ROOM_NAMES.conversation(conversationId));
    });

    socket.on('leave:conversation', (conversationId) => {
      socket.leave(ROOM_NAMES.conversation(conversationId));
    });

    // =====================================
    // CHAT EVENTS
    // =====================================

    // Helper to format message for socket emission
    const formatMessageForSocket = async (message: {
      id: string;
      conversationId: string;
      senderId: string;
      content: string | null;
      type: string;
      mediaUrl: string | null;
      mediaDuration: number | null;
      mediaSize: number | null;
      fileName: string | null;
      mimeType: string | null;
      transcript: string | null;
      sentiment: string | null;
      crisisLevel: string | null;
      replyToId: string | null;
      isEdited: boolean;
      createdAt: Date;
      updatedAt: Date;
    }, senderName: string): Promise<SocketChatMessage> => {
      let replyToPreview = undefined;
      if (message.replyToId) {
        const replyTo = await prisma.chatMessage.findUnique({
          where: { id: message.replyToId },
          include: { conversation: { include: { student: true, therapist: true } } }
        });
        if (replyTo) {
          const replySender = replyTo.senderId === replyTo.conversation.studentId
            ? replyTo.conversation.student
            : replyTo.conversation.therapist;
          replyToPreview = {
            id: replyTo.id,
            content: replyTo.content,
            senderName: replySender.name,
            type: replyTo.type
          };
        }
      }

      // Get reactions
      const reactions = await prisma.chatReaction.findMany({
        where: { messageId: message.id },
        include: { message: { include: { conversation: { include: { student: true, therapist: true } } } } }
      });

      return {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName,
        content: message.content,
        type: message.type as 'text' | 'voice' | 'image' | 'file',
        mediaUrl: message.mediaUrl || undefined,
        mediaDuration: message.mediaDuration || undefined,
        mediaSize: message.mediaSize || undefined,
        fileName: message.fileName || undefined,
        mimeType: message.mimeType || undefined,
        transcript: message.transcript || undefined,
        sentiment: message.sentiment || undefined,
        crisisLevel: message.crisisLevel || undefined,
        replyToId: message.replyToId || undefined,
        replyToPreview,
        isEdited: message.isEdited,
        reactions: reactions.map(r => ({
          id: r.id,
          messageId: r.messageId,
          userId: r.userId,
          userName: '', // Will be populated if needed
          emoji: r.emoji,
          createdAt: r.createdAt.toISOString()
        })),
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString()
      };
    };

    // Send text message
    socket.on('chat:send', async ({ conversationId, content, replyToId }) => {
      try {
        // Check for crisis keywords
        const crisis = detectCrisisLevel(content);

        // Save message to database
        const message = await prisma.chatMessage.create({
          data: {
            conversationId,
            senderId: userId,
            content,
            type: 'text',
            replyToId,
            crisisLevel: crisis.level
          }
        });

        // Update conversation timestamp
        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() }
        });

        // Format and broadcast message
        const formattedMessage = await formatMessageForSocket(message, userName);
        io.to(ROOM_NAMES.conversation(conversationId)).emit('chat:message', formattedMessage);

        // If crisis detected, emit alert and notify therapist
        if (crisis.level && (crisis.level === 'critical' || crisis.level === 'high')) {
          const conversation = await prisma.chatConversation.findUnique({
            where: { id: conversationId }
          });

          if (conversation) {
            // Emit crisis alert to conversation
            io.to(ROOM_NAMES.conversation(conversationId)).emit('chat:crisis-alert', {
              messageId: message.id,
              conversationId,
              riskLevel: crisis.level as 'low' | 'medium' | 'high' | 'critical',
              category: crisis.category || undefined,
              resources: CRISIS_RESOURCES
            });

            // Notify therapist via personal room
            io.to(ROOM_NAMES.user(conversation.therapistId)).emit('notification:new', {
              id: `crisis-${message.id}`,
              type: 'crisis_alert',
              title: 'Crisis Alert',
              message: `${userName} may be in crisis. Immediate attention needed.`,
              data: JSON.stringify({ conversationId, messageId: message.id, riskLevel: crisis.level }),
              createdAt: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Error sending chat message:', error);
      }
    });

    // Send voice message
    socket.on('chat:send-voice', async ({ conversationId, audioBase64, duration, replyToId }) => {
      try {
        // Create uploads directory if needed
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'chat', conversationId);
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const fileName = `voice-${Date.now()}.webm`;
        const filePath = path.join(uploadDir, fileName);
        const mediaUrl = `/uploads/chat/${conversationId}/${fileName}`;

        // Save audio file
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        await writeFile(filePath, audioBuffer);

        // Create message in database
        const message = await prisma.chatMessage.create({
          data: {
            conversationId,
            senderId: userId,
            type: 'voice',
            mediaUrl,
            mediaDuration: duration,
            mediaSize: audioBuffer.length,
            mimeType: 'audio/webm',
            replyToId
          }
        });

        // Update conversation timestamp
        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() }
        });

        // Format and broadcast message
        const formattedMessage = await formatMessageForSocket(message, userName);
        io.to(ROOM_NAMES.conversation(conversationId)).emit('chat:message', formattedMessage);

        // Queue transcription async (will update message and emit when ready)
        // Note: Actual transcription is done via API route, this is just the initial message
      } catch (error) {
        console.error('Error sending voice message:', error);
      }
    });

    // Send media message (image/file)
    socket.on('chat:send-media', async ({ conversationId, type, mediaUrl, fileName, fileSize, mimeType, content, replyToId }) => {
      try {
        const message = await prisma.chatMessage.create({
          data: {
            conversationId,
            senderId: userId,
            content: content || null,
            type,
            mediaUrl,
            fileName,
            mediaSize: fileSize,
            mimeType,
            replyToId
          }
        });

        // Update conversation timestamp
        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() }
        });

        // Format and broadcast message
        const formattedMessage = await formatMessageForSocket(message, userName);
        io.to(ROOM_NAMES.conversation(conversationId)).emit('chat:message', formattedMessage);
      } catch (error) {
        console.error('Error sending media message:', error);
      }
    });

    // Edit message
    socket.on('chat:edit', async ({ messageId, conversationId, content }) => {
      try {
        const message = await prisma.chatMessage.findUnique({
          where: { id: messageId }
        });

        if (!message || message.senderId !== userId) {
          return; // Can only edit own messages
        }

        await prisma.chatMessage.update({
          where: { id: messageId },
          data: { content, isEdited: true }
        });

        io.to(ROOM_NAMES.conversation(conversationId)).emit('chat:message-edited', {
          messageId,
          conversationId,
          content,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error editing message:', error);
      }
    });

    // Delete message
    socket.on('chat:delete', async ({ messageId, conversationId }) => {
      try {
        const message = await prisma.chatMessage.findUnique({
          where: { id: messageId }
        });

        if (!message || message.senderId !== userId) {
          return; // Can only delete own messages
        }

        await prisma.chatMessage.update({
          where: { id: messageId },
          data: { isDeleted: true, content: null }
        });

        io.to(ROOM_NAMES.conversation(conversationId)).emit('chat:message-deleted', {
          messageId,
          conversationId
        });
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    });

    // Add reaction
    socket.on('chat:react', async ({ messageId, conversationId, emoji }) => {
      try {
        const reaction = await prisma.chatReaction.upsert({
          where: {
            messageId_userId_emoji: { messageId, userId, emoji }
          },
          create: { messageId, userId, emoji },
          update: {} // No update needed, just ensuring it exists
        });

        io.to(ROOM_NAMES.conversation(conversationId)).emit('chat:reaction-added', {
          messageId,
          conversationId,
          reaction: {
            id: reaction.id,
            messageId: reaction.messageId,
            userId: reaction.userId,
            userName,
            emoji: reaction.emoji,
            createdAt: reaction.createdAt.toISOString()
          }
        });
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
    });

    // Remove reaction
    socket.on('chat:unreact', async ({ messageId, conversationId, emoji }) => {
      try {
        await prisma.chatReaction.delete({
          where: {
            messageId_userId_emoji: { messageId, userId, emoji }
          }
        });

        io.to(ROOM_NAMES.conversation(conversationId)).emit('chat:reaction-removed', {
          messageId,
          conversationId,
          userId,
          emoji
        });
      } catch (error) {
        console.error('Error removing reaction:', error);
      }
    });

    // Typing indicator
    socket.on('chat:typing', ({ conversationId, isTyping }) => {
      socket.to(ROOM_NAMES.conversation(conversationId)).emit('chat:typing', {
        conversationId,
        userId,
        userName,
        isTyping
      });
    });

    // Mark messages as read
    socket.on('chat:mark-read', async ({ conversationId, messageIds }) => {
      try {
        const now = new Date();
        await prisma.chatMessage.updateMany({
          where: {
            id: { in: messageIds },
            conversationId,
            senderId: { not: userId } // Only mark others' messages as read
          },
          data: { readAt: now }
        });

        socket.to(ROOM_NAMES.conversation(conversationId)).emit('chat:read', {
          conversationId,
          messageIds,
          readAt: now.toISOString(),
          readBy: userId
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // =====================================
    // PRESENCE EVENTS
    // =====================================

    socket.on('presence:update', async ({ status }) => {
      try {
        // Update user in database
        // Note: Client presence updates only support 'online' | 'away' | 'busy'
        // 'offline' is handled by disconnect, so isOnline is always true here
        await prisma.user.update({
          where: { id: userId },
          data: {
            isOnline: true,
            lastActiveAt: new Date()
          }
        });

        // Update presence store
        const presenceData: PresenceData = {
          userId,
          userName,
          status,
          lastSeen: new Date().toISOString()
        };
        presenceStore.set(userId, presenceData);

        // Broadcast presence change to all connected clients
        io.emit('presence:changed', presenceData);
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    });

    socket.on('presence:get', async ({ userIds }) => {
      try {
        const presenceList: PresenceData[] = [];
        for (const uid of userIds) {
          const cached = presenceStore.get(uid);
          if (cached) {
            presenceList.push(cached);
          } else {
            const user = await prisma.user.findUnique({
              where: { id: uid },
              select: { id: true, name: true, isOnline: true, lastActiveAt: true }
            });
            if (user) {
              presenceList.push({
                userId: user.id,
                userName: user.name,
                status: user.isOnline ? 'online' : 'offline',
                lastSeen: user.lastActiveAt?.toISOString()
              });
            }
          }
        }
        socket.emit('presence:bulk', presenceList);
      } catch (error) {
        console.error('Error getting presence:', error);
      }
    });

    // =====================================
    // WEBRTC SIGNALING
    // =====================================

    socket.on('webrtc:offer', ({ sessionId, offer }) => {
      socket.to(ROOM_NAMES.session(sessionId)).emit('webrtc:offer', {
        sessionId,
        offer,
        peerId: socket.id
      });
    });

    socket.on('webrtc:answer', ({ sessionId, answer }) => {
      socket.to(ROOM_NAMES.session(sessionId)).emit('webrtc:answer', {
        sessionId,
        answer,
        peerId: socket.id
      });
    });

    socket.on('webrtc:ice-candidate', ({ sessionId, candidate }) => {
      socket.to(ROOM_NAMES.session(sessionId)).emit('webrtc:ice-candidate', {
        sessionId,
        candidate,
        peerId: socket.id
      });
    });

    socket.on('webrtc:media-state', ({ sessionId, audio, video }) => {
      socket.to(ROOM_NAMES.session(sessionId)).emit('webrtc:peer-media-state', {
        sessionId,
        peerId: socket.id,
        audio,
        video
      });
    });

    socket.on('webrtc:request-offer', ({ sessionId }) => {
      // Request the other peer to send a new offer (for reconnection)
      socket.to(ROOM_NAMES.session(sessionId)).emit('webrtc:peer-joined', {
        sessionId,
        peerId: socket.id,
        peerName: userName,
        isTherapist
      });
    });

    // =====================================
    // SESSION CONTROLS
    // =====================================

    socket.on('session:start', async (sessionId) => {
      try {
        await prisma.therapySession.update({
          where: { id: sessionId },
          data: {
            status: 'in_progress',
            actualStartTime: new Date()
          }
        });

        io.to(ROOM_NAMES.session(sessionId)).emit('session:started', { sessionId });
      } catch (error) {
        console.error('Error starting session:', error);
      }
    });

    socket.on('session:end', async (sessionId) => {
      try {
        await prisma.therapySession.update({
          where: { id: sessionId },
          data: {
            status: 'completed',
            actualEndTime: new Date()
          }
        });

        io.to(ROOM_NAMES.session(sessionId)).emit('session:ended', {
          sessionId,
          endedBy: userName
        });
      } catch (error) {
        console.error('Error ending session:', error);
      }
    });

    socket.on('session:start-recording', (sessionId) => {
      io.to(ROOM_NAMES.session(sessionId)).emit('session:recording-started', { sessionId });
    });

    socket.on('session:stop-recording', (sessionId) => {
      io.to(ROOM_NAMES.session(sessionId)).emit('session:recording-stopped', { sessionId });
    });

    // =====================================
    // DISCONNECT
    // =====================================

    socket.on('disconnect', async (reason) => {
      console.log(`User disconnected: ${userName} (${userId}), reason: ${reason}`);

      // Update presence
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            isOnline: false,
            lastActiveAt: new Date()
          }
        });

        const presenceData: PresenceData = {
          userId,
          userName,
          status: 'offline',
          lastSeen: new Date().toISOString()
        };
        presenceStore.set(userId, presenceData);
        io.emit('presence:changed', presenceData);
      } catch (error) {
        console.error('Error updating presence on disconnect:', error);
      }

      // Notify all session rooms this user was in
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room.startsWith('session:')) {
          const sessionId = room.replace('session:', '');
          socket.to(room).emit('webrtc:peer-left', {
            sessionId,
            peerId: socket.id
          });
        }
      });
    });
  });

  console.log('Socket handlers initialized');
}

// Helper function to send notification to a specific user
export async function sendNotificationToUser(
  io: TypedIO,
  userId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }
) {
  try {
    // Save to database
    const saved = await prisma.notification.create({
      data: {
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data ? JSON.stringify(notification.data) : null
      }
    });

    // Send via socket
    io.to(ROOM_NAMES.user(userId)).emit('notification:new', {
      id: saved.id,
      type: saved.type,
      title: saved.title,
      message: saved.message,
      data: saved.data || undefined,
      createdAt: saved.createdAt.toISOString()
    });

    return saved;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
