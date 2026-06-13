import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
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

  const [selectedDay, setSelectedDay] = useState<number | null>(
    params.get("day") ? Number(params.get("day")) : null
  );

  /* ===========================
     URL SYNC
  =========================== */
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const day = p.get("day");
    setSelectedDay(day ? Number(day) : null);
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
        body: JSON.stringify({ identifier: identifier.trim(), scanType: "kitbag" }),
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
     MANUAL SEARCH (by name/phone/regId)
  =========================== */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setSearchResult(null);

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

        {/* TITLE */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">📦 Kit Bag Scan</h1>
          <p className="text-gray-500 mt-1">
            {selectedDay ? `Day ${selectedDay} — Scan or Search Participant` : "Select a Day to Begin"}
          </p>
        </div>

        {/* DAY BUTTONS */}
        {!selectedDay && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                  navigate(`/u/${conferenceSlug}/check-in?day=${day}`);
                }}
                className="bg-white shadow-lg rounded-3xl p-10 hover:scale-105 transition-all border border-slate-200 hover:border-blue-400 hover:shadow-blue-100"
              >
                <h2 className="text-2xl font-bold text-blue-600">Day {day}</h2>
                <p className="text-gray-500 mt-2 text-sm">Open Kit Bag Scan</p>
              </button>
            ))}
          </div>
        )}

        {/* SCAN SECTION */}
        {selectedDay && (
          <div className="space-y-6">

            {/* HEADER BAR */}
            <div className="flex items-center justify-between bg-white rounded-2xl shadow p-5 border border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Day {selectedDay} — Kit Bag Scan</h2>
                <p className="text-gray-500 text-sm">Auto QR Scan &amp; Manual Search</p>
              </div>
              <button
                onClick={() => {
                  setSelectedDay(null);
                  navigate(`/u/${conferenceSlug}/check-in`);
                }}
                className="px-5 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
              >
                ← Back
              </button>
            </div>

            {/* QR SCAN INPUT (works with barcode scanner or typing) */}
            <div className="bg-white rounded-2xl shadow p-6 border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-3">🔍 QR / Barcode Scan</h3>
              <form onSubmit={handleQRScan} className="flex gap-3">
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Scan QR code or type Reg ID here..."
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  autoFocus
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={isProcessing || !qrInput.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition"
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
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search by name, phone, or Reg ID..."
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                  className="px-6 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition"
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
                    <p><span className="font-semibold">Reg ID:</span> {scanResult.user.regId}</p>
                    <p><span className="font-semibold">Category:</span> {scanResult.user.category}</p>
                  </div>
                )}
                <button onClick={() => setScanResult(null)} className="mt-4 text-sm text-slate-500 underline">Dismiss</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CheckInStation;