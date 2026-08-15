import React, { useState } from 'react';
import QRScanner from './QRScanner.tsx';

interface EvidenceLookupProps {
  title: string;
  subtitle: string;
  onSelectEvidenceId: (evidenceId: string) => void;
}

export default function EvidenceLookup({ title, subtitle, onSelectEvidenceId }: EvidenceLookupProps) {
  const [inputMode, setInputMode] = useState<'camera' | 'manual'>('camera');
  const [manualId, setManualId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Manual Text Submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) {
      setErrorMsg('Please enter a valid Evidence ID.');
      return;
    }
    setErrorMsg(null);
    onSelectEvidenceId(manualId.trim().toUpperCase());
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl max-w-lg mx-auto shadow-2xl space-y-5">
      {/* Title Header */}
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-green-400">{title}</h2>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>

      {/* Input Mode Selector Tabs */}
      <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700 text-xs font-bold">
        <button
          type="button"
          onClick={() => { setInputMode('camera'); setErrorMsg(null); }}
          className={`flex-1 py-2 rounded transition flex items-center justify-center gap-1.5 ${
            inputMode === 'camera' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          📷 Camera / Upload
        </button>

        <button
          type="button"
          onClick={() => { setInputMode('manual'); setErrorMsg(null); }}
          className={`flex-1 py-2 rounded transition flex items-center justify-center gap-1.5 ${
            inputMode === 'manual' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          ⌨️ Type Evidence ID
        </button>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-red-950/80 border border-red-800 text-red-200 text-xs p-3 rounded">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* OPTION 1 & 2: CAMERA SCANNER + FILE UPLOAD */}
      {inputMode === 'camera' && (
        <QRScanner
          onScanSuccess={(scannedText) => {
            onSelectEvidenceId(scannedText.trim().toUpperCase());
          }}
          onClose={() => setInputMode('manual')}
        />
      )}

      {/* OPTION 3: MANUAL TEXT INPUT */}
      {inputMode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Evidence ID / Barcode Serial Number
            </label>
            <input
              type="text"
              placeholder="e.g. EV-2026-90142"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-sm text-white font-mono focus:outline-none focus:border-green-500 uppercase placeholder:normal-case"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-500 font-bold text-white text-xs py-3 rounded transition cursor-pointer"
          >
            🔍 Find & Load Evidence Record
          </button>
        </form>
      )}
    </div>
  );
}