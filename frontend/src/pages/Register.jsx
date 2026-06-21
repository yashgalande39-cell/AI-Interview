import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Building, GraduationCap, Calendar, AlertCircle, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

function GoogleLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

const STATS = [
  { value: '50K+', label: 'Students Trained' },
  { value: '98%',  label: 'Success Rate' },
  { value: '4.9',  label: 'User Rating' },
];

const COMPANIES = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Apple'];

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName]                     = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [collegeName, setCollegeName]       = useState('');
  const [branch, setBranch]                 = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [googleLoading, setGoogleLoading]   = useState(false);
  const [showPassword, setShowPassword]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password, collegeName, branch, graduationYear);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google sign-up failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pb-12" style={{ background: 'var(--bg)' }}>
      {/* Background layers */}
      <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)' }} />
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', transform: 'translate(-40%, -40%)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />

      <motion.main
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 px-6 py-12 items-center"
      >
        {/* Left — Branding */}
        <div className="flex-1 w-full flex flex-col gap-8 text-left hidden lg:flex">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">InterviewAI</span>
          </div>

          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Create your account &<br/>
              <span className="text-gradient">build confidence.</span>
            </h1>
            <p className="text-slate-400 mt-3 text-base leading-relaxed max-w-sm">
              Practice with AI interviewers. Get real feedback. Track progress. Confidently walk into any interview.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Trusted */}
          <div>
            <p className="text-xs text-slate-600 mb-3 font-medium uppercase tracking-wider">Trusted by professionals at</p>
            <div className="flex flex-wrap gap-4">
              {COMPANIES.map(c => (
                <span key={c} className="text-sm font-bold text-slate-600 hover:text-slate-400 transition-colors cursor-default">{c}</span>
              ))}
            </div>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {['Voice AI Interviews', 'Real-time Feedback', 'Coding Arena', 'Resume Analyzer', 'Career Roadmap'].map(f => (
              <span key={f}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748B' }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Right — Form Container */}
        <div className="w-full max-w-2xl">
          <div className="rounded-2xl p-8 lg:p-9"
            style={{
              background: 'rgba(13,18,32,0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
            }}>

            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">InterviewAI</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">Create Account 🚀</h2>
            <p className="text-slate-500 text-sm mb-6">Join 50,000+ students and prepare for your dream tech role.</p>

            {/* Alerts */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm mb-5 font-medium"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
                <AlertCircle size={15} className="flex-shrink-0" />{error}
              </div>
            )}

            {/* Google SignUp Button */}
            <button
              id="google-signup-btn"
              onClick={handleGoogleSignUp}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all mb-5 disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              {googleLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <GoogleLogo size={18} />
              )}
              {googleLoading ? 'Signing up with Google...' : 'Sign up with Google'}
            </button>

            {/* Divider */}
            <div className="relative flex items-center mb-5">
              <div className="flex-grow h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <span className="flex-shrink-0 mx-4 text-[11px] font-semibold text-slate-600 uppercase tracking-widest">or register with email</span>
              <div className="flex-grow h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
              {/* Name & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase pl-1" htmlFor="reg-name">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="glass-input w-full rounded-xl py-3 pl-10 pr-4 text-sm"
                      placeholder="Rahul Kumar"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase pl-1" htmlFor="reg-email">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-input w-full rounded-xl py-3 pl-10 pr-4 text-sm"
                      placeholder="rahul@college.edu"
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase pl-1" htmlFor="reg-password">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input w-full rounded-xl py-3 pl-10 pr-10 text-sm"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* College / University */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase pl-1" htmlFor="reg-college">College / University</label>
                <div className="relative">
                  <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    id="reg-college"
                    type="text"
                    required
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="glass-input w-full rounded-xl py-3 pl-10 pr-4 text-sm"
                    placeholder="IIT Bombay"
                  />
                </div>
              </div>

              {/* Branch & Graduation Year Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase pl-1" htmlFor="reg-branch">Branch / Major</label>
                  <div className="relative">
                    <GraduationCap size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      id="reg-branch"
                      type="text"
                      required
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="glass-input w-full rounded-xl py-3 pl-10 pr-4 text-sm"
                      placeholder="Computer Science"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase pl-1" htmlFor="reg-year">Graduation Year</label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      id="reg-year"
                      type="number"
                      required
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="glass-input w-full rounded-xl py-3 pl-10 pr-4 text-sm"
                      placeholder="2027"
                      min="2024"
                      max="2035"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="email-register-btn"
                type="submit"
                disabled={loading || googleLoading}
                className="btn btn-shimmer mt-4 py-3 w-full text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.3)',
                }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors" to="/login">Sign In</Link>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
