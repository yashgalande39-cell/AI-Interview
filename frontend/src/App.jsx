import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { usePlan } from './hooks/usePlan';

// Components
import Navbar from './components/Navbar';
import { PlanGate } from './components/PlanGate';

// Pages
import LandingPage from './components/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InterviewLobby from './pages/InterviewLobby';
import InterviewRoom from './pages/InterviewRoom';
import CodingEditor from './pages/CodingEditor';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobAnalyzer from './pages/JobAnalyzer';
import AptitudeEngine from './pages/AptitudeEngine';
import CareerRoadmap from './pages/CareerRoadmap';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';
import FeedbackAnalysis from './pages/FeedbackAnalysis';
import Settings from './pages/Settings';




// Route guards
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? children : <Navigate to="/login" replace />;
};

// Global Layout wrapper
const AppLayout = ({ children }) => {
  const { user, token, logout, theme, toggleTheme } = useAuth();
  const { plan } = usePlan();
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(true);

  const PLAN_META = {
    free:  { label: 'Free Plan',   icon: '⭕', cls: 'plan-badge-free' },
    pro:   { label: 'Pro Plan',    icon: '👑', cls: 'plan-badge-pro' },
    teams: { label: 'Teams Plan',  icon: '🌐', cls: 'plan-badge-teams' },
  };
  const planMeta = PLAN_META[plan] || PLAN_META.free;

  useEffect(() => {
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
      if (e.target.closest('.search-bar-container-global')) {
        return;
      }
      setShowSearch(false);
    };

    const handleFocusOut = () => {
      setShowSearch(true);
    };

    const handleClick = (e) => {
      const interactive = e.target.closest('button, a, [role="button"], input, select, textarea');
      if (interactive && !interactive.closest('.search-bar-container-global')) {
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

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-darkBg text-slate-100 transition-all duration-300">
        <Navbar />
        <main className="flex-1 flex flex-col min-w-0 pt-16">
          {children}
        </main>
      </div>
    );
  }

  const userName = user?.name || "Arjun Sharma";
  const userStreak = user?.streak || 12;
  const userAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBgwFYmrRi4wEsc2-x6OeW7SVUxsCLHN2AE8cCF0vpR5iaCR4PTZVsPH001cTmsFTwldqptU1tBrB95wt20yyYaH14J30brl9BlT24mIithlGHwQ3YiXIEHzhtUtHYNeoBeE5srsdoXIEff5b34q3f3AgUyE3Gu1BH_YpSVXZtcsP0kz1WxegetSgRdCkpooxMs8FRuqUKVBJrtAnIOd-LhUZbkM97fTxUilEA0CbbYMBm6cZ1et3AwqcbCM7lEWhhX3dwVMJo5DL9k";

  const isActive = (path) => location.pathname === path;
  const isFullHeight = location.pathname === '/coding' || location.pathname === '/interview-room';
  const containerClass = isFullHeight
    ? "flex-1 flex flex-col min-h-0 overflow-hidden" 
    : "flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar";

  return (
    <div className="flex h-screen w-screen overflow-hidden antialiased text-sm bg-[#0b0f19] text-[#e2e8f0]">
      <style>{`
        .glass-card {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
        }

        .neon-border {
          box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.2), 0 0 15px rgba(59, 130, 246, 0.1);
        }
        
        .sidebar-item:hover, .sidebar-item.active {
          background: linear-gradient(90deg, rgba(37, 99, 235, 0.1) 0%, transparent 100%);
          border-left: 3px solid #3b82f6;
        }
        
        .sidebar-item.active {
          color: #fff;
        }

        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-image: linear-gradient(to right, #60a5fa, #a78bfa);
        }

        .btn-gradient {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          transition: all 0.3s ease;
        }
        
        .btn-gradient:hover {
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>

      {/* BEGIN: Sidebar */}
      <aside className="w-64 bg-brand-dark border-r border-gray-800 flex flex-col h-full z-20 flex-shrink-0" data-purpose="sidebar-navigation">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            <i className="fa-solid fa-brain"></i>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-wide">Interview AI</h1>
            <p className="text-xs text-gray-400">AI Career Operating System</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3 custom-scrollbar">
          <Link 
            to="/dashboard" 
            className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard') 
                ? 'active text-white bg-blue-900/20 border border-blue-500/30' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-solid fa-house w-5 text-center text-blue-400"></i>
            <span className="font-medium">Dashboard</span>
            <i className="fa-solid fa-sparkles ml-auto text-blue-400 text-xs"></i>
          </Link>

          <Link 
            to="/lobby" 
            className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/lobby') 
                ? 'active text-white bg-blue-900/20 border border-blue-500/30' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-solid fa-microphone w-5 text-center"></i>
            <span>AI Interviews</span>
          </Link>

          <Link 
            to="/coding" 
            className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/coding') 
                ? 'active text-white bg-blue-900/20 border border-blue-500/30' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-solid fa-code w-5 text-center text-purple-400"></i>
            <span>Coding Arena</span>
            {plan === 'free' && <i className="fa-solid fa-lock text-xs ml-auto text-gray-500"></i>}
          </Link>

          <Link 
            to="/resume" 
            className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/resume') 
                ? 'active text-white bg-blue-900/20 border border-blue-500/30' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-regular fa-file-lines w-5 text-center text-teal-400"></i>
            <span>Resume Analyzer</span>
            {plan === 'free' && <i className="fa-solid fa-lock text-xs ml-auto text-gray-500"></i>}
          </Link>

          <Link 
            to="/gd" 
            className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/gd') 
                ? 'active text-white bg-blue-900/20 border border-blue-500/30' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-solid fa-briefcase w-5 text-center text-emerald-400"></i>
            <span>Job Analyzer</span>
            {plan === 'free' && <i className="fa-solid fa-lock text-xs ml-auto text-gray-500"></i>}
          </Link>

          <Link 
            to="/leaderboard" 
            className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mt-4 ${
              isActive('/leaderboard') 
                ? 'active text-white bg-blue-900/20 border border-blue-500/30' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-solid fa-chart-line w-5 text-center text-amber-400"></i>
            <span>Leaderboard</span>
            {plan === 'free' && <i className="fa-solid fa-lock text-xs ml-auto text-gray-500"></i>}
          </Link>

          <Link 
            to="/feedback" 
            className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/feedback') 
                ? 'active text-white bg-blue-900/20 border border-blue-500/30' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-solid fa-chart-simple w-5 text-center text-rose-400"></i>
            <span>Analytics</span>
            {plan === 'free' && <i className="fa-solid fa-lock text-xs ml-auto text-gray-500"></i>}
          </Link>

          <Link 
            to="/roadmap" 
            className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/roadmap') 
                ? 'active text-white bg-blue-900/20 border border-blue-500/30' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-solid fa-map w-5 text-center text-sky-400"></i>
            <span>Learning Roadmap</span>
            {plan === 'free' && <i className="fa-solid fa-lock text-xs ml-auto text-gray-500"></i>}
          </Link>

          <Link 
            to="/aptitude" 
            className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mt-4 ${
              isActive('/aptitude') 
                ? 'active text-white bg-blue-900/20 border border-blue-500/30' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-solid fa-vial w-5 text-center text-indigo-400"></i>
            <span>Aptitude Test</span>
            {plan === 'free' && <i className="fa-solid fa-lock text-xs ml-auto text-gray-500"></i>}
          </Link>



          <Link 
            to="/settings" 
            className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/settings') 
                ? 'active text-white bg-blue-900/20 border border-blue-500/30' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <i className="fa-solid fa-gear w-5 text-center"></i>
            <span>Settings</span>
          </Link>
        </nav>

        {/* Upgrade Promo */}
        <div className="p-4 mt-auto">
          {plan === 'free' ? (
            <div className="glass-card p-4 neon-border bg-gradient-to-b from-gray-800/50 to-gray-900/80">
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-star text-purple-400"></i>
                <h4 className="text-white font-medium">Upgrade to Pro</h4>
              </div>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">Unlock unlimited interviews, advanced analytics, and priority support.</p>
              <a
                href="/#pricing"
                className="w-full btn-gradient text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                Upgrade Now <i className="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          ) : (
            <div className="glass-card p-4 bg-gradient-to-b from-purple-900/20 to-gray-900/80">
              <div className="flex items-center gap-2 mb-1">
                <span>{planMeta.icon}</span>
                <h4 className={`font-medium text-sm ${planMeta.cls}`}>{planMeta.label}</h4>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">Your plan is active. Manage or upgrade on the pricing page.</p>
              <a
                href="/#pricing"
                className="mt-3 w-full text-center text-xs text-purple-400 hover:text-purple-300 flex items-center justify-center gap-1"
              >
                Manage Plan <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </a>
            </div>
          )}
        </div>

        {/* User Profile Toggle */}
        <div className="p-4 border-t border-gray-800">
          <div 
            onClick={logout}
            title="Click to Logout"
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img alt="User Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-700" src={userAvatar} />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm truncate">{userName}</h4>
                <p className={`text-xs flex items-center gap-1 ${planMeta.cls}`}>
                  {plan === 'free' ? <i className="fa-solid fa-circle text-[8px]"></i> : <i className="fa-solid fa-crown text-[10px]"></i>}
                  {planMeta.label}
                </p>
              </div>
            </div>
            <i className="fa-solid fa-right-from-bracket text-gray-500 group-hover:text-rose-400 text-xs transition-colors ml-2"></i>
          </div>
        </div>
      </aside>
      {/* END: Sidebar */}

      {/* BEGIN: Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-[#0b0f19] relative overflow-hidden">
        {/* BEGIN: Top Header */}
        <header className="h-20 flex items-center justify-between px-8 z-10 flex-shrink-0" data-purpose="main-header">
          {/* Welcome Message */}
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">Welcome back, {userName.split(' ')[0]}! <span className="text-xl">👋</span></h2>
            <p className="text-gray-400 text-sm mt-1">Ready to ace your next interview?</p>
          </div>
          {/* Search & Actions */}
          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className={`search-bar-container-global relative group hidden md:block transition-all duration-300 ease-in-out ${
              showSearch ? 'opacity-100 max-w-[280px] translate-x-0' : 'opacity-0 max-w-0 -translate-x-4 pointer-events-none overflow-hidden'
            }`}>
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
              <input className="bg-gray-900/50 border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-64 pl-10 p-2.5 transition-colors group-hover:bg-gray-800/50" placeholder="Search anything..." type="text" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <kbd className="px-1.5 py-0.5 text-[10px] font-sans bg-gray-800 border border-gray-700 rounded text-gray-400">⌘</kbd>
                <kbd className="px-1.5 py-0.5 text-[10px] font-sans bg-gray-800 border border-gray-700 rounded text-gray-400">K</kbd>
              </div>
            </div>
            {/* Streak */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 text-orange-500 font-bold text-lg">
                <i className="fa-solid fa-fire"></i> {userStreak}
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Day Streak</span>
            </div>
            {/* Notification & Settings */}
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-gray-900/50 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white relative transition-colors">
                <i className="fa-regular fa-bell"></i>
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-[#0b0f19] rounded-full"></span>
              </button>
              <button 
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full bg-gray-900/50 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                title="Toggle theme mode"
              >
                {theme === 'dark' ? <i className="fa-regular fa-moon text-indigo-400"></i> : <i className="fa-regular fa-sun text-amber-400"></i>}
              </button>
            </div>
          </div>
        </header>
        {/* END: Top Header */}

        {/* BEGIN: Content container */}
        <div className={containerClass}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Landing — rendered standalone */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AppLayout><Login /></AppLayout>} />
          <Route path="/register" element={<AppLayout><Register /></AppLayout>} />

          {/* Secure Protected Workspace Sprints */}
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/lobby" element={<ProtectedRoute><AppLayout><InterviewLobby /></AppLayout></ProtectedRoute>} />
          <Route path="/interview-room" element={<ProtectedRoute><AppLayout><InterviewRoom /></AppLayout></ProtectedRoute>} />
          <Route path="/coding" element={<ProtectedRoute><AppLayout><PlanGate requires="pro"><CodingEditor /></PlanGate></AppLayout></ProtectedRoute>} />
          <Route path="/resume" element={<ProtectedRoute><AppLayout><PlanGate requires="pro"><ResumeAnalyzer /></PlanGate></AppLayout></ProtectedRoute>} />
          <Route path="/gd" element={<ProtectedRoute><AppLayout><PlanGate requires="pro"><JobAnalyzer /></PlanGate></AppLayout></ProtectedRoute>} />
          <Route path="/aptitude" element={<ProtectedRoute><AppLayout><PlanGate requires="pro"><AptitudeEngine /></PlanGate></AppLayout></ProtectedRoute>} />
          <Route path="/roadmap" element={<ProtectedRoute><AppLayout><PlanGate requires="pro"><CareerRoadmap /></PlanGate></AppLayout></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><AppLayout><PlanGate requires="pro"><Leaderboard /></PlanGate></AppLayout></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AppLayout><AdminPanel /></AppLayout></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><AppLayout><PlanGate requires="pro"><FeedbackAnalysis /></PlanGate></AppLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />


          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
