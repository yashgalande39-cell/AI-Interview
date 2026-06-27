import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Building, GraduationCap, Calendar, AlertCircle, Eye, EyeOff, Globe, ArrowLeft } from 'lucide-react';
// ─── Google Logo Component ───────────────────────────────────────────────────
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

// ─── VideoBackground Component ────────────────────────────────────────────────
const VideoBackground = ({ videoUrl }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {
      // Autoplay blocked — background will fall through to CSS fallback
    });
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <video
        ref={videoRef}
        className="absolute inset-0 min-w-full min-h-full object-cover w-auto h-auto"
        autoPlay
        loop
        muted
        playsInline
        /* CSS fallback if video is blocked */
        style={{ background: 'linear-gradient(135deg,#0a0015,#0d0025 40%,#1a0038 70%,#0a0020)' }}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
    </div>
  );
};

// ─── FormInput Component ──────────────────────────────────────────────────────
const FormInput = ({
  icon, rightSlot, ...props
}) => (
  <div className="relative">
    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
      {icon}
    </div>
    <input
      {...props}
      className={`w-full pl-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-500/60 transition-colors ${rightSlot ? 'pr-10' : 'pr-3'}`}
    />
    {rightSlot && (
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
        {rightSlot}
      </div>
    )}
  </div>
);

// ─── Main Register Component ──────────────────────────────────────────────────
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
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12">
      <VideoBackground videoUrl="/background-video.mp4" />

      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all duration-200"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      <div className="relative z-20 w-full max-w-5xl px-3 sm:px-6">
        <div className="mx-auto w-full max-w-4xl p-6 sm:p-8 lg:p-10 rounded-3xl backdrop-blur-sm bg-black/50 border border-white/10 shadow-2xl overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1.3fr] items-stretch">
            
            {/* Left Panel — Branding & Stats */}
            <div className="space-y-6 flex flex-col justify-start">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 text-white/90">
                    <Globe size={18} />
                  </div>
                  <div className="text-sm font-semibold text-white">TRESK AI</div>
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                    Land your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">dream role.</span>
                  </h1>
                  <p className="max-w-xl text-sm text-white/60">
                    Practice with AI interviewers. Get real feedback. Track progress. Confidently walk into any interview.
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {[
                    ['50K+', 'Students Trained'],
                    ['98%', 'Success Rate'],
                    ['4.9', 'User Rating'],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xl font-semibold text-white">{value}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.32em] text-white/50">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {['Voice AI Interviews', 'Real-time Feedback', 'Coding Arena', 'Resume Analyzer'].map(label => (
                    <span key={label} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 text-center">{label}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel — Signup Form */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold text-white tracking-tight">Create Account 🚀</h2>
                <p className="text-sm text-white/70 max-w-sm">Join 50,000+ students and prepare for your dream tech role.</p>
              </div>

              {/* Alerts */}
              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
                  <AlertCircle size={15} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Google Button */}
              <button
                id="google-signup-btn"
                type="button"
                onClick={handleGoogleSignUp}
                disabled={googleLoading || loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition disabled:opacity-50"
              >
                {googleLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <GoogleLogo size={18} />
                )}
                {googleLoading ? 'Signing up...' : 'Continue with Google'}
              </button>

              {/* Divider */}
              <div className="relative py-2 text-center">
                <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />
                <span className="relative inline-flex items-center bg-black/50 px-3 text-xs uppercase tracking-[0.24em] text-white/50">or email</span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  id="reg-name"
                  icon={<User size={17} />}
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoComplete="name"
                />

                <FormInput
                  id="reg-email"
                  icon={<Mail size={17} />}
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />

                <FormInput
                  id="reg-password"
                  icon={<Lock size={17} />}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={6}
                  rightSlot={
                    <button
                      type="button"
                      className="text-white/50 hover:text-white transition-colors focus:outline-none"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                />

                <FormInput
                  id="reg-college"
                  icon={<Building size={17} />}
                  type="text"
                  placeholder="College / University"
                  value={collegeName}
                  onChange={e => setCollegeName(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    id="reg-branch"
                    icon={<GraduationCap size={17} />}
                    type="text"
                    placeholder="Branch / Major"
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    required
                  />

                  <FormInput
                    id="reg-year"
                    icon={<Calendar size={17} />}
                    type="number"
                    placeholder="Graduation Year"
                    value={graduationYear}
                    onChange={e => setGraduationYear(e.target.value)}
                    required
                    min="2024"
                    max="2035"
                  />
                </div>

                <button
                  id="email-register-btn"
                  type="submit"
                  disabled={loading || googleLoading}
                  className={`w-full py-3 rounded-lg text-white text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/60 disabled:opacity-75 disabled:cursor-not-allowed ${loading ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-700 hover:-translate-y-0.5 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'}`}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-sm text-white/50">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-white hover:text-purple-300 transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-xs z-20">
        © 2026 TRESK AI. All rights reserved.
      </footer>
    </div>
  );
}
