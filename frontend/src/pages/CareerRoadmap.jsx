import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, Shield, Cpu, BookOpen, CheckCircle, 
  Lock, Award, ArrowUpRight, Sparkles, Loader2, Play 
} from 'lucide-react';

export default function CareerRoadmap() {
  const { user, updateXp } = useAuth();
  
  // Fields List
  const ceFields = [
    "Frontend Engineering",
    "Backend Engineering",
    "AI / Machine Learning Engineering",
    "Cybersecurity Analyst",
    "Data Engineering",
    "DevOps & Cloud Engineering",
    "Mobile App Development (iOS/Android)",
    "Embedded Systems & IoT",
    "Database Administrator (DBA)",
    "Game Development",
    "Software Testing / QA Automation"
  ];

  // Pre-configured Roadmap Data for all fields
  const [roadmaps, setRoadmaps] = useState({
    "Frontend Engineering": [
      { id: "fe_1", title: "HTML5, Semantic Structure & SEO", status: "Mastered", notes: "Use HTML5 semantic elements (header, main, nav, article, footer) rather than simple divs. Semantic structure ensures screen readers can parse content, vastly boosting accessibility and organic Google SEO page crawls." },
      { id: "fe_2", title: "Tailwind CSS & Mobile-First Layouts", status: "Mastered", notes: "Build layouts using a mobile-first utility methodology. Focus heavily on CSS Flexbox, Grid systems, and absolute positionings, optimizing animations with hardware-accelerated transforms." },
      { id: "fe_3", title: "React State Management & Global Contexts", status: "In Progress", notes: "Understand the React Virtual DOM diffing algorithm. Master local state hooks (useState, useReducer) and global providers (React Context API, Redux Toolkit) to optimize page render cycles." },
      { id: "fe_4", title: "System Design & Modern Web Vitals", status: "Locked", notes: "Optimize web performance indexes (LCP, FID, CLS). Study code-splitting methods (React.lazy), image compression overlays, static site caching, and edge CDN routing." }
    ],
    "Backend Engineering": [
      { id: "be_1", title: "REST APIs & Express Server Architectures", status: "Mastered", notes: "Build highly scalable HTTP APIs using Node.js and Express. Configure route mappings, request body parsing validation, and robust environmental controls (.env)." },
      { id: "be_2", title: "JWT & Salted Bcrypt Security", status: "Mastered", notes: "Implement secure user authentication using salted bcrypt password hashing and token-based state checking inside custom Express routing authorization middlewares." },
      { id: "be_3", title: "Database Indexing & Mongoose Schemas", status: "In Progress", notes: "Study schema validations, database relationships, and query index optimization. Understand how indexes (B-Trees) boost lookups speed by eliminating sequential scans." },
      { id: "be_4", title: "Sockets Collaboration & Cache Layers", status: "Locked", notes: "Integrate Redis cache layers to reduce DB queries and Socket.io channels to synchronize whiteboard drawings and coding keystrokes in real-time." }
    ],
    "AI / Machine Learning Engineering": [
      { id: "ai_1", title: "Python Data Pipelines & Wrangling", status: "Mastered", notes: "Master NumPy multi-dimensional arrays, Pandas wrangling transformations (lambda filters, aggregates, groupings), and data visualizations using Seaborn." },
      { id: "ai_2", title: "Supervised ML Models & Metrics", status: "In Progress", notes: "Train linear/logistic regressions, SVMs, and decision trees using Scikit-Learn. Evaluate models with precision, recall, F1-scores, and ROC-AUC curves." },
      { id: "ai_3", title: "Deep Learning Neural Networks", status: "Locked", notes: "Study backpropagation, activation layers (ReLU, Sigmoid), and prevent overfitting using dropout regularization and early stopping configurations in PyTorch." }
    ],
    "Cybersecurity Analyst": [
      { id: "cy_1", title: "Network Infrastructures & Wireshark Protocols", status: "Mastered", notes: "Understand TCP/IP layers, subnet mask routers, DNS structures, and capture raw packet logs with Wireshark to detect anomalous network requests." },
      { id: "cy_2", title: "Cryptography & SSL Handshakes", status: "In Progress", notes: "Study symmetric vs asymmetric encryption systems (AES, RSA). Master public-private keys, hashing algorithms (SHA-256), and secure SSL handshakes." },
      { id: "cy_3", title: "Penetration Testing & Linux Auditing", status: "Locked", notes: "Perform vulnerability scans, inspect cross-site scripting (XSS), SQL injections (SQLi), and audit server log directories using security-hardened Linux scripts." }
    ],
    "Data Engineering": [
      { id: "de_1", title: "SQL Queries & ETL Pipelines", status: "Mastered", notes: "Write complex SQL joins, window aggregates, and configure automated Extract-Transform-Load (ETL) flows to normalize massive dirty datasets." },
      { id: "de_2", title: "Apache Spark Big Data Clusters", status: "In Progress", notes: "Master distributed computing architectures, parallel processing operations, and configure Apache Spark data frames for petabyte-scale file transformations." },
      { id: "de_3", title: "Data Warehouses & Schema Designs", status: "Locked", notes: "Design robust Star/Snowflake analytical schemas inside cloud data warehouses like Snowflake or Amazon Redshift." }
    ],
    "DevOps & Cloud Engineering": [
      { id: "do_1", title: "Docker Containerization Systems", status: "Mastered", notes: "Write customized Dockerfiles, run secure container instances, configure volume storage mappings, and orchestrate multiple microservices with Docker Compose." },
      { id: "do_2", title: "CI/CD Deployment Pipelines & GitHub Actions", status: "In Progress", notes: "Automate code quality testing, build checks, and continuous delivery configurations to staging/production clusters using GitHub Actions." },
      { id: "do_3", title: "Kubernetes & Infrastructure-as-Code (IaC)", status: "Locked", notes: "Study Kubernetes deployments, horizontal pod autoscalers, ingress load balancers, and configure cloud servers using declarative Terraform code." }
    ],
    "Mobile App Development (iOS/Android)": [
      { id: "mo_1", title: "React Native & Flutter Layouts", status: "Mastered", notes: "Design cross-platform native interfaces. Master flexbox layouts, touch gesture handlers, and local state integrations." },
      { id: "mo_2", title: "Native API Bridges & Offline Caching", status: "In Progress", notes: "Access device features (camera, geographic locations) and store operational data locally using SQLite or Hive frameworks." },
      { id: "mo_3", title: "App Store Publishing & WebSockets", status: "Locked", notes: "Configure secure push notification tokens, structure live chat rooms, and compile builds for Apple App Store and Google Play reviews." }
    ],
    "Embedded Systems & IoT": [
      { id: "em_1", title: "C Programming & Microcontroller Registers", status: "Mastered", notes: "Write bare-metal C programs. Configure memory registers, general-purpose input/output (GPIO) pins, and analog-to-digital converters (ADC)." },
      { id: "em_2", title: "Communication Protocols (UART, SPI, I2C)", status: "In Progress", notes: "Design robust peripheral data links. Master clock lines synchronization, baud rate settings, and packet headers parsing." },
      { id: "em_3", title: "Real-Time Operating Systems (RTOS)", status: "Locked", notes: "Study task schedulers, semaphores, mutex locks, and prevent resource deadlock risks in hard-real-time embedded firmwares." }
    ],
    "Database Administrator (DBA)": [
      { id: "db_1", title: "PostgreSQL & Transactions Isolation", status: "Mastered", notes: "Master SQL ACID properties, lock mechanisms, and configure safe transaction isolation levels to prevent dirty reads." },
      { id: "db_2", title: "Database Replication & High Availability", status: "In Progress", notes: "Configure Master-Slave streaming replications, read query load-balancers, and write automated database failover scripts." },
      { id: "db_3", title: "Backup recovery & Performance Tuning", status: "Locked", notes: "Schedule incremental logical backups, optimize execution plans (EXPLAIN ANALYZE), and index vacuum configurations." }
    ],
    "Game Development": [
      { id: "ga_1", title: "C# Scripting & Unity Mechanics", status: "Mastered", notes: "Write responsive game logic loops in C#. Configure collision detection, player movements, and state managers." },
      { id: "ga_2", title: "3D Physics & Shaders Optimization", status: "In Progress", notes: "Master vector maths, rigid body dynamics, custom lighting shaders, and minimize GPU rendering draw calls." },
      { id: "ga_3", title: "Game Engine AI & Networking", status: "Locked", notes: "Design NavMesh AI paths, behavioral trees, and sync multiplayer coordinate packets using WebSockets." }
    ],
    "Software Testing / QA Automation": [
      { id: "qa_1", title: "Unit testing & Jest/PyTest suites", status: "Mastered", notes: "Write comprehensive unit test cases, mock API integrations, and calculate test coverage benchmarks." },
      { id: "qa_2", title: "Selenium & Playwright E2E automation", status: "In Progress", notes: "Automate browser interactions, verify visual CSS layouts, and write end-to-end integration tests." },
      { id: "qa_3", title: "Load Testing & Security Audits", status: "Locked", notes: "Simulate massive concurrent API hits using Locust, and scan for security vulnerabilities." }
    ]
  });

  const [activeTrack, setActiveTrack] = useState('Frontend Engineering');
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Custom prompt states
  const [customGoal, setCustomGoal] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState('');

  // Generate Custom AI Roadmap
  const handleGenerateCustomRoadmap = () => {
    const goal = customGoal.trim();
    if (!goal) {
      alert("Please type a custom career goal first.");
      return;
    }

    setGenerating(true);
    setGenStep("🤖 Probing curriculum databases...");

    setTimeout(() => {
      setGenStep("⚙️ Synthesizing industry placement requirements...");
      
      setTimeout(() => {
        setGenStep("📊 Mapping skill hierarchies & DSA milestones...");
        
        setTimeout(() => {
          // Dynamic generation based on keyword checks
          const normalized = goal.toLowerCase();
          let generatedCurriculum = [
            { id: "cust_1", title: `Foundations of ${goal}`, status: "Mastered", notes: `Master the essential languages, design patterns, and CLI tools required for ${goal}. Study past company questions.` },
            { id: "cust_2", title: `Advanced structures & Systems`, status: "In Progress", notes: `Understand standard frameworks, data normalizations, and memory allocations matching the ${goal} profile.` },
            { id: "cust_3", title: `Deployment, Scalability & Security`, status: "Locked", notes: `Study horizontal cloud distributions, packet locks, and prevent structural downtime risks in production pipelines.` }
          ];

          if (normalized.includes("blockchain") || normalized.includes("crypto")) {
            generatedCurriculum = [
              { id: "bc_1", title: "Smart Contracts & Solidity", status: "Mastered", notes: "Write secure Ethereum smart contracts, verify gas metrics, and test against vulnerabilities like reentrancy bugs." },
              { id: "bc_2", title: "Distributed Consensus Protocols", status: "In Progress", notes: "Study Proof of Work vs Proof of Stake, peer-to-peer network nodes architecture, and Byzantine fault tolerances." },
              { id: "bc_3", title: "Web3 Integrations & Cryptography", status: "Locked", notes: "Connect frontends using Ethers.js, structure public-private key signatures, and execute secure wallet handshakes." }
            ];
          } else if (normalized.includes("vision") || normalized.includes("image")) {
            generatedCurriculum = [
              { id: "cv_1", title: "OpenCV Image Transformations", status: "Mastered", notes: "Master pixel arrays manipulation, edge detections (Canny), matrix filters, and camera calibration operations." },
              { id: "cv_2", title: "Convolutional Neural Networks (CNNs)", status: "In Progress", notes: "Train image classifications and object detection models (YOLO, ResNet) in PyTorch." },
              { id: "cv_3", title: "Visual transformers & generative models", status: "Locked", notes: "Study modern visual transformers, image segmentations, and configure latent diffusion models." }
            ];
          }

          // Register new roadmap
          setRoadmaps(prev => ({
            ...prev,
            [goal]: generatedCurriculum
          }));
          setActiveTrack(goal);
          setCustomGoal('');
          setSelectedNode(null);
          setGenerating(false);
          updateXp(80, "Roadmap Pioneer");
          alert(`🎉 Custom AI Roadmap generated for '${goal}'! +80 XP awarded.`);
        }, 1200);
      }, 1000);
    }, 1000);
  };

  // Calculate dynamic completion rate
  const getCompletionStats = (trackName) => {
    const track = roadmaps[trackName] || [];
    if (track.length === 0) return { pct: 0, text: "0/0 Mastered" };
    const mastered = track.filter(t => t.status === "Mastered").length;
    const total = track.length;
    const pct = Math.round((mastered / total) * 100);
    return { pct, text: `${mastered}/${total} Completed` };
  };

  const stats = getCompletionStats(activeTrack);

  const getStatusColor = (status) => {
    switch (status) {
      case "Mastered": return "border-emerald-500 text-emerald-400 bg-emerald-500/5";
      case "In Progress": return "border-accentCyan text-accentCyan bg-accentCyan/5 animate-pulse";
      default: return "border-slate-800 text-slate-500 bg-slate-950/40 opacity-60";
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-76px)]">
      
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          🧭 AI Placement Roadmap Generator
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm">
          Generate structured learning roadmaps for every discipline in Computer Engineering or define a custom career goal.
        </p>
      </div>

      {/* AI Custom Prompt Generator Builder */}
      <div className="glass-panel rounded-3xl p-6 bg-gradient-to-r from-violet-500/5 to-cyan-500/5 border-violet-500/20 space-y-4">
        <div className="flex items-center gap-2 text-violet-400 font-extrabold text-sm">
          <Sparkles className="w-5 h-5 fill-current animate-bounce" /> Custom AI Career Generator
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            value={customGoal}
            onChange={e => setCustomGoal(e.target.value)}
            placeholder="Type any customized career goal (e.g. Blockchain Developer, Computer Vision Architect)..."
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-200 text-xs outline-none focus:border-accentViolet"
            onKeyDown={e => e.key === 'Enter' && handleGenerateCustomRoadmap()}
          />
          <button
            onClick={handleGenerateCustomRoadmap}
            disabled={generating}
            className="bg-glow-gradient px-6 py-3 rounded-xl text-xs font-bold text-white shadow shadow-violet-500/10 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing AI...
              </>
            ) : (
              <>
                Generate Custom Curriculum <ArrowUpRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {generating && (
          <div className="text-[10px] text-accentCyan font-bold animate-pulse flex items-center gap-1.5 pt-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> {genStep}
          </div>
        )}
      </div>

      {/* Grid: Track Selector vs visual Roadmap tree */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Visual Roadmap tree */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden bg-gradient-to-b from-slate-950/60 to-slate-900/40">
            
            {/* Header Track Selector */}
            <div className="space-y-4 border-b border-slate-800/80 pb-5">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-200">Active Curriculum</h3>
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">{stats.text}</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>Track Completion Progress</span>
                  <span className="text-accentCyan">{stats.pct}% Complete</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-900 shadow-inner">
                  <div className="bg-glow-gradient h-1.8 rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.pct}%` }}></div>
                </div>
              </div>

              {/* Grid dropdown of CE Disciplines */}
              <div className="space-y-2 pt-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-0.5">Select Computer Engineering Field</label>
                <select
                  value={activeTrack}
                  onChange={e => { setActiveTrack(e.target.value); setSelectedNode(null); }}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 font-semibold outline-none focus:border-accentViolet"
                >
                  {Object.keys(roadmaps).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Visual roadmap nodes branch tree */}
            <div className="space-y-8 pt-4 relative pl-8 border-l border-slate-800/80 ml-4">
              {roadmaps[activeTrack]?.map((node, i) => {
                const isLocked = node.status === 'Locked';
                return (
                  <div 
                    key={node.id} 
                    onClick={() => setSelectedNode(node)}
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${getStatusColor(node.status)}`}
                  >
                    {/* Visual branch node marker */}
                    <div className={`absolute -left-[45px] top-6 w-7.5 h-7.5 rounded-full border-2 bg-slate-950 flex items-center justify-center text-[10px] ${node.status === 'Mastered' ? 'border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/10' : node.status === 'In Progress' ? 'border-accentCyan text-accentCyan shadow-sm shadow-cyan-500/10' : 'border-slate-800 text-slate-500'}`}>
                      {node.status === 'Mastered' ? '✔' : isLocked ? '🔒' : '⭐'}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-200">{node.title}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{node.status}</div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Columns: Study notes flashcards panel */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-4.5 h-4.5 text-accentCyan" /> Study Note Inspector
            </h3>

            {selectedNode ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-1">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">Selected Node Topic</span>
                  <div className="text-xs font-bold text-slate-200 leading-snug">{selectedNode.title}</div>
                  <div className="text-[10px] text-accentCyan font-bold uppercase">{selectedNode.status}</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-850 text-xs text-slate-300 leading-relaxed font-semibold">
                  {selectedNode.notes}
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-emerald-400 font-semibold leading-normal flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Study guide verified by AI Coaching Engine.
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-xs text-slate-500 leading-normal">
                Click any milestone node on the left to inspect complete study guides, core formulas, and interview revision notes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
