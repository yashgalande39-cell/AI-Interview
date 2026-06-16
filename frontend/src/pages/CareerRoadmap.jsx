import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, CheckCircle, ArrowUpRight, Sparkles, Loader2, 
  UploadCloud, ArrowRight, Eye, ChevronDown, Check, Lock,
  RefreshCw, Layers, Lightbulb, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function CareerRoadmap() {
  const { updateXp } = useAuth();
  
  // Pre-configured Roadmap Data for all fields
  const [roadmaps, setRoadmaps] = useState({
    "Frontend Engineering": [
      { id: "fe_1", title: "HTML5, Semantic Structure & SEO", status: "Mastered", iconType: "code", notes: "Use HTML5 semantic elements (header, main, nav, article, footer) rather than simple divs. Semantic structure ensures screen readers can parse content, vastly boosting accessibility and organic Google SEO page crawls." },
      { id: "fe_2", title: "Tailwind CSS & Mobile-First Layouts", status: "Mastered", iconType: "layout", notes: "Build layouts using a mobile-first utility methodology. Focus heavily on CSS Flexbox, Grid systems, and absolute positionings, optimizing animations with hardware-accelerated transforms." },
      { id: "fe_3", title: "React State Management & Global Contexts", status: "In Progress", iconType: "react", notes: "Understand the React Virtual DOM diffing algorithm. Master local state hooks (useState, useReducer) and global providers (React Context API, Redux Toolkit) to optimize page render cycles." },
      { id: "fe_4", title: "System Design & Modern Web Vitals", status: "Locked", iconType: "globe", notes: "Optimize web performance indexes (LCP, FID, CLS). Study code-splitting methods (React.lazy), image compression overlays, static site caching, and edge CDN routing." }
    ],
    "Backend Engineering": [
      { id: "be_1", title: "REST APIs & Express Server Architectures", status: "Mastered", iconType: "code", notes: "Build highly scalable HTTP APIs using Node.js and Express. Configure route mappings, request body parsing validation, and robust environmental controls (.env)." },
      { id: "be_2", title: "JWT & Salted Bcrypt Security", status: "Mastered", iconType: "lock", notes: "Implement secure user authentication using salted bcrypt password hashing and token-based state checking inside custom Express routing authorization middlewares." },
      { id: "be_3", title: "Database Indexing & Mongoose Schemas", status: "In Progress", iconType: "database", notes: "Study schema validations, database relationships, and query index optimization. Understand how indexes (B-Trees) boost lookups speed by eliminating sequential scans." },
      { id: "be_4", title: "Sockets Collaboration & Cache Layers", status: "Locked", iconType: "globe", notes: "Integrate Redis cache layers to reduce DB queries and Socket.io channels to synchronize whiteboard drawings and coding keystrokes in real-time." }
    ],
    "AI / Machine Learning Engineering": [
      { id: "ai_1", title: "Python Data Pipelines & Wrangling", status: "Mastered", iconType: "code", notes: "Master NumPy multi-dimensional arrays, Pandas wrangling transformations (lambda filters, aggregates, groupings), and data visualizations using Seaborn." },
      { id: "ai_2", title: "Supervised ML Models & Metrics", status: "In Progress", iconType: "chart", notes: "Train linear/logistic regressions, SVMs, and decision trees using Scikit-Learn. Evaluate models with precision, recall, F1-scores, and ROC-AUC curves." },
      { id: "ai_3", title: "Deep Learning Neural Networks", status: "Locked", iconType: "lock", notes: "Study backpropagation, activation layers (ReLU, Sigmoid), and prevent overfitting using dropout regularization and early stopping configurations in PyTorch." }
    ],
    "Cybersecurity Analyst": [
      { id: "cy_1", title: "Network Infrastructures & Wireshark Protocols", status: "Mastered", iconType: "globe", notes: "Understand TCP/IP layers, subnet mask routers, DNS structures, and capture raw packet logs with Wireshark to detect anomalous network requests." },
      { id: "cy_2", title: "Cryptography & SSL Handshakes", status: "In Progress", iconType: "lock", notes: "Study symmetric vs asymmetric encryption systems (AES, RSA). Master public-private keys, hashing algorithms (SHA-256), and secure SSL handshakes." },
      { id: "cy_3", title: "Penetration Testing & Linux Auditing", status: "Locked", iconType: "code", notes: "Perform vulnerability scans, inspect cross-site scripting (XSS), SQL injections (SQLi), and audit server log directories using security-hardened Linux scripts." }
    ],
    "Data Engineering": [
      { id: "de_1", title: "SQL Queries & ETL Pipelines", status: "Mastered", iconType: "database", notes: "Write complex SQL joins, window aggregates, and configure automated Extract-Transform-Load (ETL) flows to normalize massive dirty datasets." },
      { id: "de_2", title: "Apache Spark Big Data Clusters", status: "In Progress", iconType: "server", notes: "Master distributed computing architectures, parallel processing operations, and configure Apache Spark data frames for petabyte-scale file transformations." },
      { id: "de_3", title: "Data Warehouses & Schema Designs", status: "Locked", iconType: "lock", notes: "Design robust Star/Snowflake analytical schemas inside cloud data warehouses like Snowflake or Amazon Redshift." }
    ]
  });

  const [activeTrack, setActiveTrack] = useState('Frontend Engineering');
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Custom generator states
  const [customGoal, setCustomGoal] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState('');

  // Study Note Inspector Upload/View states
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'uploading' | 'parsing' | 'extracted'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeInspectorTab, setActiveInspectorTab] = useState('summary'); // 'summary' | 'concepts' | 'flashcards'
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  // Mock auto-extracted notes
  const mockStudyNotes = useMemo(() => ({
    fileName: "React_State_Patterns_Revision.pdf",
    fileSize: "1.8 MB",
    summary: "React's Virtual DOM represents the UI in memory. Hook states like useState trigger standard schedule cycles, whereas useContext broadcasts provider value mutations down the children node trees. Redux utilizes single immutable store vectors updated by pure functions (reducers).",
    concepts: [
      "Virtual DOM Diffing: Reconciles changes using a heuristic algorithm to perform minimal updates.",
      "React Context: Broadcasts changes to consumers directly, bypassing prop-drilling.",
      "Redux Toolkit: Reduces boilerplate via slices, incorporating Thunks for async side effects.",
      "Component Render Optimizations: Utilizing React.memo and hooks like useMemo and useCallback to prevent wasteful re-render cycles."
    ],
    flashcards: [
      {
        question: "What is React Virtual DOM Diffing?",
        answer: "A heuristic O(n) algorithm that compares root level elements and keys, performing minimal drop-in operations to synchronise real DOM branches."
      },
      {
        question: "How does useContext trigger updates?",
        answer: "When provider value references change, all consuming components subscribing to the Context are re-rendered automatically."
      },
      {
        question: "Explain the difference between useMemo and useCallback.",
        answer: "useMemo caches the returned value of a function, while useCallback caches the callback function instance itself between render cycles."
      }
    ]
  }), []);

  // Trigger Mock Upload
  const handleMockUpload = (fileName = "System_Design_notes.pdf") => {
    setUploadState('uploading');
    setUploadProgress(0);
    setUploadedFileName(fileName);
    setSelectedNode(null);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setUploadState('parsing');
        setTimeout(() => {
          setUploadState('extracted');
          setActiveInspectorTab('summary');
          setCurrentFlashcardIndex(0);
          setFlashcardFlipped(false);
        }, 1200);
      }
    }, 150);
  };

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
          const generatedCurriculum = [
            { id: "cust_1", title: `Foundations of ${goal}`, status: "Mastered", iconType: "code", notes: `Master the essential languages, design patterns, and CLI tools required for ${goal}. Study past company questions.` },
            { id: "cust_2", title: `Advanced structures & Systems`, status: "In Progress", iconType: "react", notes: `Understand standard frameworks, data normalizations, and memory allocations matching the ${goal} profile.` },
            { id: "cust_3", title: `Deployment, Scalability & Security`, status: "Locked", iconType: "lock", notes: `Study horizontal cloud distributions, packet locks, and prevent structural downtime risks in production pipelines.` }
          ];

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

  // Completion calculation
  const getCompletionStats = (trackName) => {
    const track = roadmaps[trackName] || [];
    if (track.length === 0) return { pct: 0, text: "0/0 COMPLETED" };
    const mastered = track.filter(t => t.status === "Mastered").length;
    const total = track.length;
    const pct = Math.round((mastered / total) * 100);
    return { pct, text: `${mastered}/${total} COMPLETED` };
  };

  const stats = getCompletionStats(activeTrack);

  return (
    <div className="space-y-6 pt-2 w-full text-[#e2e8f0] bg-[#0b0f19] min-h-screen">
      <style>{`
        .hero-gradient {
          background: linear-gradient(135deg, rgba(21, 26, 43, 0.9) 0%, rgba(30, 27, 75, 0.4) 50%, rgba(15, 19, 26, 0.9) 100%);
          position: relative;
          overflow: hidden;
        }
        .hero-gradient::after {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          background: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)" /></svg>');
          pointer-events: none;
        }
        .glass-panel {
          background-color: #121216;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
        }
        .button-gradient {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          transition: all 0.3s ease;
        }
        .button-gradient:hover {
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        
        /* Flashcard CSS flip mechanics */
        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 120px;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .flashcard-flipped .flashcard-inner {
          transform: rotateY(180deg);
        }
        .flashcard-front, .flashcard-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .flashcard-back {
          transform: rotateY(180deg);
        }

        .glow-border {
          position: relative;
        }
        .glow-border::before {
          content: '';
          position: absolute;
          top: -1px; left: -1px; right: -1px; bottom: -1px;
          border-radius: 0.75rem;
          background: linear-gradient(45deg, #8b5cf6, #3b82f6);
          z-index: 0;
          opacity: 0.45;
          pointer-events: none;
        }
      `}</style>

      {/* Hero Banner */}
      <section className="hero-gradient rounded-2xl p-8 border border-gray-800 flex items-center justify-between relative shadow-lg shadow-[#8B5CF6]/5">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#8B5CF6]/15 blur-3xl rounded-full z-0 pointer-events-none"></div>
        <div className="relative z-10 flex items-start max-w-2xl">
          <div className="w-14 h-14 rounded-xl border border-gray-800 flex items-center justify-center mr-6 shadow-inner shrink-0 bg-[#121216] shadow-[0_0_15px_rgba(139,92,246,0.35)] border-purple-500/30 animate-pulse">
            <BookOpen className="w-6 h-6 text-[#8B5CF6]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">AI Placement Roadmap Generator</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Generate structured learning roadmaps for every discipline in Computer Engineering<br/>or define a custom career goal.
            </p>
          </div>
        </div>

        {/* Abstract roadmap graphic */}
        <div className="hidden lg:block relative z-10 mr-8 w-64 h-24 opacity-80">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg fill="none" height="100%" viewBox="0 0 200 100" width="100%" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 70 Q 60 20 100 50 T 180 30" fill="none" stroke="#374151" strokeDasharray="4 4" strokeWidth="2"></path>
              <rect fill="#121216" height="20" rx="4" stroke="#8B5CF6" strokeWidth="1.5" width="20" x="10" y="60"></rect>
              <rect fill="#121216" height="20" rx="4" stroke="#8B5CF6" strokeWidth="1.5" width="20" x="90" y="40"></rect>
              <rect fill="#121216" height="20" rx="4" stroke="#00B5D8" strokeWidth="1.5" width="20" x="170" y="20"></rect>
              <path d="M180 10 L180 20" stroke="#00B5D8" strokeWidth="2"></path>
              <path d="M180 10 L190 15 L180 20 Z" fill="#00B5D8"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Custom AI Career Generator */}
      <section className="glass-panel p-5 shadow-sm">
        <div className="flex items-center mb-3 text-sm font-semibold text-white">
          <Sparkles className="w-4 h-4 text-[#8B5CF6] mr-2" /> Custom AI Career Generator
        </div>
        <div className="flex gap-4">
          <input 
            type="text"
            value={customGoal}
            onChange={e => setCustomGoal(e.target.value)}
            placeholder="Type any customized career goal (e.g. Blockchain Developer, Computer Vision Architect)..."
            className="flex-1 bg-[#0b0f19] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
            onKeyDown={e => e.key === 'Enter' && handleGenerateCustomRoadmap()}
          />
          <button 
            onClick={handleGenerateCustomRoadmap}
            disabled={generating}
            className="button-gradient text-white px-6 py-3 rounded-lg text-sm font-medium whitespace-nowrap hover:opacity-90 transition-opacity flex items-center disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...
              </>
            ) : (
              <>
                Generate Custom Curriculum <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>

        {generating && (
          <div className="text-[10px] text-cyan-400 font-bold animate-pulse flex items-center gap-1.5 pt-2 pl-1">
            <Loader2 className="w-3 h-3 animate-spin" /> {genStep}
          </div>
        )}
      </section>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active Curriculum */}
        <div className="lg:col-span-2 space-y-6">
          <section className="glass-panel p-6 shadow-sm">
            
            {/* Header and completion indicators */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 text-[#8B5CF6] mr-3" />
                <div>
                  <h3 className="text-lg font-bold text-white">Active Curriculum</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Track your progress and continue learning.</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-white mb-1 uppercase tracking-wider">{stats.text}</div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 h-2 bg-[#0b0f19] rounded-full overflow-hidden border border-gray-800">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-700 ease-out" 
                      style={{ width: `${stats.pct}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">{stats.pct}% Complete</span>
                </div>
              </div>
            </div>

            {/* CE Dropdown Field */}
            <div className="mb-6">
              <label className="block text-[10px] font-semibold text-gray-450 uppercase tracking-wider mb-2">Select Computer Engineering Field</label>
              <div className="relative">
                <select 
                  value={activeTrack}
                  onChange={e => { setActiveTrack(e.target.value); setSelectedNode(null); }}
                  className="w-full bg-[#0b0f19] border border-gray-850 rounded-lg px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
                >
                  {Object.keys(roadmaps).map(t => (
                    <option key={t} value={t} className="bg-[#121216]">{t}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Timeline tree lists */}
            <div className="space-y-4 relative">
              <div className="absolute left-3.5 top-5 bottom-8 w-px bg-gray-800 z-0"></div>

              {roadmaps[activeTrack]?.map((node) => {
                const isCompleted = node.status === 'Mastered';
                const isInProgress = node.status === 'In Progress';
                const isLocked = node.status === 'Locked';

                return (
                  <div 
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="relative z-10 flex items-center group cursor-pointer"
                  >
                    {/* Visual node badge icons on left line */}
                    <div className={`w-7 h-7 rounded-full bg-[#0b0e14] border-2 flex items-center justify-center mr-4 shrink-0 transition-colors ${
                      isCompleted ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.35)]' :
                      isInProgress ? 'border-[#00B5D8] shadow-[0_0_10px_rgba(0,181,216,0.45)]' :
                      'border-gray-800'
                    }`}>
                      {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" /> :
                       isLocked ? <Lock className="w-3 h-3 text-gray-550" /> :
                       <div className="w-2.5 h-2.5 rounded-full bg-[#00B5D8]"></div>}
                    </div>

                    {/* Nodes Curriculum Info Card */}
                    <div className={`flex-1 border rounded-xl p-4 flex items-center justify-between transition-all relative overflow-hidden ${
                      isCompleted ? 'bg-[#0B0E14]/70 border-gray-800 hover:border-emerald-500/50 hover:bg-[#121216]/50 shadow-[0_0_15px_rgba(16,185,129,0.02)]' :
                      isInProgress ? 'glow-border bg-[#0B0E14]/70 border-cyan-500/20 hover:border-[#00B5D8] shadow-[0_0_15px_rgba(0,181,216,0.08)]' :
                      'bg-[#0B0E14]/50 border-gray-800/60 opacity-60'
                    }`}>
                      
                      {/* Active Node Slide highlights */}
                      {isInProgress && (
                        <div className="absolute left-0 top-0 bottom-0 bg-[#00B5D8]/5 w-[65%] pointer-events-none"></div>
                      )}

                      <div className="flex items-center relative z-10">
                        {/* Custom icon box matching dashboard style */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 shadow-sm ${
                          isCompleted ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                          isInProgress ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                          'bg-[#222836] border border-gray-800 text-gray-500'
                        }`}>
                          {node.iconType === 'code' ? <i className="fa-solid fa-code text-xs"></i> :
                           node.iconType === 'layout' ? <i className="fa-regular fa-window-maximize text-xs"></i> :
                           node.iconType === 'react' ? <i className="fa-brands fa-react text-lg"></i> :
                           node.iconType === 'database' ? <i className="fa-solid fa-database text-xs"></i> :
                           node.iconType === 'server' ? <i className="fa-solid fa-server text-xs"></i> :
                           node.iconType === 'lock' ? <i className="fa-solid fa-lock text-xs"></i> :
                           node.iconType === 'chart' ? <i className="fa-solid fa-chart-simple text-xs"></i> :
                           <i className="fa-solid fa-globe text-xs"></i>}
                        </div>

                        <div>
                          <h4 className={`text-sm font-semibold ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                            {node.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-0.5 font-medium">
                            {isInProgress ? 'In Progress • 65% Complete' : isCompleted ? 'Mastered' : 'Locked'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center relative z-10">
                        {isInProgress && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNode(node);
                            }}
                            className="text-xs text-white font-semibold bg-[#222836] hover:bg-gray-800 border border-gray-700 px-4 py-1.5 rounded-lg mr-4 transition-all"
                          >
                            Continue
                          </button>
                        )}
                        {isCompleted && (
                          <span className="text-xs text-emerald-400 font-semibold flex items-center mr-4 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                            <Check className="w-3 h-3 mr-1 font-extrabold" /> Completed
                          </span>
                        )}
                        {isLocked && (
                          <span className="text-xs text-gray-500 font-semibold flex items-center mr-4 bg-[#222836] px-3 py-1.5 rounded-lg border border-gray-800">
                            <Lock className="w-3 h-3 mr-1.5" /> Locked
                          </span>
                        )}
                        <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </section>
        </div>

        {/* Right Column: Note Inspector & Tips */}
        <div className="space-y-6">
          
          {/* Study Note Inspector */}
          <section className="glass-panel p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-cyan-400 mr-2" />
                <h3 className="text-base font-bold text-white">Study Note Inspector</h3>
              </div>
              
              {(selectedNode || uploadState === 'extracted') && (
                <button
                  onClick={() => {
                    setSelectedNode(null);
                    setUploadState('idle');
                  }}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider"
                >
                  Clear Notes
                </button>
              )}
            </div>
            
            <p className="text-xs text-gray-400 mb-5 leading-normal">Review, organize, and enhance your learning materials.</p>

            {/* Render selected node guides */}
            {selectedNode ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-[#0b0e14] border border-gray-800 space-y-1">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500">Selected Node Topic</span>
                  <div className="text-xs font-bold text-white leading-snug">{selectedNode.title}</div>
                  <div className="text-[10px] text-cyan-400 font-bold uppercase mt-1">{selectedNode.status}</div>
                </div>

                <div className="p-5 rounded-xl bg-[#0b0e14] border border-gray-800 text-xs text-gray-300 leading-relaxed font-semibold">
                  {selectedNode.notes}
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-emerald-400 font-semibold leading-normal flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Study guide verified by AI Placement Engine.
                </div>
              </div>
            ) : uploadState === 'idle' ? (
              /* Drag-n-drop Upload Panel */
              <div className="space-y-5 animate-in fade-in duration-200">
                <div 
                  onClick={() => handleMockUpload()}
                  className="border-2 border-dashed border-gray-800 rounded-xl p-6 text-center bg-[#0b0e14]/50 hover:bg-[#0b0e14] hover:border-[#8B5CF6] transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#222836] border border-gray-800 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                    <UploadCloud className="w-5 h-5 text-[#8B5CF6]" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">Upload Notes</h4>
                  <p className="text-xs text-gray-400">Drag &amp; drop or click to upload</p>
                  <p className="text-[10px] text-gray-500 mt-1">PDF, DOCX, MD up to 10MB</p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start text-xs text-gray-400">
                    <Sparkles className="w-4 h-4 text-cyan-400 mr-2 shrink-0" /> Smart suggestions for improvement
                  </li>
                  <li className="flex items-start text-xs text-gray-400">
                    <Layers className="w-4 h-4 text-blue-400 mr-2 shrink-0" /> Auto-generate flashcards
                  </li>
                  <li className="flex items-start text-xs text-gray-400">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mr-2 shrink-0" /> Extract key concepts
                  </li>
                  <li className="flex items-start text-xs text-gray-400">
                    <FileText className="w-4 h-4 text-pink-500 mr-2 shrink-0" /> Interview revision notes
                  </li>
                </ul>

                <button 
                  onClick={() => handleMockUpload("React_State_Patterns_Revision.pdf")}
                  className="w-full bg-[#0b0e14] border border-gray-800 text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-gray-800/40 transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2 text-cyan-400" /> View Sample Notes
                </button>
              </div>
            ) : uploadState === 'uploading' ? (
              /* Loading percentages */
              <div className="py-12 text-center space-y-4 animate-in fade-in duration-200">
                <div className="w-12 h-12 bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 rounded-full flex items-center justify-center mx-auto text-[#8B5CF6] animate-bounce shadow-inner">
                  <UploadCloud className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Uploading {uploadedFileName}...</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-semibold">{uploadProgress}% uploaded</p>
                </div>
                <div className="w-full bg-[#0b0f19] h-1.5 rounded-full overflow-hidden max-w-xs mx-auto border border-gray-800/80">
                  <div className="bg-[#8B5CF6] h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            ) : uploadState === 'parsing' ? (
              /* Steps logs loader */
              <div className="py-12 text-center space-y-4 animate-in fade-in duration-200">
                <Loader2 className="w-8 h-8 animate-spin text-[#00B5D8] mx-auto" />
                <div>
                  <h4 className="text-sm font-semibold text-white">AI note analysis in progress</h4>
                  <p className="text-[11px] text-cyan-400 mt-1 font-semibold animate-pulse">
                    Parsing structures & extracting concepts...
                  </p>
                </div>
              </div>
            ) : (
              /* Extracted Study dashboard */
              <div className="space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#0b0f19] border border-gray-800">
                  <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{uploadedFileName}</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">{mockStudyNotes.fileSize} · Extraction complete</p>
                  </div>
                  <RefreshCw 
                    onClick={() => handleMockUpload(uploadedFileName)}
                    className="w-3.5 h-3.5 text-gray-500 ml-auto hover:text-white cursor-pointer transition-colors" 
                  />
                </div>

                {/* Sub-tabs toggles */}
                <div className="flex bg-[#0b0f19] border border-gray-800 rounded-lg p-0.5 text-[11px]">
                  <button 
                    onClick={() => setActiveInspectorTab('summary')}
                    className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
                      activeInspectorTab === 'summary' 
                        ? 'bg-blue-900/35 text-white border border-blue-500/40 shadow-sm' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Summary
                  </button>
                  <button 
                    onClick={() => setActiveInspectorTab('concepts')}
                    className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
                      activeInspectorTab === 'concepts' 
                        ? 'bg-blue-900/35 text-white border border-blue-500/40 shadow-sm' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Concepts
                  </button>
                  <button 
                    onClick={() => setActiveInspectorTab('flashcards')}
                    className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
                      activeInspectorTab === 'flashcards' 
                        ? 'bg-blue-900/35 text-white border border-blue-500/40 shadow-sm' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Flashcards
                  </button>
                </div>

                {/* Sub-tabs contents */}
                {activeInspectorTab === 'summary' && (
                  <div className="p-4 rounded-xl bg-[#0b0e14] border border-gray-800 text-xs text-gray-300 leading-relaxed font-semibold">
                    {mockStudyNotes.summary}
                  </div>
                )}

                {activeInspectorTab === 'concepts' && (
                  <ul className="space-y-2.5 p-4 rounded-xl bg-[#0b0e14] border border-gray-800 text-xs text-gray-300 leading-relaxed">
                    {mockStudyNotes.concepts.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0 font-extrabold" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeInspectorTab === 'flashcards' && (
                  <div className="space-y-4">
                    {/* Flippable 3D card item */}
                    <div 
                      onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                      className={`relative w-full cursor-pointer perspective-1000 ${
                        flashcardFlipped ? 'flashcard-flipped' : ''
                      }`}
                    >
                      <div className="flashcard-inner">
                        {/* Question */}
                        <div className="flashcard-front bg-[#0b0e14] border border-gray-800 text-xs text-[#00B5D8] font-bold">
                          <div className="text-center space-y-1">
                            <span className="text-[8px] uppercase tracking-wider text-gray-500 font-extrabold block">Question</span>
                            <p className="leading-snug">{mockStudyNotes.flashcards[currentFlashcardIndex].question}</p>
                            <span className="text-[8px] text-gray-600 block mt-2">(Click to Flip)</span>
                          </div>
                        </div>
                        {/* Answer */}
                        <div className="flashcard-back bg-blue-950/20 border border-blue-500/40 text-xs text-gray-300 font-semibold leading-relaxed">
                          <div className="text-center space-y-1">
                            <span className="text-[8px] uppercase tracking-wider text-blue-400 font-extrabold block">Answer</span>
                            <p>{mockStudyNotes.flashcards[currentFlashcardIndex].answer}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cycle control indicators */}
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase">
                        {currentFlashcardIndex + 1} / {mockStudyNotes.flashcards.length}
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={currentFlashcardIndex === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentFlashcardIndex(prev => prev - 1);
                            setFlashcardFlipped(false);
                          }}
                          className="p-1 rounded bg-[#0b0f19] border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          disabled={currentFlashcardIndex + 1 === mockStudyNotes.flashcards.length}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentFlashcardIndex(prev => prev + 1);
                            setFlashcardFlipped(false);
                          }}
                          className="p-1 rounded bg-[#0b0f19] border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Tips Panel */}
          <section className="glass-panel p-6 shadow-sm relative overflow-hidden bg-gradient-to-br from-[#121216] to-[#1d152c]">
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#8B5CF6]/10 blur-xl rounded-full"></div>
            <div className="flex items-start justify-between relative z-10">
              <div className="pr-8">
                <div className="flex items-center mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400 mr-2 animate-pulse" />
                  <h3 className="text-sm font-bold text-white">Roadmap Tips</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                  Stay consistent! Complete one module at a time and practice regularly to ace your placement.
                </p>
              </div>
              <div className="text-3xl shrink-0 mt-2 select-none animate-bounce duration-1000">
                🚀
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
