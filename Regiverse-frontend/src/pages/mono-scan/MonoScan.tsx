import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

import { API_URL as API } from "../../config/api";

const MonoScan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { conferenceSlug } = useParams<"conferenceSlug">();

  // Scan states
  const [qrInput, setQrInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [scannerInstance, setScannerInstance] = useState<Html5QrcodeScanner | null>(null);

  const [scanResult, setScanResult] = useState<{
    type: "success" | "error" | "warning";
    message: string;
    user?: any;
  } | null>(null);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerInstance) {
        try {
          scannerInstance.clear().catch(() => {});
        } catch {}
      }
    };
  }, [scannerInstance]);

  /* ===========================
     AUDIO FEEDBACK
  =========================== */
  const playBeep = () => {
    new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg")
      .play()
      .catch(() => {});
  };

  /* ===========================
     CAMERA SCANNER LOGIC
  =========================== */
  const startCameraScanner = () => {
    setCameraStarted(true);
    setScanResult(null);

    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'reader-mono',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        scanner.render(
          (decodedText) => {
            if (decodedText) {
              callScanAPI(decodedText);
              scanner.clear().catch(err => console.error(err));
              setCameraStarted(false);
            }
          },
          (err) => {}
        );

        setScannerInstance(scanner);
      } catch (err) {
        console.error("Camera scanner failed to init:", err);
      }
    }, 100);
  };

  const stopCameraScanner = () => {
    if (scannerInstance) {
      try {
        scannerInstance.clear().catch(() => {});
      } catch (err) {}
      setScannerInstance(null);
    }
    setCameraStarted(false);
  };

  /* ===========================
     CALL BACKEND CHECK-IN API
  =========================== */
  const callScanAPI = async (identifier: string) => {
    if (!identifier.trim()) return;
    setIsProcessing(true);
    setScanResult(null);

    try {
      const res = await fetch(`${API}/api/participants/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();

      if (res.status === 409) {
        setScanResult({ type: "warning", message: `⚠️ Already Checked In: ${data.msg}`, user: data.user });
      } else if (!res.ok) {
        setScanResult({ type: "error", message: data.msg || "Participant not found." });
      } else {
        playBeep();
        setScanResult({ type: "success", message: `✅ ${data.message}`, user: data.user });
      }
    } catch {
      setScanResult({ type: "error", message: "❌ Network error. Check backend connection." });
    }

    setIsProcessing(false);
  };

  /* ===========================
     MANUAL SEARCH (with debounce)
  =========================== */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${API}/api/participants?identifier=${encodeURIComponent(searchQuery.trim())}&conferenceId=${conferenceSlug}`);
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : data?.data || []);
      } catch {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  /* ===========================
     SUBMIT QR FROM INPUT BOX
  =========================== */
  const handleQRScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrInput.trim()) {
      callScanAPI(qrInput.trim());
      setQrInput("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🎟️ Mono Scan (Onsite Check-In)</h1>
          <p className="text-slate-500 text-sm mt-1">
            General check-in scanner for delegates entering the venue.
          </p>
        </div>
      </div>

      {/* QR / BARCODE INPUT CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-700 mb-3">🔍 QR / Barcode Scan</h3>
        
        <form onSubmit={handleQRScanSubmit} className="flex gap-3 mb-4">
          <input
            type="text"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder="Scan QR code or type Reg ID / Phone here..."
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !qrInput.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            Check In
          </button>
        </form>

        {/* Webcam scanner toggle */}
        <div className="border-t border-slate-100 pt-4">
          {!cameraStarted ? (
            <button
              onClick={startCameraScanner}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition text-sm font-medium text-slate-600"
            >
              📷 Scan using Camera (Webcam)
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 animate-pulse">📷 Camera active...</span>
                <button
                  onClick={stopCameraScanner}
                  className="text-xs text-red-500 underline"
                >
                  Close camera
                </button>
              </div>
              <div className="max-w-md mx-auto overflow-hidden rounded-xl border border-slate-200">
                <div id="reader-mono" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MANUAL SEARCH AND LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-700 mb-3">🔎 Manual Search</h3>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, phone, or Reg ID..."
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {isSearching && <p className="text-slate-400 text-sm mt-3">Searching...</p>}

        {searchQuery.trim() && !isSearching && searchResults.length === 0 && (
          <div className="text-gray-400 text-sm mt-4 p-4 bg-slate-50 rounded-xl">
            No participants found for "{searchQuery}"
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto pr-1">
            {searchResults.map((p: any) => {
              const foodScanCount = p.foodLogs ? Object.values(p.foodLogs).filter(Boolean).length : 0;
              const workshopScanCount = p.workshopScans ? p.workshopScans.length : 0;

              return (
                <div key={p._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition gap-4">
                  <div className="space-y-2 flex-1">
                    <div>
                      <p className="font-bold text-slate-800 text-base">{p.name}</p>
                      <p className="text-sm text-slate-500 font-medium">{p.phone} · <span className="font-bold text-slate-700">{p.category}</span> · <span className="font-mono">{p.regId || "No RegID"}</span></p>
                    </div>
                    
                    {/* Operational Progress Status Indicators */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {/* Check In */}
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                        p.isCheckedIn 
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-sm shadow-emerald-600/10" 
                          : "bg-slate-100 text-slate-400 border-slate-200/50"
                      }`}>
                        Entry
                      </span>

                      {/* Badge Printed */}
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                        p.printed 
                          ? "bg-indigo-600 text-white border-indigo-700 shadow-sm shadow-indigo-600/10" 
                          : "bg-slate-100 text-slate-400 border-slate-200/50"
                      }`}>
                        Badge
                      </span>

                      {/* Kit bag */}
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                        p.kitbagCollected 
                          ? "bg-blue-600 text-white border-blue-700 shadow-sm shadow-blue-600/10" 
                          : "bg-slate-100 text-slate-400 border-slate-200/50"
                      }`}>
                        Kitbag
                      </span>

                      {/* Food Scan */}
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                        foodScanCount > 0 
                          ? "bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/10" 
                          : "bg-slate-100 text-slate-400 border-slate-200/50"
                      }`}>
                        Food {foodScanCount > 0 ? `(${foodScanCount})` : ""}
                      </span>

                      {/* Workshop Scan */}
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                        workshopScanCount > 0 
                          ? "bg-purple-600 text-white border-purple-700 shadow-sm shadow-purple-600/10" 
                          : "bg-slate-100 text-slate-400 border-slate-200/50"
                      }`}>
                        Workshop {workshopScanCount > 0 ? `(${workshopScanCount})` : ""}
                      </span>

                      {/* Certificate Issued */}
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase border whitespace-nowrap transition-all duration-150 ${
                        p.certificateGiven 
                          ? "bg-teal-600 text-white border-teal-700 shadow-sm shadow-teal-600/10" 
                          : "bg-slate-100 text-slate-400 border-slate-200/50"
                      }`}>
                        Cert
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      callScanAPI(p.regId || p._id);
                    }}
                    disabled={isProcessing || p.isCheckedIn}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm whitespace-nowrap h-fit self-end sm:self-center"
                  >
                    {p.isCheckedIn ? "Checked In" : "Check In"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FEEDBACK BOX */}
      {scanResult && (
        <div className={`rounded-2xl p-6 border-2 shadow transition-all ${
          scanResult.type === "success" ? "bg-green-50 border-green-400"
          : scanResult.type === "warning" ? "bg-yellow-50 border-yellow-400"
          : "bg-red-50 border-red-400"
        }`}>
          <p className={`text-xl font-bold ${
            scanResult.type === "success" ? "text-green-700"
            : scanResult.type === "warning" ? "text-yellow-700"
            : "text-red-700"
          }`}>
            {scanResult.message}
          </p>
          {scanResult.user && (
            <div className="mt-3 text-slate-700 text-sm space-y-1">
              <p><span className="font-semibold">Name:</span> {scanResult.user.name}</p>
              <p><span className="font-semibold">Reg ID:</span> {scanResult.user.regId}</p>
              <p><span className="font-semibold">Category:</span> {scanResult.user.category}</p>
            </div>
          )}
          <button onClick={() => setScanResult(null)} className="mt-4 text-sm text-slate-500 underline">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default MonoScan;