# Ultimate AI Mock Interview Platform

An extremely premium, feature-complete full-stack AI-powered mock interview training platform designed to help students master tech, coding, and HR interviews.

---

## 🚀 Key Modules & High-Fidelity Features

1. **Adaptive Voice AI Simulator**: Conducts hands-free voice interviews using standard browser `webkitSpeechRecognition` and `SpeechSynthesis`. Dynamically alters question difficulties (Easy ⇄ Hard) mid-session based on answer performance.
2. **HTML5 Gaze & Stress Canvas Analyzer**: Overlays glowing coordinate meshes on candidate webcam feeds, measuring stress percentages and tracking eye-alignment limits.
3. **Double-Panel Coding Sandbox**: Renders algorithmic challenges with active terminal execution and compilers checking outputs against multiple hidden cases.
4. **ATS Resume Scanner & Builder**: Interactive builder paired with live template printouts and automated keyword matching scans.
5. **Virtual Round-Table Group Discussions**: Arranges debates with 4 animated AI avatars conversing, commenting, and responding to candidate comments in real-time.
6. **Aptitude Quiz Engine**: Timed tests with detailed solutions, section toggles, and charts.
7. **Gamified XP Economy & Career Roadmaps**: Daily challenge checklists, streaks indicators, achievement badges ("Coding Master"), and SVG career tracks.
8. **Anti-Cheat Lock**: Focus loss blurs count strikes, copy-paste disables.
9. **Dual-Mode System**: Runs live MongoDB/Gemini cloud endpoints or falls back to robust local file-based mock databases and AI rule simulators.

---

## 📂 Directory Structure

```text
/
├── backend/                  # Express HTTP & Socket.IO server
│   ├── data/                 # JSON database fallbacks
│   ├── src/
│   │   ├── config/           # Database & WS configurations
│   │   ├── controllers/      # Auth, Adaptive interview, Resumes, Gamifications
│   │   ├── middleware/       # JWT tokens authorization & anti-cheats
│   │   └── index.js          # Entry point
│   └── package.json
└── frontend/                 # React & Vite client
    ├── src/
    │   ├── components/       # Navbars, Sidebars, Whiteboards
    │   ├── context/          # AuthState & Font Accessibility contexts
    │   ├── pages/            # Dashboard, InterviewRoom, CodingEditor, ResumeAnalyzer, GD...
    │   └── main.jsx          # Mount root
    └── package.json
```

---

## 🛠️ Step-by-Step Installation

### Prerequisites
- Node.js installed (v18+ recommended)
- Hosted PostgreSQL database (e.g. Supabase - recommended) or local PostgreSQL instance
- Optional: OpenRouter / Gemini API Keys

### 1. Setup Backend
1. Navigate to `/backend` folder:
   ```bash
   cd backend
   ```
2. Set up environmental keys. Create a `.env` file:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=super_secret_ai_interview_token
   ALLOW_DEMO_AUTH=true
   CORS_ORIGIN=http://localhost:5173

   # PostgreSQL / Supabase connection (Cloud databases require PG_SSL=true)
   DATABASE_URL=postgresql://postgres.xxx:password@aws-0-xx.pooler.supabase.com:6543/postgres
   PG_SSL=true
   ```
   *(Setting `ALLOW_DEMO_AUTH=true` enables a robust local JSON file fallback database (`backend/data/local_db.json`) and AI rule simulator when PostgreSQL or Supabase is disconnected!)*
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed the database with 5,721 Aptitude and DSA coding questions:
   ```bash
   npm run seed
   ```
5. Start backend server in development mode with nodemon hot reloading:
   ```bash
   npm run dev
   ```
   *Express server will bind to http://localhost:5000*

### 2. Setup Frontend
1. Navigate to `/frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Boot development server:
   ```bash
   npm run dev
   ```
   *Vite server will boot up and run on http://localhost:5173*

---

## 🐳 Docker Deployment

The application features full orchestration support. Spin up PostgreSQL 15 and the backend server concurrently using:
```bash
docker compose up --build
```
This automatically runs database migrations on boot. You can then run the frontend locally or connect your browser to the backend service.

---

## 🛡️ Anti-Cheat & Security Controls
- **Page Focus tracking**: Focus switching logs active strikes (maximum 3 warnings before auto-submission).
- **Disabled copy-paste**: Blocked inside coding areas.
- **Microphone validation**: Assures silent environments.
