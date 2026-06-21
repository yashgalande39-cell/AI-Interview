import { useEffect, useState } from 'react';
import { Bell, X, Check, Award, Flame, Mic, ShieldAlert, Sparkles } from 'lucide-react';
import { API_BASE } from '../config';

export default function NotificationPanel({ isOpen, onClose, token, user }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Generate notifications dynamically from user and interview history
    const generateNotifications = async () => {
      const list = [
        {
          id: 'welcome',
          title: 'Welcome to InterviewAI!',
          desc: 'Get started by checking the Dashboard and uploading your resume.',
          time: 'Just now',
          read: false,
          icon: <Sparkles className="w-4 h-4 text-indigo-400" />
        }
      ];

      // Add streak notification if applicable
      if (user.streak > 1) {
        list.push({
          id: 'streak',
          title: 'Streak Active! 🔥',
          desc: `You are on a ${user.streak}-day practice streak. Keep it going!`,
          time: '1h ago',
          read: false,
          icon: <Flame className="w-4 h-4 text-amber-500" />
        });
      }

      // Add badge notifications
      if (user.badges && user.badges.length > 0) {
        user.badges.forEach((badge, idx) => {
          list.push({
            id: `badge_${idx}`,
            title: 'Badge Unlocked!',
            desc: `Congratulations! You unlocked the "${badge}" badge.`,
            time: '1d ago',
            read: true,
            icon: <Award className="w-4 h-4 text-yellow-500" />
          });
        });
      }

      // Fetch history for interview notifications
      try {
        const res = await fetch(`${API_BASE}/interviews/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const history = data.history || [];
          history.slice(0, 3).forEach((interview, idx) => {
            if (interview.status === 'completed') {
              const score = interview.scoreCard?.overallScore || 70;
              list.push({
                id: `interview_${interview.id || idx}`,
                title: 'Interview Evaluated',
                desc: `Completed ${interview.type} interview for ${interview.role} with a score of ${score}%.`,
                time: 'Recently',
                read: true,
                icon: <Mic className="w-4 h-4 text-emerald-400" />
              });
            }
          });
        }
      } catch (err) {
        console.warn('Could not fetch notifications history:', err.message);
      }

      // Load read status from localStorage
      const readIds = JSON.parse(localStorage.getItem('read_notifications') || '[]');
      const updatedList = list.map(n => ({
        ...n,
        read: readIds.includes(n.id) ? true : n.read
      }));

      setNotifications(updatedList);
    };

    generateNotifications();
  }, [token, user]);

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    localStorage.setItem('read_notifications', JSON.stringify(allIds));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    const readIds = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem('read_notifications', JSON.stringify(readIds));
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-14 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200"
      style={{
        background: 'rgba(10, 15, 30, 0.98)',
        backdropFilter: 'blur(20px)',
      }}>
      
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-white text-sm">Activity Notifications</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={markAllRead} 
            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
          >
            <Check className="w-3 h-3" /> Mark all read
          </button>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No recent activity alerts.
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => markAsRead(n.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                n.read 
                  ? 'bg-white/[0.01] border-slate-900/40 text-slate-400' 
                  : 'bg-white/[0.04] border-slate-800/80 text-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs font-bold leading-tight ${n.read ? 'text-slate-405' : 'text-white'}`}>{n.title}</p>
                  <span className="text-[9px] text-slate-600 font-medium whitespace-nowrap">{n.time}</span>
                </div>
                <p className="text-[11px] mt-1 leading-normal text-slate-400">{n.desc}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
