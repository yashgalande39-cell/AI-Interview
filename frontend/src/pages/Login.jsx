import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, Mic, BarChart2, Code, Target } from 'lucide-react';

// Google "G" SVG Logo
function GoogleLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function Login() {
  const { login, loginWithGoogle, firebaseReady } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setMessage('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email address first to reset password.');
      return;
    }
    setMessage(`Password reset link sent to ${email}!`);
  };

  return (
    <div className="relative min-h-[calc(100vh-76px)] flex items-center justify-center p-6 lg:p-12 overflow-hidden bg-[#0d0620] text-[#e2e8f0]">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid z-0"></div>
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] glow-ring z-0 opacity-40"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] glow-circle z-0 translate-x-1/4 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#0a0518] to-transparent z-0"></div>
      {/* Subtle stars/dots */}
      <div className="absolute inset-0 z-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>

      <main className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
        {/* Left Content Section */}
        <section className="flex-1 w-full flex flex-col gap-10 text-left">
          {/* Header */}
          <div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 text-gradient-primary pb-2">
              Interview Success
            </h1>
            <p className="text-lg lg:text-xl text-slate-300 max-w-md">
              Practice smarter. Get real-time feedback.<br/>
              Crack more interviews with confidence.
            </p>
          </div>

          {/* Features List */}
          <div className="flex flex-col gap-8 mt-4">
            <div className="flex gap-4 items-start">
              <div className="icon-box text-purple-400 shrink-0">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">AI Interviewer</h3>
                <p className="text-sm text-slate-400 max-w-sm">Realistic AI conversations tailored to your role and experience.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="icon-box text-blue-400 shrink-0">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Smart Analytics</h3>
                <p className="text-sm text-slate-400 max-w-sm">Detailed insights to improve your communication and performance.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="icon-box text-fuchsia-400 shrink-0">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Coding Practice</h3>
                <p className="text-sm text-slate-400 max-w-sm">Solve real coding problems with AI-powered hints and analysis.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="icon-box text-teal-400 shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Track Progress</h3>
                <p className="text-sm text-slate-400 max-w-sm">Monitor your improvement and stay interview ready.</p>
              </div>
            </div>
          </div>

          {/* Stats Footer (Left Side) */}
          <div className="glass-card rounded-2xl p-6 mt-8 max-w-xl">
            <div className="flex flex-wrap items-center gap-8 mb-6">
              <div className="avatar-stack">
                <div className="bg-orange-500"></div>
                <div className="bg-blue-400"></div>
                <div className="bg-teal-400"></div>
                <div className="bg-fuchsia-400 flex items-center justify-center text-[10px] font-bold text-white">+50K</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">50,000+</div>
                <div className="text-[10px] font-semibold text-slate-400 tracking-wider">STUDENTS TRAINED</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">98%</div>
                <div className="text-[10px] font-semibold text-slate-400 tracking-wider">SUCCESS RATE</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">4.9/5</div>
                <div className="text-[10px] font-semibold text-slate-400 tracking-wider">USER RATING</div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-slate-400 mb-3">Trusted by students and professionals at</p>
              <div className="flex gap-6 items-center opacity-70 grayscale flex-wrap">
                <span className="font-bold text-sm text-white">Google</span>
                <span className="font-bold text-sm lowercase text-white">amazon</span>
                <span className="font-bold text-sm text-white">Microsoft</span>
                <span className="font-bold text-sm text-white">Meta</span>
                <span className="font-bold text-sm tracking-widest text-red-500 grayscale-0">NETFLIX</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Login Form Section */}
        <section className="w-full max-w-md relative z-10">
          <div className="glass-card glass-card-glow rounded-3xl p-8 lg:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                <span className="text-gradient-primary">Welcome</span> Back! 👋
              </h2>
              <p className="text-sm text-slate-400">Sign in to continue your interview preparation journey.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs mb-6 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs mb-6 font-semibold">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span>{message}</span>
              </div>
            )}

            {/* Google Sign In — Primary CTA */}
            <button
              id="google-signin-btn"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 mb-6 shadow-lg hover:shadow-white/5"
              style={{ letterSpacing: '0.01em' }}
            >
              {googleLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <GoogleLogo size={20} />
              )}
              {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] font-semibold text-slate-500 tracking-widest uppercase">Or sign in with email</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-wider text-slate-300 uppercase pl-1" htmlFor="login-email">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input w-full rounded-xl py-3 pl-10 pr-4 text-sm placeholder-slate-500 focus:ring-0 focus:border-purple-500"
                    placeholder="youremail@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-wider text-slate-300 uppercase pl-1" htmlFor="login-password">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input w-full rounded-xl py-3 pl-10 pr-10 text-sm placeholder-slate-500 focus:ring-0 focus:border-purple-500"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="form-checkbox rounded text-purple-500 bg-transparent border-slate-500 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-fuchsia-400 hover:text-fuchsia-300 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                id="email-signin-btn"
                type="submit"
                disabled={loading || googleLoading}
                className="mt-2 w-full bg-gradient-primary hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-400">
              Don't have an account? <Link className="text-fuchsia-400 hover:text-fuchsia-300 font-semibold transition-colors" to="/register">Create Account</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
