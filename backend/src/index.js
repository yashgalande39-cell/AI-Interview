require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({
  origin: '*', // open for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json());

// Diagnostic status check endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/gamification', gamificationRoutes);

// Socket.IO configurations for Peer-to-Peer, Collaboration, Whiteboard & Pair-coding
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Room Lobby Management
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`👤 Client ${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit('peer_joined', { socketId: socket.id });
  });

  // Real-time Group Discussion message relay between peers
  socket.on('gd_message', ({ roomId, sender, text, avatar }) => {
    socket.to(roomId).emit('gd_message_receive', { sender, text, avatar });
  });

  // Collaborative Coding synchronization
  socket.on('code_change', ({ roomId, code, language }) => {
    socket.to(roomId).emit('code_update', { code, language });
  });

  // Whiteboard drawing synchronizations
  socket.on('draw_path', ({ roomId, drawData }) => {
    socket.to(roomId).emit('draw_update', { drawData });
  });

  socket.on('clear_canvas', (roomId) => {
    socket.to(roomId).emit('canvas_cleared');
  });

  // Peer-to-peer signalling relay (WebRTC simple signaling broker fallback)
  socket.on('signal', ({ roomId, signalData }) => {
    socket.to(roomId).emit('signal_receive', { signalData, senderId: socket.id });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Boot Database and Listen
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 AI Mock Interview Backend running on http://localhost:${PORT}`);
  });
});
