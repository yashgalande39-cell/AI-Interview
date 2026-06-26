/**
 * TRESK AI — Auth Context
 * =====================================================================
 * Phase 2:
 *  - Access token stored in memory only (NOT localStorage) — XSS safe
 *  - Cookies (httpOnly) carry the refresh token — managed by browser
 *  - On app load, silently calls /api/auth/refresh to restore session
 *  - Offline mock fallback removed from production builds
 */
import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, hasConfig as firebaseReady } from '../firebase';
import { API_BASE } from '../config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { setAccessToken, clearAccessToken, apiPost, apiGet, apiPut } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser]           = useState(null);
  const [token, setToken]         = useState('');
  const [initializing, setInitializing] = useState(true);
  const [theme, setTheme]         = useState(localStorage.getItem('theme') || 'dark');
  const [fontSize, setFontSize]   = useState(parseInt(localStorage.getItem('font-size')) || 100);
  const [plan, setPlan]           = useState('free');
  const refreshAttempted          = useRef(false);

  // ── On mount: try to restore session via refresh token cookie ──────────────
  useEffect(() => {
    if (refreshAttempted.current) return;
    refreshAttempted.current = true;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.token);
          setToken(data.token);

          // Fetch user profile with fresh token
          const profileRes = await fetch(`${API_BASE}/auth/profile`, {
            headers: { 
              'Authorization': `Bearer ${data.token}`,
              'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            credentials: 'include',
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.user) {
              setUser(profileData.user);
              setPlan(profileData.user.plan || 'free');
            }
          }
        }
        // If refresh fails (401), user is simply not logged in — that's OK
      } catch {
        // Network error — user stays unauthenticated
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  // ── Theme sync ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // ── Font size sync ──────────────────────────────────────────────────────────
  useEffect(() => {
    window.document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('font-size', fontSize);
  }, [fontSize]);

  // ── Register ────────────────────────────────────────────────────────────────
  const register = async (name, email, password, collegeName, branch, graduationYear) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 
        'Content-Type': 'application/json',
        'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      body: JSON.stringify({ name, email, password, collegeName, branch, graduationYear }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    setAccessToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setPlan(data.user?.plan || 'free');
    return data;
  };

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 
        'Content-Type': 'application/json',
        'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    setAccessToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setPlan(data.user?.plan || 'free');
    return data;
  };

  // ── Google Login ────────────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    if (!firebaseReady || !auth || !googleProvider) {
      throw new Error(
        'Google login is not configured. Add Firebase credentials to frontend/.env'
      );
    }

    let result;
    try {
      result = await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in was cancelled. Please try again.');
      }
      throw err;
    }

    const idToken = await result.user.getIdToken();

    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      credentials: 'include',
      headers: { 
        'Content-Type': 'application/json',
        'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      body: JSON.stringify({ idToken }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Google authentication failed');

    setAccessToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setPlan(data.user?.plan || 'free');
    return data;
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch { /* best-effort */ }

    clearAccessToken();
    setToken('');
    setUser(null);
    setPlan('free');
    queryClient.clear();
    // Remove any legacy localStorage remnants
    localStorage.removeItem('token');
    localStorage.removeItem('user_cache');
    localStorage.removeItem('user_plan');
  };

  // ── Update XP ───────────────────────────────────────────────────────────────
  const updateXp = async (amount, badgeToEarn = null) => {
    try {
      const data = await apiPost('/auth/progress', { xpAmount: amount, badgeToEarn });
      if (data.user) {
        setUser(data.user);
      }
    } catch {
      // Local state update on API failure
      if (user) {
        const updatedUser = { ...user, xp: (user.xp || 0) + amount };
        if (badgeToEarn && !updatedUser.badges?.includes(badgeToEarn)) {
          updatedUser.badges = [...(updatedUser.badges || []), badgeToEarn];
        }
        setUser(updatedUser);
      }
    }
  };

  // ── Update Profile ──────────────────────────────────────────────────────────
  const updateProfile = async (profileData) => {
    const data = await apiPut('/auth/profile', profileData);
    if (data.user) {
      setUser(data.user);
    }
    return { success: true, user: data.user };
  };

  // ── Update user locally (e.g. after billing change) ─────────────────────────
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser?.plan) setPlan(updatedUser.plan);
  };

  // ── Select Plan (local UI + backend sync) ────────────────────────────────────
  const selectPlan = async (newPlan) => {
    const validPlans = ['free', 'pro', 'teams'];
    if (!validPlans.includes(newPlan)) return;

    setPlan(newPlan);
    try {
      const data = await apiPost('/auth/plan', { plan: newPlan });
      if (data.user) setUser(data.user);
    } catch (e) {
      console.warn('[selectPlan] Backend sync failed:', e.message);
    }
  };

  const toggleTheme       = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const setAccessibilitySize = (percent) => setFontSize(percent);

  // Expose token as boolean for components that just need isLoggedIn
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading: initializing,
      isAuthenticated,
      register,
      login,
      loginWithGoogle,
      firebaseReady,
      logout,
      updateXp,
      updateProfile,
      updateUser,
      theme,
      toggleTheme,
      fontSize,
      setAccessibilitySize,
      plan,
      selectPlan,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
