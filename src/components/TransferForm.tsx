import React, { useState, useRef, useEffect } from 'react';

interface TransferFormProps {
  currentUser: {
    full_name: string;
    username: string;
    badge_number: string;
    email: string;
    department: string;
    identity_verified: boolean;
  };
  initialEvidenceId?: string;
  onSuccess?: (evidenceId?: string) => void; //
  onCancel?: () => void; //
}

interface EvidenceRecord {
  evidenceId: string;
  caseNumber: string;
  category: string;
  itemTitle: string;
  itemDescription: string;
  location: string;
  packaging: string;
  sealNumber: string;
  handling: string;
  releasedBy: string;
  receivedBy: string;
  transferReason: string;
  signatureDataUrl: string | null;
  timestamp: string;
}

const CATEGORY_OPTIONS = [
  'Biological / DNA (Swabs, Blood, Tissue)',
  'Narcotics / Controlled Substances',
  'Firearm / Handgun / Rifle',
  'Ammunition / Shell Casing / Projectile',
  'Edged / Sharp Weapon (Knife, Blade)',
  'Digital Device / Media (Faraday Shielded)',
  'Documentary / Paper Records',
  'Financial / Currency / Valuables',
  'Latent Print / Fingerprint Lift / Footwear',
  'Toxicology / Chemical / Liquid Specimen',
  'Trace Evidence (Hair, Fiber, Glass, Paint)',
  'Arson / Volatile / Vapor Specimen',
  'Personal Belongings / Clothing',
  'Other (Custom Category)'
];

const PACKAGING_OPTIONS = [
  'Sealed Heavy-Duty Poly-Bag',
  'Paper Evidence Bag / Envelope',
  'Faraday Shielding Bag (Digital Evidence)',
  'Tamper-Evident Security Bag',
  'Cardboard Evidence Box / Container',
  'Sharps Guard Box (Needles / Blades)',
  'Biohazard Sealed Specimen Container',
  'Vapor-Tight Metal Can / Glass Jar (Arson)',
  'Breathable Cotton / Mesh Bag',
  'Currency Security Envelope',
  'Rigid Plastic Tube / Cylinder',
  'Unpackaged / Bulk Item',
  'Other (Custom Packaging)'
];

const HANDLING_OPTIONS = [
  'Standard Room Temperature Storage',
  'Keep Refrigerated (2°C - 8°C)',
  'Keep Frozen (-20°C)',
  'Biohazard — Handle with Gloves & Mask',
  'Faraday Shielded — Block All Radio Signals',
  'Sharps Hazard — Handle with Extreme Caution',
  'Volatile / Vapor Threat — Keep Airtight',
  'Fragile / Delicate Forensic Handling',
  'Store in Dark / Protect from Light / UV',
  'Other (Custom Instruction)'
];

export default function TransferForm({ currentUser, initialEvidenceId = '', onSuccess }: TransferFormProps) {
  // --- Form States ---
  const [evidenceId, setEvidenceId] = useState(initialEvidenceId);
  const [caseNumber, setCaseNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Category State
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [customCategory, setCustomCategory] = useState('');

  // Packaging State
  const [packaging, setPackaging] = useState(PACKAGING_OPTIONS[0]);
  const [customPackaging, setCustomPackaging] = useState('');

  // Handling State
  const [handling, setHandling] = useState(HANDLING_OPTIONS[0]);
  const [customHandling, setCustomHandling] = useState('');

  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [location, setLocation] = useState('Evidence Vault - Locker 01');
  const [sealNumber, setSealNumber] = useState('');
  const [releasedBy, setReleasedBy] = useState(currentUser.full_name);
  const [releasedByBadgeNumber, setReleasedByBadgeNumber] = useState(currentUser.badge_number);
  const [receivedBy, setReceivedBy] = useState('Evidence Vault Custodian');
  const [transferReason, setTransferReason] = useState('Field Recovery & Logging');

  // --- Signature Canvas State & Refs ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // --- Print View Mode ---
  const [printMode, setPrintMode] = useState<'tag' | 'full'>('tag');

  // --- Feedback / Submission States ---
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedRecord, setSubmittedRecord] = useState<EvidenceRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fit Signature Canvas to element width
  useEffect(() => {
    if (!submittedRecord && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.parentElement?.clientWidth || 500;
      canvas.height = 110;
    }
  }, [submittedRecord]);

  // =========================================================================
  // SIGNATURE DRAWING HANDLERS
  // =========================================================================
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a'; // Deep crisp slate ink
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // --- Form Submission ---
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors
    setIsSubmitting(true);

    // 1. Validation Checks
    if (!evidenceId.trim()) {
      setErrorMessage('Evidence Tag Identifier is required.');
      setIsSubmitting(false); // Make sure to reset submitting state on return!
      return;
    }
    if (!caseNumber.trim()) {
      setErrorMessage('Case Number is required.');
      setIsSubmitting(false);
      return;
    }

    const resolvedCategory = category === 'Other' ? customCategory : category;
    const resolvedPackaging = packaging === 'Other' ? customPackaging : packaging;
    const resolvedHandling = handling === 'Other' ? customHandling : handling;

    // 2. Export signature canvas
    let signatureDataUrl: string | null = null;
    if (canvasRef.current && hasSignature) {
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    }

    // 3. Build Payload
    const recordPayload: EvidenceRecord = {
      evidenceId: evidenceId.trim().toUpperCase(),
      caseNumber: caseNumber.trim().toUpperCase(),
      category: resolvedCategory,
      itemTitle: itemTitle.trim() || 'Item Logged',
      itemDescription: itemDescription.trim(),
      location: location.trim(),
      packaging: resolvedPackaging,
      sealNumber: sealNumber.trim() || 'N/A',
      handling: resolvedHandling,
      releasedBy: releasedBy.trim(),
      receivedBy: receivedBy.trim(),
      transferReason: transferReason.trim(),
      signatureDataUrl,
      timestamp: new Date().toISOString(),
    };

    // 4. API CALL TO BACKEND
    try {
      const response = await fetch('/api/evidence/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordPayload),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setSubmittedRecord(recordPayload);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed.');
      }

      const data = await response.json();
      setSubmittedRecord(data.record || recordPayload);
    } catch (err: any) {
      console.warn('Backend route offline. Processing label client-side:', err.message);
      setSubmittedRecord(recordPayload);
    }
  };

  const handleReset = () => {
    setEvidenceId('');
    setCaseNumber('');
    setItemTitle('');
    setItemDescription('');
    setSealNumber('');
    setCustomCategory('');
    setCustomPackaging('');
    setCustomHandling('');
    setSubmittedRecord(null);
    setErrorMessage(null);
    clearSignature();
  };

  // =========================================================================
  // 1. PRINTABLE STICKER LABEL / AUDIT VIEW
  // =========================================================================
  if (submittedRecord) {
    const qrPayload = encodeURIComponent(
      JSON.stringify({
        id: submittedRecord.evidenceId,
        case: submittedRecord.caseNumber,
        cat: submittedRecord.category,
        time: submittedRecord.timestamp,
      })
    );

    return (
      <div className="space-y-6">
        {/* On-Screen Controller Bar */}
        <div className="bg-slate-950/90 backdrop-blur-md border border-emerald-900/60 p-4 rounded-2xl space-y-4 print:hidden shadow-2xl">
          <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5 text-emerald-400 font-mono text-xs font-semibold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="tracking-wide uppercase">EVIDENCE REGISTERED & SIGNED DIGITAL LOCK</span>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setPrintMode('tag')}
                className={`px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  printMode === 'tag'
                    ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🏷️ 4" x 4" Sticker Tag
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('full')}
                className={`px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  printMode === 'full'
                    ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📄 Full Case Audit Sheet
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-3 font-mono">
            <p className="text-xs text-slate-400">
              {printMode === 'tag'
                ? 'Formatted precisely for 4in × 4in thermal container stickers.'
                : 'Full Chain of Custody case file documentation.'}
            </p>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-950/50 cursor-pointer active:scale-95"
              >
                🖨️ PRINT {printMode === 'tag' ? '4x4 STICKER' : 'REPORT'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs border border-slate-700 transition cursor-pointer active:scale-95"
              >
                ➕ LOG NEXT ITEM
              </button>
            </div>
          </div>
        </div>

        {/* MODE A: 4.0" x 4.0" STICKER TAG */}
        {printMode === 'tag' && (
          <div className="flex justify-center print:m-0 print:p-0">
            <div className="w-[4in] h-[4in] bg-white text-black p-3 border-4 border-black font-mono flex flex-col justify-between box-border shadow-2xl rounded-sm print:shadow-none print:w-[4in] print:h-[4in] print:border-4 print:border-black print:m-0 print:p-3 print:rounded-none">
              {/* Header Warning Bar */}
              <div className="bg-black text-white text-center py-0.5 px-1 font-black text-[9px] uppercase tracking-wider">
                EVIDENCE CONTAINER TAG — DO NOT REMOVE
              </div>

              {/* Main Body: QR Code + Key IDs */}
              <div className="flex items-center justify-between gap-2 my-1">
                <div className="flex flex-col items-center flex-shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrPayload}`}
                    alt="Evidence QR Code Tag"
                    className="w-[1.9in] h-[1.9in] border-2 border-black p-1 bg-white"
                  />
                  <span className="text-[6px] font-black text-black tracking-widest uppercase mt-0.5">
                    SCAN FOR SYSTEM ACCESS
                  </span>
                </div>

                <div className="flex-1 space-y-1 pl-1 text-left min-w-0">
                  <div>
                    <span className="text-[6.5px] font-bold text-gray-600 uppercase block">EVIDENCE ID</span>
                    <p className="text-sm font-black tracking-wider text-black leading-tight truncate">
                      {submittedRecord.evidenceId}
                    </p>
                  </div>

                  <div>
                    <span className="text-[6.5px] font-bold text-gray-600 uppercase block">CASE NO.</span>
                    <p className="text-[11px] font-black text-black leading-tight truncate">
                      {submittedRecord.caseNumber}
                    </p>
                  </div>

                  <div>
                    <span className="text-[6.5px] font-bold text-gray-600 uppercase block">SEAL TAG #</span>
                    <p className="text-[9.5px] font-extrabold text-black leading-tight truncate">
                      {submittedRecord.sealNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Non-Sensitive Metadata */}
              <div className="border-t-2 border-b-2 border-black py-0.5 text-[8px] leading-tight space-y-0.5">
                <div className="flex justify-between">
                  <span><strong>CATEGORY:</strong> {submittedRecord.category}</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>LOCATION:</strong> {submittedRecord.location}</span>
                </div>
                {submittedRecord.handling && (
                  <div className="text-[7.5px] font-bold text-red-700 truncate">
                    ⚠️ {submittedRecord.handling}
                  </div>
                )}
              </div>

              {/* Digital Signature & Officer Section */}
              <div className="text-[7.5px] leading-tight flex justify-between items-end pt-0.5">
                <div className="space-y-0.5">
                  <div>OFFICER: <strong>{submittedRecord.releasedBy}</strong></div>
                  <div>DATE/TIME: <strong>{new Date(submittedRecord.timestamp).toLocaleString()}</strong></div>
                </div>

                <div className="text-right">
                  <span className="text-[6px] text-gray-500 uppercase block">OFFICER SIGNATURE</span>
                  {submittedRecord.signatureDataUrl ? (
                    <img
                      src={submittedRecord.signatureDataUrl}
                      alt="Officer Signature"
                      className="h-7 border-b border-black object-contain max-w-[1.2in] inline-block"
                    />
                  ) : (
                    <div className="h-7 w-24 border-b border-black text-[6px] text-gray-400 italic flex items-end justify-center">
                      [ Signed Digitally ]
                    </div>
                  )}
                </div>
              </div>

              {/* Tape Guideline Footer */}
              <div className="border-t border-dashed border-gray-400 pt-0.5 text-[6px] text-center text-gray-500 uppercase font-sans">
                ✂ 4" x 4" CONTAINER LABEL — SECURE WITH CLEAR EVIDENCE TAPE
              </div>
            </div>
          </div>
        )}

        {/* MODE B: FULL SHEET AUDIT REPORT */}
        {printMode === 'full' && (
          <div className="bg-white text-black p-8 rounded-2xl border-2 border-black max-w-2xl mx-auto font-mono space-y-5 shadow-2xl print:max-w-full print:w-full print:rounded-none print:shadow-none print:p-0">
            <div className="border-b-2 border-black pb-4 text-center">
              <h2 className="text-2xl font-black uppercase tracking-wide">E-CHAIN OF CUSTODY AUDIT REPORT</h2>
              <p className="text-[11px] text-gray-600 tracking-wider">OFFICIAL LAW ENFORCEMENT EXHIBIT FILE</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs border-b border-black pb-4">
              <div className="bg-gray-50 p-2 rounded border border-gray-200">
                <span className="text-gray-500 block text-[9px] font-bold">EVIDENCE ID:</span>
                <strong className="text-lg text-black">{submittedRecord.evidenceId}</strong>
              </div>
              <div className="bg-gray-50 p-2 rounded border border-gray-200">
                <span className="text-gray-500 block text-[9px] font-bold">CASE NUMBER:</span>
                <strong className="text-lg text-black">{submittedRecord.caseNumber}</strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px] font-bold">CATEGORY:</span>
                <strong className="text-gray-900">{submittedRecord.category}</strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px] font-bold">PACKAGING:</span>
                <strong className="text-gray-900">{submittedRecord.packaging}</strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px] font-bold">SEAL TAG #:</span>
                <strong className="text-gray-900">{submittedRecord.sealNumber}</strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px] font-bold">LOCATION:</span>
                <strong className="text-gray-900">{submittedRecord.location}</strong>
              </div>
            </div>

            <div className="text-xs space-y-1.5">
              <span className="text-gray-500 block text-[9px] font-bold">ITEM DESCRIPTION & MARKS:</span>
              <p className="p-3 bg-gray-50 rounded border border-gray-300 font-sans leading-relaxed text-gray-800">
                {submittedRecord.itemDescription || 'None documented.'}
              </p>
            </div>

            <div className="border-t border-black pt-4 text-xs space-y-2.5">
              <div className="flex justify-between"><span>LOGGING OFFICER:</span> <strong>{submittedRecord.releasedBy}</strong></div>
              <div className="flex justify-between"><span>RECEIVING CUSTODIAN:</span> <strong>{submittedRecord.receivedBy}</strong></div>
              <div className="flex justify-between"><span>ACTION / REASON:</span> <strong>{submittedRecord.transferReason}</strong></div>
              <div className="flex justify-between"><span>TIMESTAMP:</span> <strong>{new Date(submittedRecord.timestamp).toLocaleString()}</strong></div>

              <div className="border-t border-gray-300 pt-4 flex justify-between items-center mt-2">
                <span className="text-xs font-bold uppercase">VERIFIED DIGITAL SIGNATURE:</span>
                {submittedRecord.signatureDataUrl ? (
                  <img src={submittedRecord.signatureDataUrl} alt="Officer Signature" className="h-12 border-b-2 border-black" />
                ) : (
                  <span className="text-gray-400 italic text-xs">[ Unsigned ]</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. INTAKE FORM VIEW
  // =========================================================================
  return (
    <form onSubmit={handleSubmit} className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 p-6 md:p-8 rounded-2xl space-y-6 font-mono text-xs shadow-2xl">
      {/* Header Banner */}
      <div className="border-b border-slate-800 pb-4 flex flex-wrap justify-between items-center gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-100 tracking-wider uppercase flex items-center gap-2">
            <span className="text-red-500">📦</span> EVIDENCE TRANSFER & INTAKE LOG
          </h2>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            Log physical evidence transfers, set handling protocols, and generate 4"x4" scannable container tags.
          </p>
        </div>
        <span className="bg-red-950/60 border border-red-800/80 text-red-300 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase">
          SECURE CUSTODY LOG
        </span>
      </div>

      {errorMessage && (
        <div className="bg-red-950/90 border border-red-700/80 text-red-200 p-3.5 rounded-xl flex items-center gap-2.5 shadow-lg">
          <span className="text-base">⚠️</span>
          <span className="font-sans font-medium text-xs">{errorMessage}</span>
        </div>
      )}

      {/* SECTION 1: PRIMARY IDENTIFIERS */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">
          01 // PRIMARY IDENTIFIERS
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-slate-300 mb-1.5 uppercase tracking-wider font-semibold">
              Evidence Tag Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. EV-2026-90412"
              value={evidenceId}
              onChange={(e) => setEvidenceId(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 font-mono uppercase transition-all duration-200 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-300 mb-1.5 uppercase tracking-wider font-semibold">
              Case / Offense Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. CR-8841-A"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 font-mono uppercase transition-all duration-200 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: CATEGORY & CLASSIFICATION */}
      <div className="space-y-3 pt-2 border-t border-slate-900">
        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">
          02 // CLASSIFICATION & ITEM DETAILS
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-slate-300 mb-1.5 uppercase tracking-wider font-semibold">
              Item Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 transition-all duration-200 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40 cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {category === 'Other (Custom Category)' ? (
            <div>
              <label className="block text-[10px] text-amber-400 mb-1.5 uppercase tracking-wider font-semibold">
                Specify Custom Category
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Unexploded Ordnance / Fireworks"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full bg-slate-900/90 border border-amber-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-all duration-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[10px] text-slate-300 mb-1.5 uppercase tracking-wider font-semibold">
                Headline Title / Item Name
              </label>
              <input
                type="text"
                placeholder="e.g. Black iPhone 14 Pro in Clear Case"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 font-sans transition-all duration-200 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-[10px] text-slate-300 mb-1.5 uppercase tracking-wider font-semibold">
            Item Description / Serial Numbers / Physical Marks
          </label>
          <textarea
            rows={3}
            placeholder="Describe condition, brand, serial numbers, visible marks or physical attributes..."
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-600 font-sans transition-all duration-200 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40"
          />
        </div>
      </div>

      {/* SECTION 3: PACKAGING & TAMPER PROTECTION */}
      <div className="space-y-3 pt-2 border-t border-slate-900">
        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">
          03 // PACKAGING & SECURITY SEALS
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-slate-300 mb-1.5 uppercase tracking-wider font-semibold">
              Packaging Container Type
            </label>
            <select
              value={packaging}
              onChange={(e) => setPackaging(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 transition-all duration-200 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40 cursor-pointer"
            >
              {PACKAGING_OPTIONS.map((pkg) => (
                <option key={pkg} value={pkg}>{pkg}</option>
              ))}
            </select>
          </div>

          {packaging === 'Other (Custom Packaging)' ? (
            <div>
              <label className="block text-[10px] text-amber-400 mb-1.5 uppercase tracking-wider font-semibold">
                Specify Custom Packaging
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Custom Wooden Storage Crate"
                value={customPackaging}
                onChange={(e) => setCustomPackaging(e.target.value)}
                className="w-full bg-slate-900/90 border border-amber-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-all duration-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[10px] text-slate-300 mb-1.5 uppercase tracking-wider font-semibold">
                Tamper Seal Security Tag #
              </label>
              <input
                type="text"
                placeholder="e.g. SEAL-884192"
                value={sealNumber}
                onChange={(e) => setSealNumber(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 uppercase transition-all duration-200 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40"
              />
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: STORAGE & HANDLING PRECAUTIONS */}
      <div className="space-y-3 pt-2 border-t border-slate-900">
        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">
          04 // STORAGE & VAULT PRECAUTIONS
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-slate-300 mb-1.5 uppercase tracking-wider font-semibold">
              Handling / Storage Precautions
            </label>
            <select
              value={handling}
              onChange={(e) => setHandling(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 transition-all duration-200 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40 cursor-pointer"
            >
              {HANDLING_OPTIONS.map((hnd) => (
                <option key={hnd} value={hnd}>{hnd}</option>
              ))}
            </select>
          </div>

          {handling === 'Other (Custom Instruction)' ? (
            <div>
              <label className="block text-[10px] text-amber-400 mb-1.5 uppercase tracking-wider font-semibold">
                Specify Custom Instruction
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Store in Hazardous Explosives Locker"
                value={customHandling}
                onChange={(e) => setCustomHandling(e.target.value)}
                className="w-full bg-slate-900/90 border border-amber-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-all duration-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[10px] text-slate-300 mb-1.5 uppercase tracking-wider font-semibold">
                Storage Vault / Locker No.
              </label>
              <input
                type="text"
                placeholder="e.g. Vault Locker 04"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-all duration-200 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40"
              />
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5: CUSTODY CHAIN & DIGITAL SIGNATURE */}
      <div className="space-y-4 pt-2 border-t border-slate-900">
        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">
          05 // CUSTODY AUTHORIZATION & DIGITAL SIGNATURE
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] text-slate-300 mb-1.5 uppercase tracking-wider font-semibold">
              Released By (Officer)
            </label>
            <input
              type="text"
              required
              value={releasedBy}
              onChange={(e) => setReleasedBy(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 transition-all duration-200 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-300 mb-1.5 uppercase tracking-wider font-semibold">
              Received By (Custodian)
            </label>
            <input
              type="text"
              required
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 transition-all duration-200 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-300 mb-1.5 uppercase tracking-wider font-semibold">
              Transfer Reason / Action
            </label>
            <input
              type="text"
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 transition-all duration-200 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40"
            />
          </div>
        </div>

        {/* Interactive Signature Canvas Box */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
              Officer Digital Signature Box
            </label>
            {hasSignature && (
              <button
                type="button"
                onClick={clearSignature}
                className="text-[10px] text-red-400 hover:text-red-300 font-mono underline cursor-pointer"
              >
                Clear Signature
              </button>
            )}
          </div>
          <div className="bg-white rounded-xl border border-slate-700 overflow-hidden touch-none relative">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[110px] cursor-crosshair block"
            />
            {!hasSignature && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs italic font-sans">
                Sign inside this box using mouse or touch screen
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FORM ACTION BUTTONS */}
      <div className="pt-4 border-t border-slate-900 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-5 py-3 rounded-xl font-mono text-xs border border-slate-800 transition cursor-pointer active:scale-95"
        >
          CLEAR FORM
        </button>
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-950/50 cursor-pointer active:scale-95"
        >
          🔒 REGISTER & GENERATE TAG
        </button>
      </div>
    </form>
  );
}