import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData
} from '../src/lib/socket-events';
import { ROOM_NAMES } from '../src/lib/socket-events';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'voca-coach-secret-key';

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

  io.on('connection', (socket) => {
    const { userId, userName, isTherapist } = socket.data;
    console.log(`User connected: ${userName} (${userId}), isTherapist: ${isTherapist}`);

    // Automatically join user's personal room for notifications
    socket.join(ROOM_NAMES.user(userId));

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

    socket.on('chat:send', async ({ conversationId, content }) => {
      try {
        // Save message to database
        const message = await prisma.chatMessage.create({
          data: {
            conversationId,
            senderId: userId,
            content,
          }
        });

        // Update conversation timestamp
        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() }
        });

        // Broadcast to conversation room
        io.to(ROOM_NAMES.conversation(conversationId)).emit('chat:message', {
          id: message.id,
          conversationId,
          senderId: userId,
          senderName: userName,
          content,
          createdAt: message.createdAt.toISOString()
        });
      } catch (error) {
        console.error('Error sending chat message:', error);
      }
    });

    socket.on('chat:typing', ({ conversationId, isTyping }) => {
      socket.to(ROOM_NAMES.conversation(conversationId)).emit('chat:typing', {
        conversationId,
        userId,
        userName,
        isTyping
      });
    });

    socket.on('chat:mark-read', async ({ conversationId, messageIds }) => {
      try {
        await prisma.chatMessage.updateMany({
          where: {
            id: { in: messageIds },
            conversationId
          },
          data: { isRead: true }
        });

        socket.to(ROOM_NAMES.conversation(conversationId)).emit('chat:read', {
          conversationId,
          messageIds
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
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

    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${userName} (${userId}), reason: ${reason}`);

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
