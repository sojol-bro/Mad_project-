import React, { useEffect, useRef, useState } from "react";
import { Product } from "../types";
import { Camera, X, AlertCircle, RefreshCw, Sparkles, Volume2, Maximize2, ShieldAlert } from "lucide-react";

interface CameraBarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  products: Product[];
  isDarkMode: boolean;
}

export default function CameraBarcodeScanner({
  isOpen,
  onClose,
  onScan,
  products,
  isDarkMode
}: CameraBarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [cameraState, setCameraState] = useState<"initializing" | "ready" | "failed" | "unsupported">("initializing");
  const [errorMessage, setErrorMessage] = useState("");
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [autoScanTimer, setAutoScanTimer] = useState<number>(3); // 3 seconds interval
  const [lastScannedProduct, setLastScannedProduct] = useState<Product | null>(null);

  // Sound effect handler inside the scanner
  const playScanChime = () => {
    if (isMuted) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const audioCtx = new AudioContext();
      
      // High-register diagnostic clean double beep
      const executeBeep = (freq: number, duration: number, delay = 0) => {
        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
          osc.start();
          osc.stop(audioCtx.currentTime + duration);
        }, delay * 1000);
      };

      executeBeep(1200, 0.1, 0);
      executeBeep(1600, 0.12, 0.06);
    } catch (e) {
      console.warn("Scanner chime failed:", e);
    }
  };

  // Start the live camera stream
  const startCamera = async () => {
    setCameraState("initializing");
    setErrorMessage("");
    
    // Check browser compatibility
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState("unsupported");
      setErrorMessage("Your browser or sandbox environment does not support mediaDevices API.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        // We catch playsinline play promise
        videoRef.current.play().catch(err => {
          console.warn("Autoplay blocked/failed on video stream:", err);
        });
      }
      setCameraState("ready");
    } catch (err: any) {
      console.warn("Camera stream authorization request failed:", err);
      setCameraState("failed");
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Permission to access device camera was denied. Using high-fidelity vector overlay instead.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMessage("No primary video recording hardware found on this machine.");
      } else {
        setErrorMessage(err.message || "Unknown error occurred while bootstrapping video device stream.");
      }
    }
  };

  // Stop current stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Run camera attachment cycle on open
  useEffect(() => {
    if (isOpen) {
      startCamera();
      setIsScanning(true);
      setScannedFeedback(null);
      setLastScannedProduct(null);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Handle barcode emission to master POS
  const triggerScanMatched = (prd: Product) => {
    if (!isScanning) return;
    
    playScanChime();
    setLastScannedProduct(prd);
    setScannedFeedback(prd.barcode || prd.sku);
    onScan(prd.barcode || prd.sku);
    
    // Pulse animation reset
    setIsScanning(false);
    setTimeout(() => {
      setScannedFeedback(null);
      setIsScanning(true);
    }, 1500);
  };

  // Simulates automatic barcode reading at set interval, finding a random product in catalog
  useEffect(() => {
    if (!isOpen || !isScanning || cameraState === "initializing") return;

    const timer = setInterval(() => {
      // Pick a random product from store catalog
      if (products.length > 0) {
        const index = Math.floor(Math.random() * products.length);
        const item = products[index];
        triggerScanMatched(item);
      }
    }, autoScanTimer * 1000);

    return () => clearInterval(timer);
  }, [isOpen, isScanning, cameraState, products, autoScanTimer]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div className={`w-full max-w-2xl overflow-hidden rounded-2xl border ${
        isDarkMode ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      } shadow-2xl flex flex-col md:flex-row h-auto max-h-[90vh]`}>
        
        {/* Left Side: Viewfinder video feed / viewport overlay */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[320px] md:min-h-[440px]">
          
          {/* Live Viewport or Fallback Animated Backdrop */}
          {cameraState === "ready" ? (
            <video 
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
              muted
              playsInline
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-6 text-center">
              {/* Spinning High tech HUD background graphics */}
              <div className="absolute w-64 h-64 border border-dashed border-sky-500/20 rounded-full animate-spin [animation-duration:20s]"></div>
              <div className="absolute w-44 h-44 border border-indigo-500/30 rounded-full animate-reverse-spin [animation-duration:12s]"></div>
              
              <Camera size={40} className="text-sky-400 mb-2 animate-bounce" />
              <span className="text-xs uppercase font-bold tracking-widest text-sky-400">Diag-HUD Live Viewfinder</span>
              <span className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Interactive software telemetry active</span>
            </div>
          )}

          {/* Diagnostic Overlay Grid and Sweep Scanline */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-4 select-none">
            {/* HUD Status Header */}
            <div className="flex justify-between items-center bg-slate-950/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5">
              <div className="flex items-center gap-1.5 ">
                <span className={`w-2 h-2 rounded-full ${
                  isScanning ? "bg-emerald-400 animate-ping" : "bg-amber-400"
                }`}></span>
                <span className="text-[9px] font-mono font-bold tracking-wider text-slate-200 uppercase">
                  {isScanning ? "LENS FOCUS ACTIVE" : "DECODING LOT INFO..."}
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-300">
                FRAME-RATE: 30 FPS
              </span>
            </div>

            {/* Central Target Reticle Box */}
            <div className="relative w-64 h-44 mx-auto my-auto border-2 border-dashed border-white/40 rounded-xl flex items-center justify-center transition-all duration-300">
              
              {/* Bracket corners */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-sky-400 rounded-tl-lg -mt-1 -ml-1"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-sky-400 rounded-tr-lg -mt-1 -mr-1"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-sky-400 rounded-bl-lg -mb-1 -ml-1"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-sky-400 rounded-br-lg -mb-1 -mr-1"></div>

              {/* Animated scanning laser line */}
              {isScanning && (
                <div className="absolute left-0 right-0 h-[3px] bg-red-500/80 shadow-md shadow-red-500 rounded-full animate-sweep-laser" />
              )}

              {/* Real-time scanned success card flash */}
              {scannedFeedback && (
                <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-center p-4 transition-all duration-300">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-1 animate-ping">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  <span className="text-xs font-black text-white uppercase tracking-widest">BARCODE MATCHED</span>
                  <span className="text-[10px] font-mono text-emerald-100 bg-emerald-900/60 px-2 py-0.5 rounded-md mt-1">
                    {scannedFeedback}
                  </span>
                </div>
              )}
            </div>

            {/* Diagnostic Alert Footer */}
            {cameraState === "failed" && (
              <div className="bg-amber-500/15 border border-amber-500/30 backdrop-blur-md p-2.5 rounded-lg text-amber-200">
                <div className="flex gap-2 items-start">
                  <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                  <p className="text-[9px] leading-tight font-medium">
                    {errorMessage} System continues with software-simulate cycles using inventory registers.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive controller list & mock scan triggers */}
        <div className={`w-full md:w-[260px] flex flex-col justify-between p-4 ${
          isDarkMode ? "bg-slate-900" : "bg-slate-50"
        }`}>
          <div>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-extrabold text-sm tracking-tight font-display">
                  Camera Scan Console
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Full stack POS hardware bridge
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-1 rounded-md hover:bg-slate-500/10 transition-colors"
                id="btn_close_scanner_modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Auto Scanner Configuration */}
            <div className={`p-2.5 rounded-lg border mb-3 ${
              isDarkMode ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <span className="text-[10px] font-black uppercase text-sky-500 tracking-wider flex items-center gap-1.5 mb-1.5">
                <RefreshCw size={11} className="animate-spin [animation-duration:6s]" />
                Auto-Scan Emulator
              </span>
              <p className="text-[9px] text-slate-400 leading-normal mb-2">
                Simulates placing random warehouse lots into camera viewport at structured intervals.
              </p>
              <div className="flex justify-between items-center gap-2">
                <span className="text-[9px] font-semibold">Interval Rate:</span>
                <div className="flex bg-slate-500/10 p-0.5 rounded-md">
                  {([2, 4, 8] as const).map((secs) => (
                    <button
                      key={secs}
                      onClick={() => setAutoScanTimer(secs)}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        autoScanTimer === secs 
                          ? "bg-sky-500 text-slate-950 font-black" 
                          : "text-slate-400"
                      }`}
                      id={`btn_set_interval_${secs}`}
                    >
                      {secs}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive manual presentation catalog */}
            <div>
              <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider mb-1.5 block">
                Tap Inventory to Scan
              </span>
              <p className="text-[9px] text-slate-400 leading-tight mb-2">
                Present selected items to the scan field to execute instant stock billing:
              </p>

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {products.slice(0, 7).map((prd) => (
                  <button
                    key={prd.id}
                    onClick={() => triggerScanMatched(prd)}
                    className={`w-full text-left p-1.5 rounded-lg border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                      lastScannedProduct?.id === prd.id 
                        ? "border-emerald-500 bg-emerald-500/10" 
                        : isDarkMode 
                          ? "border-slate-800 hover:border-slate-700 bg-slate-950/20" 
                          : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                    id={`btn_scan_simulate_item_${prd.id}`}
                  >
                    <img 
                      src={prd.imageUrl} 
                      alt="" 
                      className="w-6 h-6 rounded object-cover shrink-0"
                    />
                    <div className="overflow-hidden flex-1">
                      <p className="text-[10px] font-bold truncate">{prd.name}</p>
                      <p className="text-[8px] text-slate-400 truncate font-mono">
                        BC: {prd.barcode} • ${prd.sellingPrice.toFixed(2)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-500/10">
            {/* Audio configuration & diagnostic controls */}
            <div className="flex justify-between items-center">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`py-1 px-2.5 rounded-md text-[9px] font-bold border flex items-center gap-1.5 ${
                  isMuted 
                    ? "border-slate-500/20 text-slate-400" 
                    : "border-sky-500/30 text-sky-400 bg-sky-500/5"
                }`}
                id="btn_toggle_scanner_mute"
              >
                <Volume2 size={11} />
                {isMuted ? "Diagnostic Muted" : "Speaker Active"}
              </button>
              
              <button
                onClick={startCamera}
                className="py-1 px-2.5 rounded-md text-[9px] font-bold border border-slate-500/20 hover:bg-slate-500/5 text-slate-300 flex items-center gap-1"
                id="btn_reconnect_viewfinder"
              >
                <Maximize2 size={10} />
                Reset Lens
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
