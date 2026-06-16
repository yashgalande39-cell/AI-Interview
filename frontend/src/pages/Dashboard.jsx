import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [history, setHistory] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [readinessScore, setReadinessScore] = useState(87);
  const [loading, setLoading] = useState(true);
  const [showAiBanner, setShowAiBanner] = useState(true);


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
  let coachMessage = "";
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
      <div className="flex h-screen items-center justify-center bg-[#0b0f19] text-[#e2e8f0]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium tracking-wide">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 w-full pt-6">
          {/* Left Column (Stats & Main Content) */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* BEGIN: Top Stats Row */}
            <div className="grid grid-cols-4 gap-4" data-purpose="key-metrics">
              {/* Score Card */}
              <div className="glass-card p-5 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-gray-400 text-sm font-medium">Hiring Readiness Score</h3>
                  <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center text-green-500">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                </div>
                <div className="flex items-end gap-4 mt-2">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-white">{readinessScore}</span>
                    <span className="text-gray-500 text-sm ml-1">/100</span>
                  </div>
                  {/* Gauge indicator */}
                  <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-green-500 border-r-green-500 transform -rotate-45 relative">
                    <div className="absolute inset-0 m-auto w-8 h-8 bg-[#111827] rounded-full"></div>
                  </div>
                </div>
                <p className="text-green-500 text-sm mt-3 font-medium">
                  {readinessScore >= 85 ? "Excellent" : readinessScore >= 70 ? "Good" : readinessScore >= 55 ? "Average" : "Needs Prep"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  <span className="text-green-500">{userStreak > 1 ? `↑ ${userStreak * 2}%` : '↑ 5%'}</span> this week
                </p>
              </div>

              {/* Interviews Completed */}
              <div className="glass-card p-5 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-gray-400 text-sm font-medium">Interviews Completed</h3>
                  <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400">
                    <i className="fa-solid fa-users"></i>
                  </div>
                </div>
                <div className="text-4xl font-bold text-white mt-2">{completedCount}</div>
                <p className="text-gray-400 text-sm mt-1">Total Sessions</p>
                <p className="text-xs text-purple-400 mt-4">
                  {completedCount > 0 ? `↑ ${completedCount} this week` : 'Start preparing'}
                </p>
              </div>

              {/* Coding Score */}
              <div className="glass-card p-5 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-gray-400 text-sm font-medium">Coding Score</h3>
                  <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400">
                    <i className="fa-solid fa-code"></i>
                  </div>
                </div>
                <div className="text-4xl font-bold text-white mt-2">{codingScore}</div>
                <p className="text-gray-400 text-sm mt-1">LeetCode Equivalent</p>
                <p className="text-xs text-blue-400 mt-4">
                  {solvedCount > 0 ? `↑ ${solvedCount * 10} pts` : 'No solved challenges'}
                </p>
              </div>

              {/* Days of Practice */}
              <div className="glass-card p-5 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-gray-400 text-sm font-medium">Days of Practice</h3>
                  <div className="w-8 h-8 rounded-full bg-yellow-900/30 flex items-center justify-center text-yellow-500">
                    <i className="fa-regular fa-calendar-check"></i>
                  </div>
                </div>
                <div className="text-4xl font-bold text-white mt-2">{userStreak}</div>
                <p className="text-gray-400 text-sm mt-1">Current Streak</p>
                <p className="text-xs text-yellow-500 mt-4 font-medium">🔥 Keep it up!</p>
              </div>
            </div>
            {/* END: Top Stats Row */}

            {/* BEGIN: Middle Section (Learning & Upcoming) */}
            <div className="grid grid-cols-2 gap-6" data-purpose="current-focus">
              {/* Continue Learning */}
              <div className="glass-card p-5 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium">Continue Learning</h3>
                  <Link to="/roadmap" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">View All <i className="fa-solid fa-arrow-right text-[10px]"></i></Link>
                </div>
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  {/* Item 1 - Active Mock / Recent Completed */}
                  {ongoingSession ? (
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center text-purple-400">
                            <i className="fa-solid fa-microphone"></i>
                          </div>
                          <div>
                            <h4 className="text-white text-sm font-medium">Continue {ongoingSession.type} Mock</h4>
                            <p className="text-xs text-gray-400">{ongoingSession.role} • {ongoingSession.company}</p>
                          </div>
                        </div>
                        <Link to={`/interview-room?sessionId=${ongoingSession.id}`} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded transition-colors text-center font-medium">Resume</Link>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.round((ongoingSession.currentQuestionIndex / ongoingSession.questions.length) * 100)}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-400">{Math.round((ongoingSession.currentQuestionIndex / ongoingSession.questions.length) * 100)}%</span>
                      </div>
                    </div>
                  ) : history.length > 0 ? (
                    (() => {
                      const latestComp = history.find(h => h.status === 'completed' && h.scoreCard);
                      return (
                        <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center text-purple-400">
                                <i className="fa-solid fa-microphone"></i>
                              </div>
                              <div>
                                <h4 className="text-white text-sm font-medium">Review {latestComp ? latestComp.type : 'Mock'} Interview</h4>
                                <p className="text-xs text-gray-400">{latestComp ? `${latestComp.role} • ${latestComp.company}` : 'Mock ready to review'}</p>
                              </div>
                            </div>
                            <Link to="/lobby" className="text-xs bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 px-3 py-1.5 rounded transition-colors text-center">Lobby</Link>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 w-[100%] rounded-full"></div>
                            </div>
                            <span className="text-xs text-gray-400">100%</span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center text-purple-400">
                            <i className="fa-solid fa-microphone"></i>
                          </div>
                          <div>
                            <h4 className="text-white text-sm font-medium">Start Mock Interview</h4>
                            <p className="text-xs text-gray-400">Practice HR, Tech or Behavioral</p>
                          </div>
                        </div>
                        <Link to="/lobby" className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors text-center font-medium">Lobby</Link>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 w-[0%] rounded-full"></div>
                        </div>
                        <span className="text-xs text-gray-400">0%</span>
                      </div>
                    </div>
                  )}

                  {/* Item 2 - Coding Arena solved count progress */}
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-900/30 flex items-center justify-center text-green-400">
                          <i className="fa-solid fa-code"></i>
                        </div>
                        <div>
                          <h4 className="text-white text-sm font-medium">DSA Coding Arena</h4>
                          <p className="text-xs text-gray-400">{solvedCount} solved challenges</p>
                        </div>
                      </div>
                      <Link to="/coding" className="text-xs bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 px-3 py-1.5 rounded transition-colors text-center">Continue</Link>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, Math.round((solvedCount / 5) * 100))}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-400">{Math.min(100, Math.round((solvedCount / 5) * 100))}%</span>
                    </div>
                  </div>

                  {/* Item 3 - Resume Analyzer ATS score progress */}
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center text-blue-400">
                          <i className="fa-regular fa-file-lines"></i>
                        </div>
                        <div>
                          <h4 className="text-white text-sm font-medium">Resume Analyzer</h4>
                          <p className="text-xs text-gray-400">{latestResume ? `Latest ATS compliance score` : 'Optimize for job roles'}</p>
                        </div>
                      </div>
                      <Link to="/resume" className="text-xs bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 px-3 py-1.5 rounded transition-colors text-center">Continue</Link>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${latestResume ? latestResume.atsScore : 0}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-400">{latestResume ? latestResume.atsScore : 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Prep Target / Checklist */}
              <div className="glass-card p-5 flex flex-col relative overflow-hidden neon-border">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <h3 className="text-white font-medium">{ongoingSession ? 'Ongoing Session Progress' : 'Target Prep Checkpoint'}</h3>
                  <Link to="/lobby" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">Lobby <i className="fa-solid fa-arrow-right text-[10px]"></i></Link>
                </div>
                <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 mb-4 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl shrink-0">
                        <i className="fa-regular fa-calendar-days"></i>
                      </div>
                      <div>
                        {ongoingSession ? (
                          <>
                            <h4 className="text-white font-medium text-base">{ongoingSession.type} Mock Session</h4>
                            <p className="text-blue-400 text-sm mt-0.5">{ongoingSession.role} • {ongoingSession.company}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                              <span className="flex items-center gap-1"><i className="fa-regular fa-clock"></i> Active session</span>
                              <span className="flex items-center gap-1"><i className="fa-solid fa-stopwatch"></i> {ongoingSession.questions.length} questions</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <h4 className="text-white font-medium text-base">{targetRole} Interview</h4>
                            <p className="text-blue-400 text-sm mt-0.5">{targetCompany}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                              <span className="flex items-center gap-1"><i className="fa-regular fa-clock"></i> Session on-demand</span>
                              <span className="flex items-center gap-1"><i className="fa-solid fa-stopwatch"></i> 45-60 min</span>
                            </div>
                          </>
                        )}
                        <div className="flex gap-2 mt-3">
                          <span className="px-2 py-1 rounded bg-gray-700/50 text-[10px] text-gray-300">{ongoingSession ? ongoingSession.difficulty : 'Medium'}</span>
                          <span className="px-2 py-1 rounded bg-gray-700/50 text-[10px] text-gray-300">{ongoingSession ? ongoingSession.language : 'JavaScript'}</span>
                          <span className="px-2 py-1 rounded bg-gray-700/50 text-[10px] text-gray-300">AI Panel</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Preparation Status */}
                <div className="mt-auto relative z-10">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Interview Preparation</span>
                    <span>{prepProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-700 rounded-full mb-4">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${prepProgress}%` }}></div>
                  </div>
                  <div className="flex justify-between items-end gap-2">
                    <ul className="text-xs text-gray-400 space-y-1.5">
                      <li className="flex items-center gap-2">
                        <i className={`fa-solid ${checkResume ? 'fa-circle-check text-green-500' : 'fa-circle text-gray-600'} text-[10px]`}></i> 
                        Resume Analyzed
                      </li>
                      <li className="flex items-center gap-2">
                        <i className={`fa-solid ${checkJob ? 'fa-circle-check text-green-500' : 'fa-circle text-gray-600'} text-[10px]`}></i> 
                        Job Profile Selected
                      </li>
                      <li className="flex items-center gap-2">
                        <i className={`fa-solid ${checkQuestions ? 'fa-circle-check text-green-500' : 'fa-circle text-gray-600'} text-[10px]`}></i> 
                        Mock Session Started
                      </li>
                      <li className="flex items-center gap-2">
                        <i className={`fa-solid ${checkReady ? 'fa-circle-check text-green-500' : 'fa-circle text-gray-600'} text-[10px]`}></i> 
                        Mock Interview Ready
                      </li>
                    </ul>
                    {ongoingSession ? (
                      <Link 
                        to={`/interview-room?sessionId=${ongoingSession.id}`} 
                        className="btn-gradient text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-purple-500/20 text-center whitespace-nowrap"
                      >
                        Resume Interview <i className="fa-solid fa-arrow-right text-[10px]"></i>
                      </Link>
                    ) : hasUploadedResume ? (
                      <Link 
                        to="/lobby" 
                        className="btn-gradient text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-purple-500/20 text-center whitespace-nowrap"
                      >
                        Start Mock Interview <i className="fa-solid fa-arrow-right text-[10px]"></i>
                      </Link>
                    ) : (
                      <Link 
                        to="/resume" 
                        className="btn-gradient text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-purple-500/20 text-center whitespace-nowrap"
                      >
                        Upload Resume <i className="fa-solid fa-arrow-right text-[10px]"></i>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* END: Middle Section */}

            {/* BEGIN: Bottom Analytics Row */}
            <div className="grid grid-cols-2 gap-6" data-purpose="detailed-analytics">
              {/* Performance Overview Chart */}
              <div className="glass-card p-5 relative flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-medium">Performance Overview</h3>
                    <select className="bg-gray-800 border-gray-700 text-gray-300 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 py-1 pl-2 pr-6">
                      <option>This Month</option>
                      <option>Last Month</option>
                    </select>
                  </div>
                  {/* Chart Legend */}
                  <div className="flex gap-4 mb-4 text-xs">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span><span className="text-gray-400">Interviews</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span className="text-gray-400">Coding Score</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-400"></span><span className="text-gray-400">Readiness Score</span></div>
                  </div>
                </div>

                {/* Area Chart Container */}
                <div className="h-48 w-full relative mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={areaChartData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                      <defs>
                        <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ade80" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="codingGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="interviewsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#4b5563" strokeOpacity={0.5} fontSize={10} tickLine={false} />
                      <YAxis stroke="#4b5563" strokeOpacity={0.5} fontSize={10} tickLine={false} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                        itemStyle={{ fontSize: '11px' }}
                      />
                      <Area type="monotone" dataKey="readiness" stroke="#4ade80" strokeWidth={1.5} fillOpacity={1} fill="url(#readinessGrad)" />
                      <Area type="monotone" dataKey="coding" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#codingGrad)" />
                      <Area type="monotone" dataKey="interviews" stroke="#a855f7" strokeWidth={1.5} fillOpacity={1} fill="url(#interviewsGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  {/* Current Status Overview Card overlaying Recharts */}
                  <div className="absolute right-4 top-2 bg-gray-900 border border-gray-700 rounded-lg p-2 text-[10px] z-10 shadow-lg pointer-events-none">
                    <p className="text-white font-medium mb-1">Current Stats</p>
                    <div className="space-y-1">
                      <div className="flex justify-between gap-4"><span className="text-purple-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Interviews</span><span className="text-white">{completedCount}</span></div>
                      <div className="flex justify-between gap-4"><span className="text-blue-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>Coding Score</span><span className="text-white">{codingScore}</span></div>
                      <div className="flex justify-between gap-4"><span className="text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>Readiness</span><span className="text-white">{readinessScore}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="glass-card p-5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-medium">Score Breakdown</h3>
                  <Link to="/feedback" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">View Analytics <i className="fa-solid fa-arrow-right text-[10px]"></i></Link>
                </div>
                <div className="space-y-5">
                  {/* Bar 1 */}
                  <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <i className="fa-solid fa-microchip text-green-400 w-4"></i> Technical Skills
                      </div>
                      <div><span className="text-white font-medium">{finalTechnical}</span><span className="text-gray-500 text-xs">/100</span></div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${finalTechnical}%` }}></div>
                    </div>
                  </div>
                  {/* Bar 2 */}
                  <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <i className="fa-regular fa-comments text-blue-400 w-4"></i> Communication
                      </div>
                      <div><span className="text-white font-medium">{finalCommunication}</span><span className="text-gray-500 text-xs">/100</span></div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${finalCommunication}%` }}></div>
                    </div>
                  </div>
                  {/* Bar 3 */}
                  <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <i className="fa-solid fa-puzzle-piece text-yellow-500 w-4"></i> Problem Solving
                      </div>
                      <div><span className="text-white font-medium">{finalProblemSolving}</span><span className="text-gray-500 text-xs">/100</span></div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${finalProblemSolving}%` }}></div>
                    </div>
                  </div>
                  {/* Bar 4 */}
                  <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <i className="fa-solid fa-users text-purple-400 w-4"></i> Leadership
                      </div>
                      <div><span className="text-white font-medium">{finalLeadership}</span><span className="text-gray-500 text-xs">/100</span></div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${finalLeadership}%` }}></div>
                    </div>
                  </div>
                  {/* Bar 5 */}
                  <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <i className="fa-solid fa-shield text-cyan-400 w-4"></i> Confidence
                      </div>
                      <div><span className="text-white font-medium">{finalConfidence}</span><span className="text-gray-500 text-xs">/100</span></div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${finalConfidence}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* END: Bottom Analytics Row */}

            {/* BEGIN: AI Coach Banner */}
            {showAiBanner && (
              <div className="glass-card p-4 mt-2 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/20 relative overflow-hidden" data-purpose="ai-coach-banner">
                {/* Glow effect */}
                <div className="absolute left-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-blue-500/40 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 rounded-full border-2 border-blue-400/50 flex items-center justify-center bg-[#0b0f19] flex-shrink-0 relative">
                    <i className="fa-solid fa-robot text-3xl text-blue-400"></i>
                    {/* Robot ears/antenna glow */}
                    <div className="absolute -left-1 top-1/2 w-1 h-3 bg-blue-400 rounded blur-[1px]"></div>
                    <div className="absolute -right-1 top-1/2 w-1 h-3 bg-blue-400 rounded blur-[1px]"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium text-lg">AI Career Coach</h3>
                      <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/30">Beta</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {coachMessage}
                    </p>
                  </div>
                  <Link 
                    to="/lobby"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 flex items-center gap-2 shadow-lg shadow-blue-500/20 border border-blue-400/50 text-center"
                  >
                    Get AI Advice <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </Link>
                  <button 
                    onClick={() => setShowAiBanner(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-300"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>
            )}
            {/* END: AI Coach Banner */}
          </div>

          {/* BEGIN: Right Sidebar */}
          <div className="w-80 flex flex-col gap-6 flex-shrink-0" data-purpose="right-sidebar">
            {/* Radar Chart Card */}
            <div className="glass-card p-5 flex flex-col h-[340px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">Hiring Readiness Score</h3>
                <Link to="/feedback" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">View Report <i className="fa-solid fa-arrow-right text-[10px]"></i></Link>
              </div>
              <div className="flex-1 relative flex items-center justify-center">
                {/* Pentagon Radar Chart Container */}
                <div className="relative w-48 h-48">
                  {/* Outer pentagon wireframe */}
                  <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
                    <polygon fill="none" points="50,5 95,38 78,95 22,95 5,38" stroke="#9ca3af" strokeWidth="1"></polygon>
                    <polygon fill="none" points="50,25 80,48 68,80 32,80 20,48" stroke="#9ca3af" strokeWidth="1"></polygon>
                    <polygon fill="none" points="50,45 65,55 58,70 42,70 35,55" stroke="#9ca3af" strokeWidth="1"></polygon>
                    {/* spokes */}
                    <line stroke="#9ca3af" strokeWidth="1" x1="50" x2="50" y1="50" y2="5"></line>
                    <line stroke="#9ca3af" strokeWidth="1" x1="50" x2="95" y1="50" y2="38"></line>
                    <line stroke="#9ca3af" strokeWidth="1" x1="50" x2="78" y1="50" y2="95"></line>
                    <line stroke="#9ca3af" strokeWidth="1" x1="50" x2="22" y1="50" y2="95"></line>
                    <line stroke="#9ca3af" strokeWidth="1" x1="50" x2="5" y1="50" y2="38"></line>
                  </svg>
                  {/* Data polygon (Blue/Purple gradient) */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="polyGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.6)"></stop>
                        <stop offset="100%" stopColor="rgba(168, 85, 247, 0.6)"></stop>
                      </linearGradient>
                    </defs>
                    <polygon fill="url(#polyGrad)" points={pointsString} stroke="#60a5fa" strokeWidth="2"></polygon>
                    {/* Data points */}
                    <circle cx={p0.x} cy={p0.y} fill="#fff" r="2"></circle>
                    <circle cx={p1.x} cy={p1.y} fill="#fff" r="2"></circle>
                    <circle cx={p2.x} cy={p2.y} fill="#fff" r="2"></circle>
                    <circle cx={p3.x} cy={p3.y} fill="#fff" r="2"></circle>
                    <circle cx={p4.x} cy={p4.y} fill="#fff" r="2"></circle>
                  </svg>
                  {/* Labels */}
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-300 text-center w-full">Technical Skills<br /><span className="text-white">{finalTechnical}</span></span>
                  <span className="absolute top-8 -right-8 text-[10px] text-gray-300 text-center">Communication<br /><span className="text-white">{finalCommunication}</span></span>
                  <span className="absolute -bottom-4 right-2 text-[10px] text-gray-300 text-center">Leadership<br /><span className="text-white">{finalLeadership}</span></span>
                  <span className="absolute -bottom-4 left-2 text-[10px] text-gray-300 text-center">Problem Solving<br /><span className="text-white">{finalProblemSolving}</span></span>
                  <span className="absolute top-8 -left-8 text-[10px] text-gray-300 text-center">Confidence<br /><span className="text-white">{finalConfidence}</span></span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium mb-1">
                    You're in the top {Math.max(1, 100 - Math.round(readinessScore * 0.95))}% of candidates!
                  </p>
                  <p className="text-xs text-gray-400">Keep practicing to improve further.</p>
                </div>
                <div className="w-8 h-8 rounded bg-blue-900/30 flex items-center justify-center text-blue-400">
                  <i className="fa-solid fa-arrow-trend-up"></i>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-5">
              <h3 className="text-white font-medium mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to="/lobby" 
                  className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl p-3 flex flex-col items-start gap-2 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center text-blue-400">
                    <i className="fa-solid fa-microphone"></i>
                  </div>
                  <div>
                    <div className="text-white text-xs font-medium">Start AI Interview</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Begin a new interview</div>
                  </div>
                </Link>

                <Link 
                  to="/coding" 
                  className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl p-3 flex flex-col items-start gap-2 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-900/30 flex items-center justify-center text-green-400">
                    <i className="fa-solid fa-code"></i>
                  </div>
                  <div>
                    <div className="text-white text-xs font-medium">Solve Problems</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Practice coding</div>
                  </div>
                </Link>

                <Link 
                  to="/resume" 
                  className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl p-3 flex flex-col items-start gap-2 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-900/30 flex items-center justify-center text-cyan-400">
                    <i className="fa-regular fa-file-lines"></i>
                  </div>
                  <div>
                    <div className="text-white text-xs font-medium">Analyze Resume</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Improve your resume</div>
                  </div>
                </Link>

                <Link 
                  to="/gd" 
                  className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl p-3 flex flex-col items-start gap-2 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-yellow-900/30 flex items-center justify-center text-yellow-500">
                    <i className="fa-solid fa-briefcase"></i>
                  </div>
                  <div>
                    <div className="text-white text-xs font-medium">Job Analyzer</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Analyze job roles</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-5 flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">Recent Activity</h3>
                <Link to="/feedback" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">View All <i className="fa-solid fa-arrow-right text-[10px]"></i></Link>
              </div>
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <p className="text-xs text-gray-500">No recent activity found.</p>
                    <p className="text-[10px] text-gray-600 mt-1">Start a mock interview to see your reports here!</p>
                  </div>
                ) : (
                  history.slice(0, 3).map((act, index) => (
                    <div key={act.id || index} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        act.status === 'completed'
                          ? 'bg-green-950/30 border border-green-500/20 text-green-400'
                          : 'bg-yellow-950/30 border border-yellow-500/20 text-yellow-400'
                      }`}>
                        <i className={`fa-solid ${
                          act.type === 'Coding' ? 'fa-code' : 'fa-microphone'
                        } text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-medium truncate">
                          {act.status === 'completed' ? 'Completed: ' : 'Ongoing: '}
                          {act.type} Interview
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {act.role} • {getRelativeTime(act.startedAt || act.createdAt)}
                        </p>
                      </div>
                      <div className={`text-xs font-medium px-2 py-1 rounded ${
                        act.status === 'completed'
                          ? 'text-green-500 bg-green-500/10'
                          : 'text-yellow-500 bg-yellow-500/10'
                      }`}>
                        {act.scoreCard ? `${act.scoreCard.overallScore}%` : 'Ongoing'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          {/* END: Right Sidebar */}
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
  } catch (_) {
    return 'Recently';
  }
};
