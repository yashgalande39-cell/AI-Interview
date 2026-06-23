# Technology Stack Documentation
## Project: Ultimate AI Mock Interview Platform

This document describes the design decisions, languages, runtime environments, libraries, frameworks, and fallback architectures of the system.

---

### 1. Architectural Layout

```
                  +-----------------------------------------+
                  |           React Frontend Client         |
                  |  (Vite + Tailwind CSS + Framer Motion)  |
                  +-----+-----------------------------+-----+
                        |                             ^
                        | REST HTTP                   | WebSocket Sync
                        v                             v
                  +-----+-----------------------------+-----+
                  |            Express Web Server           |
                  |                (Node.js)                |
                  +-----+-----------------------------+-----+
                        |                             |
     (DATABASE_URL set) |                             | (Fallback Mode)
                        v                             v
            +------------+------------+   +------------+------------+
            |         PostgreSQL      |   |        Demo Mode        |
            |   (pg Pool Connection)  |   |    (In-memory Stubs)    |
            +-------------------------+   +-------------------------+
```

---

### 2. Frontend Layer (Client Application)

The client is a single-page application built on **React** and compiled via **Vite**.

#### 2.1 Core Technologies
- **React 19**: Responsive component library for application UI.
- **Vite 8**: Frontend compiler and hot module replacement dev server.
- **Tailwind CSS**: Core styling engine with premium dark mode integrations, customized grid patterns, and glassmorphic panels.

#### 2.2 Key Libraries & UI Toolkits
- **Framer Motion**: Leveraged for premium micro-animations (cards hover, sliders, avatar talks, sidebars toggling).
- **Recharts**: Builds SVGs to display analytics dashboards, performance scores, stress reports, and leaderboards.
- **Lucide React**: Vector icons used consistently throughout the navigation, buttons, and badges.
- **Socket.IO Client**: Integrates client-side WebSocket listeners for Group Discussions and pair coding.

#### 2.3 Browser API Integration
- **Web Speech API**:
  - `webkitSpeechRecognition` captures user audio responses and transcribes them.
  - `SpeechSynthesis` translates text question buffers into audio output.
- **Canvas API & WebRTC Coordinates**:
  - Uses `navigator.mediaDevices.getUserMedia` for candidate webcams.
  - Draws glowing mesh overlays on a canvas element based on facial orientation coordinates.

---

### 3. Backend Layer (Server Application)

The backend is built as a RESTful and event-driven **Node.js** app using **Express** and **Socket.IO**.

#### 3.1 Core Engines
- **Express.js**: Exposes authentication, AI generation, and sandbox testing routes.
- **Socket.IO**: Handles real-time WebSockets synchronization, WebRTC signaling fallbacks, and pair-programming lobbies.
- **PDF-Parse**: Extract text from resume uploads to prepare content buffers for ATS matching algorithms.

#### 3.2 Security & Authentication
- **JWT (JsonWebToken)**: Standard authentication token creation and decryption.
- **BcryptJS**: Blowfish-based password-hashing tool protecting local user records.

---

### 4. Database Layer & AI Integrations

The system operates in a **Dual-Mode** to guarantee high availability and easy local development without requiring external credentials:

#### 4.1 Dual Database Architecture
1. **Live PostgreSQL (Production/Dev)**: Connects via the `pg` pool connection helper to save users, streak counts, historical reviews, replay events, and coding submissions.
2. **Local Demo Fallbacks (Development/Fallback)**:
   - Gated behind the `ALLOW_DEMO_AUTH=true` env flag.
   - Generates mock objects and stubs to let development continue offline when the database is unavailable.

#### 4.2 Dual AI Processing Engine
1. **OpenRouter AI / Gemini Cloud**:
   - Sends prompt messages to Gemini API / OpenRouter endpoints for evaluating coding syntax, resume scoring, or generating questions.
2. **Local Rule-Based AI Simulator**:
   - In the absence of an API key, analyzes candidate feedback by calculating string overlaps, keyword occurrences, and generating random constructive critiques.
