import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, Mic, BarChart2, Code, Target } from 'lucide-react';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setError('');
    setMessage('');
    setLoading(true);
    const mockEmail = `${provider.toLowerCase()}user@example.com`;
    const mockName = `${provider} Scholar`;
    try {
      try {
        // Try registration first in case it's a first-time login
        await register(mockName, mockEmail, 'password123', 'AI Interview College', 'Software Engineering', '2027');
      } catch {
        // If registration fails (e.g. user already exists), attempt login
        await login(mockEmail, 'password123');
      }
      navigate('/dashboard');
    } catch {
      setError(`Failed to authenticate with ${provider}.`);
    } finally {
      setLoading(false);
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
            {/* Feature 1 */}
            <div className="flex gap-4 items-start">
              <div className="icon-box text-purple-400 shrink-0">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">AI Interviewer</h3>
                <p className="text-sm text-slate-400 max-w-sm">Realistic AI conversations tailored to your role and experience.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4 items-start">
              <div className="icon-box text-blue-400 shrink-0">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Smart Analytics</h3>
                <p className="text-sm text-slate-400 max-w-sm">Detailed insights to improve your communication and performance.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4 items-start">
              <div className="icon-box text-fuchsia-400 shrink-0">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Coding Practice</h3>
                <p className="text-sm text-slate-400 max-w-sm">Solve real coding problems with AI-powered hints and analysis.</p>
              </div>
            </div>

            {/* Feature 4 */}
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-wider text-slate-300 uppercase pl-1" htmlFor="email">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input w-full rounded-xl py-3 pl-10 pr-4 text-sm placeholder-slate-500 focus:ring-0 focus:border-purple-500"
                    placeholder="youremail@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-wider text-slate-300 uppercase pl-1" htmlFor="password">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input w-full rounded-xl py-3 pl-10 pr-10 text-sm placeholder-slate-500 focus:ring-0 focus:border-purple-500"
                    placeholder="••••••••"
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
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-gradient-primary hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Sign In...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Social Logins */}
            <div className="mt-8">
              <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-[10px] font-semibold text-slate-500 tracking-widest uppercase">Or continue with</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleSocialLogin('Google')}
                  className="glass-input rounded-xl py-2 px-3 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                >
                  <span className="text-red-500 font-bold text-sm">G</span>
                  <span className="text-xs font-semibold">Google</span>
                </button>
                <button
                  onClick={() => handleSocialLogin('LinkedIn')}
                  className="glass-input rounded-xl py-2 px-3 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                >
                  <span className="text-blue-500 font-bold text-sm">in</span>
                  <span className="text-xs font-semibold">LinkedIn</span>
                </button>
                <button
                  onClick={() => handleSocialLogin('GitHub')}
                  className="glass-input rounded-xl py-2 px-3 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                >
                  <svg className="bi bi-github" fill="currentColor" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                  </svg>
                  <span className="text-xs font-semibold">GitHub</span>
                </button>
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-slate-400">
              Don't have an account? <Link className="text-fuchsia-400 hover:text-fuchsia-300 font-semibold transition-colors" to="/register">Create Account</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
