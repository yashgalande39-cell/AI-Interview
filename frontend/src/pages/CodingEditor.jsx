import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import { 
  Terminal, Play, CheckSquare, ShieldAlert, Award, 
  Code, RefreshCw, ChevronRight, Minimize2, Maximize2,
  Search, Filter, BookOpen, Building, CheckCircle2, XCircle, 
  AlertCircle, ChevronLeft, Save, Trash2, LayoutGrid, ListFilter
} from 'lucide-react';

const TOPICS = [
  "Arrays", "Strings", "Linked Lists", "Trees", "Graphs",
  "Dynamic Programming", "Stacks", "Queues", "Sliding Window", "Greedy",
  "Backtracking", "Binary Search", "Math", "Bit Manipulation", "Recursion",
  "Heaps", "Matrix", "Design", "Hash Tables", "Sorting"
];

const COMPANIES = [
  "Google", "Meta", "Amazon", "Microsoft", "Netflix", "Apple",
  "Uber", "Stripe", "Airbnb", "TCS", "Infosys"
];

export default function CodingEditor() {
  const { token, updateXp } = useAuth();
  
  // Sidebar listing & filters
  const [challenges, setChallenges] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(20);

  // Editor states
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [editorTheme, setEditorTheme] = useState('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Compiler state
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [submitFeedback, setSubmitFeedback] = useState(null);

  // Anti-Cheat alerts
  const [cheatingStrikes, setCheatingStrikes] = useState(0);
  const [strikeWarning, setStrikeWarning] = useState('');
  const [blockPaste, setBlockPaste] = useState(true);

  // Expand panel toggle
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Fetch challenge list based on page / filters
  const fetchChallengesList = async () => {
    setLoadingList(true);
    try {
      const res = await fetch(
        `${API_BASE}/coding/challenges?page=${page}&limit=${limit}&query=${searchQuery}&difficulty=${difficultyFilter}&topic=${topicFilter}&company=${companyFilter}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.challenges);
        setTotalPages(data.totalPages);
        setTotalItems(data.total);

        // Auto select first challenge if none is selected
        if (data.challenges.length > 0 && !activeChallenge) {
          fetchChallengeDetails(data.challenges[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load challenges:", err);
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch full details of selected challenge
  const fetchChallengeDetails = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_BASE}/coding/challenges/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveChallenge(data);
        setTestResults([]);
        setConsoleLogs([]);
        setSubmitFeedback(null);

        // Check if there is a saved local draft
        const draft = localStorage.getItem(`draft_${data.id}_${language}`);
        if (draft) {
          setCode(draft);
        } else {
          setCode(data.templates[language] || "");
        }
      }
    } catch (err) {
      console.error("Failed to load challenge details:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Trigger loading challenges list whenever filters or page changes
  useEffect(() => {
    fetchChallengesList();
  }, [page, difficultyFilter, topicFilter, companyFilter]);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchChallengesList();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Update editor templates on language changes or active challenge change
  useEffect(() => {
    if (activeChallenge) {
      const draft = localStorage.getItem(`draft_${activeChallenge.id}_${language}`);
      if (draft) {
        setCode(draft);
      } else {
        setCode(activeChallenge.templates[language] || "");
      }
      setTestResults([]);
      setConsoleLogs([]);
      setSubmitFeedback(null);
    }
  }, [language, activeChallenge]);

  // Anti-Cheat: Screen blur focus tracking
  useEffect(() => {
    const handleBlur = () => {
      setCheatingStrikes(prev => {
        const next = prev + 1;
        setStrikeWarning(`🚨 Anti-Cheat Warning Strike ${next}/3: Focus shifted outside editor!`);
        if (next >= 3) {
          alert("🚨 Strike Limit Reached! Submissions disabled due to security strikes.");
        }
        return next;
      });
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  // Save Code Draft LocalStorage helper
  const handleSaveDraft = () => {
    if (activeChallenge) {
      localStorage.setItem(`draft_${activeChallenge.id}_${language}`, code);
      alert("💾 Code draft saved successfully in your local storage!");
    }
  };

  // Clear Code Draft
  const handleResetTemplate = () => {
    if (activeChallenge && window.confirm("Are you sure you want to reset your editor to the default template?")) {
      localStorage.removeItem(`draft_${activeChallenge.id}_${language}`);
      setCode(activeChallenge.templates[language] || "");
    }
  };

  // VM Sandbox Compiler Runner
  const handleRunCode = async () => {
    if (cheatingStrikes >= 3) {
      alert("Submission suspended due to anti-cheat strikes.");
      return;
    }

    setRunning(true);
    setConsoleLogs(["Initializing secure backend VM compilation sandbox...", "Running syntax validations..."]);
    setTestResults([]);
    setSubmitFeedback(null);
    
    try {
      const res = await fetch(`${API_BASE}/coding/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          challengeId: activeChallenge.id,
          language,
          code
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTestResults(data.results);
        
        // Accumulate logs from test runs
        const combinedLogs = ["✔ Compilation complete. Executed tests successfully."];
        data.results.forEach(tr => {
          if (tr.logs && tr.logs.length > 0) {
            combinedLogs.push(`[Case ${tr.caseNum} Logs]: ${tr.logs.join(', ')}`);
          }
          if (tr.status === "ERROR") {
            combinedLogs.push(`❌ Case ${tr.caseNum} Error: ${tr.error}`);
          }
        });
        combinedLogs.push(data.success ? "🎉 Output matched perfectly across visible cases!" : "❌ Some test cases did not pass.");
        setConsoleLogs(combinedLogs);
      } else {
        const errData = await res.json();
        setConsoleLogs([`❌ Server Sandbox Error: ${errData.message || "Failed execution"}`]);
      }
    } catch (err) {
      setConsoleLogs([`❌ Compilation connection error: ${err.message}`]);
    } finally {
      setRunning(false);
    }
  };

  // Submit Answer (Live grading & XP award)
  const handleSubmitCode = async () => {
    if (cheatingStrikes >= 3) {
      alert("Submission rejected due to anti-cheat strikes.");
      return;
    }

    setSubmitting(true);
    setConsoleLogs(["Running all evaluation validations..."]);
    setSubmitFeedback(null);
    
    try {
      const res = await fetch(`${API_BASE}/coding/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          challengeId: activeChallenge.id,
          language,
          code
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTestResults(data.results);
        setSubmitFeedback({
          success: data.success,
          message: data.message,
          xpAwarded: data.xpAwarded
        });

        if (data.success) {
          setConsoleLogs(["🎉 SUCCESS!", "Your solution is fully correct.", "XP has been synchronized!"]);
          updateXp(200, "Coding Master");
          
          // Clear draft on successful submission
          localStorage.removeItem(`draft_${activeChallenge.id}_${language}`);
        } else {
          setConsoleLogs(["❌ Wrong Answer.", "Optimize your logic and check edge cases."]);
        }
      } else {
        const errData = await res.json();
        setConsoleLogs([`❌ Submission connection error: ${errData.message}`]);
      }
    } catch (err) {
      setConsoleLogs([`❌ Submission Connection Exception: ${err.message}`]);
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'Medium': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'Hard': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      default: return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className={`flex-1 flex overflow-hidden relative bg-darkBg text-slate-100 ${isFullScreen ? 'z-[1000] fixed inset-0' : 'h-[calc(100vh-76px)]'}`}>
      
      {/* 1. LEFT DRAWER: Challenges Explorer (Collapsible) */}
      <div 
        className={`shrink-0 border-r border-slate-900 bg-slate-950/60 backdrop-blur-md transition-all duration-300 flex flex-col ${
          isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
        }`}
      >
        {/* Header Title */}
        <div className="p-4 border-b border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-black tracking-wide text-slate-100">Problem Explorer</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-bold">
            {totalItems} Tasks
          </span>
        </div>

        {/* Filter controls */}
        <div className="p-3 border-b border-slate-900 space-y-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900/80 border border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-violet-500/50 text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={e => { setPage(1); setDifficultyFilter(e.target.value); }}
              className="px-2 py-1 bg-slate-900 border border-slate-850 rounded-xl text-[10px] font-bold text-slate-400 focus:outline-none"
            >
              <option value="All">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Topic Filter */}
            <select
              value={topicFilter}
              onChange={e => { setPage(1); setTopicFilter(e.target.value); }}
              className="px-2 py-1 bg-slate-900 border border-slate-850 rounded-xl text-[10px] font-bold text-slate-400 focus:outline-none"
            >
              <option value="All">All Topics</option>
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Company Filter */}
          <select
            value={companyFilter}
            onChange={e => { setPage(1); setCompanyFilter(e.target.value); }}
            className="w-full px-2 py-1 bg-slate-900 border border-slate-850 rounded-xl text-[10px] font-bold text-slate-400 focus:outline-none"
          >
            <option value="All">All Companies</option>
            {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Problems list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-950">
          {loadingList ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <RefreshCw className="w-5 h-5 text-slate-500 animate-spin" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Syncing database...</span>
            </div>
          ) : challenges.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              No matching challenges found.
            </div>
          ) : (
            challenges.map(ch => (
              <button
                key={ch.id}
                onClick={() => fetchChallengeDetails(ch.id)}
                className={`w-full p-3 text-left transition-all flex flex-col space-y-1.5 hover:bg-slate-900/40 border-l-2 ${
                  activeChallenge?.id === ch.id 
                    ? 'bg-violet-950/10 border-l-violet-500 border-r border-r-violet-500/10' 
                    : 'border-l-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-black tracking-wide truncate ${
                    activeChallenge?.id === ch.id ? 'text-violet-400' : 'text-slate-200'
                  }`}>
                    {ch.title}
                  </span>
                  <span className={`text-[8px] px-1.5 rounded-full uppercase tracking-wider font-extrabold shrink-0 border ${getDifficultyColor(ch.difficulty)}`}>
                    {ch.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[9px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1"><BookOpen className="w-2.5 h-2.5" /> {ch.topic}</span>
                  <span className="flex items-center gap-1"><Building className="w-2.5 h-2.5" /> {ch.company}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Sidebar pagination footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-900 flex justify-between items-center bg-slate-950">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-30 hover:text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-30 hover:text-slate-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/10">
        
        {/* Anti-cheat banner warning */}
        {strikeWarning && (
          <div className="flex items-center gap-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 px-6 py-3 text-xs font-bold animate-pulse">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{strikeWarning} (Security strikes prevent submit validations). Strike threshold: 3</span>
          </div>
        )}

        {/* Global Toolbar Header */}
        <div className="px-6 py-3 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl border border-slate-850 hover:border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 transition-colors"
              title="Toggle Problem Sidebar"
            >
              <ListFilter className="w-4 h-4" />
            </button>
            
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">AI Interactive Platform</span>
              <span className="text-xs font-black text-slate-300">DSA Sandbox compiler</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Custom Warning Indicator */}
            {cheatingStrikes > 0 && (
              <span className="text-[10px] px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-extrabold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Strikes: {cheatingStrikes}/3
              </span>
            )}
            
            {/* Fullscreen Toggle */}
            <button 
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-xl border border-slate-850 hover:border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Workspace Split Panels */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden items-stretch">
          
          {/* LEFT COMPONENT: Challenge description details */}
          <div className="overflow-y-auto border-r border-slate-900 bg-slate-950/15 p-6 space-y-6">
            {loadingDetail ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 py-20">
                <RefreshCw className="w-7 h-7 text-violet-400 animate-spin" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading specs...</span>
              </div>
            ) : activeChallenge ? (
              <>
                {/* Title & Metadata */}
                <div className="flex items-start justify-between border-b border-slate-900 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-100">{activeChallenge.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3 text-violet-400" /> {activeChallenge.topic}</span>
                      <span className="flex items-center gap-1"><Building className="w-3 h-3 text-violet-400" /> {activeChallenge.company}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border tracking-wider shrink-0 ${getDifficultyColor(activeChallenge.difficulty)}`}>
                    {activeChallenge.difficulty}
                  </span>
                </div>

                {/* Problem details text */}
                <div className="text-sm text-slate-300 leading-relaxed font-medium space-y-4">
                  <p>{activeChallenge.description}</p>
                </div>

                {/* Constraints */}
                <div className="space-y-2 bg-slate-950/20 border border-slate-900/60 p-4 rounded-2xl">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-violet-400" /> Constraints & Metrics
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5 pl-1 font-semibold">
                    {activeChallenge.constraints.map((c, i) => <li key={i} className="leading-relaxed">{c}</li>)}
                  </ul>
                </div>

                {/* Sample Test Case Logs */}
                <div className="space-y-4 pt-4 border-t border-slate-900">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-violet-400" /> Sandbox Sample Cases
                  </h4>
                  <div className="space-y-3">
                    {activeChallenge.testCases.slice(0, 2).map((tc, i) => {
                      const inputParsed = JSON.parse(tc.input);
                      const expectedParsed = JSON.parse(tc.expected);
                      return (
                        <div key={i} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-900 space-y-2 text-xs">
                          <div className="flex justify-between font-black text-[10px] text-slate-500 uppercase tracking-wider">
                            <span>Sample Case {i + 1}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold">Input Arguments:</span>
                            <pre className="mt-1 bg-slate-950 border border-slate-900 p-2.5 rounded-xl font-mono text-[10px] text-slate-300 overflow-x-auto">
                              {JSON.stringify(inputParsed, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold">Expected Output:</span>
                            <code className="bg-slate-950 px-2 py-1 border border-slate-900 rounded font-mono text-[10px] text-violet-400 ml-2 font-bold">
                              {JSON.stringify(expectedParsed)}
                            </code>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-500 font-semibold py-20">
                Choose a programming challenge to get started.
              </div>
            )}
          </div>

          {/* RIGHT COMPONENT: Editor space, compiler logs & terminal */}
          <div className="overflow-y-auto bg-slate-950/30 flex flex-col">
            
            {/* Editor config header */}
            <div className="px-6 py-3 border-b border-slate-900 bg-slate-950/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-black text-slate-300 uppercase tracking-wide">Workspace Editor</span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Language Select */}
                <select 
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 text-xs font-bold focus:border-violet-500/50 outline-none"
                >
                  <option value="javascript">JavaScript (VM Executed)</option>
                  <option value="python">Python 3 (Simulated)</option>
                  <option value="cpp">C++ 17 (Simulated)</option>
                  <option value="java">Java 11 (Simulated)</option>
                </select>
              </div>
            </div>

            {/* Code Sandbox input workspace */}
            <div className="relative w-full bg-slate-950 p-4 border-b border-slate-900 font-mono text-xs leading-normal">
              {/* Copy blocker notification warning */}
              <textarea
                value={code}
                onPaste={e => {
                  if (blockPaste) {
                    e.preventDefault();
                    setStrikeWarning("🚨 Copy/Paste blocked! Write code manually to build muscle memory.");
                  }
                }}
                onChange={e => setCode(e.target.value)}
                className="w-full h-80 bg-transparent text-slate-200 outline-none resize-none leading-relaxed font-mono focus:ring-0 select-text"
                spellCheck="false"
                style={{ tabSize: 2 }}
              />

              {/* Utility overlay drafts */}
              <div className="absolute right-4 bottom-4 flex items-center gap-2">
                <button
                  onClick={handleSaveDraft}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Save Code Draft"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetTemplate}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Reset Default Template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Output feedback notifications */}
            {submitFeedback && (
              <div className={`m-4 p-4 rounded-2xl border ${
                submitFeedback.success 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              } flex items-start gap-3`}>
                {submitFeedback.success ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div>
                  <h5 className="font-black text-xs uppercase tracking-wider">{submitFeedback.success ? "Passed Verification" : "Failed Verification"}</h5>
                  <p className="text-xs font-semibold mt-1">{submitFeedback.message}</p>
                </div>
              </div>
            )}

            {/* Test Case Executions results console */}
            {testResults.length > 0 && (
              <div className="m-4 p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-3">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-violet-400" /> Test execution Results
                </div>
                <div className="space-y-2">
                  {testResults.map(tr => (
                    <div 
                      key={tr.caseNum} 
                      className={`p-3 rounded-xl border flex flex-col space-y-2 text-xs font-semibold ${
                        tr.status === "PASS" 
                          ? 'bg-emerald-500/5 border-emerald-500/10' 
                          : 'bg-rose-500/5 border-rose-500/10'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-extrabold">Case {tr.caseNum}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          tr.status === "PASS" ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {tr.status}
                        </span>
                      </div>
                      
                      {/* Show Timing for pass/fail */}
                      {tr.durationMs !== undefined && (
                        <div className="text-[9px] text-slate-500 font-bold">Execution duration: {tr.durationMs}ms</div>
                      )}

                      {tr.status !== "PASS" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono mt-1">
                          <div className="bg-slate-950 border border-slate-900/60 p-2 rounded-lg">
                            <span className="text-slate-500 font-bold block mb-1">Expected Output:</span>
                            <span className="text-violet-400 font-bold">{tr.expected}</span>
                          </div>
                          <div className="bg-slate-950 border border-slate-900/60 p-2 rounded-lg">
                            <span className="text-slate-500 font-bold block mb-1">Returned Output:</span>
                            <span className="text-rose-400 font-bold">{tr.actual || tr.error || "undefined"}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Output Terminal Console Log list */}
            {consoleLogs.length > 0 && (
              <div className="mx-4 mb-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-900 font-mono text-[10px] text-slate-400 space-y-1 leading-normal max-h-36 overflow-y-auto">
                <div className="text-slate-500 uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-violet-400" /> Virtual Compiler logs
                </div>
                {consoleLogs.map((log, idx) => <div key={idx} className="font-semibold">{log}</div>)}
              </div>
            )}

            {/* Command controls layout */}
            <div className="mt-auto px-6 py-4 border-t border-slate-900 bg-slate-950/50 flex justify-end gap-3 items-center">
              {/* Block paste toggle check */}
              <label className="flex items-center gap-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest cursor-pointer select-none mr-auto">
                <input
                  type="checkbox"
                  checked={blockPaste}
                  onChange={e => setBlockPaste(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-violet-500 focus:ring-0 cursor-pointer"
                />
                Block Copy Paste
              </label>

              <button
                onClick={handleRunCode}
                disabled={running || !activeChallenge}
                className="px-5 py-3 rounded-xl border border-slate-850 hover:border-slate-800 bg-slate-900 hover:bg-slate-850 text-xs font-bold text-slate-300 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Terminal className="w-4 h-4 text-violet-400" /> {running ? "Compiling..." : "Run Test Cases"}
              </button>
              
              <button
                onClick={handleSubmitCode}
                disabled={submitting || cheatingStrikes >= 3 || !activeChallenge}
                className="bg-glow-gradient px-6 py-3 rounded-xl text-xs font-black text-white shadow-lg hover:shadow-violet-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                Submit Answer <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
