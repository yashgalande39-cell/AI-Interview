const { CORS_ORIGIN } = require('./config/env');
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const { connectPG } = require('./config/pgDb');

// ── Modular SaaS Module Routes ───────────────────────────────────────────────
const authRoutes         = require('./modules/auth/auth.routes');
const interviewRoutes    = require('./modules/interview/interview.routes');
const resumeRoutes       = require('./modules/resume/resume.routes');
const gamificationRoutes = require('./modules/gamification/gamification.routes');
const codingRoutes       = require('./modules/coding/coding.routes');
const aiRoutes           = require('./modules/ai/ai.routes');
const adminRoutes         = require('./modules/admin/admin.routes');
const analyticsRoutes    = require('./modules/analytics/analytics.routes');
const treskRoutes        = require('./modules/ai/tresk.routes');
const billingRoutes      = require('./modules/billing/billing.routes');
const replayRoutes       = require('./modules/interview/replay.routes');

const app = express();
const server = http.createServer(app);

// Enable CORS (Must be registered first to ensure rate-limited or error responses include CORS headers)
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Secure Headers with Helmet
app.use(helmet());

// Global Limiter
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 });
app.use(globalLimiter);

// Stricter Auth Limiters
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many attempts, please try again later.' });
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// AI Limiter
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });
app.use('/api/ai',    aiLimiter);
app.use('/api/tresk', aiLimiter);

// Body Parsers with limits
app.use(express.json({ limit: '1mb' }));

// Diagnostic status check endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Register routes
app.use('/api/auth',              authRoutes);
app.use('/api/interviews/replay', replayRoutes); // more specific first
app.use('/api/interviews',        interviewRoutes);
app.use('/api/resumes',           resumeRoutes);
app.use('/api/gamification',      gamificationRoutes);
app.use('/api/coding',            codingRoutes);
app.use('/api/ai',                aiRoutes);
app.use('/api/admin',             adminRoutes);
app.use('/api/analytics',         analyticsRoutes);
app.use('/api/tresk',             treskRoutes);
app.use('/api/billing',           billingRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  console.error(`[${status}] ${err.message}`);
  res.status(status).json({ message: err.message || 'Internal server error' });
});

console.log('🤖 OpenRouter AI service registered on /api/ai');
console.log('🧠 TRESK Career Copilot registered on /api/tresk');
console.log('💳 Billing (Razorpay) registered on /api/billing');
console.log('📼 Interview Replay registered on /api/interviews/replay');
console.log('📈 Analytics Dashboard registered on /api/analytics');

// Socket.IO configurations for Peer-to-Peer, Collaboration, Whiteboard & Pair-coding
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
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
connectPG()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 TRESK AI Backend (PostgreSQL-backed) running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
    console.log("🔄 Starting server without database connection (endpoints requiring PostgreSQL will fail).");
    server.listen(PORT, () => {
      console.log(`🚀 TRESK AI Backend (Offline Mode) running on http://localhost:${PORT}`);
    });
  });

