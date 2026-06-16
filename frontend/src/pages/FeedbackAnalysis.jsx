import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Trophy, ChevronRight, Printer, RefreshCw, X, HelpCircle, Sparkles
} from 'lucide-react';

export default function FeedbackAnalysis() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track flipped state for each flashcard index
  const [flippedCards, setFlippedCards] = useState({});

  // Modals state
  const [showRecsModal, setShowRecsModal] = useState(false);
  const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);

  // Mini Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const miniQuiz = [
    {
      q: "Which dynamic programming approach stores subproblems to avoid repeated evaluations?",
      options: ["Memoization", "Tabulation", "Compilation", "Recursion Stack"],
      correctIndex: 0,
      explanation: "Memoization (top-down) stores the results of expensive function calls to prevent duplicate compute paths."
    },
    {
      q: "What is the primary indicator of speaking pace fluency recommended in corporate interviews?",
      options: ["> 180 Words Per Minute", "100 - 130 Words Per Minute", "< 60 Words Per Minute", "Continuous rapid speech"],
      correctIndex: 1,
      explanation: "An average pace of 100-130 WPM ensures clear enunciation, calm breathing, and time to structure logical thoughts."
    }
  ];

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/interviews/finish`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ sessionId })
        });
        if (res.ok) {
          const data = await res.json();
          setScorecard(data.scoreCard);
        } else {
          throw new Error("Finish evaluation failed");
        }
      } catch (err) {
        console.warn("Using offline simulator scorecard details:", err.message);
        setScorecard({
          overallScore: 82,
          technicalScore: 84,
          communicationScore: 80,
          eyeContactScore: 88,
          averageWpm: 124,
          stressScore: 18,
          totalFillers: 6,
          weakTopics: ["Dynamic Programming", "Speech Pace"],
          recommendations: [
            "Maintain structural pacing under 130 WPM when answering deep technical loops.",
            "Refine your understanding of Dynamic programming lookup tables."
          ],
          flashcards: [
            { front: "Explain DP Memoization", back: "Memoization is a top-down dynamic programming technique where subproblem solutions are cached to prevent duplicate compute loops." },
            { front: "STAR Communication Strategy", back: "S: Situation (Context), T: Task (Requirement), A: Action (Your step), R: Result (Quantified outcomes)." }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchScorecard();
  }, [sessionId, token]);

  const handleQuizSubmit = () => {
    let score = 0;
    miniQuiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correctIndex) score += 1;
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const toggleFlip = (index) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-app-bg text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-accent-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xs text-app-textSecondary font-bold uppercase tracking-widest">Evaluating transcription scripts...</div>
        </div>
      </div>
    );
  }

  // Pre-configured default flashcards
  const defaultFlashcards = [
    {
      topic: "DSA",
      question: "What is the time complexity of Dijkstra's algorithm?",
      answer: "O((V + E) log V) using a binary heap, where V is the number of vertices and E is the number of edges.",
      colorClass: "from-[#2a1b4d] to-[#120b29] border-purple-500/20 hover:border-purple-500/50",
      glowColor: "bg-purple-500/20"
    },
    {
      topic: "System Design",
      question: "Design a Rate Limiter for an API gateway.",
      answer: "Implement Token Bucket, Leaky Bucket, or Sliding Window Log algorithms. Can be scaled using distributed Redis caches.",
      colorClass: "from-[#1b2b4d] to-[#0b1529] border-blue-500/20 hover:border-blue-500/50",
      glowColor: "bg-blue-500/20"
    },
    {
      topic: "OS",
      question: "What is the difference between process and thread?",
      answer: "A process is an independent execution unit with dedicated memory, while a thread is a lightweight sub-unit sharing process resources.",
      colorClass: "from-[#1b3a3d] to-[#0b1f21] border-teal-500/20 hover:border-teal-500/50",
      glowColor: "bg-teal-500/20"
    },
    {
      topic: "DBMS",
      question: "Explain ACID properties with examples.",
      answer: "Atomicity (all/nothing), Consistency (rules validation), Isolation (independent concurrency), Durability (persistent storage).",
      colorClass: "from-[#301b3d] to-[#160b1f] border-pink-500/20 hover:border-pink-500/50",
      glowColor: "bg-pink-500/20"
    }
  ];

  // Dynamic flashcards mapping
  const flashcardsList = scorecard?.flashcards && scorecard.flashcards.length > 0
    ? scorecard.flashcards.map((fc, idx) => {
        const themes = [
          { topic: "DSA", colorClass: "from-[#2a1b4d] to-[#120b29] border-purple-500/20 hover:border-purple-500/50", glowColor: "bg-purple-500/20" },
          { topic: "System Design", colorClass: "from-[#1b2b4d] to-[#0b1529] border-blue-500/20 hover:border-blue-500/50", glowColor: "bg-blue-500/20" },
          { topic: "OS", colorClass: "from-[#1b3a3d] to-[#0b1f21] border-teal-500/20 hover:border-teal-500/50", glowColor: "bg-teal-500/20" },
          { topic: "DBMS", colorClass: "from-[#301b3d] to-[#160b1f] border-pink-500/20 hover:border-pink-500/50", glowColor: "bg-pink-500/20" }
        ];
        const theme = themes[idx % themes.length];
        return {
          topic: theme.topic,
          question: fc.front,
          answer: fc.back,
          colorClass: theme.colorClass,
          glowColor: theme.glowColor
        };
      })
    : defaultFlashcards;

  // Recommendations detailed mapper
  const getRecommendationDetails = (rec, index) => {
    if (rec.toLowerCase().includes('pacing') || rec.toLowerCase().includes('wpm')) {
      return {
        title: "Maintain structural pacing",
        icon: (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
        ),
        bgColor: "bg-blue-500/10"
      };
    } else if (rec.toLowerCase().includes('dp') || rec.toLowerCase().includes('programming') || rec.toLowerCase().includes('dsa') || rec.toLowerCase().includes('lookup')) {
      return {
        title: "Refine DSA lookups",
        icon: (
          <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
        ),
        bgColor: "bg-teal-500/10"
      };
    } else {
      return {
        title: `Placement Tip #${index + 1}`,
        icon: (
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
        ),
        bgColor: "bg-purple-500/10"
      };
    }
  };

  // SVG Circumference for radius=42 -> ~264
  const strokeCircumference = 264;
  const getStrokeDashOffset = (percentage) => {
    return strokeCircumference - (strokeCircumference * percentage) / 100;
  };

  return (
    <div className="space-y-6 pt-4 w-full text-white bg-app-bg pb-12" id="feedback-report">
      
      {/* Performance Banner */}
      <section className="relative w-full rounded-[20px] bg-gradient-to-r from-app-card via-[#0f172a] to-app-card border border-blue-500/20 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full"></div>
          <div className="absolute right-1/4 bottom-0 w-[400px] h-[200px] bg-purple-600/10 blur-[80px] rounded-full"></div>
          <svg className="absolute right-10 top-0 h-full w-1/2 opacity-30" preserveAspectRatio="none" viewBox="0 0 400 200">
            <path className="opacity-50" d="M0 150 Q 100 120 150 100 T 300 50 L 400 20" fill="none" stroke="url(#grad1)" strokeWidth="2"></path>
            <path className="opacity-30" d="M50 180 Q 150 160 200 130 T 350 80 L 400 60" fill="none" stroke="url(#grad2)" strokeWidth="1"></path>
            <circle cx="150" cy="100" fill="#60a5fa" r="3"></circle>
            <circle cx="225" cy="75" fill="#a78bfa" r="4" className="animate-pulse"></circle>
            <circle cx="300" cy="50" fill="#3b82f6" r="3"></circle>
            <defs>
              <linearGradient id="grad1" x1="0%" x2="100%" y1="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0"></stop>
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1"></stop>
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5"></stop>
              </linearGradient>
              <linearGradient id="grad2" x1="0%" x2="100%" y1="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0"></stop>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8"></stop>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="relative z-10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wide mb-4 backdrop-blur-sm">
              <Trophy className="w-3.5 h-3.5" />
              Placement scorecard ready
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Performance Feedback Report</h1>
            <p className="text-gray-400 text-sm">Your performance insights and improvement recommendations</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors backdrop-blur-sm"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-medium shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105"
            >
              Open Dashboard
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        
        {/* Card 1: Overall Grade */}
        <div className="bg-app-card rounded-2xl p-5 border border-cyan-500/20 shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
          <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-2 text-app-textSecondary text-xs font-semibold tracking-wider uppercase mb-3">
                <Trophy className="w-4 h-4 text-cyan-450" />
                Overall Grade
              </div>
              <div className="text-4xl font-bold text-white mb-1">{scorecard?.overallScore}%</div>
              <div className="text-cyan-400 font-medium text-sm mb-4">Excellent</div>
              <div className="flex items-center gap-1.5 text-xs">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span className="text-green-500 font-medium">12%</span>
                <span className="text-gray-500">vs last report</span>
              </div>
            </div>
            {/* Circular Gauge */}
            <div className="relative w-20 h-20 flex-shrink-0 glow-cyan rounded-full">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="42" stroke="#1e293b" strokeWidth="8"></circle>
                <circle 
                  className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all duration-1000 ease-out" 
                  cx="50" cy="50" fill="none" r="42" stroke="#06b6d4" 
                  strokeDasharray={strokeCircumference} 
                  strokeDashoffset={getStrokeDashOffset(scorecard?.overallScore || 82)} 
                  strokeWidth="8"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-app-bg rounded-lg border border-cyan-500/30 flex items-center justify-center shadow-inner">
                  <span className="text-xl font-bold text-cyan-400">A</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Technical Score */}
        <div className="bg-app-card rounded-2xl p-5 border border-purple-500/20 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-2 text-app-textSecondary text-xs font-semibold tracking-wider uppercase mb-3">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                Technical Score
              </div>
              <div className="text-4xl font-bold text-white mb-1">{scorecard?.technicalScore}%</div>
              <div className="text-gray-400 font-medium text-sm mb-4">Gaze Centered</div>
              <div className="flex items-center gap-1.5 text-xs">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span className="text-green-500 font-medium">9%</span>
                <span className="text-gray-500">vs last report</span>
              </div>
            </div>
            <div className="relative w-20 h-20 flex-shrink-0 glow-purple rounded-full">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="42" stroke="#1e293b" strokeWidth="8"></circle>
                <circle 
                  className="drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" 
                  cx="50" cy="50" fill="none" r="42" stroke="#a855f7" 
                  strokeDasharray={strokeCircumference} 
                  strokeDashoffset={getStrokeDashOffset(scorecard?.technicalScore || 84)} 
                  strokeWidth="8"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-[#1a142c] rounded-full border border-purple-500/30 flex items-center justify-center shadow-inner">
                  <span className="text-lg font-bold text-purple-400">&lt;/&gt;</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Fluency Score */}
        <div className="bg-app-card rounded-2xl p-5 border border-pink-500/20 shadow-lg relative overflow-hidden group hover:border-pink-500/40 transition-colors">
          <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-2 text-app-textSecondary text-xs font-semibold tracking-wider uppercase mb-3">
                <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                Fluency Score
              </div>
              <div className="text-4xl font-bold text-white mb-1">{scorecard?.communicationScore}%</div>
              <div className="text-gray-400 font-medium text-sm mb-4">{scorecard?.averageWpm} Avg WPM</div>
              <div className="flex items-center gap-1.5 text-xs">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span className="text-green-500 font-medium">8%</span>
                <span className="text-gray-500">vs last report</span>
              </div>
            </div>
            <div className="relative w-20 h-20 flex-shrink-0 glow-pink rounded-full">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="42" stroke="#1e293b" strokeWidth="8"></circle>
                <circle 
                  className="drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" 
                  cx="50" cy="50" fill="none" r="42" stroke="#ec4899" 
                  strokeDasharray={strokeCircumference} 
                  strokeDashoffset={getStrokeDashOffset(scorecard?.communicationScore || 80)} 
                  strokeWidth="8"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-[#2c141d] rounded-full border border-pink-500/30 flex items-center justify-center gap-0.5 shadow-inner">
                  <div className="w-0.5 h-3 bg-pink-400 rounded-full"></div>
                  <div className="w-0.5 h-5 bg-pink-400 rounded-full"></div>
                  <div className="w-0.5 h-4 bg-pink-400 rounded-full"></div>
                  <div className="w-0.5 h-6 bg-pink-400 rounded-full"></div>
                  <div className="w-0.5 h-3 bg-pink-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Filler Words */}
        <div className="bg-app-card rounded-2xl p-5 border border-orange-500/20 shadow-lg relative overflow-hidden group hover:border-orange-500/40 transition-colors">
          <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-2 text-app-textSecondary text-xs font-semibold tracking-wider uppercase mb-3">
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                Filler Words
              </div>
              <div className="text-4xl font-bold text-white mb-1">{scorecard?.totalFillers}</div>
              <div className="text-gray-400 font-medium text-sm mb-4">Um/Like/So logs</div>
              <div className="flex items-center gap-1.5 text-xs">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span className="text-green-500 font-medium">3</span>
                <span className="text-gray-500">vs last report</span>
              </div>
            </div>
            <div className="relative w-20 h-20 flex-shrink-0 glow-orange rounded-full">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="42" stroke="#1e293b" strokeWidth="8"></circle>
                <circle 
                  className="drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" 
                  cx="50" cy="50" fill="none" r="42" stroke="#f59e0b" 
                  strokeDasharray={strokeCircumference} 
                  strokeDashoffset={264 - (264 * Math.min(30, scorecard?.totalFillers || 6)) / 30} 
                  strokeWidth="8"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-[#2c2014] rounded-full border border-orange-500/30 flex items-center justify-center shadow-inner">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics & Recommendations */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Behavioral & Eye Gaze Analytics */}
        <div className="lg:col-span-3 bg-app-card rounded-2xl border border-app-border p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide">Behavioral & Eye Gaze Analytics</h3>
          </div>
          <div className="space-y-6">
            {/* Metric 1 */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-gray-300">Camera Eye Alignment Gaze Score</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-white">{scorecard?.eyeContactScore}%</span>
                  <p className="text-xs text-cyan-400 font-medium">Excellent</p>
                </div>
              </div>
              <div className="w-full bg-[#1e293b] rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2.5 rounded-full drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" style={{ width: `${scorecard?.eyeContactScore || 88}%` }}></div>
              </div>
            </div>
            {/* Metric 2 */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-gray-300">Estimated Stress Index (Pace / Voice jitter)</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-white">{scorecard?.stressScore}%</span>
                  <p className="text-xs text-green-400 font-medium">Low</p>
                </div>
              </div>
              <div className="w-full bg-[#1e293b] rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-yellow-400 h-2.5 rounded-full drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" style={{ width: `${scorecard?.stressScore || 18}%` }}></div>
              </div>
            </div>
            {/* Insight Box */}
            <div className="mt-8 bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4z"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-400 mb-1">Insight</h4>
                <p className="text-sm text-gray-300 leading-relaxed">Great eye alignment! Your stress levels are low. Keep maintaining a steady pace.</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="lg:col-span-2 bg-app-card rounded-2xl border border-app-border p-6 shadow-lg flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide">AI Placement Recommendations</h3>
          </div>
          <div className="space-y-3 flex-1">
            {scorecard?.recommendations && scorecard.recommendations.length > 0 ? (
              scorecard.recommendations.map((rec, i) => {
                const details = getRecommendationDetails(rec, i);
                return (
                  <div 
                    key={i} 
                    onClick={() => setShowRecsModal(true)}
                    className="bg-[#1a1e2b] border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-[#1f2433] transition-colors cursor-pointer group"
                  >
                    <div className={`w-10 h-10 rounded-lg ${details.bgColor} flex items-center justify-center flex-shrink-0`}>
                      {details.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-0.5">{details.title}</h4>
                      <p className="text-[12px] text-gray-400 leading-snug">{rec}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-gray-450 italic p-4">No specific recommendations computed.</div>
            )}
          </div>
          <button 
            onClick={() => setShowRecsModal(true)}
            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] flex justify-center items-center gap-2"
          >
            View All Recommendations
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Flashcards Carousel */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            <h3 className="text-lg font-bold text-white">AI-generated study Flip Flashcards</h3>
          </div>
          <button 
            onClick={() => setShowFlashcardsModal(true)}
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
          >
            View All Flashcards
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="relative group">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {flashcardsList.map((fc, index) => {
              const isFlipped = !!flippedCards[index];
              return (
                <div 
                  key={index} 
                  onClick={() => toggleFlip(index)}
                  className="h-44 perspective-1000 cursor-pointer"
                >
                  <div className={`w-full h-full relative transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front Side */}
                    <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${fc.colorClass} rounded-2xl p-5 flex flex-col justify-between backface-hidden shadow-lg border overflow-hidden group/card`}>
                      <div className={`absolute -right-10 -top-10 w-32 h-32 ${fc.glowColor} blur-2xl rounded-full`}></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-0.5 rounded bg-white/10 border border-white/5 text-[10px] font-medium text-purple-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            Question
                          </span>
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-[10px] font-medium text-purple-300">{fc.topic}</span>
                        </div>
                        <h4 className="text-white font-medium text-sm leading-snug pr-4">{fc.question}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 group-hover/card:text-white transition-colors relative z-10">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                        Tap to flip
                      </div>
                    </div>

                    {/* Back Side (Explanation) */}
                    <div className="absolute inset-0 w-full h-full bg-[#120e29] border border-purple-500/30 rounded-2xl p-5 flex flex-col justify-between backface-hidden rotate-y-180 shadow-lg">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-400 block mb-2">AI Answer / Explanation</span>
                        <p className="text-xs text-slate-350 leading-relaxed font-medium">
                          {fc.answer}
                        </p>
                      </div>
                      <span className="text-[9px] text-purple-400 font-bold text-center">TAP TO ROTATE BACK</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Custom Gap Mini Quiz */}
      <section className="bg-app-card rounded-3xl p-6 sm:p-8 border border-app-border space-y-6">
        <div>
          <span className="text-[10px] font-bold text-accent-purple uppercase tracking-widest">Adaptive Learning</span>
          <h3 className="text-lg font-bold text-white mt-0.5">Custom Gap Mini Quiz</h3>
        </div>

        <div className="space-y-6">
          {miniQuiz.map((item, idx) => (
            <div key={idx} className="space-y-3 p-5 rounded-2xl bg-[#1a1e2b] border border-white/5 text-xs">
              <div className="font-bold text-slate-200 leading-normal flex gap-2 items-start">
                <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Question {idx + 1}: {item.q}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.options.map((opt, oIdx) => {
                  const isSelected = quizAnswers[idx] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      disabled={quizSubmitted}
                      onClick={() => setQuizAnswers(prev => ({ ...prev, [idx]: oIdx }))}
                      className={`p-3.5 rounded-xl border text-left font-medium transition-all ${
                        isSelected 
                          ? 'bg-accent-purple/10 border-accent-purple/40 text-purple-300' 
                          : 'bg-[#0f131a] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-[#181d29]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {quizSubmitted && (
                <div className="pt-2 text-[10px] leading-normal font-semibold">
                  {quizAnswers[idx] === item.correctIndex ? (
                    <span className="text-emerald-400">✔ Correct!</span>
                  ) : (
                    <span className="text-rose-400">❌ Incorrect. Correct answer: {item.options[item.correctIndex]}</span>
                  )}
                  <p className="text-slate-500 font-normal mt-1 leading-normal">{item.explanation}</p>
                </div>
              )}
            </div>
          ))}

          {!quizSubmitted ? (
            <button
              onClick={handleQuizSubmit}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-6 py-3 rounded-xl text-xs font-bold text-white shadow shadow-purple-500/10 flex items-center gap-1.5 transition-all"
            >
              Submit Quiz Answers
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs font-bold text-emerald-400 flex items-center justify-between">
              <span>Quiz Complete! Score: {quizScore} / {miniQuiz.length}</span>
              <button 
                onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}
                className="text-[10px] bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-slate-100 transition-all flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Quiz
              </button>
            </div>
          )}
        </div>
      </section>

      {/* --- MODALS FOR INTERACTIVE WORKINGS --- */}
      
      {/* 1. Recommendations Modal */}
      {showRecsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-app-card border border-app-border w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-app-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Full Placement Recommendations</h3>
              </div>
              <button onClick={() => setShowRecsModal(false)} className="p-1 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-sm text-app-textSecondary leading-normal">
                Our AI has calculated these custom targets to improve your hiring probability based on your session's eye tracking, speaking pace, and coding metrics:
              </p>
              <div className="space-y-3">
                {scorecard?.recommendations.map((rec, i) => {
                  const details = getRecommendationDetails(rec, i);
                  return (
                    <div key={i} className="p-4 rounded-xl bg-[#1a1e2b] border border-white/5 flex gap-4 items-start">
                      <div className={`w-10 h-10 rounded-lg ${details.bgColor} flex items-center justify-center shrink-0`}>
                        {details.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">{details.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{rec}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 bg-[#0f131a] border-t border-app-border text-right">
              <button onClick={() => setShowRecsModal(false)} className="bg-gradient-to-r from-blue-600 to-purple-650 text-white font-semibold py-2 px-5 rounded-lg text-xs hover:opacity-90">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Flashcards Modal */}
      {showFlashcardsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-app-card border border-app-border w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-app-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">AI study Flashcards Bank</h3>
              </div>
              <button onClick={() => setShowFlashcardsModal(false)} className="p-1 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {flashcardsList.map((fc, index) => {
                const isFlipped = !!flippedCards[`modal_${index}`];
                return (
                  <div 
                    key={index} 
                    onClick={() => setFlippedCards(prev => ({ ...prev, [`modal_${index}`]: !isFlipped }))}
                    className="h-44 perspective-1000 cursor-pointer"
                  >
                    <div className={`w-full h-full relative transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                      {/* Front Side */}
                      <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${fc.colorClass} rounded-2xl p-5 flex flex-col justify-between backface-hidden shadow-lg border overflow-hidden`}>
                        <div className="relative z-10">
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-[9px] font-bold text-purple-300">{fc.topic}</span>
                          <h4 className="text-white font-bold text-sm leading-snug mt-3">{fc.question}</h4>
                        </div>
                        <div className="text-xs text-purple-300/80 font-bold">CLICK TO FLIP</div>
                      </div>

                      {/* Back Side */}
                      <div className="absolute inset-0 w-full h-full bg-[#120e29] border border-purple-500/30 rounded-2xl p-5 flex flex-col justify-between backface-hidden rotate-y-180 shadow-lg">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-cyan-400 block mb-2">{fc.topic} - AI Answer</span>
                          <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                            {fc.answer}
                          </p>
                        </div>
                        <span className="text-[9px] text-purple-400 font-bold">CLICK TO FLIP FRONT</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 bg-[#0f131a] border-t border-app-border text-right">
              <button onClick={() => setShowFlashcardsModal(false)} className="bg-gradient-to-r from-blue-600 to-purple-650 text-white font-semibold py-2 px-5 rounded-lg text-xs hover:opacity-90">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
