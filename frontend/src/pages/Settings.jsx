import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Settings as SettingsIcon, Bell, Shield, CreditCard, Globe, Sparkles,
  Download, Trash2, RefreshCw, AlertTriangle, HelpCircle, X, Check, ChevronRight,
  Sun, Moon, Laptop
} from 'lucide-react';

export default function Settings() {
  const { user, theme, toggleTheme } = useAuth();

  // Active Tab state
  const [activeTab, setActiveTab] = useState("Profile");

  // Profile fields state
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.name || "Yash");
  const [email, setEmail] = useState("yash@example.com");
  const [currentRole, setCurrentRole] = useState("Aspiring Software Engineer");
  const [location, setLocation] = useState("India");
  const [bio, setBio] = useState("Passionate about building scalable software systems and solving real-world problems.");
  const [avatar] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuDkk8MSliztEbyiWDYjWyw6UR676FK-DOlY8rjvSUujThHBpWrbXsIY95occ9ViaX1fLhqvNtkDpaput_bOgeZZw6BM0WFHnVxr4742vecAXnDw5DFkbj0Ul3fgKzHovyznyxj8DiWXgjBhGaDvPHE3SxmNZkzEtuylz4tfY35rWoAdXfkY6qcK_ridFgzez69Z9CQ-1xGIXcs9RoijKeKtoFk5XyRCktjk4yxinL65oJIbdMURqTQzqeJ_OYVTtEQtcFtqfI05YPJ7");

  // Preferences fields state
  const [language, setLanguage] = useState("English");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [dashboard, setDashboard] = useState("Dashboard Overview");
  const [personalization, setPersonalization] = useState(true);

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [supportAlerts, setSupportAlerts] = useState(false);

  // Account settings
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Modals state
  const [toastMessage, setToastMessage] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpQuestion, setHelpQuestion] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Export Data Action
  const handleExportData = () => {
    const dataObj = {
      user: { name: fullName, email, role: currentRole, location, bio },
      preferences: { theme, language, difficulty, defaultDashboard: dashboard, personalization },
      notifications: { emailAlerts, streakReminders, supportAlerts },
      exportedAt: new Date().toISOString(),
      platform: "Interview AI - Career Operating System"
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataObj, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `interview_ai_data_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowExportModal(false);
    triggerToast("JSON backup data exported successfully!");
  };

  // 2. Clear Activity Action
  const handleClearActivity = () => {
    setShowClearModal(false);
    triggerToast("All interview logs and active histories cleared!");
  };

  // 3. Reset Progress Action
  const handleResetProgress = () => {
    setShowResetModal(false);
    triggerToast("Your progress metrics and streak counters have been reset.");
  };

  // 4. Delete Account Action
  const handleDeleteAccount = (e) => {
    e.preventDefault();
    if (deleteConfirmText.toUpperCase() === "DELETE") {
      setShowDeleteModal(false);
      setDeleteConfirmText("");
      triggerToast("Account deletion request submitted.");
    }
  };

  // 5. Submit Support Ticket Action
  const handleHelpSubmit = (e) => {
    e.preventDefault();
    if (helpQuestion.trim()) {
      setShowHelpModal(false);
      setHelpQuestion("");
      triggerToast("Your support ticket has been logged successfully!");
    }
  };

  // Sync profile editing saves
  const handleProfileSave = () => {
    setIsEditing(false);
    triggerToast("Profile information updated successfully.");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pt-4 text-[#e2e8f0]">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-app-card border border-app-primary text-white shadow-2xl transition-all animate-bounce">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Page Title & Tabs */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
        <p className="text-app-textMuted text-sm mb-6">Manage your account, preferences, and application settings.</p>
        <div className="border-b border-[#2A2E3D] flex space-x-6 overflow-x-auto no-scrollbar">
          {[
            { id: "Profile", icon: User },
            { id: "Preferences", icon: SettingsIcon },
            { id: "Notifications", icon: Bell },
            { id: "Account", icon: Shield },
            { id: "Subscription", icon: CreditCard },
            { id: "Privacy & Security", icon: Globe },
            { id: "Billing", icon: CreditCard }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-1 py-3 text-sm font-medium border-b-2 transition-all shrink-0 flex items-center gap-2 ${
                  isSelected 
                    ? 'text-white border-[#6366F1] font-semibold' 
                    : 'text-[#94A3B8] border-transparent hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Forms & Tab panels) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Information Panel */}
          {(activeTab === "Profile") && (
            <div className="bg-[#1A1D27] border border-[#2A2E3D] rounded-xl p-6 shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#131620] border border-[#2A2E3D] flex items-center justify-center text-[#6366F1]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Profile Information</h3>
                    <p className="text-xs text-[#94A3B8]">Update your personal information and how others see you.</p>
                  </div>
                </div>
                
                {isEditing ? (
                  <button 
                    onClick={handleProfileSave}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-90 rounded-md transition-colors flex items-center space-x-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 text-xs font-medium text-white border border-[#2A2E3D] rounded-md hover:bg-white/5 transition-colors flex items-center space-x-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                    <span>Edit</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar Upload */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6]">
                      <img alt="User Avatar" className="w-full h-full rounded-full border-2 border-[#1A1D27] object-cover" src={avatar} />
                    </div>
                    <button 
                      onClick={() => triggerToast("Avatar file selection dialog simulated.")}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-[#1A1D27] border border-[#2A2E3D] rounded-full flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Info Fields Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <div>
                    <span className="block text-xs text-[#94A3B8] mb-1">Full Name</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-[#131620] border border-[#2A2E3D] text-white rounded-lg p-2 focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1]"
                      />
                    ) : (
                      <span className="text-sm text-white font-medium">{fullName}</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs text-[#94A3B8] mb-1">Email Address</span>
                    {isEditing ? (
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#131620] border border-[#2A2E3D] text-white rounded-lg p-2 focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1]"
                      />
                    ) : (
                      <span className="text-sm text-white font-medium">{email}</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs text-[#94A3B8] mb-1">Current Role</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                        className="w-full bg-[#131620] border border-[#2A2E3D] text-white rounded-lg p-2 focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1]"
                      />
                    ) : (
                      <span className="text-sm text-white font-medium">{currentRole}</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs text-[#94A3B8] mb-1">Location</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-[#131620] border border-[#2A2E3D] text-white rounded-lg p-2 focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1]"
                      />
                    ) : (
                      <span className="text-sm text-white font-medium">{location}</span>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <span className="block text-xs text-[#94A3B8] mb-1">Bio</span>
                    {isEditing ? (
                      <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows="3"
                        className="w-full bg-[#131620] border border-[#2A2E3D] text-white rounded-lg p-2 focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1]"
                      />
                    ) : (
                      <p className="text-sm text-white font-medium leading-relaxed max-w-xl">{bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Card Panel (Visible inside Profile Tab as secondary OR standalone in Preferences Tab) */}
          {(activeTab === "Profile" || activeTab === "Preferences") && (
            <div className="bg-[#1A1D27] border border-[#2A2E3D] rounded-xl p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#131620] border border-[#2A2E3D] flex items-center justify-center text-[#8B5CF6]">
                  <SettingsIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Preferences</h3>
                  <p className="text-xs text-[#94A3B8]">Customize your learning experience.</p>
                </div>
              </div>

              <div className="space-y-6 divide-y divide-[#2A2E3D]">
                
                {/* Theme Selector */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-sm font-medium text-white mb-0.5">Theme</p>
                    <p className="text-xs text-[#94A3B8]">Choose your preferred theme</p>
                  </div>
                  <div className="flex bg-[#131620] border border-[#2A2E3D] rounded-lg p-1">
                    <button 
                      onClick={() => { if (theme === 'dark') toggleTheme(); }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                        theme === 'light' ? 'bg-[#1A1D27] text-white border border-[#2A2E3D]' : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <Sun className="w-4 h-4 text-[#6366F1]" />
                      <span>Light</span>
                    </button>
                    <button 
                      onClick={() => { if (theme === 'light') toggleTheme(); }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                        theme === 'dark' ? 'bg-[#1A1D27] text-white border border-[#2A2E3D]' : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <Moon className="w-4 h-4 text-[#6366F1]" />
                      <span>Dark</span>
                    </button>
                    <button 
                      onClick={() => triggerToast("System default theme selection active.")}
                      className="px-3 py-1.5 rounded-md text-xs font-medium text-[#94A3B8] hover:text-white transition-colors flex items-center space-x-1.5"
                    >
                      <Laptop className="w-4 h-4" />
                      <span>System</span>
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div className="flex items-center justify-between pt-6">
                  <div>
                    <p className="text-sm font-medium text-white mb-0.5">Language</p>
                    <p className="text-xs text-[#94A3B8]">Select your preferred language</p>
                  </div>
                  <select 
                    value={language}
                    onChange={(e) => { setLanguage(e.target.value); triggerToast(`Language updated to ${e.target.value}`); }}
                    className="bg-[#131620] border border-[#2A2E3D] text-sm text-white rounded-lg focus:ring-[#6366F1] focus:border-[#6366F1] block w-48 p-2.5"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="flex items-center justify-between pt-6">
                  <div>
                    <p className="text-sm font-medium text-white mb-0.5">Difficulty Level</p>
                    <p className="text-xs text-[#94A3B8]">Set default difficulty for mock tests</p>
                  </div>
                  <select 
                    value={difficulty}
                    onChange={(e) => { setDifficulty(e.target.value); triggerToast(`Difficulty set to ${e.target.value}`); }}
                    className="bg-[#131620] border border-[#2A2E3D] text-sm text-white rounded-lg focus:ring-[#6366F1] focus:border-[#6366F1] block w-48 p-2.5"
                  >
                    <option>Intermediate</option>
                    <option>Beginner</option>
                    <option>Advanced</option>
                  </select>
                </div>

                {/* Default Dashboard */}
                <div className="flex items-center justify-between pt-6">
                  <div>
                    <p className="text-sm font-medium text-white mb-0.5">Default Dashboard</p>
                    <p className="text-xs text-[#94A3B8]">Choose what you see on login</p>
                  </div>
                  <select 
                    value={dashboard}
                    onChange={(e) => { setDashboard(e.target.value); triggerToast(`Default Dashboard updated to ${e.target.value}`); }}
                    className="bg-[#131620] border border-[#2A2E3D] text-sm text-white rounded-lg focus:ring-[#6366F1] focus:border-[#6366F1] block w-48 p-2.5"
                  >
                    <option>Dashboard Overview</option>
                    <option>Mock Tests</option>
                    <option>Analytics</option>
                  </select>
                </div>

                {/* Data & Personalization */}
                <div className="flex items-center justify-between pt-6">
                  <div>
                    <p className="text-sm font-medium text-white mb-0.5">Data & Personalization</p>
                    <p className="text-xs text-[#94A3B8]">Allow us to personalize your experience</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={personalization}
                      onChange={(e) => { setPersonalization(e.target.checked); triggerToast(`Personalization toggled ${e.target.checked ? "ON" : "OFF"}`); }}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[#131620] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6366F1]"></div>
                  </label>
                </div>

              </div>
            </div>
          )}

          {/* Notifications Panel */}
          {(activeTab === "Notifications") && (
            <div className="bg-[#1A1D27] border border-[#2A2E3D] rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#131620] border border-[#2A2E3D] flex items-center justify-center text-indigo-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Notification Settings</h3>
                  <p className="text-xs text-[#94A3B8]">Manage your alerts, reminders, and summaries.</p>
                </div>
              </div>

              <div className="space-y-6 divide-y divide-[#2A2E3D]">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">Email Notifications</p>
                    <p className="text-xs text-[#94A3B8]">Receive weekly summary scorecard analytics in your inbox</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#131620] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6366F1]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-6">
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">Daily Streak Reminders</p>
                    <p className="text-xs text-[#94A3B8]">Get reminded to log in and preserve your day streak</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={streakReminders} onChange={(e) => setStreakReminders(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#131620] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6366F1]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-6">
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">Priority Support Alert</p>
                    <p className="text-xs text-[#94A3B8]">Notify immediately on support updates (Premium option)</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={supportAlerts} onChange={(e) => setSupportAlerts(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#131620] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6366F1]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Account Panel */}
          {(activeTab === "Account") && (
            <div className="bg-[#1A1D27] border border-[#2A2E3D] rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#131620] border border-[#2A2E3D] flex items-center justify-center text-teal-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Account Credentials</h3>
                  <p className="text-xs text-[#94A3B8]">Change password and secure your platform login.</p>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); triggerToast("Password updated successfully."); setPassword(""); setConfirmPassword(""); }} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium">New Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#131620] border border-[#2A2E3D] text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1] placeholder-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#131620] border border-[#2A2E3D] text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1] placeholder-gray-600"
                  />
                </div>
                <button type="submit" className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-medium py-2 px-5 rounded-lg text-xs hover:opacity-95 transition-all shadow-md">
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* Subscription Panel */}
          {(activeTab === "Subscription") && (
            <div className="bg-[#1A1D27] border border-[#2A2E3D] rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#131620] border border-[#2A2E3D] flex items-center justify-center text-purple-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Subscription Management</h3>
                  <p className="text-xs text-[#94A3B8]">Review details, tier plans, and premium features.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-[#2A2E3D] rounded-xl p-5 bg-[#131620] flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mb-1">Standard tier</span>
                    <h4 className="text-lg font-bold text-white mb-2">Free Plan</h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">Includes 3 mock interviews per month, basic scorecard, and generic roadmaps.</p>
                  </div>
                  <div className="text-xs text-indigo-400 font-bold mt-4">Current Active Tier</div>
                </div>

                <div className="border border-purple-500/30 rounded-xl p-5 bg-gradient-to-br from-[#1e1b4b] to-[#120b29] flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-white/5 font-extrabold text-3xl select-none">PRO</div>
                  <div>
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-1">RECOMMENDED</span>
                    <h4 className="text-lg font-bold text-white mb-2">Pro Tier ($29/mo)</h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">Includes unlimited interviews, custom DP checklists, real-time code executions, and priority help desk.</p>
                  </div>
                  <button 
                    onClick={() => setShowUpgradeModal(true)}
                    className="mt-4 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1 hover:opacity-90 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                  >
                    <span>Upgrade Now</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Security Panel */}
          {(activeTab === "Privacy & Security") && (
            <div className="bg-[#1A1D27] border border-[#2A2E3D] rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#131620] border border-[#2A2E3D] flex items-center justify-center text-cyan-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Privacy & Security</h3>
                  <p className="text-xs text-[#94A3B8]">Manage authorization logs, tokens, and data privacy.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-[#2A2E3D] rounded-xl p-4 bg-[#131620] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Two-Factor Authentication</h4>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Secure your placement login with Google Authenticator.</p>
                  </div>
                  <button onClick={() => triggerToast("2FA setup prompt simulated.")} className="border border-[#2A2E3D] text-xs font-semibold px-4 py-2 rounded-lg hover:bg-white/5 text-white">
                    Configure
                  </button>
                </div>

                <div className="border border-[#2A2E3D] rounded-xl p-4 bg-[#131620] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Active Sessions</h4>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Currently logged in from India (Vite Developer Shell).</p>
                  </div>
                  <button onClick={() => triggerToast("All other active sessions revoked.")} className="border border-[#2A2E3D] text-xs font-semibold px-4 py-2 rounded-lg hover:bg-white/5 text-rose-400 hover:text-rose-300">
                    Log out others
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Billing Panel */}
          {(activeTab === "Billing") && (
            <div className="bg-[#1A1D27] border border-[#2A2E3D] rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#131620] border border-[#2A2E3D] flex items-center justify-center text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Payment & Billing</h3>
                  <p className="text-xs text-[#94A3B8]">Manage your payment cards, invoice cycles, and billing histories.</p>
                </div>
              </div>

              <div className="border border-[#2A2E3D] rounded-xl p-4 bg-[#131620] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-app-card rounded border border-white/5 flex items-center justify-center font-bold text-[10px] text-white">VISA</div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Visa ending in 4242</h4>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Expires 12/28 • Default Payment Method</p>
                  </div>
                </div>
                <button onClick={() => triggerToast("Edit payment method simulated.")} className="text-xs font-semibold hover:underline text-[#6366F1]">
                  Edit
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Invoice History</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-400">
                    <thead className="bg-[#131620] text-white uppercase font-bold text-[9px] border-b border-[#2A2E3D]">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Invoice Number</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2E3D]/50">
                      <tr>
                        <td className="px-4 py-3">June 12, 2026</td>
                        <td className="px-4 py-3">#INV-2026-0032</td>
                        <td className="px-4 py-3 font-semibold">$0.00</td>
                        <td className="px-4 py-3 text-right text-emerald-400 font-semibold">PAID</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">May 12, 2026</td>
                        <td className="px-4 py-3">#INV-2026-0015</td>
                        <td className="px-4 py-3 font-semibold">$0.00</td>
                        <td className="px-4 py-3 text-right text-emerald-400 font-semibold">PAID</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (Status, Actions, Help) */}
        <div className="space-y-6">
          
          {/* Account Status Card */}
          <div className="bg-[#1A1D27] border border-[#2A2E3D] rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#131620] border border-[#2A2E3D] flex items-center justify-center text-cyan-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Account Status</h3>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-lg p-5 mb-6 flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-300 mb-1">Current Plan</p>
                <p className="text-xl font-bold text-white">Free Plan</p>
              </div>
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="bg-gradient-to-r from-[#6366F1] to-[#3B82F6] text-white text-xs font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              >
                Upgrade
              </button>
            </div>

            <ul className="space-y-4 text-sm">
              <li className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-[#94A3B8]">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>AI Roadmaps</span>
                </div>
                <span className="text-white font-mono text-xs">3 / 5</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-[#94A3B8]">
                  <SettingsIcon className="w-4 h-4 text-emerald-400" />
                  <span>Resume Analyses</span>
                </div>
                <span className="text-white font-mono text-xs">2 / 5</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-[#94A3B8]">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Mock Tests</span>
                </div>
                <span className="text-white font-mono text-xs">2 / 5</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-[#94A3B8]">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>AI Chat Messages</span>
                </div>
                <span className="text-white font-mono text-xs">10 / 20</span>
              </li>
              <li className="flex items-center justify-between opacity-50">
                <div className="flex items-center space-x-3 text-[#94A3B8]">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                  <span>Priority Support</span>
                </div>
                <span className="text-[#94A3B8] font-mono text-xs">×</span>
              </li>
            </ul>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-[#1A1D27] border border-[#2A2E3D] rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#131620] border border-[#2A2E3D] flex items-center justify-center text-purple-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Quick Actions</h3>
              </div>
            </div>

            <div className="divide-y divide-[#2A2E3D]">
              
              {/* Export My Data */}
              <button 
                onClick={() => setShowExportModal(true)}
                className="w-full flex items-center justify-between py-4 group text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-[#131620] flex items-center justify-center text-[#94A3B8] group-hover:text-white transition-colors">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Export My Data</p>
                    <p className="text-xs text-[#94A3B8]">Download your data and insights</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-white transition-colors" />
              </button>

              {/* Clear Activity */}
              <button 
                onClick={() => setShowClearModal(true)}
                className="w-full flex items-center justify-between py-4 group text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-[#131620] flex items-center justify-center text-[#94A3B8] group-hover:text-white transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Clear Activity</p>
                    <p className="text-xs text-[#94A3B8]">Remove all your activity data</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-white transition-colors" />
              </button>

              {/* Reset Progress */}
              <button 
                onClick={() => setShowResetModal(true)}
                className="w-full flex items-center justify-between py-4 group text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-[#131620] flex items-center justify-center text-[#94A3B8] group-hover:text-white transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Reset Progress</p>
                    <p className="text-xs text-[#94A3B8]">This will reset all your learning progress</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-white transition-colors" />
              </button>

              {/* Delete Account */}
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-between pt-4 group text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-500">Delete Account</p>
                    <p className="text-xs text-red-400/70">Permanently delete your account</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-red-500" />
              </button>

            </div>
          </div>

          {/* Need Help Card */}
          <div className="bg-[#1A1D27] border border-[#2A2E3D] rounded-xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>
            <div className="flex items-center space-x-3 mb-3 relative z-10">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white">Need Help?</h3>
            </div>
            <p className="text-xs text-[#94A3B8] mb-5 relative z-10 leading-relaxed">Visit our help center or contact support for any assistance.</p>
            <button 
              onClick={() => setShowHelpModal(true)}
              className="w-full bg-gradient-to-r from-[#6366F1] to-cyan-500 text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity relative z-10 shadow-lg"
            >
              <span>Visit Help Center</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between py-6 mt-8 border-t border-[#2A2E3D] text-[#94A3B8]">
        <p className="text-xs">© 2026 Interview AI. All rights reserved.</p>
        <div className="flex space-x-4 text-xs mt-2 sm:mt-0">
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); triggerToast("Terms of Service simulation active."); }}>Terms of Service</a>
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); triggerToast("Privacy Policy simulation active."); }}>Privacy Policy</a>
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); triggerToast("Contact parameters active."); }}>Contact Us</a>
        </div>
      </footer>

      {/* --- MODAL DIALOGS --- */}

      {/* 1. Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1A1D27] border border-[#2A2E3D] w-full max-w-md rounded-2xl p-6 relative shadow-2xl space-y-4">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Upgrade to Pro Account</h3>
              <p className="text-xs text-[#94A3B8]">Unlock unlimited mock evaluations, advanced analytics roadmaps, and priority human support.</p>
            </div>
            <div className="bg-[#131620] border border-[#2A2E3D] rounded-xl p-4 flex justify-between items-center text-sm font-semibold">
              <span>Pro Plan Membership</span>
              <span className="text-white">$29 / month</span>
            </div>
            <button 
              onClick={() => { setShowUpgradeModal(false); triggerToast("Mock payment processed! Account upgraded to Pro."); }}
              className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-semibold py-2.5 rounded-lg text-sm shadow-[0_0_15px_rgba(139,92,246,0.4)]"
            >
              Process Payment ($29.00)
            </button>
          </div>
        </div>
      )}

      {/* 2. Export Data Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1A1D27] border border-[#2A2E3D] w-full max-w-md rounded-2xl p-6 relative shadow-2xl space-y-4">
            <button onClick={() => setShowExportModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto text-blue-400">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Export Profile Data</h3>
              <p className="text-xs text-[#94A3B8]">Export your saved bio and preference values in an offline JSON backup.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowExportModal(false)} className="flex-1 border border-[#2A2E3D] text-slate-300 hover:bg-white/5 py-2.5 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleExportData} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium">Confirm Export</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Clear Activity Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1A1D27] border border-[#2A2E3D] w-full max-w-md rounded-2xl p-6 relative shadow-2xl space-y-4">
            <button onClick={() => setShowClearModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Clear All Activity Logs?</h3>
              <p className="text-xs text-[#94A3B8]">This action permanently removes all past mock transcripts and recording analytics from the UI.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowClearModal(false)} className="flex-1 border border-[#2A2E3D] text-slate-300 hover:bg-white/5 py-2.5 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleClearActivity} className="flex-1 bg-red-650 hover:bg-red-550 text-white py-2.5 rounded-lg text-sm font-medium">Clear History</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Reset Progress Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1A1D27] border border-[#2A2E3D] w-full max-w-md rounded-2xl p-6 relative shadow-2xl space-y-4">
            <button onClick={() => setShowResetModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto text-yellow-500">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Reset Learning Progress?</h3>
              <p className="text-xs text-[#94A3B8]">This will reset your mock test marks, analytics charts, and daily streaks to zero.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowResetModal(false)} className="flex-1 border border-[#2A2E3D] text-slate-300 hover:bg-white/5 py-2.5 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleResetProgress} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-2.5 rounded-lg text-sm font-medium">Reset Data</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1A1D27] border border-[#2A2E3D] w-full max-w-md rounded-2xl p-6 relative shadow-2xl space-y-4">
            <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Permanently Delete Account?</h3>
              <p className="text-xs text-[#94A3B8]">This cannot be undone. Type <span className="font-bold text-red-550">DELETE</span> below to confirm your request.</p>
            </div>
            <form onSubmit={handleDeleteAccount} className="space-y-4 pt-2">
              <input 
                type="text" 
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                required
                placeholder="DELETE"
                className="w-full bg-[#131620] border border-[#2A2E3D] text-white rounded-lg p-2.5 text-center text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 font-bold tracking-widest placeholder-slate-700"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 border border-[#2A2E3D] text-slate-300 hover:bg-white/5 py-2.5 rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit" disabled={deleteConfirmText.toUpperCase() !== "DELETE"} className="flex-1 bg-red-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium">Delete Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Help Desk Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1A1D27] border border-[#2A2E3D] w-full max-w-md rounded-2xl p-6 relative shadow-2xl space-y-4">
            <button onClick={() => setShowHelpModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto text-cyan-400">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Interview AI Support Desk</h3>
              <p className="text-xs text-[#94A3B8]">Describe your question or layout bugs below, and our team will get back to you.</p>
            </div>
            <form onSubmit={handleHelpSubmit} className="space-y-4 pt-2">
              <textarea 
                value={helpQuestion}
                onChange={(e) => setHelpQuestion(e.target.value)}
                required
                rows="3"
                placeholder="Ask about mock tests limits, roadmaps, or billing cycles..."
                className="w-full bg-[#131620] border border-[#2A2E3D] text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1] placeholder-slate-700"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowHelpModal(false)} className="flex-1 border border-[#2A2E3D] text-slate-300 hover:bg-white/5 py-2.5 rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 rounded-lg text-sm font-medium">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
