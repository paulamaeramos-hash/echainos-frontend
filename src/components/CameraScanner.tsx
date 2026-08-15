import React, { useState, useRef, useEffect } from 'react';

interface CameraScannerProps {
  onScanSuccess?: (scannedData: string) => void;
}

export default function CameraScanner({ onScanSuccess }: CameraScannerProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Uses back camera on mobile if available
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsStreaming(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setErrorMessage("Unable to access camera. Please allow camera permissions in your browser.");
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    // Capture frame to canvas
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const mockCapturedId = `EV-SCANNED-${Math.floor(1000 + Math.random() * 9000)}`;
      
      setScanResult(mockCapturedId);
      if (onScanSuccess) {
        onScanSuccess(mockCapturedId);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera(); // Clean up camera stream on unmount
    };
  }, []);

  return (
    <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl text-white space-y-4">
      <div className="flex justify-between items-center border-b border-gray-700 pb-2">
        <h3 className="text-sm font-bold text-green-400 flex items-center gap-2">
          📷 Live Camera Scanner
        </h3>
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${isStreaming ? 'bg-green-600 text-white animate-pulse' : 'bg-gray-700 text-gray-400'}`}>
          {isStreaming ? 'Camera Active' : 'Offline'}
        </span>
      </div>

      {errorMessage && (
        <div className="bg-red-900/80 text-red-200 p-2.5 rounded text-xs">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Video Stream Window */}
      <div className="relative bg-black rounded-lg overflow-hidden border border-gray-700 aspect-video flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!isStreaming && 'hidden'}`}
        />

        {!isStreaming && (
          <div className="text-center p-6 text-gray-400">
            <p className="text-3xl mb-2">📹</p>
            <p className="text-xs">Camera is currently turned off.</p>
          </div>
        )}

        {/* Scan Frame Overlay */}
        {isStreaming && (
          <div className="absolute inset-0 pointer-events-none border-2 border-green-500/30 flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-dashed border-green-400 rounded-lg animate-pulse" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isStreaming ? (
          <button
            onClick={startCamera}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 rounded transition"
          >
            Start Camera
          </button>
        ) : (
          <>
            <button
              onClick={handleCapture}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded transition"
            >
              📸 Scan / Capture Frame
            </button>
            <button
              onClick={stopCamera}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded transition"
            >
              Stop
            </button>
          </>
        )}
      </div>

      {/* Result Display */}
      {scanResult && (
        <div className="bg-gray-900 border border-green-500/50 p-2.5 rounded text-xs space-y-1">
          <span className="text-[10px] text-green-400 font-mono block">SCAN RESULT DETECTED</span>
          <p className="font-mono font-bold text-white text-sm">{scanResult}</p>
        </div>
      )}
    </div>
  );
}