import React, { useState, useMemo } from 'react';
import TransferForm from './TransferForm.tsx';
import TimelineView from './TimelineView.tsx';
import QRScanner from './QRScanner.tsx';
import SettingsView from './SettingsView.tsx';
import AuthView from './AuthView.tsx';
import EvidenceList from './EvidenceList.tsx';

export type DashboardView = 
  | 'MENU' 
  | 'REGISTRY' 
  | 'LOG_EVIDENCE' 
  | 'SCAN_QR' 
  | 'VIEW_TIMELINE' 
  | 'SETTINGS';

export interface DashboardUserProfile {
  full_name: string;
  username: string;
  badge_number: string;
  email: string;
  department: string;
  identity_verified: boolean;
}

export interface ActivityLog {
  id: string;
  evidenceId: string;
  action: string;
  officer: string;
  timestamp: string;
  hash: string;
  status: 'VERIFIED' | 'SEALED' | 'TRANSFERRED' | 'AUDITED';
}

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<DashboardUserProfile | null>(null);
  const [currentView, setCurrentView] = useState<DashboardView>('MENU');
  const [activeEvidenceId, setActiveEvidenceId] = useState<string | null>(null);
  const [searchIdInput, setSearchIdInput] = useState('');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');

  // Sample initial activity logs
  const [logs] = useState<ActivityLog[]>([
    {
      id: '1',
      evidenceId: 'EVD-2026-0891',
      action: 'Transfer Verified',
      officer: 'Det. R. Vance',
      timestamp: '2 mins ago',
      hash: 'a8f3b...9e21',
      status: 'VERIFIED',
    },
    {
      id: '2',
      evidenceId: 'EVD-2026-0888',
      action: 'Initial Intake Sealed',
      officer: 'Inv. J. Miller',
      timestamp: '14 mins ago',
      hash: '7c10e...4b88',
      status: 'SEALED',
    },
    {
      id: '3',
      evidenceId: 'EVD-2026-0872',
      action: 'Lab Analysis Custody',
      officer: 'Tech K. Chen',
      timestamp: '1 hour ago',
      hash: '3d91f...11a0',
      status: 'TRANSFERRED',
    },
  ]);

  // Filtered activity logs
  const filteredLogs = useMemo(() => {
    if (!activitySearchQuery.trim()) return logs;
    const q = activitySearchQuery.toLowerCase();
    return logs.filter(
      (log) =>
        log.evidenceId.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.officer.toLowerCase().includes(q) ||
        log.hash.toLowerCase().includes(q)
    );
  }, [logs, activitySearchQuery]);

  // Handle User Authentication Success
  if (!currentUser) {
    return (
      <AuthView
        onAuthSuccess={(user: any) => {
          setCurrentUser({
            full_name: user.full_name || user.fullName || user.name || 'Authorized Officer',
            username: user.username || user.email?.split('@')[0] || 'operator',
            badge_number: user.badge_number || 'BADGE-8841',
            email: user.email || '',
            department: user.department || 'Digital Forensics',
            identity_verified: true,
          });
        }}
      />
    );
  }

  const handleSelectEvidence = (evidenceId: string) => {
    setActiveEvidenceId(evidenceId);
    setCurrentView('VIEW_TIMELINE');
  };

  const handleScanSuccess = (rawPayload: string) => {
    try {
      const parsed = JSON.parse(decodeURIComponent(rawPayload));
      setActiveEvidenceId(parsed.id || rawPayload);
    } catch {
      setActiveEvidenceId(rawPayload.trim().toUpperCase());
    }
    setCurrentView('VIEW_TIMELINE');
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchIdInput.trim()) {
      setActiveEvidenceId(searchIdInput.trim().toUpperCase());
      setCurrentView('VIEW_TIMELINE');
    }
  };

  const handleReturnToMenu = () => {
    setActiveEvidenceId(null);
    setCurrentView('MENU');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans antialiased selection:bg-red-900 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-900/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-slate-800/20 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col min-h-screen">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-slate-900 border border-slate-700 p-[1px] shadow-sm flex-shrink-0">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-white font-mono text-lg tracking-tighter border border-slate-800">
                eC
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black tracking-wider text-slate-100 uppercase font-mono">
                  eChain<span className="text-red-500">OS</span>
                </h1>
                <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ledger Online
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Cryptographic Chain of Custody System
              </p>
            </div>
          </div>

          {/* Quick Nav & User Profile Actions */}
          <div className="flex items-center gap-3">
            {/* View Switching Navigation */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setCurrentView('MENU')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  currentView === 'MENU'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hub
              </button>
              <button
                onClick={() => setCurrentView('REGISTRY')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  currentView === 'REGISTRY'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Registry
              </button>
            </div>

            <button
              onClick={() => setCurrentView('SETTINGS')}
              className={`p-2.5 rounded-2xl border transition shadow-sm cursor-pointer ${
                currentView === 'SETTINGS'
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="System Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-sm border border-slate-800 px-3.5 py-2 rounded-2xl shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-100 font-mono shadow-inner">
                {currentUser.full_name.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-right text-xs">
                <span className="block font-bold text-slate-200 leading-none mb-0.5">{currentUser.full_name}</span>
                <span className="text-[10px] text-slate-500 font-mono">{currentUser.badge_number}</span>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => setCurrentUser(null)}
              className="bg-slate-900 hover:bg-red-950/60 border border-slate-800 hover:border-red-900/80 text-slate-400 hover:text-red-400 p-2.5 rounded-2xl transition cursor-pointer shadow-sm"
              title="Sign Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 py-8">
          {/* MENU VIEW */}
          {currentView === 'MENU' && (
            <div className="space-y-8">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Total Evidences Sealed
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-slate-100">1,482</span>
                    <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/50">+12 today</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Ledger Integrity
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-emerald-400">100%</span>
                    <span className="text-[10px] font-mono text-slate-400">SHA-256 Verified</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Active Session ID
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold font-mono text-slate-200">AUTH-99X</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">OTP Verified</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    System Node
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold font-mono text-slate-300 truncate">NODE-MNL-01</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">Synced</span>
                  </div>
                </div>
              </div>

              {/* Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  onClick={() => setCurrentView('LOG_EVIDENCE')}
                  className="group relative bg-slate-950/80 backdrop-blur-sm hover:bg-slate-900/90 border border-slate-800/80 hover:border-red-900/50 rounded-3xl p-6 transition-all duration-300 cursor-pointer shadow-lg"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 text-red-400 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:border-red-500/50 transition-all shadow-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h10M7 12h10m-8 5h8M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-slate-100 mb-1 group-hover:text-white transition-colors uppercase tracking-wider">
                    Register Evidence
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Log new evidence, generate SHA-256 block hash, and issue encrypted physical barcode tag.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-mono text-red-400 font-bold tracking-wider">
                    <span>LAUNCH INTAKE FORM</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>

                <div
                  onClick={() => setCurrentView('SCAN_QR')}
                  className="group relative bg-slate-950/80 backdrop-blur-sm hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-3xl p-6 transition-all duration-300 cursor-pointer shadow-lg"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:border-slate-500 transition-all shadow-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v1m0 14v1m8-8h-1M5 12H4m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-slate-100 mb-1 group-hover:text-white transition-colors uppercase tracking-wider">
                    Scan Tag / Audit Timeline
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Scan optical barcode/QR tag to view unbroken history, chain of custody, and cryptographic audit trail.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-mono text-slate-300 font-bold tracking-wider">
                    <span>OPTICAL SCANNER</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>

              {/* Direct ID Lookup & Live Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Search Form */}
                <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-lg">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 mb-1 flex items-center gap-2 uppercase tracking-wide">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Direct Ledger Query
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Query timeline record by ID directly.</p>
                  </div>
                  <form onSubmit={handleManualSearch} className="space-y-3">
                    <input
                      type="text"
                      placeholder="e.g. EVD-2026-0891"
                      value={searchIdInput}
                      onChange={(e) => setSearchIdInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-red-500 focus:bg-slate-950 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!searchIdInput.trim()}
                      className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 border border-red-500 text-white text-xs font-mono font-bold py-2.5 rounded-xl transition cursor-pointer shadow-sm tracking-widest uppercase flex items-center justify-center gap-2"
                    >
                      <span>Audit Record</span>
                      <span>→</span>
                    </button>
                  </form>
                </div>

                {/* Activity Feed */}
                <div className="lg:col-span-2 bg-slate-950/80 backdrop-blur-sm border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Live Activity
                    </h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Filter activity..."
                        value={activitySearchQuery}
                        onChange={(e) => setActivitySearchQuery(e.target.value)}
                        className="bg-slate-900 border border-slate-800 focus:border-slate-600 text-[11px] font-mono text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none"
                      />
                      <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase hidden sm:inline">REAL-TIME</span>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {filteredLogs.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500 font-mono">
                        No activity records found matching query.
                      </div>
                    ) : (
                      filteredLogs.map((log) => (
                        <div
                          key={log.id}
                          onClick={() => {
                            setActiveEvidenceId(log.evidenceId);
                            setCurrentView('VIEW_TIMELINE');
                          }}
                          className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 hover:border-slate-600 hover:bg-slate-900 transition-colors cursor-pointer text-xs font-mono"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                            <div>
                              <span className="text-slate-100 font-bold block">{log.evidenceId}</span>
                              <span className="text-[10px] text-slate-400">
                                {log.action} • {log.officer}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">{log.timestamp}</span>
                            <span className="text-[9px] text-slate-500 font-semibold">{log.hash}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REGISTRY VIEW */}
          {currentView === 'REGISTRY' && (
            <div className="max-w-6xl mx-auto space-y-4">
              <button
                onClick={handleReturnToMenu}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs font-mono uppercase font-bold cursor-pointer transition-colors"
              >
                <span>←</span>
                <span>Command Hub</span>
              </button>
              <EvidenceList
                currentUser={currentUser}
                onSelectEvidence={handleSelectEvidence}
                onNewTransfer={() => setCurrentView('LOG_EVIDENCE')}
              />
            </div>
          )}

          {/* OTHER SUB-VIEWS */}
          {currentView === 'LOG_EVIDENCE' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <button
                onClick={handleReturnToMenu}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs font-mono uppercase font-bold cursor-pointer transition-colors"
              >
                <span>←</span>
                <span>Command Hub</span>
              </button>
              <TransferForm
                currentUser={currentUser as any}
                onSuccess={(evidenceId?: string) => {
                  if (evidenceId) {
                    setActiveEvidenceId(evidenceId);
                    setCurrentView('VIEW_TIMELINE');
                  } else {
                    handleReturnToMenu();
                  }
                }}
                onCancel={handleReturnToMenu}
              />
            </div>
          )}

          {currentView === 'SCAN_QR' && (
            <div className="max-w-xl mx-auto space-y-4">
              <button
                onClick={handleReturnToMenu}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs font-mono uppercase font-bold cursor-pointer transition-colors"
              >
                <span>←</span>
                <span>Cancel Scan</span>
              </button>
              <QRScanner onScanSuccess={handleScanSuccess} onClose={handleReturnToMenu} />
            </div>
          )}

          {currentView === 'VIEW_TIMELINE' && activeEvidenceId && (
            <div className="max-w-4xl mx-auto space-y-4">
              <TimelineView
                evidenceId={activeEvidenceId}
                currentUser={currentUser as any}
                onBack={handleReturnToMenu}
              />
            </div>
          )}

          {currentView === 'SETTINGS' && (
            <div className="max-w-4xl mx-auto">
              <SettingsView currentUser={currentUser as any} onClose={handleReturnToMenu} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}