import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, Plus, Trash2, CheckCircle2, 
  HelpCircle, Database, Server, BarChart3, Lock 
} from 'lucide-react';

export default function AdminPanel() {
  const { token, user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Question Form
  const [type, setType] = useState('HR');
  const [difficulty, setDifficulty] = useState('Easy');
  const [role, setRole] = useState('Software Engineer');
  const [company, setCompany] = useState('Common');
  const [questionText, setQuestionText] = useState('');

  const [notif, setNotif] = useState('');

  const systemStats = [
    { label: "Active Candidates", value: "1,245", sub: "+12% this week" },
    { label: "Mock Sprints Conducted", value: "14,892", sub: "94.6% Success" },
    { label: "Avg ATS Scan Score", value: "78%", sub: "+4% improvement" }
  ];

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/gamification/gd-topic', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // We can just grab questions from local mock DB managers
      } catch (e) {
        console.warn("Server offline, using default questions bank", e.message);
      } finally {
        setQuestions([
          { id: "q_1", type: "HR", difficulty: "Easy", role: "All", company: "Common", question: "Tell me about yourself and walk me through your resume." },
          { id: "q_2", type: "Technical", difficulty: "Medium", role: "Software Engineer", company: "Google", question: "Explain the four main pillars of OOP with examples." },
          { id: "q_3", type: "Coding", difficulty: "Easy", role: "Software Engineer", company: "TCS", question: "Write a function reverseString(s) that takes a string." }
        ]);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [token]);

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const newQ = {
      id: `q_admin_${Date.now()}`,
      type,
      difficulty,
      role,
      company,
      question: questionText
    };

    setQuestions(prev => [newQ, ...prev]);
    setQuestionText('');
    setNotif("🎉 Question added to active mock database!");
    setTimeout(() => setNotif(""), 3000);
  };

  const handleDeleteQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    setNotif("🗑️ Question removed from active database.");
    setTimeout(() => setNotif(""), 3000);
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-76px)]">
      
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          🛡️ Admin Control Panel
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm">
          Audit mock parameters, append custom questions to core databases, and review platform traffic logs.
        </p>
      </div>

      {notif && (
        <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 p-4 rounded-2xl text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {/* Grid: Traffic stats summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {systemStats.map((stat, i) => (
          <div key={i} className="glass-panel rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br from-slate-950/40 to-slate-900/20">
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-accentViolet/5 rounded-full blur-xl pointer-events-none"></div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">{stat.label}</span>
            <div className="text-2xl font-black text-slate-200 mt-2">{stat.value}</div>
            <div className="text-[10px] text-accentCyan mt-1 font-semibold">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Grid: Add questions vs current DB listing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Question Builder Form */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 font-bold text-slate-200">
            <Plus className="w-5 h-5 text-accentCyan" /> Database Question Builder
          </div>

          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-550 uppercase tracking-widest pl-1">Domain</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-350 outline-none">
                  <option value="HR">HR</option>
                  <option value="Technical">Technical</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="Aptitude">Aptitude</option>
                  <option value="Coding">Coding</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-550 uppercase tracking-widest pl-1">Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-350 outline-none">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-550 uppercase tracking-widest pl-1">Target Role</label>
                <input type="text" value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-550 uppercase tracking-widest pl-1">Target Company</label>
                <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 outline-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-550 uppercase tracking-widest pl-1">Question Description</label>
              <textarea 
                value={questionText} 
                onChange={e => setQuestionText(e.target.value)}
                placeholder="Type out custom interview question details..." 
                className="w-full h-24 p-3 rounded-xl bg-slate-950/40 border border-slate-850 text-slate-300 text-xs focus:border-accentViolet outline-none transition-all leading-relaxed resize-none"
              />
            </div>

            <button type="submit" className="w-full bg-glow-gradient py-3.5 rounded-xl text-xs font-bold text-white shadow shadow-violet-500/10 transition-all hover:scale-102 active:scale-95">
              Add Question to DB
            </button>
          </form>
        </div>

        {/* Right Column: DB Listing list */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 font-bold text-slate-200">
            <Database className="w-5 h-5 text-accentViolet" /> Current Active Questions ({questions.length})
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
            {questions.map((q) => (
              <div key={q.id} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-900 flex justify-between items-start gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[8px] px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold uppercase tracking-wider">
                      {q.type}
                    </span>
                    <span className="text-[8px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold uppercase tracking-wider">
                      {q.difficulty}
                    </span>
                    <span className="text-[8px] text-slate-550 font-bold">🎯 {q.role} • 🏢 {q.company}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal">"{q.question}"</p>
                </div>

                <button 
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-2.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 hover:border-rose-500/20 text-rose-400 hover:text-rose-350 transition-all shrink-0 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
