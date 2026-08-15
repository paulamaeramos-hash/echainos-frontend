import React from 'react';

export interface EvidenceLog {
  evidence_id: string;
  event_type: string;
  from_user_name?: string;
  to_user_name?: string;
  timestamp?: string;
  qr_code?: string;
  notes?: string;
  hash?: string;
}

interface EvidenceTagModalProps {
  log: EvidenceLog | null;
  onClose: () => void;
}

export default function EvidenceTagModal({ log, onClose }: EvidenceTagModalProps) {
  if (!log) return null;

  const handlePrintTag = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=700');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Evidence Tag - ${log.evidence_id || ''}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #fff; color: #000; }
            .tag-box { border: 3px solid #000; padding: 20px; max-width: 450px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
            .header p { margin: 3px 0 0; font-size: 11px; }
            .qr-section { text-align: center; margin: 15px 0; }
            .qr-section img { width: 160px; height: 160px; }
            .field { font-size: 12px; margin-bottom: 8px; }
            .field-title { font-weight: bold; text-transform: uppercase; }
            .hash-box { background: #f0f0f0; padding: 6px; font-family: monospace; font-size: 9px; word-break: break-all; margin-top: 10px; border: 1px dashed #666; }
            .footer { text-align: center; margin-top: 15px; font-size: 9px; border-top: 1px solid #ccc; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="tag-box">
            <div class="header">
              <h2>OFFICIAL EVIDENCE TAG</h2>
              <p>E-COC Forensic Chain of Custody System</p>
            </div>
            <div class="field"><span class="field-title">EVIDENCE ID:</span> ${log.evidence_id || 'N/A'}</div>
            <div class="field"><span class="field-title">EVENT TYPE:</span> ${log.event_type || 'N/A'}</div>
            <div class="field"><span class="field-title">SENDER / FROM:</span> ${log.from_user_name || 'N/A'}</div>
            <div class="field"><span class="field-title">CUSTODIAN / TO:</span> ${log.to_user_name || 'N/A'}</div>
            <div class="field"><span class="field-title">TIMESTAMP:</span> ${log.timestamp || new Date().toLocaleString()}</div>

            <div class="qr-section">
              ${log.qr_code ? `<img src="${log.qr_code}" alt="QR Code" />` : '<p style="font-size: 10px;">[No QR Code Available]</p>'}
              <p style="font-size: 10px; margin-top: 4px;">Scan tag to verify chain integrity</p>
            </div>

            ${log.notes ? `<div class="field"><span class="field-title">REMARKS:</span> ${log.notes}</div>` : ''}

            <div class="hash-box">
              <strong>SHA-256 SEAL:</strong><br/>${log.hash || 'N/A'}
            </div>

            <div class="footer">
              WARNING: Tampering with this tag invalidates the verified chain of custody.
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full space-y-4 text-white shadow-2xl">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-lg font-bold text-green-400">🏷️ Official Evidence Tag</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <div className="bg-gray-900 border border-green-500/40 p-4 rounded-lg space-y-3">
          <div className="text-center border-b border-gray-800 pb-2">
            <span className="text-xs font-mono text-green-400">EVIDENCE ID</span>
            <p className="text-2xl font-black font-mono text-white tracking-wider">{log.evidence_id}</p>
          </div>

          <div className="flex items-center justify-center bg-white p-3 rounded-lg my-2">
            {log.qr_code ? (
              <img src={log.qr_code} alt="Evidence QR Code" className="w-40 h-40 object-contain" />
            ) : (
              <div className="text-gray-500 text-xs py-10 text-center">No QR Code Generated</div>
            )}
          </div>

          <div className="text-xs space-y-1.5 text-gray-300 font-sans">
            <p><strong className="text-gray-100">Event:</strong> {log.event_type}</p>
            <p><strong className="text-gray-100">From:</strong> {log.from_user_name || 'N/A'}</p>
            <p><strong className="text-gray-100">Custodian:</strong> {log.to_user_name || 'N/A'}</p>
            <p><strong className="text-gray-100">Date:</strong> {log.timestamp || new Date().toLocaleString()}</p>
            {log.notes && <p><strong className="text-gray-100">Notes:</strong> {log.notes}</p>}
          </div>

          <div className="bg-gray-950 p-2 rounded border border-gray-800 mt-2">
            <span className="text-[10px] text-green-400 font-mono block truncate">
              🔒 SHA-256: {log.hash || 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handlePrintTag}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 rounded-lg transition text-sm flex items-center justify-center gap-2"
          >
            🖨️ Print Evidence Tag
          </button>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}