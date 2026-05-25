import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

const API_BASE = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('font-size')) || 100);

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
      throw new Error("Invalid email or password (or server is offline)");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_cache');
    setToken('');
    setUser(null);
  };

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
    } catch (err) {
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

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, updateXp, theme, toggleTheme, fontSize, setAccessibilitySize }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
