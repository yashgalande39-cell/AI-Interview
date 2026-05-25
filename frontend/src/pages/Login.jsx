import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center px-6 relative py-12">
      {/* Background radial neon blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accentViolet/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl relative z-10 border border-slate-800/80">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-xs">
            Sign in to continue your mock preparation sprints.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs mb-6 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="candidate@college.edu" 
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 text-sm focus:border-accentViolet focus:ring-1 focus:ring-accentViolet outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">
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

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-glow-gradient py-4 rounded-xl text-sm font-bold text-white shadow-xl hover:shadow-violet-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-slate-900/60 text-xs">
          <span className="text-slate-500">Don't have an account? </span>
          <Link to="/register" className="font-bold text-accentCyan hover:text-accentCyan/80 transition-colors pl-0.5">
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}
