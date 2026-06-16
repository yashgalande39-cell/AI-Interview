import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, Flame, Type, Search, Bell, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout, theme, toggleTheme, fontSize, setAccessibilitySize } = useAuth();

  const handleFontSizeCycle = () => {
    if (fontSize === 100) setAccessibilitySize(120);
    else if (fontSize === 120) setAccessibilitySize(140);
    else setAccessibilitySize(100);
  };

  const [showSearch, setShowSearch] = React.useState(true);

  React.useEffect(() => {
    let scrollTimeout;
    const handleScroll = (e) => {
      const target = e.target;
      if (target && target.scrollTop !== undefined) {
        const scrollTop = target.scrollTop;
        if (scrollTop > 10) {
          setShowSearch(false);
        } else {
          setShowSearch(true);
        }
      }
    };

    const handleFocusIn = (e) => {
      if (e.target.closest('.search-bar-container')) {
        return;
      }
      setShowSearch(false);
    };

    const handleFocusOut = () => {
      setShowSearch(true);
    };

    const handleClick = (e) => {
      const interactive = e.target.closest('button, a, [role="button"], input, select, textarea');
      if (interactive && !interactive.closest('.search-bar-container')) {
        setShowSearch(false);
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          setShowSearch(true);
        }, 2000);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('click', handleClick);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 h-16 bg-surface/80 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.05)] select-none">
      {/* Left section: Search or Brand fallback */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className={`search-bar-container flex items-center bg-[#191c1e] border border-white/5 rounded-full px-4 py-1.5 focus-within:border-[#22d3ee]/50 transition-all duration-300 ease-in-out ${
            showSearch ? 'opacity-100 max-w-[320px] translate-x-0' : 'opacity-0 max-w-0 -translate-x-4 pointer-events-none overflow-hidden border-none px-0 py-0'
          }`}>
            <Search className="text-[#bbc9cd] w-4.5 h-4.5 mr-2 shrink-0" />
            <input 
              className="bg-transparent border-none text-sm focus:ring-0 text-[#e0e3e5] placeholder:text-[#bbc9cd]/60 w-48 lg:w-64 outline-none shrink-0" 
              placeholder="Search anything..." 
              type="text"
            />
            <span className="text-[#bbc9cd] font-mono text-[10px] ml-2 border border-white/10 rounded px-1 shrink-0">⌘K</span>
          </div>
        ) : (
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-gradient-primary p-2.5 rounded-xl shadow-lg shadow-violet-500/20 text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                INTERVIEWPULSE AI
              </span>
            </div>
          </Link>
        )}
      </div>

      {/* Right section: Profile, Streak, XP, Actions */}
      <div className="flex items-center gap-4">
        {/* Accessibility Control (preserved) */}
        <button 
          onClick={handleFontSizeCycle} 
          className="p-2 rounded-lg border border-white/5 text-[#bbc9cd] hover:text-white hover:bg-white/5 transition-all"
          title="Adjust Text Size (Accessibility)"
        >
          <Type className="w-4 h-4" />
        </button>

        {/* Theme Toggle (preserved) */}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-lg border border-white/5 text-[#bbc9cd] hover:text-white hover:bg-white/5 transition-all"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {user ? (
          <div className="flex items-center gap-4 pl-4 border-l border-white/10">
            {/* Streak & XP Indicator */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[#bbc9cd] hover:text-white hover:bg-white/5 px-2.5 py-1 rounded-full border border-white/10 transition-colors cursor-pointer">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span className="text-xs font-semibold uppercase font-label-caps tracking-wider">{user.streak || 1} Day Streak</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#bbc9cd] hover:text-white hover:bg-white/5 px-2.5 py-1 rounded-full border border-white/10 transition-colors cursor-pointer">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold uppercase font-label-caps tracking-wider">{user.xp || 5900} XP</span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-3">
              <img 
                alt={`${user.name} - Active Candidate`} 
                className="w-8 h-8 rounded-full border border-[#22d3ee]/30" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-t6GIuxAJSKMXeGA-9FMt7Gfkyu6dh6GeNh3614fqR8ao41sNuAUMV-2PTJwLLNLXMM5CEtVMrQTzCkWF1gqoPsHBHGZjetA3hSlwpuZi0L0HkEI0xyK-RohYe1NuansdMFezfBDMziqYilJGQhGD6uJPwjv6rHplRrz2s6YVlbe6IEh_uG7UZIUOEU5v0SlMugF4qqCap-BBJeu8YRvy8OCwwhX00xsvA2nY0Txe-lXxzrkrpcejuyXBA2r9BcXTo97DzxdFrexh"
              />
              <div className="hidden md:block text-left">
                <p className="text-[13px] font-bold text-white tracking-wider leading-none">{user.name}</p>
                <p className="text-[10px] text-[#4edea3] font-semibold mt-0.5 uppercase tracking-wide">Active Candidate</p>
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-[#bbc9cd] hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#22d3ee] rounded-full border border-[#101415]"></span>
            </button>

            {/* Logout button */}
            <button 
              onClick={logout} 
              className="p-2 rounded-lg text-[#bbc9cd] hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Logout Profile"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-semibold bg-gradient-primary px-4 py-2 rounded-lg text-white shadow-md transition-all hover:scale-[1.02]">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
