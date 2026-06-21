import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Mic, Code2, FileText, Flame, Zap,
  ArrowRight, CheckCircle, Circle, Bot, X, Users,
  BarChart3, Shield, MessagesSquare, Lightbulb, Send, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MetricRing from '../components/ui/MetricRing';
import { SkeletonDashboard } from '../components/ui/SkeletonCard';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [history, setHistory] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [readinessScore, setReadinessScore] = useState(87);
  const [loading, setLoading] = useState(true);
  const [showAiBanner, setShowAiBanner] = useState(true);

  // Aura Chatbot states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', text: 'Hello! I am Aura, your AI interview preparation assistant. How can I help you optimize your tech prep today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = { role: 'user', text: chatInput.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/chat-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg.text,
          chatHistory: chatMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am having trouble connecting to the server. Please try again later.' }]);
    } finally {
      setChatLoading(false);
    }
  };


  // Dynamic user details
  const userName = user?.name || "Atlas Test";
  const userStreak = user?.streak || 0;
  const userXp = user?.xp || 100;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const histRes = await fetch(`${API_BASE}/interviews/history`, { headers });
        if (histRes.ok) {
          const histData = await histRes.json();
          setHistory(histData.history || []);
        }

        const resumeRes = await fetch(`${API_BASE}/resumes`, { headers });
        if (resumeRes.ok) {
          const resumeData = await resumeRes.json();
          setResumes(resumeData.resumes || []);
        } else {
          setResumes([]);
        }
      } catch (err) {
        console.warn("Failed fetching dashboard history/resumes", err.message);
        setHistory([]);
        setResumes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Compute placement readiness score based on XP and test attempts
  useEffect(() => {
    if (user) {
      let base = 50;
      base += Math.min(25, Math.floor((user.xp || 0) / 100));
      base += Math.min(10, (user.streak || 1) * 2);
      const completed = history.filter(h => h.status === 'completed' || h.scoreCard);
      if (completed.length > 0) {
        const avgScore = completed.reduce((sum, h) => sum + (h.scoreCard?.overallScore || 65), 0) / completed.length;
        base += Math.min(15, Math.floor(avgScore - 60));
      }
      const timer = setTimeout(() => {
        setReadinessScore(Math.min(98, Math.max(45, base)));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, history]);

  const completed = history.filter(h => h.status === 'completed' || h.scoreCard);
  const completedCount = completed.length;

  // Calculate solved challenges based on XP
  // 100 starting XP, each solved challenge is 200 XP, completed interviews award 150+ XP.
  const solvedCount = Math.floor(Math.max(0, (userXp - 100 - (completedCount * 150)) / 200));
  const codingScore = Math.max(0, solvedCount * 100 + Math.min(300, Math.floor(userXp * 0.1)));

  // Compute breakdown averages from real scorecards
  let avgTech = 0;
  let avgComm = 0;
  let avgEye = 0;
  let avgStress = 0;

  if (completedCount > 0) {
    const techSum = completed.reduce((sum, h) => sum + (h.scoreCard?.technicalScore || 70), 0);
    const commSum = completed.reduce((sum, h) => sum + (h.scoreCard?.communicationScore || 70), 0);
    const eyeSum = completed.reduce((sum, h) => sum + (h.scoreCard?.eyeContactScore || 75), 0);
    const stressSum = completed.reduce((sum, h) => sum + (h.scoreCard?.stressScore || 40), 0);

    avgTech = Math.round(techSum / completedCount);
    avgComm = Math.round(commSum / completedCount);
    avgEye = Math.round(eyeSum / completedCount);
    avgStress = Math.round(stressSum / completedCount);
  }

  const finalTechnical = avgTech ? avgTech : Math.min(95, 60 + Math.floor(userXp / 100));
  const finalCommunication = avgComm ? avgComm : 65;
  const finalProblemSolving = Math.min(95, 55 + Math.floor(userXp / 80));
  const finalLeadership = avgTech ? Math.round((avgTech + avgComm) / 2) : 60;
  const finalConfidence = avgEye ? Math.round((avgEye + (100 - avgStress)) / 2) : 70;

  // Radar points geometry (relative to center 50,50 within 100x100 SVG)
  const rTechnical = 45 * (finalTechnical / 100);
  const rCommunication = 45 * (finalCommunication / 100);
  const rLeadership = 45 * (finalLeadership / 100);
  const rProblemSolving = 45 * (finalProblemSolving / 100);
  const rConfidence = 45 * (finalConfidence / 100);

  const p0 = { x: 50, y: 50 - rTechnical };
  const p1 = { x: 50 + rCommunication * 0.951, y: 50 - rCommunication * 0.309 };
  const p2 = { x: 50 + rLeadership * 0.588, y: 50 + rLeadership * 0.809 };
  const p3 = { x: 50 - rProblemSolving * 0.588, y: 50 + rProblemSolving * 0.809 };
  const p4 = { x: 50 - rConfidence * 0.951, y: 50 - rConfidence * 0.309 };

  const pointsString = `${p0.x.toFixed(1)},${p0.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} ${p3.x.toFixed(1)},${p3.y.toFixed(1)} ${p4.x.toFixed(1)},${p4.y.toFixed(1)}`;

  // Generate dynamic 5-point data trend based on user's real stats
  const areaChartData = [];
  const completedHistory = history
    .filter(h => h.status === 'completed' && h.scoreCard)
    .sort((a, b) => new Date(a.scoreCard.completedAt || a.startedAt) - new Date(b.scoreCard.completedAt || b.startedAt));

  if (completedHistory.length >= 2) {
    for (let i = 0; i < 5; i++) {
      const ratio = i / 4;
      const historyIndex = Math.round(ratio * (completedHistory.length - 1));
      const session = completedHistory[historyIndex];
      const sessionDate = new Date(session.scoreCard.completedAt || session.startedAt);
      const dateStr = sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const interviewsCount = historyIndex + 1;
      const runningCompleted = completedHistory.slice(0, interviewsCount);
      const avgScore = runningCompleted.reduce((sum, h) => sum + (h.scoreCard?.overallScore || 65), 0) / interviewsCount;
      let tempReadiness = 50;
      tempReadiness += Math.min(25, Math.floor((userXp * (runningCompleted.length / completedHistory.length)) / 100));
      tempReadiness += Math.min(10, userStreak * 2 * (runningCompleted.length / completedHistory.length));
      tempReadiness += Math.min(15, Math.floor(avgScore - 60));
      const stepReadiness = Math.min(98, Math.max(45, tempReadiness));
      const stepCoding = Math.round(codingScore * (i + 1) / 5);
      areaChartData.push({
        date: dateStr,
        readiness: stepReadiness,
        coding: stepCoding,
        interviews: interviewsCount
      });
    }
  } else {
    const totalSteps = 5;
    for (let i = 0; i < totalSteps; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (totalSteps - 1 - i) * 3);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const ratio = (i + 1) / totalSteps;
      areaChartData.push({
        date: dateStr,
        readiness: Math.round(50 + (readinessScore - 50) * ratio),
        coding: Math.round(codingScore * ratio),
        interviews: Math.round(completedCount * ratio)
      });
    }
  }

  // Pre-calculate target interview variables
  const hasUploadedResume = resumes.length > 0;
  const latestResume = hasUploadedResume ? resumes[resumes.length - 1] : null;
  const targetRole = latestResume?.targetRole || "Software Engineer";
  const targetCompany = history[0]?.company || "Google";
  const ongoingSession = history.find(h => h.status === 'ongoing');

  // Prep Checklist Math
  const checkResume = hasUploadedResume;
  const checkJob = completedCount > 0 || history.length > 0;
  const checkQuestions = completedCount > 0 || ongoingSession;
  const checkReady = checkResume && checkJob;
  const passedChecksCount = (checkResume ? 1 : 0) + (checkJob ? 1 : 0) + (checkQuestions ? 1 : 0) + (checkReady ? 1 : 0);
  const prepProgress = Math.round((passedChecksCount / 4) * 100);

  // Career Coach Message Synthesizer
  let coachMessage;
  if (readinessScore >= 85) {
    coachMessage = `Outstanding performance, ${userName.split(' ')[0]}! Your readiness score is ${readinessScore}/100. You are placement-ready. Keep polishing your skills with daily coding challenges!`;
  } else if (completedCount === 0) {
    coachMessage = `Welcome to your dashboard, ${userName.split(' ')[0]}! Your readiness score is currently estimated at ${readinessScore}/100 based on your starting XP. Begin by uploading a resume and scheduling an HR mock interview to unlock your full analytical profile.`;
  } else {
    const weakestArea = [];
    if (finalTechnical < 75) weakestArea.push("technical skills");
    if (finalCommunication < 75) weakestArea.push("communication fluency");
    if (finalConfidence < 75) weakestArea.push("body language/confidence");
    const targetArea = weakestArea.length > 0 ? weakestArea.join(" and ") : "interview speed";
    coachMessage = `Great progress this week, ${userName.split(' ')[0]}! Your readiness is at ${readinessScore}/100. Focus on improving your ${targetArea} by launching targeted mock practice rounds in the lobby.`;
  }



  if (loading) {
    return (
      <div className="px-6 pt-6 flex-1">
        <SkeletonDashboard />
      </div>
    );
  }

  // Stat card configs
  const STAT_CARDS = [
    {
      label: 'Hiring Readiness',
      value: readinessScore,
      suffix: '/100',
      change: userStreak > 1 ? `+${userStreak * 2}% this week` : '+5% this week',
      changePositive: true,
      iconBg: 'linear-gradient(135deg, #10B981, #06B6D4)',
      accentColor: '#10B981',
      icon: <Shield size={16} className="text-white" />,
      sublabel: readinessScore >= 85 ? 'Excellent' : readinessScore >= 70 ? 'Good' : 'Needs Work',
    },
    {
      label: 'Interviews Done',
      value: completedCount,
      suffix: '',
      change: completedCount > 0 ? `${completedCount} this week` : 'Start preparing',
      changePositive: completedCount > 0,
      iconBg: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
      accentColor: '#8B5CF6',
      icon: <Mic size={16} className="text-white" />,
      sublabel: 'Total sessions',
    },
    {
      label: 'Coding Score',
      value: codingScore,
      suffix: '',
      change: solvedCount > 0 ? `${solvedCount} problems solved` : 'No challenges yet',
      changePositive: solvedCount > 0,
      iconBg: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
      accentColor: '#3B82F6',
      icon: <Code2 size={16} className="text-white" />,
      sublabel: 'LeetCode equivalent',
    },
    {
      label: 'Practice Streak',
      value: userStreak,
      suffix: '',
      change: userStreak > 0 ? '🔥 Keep it up!' : 'Start your streak',
      changePositive: userStreak > 0,
      iconBg: 'linear-gradient(135deg, #F59E0B, #EF4444)',
      accentColor: '#F59E0B',
      icon: <Flame size={16} className="text-white" />,
      sublabel: 'Day streak',
    },
  ];

  const SCORE_BARS = [
    { label: 'Technical Skills',  value: finalTechnical,      color: '#10B981', icon: <Code2 size={13} /> },
    { label: 'Communication',     value: finalCommunication,  color: '#3B82F6', icon: <MessagesSquare size={13} /> },
    { label: 'Problem Solving',   value: finalProblemSolving, color: '#F59E0B', icon: <Lightbulb size={13} /> },
    { label: 'Leadership',        value: finalLeadership,     color: '#8B5CF6', icon: <Users size={13} /> },
    { label: 'Confidence',        value: finalConfidence,     color: '#06B6D4', icon: <Shield size={13} /> },
  ];

  const QUICK_ACTIONS = [
    { to: '/lobby',  icon: Mic,     label: 'AI Interview', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
    { to: '/coding', icon: Code2,   label: 'Coding',       color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { to: '/resume', icon: FileText,label: 'Resume',       color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
    { to: '/feedback',icon: BarChart3, label: 'Analytics', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  ];

  return (
    <div className="flex gap-5 w-full pt-5 px-5 pb-6">

      {/* ── Left Column ─────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {STAT_CARDS.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl p-5 relative overflow-hidden card-hover cursor-default"
              style={{
                background: 'rgba(17,24,39,0.5)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderTop: `1px solid rgba(255,255,255,0.10)`,
                borderLeft: `2px solid ${card.accentColor}40`,
              }}
            >
              {/* Ambient glow */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none opacity-20"
                style={{ background: `radial-gradient(circle, ${card.accentColor}, transparent 70%)`, transform: 'translate(40%, -40%)' }} />
              <div className="flex justify-between items-start mb-3">
                <p className="text-slate-500 text-xs font-medium tracking-wide uppercase">{card.label}</p>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: card.iconBg }}>
                  {card.icon}
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-white leading-none">{card.value}</span>
                {card.suffix && <span className="text-slate-600 text-sm">{card.suffix}</span>}
              </div>
              <p className="text-xs mt-2" style={{ color: card.accentColor }}>{card.change}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{card.sublabel}</p>
            </div>
          ))}
        </div>

        {/* ── Middle Row ── */}
        <div className="grid grid-cols-2 gap-5">

          {/* Continue Learning */}
          <div className="rounded-2xl p-5 flex flex-col glass-card-db">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold text-sm">Active Sessions</h3>
              <Link to="/roadmap" className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1 transition-colors">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-3 flex-1">
              {/* Session card helper */}
              {[{
                icon: Mic, label: ongoingSession ? `Continue ${ongoingSession.type} Mock` : history.length > 0 ? 'Review Latest Interview' : 'Start Mock Interview',
                sublabel: ongoingSession ? `${ongoingSession.role} · ${ongoingSession.company}` : history.length > 0 ? `${history[0]?.role || 'Software Engineer'} · ${history[0]?.company || 'Google'}` : 'Practice HR, Tech or Behavioral',
                progress: ongoingSession ? Math.round((ongoingSession.currentQuestionIndex / (ongoingSession.questions?.length || 5)) * 100) : history.length > 0 ? 100 : 0,
                color: '#8B5CF6',
                to: ongoingSession ? `/interview-room?sessionId=${ongoingSession.id}` : '/lobby',
                cta: ongoingSession ? 'Resume' : history.length > 0 ? 'Lobby' : 'Start',
              }, {
                icon: Code2, label: 'DSA Coding Arena',
                sublabel: `${solvedCount} problems solved`,
                progress: Math.min(100, Math.round((solvedCount / 5) * 100)),
                color: '#10B981',
                to: '/coding',
                cta: 'Continue',
              }, {
                icon: FileText, label: 'Resume Analyzer',
                sublabel: latestResume ? 'ATS compliance score' : 'Optimize for job roles',
                progress: latestResume ? (latestResume.atsScore || 0) : 0,
                color: '#3B82F6',
                to: '/resume',
                cta: 'Analyze',
              }].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="rounded-xl p-3 flex flex-col gap-2"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                          <Icon size={16} style={{ color: item.color }} />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium leading-tight">{item.label}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{item.sublabel}</p>
                        </div>
                      </div>
                      <Link to={item.to}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: `${item.color}18`, color: item.color, border: `1px solid ${item.color}30` }}>
                        {item.cta}
                      </Link>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${item.progress}%`, background: `linear-gradient(90deg, ${item.color}80, ${item.color})` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prep Checkpoint */}
          <div className="rounded-2xl p-5 flex flex-col relative overflow-hidden glass-card-db">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-15"
              style={{ background: 'radial-gradient(circle, #6366F1, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="text-white font-semibold text-sm">
                {ongoingSession ? 'Ongoing Session' : 'Target Prep Checkpoint'}
              </h3>
              <Link to="/lobby" className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1 transition-colors">
                Lobby <ArrowRight size={12} />
              </Link>
            </div>

            {/* Session info card */}
            <div className="rounded-xl p-4 mb-4 relative z-10"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <Mic size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">
                    {ongoingSession ? `${ongoingSession.type} Mock Session` : `${targetRole} Interview`}
                  </h4>
                  <p className="text-indigo-400 text-xs mt-0.5">{targetCompany}</p>
                  <div className="flex gap-2 mt-2">
                    {['Medium', 'JavaScript', 'AI Panel'].map(t => (
                      <span key={t} className="px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#64748B' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="mt-auto relative z-10">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Interview preparation</span>
                <span className="font-semibold text-white">{prepProgress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${prepProgress}%`, background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)' }} />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                {[
                  [checkResume,    'Resume Analyzed'],
                  [checkJob,       'Job Profile Set'],
                  [checkQuestions, 'Session Started'],
                  [checkReady,     'Interview Ready'],
                ].map(([done, label]) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs">
                    {done
                      ? <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                      : <Circle size={12} className="text-slate-700 flex-shrink-0" />}
                    <span className={done ? 'text-slate-300' : 'text-slate-600'}>{label}</span>
                  </div>
                ))}
              </div>
              <Link
                to={ongoingSession ? `/interview-room?sessionId=${ongoingSession.id}` : hasUploadedResume ? '/lobby' : '/resume'}
                className="btn btn-shimmer w-full py-2.5 text-white font-semibold text-sm rounded-xl"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
              >
                {ongoingSession ? 'Resume Interview' : hasUploadedResume ? 'Start Mock Interview' : 'Upload Resume'}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Analytics Row ── */}
        <div className="grid grid-cols-2 gap-5">
          {/* Performance Chart */}
          <div className="rounded-2xl p-5 flex flex-col glass-card-db">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold text-sm">Performance Overview</h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2 h-2 rounded-full bg-violet-500" />Interviews</span>
                <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2 h-2 rounded-full bg-blue-500" />Coding</span>
                <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-500" />Readiness</span>
              </div>
            </div>
            <div className="h-52 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData} margin={{ top: 5, right: 5, left: -28, bottom: 5 }}>
                  <defs>
                    <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="codingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="interviewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#374151" strokeOpacity={0.5} fontSize={9} tickLine={false} />
                  <YAxis stroke="#374151" strokeOpacity={0.5} fontSize={9} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(13,18,32,0.98)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px', backdropFilter: 'blur(12px)' }}
                    itemStyle={{ color: '#94A3B8' }}
                    labelStyle={{ color: '#F1F5F9', fontWeight: 600, marginBottom: 4 }}
                  />
                  <Area type="monotone" dataKey="readiness"  stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#readinessGrad)" />
                  <Area type="monotone" dataKey="coding"     stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#codingGrad)" />
                  <Area type="monotone" dataKey="interviews" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#interviewsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="rounded-2xl p-5 glass-card-db">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-white font-semibold text-sm">Skill Breakdown</h3>
              <Link to="/feedback" className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1 transition-colors">
                Analytics <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-4">
              {SCORE_BARS.map(bar => (
                <div key={bar.label}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-slate-400 text-xs" style={{ color: '#94A3B8' }}>
                      <span style={{ color: bar.color }}>{bar.icon}</span>
                      {bar.label}
                    </div>
                    <div className="text-xs font-bold" style={{ color: bar.color }}>{bar.value}<span className="text-slate-600 font-normal">/100</span></div>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${bar.value}%`, background: `linear-gradient(90deg, ${bar.color}80, ${bar.color})` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── AI Coach Banner ── */}
        {showAiBanner && (
          <div className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.08) 100%)',
              border: '1px solid rgba(99,102,241,0.2)',
              backdropFilter: 'blur(12px)',
            }}>
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full pointer-events-none opacity-20"
              style={{ background: 'radial-gradient(circle, #3B82F6, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
            <button onClick={() => setShowAiBanner(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all">
              <X size={14} />
            </button>
            <div className="flex items-start gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
                <Bot size={24} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-white font-bold text-base">AI Career Coach</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(99,102,241,0.2)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)' }}>BETA</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{coachMessage}</p>
              </div>
              <Link to="/lobby"
                className="btn btn-shimmer flex-shrink-0 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hidden sm:flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}>
                Practice Now <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Right Sidebar ─────────────────────────── */}
      <div className="w-72 flex flex-col gap-5 flex-shrink-0">

        {/* Radar Chart */}
        <div className="rounded-2xl p-5 glass-card-db">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold text-sm">Skill Profile</h3>
            <Link to="/feedback" className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1">
              Report <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-44 h-44">
              {/* Radar background */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <polygon fill="none" points="50,5 95,38 78,95 22,95 5,38" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
                <polygon fill="none" points="50,25 80,48 68,80 32,80 20,48" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                <polygon fill="none" points="50,40 65,52 58,68 42,68 35,52" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                <line stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="50" y1="50" x2="50" y2="5"/>
                <line stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="50" y1="50" x2="95" y2="38"/>
                <line stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="50" y1="50" x2="78" y2="95"/>
                <line stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="50" y1="50" x2="22" y2="95"/>
                <line stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="50" y1="50" x2="5" y2="38"/>
              </svg>
              {/* Data polygon */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="polyGrad2" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(59,130,246,0.5)"/>
                    <stop offset="100%" stopColor="rgba(139,92,246,0.5)"/>
                  </linearGradient>
                </defs>
                <polygon fill="url(#polyGrad2)" points={pointsString}
                  stroke="#6366F1" strokeWidth="1.5"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.4))' }}/>
                {[p0,p1,p2,p3,p4].map((p,i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="white" opacity="0.9"
                    style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.8))' }}/>
                ))}
              </svg>
              {/* Labels */}
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 text-center whitespace-nowrap">Technical<br/><span className="text-white font-bold">{finalTechnical}</span></span>
              <span className="absolute top-6 -right-9 text-[9px] text-slate-400 text-center">Comm.<br/><span className="text-white font-bold">{finalCommunication}</span></span>
              <span className="absolute -bottom-5 right-1 text-[9px] text-slate-400 text-center">Lead.<br/><span className="text-white font-bold">{finalLeadership}</span></span>
              <span className="absolute -bottom-5 left-1 text-[9px] text-slate-400 text-center">Problem<br/><span className="text-white font-bold">{finalProblemSolving}</span></span>
              <span className="absolute top-6 -left-7 text-[9px] text-slate-400 text-center">Conf.<br/><span className="text-white font-bold">{finalConfidence}</span></span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <p className="text-white text-xs font-semibold">Top {Math.max(1, 100 - Math.round(readinessScore * 0.95))}% of candidates</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Keep practicing</p>
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)' }}>
              <TrendingUp size={15} className="text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl p-5 glass-card-db">
          <h3 className="text-white font-semibold text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_ACTIONS.map(a => {
              const Icon = a.icon;
              return (
                <Link key={a.to} to={a.to}
                  className="rounded-xl p-3.5 flex flex-col items-start gap-2.5 card-hover"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: a.bg }}>
                    <Icon size={15} style={{ color: a.color }} />
                  </div>
                  <span className="text-white text-xs font-semibold">{a.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl p-5 glass-card-db flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold text-sm">Recent Activity</h3>
            <Link to="/feedback" className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1">
              All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <Mic size={24} className="text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-600">No activity yet</p>
                <p className="text-[10px] text-slate-700 mt-1">Start a mock interview!</p>
              </div>
            ) : history.slice(0, 4).map((act, i) => (
              <div key={act.id || i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: act.status === 'completed' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                    border: `1px solid ${act.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                  }}>
                  {act.type === 'Coding'
                    ? <Code2 size={14} className={act.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'} />
                    : <Mic size={14} className={act.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">
                    {act.status === 'completed' ? '✓ ' : '● '}{act.type} Interview
                  </p>
                  <p className="text-[10px] text-slate-600">{act.role} · {getRelativeTime(act.startedAt || act.createdAt)}</p>
                </div>
                <div className="text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
                  style={{
                    background: act.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: act.status === 'completed' ? '#34D399' : '#FCD34D',
                  }}>
                  {act.scoreCard ? `${act.scoreCard.overallScore}%` : 'Live'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Aura Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Chat Window */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="w-80 sm:w-96 h-[400px] rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl flex flex-col mb-4 overflow-hidden"
              style={{
                background: 'rgba(10, 15, 30, 0.98)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-blue-violet flex items-center justify-center shadow-glow-blue">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs leading-none">Aura AI Coach</h4>
                    <span className="text-[9px] text-slate-500 font-semibold mt-0.5 block">Online</span>
                  </div>
                </div>
                <button 
                  onClick={() => setChatOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 custom-scrollbar">
                {chatMessages.map((m, i) => (
                  <div 
                    key={i} 
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        m.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white/[0.04] border border-slate-900/60 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed bg-white/[0.04] border border-slate-900/60 text-slate-400 rounded-bl-none flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>Aura is thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2 border-t border-slate-850 pt-3">
                <input
                  type="text"
                  placeholder="Ask Aura anything about your prep..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="w-9 h-9 rounded-xl bg-gradient-blue-violet flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-all shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Bubble Button */}
        <button
          onClick={() => setChatOpen(o => !o)}
          className="w-12 h-12 rounded-full bg-gradient-blue-violet flex items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-indigo-500/30"
        >
          {chatOpen ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5 animate-pulse" />}
        </button>
      </div>
    </div>
  );
}

const getRelativeTime = (isoString) => {
  try {
    const now = new Date();
    const past = new Date(isoString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
};

