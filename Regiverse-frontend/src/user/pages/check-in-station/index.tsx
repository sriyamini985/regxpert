import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ArrowLeft } from "lucide-react";
import LoadingBar from "../../../components/ui/LoadingBar";

import { API_URL as API } from "../../../config/api";
const days = [1, 2, 3, 4, 5];

const CheckInStation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { conferenceSlug } = useParams<"conferenceSlug">();

  const params = new URLSearchParams(location.search);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [scanResult, setScanResult] = useState<{
    type: "success" | "error" | "warning";
    message: string;
    user?: any;
  } | null>(null);
  const [qrInput, setQrInput] = useState("");
  const [cameraStarted, setCameraStarted] = useState(false);
  const [scannerInstance, setScannerInstance] = useState<Html5QrcodeScanner | null>(null);

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
     URL SYNC
  =========================== */
  useEffect(() => {
    setScanResult(null);
    setSearchQuery("");
    setSearchResult(null);
    setQrInput("");
  }, [location.search]);

  /* ===========================
     PLAY BEEP SOUND
  =========================== */
  /* ===========================
     PLAY BEEP SOUND
  =========================== */
  const playBeep = () => {
    new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg").play().catch(() => {});
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
          'reader-checkin',
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
     CALL SCAN API
  =========================== */
  const callScanAPI = async (identifier: string) => {
    if (!identifier.trim()) return;
    setIsProcessing(true);
    setScanResult(null);

    try {
      const res = await fetch(`${API}/api/participants/verify-and-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), scanType: "kitbag", conferenceId: conferenceSlug }),
      });
      const data = await res.json();

      if (res.status === 403) {
        setScanResult({ type: "error", message: `🚫 ${data.msg}`, user: data.user });
      } else if (res.status === 409) {
        setScanResult({ type: "warning", message: `⚠️ Already Collected: ${data.msg}`, user: data.user });
      } else if (!res.ok) {
        setScanResult({ type: "error", message: data.msg || "Participant not found." });
      } else {
        playBeep();
        setScanResult({ type: "success", message: `✅ Kitbag collected — ${data.user?.name || ""}`, user: data.user });
      }
    } catch {
      setScanResult({ type: "error", message: "❌ Network error. Check backend connection." });
    }

    setIsProcessing(false);
  };

  /* ===========================
     MANUAL SEARCH (with debounce & immediate overrides)
  =========================== */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResult(null);
      return;
    }

    const delay = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API}/api/participants?identifier=${encodeURIComponent(searchQuery.trim())}&conferenceId=${conferenceSlug}`);
        const data = await res.json();
        const participants = Array.isArray(data) ? data : data?.data || [];

        if (participants.length === 0) {
          setSearchResult({ found: false });
        } else {
          setSearchResult({ found: true, participants });
        }
      } catch {
        setSearchResult({ found: false, error: true });
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery, conferenceSlug]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/participants?identifier=${encodeURIComponent(searchQuery.trim())}&conferenceId=${conferenceSlug}`);
      const data = await res.json();
      const participants = Array.isArray(data) ? data : data?.data || [];

      if (participants.length === 0) {
        setSearchResult({ found: false });
      } else {
        setSearchResult({ found: true, participants });
      }
    } catch {
      setSearchResult({ found: false, error: true });
    }
    setIsLoading(false);
  };

  /* ===========================
     QR INPUT SCAN (keyboard/barcode scanner)
  =========================== */
  const handleQRScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrInput.trim()) {
      callScanAPI(qrInput.trim());
      setQrInput("");
    }
  };

  return (
    <div className="page-bg">
      <LoadingBar isLoading={isLoading || isProcessing} />

      <main className="pt-4 px-4 max-w-4xl mx-auto">
        <div className="space-y-6">

          {/* HEADER BAR */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
            <button 
              onClick={() => navigate(`/u/${conferenceSlug}/scan-center`)}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition text-slate-600 flex items-center justify-center border border-slate-200/60 shadow-sm"
              title="Back to Scan Center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">📦 Kit Bag Scan</h2>
              <p className="text-slate-500 text-sm mt-1">Auto QR Scan &amp; Manual Search</p>
            </div>
          </div>

          {/* QR SCAN INPUT (works with barcode scanner or typing) */}
          <div className="bg-white rounded-2xl shadow p-6 border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-3">🔍 QR / Barcode Scan</h3>
            <form onSubmit={handleQRScan} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Scan QR code or type Reg ID here..."
                className="flex-1 h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-base md:text-sm"
                autoFocus
                disabled={isProcessing}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <button
                type="submit"
                disabled={isProcessing || !qrInput.trim()}
                className="h-12 px-6 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition w-full sm:w-auto flex items-center justify-center"
              >
                {isProcessing ? "..." : "Scan"}
              </button>
            </form>

            {/* Webcam scanner toggle */}
            <div className="border-t border-slate-100 mt-4 pt-4">
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
                    <div id="reader-checkin" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MANUAL SEARCH */}
          <div className="bg-white rounded-2xl shadow p-6 border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-3">🔎 Manual Search</h3>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by name, phone, or Reg ID..."
                className="flex-1 h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-base md:text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSearch}
                disabled={isLoading || !searchQuery.trim()}
                className="h-12 px-6 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition w-full sm:w-auto flex items-center justify-center"
              >
                Search
              </button>
            </div>

            {/* SEARCH RESULTS */}
            {searchResult && !searchResult.found && (
              <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded-xl">No participant found.</div>
            )}
            {searchResult?.found && searchResult.participants?.map((p: any) => {
              const foodScanCount = p.foodLogs ? Object.values(p.foodLogs).filter(Boolean).length : 0;
              const workshopScanCount = p.workshopScans ? p.workshopScans.length : 0;

              return (
                <div key={p._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4 mb-3 hover:border-slate-350 transition gap-4">
                  <div className="space-y-2 flex-1">
                    <div>
                      <p className="font-bold text-slate-800 text-base">{p.name}</p>
                      <p className="text-sm text-slate-500 font-medium">{p.phone} · <span className="font-bold text-slate-700">{p.category}</span> · <span className="font-mono">{p.regId || p._id}</span></p>
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
                      setSearchResult(null);
                      callScanAPI(p.regId || p._id);
                    }}
                    disabled={isProcessing || p.kitbagCollected}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm whitespace-nowrap h-fit self-end sm:self-center"
                  >
                    {p.kitbagCollected ? "Collected" : "✅ Mark Collected"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* SCAN RESULT FEEDBACK */}
          {scanResult && (
            <div className={`rounded-2xl p-6 border-2 shadow transition-all ${
              scanResult.type === "success"
                ? "bg-green-50 border-green-400"
                : scanResult.type === "warning"
                ? "bg-yellow-50 border-yellow-400"
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
                  <p><span className="font-semibold">Category:</span> {scanResult.user.category}</p>
                  <p><span className="font-semibold">Reg ID:</span> {(scanResult.user.regId || scanResult.user._id || "").replace(/^(reg\s*id|regid)\s*[-\s:]*/i, "")}</p>
                </div>
              )}
              <button onClick={() => setScanResult(null)} className="mt-4 text-sm text-slate-500 underline">Dismiss</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CheckInStation;