import React, { useState, useEffect } from 'react';

interface PendingUser {
  id: string;
  full_name: string;
  email: string;
  badge_number: string;
  rank: string;
  role: string;
  submittedAt: string;
}

export default function AdminApprovalView({ onBack }: { onBack: () => void }) {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch('https://echainos-backend.onrender.com/api/admin/pending-users');
      const data = await res.json();
      setPendingUsers(data);
    } catch (err) {
      console.error('Failed to load pending users');
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId: string, name: string) => {
    try {
      const res = await fetch('https://echainos-backend.onrender.com/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setMessage(data.message);
      fetchPendingUsers(); // Refresh list
    } catch (err) {
      setMessage('Error approving user.');
    }
  };

  const handleReject = async (userId: string, name: string) => {
    try {
      const res = await fetch('https://echainos-backend.onrender.com/api/admin/reject-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setMessage(data.message);
      fetchPendingUsers(); // Refresh list
    } catch (err) {
      setMessage('Error rejecting user.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs text-red-500 font-bold tracking-widest uppercase">
              STATION CONTROL CENTER
            </span>
            <h1 className="text-2xl font-black tracking-wider text-white">
              USER VERIFICATION & APPROVAL PORTAL
            </h1>
          </div>
          <button
            onClick={onBack}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs px-4 py-2 rounded-lg border border-slate-700"
          >
            ← BACK TO TERMINAL
          </button>
        </div>

        {/* Action Alert */}
        {message && (
          <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs rounded-lg">
            ✓ {message}
          </div>
        )}

        {/* Pending Requests Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-200 uppercase">
              PENDING REGISTRATION QUEUE ({pendingUsers.length})
            </h2>
            <button
              onClick={fetchPendingUsers}
              className="text-xs text-red-400 hover:underline"
            >
              🔄 REFRESH
            </button>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              NO PENDING REGISTRATION REQUESTS IN QUEUE.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((u) => (
                <div
                  key={u.id}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{u.full_name}</span>
                      <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] px-2 py-0.5 rounded font-bold">
                        {u.badge_number}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {u.rank} • {u.role} | <span className="text-slate-300">{u.email}</span>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Submitted: {new Date(u.submittedAt).toLocaleString()}
                    </p>
                  </div>

                  {/* APPROVE / REJECT BUTTONS */}
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handleReject(u.id, u.full_name)}
                      className="flex-1 md:flex-initial bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold px-4 py-2 rounded-lg uppercase"
                    >
                      REJECT
                    </button>
                    <button
                      onClick={() => handleApprove(u.id, u.full_name)}
                      className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2 rounded-lg uppercase shadow-lg shadow-emerald-950/50"
                    >
                      APPROVE ACCESS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}