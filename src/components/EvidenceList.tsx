import React, { useState, useEffect } from 'react';

export interface DashboardUserProfile {
  full_name: string;
  username: string;
  badge_number: string;
  email: string;
  department: string;
  identity_verified: boolean;
}

interface EvidenceItem {
  id: string;
  case_number: string;
  category: string;
  description: string;
  current_location: string;
  current_custodian: string;
  created_at: string;
  block_count?: number;
}

interface EvidenceListProps {
  currentUser: DashboardUserProfile;
  onSelectEvidence: (evidenceId: string) => void;
  onNewTransfer: () => void;
}

export default function EvidenceList({
  currentUser,
  onSelectEvidence,
  onNewTransfer,
}: EvidenceListProps) {
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all evidence records from backend
  useEffect(() => {
    let isMounted = true;

    const fetchAllEvidence = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://https://echainos-backend.onrender.com/api/evidence');
        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
          // Group blocks by evidenceId to construct a master evidence list
          const evidenceMap: { [key: string]: EvidenceItem } = {};

          data.forEach((payload: any) => {
            const evId = payload.evidenceId;
            if (!evId) return;

            if (!evidenceMap[evId]) {
              evidenceMap[evId] = {
                id: evId,
                case_number: payload.caseNumber || 'N/A',
                category: payload.category || payload.itemCategory || 'General',
                description: payload.notes || payload.description || 'No details',
                current_location: payload.location || 'Central Vault',
                current_custodian: payload.releasingOfficer || 'Unknown',
                created_at: payload.serverTimestamp || new Date().toISOString(),
                block_count: 1,
              };
            } else {
              // Update latest location, custodian, and increment block count
              evidenceMap[evId].current_location = payload.location || evidenceMap[evId].current_location;
              evidenceMap[evId].current_custodian = payload.releasingOfficer || evidenceMap[evId].current_custodian;
              evidenceMap[evId].block_count = (evidenceMap[evId].block_count || 1) + 1;
            }
          });

          if (isMounted) {
            setEvidenceItems(Object.values(evidenceMap));
          }
        }
      } catch (err) {
        console.error('Failed to load evidence registry:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAllEvidence();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter items based on search query
  const filteredItems = evidenceItems.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.current_custodian.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold font-mono text-slate-100 uppercase tracking-wider">
            Evidence Registry
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Active Cases & Immutable Ledger Records
          </p>
        </div>

        <button
          onClick={onNewTransfer}
          className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50"
        >
          <span>+ Log Custody Transfer</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Evidence Tag, Case Number, Officer, or Category..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
        />
      </div>

      {/* Table / Registry View */}
      {isLoading ? (
        <div className="text-center py-12 font-mono text-slate-400 text-xs">
          <span className="inline-block w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mr-2 align-middle" />
          Loading evidence ledger...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 font-mono text-slate-500 text-xs">
          {searchTerm ? 'No evidence items match your search filter.' : 'No registered evidence found in the ledger.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-2">Evidence Tag</th>
                <th className="pb-3 px-2">Case #</th>
                <th className="pb-3 px-2">Category</th>
                <th className="pb-3 px-2">Location</th>
                <th className="pb-3 px-2">Custodian</th>
                <th className="pb-3 px-2 text-center">Blocks</th>
                <th className="pb-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-900/50 transition-colors group cursor-pointer"
                  onClick={() => onSelectEvidence(item.id)}
                >
                  <td className="py-3.5 px-2 font-bold text-cyan-400 group-hover:text-cyan-300">
                    {item.id}
                  </td>
                  <td className="py-3.5 px-2 text-slate-300">{item.case_number}</td>
                  <td className="py-3.5 px-2 text-slate-400">
                    <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[10px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-slate-300">{item.current_location}</td>
                  <td className="py-3.5 px-2 text-slate-400">{item.current_custodian}</td>
                  <td className="py-3.5 px-2 text-center">
                    <span className="bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {item.block_count || 1}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvidence(item.id);
                      }}
                      className="text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1 rounded-lg transition"
                    >
                      Audit Chain →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}