import React, { useState, useEffect } from 'react';
import EvidenceReportModal from './EvidenceReportModal.tsx';
import EvidenceTagModal, { EvidenceLog } from './EvidenceTagModal.tsx';

export default function COCTimeline() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterId, setFilterId] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [reportEvidenceId, setReportEvidenceId] = useState<string | null>(null);

  // Fetch timeline logs from backend
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://https://echainos-backend.onrender.com/api/timeline');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs based on search query
  const filteredLogs = logs.filter((log) => {
    const query = filterId.toLowerCase();
    return (
      log.evidence_id?.toLowerCase().includes(query) ||
      log.to_user_name?.toLowerCase().includes(query) ||
      log.from_user_name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl text-white space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-700 pb-4">
        <div>
          <h3 className="text-lg font-bold text-green-400">📜 Audit Timeline</h3>
          <p className="text-xs text-gray-400 mt-0.5">Click any log entry to view full metadata or generate PDF reports.</p>
        </div>

        {/* Filter Input */}
        <input
          type="text"
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
          placeholder="🔍 Filter by Evidence ID or Name..."
          className="bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-green-500 w-full sm:w-64"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-xs">Loading audit records...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-xs">No custody logs recorded yet.</div>
      ) : (
        <div className="relative border-l-2 border-green-500/30 ml-4 space-y-6 py-2">
          {filteredLogs.map((log, index) => (
            <div key={log.id || index} className="relative pl-6 group">
              {/* Timeline Bullet Node */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-green-500 border-4 border-gray-800 group-hover:scale-125 transition-transform" />

              {/* Interactive Log Card */}
              <div 
                onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                className="bg-gray-900 border border-gray-700 hover:border-green-500/50 p-4 rounded-lg cursor-pointer transition shadow-md hover:shadow-green-900/20"
              >
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-green-400 text-sm">{log.evidence_id}</span>
                      <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded border border-gray-700">
                        {log.event_type || 'Transferred'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">
                      <strong className="text-white">{log.from_user_name || 'System'}</strong> ➔ <strong className="text-white">{log.to_user_name}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">{log.timestamp || 'N/A'}</span>
                    <span className="text-[10px] text-green-400 underline font-semibold mt-1 block">
                      {selectedLog?.id === log.id ? '▼ Hide Details' : '▶ Expand Details'}
                    </span>
                  </div>
                </div>

                {/* Expanded Interactive View */}
                {selectedLog?.id === log.id && (
                  <div className="mt-4 pt-3 border-t border-gray-800 text-xs space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-950 p-3 rounded border border-gray-800">
                      <p><strong className="text-gray-400">Location:</strong> {log.location || 'N/A'}</p>
                      <p><strong className="text-gray-400">Seal Tag #:</strong> {log.seal_number || 'N/A'}</p>
                      <p><strong className="text-gray-400">Condition:</strong> {log.condition || 'Intact'}</p>
                      <p><strong className="text-gray-400">Category:</strong> {log.category || 'General'}</p>
                    </div>

                    {log.notes && (
                      <p className="text-gray-300"><strong className="text-gray-400">Notes:</strong> {log.notes}</p>
                    )}

                    {/* Attachments Preview */}
                    <div className="flex flex-wrap gap-4 pt-1">
                      {log.photo && (
                        <div>
                          <p className="text-[10px] text-gray-400 mb-1">Attached Photo:</p>
                          <img src={log.photo} alt="Evidence" className="w-20 h-20 object-cover rounded border border-gray-700" />
                        </div>
                      )}
                      {log.signature && (
                        <div>
                          <p className="text-[10px] text-gray-400 mb-1">Digital Signature:</p>
                          <img src={log.signature} alt="Signature" className="w-28 h-14 bg-white object-contain rounded border border-gray-700 p-1" />
                        </div>
                      )}
                    </div>

                    {/* Quick PDF Report Trigger */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportEvidenceId(log.evidence_id);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded transition flex items-center gap-1.5"
                      >
                        📄 Print E-COC PDF Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Export Modal Triggered from Timeline */}
      {reportEvidenceId && (
        <EvidenceReportModal
          evidenceId={reportEvidenceId}
          logs={logs.filter((l) => l.evidence_id === reportEvidenceId)}
          onClose={() => setReportEvidenceId(null)}
        />
      )}
    </div>
  );
}