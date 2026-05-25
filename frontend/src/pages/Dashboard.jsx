import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Flame, Award, BookOpen, Clock, Calendar, CheckCircle2, 
  TrendingUp, Compass, ChevronRight, Play, AlertCircle 
} from 'lucide-react';

export default function Dashboard() {
  const { user, token, updateXp } = useAuth();
  const [history, setHistory] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [readinessScore, setReadinessScore] = useState(65);
  const [loading, setLoading] = useState(true);

  // Timed Scheduled Session State
  const [scheduledInterviews, setScheduledInterviews] = useState([
    { id: "sch_1", role: "Software Engineer", date: "Tomorrow, 10:00 AM", company: "Google" },
    { id: "sch_2", role: "Web Developer", date: "May 28, 02:30 PM", company: "Amazon" }
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // 1. Fetch History
        const histRes = await fetch('http://localhost:5000/api/interviews/history', { headers });
        if (histRes.ok) {
          const histData = await histRes.json();
          setHistory(histData.history || []);
        }

        // 2. Fetch Challenges
        const chalRes = await fetch('http://localhost:5000/api/gamification/challenges', { headers });
        if (chalRes.ok) {
          const chalData = await chalRes.json();
          setChallenges(chalData.challenges || []);
        }
      } catch (err) {
        console.warn("Server offline, loading mock dashboard datasets", err.message);
        // Offline Fallback Mock Datasets
        setHistory([
          { 
            id: "int_mock_1", 
            type: "HR", 
            role: "Software Engineer", 
            company: "TCS", 
            startedAt: "2026-05-20T10:00:00Z",
            scoreCard: { overallScore: 78, technicalScore: 75, communicationScore: 82, completedAt: "2026-05-20T10:30:00Z" }
          },
          { 
            id: "int_mock_2", 
            type: "Coding", 
            role: "Software Engineer", 
            company: "Infosys", 
            startedAt: "2026-05-22T14:00:00Z",
            scoreCard: { overallScore: 84, technicalScore: 88, communicationScore: 80, completedAt: "2026-05-22T14:45:00Z" }
          }
        ]);
        setChallenges([
          { id: "ch_1", title: "Array Master", description: "Solve 2 array problems in a day", xp: 100 },
          { id: "ch_2", title: "Speech Perfect", description: "Complete a mock HR interview with >90% fluency", xp: 150 },
          { id: "ch_3", title: "Daily Grind", description: "Attend your daily mock check-in challenge", xp: 50 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Compute placement readiness score based on XP and latest test attempts
  useEffect(() => {
    if (user) {
      let base = 50;
      // XP bonus
      base += Math.min(25, Math.floor((user.xp || 0) / 100));
      // Streak bonus
      base += Math.min(10, (user.streak || 1) * 2);
      // History bonus
      if (history.length > 0) {
        const avgScore = history.reduce((sum, h) => sum + (h.scoreCard?.overallScore || 65), 0) / history.length;
        base += Math.min(15, Math.floor(avgScore - 60));
      }
      setReadinessScore(Math.min(98, Math.max(45, base)));
    }
  }, [user, history]);

  // Recharts score trends over months
  const chartData = [
    { name: 'Jan', score: 62 },
    { name: 'Feb', score: 68 },
    { name: 'Mar', score: 72 },
    { name: 'Apr', score: 76 },
    { name: 'May', score: history.length > 0 ? Math.round(history.reduce((s, h) => s + (h.scoreCard?.overallScore || 70), 0) / history.length) : 80 }
  ];

  // Radar charts skill parameters
  const radarData = [
    { subject: 'Technical', A: history.length > 0 ? Math.round(history.reduce((s, h) => s + (h.scoreCard?.technicalScore || 70), 0) / history.length) : 75, fullMark: 100 },
    { subject: 'Fluency', A: history.length > 0 ? Math.round(history.reduce((s, h) => s + (h.scoreCard?.communicationScore || 70), 0) / history.length) : 78, fullMark: 100 },
    { subject: 'Eye Contact', A: 82, fullMark: 100 },
    { subject: 'Stress Mgmt', A: 80, fullMark: 100 },
    { subject: 'Pace', A: 85, fullMark: 100 },
    { subject: 'Coding', A: 70, fullMark: 100 }
  ];

  const handleCompleteChallenge = async (chId, xpAmt) => {
    try {
      const res = await fetch('http://localhost:5000/api/gamification/complete-challenge', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ challengeId: chId })
      });
      if (res.ok) {
        updateXp(xpAmt);
        setChallenges(prev => prev.filter(c => c.id !== chId));
      } else {
        throw new Error("Challenge failed");
      }
    } catch (e) {
      // Local updates if server is mock
      updateXp(xpAmt);
      setChallenges(prev => prev.filter(c => c.id !== chId));
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-accentViolet border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-76px)]">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-accentViolet/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 text-center md:text-left relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Welcome back, <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{user?.name}</span>!
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg leading-relaxed">
            You've completed <span className="font-bold text-slate-300">{history.length}</span> practice attempts this season. Keep going to boost your ready score!
          </p>
        </div>
        <div className="flex items-center gap-4 relative z-10 shrink-0">
          <Link to="/lobby" className="bg-glow-gradient px-6 py-3.5 rounded-xl text-xs font-bold text-white shadow-lg hover:shadow-violet-500/20 hover:scale-[1.02] transition-all flex items-center gap-2">
            🎙️ Start Live Mock
          </Link>
          <Link to="/resume" className="bg-slate-900 border border-slate-800 hover:bg-slate-850 px-6 py-3.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-slate-200 transition-all">
            📄 Upload Resume
          </Link>
        </div>
      </div>

      {/* Grid: Speedometer & Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Speedometer Gauges Card */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-4 left-4 text-xs font-bold uppercase tracking-widest text-slate-500">
            Readiness Index
          </div>
          
          {/* Circular speed Gauge */}
          <div className="relative w-44 h-44 flex items-center justify-center mt-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.04)" strokeWidth="8" fill="none" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="url(#neon-grad)" 
                strokeWidth="8" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * readinessScore) / 100}
                strokeLinecap="round" 
                fill="none" 
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="neon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                {readinessScore}%
              </span>
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 mt-0.5">
                Job Placed Prob
              </span>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-300 mt-6 max-w-xs">
            {readinessScore >= 80 ? (
              <span className="text-emerald-400 font-bold">✨ Placement Ready!</span>
            ) : (
              <span>Add skills to your resume to increase rating.</span>
            )}
          </div>
        </div>

        {/* Analytics Charts Area */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Monthly Sprints</span>
              <h3 className="text-lg font-bold text-slate-200 mt-0.5">Score Progress Log</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-accentCyan" /> Upward Trend
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#chartGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skills Balance Radar Chart & Daily Sprints */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Radar Map */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Balance Matrix</span>
            <h3 className="text-lg font-bold text-slate-200 mt-0.5">6-Axes Skill Rating</h3>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar name="Metrics" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Sprints */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Engagement</span>
            <h3 className="text-lg font-bold text-slate-200 mt-0.5">Daily Challenges</h3>
          </div>

          <div className="space-y-3">
            {challenges.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                🎉 All challenges completed! Check back tomorrow.
              </div>
            ) : (
              challenges.map((ch) => (
                <div key={ch.id} className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-900 flex justify-between items-center gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-200">{ch.title}</div>
                    <div className="text-[10px] text-slate-500 leading-normal">{ch.description}</div>
                  </div>
                  <button 
                    onClick={() => handleCompleteChallenge(ch.id, ch.xp)}
                    className="px-3 py-1.5 rounded-lg bg-accentCyan/10 border border-accentCyan/20 text-accentCyan hover:bg-accentCyan hover:text-slate-950 text-[10px] font-bold transition-all shrink-0"
                  >
                    +{ch.xp} XP
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Mock Calendar Slots */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Schedule</span>
            <h3 className="text-lg font-bold text-slate-200 mt-0.5">Mock Calendar Slots</h3>
          </div>

          <div className="space-y-3">
            {scheduledInterviews.map((sch) => (
              <div key={sch.id} className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-900 flex justify-between items-center">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-200">{sch.role}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {sch.date}
                  </div>
                  <div className="text-[9px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full inline-block font-semibold">
                    🏢 {sch.company} Match
                  </div>
                </div>
                <Link to="/lobby" className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-glow-gradient hover:text-white transition-all shrink-0">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History log & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent attempts list */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-200">Recent Attempt Logs</h3>
            <span className="text-xs text-slate-500 font-medium">History count: {history.length}</span>
          </div>

          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                No previous interviews recorded yet. Attend your first round!
              </div>
            ) : (
              history.map((hist) => (
                <div key={hist.id} className="p-4 rounded-2xl bg-slate-950/30 border border-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{hist.role}</span>
                      <span className="text-[9px] px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full font-bold uppercase tracking-wider">
                        {hist.type}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      🏢 Target: {hist.company || 'Common'} • Attempted: {new Date(hist.startedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {hist.scoreCard ? (
                      <div className="text-right shrink-0">
                        <div className="text-sm font-extrabold text-accentCyan">{hist.scoreCard.overallScore}%</div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase">Score</div>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2 py-1 rounded font-bold uppercase">Incomplete</span>
                    )}

                    {hist.scoreCard && (
                      <Link 
                        to={`/feedback?sessionId=${hist.id}`} 
                        className="px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-850 text-xs font-bold text-slate-300 hover:text-slate-200 transition-all flex items-center gap-1.5"
                      >
                        Details <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Recommendations Engine */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-200">AI Preparation Roadmaps</h3>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10 space-y-2">
              <div className="flex items-center gap-2 text-violet-400 font-bold text-xs">
                <Compass className="w-4 h-4" /> Focus: Algorithmic Complexity
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Based on your coding metrics, work on space bounds. We recommend studying our dynamic **Array Master** and **Two Sum** retry quiz notes.
              </p>
              <Link to="/roadmap" className="text-[10px] font-bold text-violet-400 hover:underline flex items-center gap-0.5">
                Inspect Roadmap <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <Flame className="w-4 h-4" /> Speech Pace Adjustments
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Your average speaking speed was clocked at 145 WPM. Re-practice the HR introduction slot, pacing answers to under 120 WPM.
              </p>
              <Link to="/lobby" className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-0.5">
                Practice Voice <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
