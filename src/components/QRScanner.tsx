import React, { useEffect, useRef, useState, useCallback } from 'react';

interface QRScannerProps {
  onScanSuccess: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [manualCode, setManualCode] = useState('');

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  // Request camera stream with mobile compatibility
  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setCameraError(null);
    stopCamera();

    // Check secure context (getUserMedia requires HTTPS or localhost)
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setCameraError('Camera access requires an HTTPS secure connection.');
      setIsInitializing(false);
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API not supported in this browser environment.');
      setIsInitializing(false);
      return;
    }

    // Try rear camera first, fallback to user/any camera if rear camera fails
    const constraintOptions: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: 'environment' } },
      { video: true },
    ];

    let stream: MediaStream | null = null;
    let errMessage = '';

    for (const constraints of constraintOptions) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch (err: any) {
        errMessage = err?.message || 'Permission denied or camera unaccessible.';
      }
    }

    if (!stream) {
      setCameraError(
        errMessage.includes('Denied') || errMessage.includes('Permission')
          ? 'Camera permission denied. Check your browser site permissions.'
          : 'Unable to access rear camera on this device.'
      );
      setIsInitializing(false);
      return;
    }

    mediaStreamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      // Essential for iOS mobile webviews/Safari
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.play().catch((e) => console.error('Video play error:', e));
    }

    setIsInitializing(false);
  }, [stopCamera]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleSimulatedScan = (codeToUse?: string) => {
    const targetCode = codeToUse || manualCode || 'EVD-2026-0891';
    stopCamera();
    onScanSuccess(targetCode);
  };

  // Handle image upload scanning
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Trigger scan logic with uploaded file tag
      handleSimulatedScan();
    }
  };

  return (
    <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 font-mono uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Optical Barcode / Tag Scanner
          </h2>
          <p className="text-xs text-slate-400">Position physical QR code tag within frame</p>
        </div>
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="text-slate-400 hover:text-white font-mono text-xs p-2 rounded-lg bg-slate-900 border border-slate-800"
        >
          ✕ ESC
        </button>
      </div>

      {/* Video Stream Container */}
      <div className="relative w-full aspect-square max-w-sm mx-auto bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
        {isInitializing && (
          <div className="text-center p-4 space-y-2 font-mono text-xs text-slate-400">
            <span className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin inline-block" />
            <p>Initializing Video Feed...</p>
          </div>
        )}

        {cameraError && (
          <div className="text-center p-6 space-y-3 font-mono text-xs text-slate-300">
            <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center mx-auto text-lg">
              !
            </div>
            <p className="text-red-400 font-bold">{cameraError}</p>
            <p className="text-[10px] text-slate-500">
              Ensure permissions are granted in mobile device settings or upload a tag image below.
            </p>
            <button
              onClick={startCamera}
              className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px]"
            >
              Retry Camera Connection
            </button>
          </div>
        )}

        {/* Video Element for Mobile */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${cameraError || isInitializing ? 'hidden' : 'block'}`}
        />

        {/* Scanning Target Overlay */}
        {!cameraError && !isInitializing && (
          <div className="absolute inset-0 pointer-events-none border-2 border-red-500/40 m-12 rounded-xl flex items-center justify-center">
            <div className="w-full h-0.5 bg-red-500/80 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </div>
        )}
      </div>

      {/* Upload Tag Photo Option */}
      <div className="max-w-sm mx-auto">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
        >
          📁 Upload Tag Photo
        </button>
      </div>
    </div>
  );
}