import { createServer } from 'node:http';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

// Add a simple HTTP handler so Render can detect the service
const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Pixipush backend is running!');
});

const io = new Server(httpServer, {
  cors: {
    origin: dev ? '*' : 'https://pixipush-frontend.vercel.app',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`🟢 New client connected: ${socket.id}`);

  socket.on('join-room', ({ room, userName }) => {
    socket.join(room);
    socket.to(room).emit('user_joined', `${userName} has joined the room.`);
  });

  socket.on('message', ({ room, message, sender, time }) => {
    socket.to(room).emit('message', { sender, message, time });
  });

  socket.on('leave-room', () => {
    socket.leaveAll();
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});

// ✅ Listen on 0.0.0.0 for Render compatibility
httpServer.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${port}`);
});
