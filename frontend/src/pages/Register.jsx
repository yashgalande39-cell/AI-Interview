import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Building, GraduationCap, Calendar, AlertCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password, collegeName, branch, graduationYear);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center px-6 relative py-12">
      {/* Background neon radial blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accentViolet/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-lg glass-panel rounded-3xl p-8 shadow-2xl relative z-10 border border-slate-800/80">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Create Account
          </h2>
          <p className="text-slate-400 text-xs">
            Start mock interviews, build ATS resumes, and unlock daily XP streaks.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs mb-6 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Rahul Kumar" 
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 text-sm focus:border-accentViolet focus:ring-1 focus:ring-accentViolet outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="rahul@college.edu" 
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 text-sm focus:border-accentViolet focus:ring-1 focus:ring-accentViolet outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 text-sm focus:border-accentViolet focus:ring-1 focus:ring-accentViolet outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
              College / University Name
            </label>
            <div className="relative">
              <Building className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                value={collegeName}
                onChange={e => setCollegeName(e.target.value)}
                placeholder="IIT Bombay" 
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 text-sm focus:border-accentViolet focus:ring-1 focus:ring-accentViolet outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Branch / Major
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  placeholder="Computer Science" 
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 text-sm focus:border-accentViolet focus:ring-1 focus:ring-accentViolet outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Graduation Year
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="number" 
                  value={graduationYear}
                  onChange={e => setGraduationYear(e.target.value)}
                  placeholder="2027" 
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 text-sm focus:border-accentViolet focus:ring-1 focus:ring-accentViolet outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-glow-gradient py-4 rounded-xl text-sm font-bold text-white shadow-xl hover:shadow-violet-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-slate-900/60 text-xs">
          <span className="text-slate-500">Already have an account? </span>
          <Link to="/login" className="font-bold text-accentCyan hover:text-accentCyan/80 transition-colors pl-0.5">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
