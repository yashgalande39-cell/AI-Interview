import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, Flame, Type, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout, theme, toggleTheme, fontSize, setAccessibilitySize } = useAuth();

  const handleFontSizeCycle = () => {
    if (fontSize === 100) setAccessibilitySize(120);
    else if (fontSize === 120) setAccessibilitySize(140);
    else setAccessibilitySize(100);
  };

  return (
    <nav className="glass-panel border-b border-slate-800/60 sticky top-0 z-50 px-6 py-4 flex items-center justify-between transition-colors duration-300">
      <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3">
        <div className="bg-glow-gradient p-2.5 rounded-xl shadow-lg shadow-violet-500/20 text-white animate-pulse-slow">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            INTERVIEWPULSE AI
          </span>
          <div className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">AI Mock Simulator</div>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        {/* Accessibility Font Zoomer */}
        <button 
          onClick={handleFontSizeCycle} 
          className="p-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all active:scale-95 flex items-center gap-1.5"
          title="Adjust Text Size (Accessibility)"
        >
          <Type className="w-4 h-4" />
          <span className="text-xs font-bold">{fontSize}%</span>
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="p-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all active:scale-95"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {user ? (
          <div className="flex items-center gap-4 pl-4 border-l border-slate-800/80">
            {/* XP and Streak display */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 fill-current animate-bounce" />
                <span>{user.streak || 1} Day Streak</span>
              </div>
              <div className="bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20 text-xs font-bold text-violet-400">
                ⭐ {user.xp || 0} XP
              </div>
            </div>

            {/* User Dropdown Profile Profile */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shadow-md">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-slate-200">{user.name}</div>
                <div className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">Active Candidate</div>
              </div>
            </div>

            {/* Logout */}
            <button 
              onClick={logout} 
              className="p-2.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95"
              title="Logout Profile"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-semibold bg-glow-gradient px-4 py-2.5 rounded-lg text-white shadow-md hover:shadow-violet-500/30 transition-all hover:scale-[1.02]">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
