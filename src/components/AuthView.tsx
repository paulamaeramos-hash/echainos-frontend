import React, { useState } from 'react';

interface AuthViewProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // --- LOGIN FIELDS ---
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // --- REGISTER FIELDS ---
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regBadge, setRegBadge] = useState('');
  const [regRank, setRegRank] = useState('');

  // --- UI STATES ---
  const [error, setError] = useState<string | null>(null);

  const clearMessages = () => setError(null);

  // --- HANDLE LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    try {
      const res = await fetch('https://echainos-backend.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        onAuthSuccess(data.user);
      } else {
        setError(data.message || 'Authentication failed.');
      }
    } catch (err) {
      setError('Cannot reach server backend. Ensure node server.js is running.');
    }
  };

  // --- HANDLE REGISTER ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    try {
      const res = await fetch('https://echainos-backend.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          fullName: regFullName,
          badgeNumber: regBadge,
          rank: regRank
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        onAuthSuccess(data.user);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Error connecting to server.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white font-mono">
      <div className="relative bg-[#090d14] border border-red-900/60 p-6 md:p-8 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(220,38,38,0.15)] space-y-5">
        
        {/* Decorative Corners */}
        <div className="absolute top-2 left-2 text-red-600 text-xs">┌</div>
        <div className="absolute top-2 right-2 text-red-600 text-xs">┐</div>
        <div className="absolute bottom-2 left-2 text-red-600 text-xs">└</div>
        <div className="absolute bottom-2 right-2 text-red-600 text-xs">┘</div>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 bg-red-950/80 border border-red-800 px-3 py-1 rounded-full text-[10px] text-red-400 font-bold uppercase">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            FORENSIC CHAIN OF CUSTODY
          </div>
          <h1 className="text-xl font-black tracking-wider uppercase mt-2">EVIDENCE ACCESS PORTAL</h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
          <button
            onClick={() => { setTab('login'); clearMessages(); }}
            className={`flex-1 py-2 rounded-lg transition ${tab === 'login' ? 'bg-red-600 text-white' : 'text-slate-400'}`}
          >
            LOGIN
          </button>
          <button
            onClick={() => { setTab('register'); clearMessages(); }}
            className={`flex-1 py-2 rounded-lg transition ${tab === 'register' ? 'bg-red-600 text-white' : 'text-slate-400'}`}
          >
            REGISTER
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-950/90 border border-red-700 text-red-200 text-xs p-3 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* ================= TAB 1: LOGIN ================= */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="block font-mono text-[10px] text-slate-400 mb-1 font-bold uppercase">USERNAME OR EMAIL</label>
              <input
                type="text"
                required
                placeholder="username or officer@agency.gov"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] text-slate-400 mb-1 font-bold uppercase">PASSWORD</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 font-mono font-bold py-3.5 rounded-xl text-xs uppercase text-white transition mt-2"
            >
              AUTHENTICATE ACCESS
            </button>
          </form>
        )}

        {/* ================= TAB 2: REGISTER ================= */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-xs font-sans">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-mono text-[10px] text-amber-400 mb-1 font-bold uppercase">USERNAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. det_holt"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-amber-600/50 rounded-lg p-2.5 text-xs text-amber-300 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-slate-400 mb-1 font-bold uppercase">BADGE NUMBER *</label>
                <input
                  type="text"
                  required
                  placeholder="BADGE-099"
                  value={regBadge}
                  onChange={(e) => setRegBadge(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-slate-400 mb-1 font-bold uppercase">FULL NAME *</label>
              <input
                type="text"
                required
                placeholder="Capt. Raymond Holt"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-mono text-[10px] text-slate-400 mb-1 font-bold uppercase">OFFICIAL EMAIL *</label>
                <input
                  type="email"
                  required
                  placeholder="r.holt@pd.gov"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-slate-400 mb-1 font-bold uppercase">RANK</label>
                <input
                  type="text"
                  placeholder="Captain"
                  value={regRank}
                  onChange={(e) => setRegRank(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-slate-400 mb-1 font-bold uppercase">PASSWORD *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 font-mono font-bold py-3 rounded-xl text-xs uppercase text-white transition shadow-lg shadow-red-950/50 mt-1"
            >
              REGISTER NEW ACCOUNT →
            </button>
          </form>
        )}

      </div>
    </div>
  );
}