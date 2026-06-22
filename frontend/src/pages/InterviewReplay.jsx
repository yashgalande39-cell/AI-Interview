import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import { Link } from 'react-router-dom';
import {
  Play, ArrowLeft, Mic, Code2, BarChart3, Clock,
  CheckCircle, TrendingUp, MessageSquare, Star, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function InterviewReplay() {
  const { token } = useAuth();
  const [replays, setReplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    const fetchReplays = async () => {
      try {
        const res = await fetch(`${API_BASE}/interviews/replay`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setReplays(data.replays || []);
        }
      } catch (e) {
        console.warn('Could not fetch replays:', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReplays();
  }, [token]);

  const handleSelectSession = async (replay) => {
    setSelected(replay);
    setLoadingEvents(true);
    setEvents([]);
    try {
      const res = await fetch(`${API_BASE}/interviews/replay/${replay.sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (e) {
      console.warn('Could not fetch replay events:', e.message);
    } finally {
      setLoadingEvents(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return 'N/A'; }
  };

  return (
    <div className="px-6 pt-6 pb-8 min-h-screen" style={{ color: '#E2E8F0' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/feedback"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <ArrowLeft size={16} className="text-slate-400" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Interview Replay</h1>
          <p className="text-xs text-slate-500 mt-0.5">Revisit your past sessions and analyze performance</p>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Left — Session List */}
        <div className="w-72 flex-shrink-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {replays.length} Sessions
          </p>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : replays.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Mic size={28} className="text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">No replays yet</p>
              <p className="text-xs text-slate-600 mt-1">Complete a mock interview to see replays here</p>
              <Link to="/lobby"
                className="mt-4 inline-block text-xs font-semibold px-4 py-2 rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                Start Interview
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {replays.map((r) => (
                <motion.button
                  key={r.sessionId}
                  whileHover={{ x: 3 }}
                  onClick={() => handleSelectSession(r)}
                  className="w-full text-left rounded-xl p-4 transition-all"
                  style={{
                    background: selected?.sessionId === r.sessionId
                      ? 'rgba(99,102,241,0.15)'
                      : 'rgba(255,255,255,0.04)',
                    border: selected?.sessionId === r.sessionId
                      ? '1px solid rgba(99,102,241,0.4)'
                      : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{r.company} — {r.role}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5 capitalize">{r.type} Interview</p>
                      <p className="text-slate-600 text-[10px] mt-1 flex items-center gap-1">
                        <Calendar size={9} /> {formatDate(r.completedAt)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-sm font-bold" style={{ color: scoreColor(r.overallScore) }}>
                        {r.overallScore}
                      </span>
                      <p className="text-[9px] text-slate-600">Overall</p>
                    </div>
                  </div>
                  {/* Score bar */}
                  <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full" style={{ width: `${r.overallScore}%`, background: `linear-gradient(90deg,${scoreColor(r.overallScore)}80,${scoreColor(r.overallScore)})` }} />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Right — Replay Detail */}
        <div className="flex-1 min-w-0">
          {!selected ? (
            <div className="h-full rounded-2xl flex flex-col items-center justify-center py-24"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderStyle: 'dashed' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Play size={28} className="text-indigo-400" />
              </div>
              <p className="text-slate-400 font-semibold text-sm">Select a session to replay</p>
              <p className="text-slate-600 text-xs mt-1">Click any session from the left panel</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Session Header */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white font-bold text-lg">{selected.company}</h2>
                    <p className="text-indigo-300 text-sm">{selected.role} · <span className="capitalize">{selected.type}</span> Interview</p>
                    <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                      <Calendar size={10} /> Completed on {formatDate(selected.completedAt)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black" style={{ color: scoreColor(selected.overallScore) }}>
                      {selected.overallScore}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Overall Score</p>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Technical', score: selected.technicalScore, icon: Code2, color: '#10B981' },
                  { label: 'Communication', score: selected.communicationScore, icon: MessageSquare, color: '#3B82F6' },
                  { label: 'Overall', score: selected.overallScore, icon: Star, color: '#8B5CF6' },
                ].map(({ label, score, icon: Icon, color }) => (
                  <div key={label} className="rounded-xl p-4 text-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                      style={{ background: `${color}18` }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <p className="text-xl font-bold text-white">{score || 0}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
                    <div className="mt-2 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div className="h-full rounded-full" style={{ width: `${score || 0}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Replay Events / Timeline */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={14} className="text-indigo-400" />
                  <h3 className="text-white font-semibold text-sm">Session Timeline</h3>
                </div>

                {loadingEvents ? (
                  <div className="flex items-center gap-2 py-6 justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    <span className="text-xs text-slate-500">Loading timeline...</span>
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 size={24} className="text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Detailed replay not available</p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      Future sessions will capture a full Q&A timeline here
                    </p>
                    {/* Show simulated timeline based on scorecard */}
                    <div className="mt-6 space-y-3 text-left">
                      {[
                        { t: '0:00', type: 'Session started', icon: Play, color: '#6366F1' },
                        { t: '2:15', type: 'First question delivered', icon: MessageSquare, color: '#8B5CF6' },
                        { t: '8:40', type: 'Technical assessment', icon: Code2, color: '#10B981' },
                        { t: '18:30', type: 'Communication review', icon: Mic, color: '#3B82F6' },
                        { t: '25:00', type: 'Session completed', icon: CheckCircle, color: '#F59E0B' },
                      ].map(({ t, type, icon: Icon, color }, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-600 w-10 flex-shrink-0">{t}</span>
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${color}18` }}>
                            <Icon size={10} style={{ color }} />
                          </div>
                          <p className="text-xs text-slate-400">{type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events.map((event, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-[10px] text-slate-600 w-14 flex-shrink-0 mt-0.5">
                          {Math.floor(event.t / 60000)}:{String(Math.floor((event.t % 60000) / 1000)).padStart(2, '0')}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#6366F1' }} />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-300 capitalize">{event.type}</p>
                          {event.payload?.text && (
                            <p className="text-[10px] text-slate-500 mt-0.5">{event.payload.text}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Improvement Tips */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <h3 className="text-white font-semibold text-sm">TRESK Improvement Tips</h3>
                </div>
                <ul className="space-y-2">
                  {selected.technicalScore < 80 && (
                    <li className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 flex-shrink-0">→</span>
                      Practice 2–3 DSA problems daily focusing on graph algorithms and DP patterns to boost your technical score.
                    </li>
                  )}
                  {selected.communicationScore < 80 && (
                    <li className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 flex-shrink-0">→</span>
                      Record yourself answering behavioral questions using the STAR format. Aim for clear, 2-minute structured answers.
                    </li>
                  )}
                  <li className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 flex-shrink-0">→</span>
                    Schedule your next practice round within 48 hours to maintain momentum and build your streak.
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
