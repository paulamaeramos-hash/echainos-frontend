import React, { useState } from 'react';
import QRScanner from './components/QRScanner.tsx';
import TransferForm from './components/TransferForm.tsx';
import COCTimeline from './components/COCTimeline.tsx';
import AuthView from './components/AuthView.tsx';

export interface User {
  username: string;
  full_name: string;
  badge_number: string;
  email?: string;
  department?: string;
  identity_verified: boolean;
}

export default function App() {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);

  // --- App Navigation State ---
  const [activeMenu, setActiveMenu] = useState<'track' | 'create' | 'transfer_scan' | 'settings'>('track');
  
  // Track Mode States
  const [trackInputMode, setTrackInputMode] = useState<'scanner' | 'manual'>('scanner');
  const [trackedId, setTrackedId] = useState<string | null>(null);
  const [manualTrackId, setManualTrackId] = useState('');

  // Transfer Mode States
  const [transferInputMode, setTransferInputMode] = useState<'scanner' | 'manual'>('scanner');
  const [scannedTransferId, setScannedTransferId] = useState<string>('');
  const [manualTransferId, setManualTransferId] = useState('');

  const handleLogout = () => {
    setUser(null);
    setTrackedId(null);
    setScannedTransferId('');
  };

  // ==========================================
  // 1. AUTHENTICATION (delegated to AuthView)
  // ==========================================
  if (!user) {
    return (
      <AuthView 
        onAuthSuccess={(authenticatedUser: any) => {
          setUser({
            username: authenticatedUser.username || authenticatedUser.email?.split('@')[0] || 'operator',
            full_name: authenticatedUser.full_name || authenticatedUser.fullName || authenticatedUser.name || 'Authorized Officer',
            badge_number: authenticatedUser.badge_number || authenticatedUser.badgeNumber || 'BADGE-8841',
            email: authenticatedUser.email,
            department: authenticatedUser.department,
            identity_verified: true,
          });
        }} 
      />
    );
  }

  // ==========================================
  // 2. MAIN APPLICATION (FORENSIC HUD)
  // ==========================================
  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans pb-24 md:pb-10 selection:bg-red-900 selection:text-white">
      {/* Top Tactical Clearance Banner */}
      <div className="bg-red-950/80 border-b border-red-900/60 text-[10px] font-mono py-1 px-4 text-center text-red-300 flex justify-between items-center tracking-wider">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          RESTRICTED SYSTEM // CLEARANCE LEVEL: TIER-1 FIELD OFFICER
        </span>
        <span className="hidden sm:inline text-gray-500">ENCRYPTION: AES-256 GCM</span>
      </div>

      {/* Main Bar */}
      <header className="bg-gray-950 border-b border-gray-800 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-sm md:text-base font-mono font-extrabold text-white flex items-center gap-2">
              <span className="text-red-600">🛡️</span> CHAIN OF CUSTODY
            </h1>
            <p className="text-[11px] font-mono text-gray-400">
              OFFICER: <strong className="text-white">{user.full_name}</strong> [{user.badge_number}]
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-mono bg-gray-900 hover:bg-red-950/50 text-gray-300 hover:text-red-400 border border-gray-800 hover:border-red-900 px-3 py-1.5 rounded-lg transition font-medium cursor-pointer"
          >
            DISCONNECT 🚪
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">

        {/* 1. MENU: TRACK EVIDENCE */}
        {activeMenu === 'track' && (
          <div className="space-y-4">
            {!trackedId ? (
              <div className="bg-gray-950 border border-gray-800 p-5 md:p-6 rounded-2xl space-y-4 shadow-2xl relative">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-mono text-red-500 tracking-widest uppercase bg-red-950/40 border border-red-900/40 px-2 py-0.5 rounded">
                    EVIDENCE AUDIT PORTAL
                  </span>
                  <h2 className="text-base font-bold text-white pt-1">🔍 Search Evidence Timeline</h2>
                  <p className="text-xs text-gray-400">Scan camera, upload tag photo, or type manual evidence ID.</p>
                </div>

                {/* Sub-toggle */}
                <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs font-mono font-semibold">
                  <button
                    onClick={() => setTrackInputMode('scanner')}
                    className={`flex-1 py-2 rounded-lg transition ${
                      trackInputMode === 'scanner' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    📷 CAMERA / SCANNER
                  </button>
                  <button
                    onClick={() => setTrackInputMode('manual')}
                    className={`flex-1 py-2 rounded-lg transition ${
                      trackInputMode === 'manual' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    ⌨️ MANUAL ID
                  </button>
                </div>

                {trackInputMode === 'scanner' && (
                  <QRScanner onScanSuccess={(scannedText) => setTrackedId(scannedText)} onClose={() => setTrackInputMode('manual')} />
                )}

                {trackInputMode === 'manual' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (manualTrackId.trim()) setTrackedId(manualTrackId.trim().toUpperCase());
                    }}
                    className="space-y-3 pt-2"
                  >
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1 uppercase">Evidence ID Tag Number</label>
                      <input
                        type="text"
                        placeholder="e.g. EV-2026-89104"
                        value={manualTrackId}
                        onChange={(e) => setManualTrackId(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white font-mono uppercase focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-500 font-mono font-bold text-white py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-red-950/50 cursor-pointer"
                    >
                      🔍 RETRIEVE AUDIT TRAIL
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                  <span className="text-xs font-mono text-gray-400">
                    AUDITING ID: <strong className="text-red-500 font-mono text-sm pl-1">{trackedId}</strong>
                  </span>
                  <button
                    onClick={() => { setTrackedId(null); setManualTrackId(''); }}
                    className="bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs font-mono px-3 py-1.5 rounded-lg text-gray-300 font-semibold cursor-pointer"
                  >
                    🔄 NEW QUERY
                  </button>
                </div>
                <COCTimeline />
              </div>
            )}
          </div>
        )}

        {/* 2. MENU: LOG NEW EVIDENCE */}
        {activeMenu === 'create' && (
          <div className="space-y-4">
            <div className="border-b border-gray-800 pb-2 flex justify-between items-end">
              <div>
                <h2 className="text-base font-bold text-white font-mono">➕ INTAKE NEW EVIDENCE</h2>
                <p className="text-xs text-gray-400">Log item details & print encrypted QR bar code tag.</p>
              </div>
              <span className="text-[10px] font-mono text-red-400 bg-red-950/60 border border-red-900 px-2 py-0.5 rounded">
                FORM CO-101
              </span>
            </div>
            <TransferForm currentUser={{ ...user, email: user.email || '', department: user.department || '' }} />
          </div>
        )}

        {/* 3. MENU: TRANSFER LOG */}
        {activeMenu === 'transfer_scan' && (
          <div className="space-y-4">
            {!scannedTransferId ? (
              <div className="bg-gray-950 border border-gray-800 p-5 md:p-6 rounded-2xl space-y-4 shadow-2xl">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-mono text-red-500 tracking-widest uppercase bg-red-950/40 border border-red-900/40 px-2 py-0.5 rounded">
                    CHAIN OF CUSTODY TRANSFER
                  </span>
                  <h2 className="text-base font-bold text-white pt-1">🔄 Scan Tag for Transfer</h2>
                  <p className="text-xs text-gray-400">Scan physical barcode/QR or enter Evidence ID.</p>
                </div>

                <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs font-mono font-semibold">
                  <button
                    onClick={() => setTransferInputMode('scanner')}
                    className={`flex-1 py-2 rounded-lg transition ${
                      transferInputMode === 'scanner' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    📷 CAMERA / SCANNER
                  </button>
                  <button
                    onClick={() => setTransferInputMode('manual')}
                    className={`flex-1 py-2 rounded-lg transition ${
                      transferInputMode === 'manual' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    ⌨️ MANUAL ID
                  </button>
                </div>

                {transferInputMode === 'scanner' && (
                  <QRScanner
                    onScanSuccess={(scannedText) => setScannedTransferId(scannedText)}
                    onClose={() => setTransferInputMode('manual')}
                  />
                )}

                {transferInputMode === 'manual' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (manualTransferId.trim()) setScannedTransferId(manualTransferId.trim().toUpperCase());
                    }}
                    className="space-y-3 pt-2"
                  >
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1 uppercase">Evidence Tag Number</label>
                      <input
                        type="text"
                        placeholder="e.g. EV-2026-89104"
                        value={manualTransferId}
                        onChange={(e) => setManualTransferId(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white font-mono uppercase focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-500 font-mono font-bold text-white py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-red-950/50 cursor-pointer"
                    >
                      🔄 LOAD TRANSFER FORM
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-950/60 border border-red-800 p-3.5 rounded-xl flex justify-between items-center">
                  <p className="text-xs text-red-200 font-mono">
                    ✓ TRANSFER ACTIVE FOR ID: <strong className="text-white uppercase">{scannedTransferId}</strong>
                  </p>
                  <button
                    onClick={() => { setScannedTransferId(''); setManualTransferId(''); }}
                    className="text-xs font-mono bg-gray-900 hover:bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 font-semibold cursor-pointer"
                  >
                    CHANGE ID
                  </button>
                </div>
                <TransferForm currentUser={{ full_name: user.full_name, username: user.username, badge_number: user.badge_number, email: user.email || '', department: user.department || '', identity_verified: true }} />
              </div>
            )}
          </div>
        )}

        {/* 4. MENU: SETTINGS */}
        {activeMenu === 'settings' && (
          <div className="bg-gray-950 border border-gray-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <h2 className="text-base font-mono font-bold text-white flex items-center gap-2">
              ⚙️ STATION & SECURITY STATUS
            </h2>
            <div className="text-xs font-mono space-y-3 text-gray-300 bg-gray-900/80 p-4 rounded-xl border border-gray-800">
              <p className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500">AUTHENTICATED USER:</span>
                <strong className="text-white">{user.full_name}</strong>
              </p>
              <p className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500">OFFICER BADGE ID:</span>
                <strong className="text-red-400">{user.badge_number}</strong>
              </p>
              <p className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500">TERMINAL NODE:</span>
                <strong className="text-white">NODE-STATION-04</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500">DATA INTEGRITY HASH:</span>
                <strong className="text-red-500">SHA-256 ACTIVE</strong>
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-md border-t border-gray-800 z-50 px-2 py-2">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          <button
            onClick={() => { setActiveMenu('track'); setTrackedId(null); }}
            className={`flex flex-col items-center py-2 px-1 rounded-xl transition font-mono ${
              activeMenu === 'track' ? 'text-red-500 font-bold bg-red-950/50 border border-red-900/50' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-base">🔍</span>
            <span className="text-[10px] mt-0.5 tracking-wider uppercase">TRACK</span>
          </button>

          <button
            onClick={() => setActiveMenu('create')}
            className={`flex flex-col items-center py-2 px-1 rounded-xl transition font-mono ${
              activeMenu === 'create' ? 'text-red-500 font-bold bg-red-950/50 border border-red-900/50' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-base">➕</span>
            <span className="text-[10px] mt-0.5 tracking-wider uppercase">INTAKE</span>
          </button>

          <button
            onClick={() => setActiveMenu('transfer_scan')}
            className={`flex flex-col items-center py-2 px-1 rounded-xl transition font-mono ${
              activeMenu === 'transfer_scan' ? 'text-red-500 font-bold bg-red-950/50 border border-red-900/50' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-base">🔄</span>
            <span className="text-[10px] mt-0.5 tracking-wider uppercase">TRANSFER</span>
          </button>

          <button
            onClick={() => setActiveMenu('settings')}
            className={`flex flex-col items-center py-2 px-1 rounded-xl transition font-mono ${
              activeMenu === 'settings' ? 'text-red-500 font-bold bg-red-950/50 border border-red-900/50' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-base">⚙️</span>
            <span className="text-[10px] mt-0.5 tracking-wider uppercase">STATUS</span>
          </button>
        </div>
      </nav>
    </div>
  );
}