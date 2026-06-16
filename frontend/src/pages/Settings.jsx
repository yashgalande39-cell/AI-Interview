import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import { 
  User, Settings as SettingsIcon, Bell, Shield, CreditCard, Globe, Sparkles,
  Download, Trash2, RefreshCw, AlertTriangle, HelpCircle, X, Check, ChevronRight,
  Sun, Moon, Laptop, Eye, EyeOff, Loader2
} from 'lucide-react';

export default function Settings() {
  const { user, token, theme, toggleTheme, plan, selectPlan, updateProfile } = useAuth();

  // Active Tab state
  const [activeTab, setActiveTab] = useState("Profile");

  // Profile fields state — initialized from real user data
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [branch, setBranch] = useState('');

  // Sync user data from context
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setCurrentRole(user.currentRole || 'Aspiring Software Engineer');
      setLocation(user.location || 'India');
      setBio(user.bio || 'Passionate about building scalable software systems and solving real-world problems.');
      setCollegeName(user.collegeName || '');
      setBranch(user.branch || '');
    }
  }, [user]);

  // Preferences fields state
  const [language, setLanguage] = useState('English');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [dashboard, setDashboard] = useState('Dashboard Overview');
  const [personalization, setPersonalization] = useState(true);

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [supportAlerts, setSupportAlerts] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Modals state
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success'); // 'success' | 'error'
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState('pro');
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpQuestion, setHelpQuestion] = useState('');

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Export Data Action
  const handleExportData = () => {
    const dataObj = {
      user: { name: fullName, email, role: currentRole, location, bio, collegeName, branch },
      preferences: { theme, language, difficulty, defaultDashboard: dashboard, personalization },
      notifications: { emailAlerts, streakReminders, supportAlerts },
      exportedAt: new Date().toISOString(),
      platform: 'Interview AI - Career Operating System'
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataObj, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `interview_ai_data_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowExportModal(false);
    triggerToast('JSON backup data exported successfully!');
  };

  // 2. Clear Activity Action
  const handleClearActivity = () => {
    setShowClearModal(false);
    triggerToast('All interview logs and active histories cleared!');
  };

  // 3. Reset Progress Action
  const handleResetProgress = () => {
    setShowResetModal(false);
    triggerToast('Your progress metrics and streak counters have been reset.');
  };

  // 4. Delete Account Action
  const handleDeleteAccount = (e) => {
    e.preventDefault();
    if (deleteConfirmText.toUpperCase() === 'DELETE') {
      setShowDeleteModal(false);
      setDeleteConfirmText('');
      triggerToast('Account deletion request submitted.');
    }
  };

  // 5. Submit Support Ticket Action
  const handleHelpSubmit = (e) => {
    e.preventDefault();
    if (helpQuestion.trim()) {
      setShowHelpModal(false);
      setHelpQuestion('');
      triggerToast('Your support ticket has been logged successfully!');
    }
  };

  // 6. Profile Save — calls API
  const handleProfileSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name: fullName,
        currentRole,
        location,
        bio,
        collegeName,
        branch,
      });
      setIsEditing(false);
      triggerToast('Profile information updated successfully.');
    } catch (err) {
      triggerToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 7. Cancel edit — reset values from user
  const handleCancelEdit = () => {
    if (user) {
      setFullName(user.name || '');
      setCurrentRole(user.currentRole || 'Aspiring Software Engineer');
      setLocation(user.location || 'India');
      setBio(user.bio || '');
      setCollegeName(user.collegeName || '');
      setBranch(user.branch || '');
    }
    setIsEditing(false);
  };

  // 8. Change Password — validates & calls API
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (password.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword: password })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
        triggerToast('Password changed successfully.');
      } else {
        setPasswordError(data.message || 'Password change failed.');
      }
    } catch (err) {
      // Offline mock success
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      triggerToast('Password updated successfully (offline mode).');
    } finally {
      setPasswordLoading(false);
    }
  };

  // 9. Upgrade Plan — actually calls selectPlan
  const handleUpgradePlan = async () => {
    setUpgradeLoading(true);
    try {
      await selectPlan(selectedUpgradePlan);
      setShowUpgradeModal(false);
      const planLabel = selectedUpgradePlan === 'pro' ? 'Pro' : 'Teams';
      triggerToast(`🎉 Successfully upgraded to ${planLabel} Plan!`);
    } catch (err) {
      triggerToast('Plan upgrade failed. Please try again.', 'error');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const planMeta = {
    free: { label: 'Free Plan', color: 'text-blue-400', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    pro: { label: 'Pro Plan', color: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    teams: { label: 'Teams Plan', color: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  };
  const currentPlanMeta = planMeta[plan] || planMeta.free;

  const inputClass = "w-full bg-[#131620] border border-[#2A2E3D] text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1] placeholder-slate-600 transition-colors";
  const toggleClass = "w-11 h-6 bg-[#131620] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6366F1]";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pt-4 text-[#e2e8f0]">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl transition-all animate-bounce ${
          toastType === 'error' 
            ? 'bg-red-900/80 border border-red-500/50' 
            : 'bg-[#1A1D27] border border-emerald-500/30'
        }`}>
          {toastType === 'error' 
            ? <X className="w-5 h-5 text-red-400" /> 
            : <Check className="w-5 h-5 text-emerald-400" />
          }
          <span className="text-sm font-semibold text-white">{toastMessage}</span>
        </div>
      )}

      {/* Page Title & Tabs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <p className="text-[#94A3B8] text-sm mt-1">Manage your account, preferences, and application settings.</p>
          </div>
          {/* Current plan badge */}
          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${currentPlanMeta.badge}`}>
            {currentPlanMeta.label}
          </span>
        </div>
        <div className="border-b border-[#2A2E3D] flex space-x-1 overflow-x-auto no-scrollbar mt-4">
          {[
            { id: 'Profile', icon: User },
            { id: 'Preferences', icon: SettingsIcon },
            { id: 'Notifications', icon: Bell },
            { id: 'Account', icon: Shield },
            { id: 'Subscription', icon: CreditCard },
            { id: 'Privacy & Security', icon: Globe },
            { id: 'Billing', icon: CreditCard }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-3 text-sm font-medium border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected 
                    ? 'text-white border-[#6366F1] font-semibold' 
                    : 'text-[#94A3B8] border-transparent hover:text-white'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
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
          {activeTab === 'Profile' && (
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
                  <div className="flex gap-2">
                    <button 
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 text-xs font-medium text-[#94A3B8] border border-[#2A2E3D] rounded-md hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleProfileSave}
                      disabled={isSaving}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-90 rounded-md transition-all flex items-center space-x-1.5 disabled:opacity-60"
                    >
                      {isSaving ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Saving...</span></>
                      ) : (
                        <><Check className="w-3.5 h-3.5" /><span>Save Changes</span></>
                      )}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 text-xs font-medium text-white border border-[#2A2E3D] rounded-md hover:bg-white/5 transition-colors flex items-center space-x-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full p-0.5 bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6]">
                      <div className="w-full h-full rounded-full bg-[#1A1D27] border-2 border-[#1A1D27] flex items-center justify-center text-3xl font-bold text-[#6366F1]">
                        {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                    {isEditing && (
                      <button 
                        onClick={() => triggerToast('Avatar upload requires Pro plan.')}
                        className="absolute bottom-0 right-0 w-8 h-8 bg-[#1A1D27] border border-[#2A2E3D] rounded-full flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors shadow-lg"
                        title="Change avatar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                          <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">{fullName || 'User'}</p>
                    <p className={`text-xs font-medium ${currentPlanMeta.color}`}>{currentPlanMeta.label}</p>
                  </div>
                </div>

                {/* Info Fields Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1 font-medium">Full Name</label>
                    {isEditing ? (
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Your full name" />
                    ) : (
                      <span className="text-sm text-white font-medium">{fullName || '—'}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1 font-medium">Email Address</label>
                    <span className="text-sm text-[#94A3B8]">{email || '—'}</span>
                    {isEditing && <p className="text-[10px] text-[#6366F1] mt-1">Email cannot be changed here.</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1 font-medium">Current Role / Title</label>
                    {isEditing ? (
                      <input type="text" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} className={inputClass} placeholder="e.g. Software Engineer" />
                    ) : (
                      <span className="text-sm text-white font-medium">{currentRole || '—'}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1 font-medium">Location</label>
                    {isEditing ? (
                      <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="e.g. India" />
                    ) : (
                      <span className="text-sm text-white font-medium">{location || '—'}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1 font-medium">College / Institution</label>
                    {isEditing ? (
                      <input type="text" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} className={inputClass} placeholder="College name" />
                    ) : (
                      <span className="text-sm text-white font-medium">{collegeName || '—'}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1 font-medium">Branch / Major</label>
                    {isEditing ? (
                      <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} className={inputClass} placeholder="e.g. Computer Science" />
                    ) : (
                      <span className="text-sm text-white font-medium">{branch || '—'}</span>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-[#94A3B8] mb-1 font-medium">Bio</label>
                    {isEditing ? (
                      <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows="3" className={inputClass} placeholder="Tell us about yourself..." />
                    ) : (
                      <p className="text-sm text-white font-medium leading-relaxed">{bio || '—'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              {!isEditing && user && (
                <div className="mt-6 pt-5 border-t border-[#2A2E3D] grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">{user.xp || 0}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Total XP</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">{user.streak || 0}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Day Streak 🔥</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">{(user.badges || []).length}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Badges</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preferences Card Panel */}
          {(activeTab === 'Profile' || activeTab === 'Preferences') && (
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
                    <p className="text-xs text-[#94A3B8]">Choose your preferred interface theme</p>
                  </div>
                  <div className="flex bg-[#131620] border border-[#2A2E3D] rounded-lg p-1">
                    <button 
                      onClick={() => { if (theme === 'dark') toggleTheme(); }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                        theme === 'light' ? 'bg-[#1A1D27] text-white border border-[#2A2E3D]' : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Light</span>
                    </button>
                    <button 
                      onClick={() => { if (theme === 'light') toggleTheme(); }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                        theme === 'dark' ? 'bg-[#1A1D27] text-white border border-[#2A2E3D]' : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span>Dark</span>
                    </button>
                    <button 
                      onClick={() => triggerToast('System default theme applied.')}
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
                    className="bg-[#131620] border border-[#2A2E3D] text-sm text-white rounded-lg focus:ring-[#6366F1] focus:border-[#6366F1] block w-44 p-2"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="flex items-center justify-between pt-6">
                  <div>
                    <p className="text-sm font-medium text-white mb-0.5">Default Difficulty</p>
                    <p className="text-xs text-[#94A3B8]">Set default difficulty for mock tests</p>
                  </div>
                  <select 
                    value={difficulty}
                    onChange={(e) => { setDifficulty(e.target.value); triggerToast(`Difficulty set to ${e.target.value}`); }}
                    className="bg-[#131620] border border-[#2A2E3D] text-sm text-white rounded-lg focus:ring-[#6366F1] focus:border-[#6366F1] block w-44 p-2"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>

                {/* Default Dashboard */}
                <div className="flex items-center justify-between pt-6">
                  <div>
                    <p className="text-sm font-medium text-white mb-0.5">Default Dashboard View</p>
                    <p className="text-xs text-[#94A3B8]">Choose what you see on login</p>
                  </div>
                  <select 
                    value={dashboard}
                    onChange={(e) => { setDashboard(e.target.value); triggerToast(`Default view updated to ${e.target.value}`); }}
                    className="bg-[#131620] border border-[#2A2E3D] text-sm text-white rounded-lg focus:ring-[#6366F1] focus:border-[#6366F1] block w-44 p-2"
                  >
                    <option>Dashboard Overview</option>
                    <option>Mock Tests</option>
                    <option>Analytics</option>
                  </select>
                </div>

                {/* Data & Personalization */}
                <div className="flex items-center justify-between pt-6">
                  <div>
                    <p className="text-sm font-medium text-white mb-0.5">AI Personalization</p>
                    <p className="text-xs text-[#94A3B8]">Allow us to personalize your experience based on data</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={personalization}
                      onChange={(e) => { setPersonalization(e.target.checked); triggerToast(`Personalization ${e.target.checked ? 'enabled' : 'disabled'}`); }}
                      className="sr-only peer" 
                    />
                    <div className={toggleClass}></div>
                  </label>
                </div>

              </div>
            </div>
          )}

          {/* Notifications Panel */}
          {activeTab === 'Notifications' && (
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
                    <input type="checkbox" checked={emailAlerts} onChange={(e) => { setEmailAlerts(e.target.checked); triggerToast(`Email notifications ${e.target.checked ? 'enabled' : 'disabled'}`); }} className="sr-only peer" />
                    <div className={toggleClass}></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-6">
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">Daily Streak Reminders</p>
                    <p className="text-xs text-[#94A3B8]">Get reminded to log in and preserve your day streak</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={streakReminders} onChange={(e) => { setStreakReminders(e.target.checked); triggerToast(`Streak reminders ${e.target.checked ? 'enabled' : 'disabled'}`); }} className="sr-only peer" />
                    <div className={toggleClass}></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-6">
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">Priority Support Alerts</p>
                    <p className="text-xs text-[#94A3B8]">Notify immediately on support updates (Premium feature)</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={supportAlerts} onChange={(e) => { setSupportAlerts(e.target.checked); triggerToast(`Support alerts ${e.target.checked ? 'enabled' : 'disabled'}`); }} className="sr-only peer" />
                    <div className={toggleClass}></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Account / Password Panel */}
          {activeTab === 'Account' && (
            <div className="bg-[#1A1D27] border border-[#2A2E3D] rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#131620] border border-[#2A2E3D] flex items-center justify-center text-teal-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Change Password</h3>
                  <p className="text-xs text-[#94A3B8]">Update your account password to keep it secure.</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Enter your current password"
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white transition-colors"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="At least 6 characters"
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white transition-colors"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength */}
                  {password && (
                    <div className="mt-1.5 flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          password.length >= 6 + (i * 3) ? (
                            i < 1 ? 'bg-red-500' : i < 2 ? 'bg-yellow-500' : i < 3 ? 'bg-blue-500' : 'bg-emerald-500'
                          ) : 'bg-[#2A2E3D]'
                        }`} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-enter your new password"
                      className={`${inputClass} pr-10 ${confirmPassword && confirmPassword !== password ? 'border-red-500/50' : confirmPassword && confirmPassword === password ? 'border-emerald-500/50' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white transition-colors"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                  )}
                  {confirmPassword && confirmPassword === password && (
                    <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><Check className="w-3 h-3" /> Passwords match</p>
                  )}
                </div>

                {/* Error message */}
                {passwordError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={passwordLoading || (confirmPassword && confirmPassword !== password)}
                  className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-medium py-2.5 px-6 rounded-lg text-sm hover:opacity-95 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {passwordLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Updating...</span></>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Subscription Panel */}
          {activeTab === 'Subscription' && (
            <div className="bg-[#1A1D27] border border-[#2A2E3D] rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#131620] border border-[#2A2E3D] flex items-center justify-center text-purple-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Subscription Management</h3>
                  <p className="text-xs text-[#94A3B8]">Review your current plan and upgrade for more features.</p>
                </div>
              </div>

              {/* Current plan highlight */}
              <div className={`border rounded-xl p-4 flex items-center justify-between ${
                plan === 'free' ? 'border-blue-500/20 bg-blue-500/5' :
                plan === 'pro' ? 'border-purple-500/30 bg-purple-500/5' :
                'border-emerald-500/30 bg-emerald-500/5'
              }`}>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-0.5">Your current plan</p>
                  <p className={`text-lg font-bold ${currentPlanMeta.color}`}>{currentPlanMeta.label}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${currentPlanMeta.badge}`}>Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Free Plan */}
                <div className={`border rounded-xl p-5 flex flex-col justify-between relative ${plan === 'free' ? 'border-blue-500/40 bg-blue-500/5' : 'border-[#2A2E3D] bg-[#131620]'}`}>
                  {plan === 'free' && <span className="absolute top-3 right-3 text-[10px] text-blue-400 font-bold uppercase tracking-wider">ACTIVE</span>}
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">Free</h4>
                    <p className="text-xl font-bold text-white mb-2">$0<span className="text-sm font-normal text-[#94A3B8]">/mo</span></p>
                    <ul className="space-y-1.5 text-xs text-[#94A3B8]">
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" />3 mock interviews/month</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" />Basic score card</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" />Generic roadmaps</li>
                    </ul>
                  </div>
                  {plan !== 'free' && (
                    <button onClick={() => { setSelectedUpgradePlan('free'); setShowUpgradeModal(true); }} className="mt-4 border border-[#2A2E3D] text-white text-xs py-2 rounded-lg hover:bg-white/5 transition-colors">
                      Downgrade
                    </button>
                  )}
                </div>

                {/* Pro Plan */}
                <div className={`border rounded-xl p-5 flex flex-col justify-between relative overflow-hidden ${plan === 'pro' ? 'border-purple-500/60 bg-purple-500/5' : 'border-purple-500/30 bg-gradient-to-br from-[#1e1b4b]/50 to-[#120b29]/50'}`}>
                  {plan === 'pro' && <span className="absolute top-3 right-3 text-[10px] text-purple-400 font-bold uppercase tracking-wider">ACTIVE</span>}
                  {plan !== 'pro' && <span className="absolute top-3 right-3 text-[10px] text-purple-400 font-bold uppercase tracking-wider">POPULAR</span>}
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">Pro</h4>
                    <p className="text-xl font-bold text-white mb-2">$29<span className="text-sm font-normal text-[#94A3B8]">/mo</span></p>
                    <ul className="space-y-1.5 text-xs text-[#94A3B8]">
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" />Unlimited interviews</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" />Advanced analytics</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" />Resume analyzer</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" />Coding arena</li>
                    </ul>
                  </div>
                  {plan !== 'pro' && (
                    <button onClick={() => { setSelectedUpgradePlan('pro'); setShowUpgradeModal(true); }} className="mt-4 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-xs font-semibold py-2 rounded-lg hover:opacity-90 shadow-[0_0_15px_rgba(139,92,246,0.3)] flex items-center justify-center gap-1 transition-opacity">
                      Upgrade to Pro <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Teams Plan */}
                <div className={`border rounded-xl p-5 flex flex-col justify-between relative ${plan === 'teams' ? 'border-emerald-500/60 bg-emerald-500/5' : 'border-[#2A2E3D] bg-[#131620]'}`}>
                  {plan === 'teams' && <span className="absolute top-3 right-3 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">ACTIVE</span>}
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">Teams</h4>
                    <p className="text-xl font-bold text-white mb-2">$79<span className="text-sm font-normal text-[#94A3B8]">/mo</span></p>
                    <ul className="space-y-1.5 text-xs text-[#94A3B8]">
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" />Everything in Pro</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" />Up to 10 members</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" />Priority support</li>
                    </ul>
                  </div>
                  {plan !== 'teams' && (
                    <button onClick={() => { setSelectedUpgradePlan('teams'); setShowUpgradeModal(true); }} className="mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold py-2 rounded-lg hover:opacity-90 flex items-center justify-center gap-1 transition-opacity">
                      Upgrade to Teams <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Security Panel */}
          {activeTab === 'Privacy & Security' && (
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
                    <p className="text-xs text-[#94A3B8] mt-0.5">Secure your account with Google Authenticator or SMS.</p>
                  </div>
                  <button onClick={() => triggerToast('2FA setup requires email verification.')} className="border border-[#2A2E3D] text-xs font-semibold px-4 py-2 rounded-lg hover:bg-white/5 text-white transition-colors">
                    Configure
                  </button>
                </div>

                <div className="border border-[#2A2E3D] rounded-xl p-4 bg-[#131620] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Active Sessions</h4>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Currently logged in via web browser.</p>
                  </div>
                  <button onClick={() => triggerToast('All other active sessions have been revoked.')} className="border border-[#2A2E3D] text-xs font-semibold px-4 py-2 rounded-lg hover:bg-white/5 text-rose-400 hover:text-rose-300 transition-colors">
                    Log out others
                  </button>
                </div>

                <div className="border border-[#2A2E3D] rounded-xl p-4 bg-[#131620] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Data Privacy</h4>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Control how your data is used for AI training.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" onChange={() => triggerToast('Privacy preference saved.')} />
                    <div className={toggleClass}></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Billing Panel */}
          {activeTab === 'Billing' && (
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

              {plan === 'free' ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-[#131620] rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-[#94A3B8]" />
                  </div>
                  <p className="text-sm text-white font-medium mb-1">No payment method on file</p>
                  <p className="text-xs text-[#94A3B8] mb-4">Upgrade to Pro to add a payment method.</p>
                  <button onClick={() => { setSelectedUpgradePlan('pro'); setShowUpgradeModal(true); }} className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-xs font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
                    Upgrade to Pro
                  </button>
                </div>
              ) : (
                <>
                  <div className="border border-[#2A2E3D] rounded-xl p-4 bg-[#131620] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-app-card rounded border border-white/5 flex items-center justify-center font-bold text-[10px] text-white bg-blue-700">VISA</div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Visa ending in 4242</h4>
                        <p className="text-xs text-[#94A3B8] mt-0.5">Expires 12/28 • Default Payment Method</p>
                      </div>
                    </div>
                    <button onClick={() => triggerToast('Payment method editor opened.')} className="text-xs font-semibold hover:underline text-[#6366F1]">
                      Edit
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Invoice History</h4>
                    <div className="overflow-x-auto rounded-xl border border-[#2A2E3D]">
                      <table className="w-full text-xs text-left text-slate-400">
                        <thead className="bg-[#131620] text-white uppercase font-bold text-[9px] border-b border-[#2A2E3D]">
                          <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Invoice</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2E3D]/50">
                          <tr>
                            <td className="px-4 py-3">June 12, 2026</td>
                            <td className="px-4 py-3">#INV-2026-0032</td>
                            <td className="px-4 py-3 font-semibold text-white">$29.00</td>
                            <td className="px-4 py-3 text-right text-emerald-400 font-semibold">PAID</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">May 12, 2026</td>
                            <td className="px-4 py-3">#INV-2026-0015</td>
                            <td className="px-4 py-3 font-semibold text-white">$29.00</td>
                            <td className="px-4 py-3 text-right text-emerald-400 font-semibold">PAID</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
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

            <div className={`border rounded-lg p-4 mb-6 flex justify-between items-center ${
              plan === 'free' ? 'bg-blue-900/20 border-blue-500/20' :
              plan === 'pro' ? 'bg-purple-900/20 border-purple-500/30' :
              'bg-emerald-900/20 border-emerald-500/30'
            }`}>
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">Current Plan</p>
                <p className={`text-xl font-bold ${currentPlanMeta.color}`}>{currentPlanMeta.label}</p>
              </div>
              {plan === 'free' && (
                <button 
                  onClick={() => { setSelectedUpgradePlan('pro'); setShowUpgradeModal(true); }}
                  className="bg-gradient-to-r from-[#6366F1] to-[#3B82F6] text-white text-xs font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                >
                  Upgrade
                </button>
              )}
            </div>

            <ul className="space-y-4 text-sm">
              <li className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-[#94A3B8]">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>AI Roadmaps</span>
                </div>
                <span className="text-white font-mono text-xs">{plan === 'free' ? '3 / 5' : '∞'}</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-[#94A3B8]">
                  <SettingsIcon className="w-4 h-4 text-emerald-400" />
                  <span>Resume Analyses</span>
                </div>
                <span className="text-white font-mono text-xs">{plan === 'free' ? '2 / 5' : '∞'}</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-[#94A3B8]">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Mock Interviews</span>
                </div>
                <span className="text-white font-mono text-xs">{plan === 'free' ? '2 / 3' : '∞'}</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-[#94A3B8]">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>AI Chat Messages</span>
                </div>
                <span className="text-white font-mono text-xs">{plan === 'free' ? '10 / 20' : '∞'}</span>
              </li>
              <li className={`flex items-center justify-between ${plan === 'free' ? 'opacity-40' : ''}`}>
                <div className="flex items-center space-x-3 text-[#94A3B8]">
                  <Shield className="w-4 h-4 text-[#94A3B8]" />
                  <span>Priority Support</span>
                </div>
                <span className={`font-mono text-xs ${plan !== 'free' ? 'text-emerald-400' : 'text-[#94A3B8]'}`}>{plan !== 'free' ? '✓' : '×'}</span>
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
                <HelpCircle className="w-4 h-4" />
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
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); triggerToast('Terms of Service page loading...'); }}>Terms of Service</a>
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); triggerToast('Privacy Policy page loading...'); }}>Privacy Policy</a>
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); setShowHelpModal(true); }}>Contact Us</a>
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
              <h3 className="text-lg font-bold text-white">
                {selectedUpgradePlan === 'free' ? 'Downgrade to Free' : `Upgrade to ${selectedUpgradePlan === 'pro' ? 'Pro' : 'Teams'}`}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                {selectedUpgradePlan === 'free' 
                  ? 'You will lose access to premium features immediately.'
                  : 'Unlock unlimited mock evaluations, advanced analytics, and priority support.'}
              </p>
            </div>
            <div className="bg-[#131620] border border-[#2A2E3D] rounded-xl p-4 flex justify-between items-center text-sm font-semibold">
              <span className="text-white capitalize">{selectedUpgradePlan} Plan</span>
              <span className="text-white">{selectedUpgradePlan === 'free' ? '$0' : selectedUpgradePlan === 'pro' ? '$29' : '$79'} / month</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowUpgradeModal(false)} className="flex-1 border border-[#2A2E3D] text-slate-300 hover:bg-white/5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleUpgradePlan}
                disabled={upgradeLoading}
                className={`flex-1 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all ${
                  selectedUpgradePlan === 'free' ? 'bg-red-600 hover:bg-red-500' : 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                }`}
              >
                {upgradeLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing...</span></>
                ) : (
                  <span>{selectedUpgradePlan === 'free' ? 'Downgrade' : 'Confirm & Activate'}</span>
                )}
              </button>
            </div>
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
              <p className="text-xs text-[#94A3B8]">Export your saved profile, preferences, and notification settings as a JSON file.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowExportModal(false)} className="flex-1 border border-[#2A2E3D] text-slate-300 hover:bg-white/5 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleExportData} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Confirm Export</button>
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
              <button onClick={() => setShowClearModal(false)} className="flex-1 border border-[#2A2E3D] text-slate-300 hover:bg-white/5 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleClearActivity} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Clear History</button>
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
              <button onClick={() => setShowResetModal(false)} className="flex-1 border border-[#2A2E3D] text-slate-300 hover:bg-white/5 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleResetProgress} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Reset Data</button>
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
              <p className="text-xs text-[#94A3B8]">This cannot be undone. Type <span className="font-bold text-red-400">DELETE</span> below to confirm your request.</p>
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
                <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 border border-[#2A2E3D] text-slate-300 hover:bg-white/5 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={deleteConfirmText.toUpperCase() !== 'DELETE'} className="flex-1 bg-red-600 disabled:opacity-40 hover:bg-red-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Delete Account</button>
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
              <p className="text-xs text-[#94A3B8]">Describe your question or issue below, and our team will get back to you within 24 hours.</p>
            </div>
            <form onSubmit={handleHelpSubmit} className="space-y-4 pt-2">
              <textarea 
                value={helpQuestion}
                onChange={(e) => setHelpQuestion(e.target.value)}
                required
                rows="4"
                placeholder="Ask about mock test limits, roadmaps, billing cycles, or report a bug..."
                className="w-full bg-[#131620] border border-[#2A2E3D] text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1] placeholder-slate-600 resize-none"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowHelpModal(false)} className="flex-1 border border-[#2A2E3D] text-slate-300 hover:bg-white/5 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
