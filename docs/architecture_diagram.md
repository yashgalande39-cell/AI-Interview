# System Architecture Diagrams
## Project: Ultimate AI Mock Interview Platform

This document presents the visual structure and sequence flows of the platform, built using Mermaid diagrams.

---

### 1. High-Level Component Architecture

This diagram illustrates how the frontend app, backend server, database layers, and external APIs communicate with each other.

```mermaid
graph TB
    subgraph Client [Client UI: React + Vite]
        A[App Entry / Routes]
        B[Dashboard Page]
        C[Interview Room]
        D[Coding Editor]
        E[Resume Analyzer]
        F[GD Panel]
        
        A --> B
        B --> C & D & E & F
    end

    subgraph Server [Backend App: Node + Express]
        G[Express Router]
        H[Authentication Middleware]
        I[Plan Authorization Guard]
        J[REST Controller API]
        K[Socket.IO Server]
        
        G --> H --> I --> J
    end

    subgraph RealTime [WebSocket Lobbies]
        L[GD Chat Hub]
        M[Collaborative Code Hub]
        N[WebRTC Signaling Fallback]
        
        K --> L & M & N
    end

    subgraph Data [Data Layer / Dual DB]
        O[MongoDB / Atlas Cluster]
        P[Local mock_db.json]
    end

    subgraph AI [AI Evaluation Services]
        Q[OpenRouter / Gemini Cloud API]
        R[Local AI Simulators]
    end

    %% Connections
    C & D & E & F -->|REST Requests| G
    F & D -->|WebSocket Sync| K
    J -->|Query/Save User Data| O
    J -->|Local DB Fallback| P
    J -->|Live AI Analysis| Q
    J -->|Rule-Based Feedback| R
```

---

### 2. Adaptive Voice AI Interview Sequence

This diagram shows the sequence of events during a voice mock interview session, including the dynamic difficulty adjustment loop.

```mermaid
sequenceDiagram
    autonumber
    actor Candidate
    participant FE as Frontend Client
    participant BE as Express Backend
    participant AI as AI Engine (Gemini/Mock)

    Candidate->>FE: Click "Start Interview"
    FE->>BE: GET /api/interviews/questions (initial Easy difficulty)
    BE->>AI: Generate questions for Role
    AI-->>BE: Returns question buffer
    BE-->>FE: Return questions list
    
    loop Interview Session (Question 1 to N)
        FE->>FE: SpeechSynthesis speaks the question aloud
        Candidate->>FE: Unmutes & speaks response
        FE->>FE: webkitSpeechRecognition transcribes response text
        Candidate->>FE: Click "Next Question" / timer expires
        FE->>BE: POST /api/ai/evaluate-answer (question + answer)
        BE->>AI: Evaluate response quality (0-100 score)
        AI-->>BE: Return grade + feedback
        BE->>BE: Check score. If score > 80: increase difficulty. If < 50: decrease difficulty.
        BE-->>FE: Return evaluation + next question (adjusted difficulty)
    end
    
    FE->>BE: POST /api/interviews/save (complete session logs)
    BE->>BE: Save records to DB & reward XP
    BE-->>FE: Success + final scorecard page
    FE->>Candidate: Display feedback charts, stress summary & XP earned
```

---

### 3. Collaborative Lobbies (Socket.IO + WebRTC)

This diagram shows how real-time components (Virtual Group Discussions, pair coding, whiteboard sessions) communicate between candidate client instances.

```mermaid
graph LR
    UserA[Candidate Peer A] <-->|WebRTC Signaling Link| Broker[Socket.IO Server Broker]
    UserB[Candidate Peer B] <-->|WebRTC Signaling Link| Broker
    
    subgraph Signaling Broker
        Broker
    end

    UserA -.->|P2P WebRTC Media Stream| UserB
    
    UserA -->|Socket.IO events: draw_path / code_change| Broker
    Broker -->|Broadcast socket events| UserB
```
