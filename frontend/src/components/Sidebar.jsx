import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Mic, 
  Code, 
  FileText, 
  Users, 
  BookOpen, 
  Compass, 
  Trophy, 
  ShieldAlert,
  ArrowRightLeft,
  PenTool
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/lobby", label: "Interview Room", icon: Mic },
    { to: "/coding", label: "Coding Sandbox", icon: Code },
    { to: "/resume", label: "Resume Hub", icon: FileText },
    { to: "/gd", label: "Group Discussion", icon: Users },
    { to: "/whiteboard", label: "Collaborative Board", icon: PenTool },
    { to: "/aptitude", label: "Aptitude Center", icon: BookOpen },
    { to: "/roadmap", label: "Career Roadmap", icon: Compass },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy }
  ];

  // If user has admin email or mock credentials, expose admin controls
  const isAdmin = user && (user.email === 'admin@platform.com' || user.badges?.includes("Admin Access") || user.id === 'usr_admin');

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/60 min-h-[calc(100vh-76px)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-3">
          Core Navigation
        </div>
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => 
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    isActive 
                      ? "bg-glow-gradient text-white border-violet-500/25 shadow-md shadow-violet-500/10" 
                      : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => 
              `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                isActive 
                  ? "bg-amber-500 text-slate-950 border-amber-600 shadow-md" 
                  : "text-amber-400 border-amber-500/10 bg-amber-500/5 hover:bg-amber-500/10 hover:text-amber-300"
              }`
            }
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>Admin Control Panel</span>
          </NavLink>
        )}

        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-center">
          <div className="text-xs text-slate-400 font-medium">Need Assistance?</div>
          <div className="text-[10px] text-slate-500 mt-1">Check FAQs in Landing Page or speak with our prep support desk.</div>
        </div>
      </div>
    </aside>
  );
}
