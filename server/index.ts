import 'dotenv/config';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocketHandlers } from './socket-handler';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData
} from '../src/lib/socket-events';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Create Socket.io server with typed events
  const io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: dev ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Ping settings for connection health
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Set up all socket event handlers
  setupSocketHandlers(io);

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io server running on /api/socketio`);
    console.log(`> Environment: ${dev ? 'development' : 'production'}`);
  });

  // Handle graceful shutdown
  const shutdown = () => {
    console.log('\n> Shutting down gracefully...');
    io.close(() => {
      console.log('> Socket.io server closed');
      server.close(() => {
        console.log('> HTTP server closed');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
});
