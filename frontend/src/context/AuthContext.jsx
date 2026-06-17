import { createContext, useState, useEffect, useContext } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, hasConfig as firebaseReady } from '../firebase';
import { API_BASE } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('font-size')) || 100);
  const [plan, setPlan] = useState(localStorage.getItem('user_plan') || 'free');

  // Initialize and verify session on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await fetch(`${API_BASE}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setToken(storedToken);
            if (data.user && data.user.plan) {
              setPlan(data.user.plan);
              localStorage.setItem('user_plan', data.user.plan);
            }
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (e) {
          console.error("Initial auth check failed, using offline fallback:", e.message);
          // Offline Fallback Session mock if server is booting
          const cachedUser = localStorage.getItem('user_cache');
          if (cachedUser) {
            setUser(JSON.parse(cachedUser));
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // Sync theme to root HTML element for Tailwind dark classes
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync font size accessibility scaling to HTML root element
  useEffect(() => {
    const root = window.document.documentElement;
    root.style.fontSize = `${fontSize}%`;
    localStorage.setItem('font-size', fontSize);
  }, [fontSize]);

  const register = async (name, email, password, collegeName, branch, graduationYear) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, collegeName, branch, graduationYear })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user_cache', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      if (data.user && data.user.plan) {
        setPlan(data.user.plan);
        localStorage.setItem('user_plan', data.user.plan);
      }
      return data;
    } catch (err) {
      console.warn("Register server call failed, using mock local register:", err.message);
      // Offline fallback: Create mock local user
      const mockUser = {
        id: 'usr_mock_' + Date.now(),
        name,
        email,
        collegeName,
        branch,
        graduationYear,
        xp: 100,
        streak: 1,
        badges: ["Novice Prep"],
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('token', 'mock_jwt_token');
      localStorage.setItem('user_cache', JSON.stringify(mockUser));
      setToken('mock_jwt_token');
      setUser(mockUser);
      return { user: mockUser };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user_cache', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      if (data.user && data.user.plan) {
        setPlan(data.user.plan);
        localStorage.setItem('user_plan', data.user.plan);
      }
      return data;
    } catch (err) {
      console.warn("Login server call failed, checking cached local registration:", err.message);
      // Offline fallback check
      const cached = localStorage.getItem('user_cache');
      if (cached) {
        const cachedUser = JSON.parse(cached);
        if (cachedUser.email === email) {
          localStorage.setItem('token', 'mock_jwt_token');
          setToken('mock_jwt_token');
          setUser(cachedUser);
          return { user: cachedUser };
        }
      }
      throw new Error("Invalid email or password (or server is offline)", { cause: err });
    }
  };

  const loginWithGoogle = async () => {
    if (!firebaseReady || !auth || !googleProvider) {
      throw new Error(
        'Google login is not configured yet. Please add your Firebase credentials to frontend/.env — see frontend/.env.example for instructions.'
      );
    }

    try {
      // Open Google sign-in popup
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Get the Firebase ID token to send to our backend for verification
      const idToken = await firebaseUser.getIdToken();

      // Exchange Firebase ID token for our app's JWT
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google authentication failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user_cache', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      if (data.user && data.user.plan) {
        setPlan(data.user.plan);
        localStorage.setItem('user_plan', data.user.plan);
      }
      return data;
    } catch (err) {
      // Don't swallow popup-closed-by-user errors silently
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in was cancelled. Please try again.');
      }
      throw err;
    }
  };

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_cache');
    localStorage.removeItem('user_plan');
    setToken('');
    setUser(null);
    setPlan('free');
  }

  const updateXp = async (amount, badgeToEarn = null) => {
    try {
      const res = await fetch(`${API_BASE}/auth/progress`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ xpAmount: amount, badgeToEarn })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('user_cache', JSON.stringify(data.user));
      }
    } catch {
      // Local offline state update
      if (user) {
        const updatedUser = { ...user };
        updatedUser.xp = (updatedUser.xp || 0) + amount;
        if (badgeToEarn && !updatedUser.badges.includes(badgeToEarn)) {
          updatedUser.badges.push(badgeToEarn);
        }
        setUser(updatedUser);
        localStorage.setItem('user_cache', JSON.stringify(updatedUser));
      }
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setAccessibilitySize = (percent) => {
    setFontSize(percent);
  };

  const selectPlan = async (newPlan) => {
    const validPlans = ['free', 'pro', 'teams'];
    if (validPlans.includes(newPlan)) {
      setPlan(newPlan);
      localStorage.setItem('user_plan', newPlan);
      // Update cached user plan
      const cached = localStorage.getItem('user_cache');
      if (cached) {
        const u = JSON.parse(cached);
        u.plan = newPlan;
        localStorage.setItem('user_cache', JSON.stringify(u));
      }

      // Sync user plan to backend if token is available
      const storedToken = localStorage.getItem('token') || token;
      if (storedToken) {
        try {
          const res = await fetch(`${API_BASE}/auth/plan`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${storedToken}`
            },
            body: JSON.stringify({ plan: newPlan })
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            localStorage.setItem('user_cache', JSON.stringify(data.user));
          }
        } catch (e) {
          console.warn("Failed to sync plan switch with backend database:", e.message);
        }
      }
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('user_cache', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || 'Profile update failed');
      }
    } catch (err) {
      // Offline fallback: update locally
      console.warn("Profile update API failed, updating locally:", err.message);
      if (user) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem('user_cache', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser, offline: true };
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, loginWithGoogle, firebaseReady, logout, updateXp, updateProfile, theme, toggleTheme, fontSize, setAccessibilitySize, plan, selectPlan }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
