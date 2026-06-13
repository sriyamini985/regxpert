import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ArrowLeft } from "lucide-react";

import { API_URL as API } from "../../config/api";

const HallScan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { conferenceSlug } = useParams<"conferenceSlug">();

  const params = new URLSearchParams(location.search);
  const [mode, setMode] = useState<'entry' | 'exit' | null>(
    params.get("mode") as 'entry' | 'exit' | null
  );

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

  /* ===========================
     URL SYNC
  =========================== */
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const m = p.get("mode");
    setMode(m === 'entry' || m === 'exit' ? m : null);
    setQrInput("");
    setSearchQuery("");
    setSearchResults([]);
    setScanResult(null);
    stopCameraScanner();
  }, [location.search]);

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
          'reader-hall',
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
     CALL BACKEND SCAN API
  =========================== */
  const callScanAPI = async (identifier: string) => {
    if (!identifier.trim() || !mode) return;
    setIsProcessing(true);
    setScanResult(null);

    try {
      const res = await fetch(`${API}/api/participants/scan-hall`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), mode }),
      });
      const data = await res.json();

      if (res.status === 409) {
        setScanResult({ type: "warning", message: `⚠️ ${data.msg}`, user: data.user });
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
        <button 
          onClick={() => {
            if (mode) {
              setMode(null);
              navigate(`/u/${conferenceSlug}/hall-scan`);
            } else {
              navigate(`/u/${conferenceSlug}/scan-center`);
            }
          }}
          className="p-2.5 hover:bg-slate-100 rounded-xl transition text-slate-600 flex items-center justify-center border border-slate-200/60 shadow-sm"
          title={mode ? "Back to Mode Select" : "Back to Scan Center"}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🚪 Hall Entry/Exit</h1>
          <p className="text-slate-500 text-sm mt-1">
            {mode
              ? `Mode: ${mode === 'entry' ? '🟢 ENTRY' : '🔴 EXIT'} Scan`
              : "Select scanning direction to begin"}
          </p>
        </div>
      </div>

      {/* MODE SELECTOR */}
      {!mode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ENTRY MODE */}
          <button
            onClick={() => {
              setMode('entry');
              navigate(`/u/${conferenceSlug}/hall-scan?mode=entry`);
            }}
            className="bg-white shadow-md rounded-2xl p-12 hover:scale-105 transition-all border border-slate-200 hover:border-green-400 hover:shadow-green-100 text-center space-y-4"
          >
            <div className="text-5xl">🟢</div>
            <h2 className="text-2xl font-bold text-green-600">Hall Entry</h2>
            <p className="text-gray-400 text-sm">Scan delegates entering the hall</p>
          </button>

          {/* EXIT MODE */}
          <button
            onClick={() => {
              setMode('exit');
              navigate(`/u/${conferenceSlug}/hall-scan?mode=exit`);
            }}
            className="bg-white shadow-md rounded-2xl p-12 hover:scale-105 transition-all border border-slate-200 hover:border-red-400 hover:shadow-red-100 text-center space-y-4"
          >
            <div className="text-5xl">🔴</div>
            <h2 className="text-2xl font-bold text-red-600">Hall Exit</h2>
            <p className="text-gray-400 text-sm">Scan delegates leaving the hall</p>
          </button>
        </div>
      )}

      {/* ACTIVE SCAN STATION */}
      {mode && (
        <div className="space-y-6">

          {/* QR / BARCODE INPUT */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-700 mb-3">🔍 QR / Barcode Scan</h3>
            
            <form onSubmit={handleQRScanSubmit} className="flex gap-3 mb-4">
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder={`Scan QR code or type Reg ID / Phone for Hall ${mode === 'entry' ? 'Entry' : 'Exit'}...`}
                className={`flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ${
                  mode === 'entry' ? 'focus:ring-green-400' : 'focus:ring-red-400'
                }`}
                autoFocus
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={isProcessing || !qrInput.trim()}
                className={`px-6 py-3 text-white rounded-xl font-bold transition disabled:opacity-50 ${
                  mode === 'entry' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Scan
              </button>
            </form>

            {/* Webcam scanning toggle */}
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
                    <div id="reader-hall" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MANUAL SEARCH */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-700 mb-3">🔎 Manual Search</h3>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, or Reg ID..."
              className={`w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ${
                mode === 'entry' ? 'focus:ring-green-400' : 'focus:ring-red-400'
              }`}
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
                  const entryCount = p.hallEntries ? p.hallEntries.length : 0;
                  const exitCount = p.hallExits ? p.hallExits.length : 0;

                  return (
                    <div key={p._id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition">
                      <div>
                        <p className="font-bold text-slate-800">{p.name}</p>
                        <p className="text-sm text-slate-500">{p.phone} · {p.category} · {p.regId || "No RegID"}</p>
                        <p className="text-xs mt-1 text-slate-500">
                          Stats: <span className="text-green-600 font-bold">{entryCount} Entries</span> · <span className="text-red-500 font-bold">{exitCount} Exits</span>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                          callScanAPI(p.regId || p._id);
                        }}
                        disabled={isProcessing}
                        className={`px-5 py-2 text-white rounded-xl font-bold transition text-sm ${
                          mode === 'entry' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {mode === 'entry' ? 'Log Entry' : 'Log Exit'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FEEDBACK RESULT */}
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
                  <p>
                    <span className="font-semibold">Total Hall Scans:</span> {scanResult.user.hallEntries?.length || 0} In / {scanResult.user.hallExits?.length || 0} Out
                  </p>
                </div>
              )}
              <button onClick={() => setScanResult(null)} className="mt-4 text-sm text-slate-500 underline">
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HallScan;