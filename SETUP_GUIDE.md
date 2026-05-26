# AI Mock Interview Platform - Complete Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)
7. [Features Overview](#features-overview)
8. [API Endpoints](#api-endpoints)

---

## Prerequisites

### Required Software
- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for version control) - [Download](https://git-scm.com/)

### Optional (for full features)
- **MongoDB** (local or Atlas cloud) - [Download](https://www.mongodb.com/try/download/community)
- **Google Gemini API Key** - [Get API Key](https://makersuite.google.com/app/apikey)

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 500MB free space
- **OS**: Windows 10/11, macOS 10.15+, or Linux
- **Browser**: Chrome, Firefox, or Edge (latest versions)

---

## Quick Start

### 1. Clone or Navigate to Project
```bash
cd "c:\Users\ASUS\Downloads\Ai Interview platform"
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install --legacy-peer-deps
```

### 4. Configure Environment Variables
```bash
# In backend folder, create .env file
cd ../backend
```

Create a `.env` file with the following content:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
MONGODB_URI=
GEMINI_API_KEY=
```

**Note**: Leave `MONGODB_URI` and `GEMINI_API_KEY` empty to use mock database and rule-based AI fallback.

### 5. Start Backend Server
```bash
# From backend folder
npm start
```

You should see:
```
🚀 AI Mock Interview Backend running on http://localhost:5000
```

### 6. Start Frontend (New Terminal)
```bash
# Open new terminal, navigate to frontend folder
cd "c:\Users\ASUS\Downloads\Ai Interview platform\frontend"
npm run dev
```

You should see:
```
  VITE v8.0.12  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 7. Access the Application
Open your browser and navigate to: **http://localhost:5173**

---

## Detailed Setup

### Backend Setup

#### 1. Environment Configuration

The backend supports two modes:

**Mode 1: Mock Database (No Setup Required)**
- Uses local JSON file storage
- No MongoDB needed
- Rule-based AI question generation
- Perfect for testing and development

**Mode 2: Production Mode (Optional)**
- Real MongoDB database
- Google Gemini AI integration
- Persistent data storage

To enable production mode, update `.env`:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
MONGODB_URI=mongodb://localhost:27017/ai-interview-platform
GEMINI_API_KEY=your_gemini_api_key_here
```

#### 2. MongoDB Setup (Optional)

**Option A: Local MongoDB**
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```
3. Verify connection:
   ```bash
   mongosh
   ```

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Get connection string
4. Update `.env` with connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-interview?retryWrites=true&w=majority
   ```

#### 3. Google Gemini API Setup (Optional)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the API key
5. Update `.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...your_key_here
   ```

**Benefits of Gemini Integration:**
- More natural, context-aware interview questions
- Better resume-based question personalization
- Dynamic difficulty adjustment
- Realistic interviewer responses

#### 4. Backend Dependencies Explained

```json
{
  "bcryptjs": "Password hashing",
  "cors": "Cross-origin resource sharing",
  "dotenv": "Environment variable management",
  "express": "Web server framework",
  "jsonwebtoken": "JWT authentication",
  "mongoose": "MongoDB object modeling",
  "multer": "File upload handling",
  "pdf-parse": "Resume PDF parsing",
  "socket.io": "Real-time communication"
}
```

### Frontend Setup

#### 1. Install Dependencies

```bash
cd frontend
npm install --legacy-peer-deps
```

**Note**: The `--legacy-peer-deps` flag resolves peer dependency conflicts with React 19.

#### 2. Configuration

Update `frontend/src/config.js` if needed:
```javascript
export const API_BASE = 'http://localhost:5000/api';
export const SOCKET_URL = 'http://localhost:5000';
```

#### 3. Frontend Dependencies Explained

```json
{
  "react": "UI library",
  "react-router-dom": "Client-side routing",
  "lucide-react": "Icon library",
  "recharts": "Data visualization charts",
  "framer-motion": "Animation library",
  "socket.io-client": "Real-time client",
  "tailwindcss": "Utility-first CSS framework"
}
```

---

## Configuration

### Backend Configuration Files

#### `.env` (Environment Variables)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Database (Optional - leave empty for mock mode)
MONGODB_URI=

# AI Integration (Optional - leave empty for rule-based fallback)
GEMINI_API_KEY=

# CORS (Optional)
CORS_ORIGIN=http://localhost:5173
```

#### `.env.example` (Template)
Already provided in the project. Copy this to create your `.env` file.

### Frontend Configuration

#### `vite.config.js`
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

---

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Production Build

**Build Frontend:**
```bash
cd frontend
npm run build
```

This creates optimized production files in `frontend/dist/`.

**Serve Production Build:**
```bash
npm run preview
```

### Using Concurrently (Optional)

Install concurrently to run both servers with one command:

```bash
# In project root
npm install -g concurrently

# Create package.json in root with:
{
  "scripts": {
    "dev": "concurrently \"cd backend && npm start\" \"cd frontend && npm run dev\""
  }
}

# Run both servers
npm run dev
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

Or change port in `.env`:
```env
PORT=5001
```

#### 2. Module Not Found

**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. CORS Errors

**Error**: `Access to fetch at 'http://localhost:5000' has been blocked by CORS policy`

**Solution**: Ensure backend CORS is configured correctly in `backend/src/index.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

#### 4. MongoDB Connection Failed

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution**:
- Check if MongoDB is running
- Verify connection string in `.env`
- Or leave `MONGODB_URI` empty to use mock database

#### 5. Gemini API Errors

**Error**: `API key not valid`

**Solution**:
- Verify API key is correct
- Check API quota limits
- Or leave `GEMINI_API_KEY` empty to use rule-based fallback

#### 6. Speech Recognition Not Working

**Issue**: Voice input not capturing speech

**Solution**:
- Use Chrome or Edge (best support for Web Speech API)
- Grant microphone permissions
- Check browser console for errors
- Ensure HTTPS in production (required for getUserMedia)

#### 7. Webcam Not Detected

**Issue**: Camera feed not showing

**Solution**:
- Grant camera permissions in browser
- Check if camera is being used by another application
- Try different browser
- Check browser console for errors

#### 8. npm install Fails

**Error**: Peer dependency conflicts

**Solution**:
```bash
# Frontend
npm install --legacy-peer-deps

# Backend
npm install --force
```

---

## Features Overview

### 1. Authentication System
- **Register**: Create new account with email/password
- **Login**: JWT-based authentication
- **Mock Mode**: Auto-login as demo user

**Test Credentials (Mock Mode)**:
- Email: `demo@example.com`
- Password: `password123`

### 2. Interview Types

#### HR Interview
- Behavioral questions
- Communication skills assessment
- Cultural fit evaluation
- Resume-based personalization

#### Technical Interview
- System design questions
- Architecture discussions
- Technology deep-dives
- Problem-solving scenarios

#### Behavioral Interview
- STAR method questions
- Conflict resolution
- Leadership scenarios
- Team collaboration

#### Coding Interview
- DSA challenges (Arrays, Strings, Trees, Graphs, etc.)
- Multiple difficulty levels (Easy, Medium, Hard)
- Real-time code execution (JavaScript VM)
- Test case validation

### 3. Voice AI Features

**Speech Recognition**:
- Real-time voice-to-text conversion
- Continuous listening mode
- Automatic transcript generation

**Text-to-Speech**:
- AI interviewer speaks questions
- Natural voice synthesis
- Adjustable speaking rate

**Analysis Metrics**:
- Words per minute (WPM)
- Filler word detection (um, uh, like, etc.)
- Fluency score calculation
- Speaking pace optimization

### 4. Webcam Analysis

**Gaze Tracking**:
- Eye contact monitoring
- Gaze drift detection
- Alignment scoring

**Stress Detection**:
- Motion analysis
- Brightness monitoring
- Stress level calculation
- Emotion recognition (Neutral, Focused, Confident, Anxious)

**Biometric Overlay**:
- Real-time cybernetic visualization
- Heart rate simulation
- ECG wave display
- Low-light warnings

### 5. Adaptive Difficulty

The platform dynamically adjusts question difficulty based on performance:
- Score ≥85%: Increase difficulty (Easy → Medium → Hard)
- Score <50%: Decrease difficulty (Hard → Medium → Easy)
- Real-time adaptation during interview

### 6. Coding Sandbox

**Features**:
- Multi-language support (JavaScript, Python, C++, Java)
- Syntax highlighting
- Code templates
- Draft auto-save (localStorage)
- Test case execution
- Performance metrics

**Supported Topics**:
- Arrays, Strings, Linked Lists
- Trees, Graphs, Dynamic Programming
- Stacks, Queues, Heaps
- Binary Search, Sorting, Recursion
- And 20+ more topics

**Company Tags**:
- Google, Meta, Amazon, Microsoft
- Netflix, Apple, Uber, Stripe
- TCS, Infosys, and more

### 7. Resume Analyzer

**Upload Formats**: PDF, DOCX

**Analysis Features**:
- Skill extraction
- Project identification
- Experience parsing
- Education details
- ATS compatibility score
- Keyword matching

**Resume-Based Questions**:
- Personalized interview questions
- Project deep-dives
- Skill verification
- Experience validation

### 8. Gamification System

**XP Points**:
- Interview completion: 150 XP
- Coding challenge: 200 XP
- Daily challenges: 50-150 XP
- Bonus for excellence: +50 XP

**Badges**:
- Coding Master
- Interview Scholar
- Placement Ready
- Experienced Prep

**Leaderboards**:
- Global rankings
- Weekly competitions
- Friend comparisons

**Streaks**:
- Daily practice tracking
- Streak bonuses
- Motivation system

### 9. Analytics Dashboard

**Performance Metrics**:
- Overall readiness score
- Monthly progress charts
- 6-axis skill radar
- Interview history log
- Weak topic identification

**Visualizations**:
- Area charts (score trends)
- Radar charts (skill balance)
- Bar charts (category performance)
- Speedometer gauges

### 10. Group Discussion

**Features**:
- 4 AI avatars
- Real-time debate simulation
- Turn-based responses
- Topic variety
- Performance scoring

### 11. Whiteboard

**Drawing Tools**:
- Freehand pen
- Shapes (rectangle, circle, line)
- Text annotations
- Eraser
- Color selection

**Use Cases**:
- System design diagrams
- Algorithm visualization
- Architecture sketches
- Flowcharts

### 12. Telephony Mode

**Mobile Interview Simulation**:
- Phone call interface
- Audio-only mode
- DTMF keypad
- Call controls (mute, speaker)
- Visual captions

### 13. Anti-Cheat System

**Monitoring**:
- Tab focus tracking
- Strike system (3 warnings)
- Copy-paste blocking (coding)
- Auto-submission on violations

**Warnings**:
- Visual alerts
- Strike counter
- Session termination

---

## API Endpoints

### Authentication

```
POST   /api/auth/register          - Create new account
POST   /api/auth/login             - User login
POST   /api/auth/logout            - User logout
GET    /api/auth/me                - Get current user
```

### Interviews

```
POST   /api/interviews/generate    - Create interview session
POST   /api/interviews/submit-answer - Submit answer
POST   /api/interviews/finish      - Complete session
GET    /api/interviews/history     - Get user history
GET    /api/interviews/session/:id - Get session details
```

### Coding Challenges

```
GET    /api/coding/challenges      - List challenges (with filters)
GET    /api/coding/challenges/:id  - Get challenge details
POST   /api/coding/run             - Run code (test)
POST   /api/coding/submit          - Submit solution
```

### Resumes

```
POST   /api/resumes/upload         - Upload resume
GET    /api/resumes                - List user resumes
GET    /api/resumes/:id            - Get resume details
DELETE /api/resumes/:id            - Delete resume
POST   /api/resumes/analyze        - Analyze resume
```

### Gamification

```
GET    /api/gamification/challenges - Get daily challenges
POST   /api/gamification/complete-challenge - Complete challenge
GET    /api/gamification/leaderboard - Get leaderboard
GET    /api/gamification/profile   - Get user profile
```

### System

```
GET    /api/status                 - Health check
```

---

## Socket.IO Events

### Client → Server

```javascript
// Room Management
socket.emit('join_room', roomId)

// Group Discussion
socket.emit('gd_message', { roomId, sender, text, avatar })

// Collaborative Coding
socket.emit('code_change', { roomId, code, language })

// Whiteboard
socket.emit('draw_path', { roomId, drawData })
socket.emit('clear_canvas', roomId)

// WebRTC Signaling
socket.emit('signal', { roomId, signalData })
```

### Server → Client

```javascript
// Room Events
socket.on('peer_joined', ({ socketId }) => {})
socket.on('peer_left', ({ socketId }) => {})

// Group Discussion
socket.on('gd_message_receive', ({ sender, text, avatar }) => {})

// Collaborative Coding
socket.on('code_update', ({ code, language }) => {})

// Whiteboard
socket.on('draw_update', ({ drawData }) => {})
socket.on('canvas_cleared', () => {})

// WebRTC Signaling
socket.on('signal_receive', ({ signalData, senderId }) => {})
```

---

## Browser Compatibility

### Recommended Browsers

| Feature | Chrome | Firefox | Edge | Safari |
|---------|--------|---------|------|--------|
| Voice Recognition | ✅ | ❌ | ✅ | ✅ |
| Text-to-Speech | ✅ | ✅ | ✅ | ✅ |
| Webcam Access | ✅ | ✅ | ✅ | ✅ |
| Canvas Rendering | ✅ | ✅ | ✅ | ✅ |
| Socket.IO | ✅ | ✅ | ✅ | ✅ |
| WebRTC | ✅ | ✅ | ✅ | ⚠️ |

**Best Experience**: Chrome or Edge (Chromium-based)

---

## Performance Tips

### 1. Optimize Development Experience

**Enable Hot Module Replacement (HMR)**:
Already configured in Vite. Changes reflect instantly without full reload.

**Reduce Bundle Size**:
```bash
# Analyze bundle
npm run build -- --analyze
```

### 2. Database Performance

**Mock Database**:
- Fast startup
- No external dependencies
- Perfect for development

**MongoDB**:
- Use indexes for frequent queries
- Limit result sets
- Use projection to fetch only needed fields

### 3. Memory Management

**Clear Browser Cache**:
- DevTools → Application → Clear Storage

**Monitor Memory**:
- DevTools → Performance → Memory

### 4. Network Optimization

**Reduce API Calls**:
- Use caching
- Batch requests
- Implement debouncing

---

## Development Workflow

### 1. Making Changes

**Backend Changes**:
1. Edit files in `backend/src/`
2. Server auto-restarts (if using nodemon)
3. Test API with Postman or browser

**Frontend Changes**:
1. Edit files in `frontend/src/`
2. HMR updates browser instantly
3. Check browser console for errors

### 2. Adding New Features

**Backend**:
```
backend/src/
├── controllers/    - Business logic
├── routes/         - API endpoints
├── models/         - Database schemas
├── middleware/     - Auth, validation
└── config/         - Configuration
```

**Frontend**:
```
frontend/src/
├── pages/          - Route components
├── components/     - Reusable UI
├── context/        - State management
└── config.js       - API configuration
```

### 3. Testing

**Manual Testing**:
1. Register new account
2. Complete interview session
3. Try coding challenge
4. Upload resume
5. Check analytics

**API Testing**:
Use Postman or curl:
```bash
# Health check
curl http://localhost:5000/api/status

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

---

## Data Storage

### Mock Database Location

```
backend/data/mock_db.json
```

**Structure**:
```json
{
  "users": [],
  "interviews": [],
  "resumes": [],
  "questions": [],
  "leaderboard": [],
  "challenges": []
}
```

### DSA Questions

```
backend/data/dsa_questions.json
```

Contains 100+ coding challenges with:
- Problem descriptions
- Test cases
- Code templates
- Difficulty levels
- Company tags

### Aptitude Questions

```
backend/data/aptitude_questions.json
```

Contains multiple-choice questions for:
- Quantitative aptitude
- Logical reasoning
- Verbal ability

---

## Security Considerations

### Development Mode

**Current Security**:
- JWT authentication
- Password hashing (bcrypt)
- CORS enabled
- Basic input sanitization

**Limitations**:
- Open CORS (origin: '*')
- No rate limiting
- No HTTPS
- Mock database has no access control

### Production Recommendations

1. **Enable HTTPS**: Required for webcam/microphone access
2. **Restrict CORS**: Whitelist specific domains
3. **Add Rate Limiting**: Prevent abuse
4. **Use Environment Variables**: Never commit secrets
5. **Enable MongoDB Authentication**: Secure database access
6. **Implement Input Validation**: Prevent injection attacks
7. **Add Security Headers**: Use Helmet.js
8. **Regular Updates**: Keep dependencies current

---

## Next Steps

### Immediate Actions

1. ✅ **Run the application locally**
2. ✅ **Test all features**
3. ✅ **Customize branding** (colors, logos, text)
4. ✅ **Add your own questions** to the database

### Short-term Improvements

1. **Set up MongoDB** for persistent storage
2. **Get Gemini API key** for better AI questions
3. **Add more coding challenges**
4. **Customize interview types**
5. **Improve UI/UX** based on feedback

### Long-term Goals

1. **Deploy to cloud** (Vercel, Netlify, AWS)
2. **Implement production features** (from requirements doc)
3. **Add payment integration** for premium features
4. **Build mobile app** (React Native)
5. **Scale infrastructure** for multiple users

---

## Support & Resources

### Documentation

- **React**: https://react.dev/
- **Express**: https://expressjs.com/
- **Socket.IO**: https://socket.io/docs/
- **MongoDB**: https://www.mongodb.com/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs

### Community

- **GitHub Issues**: Report bugs and request features
- **Stack Overflow**: Get help from community
- **Discord/Slack**: Join developer communities

### Learning Resources

- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **WebRTC**: https://webrtc.org/getting-started/overview
- **Canvas API**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

---

## License

This project is for educational and personal use. Ensure compliance with third-party service terms (Google Gemini, MongoDB, etc.) when deploying to production.

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Voice AI interview simulator
- ✅ Adaptive difficulty system
- ✅ Webcam gaze tracking
- ✅ Coding sandbox with VM execution
- ✅ Resume analyzer
- ✅ Gamification system
- ✅ Group discussion simulator
- ✅ Whiteboard collaboration
- ✅ Telephony mode
- ✅ Anti-cheat mechanisms
- ✅ Mock database fallback

### Planned Features (v2.0.0)
- 🔄 Real MongoDB integration
- 🔄 Enhanced authentication
- 🔄 WebRTC video/audio
- 🔄 Interview recording
- 🔄 Advanced analytics
- 🔄 Payment integration
- 🔄 Mobile responsiveness
- 🔄 Deployment infrastructure

---

## Conclusion

You now have a fully functional AI Mock Interview Platform running locally! 

**Quick Start Reminder**:
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev

# Open browser
http://localhost:5173
```

**Need Help?**
- Check the Troubleshooting section
- Review browser console for errors
- Verify all dependencies are installed
- Ensure ports 5000 and 5173 are available

Happy interviewing! 🚀
