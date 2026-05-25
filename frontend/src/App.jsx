import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InterviewLobby from './pages/InterviewLobby';
import InterviewRoom from './pages/InterviewRoom';
import CodingEditor from './pages/CodingEditor';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import GroupDiscussion from './pages/GroupDiscussion';
import AptitudeEngine from './pages/AptitudeEngine';
import CareerRoadmap from './pages/CareerRoadmap';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';
import FeedbackAnalysis from './pages/FeedbackAnalysis';
import Whiteboard from './pages/Whiteboard';


// Route guards
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? children : <Navigate to="/login" replace />;
};

// Global Layout wrapper
const AppLayout = ({ children }) => {
  const { token } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-darkBg text-slate-100 transition-all duration-300">
      <Navbar />
      <div className="flex flex-1 relative">
        {token && <Sidebar />}
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Landing & Auth pages */}
          <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />
          <Route path="/login" element={<AppLayout><Login /></AppLayout>} />
          <Route path="/register" element={<AppLayout><Register /></AppLayout>} />

          {/* Secure Protected Workspace Sprints */}
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/lobby" element={<ProtectedRoute><AppLayout><InterviewLobby /></AppLayout></ProtectedRoute>} />
          <Route path="/interview-room" element={<ProtectedRoute><AppLayout><InterviewRoom /></AppLayout></ProtectedRoute>} />
          <Route path="/coding" element={<ProtectedRoute><AppLayout><CodingEditor /></AppLayout></ProtectedRoute>} />
          <Route path="/resume" element={<ProtectedRoute><AppLayout><ResumeAnalyzer /></AppLayout></ProtectedRoute>} />
          <Route path="/gd" element={<ProtectedRoute><AppLayout><GroupDiscussion /></AppLayout></ProtectedRoute>} />
          <Route path="/aptitude" element={<ProtectedRoute><AppLayout><AptitudeEngine /></AppLayout></ProtectedRoute>} />
          <Route path="/roadmap" element={<ProtectedRoute><AppLayout><CareerRoadmap /></AppLayout></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><AppLayout><Leaderboard /></AppLayout></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AppLayout><AdminPanel /></AppLayout></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><AppLayout><FeedbackAnalysis /></AppLayout></ProtectedRoute>} />
          <Route path="/whiteboard" element={<ProtectedRoute><AppLayout><Whiteboard /></AppLayout></ProtectedRoute>} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
