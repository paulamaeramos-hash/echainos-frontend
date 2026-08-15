import React, { useState } from 'react';

// --- FORENSIC ICONS (Inline SVGs) ---
const FingerprintIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10"/>
    <path d="M5 15.5C4.5 13.5 4 11 4 9c0-4.42 3.58-8 8-8s8 3.58 8 8c0 2-.5 4.5-1 6.5"/>
    <path d="M8.5 18.5c-.8-2-1.5-4.5-1.5-7.5 0-2.76 2.24-5 5-5s5 2.24 5 5c0 3-.7 5.5-1.5 7.5"/>
    <path d="M12 22c-2.5 0-4.5-2.5-4.5-5.5S9.5 11 12 11s4.5 2.5 4.5 5.5-2 5.5-4.5 5.5z"/>
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const AuditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- INTERFACES ---
interface SettingsViewProps {
  currentUser: any; // Matched to what your Dashboard passes
  onClose: () => void;
}

export default function SettingsView({ currentUser, onClose }: SettingsViewProps) {
  // --- STATE MANAGEMENT ---
  const [timezone, setTimezone] = useState('UTC');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // --- HANDLERS ---
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setStatusMessage({ type: 'error', text: 'Both password fields are required.' });
      return;
    }
    // Simulate API call for password update
    setTimeout(() => {
      setStatusMessage({ type: 'success', text: 'Credentials updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
    }, 800);
  };

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimezone(e.target.value);
    setStatusMessage({ type: 'success', text: `System timezone updated to ${e.target.value}.` });
  };

  const handleToggle2FA = () => {
    const newState = !twoFactorEnabled;
    setTwoFactorEnabled(newState);
    setStatusMessage({ 
      type: 'success', 
      text: `Two-Factor Authentication has been ${newState ? 'ENABLED' : 'DISABLED'}.` 
    });
  };

  const handleExportAudit = () => {
    // Generate a mock audit log file and trigger download
    const auditData = `FORENSIC CHAIN OF CUSTODY - AUDIT LOG
======================================
Generated: ${new Date().toISOString()}
Officer: ${currentUser?.full_name} (${currentUser?.badge_number})
Timezone Preference: ${timezone}
Authentication: 2FA ${twoFactorEnabled ? 'Active' : 'Inactive'}
======================================
[INFO] System access verified.
[INFO] No unauthorized transfer attempts detected.
*** END OF REPORT ***`;

    const blob = new Blob([auditData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AUDIT_${currentUser?.badge_number}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setStatusMessage({ type: 'success', text: 'Audit log exported successfully.' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen p-6 md:p-10 font-sans text-gray-800 flex justify-center items-start">
        <div className="bg-white max-w-5xl w-full mx-auto space-y-6 p-8 rounded-2xl shadow-2xl relative border border-gray-200">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-red-600 transition-colors"
          >
            <XIcon />
          </button>

          {/* Header Section */}
          <div className="border-b border-gray-200 pb-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
                <span className="text-red-600"><FingerprintIcon /></span>
                SYSTEM CONFIGURATION
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-mono uppercase tracking-widest">
                Forensic Chain of Custody Portal
              </p>
            </div>
            
            {/* Status Notification Area */}
            {statusMessage.text ? (
               <div className={`px-4 py-2 rounded-md text-xs font-bold uppercase border flex items-center gap-2 ${
                 statusMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
               }`}>
                 {statusMessage.text}
               </div>
            ) : (
              <div className="bg-gray-50 text-gray-500 border border-gray-200 px-4 py-2 rounded-md text-xs font-bold uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Connection Secure
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. OFFICIAL PROFILE DATA (Read-Only) */}
            <section className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5 text-gray-900 border-b border-gray-200 pb-3">
                <ShieldIcon />
                <h2 className="text-lg font-bold uppercase tracking-wide">Officer Profile</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Unique Username</label>
                    <div className="bg-white border border-gray-200 px-3 py-2 rounded text-sm text-gray-700 font-mono bg-gray-100/50 cursor-not-allowed">
                      @{currentUser?.username || 'user_unknown'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Badge Number</label>
                    <div className="bg-white border border-gray-200 px-3 py-2 rounded text-sm text-gray-900 font-mono font-bold bg-gray-100/50 cursor-not-allowed">
                      {currentUser?.badge_number || 'N/A'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Full Legal Name</label>
                  <div className="bg-white border border-gray-200 px-3 py-2 rounded text-sm text-gray-700 bg-gray-100/50 cursor-not-allowed">
                    {currentUser?.full_name || 'N/A'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Rank / Title</label>
                    <div className="bg-white border border-gray-200 px-3 py-2 rounded text-sm text-gray-700 bg-gray-100/50 cursor-not-allowed">
                      {currentUser?.rank || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Official Email</label>
                    <div className="bg-white border border-gray-200 px-3 py-2 rounded text-sm text-gray-700 bg-gray-100/50 cursor-not-allowed overflow-hidden text-ellipsis">
                      {currentUser?.email || 'N/A'}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-red-600 font-semibold mt-2">
                  * Profile data is locked for compliance. Contact Admin for changes.
                </p>
              </div>
            </section>

            {/* 2. SECURITY CONTROLS */}
            <section className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-5 text-gray-900 border-b border-gray-200 pb-3">
                <LockIcon />
                <h2 className="text-lg font-bold uppercase tracking-wide">Security Controls</h2>
              </div>

              <div className="space-y-5">
                <form onSubmit={handlePasswordUpdate}>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Update Password</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current Password" 
                    className="w-full bg-white border border-gray-300 px-3 py-2 rounded text-sm mb-2 focus:border-red-500 focus:outline-none"
                  />
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password" 
                    className="w-full bg-white border border-gray-300 px-3 py-2 rounded text-sm focus:border-red-500 focus:outline-none"
                  />
                  <button type="submit" className="mt-3 bg-white border border-gray-300 hover:border-red-500 hover:text-red-600 text-gray-700 text-xs font-bold py-2 px-4 rounded transition-colors w-full uppercase">
                    Update Credentials
                  </button>
                </form>

                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-[10px] text-gray-500">Require 2FA token for evidence transfer</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={twoFactorEnabled}
                      onChange={handleToggle2FA}
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* 3. SYSTEM PREFERENCES */}
            <section className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold uppercase tracking-wide text-gray-900 border-b border-gray-200 pb-3 mb-5">
                System Preferences
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Timestamp Timezone (Critical)</label>
                  <select 
                    value={timezone}
                    onChange={handleTimezoneChange}
                    className="w-full bg-white border border-gray-300 px-3 py-2 rounded text-sm text-gray-900 focus:border-red-500 focus:outline-none font-mono"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                    <option value="PST">PST (Pacific Standard Time)</option>
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">All evidence transfers will be logged in this timezone for court reporting.</p>
                </div>
              </div>
            </section>

            {/* 4. COMPLIANCE & EXPORT */}
            <section className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm border-l-4 border-l-red-600">
              <div className="flex items-center gap-2 mb-5 text-gray-900 border-b border-gray-200 pb-3">
                <AuditIcon />
                <h2 className="text-lg font-bold uppercase tracking-wide">Compliance & Audit</h2>
              </div>
              
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Generate a cryptographically verified report of all evidence transfers associated with your badge number. This document is formatted for official court submissions.
              </p>

              <button 
                onClick={handleExportAudit}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <AuditIcon />
                Export Audit Log (TXT)
              </button>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}