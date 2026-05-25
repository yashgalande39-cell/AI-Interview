import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Trophy, Flame, Award, ShieldAlert, Star, 
  ChevronRight, ArrowUpRight, Compass, RefreshCw 
} from 'lucide-react';

export default function Leaderboard() {
  const { token, user } = useAuth();
  
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/gamification/leaderboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBoard(data.leaderboard || []);
        } else {
          throw new Error("Board failed");
        }
      } catch (err) {
        console.warn("Using offline board datasets", err.message);
        // Fallback Ranks
        setBoard([
          { rank: 1, name: "Sneha Patel", xp: 3450, streak: 12, badges: ["Coding Master", "Fluency King"] },
          { rank: 2, name: "Amit Sharma", xp: 2850, streak: 8, badges: ["Consistent Scholar"] },
          { rank: 3, name: "Rahul Kumar (You)", xp: user?.xp || 100, streak: user?.streak || 1, badges: user?.badges || ["Novice Prep"] },
          { rank: 4, name: "Jessica Roy", xp: 1250, streak: 4, badges: ["Interview Scholar"] },
          { rank: 5, name: "David Chen", xp: 950, streak: 2, badges: ["Novice Prep"] }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [token, user]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-accentViolet border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-76px)]">
      
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          🏆 Ranks & Leaderboard Seasons
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm">
          Check competitive prep levels, track global user streaks, and inspect earned XP badges.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Board list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
              <h3 className="text-base font-bold text-slate-200">Active Seasonal Rankings</h3>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Season 1 Sprints</span>
            </div>

            <div className="space-y-3">
              {board.map((item, idx) => {
                const isMe = item.name.includes("You") || item.name === user?.name;
                return (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-colors ${
                      isMe 
                        ? 'bg-violet-500/10 border-violet-500/25 shadow-md' 
                        : 'bg-slate-950/40 border-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank tag */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        item.rank === 1 ? 'bg-amber-500 text-slate-950 shadow-md' :
                        item.rank === 2 ? 'bg-slate-300 text-slate-950 shadow-md' :
                        item.rank === 3 ? 'bg-amber-700 text-white shadow-md' : 'text-slate-550'
                      }`}>
                        #{item.rank}
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          {item.name}
                          {isMe && <span className="text-[8px] bg-accentCyan text-slate-950 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">Me</span>}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.badges.slice(0, 2).map(b => (
                            <span key={b} className="text-[8px] px-2 py-0.5 rounded bg-slate-900 border border-slate-850 text-slate-450 font-bold">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-200">⭐ {item.xp}</span>
                        <span className="text-[8px] font-bold text-slate-550 uppercase block">XP points</span>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[9px] font-bold">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>{item.streak}d</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Columns: User Badge inventory */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-violet-400 font-extrabold text-sm border-b border-slate-800 pb-3">
              <Award className="w-5 h-5 fill-current animate-pulse" /> Your Achievement Inventory
            </div>

            <div className="space-y-3 pt-2">
              {user?.badges?.map(b => (
                <div key={b} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center text-sm">
                    🏅
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-200">{b}</div>
                    <div className="text-[9px] text-slate-500 leading-normal">Unlocked milestone badge!</div>
                  </div>
                </div>
              ))}

              {(!user?.badges || user.badges.length === 0) && (
                <div className="text-center py-10 text-xs text-slate-500 leading-normal">
                  Unlock milestones (such as complete your first code submission) to list earned profile badges.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
