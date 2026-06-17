import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ArrowLeft } from "lucide-react";
import { API_URL as API } from "../../config/api";

const certificateTypes = [
  "Participation Certificate",
  "Faculty Certificate",
  "Oral Paper Certificate",
  "E-Poster Certificate",
  "Workshop Certificate",
];

const CertificateScan: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { conferenceSlug } = useParams<"conferenceSlug">();

  const params = new URLSearchParams(location.search);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    type: "success" | "error" | "warning";
    message: string;
    user?: any;
  } | null>(null);

  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(
    params.get("type")
  );

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
    const p = new URLSearchParams(location.search);
    setSelectedCertificate(p.get("type"));
    setSearch("");
    setSearchResults([]);
    setScanResult(null);
    setQrInput("");
    stopCameraScanner();
  }, [location.search]);

  /* ===========================
     CAMERA SCANNER LOGIC
  =========================== */
  const startCameraScanner = () => {
    setCameraStarted(true);
    setScanResult(null);

    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'reader-certificate',
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
     SEARCH PARTICIPANTS FROM DB
  =========================== */
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${API}/api/participants?identifier=${encodeURIComponent(search.trim())}&conferenceId=${conferenceSlug}`);
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : data?.data || []);
      } catch {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  const playBeep = () => {
    new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg").play().catch(() => {});
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
        body: JSON.stringify({ identifier: identifier.trim(), scanType: "certificate" }),
      });
      const data = await res.json();

      if (res.status === 403) {
        setScanResult({ type: "error", message: `🚫 ${data.msg}`, user: data.user });
      } else if (res.status === 409) {
        setScanResult({ type: "warning", message: `⚠️ Already Issued: ${data.msg}`, user: data.user });
      } else if (!res.ok) {
        setScanResult({ type: "error", message: data.msg || "Participant not found." });
      } else {
        playBeep();
        setScanResult({ type: "success", message: `✅ Certificate issued — ${data.user?.name || ""}`, user: data.user });
      }
    } catch {
      setScanResult({ type: "error", message: "❌ Network error. Check backend connection." });
    }

    setIsProcessing(false);
  };

  /* ===========================
     ISSUE CERTIFICATE (calls real API)
  =========================== */
  const issueCertificate = async (participant: any) => {
    await callScanAPI(participant.regId || participant._id);
    setSearchResults((prev) =>
      prev.map((p) =>
        p._id === participant._id ? { ...p, certificateGiven: true } : p
      )
    );
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
    <div className="max-w-4xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
        <button 
          onClick={() => {
            if (selectedCertificate) {
              setSelectedCertificate(null);
              setSearch("");
              setScanResult(null);
              navigate(`/u/${conferenceSlug}/certificate`);
            } else {
              navigate(`/u/${conferenceSlug}/scan-center`);
            }
          }}
          className="p-2.5 hover:bg-slate-100 rounded-xl transition text-slate-600 flex items-center justify-center border border-slate-200/60 shadow-sm"
          title={selectedCertificate ? "Back to Types" : "Back to Scan Center"}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🎓 Certificate Scan</h1>
          <p className="text-slate-500 text-sm mt-1">
            {selectedCertificate
              ? `Issuing: ${selectedCertificate}`
              : "Select Certificate Type"}
          </p>
        </div>
      </div>

      {/* CERTIFICATE TYPE GRID */}
      {!selectedCertificate && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificateTypes.map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedCertificate(type);
                navigate(`/u/${conferenceSlug}/certificate?type=${encodeURIComponent(type)}`);
              }}
              className="bg-white shadow-md rounded-2xl p-8 hover:scale-105 transition-all border border-slate-200 hover:border-amber-400 hover:shadow-amber-100 text-left"
            >
              <div className="text-3xl mb-3">🎓</div>
              <h2 className="text-lg font-bold text-slate-800">{type}</h2>
              <p className="text-gray-400 mt-1 text-sm">Search &amp; Issue</p>
            </button>
          ))}
        </div>
      )}

      {/* SCAN SECTION */}
      {selectedCertificate && (
        <div className="space-y-5">

          {/* QR / BARCODE INPUT */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-700 mb-3">🔍 QR / Barcode Scan</h3>
            <form onSubmit={handleQRScan} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Scan QR code or type Reg ID here..."
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={isProcessing || !qrInput.trim()}
                className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 disabled:opacity-50 transition w-full sm:w-auto"
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
                    <div id="reader-certificate" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SEARCH BOX */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-700 mb-3">🔎 Search Participant</h3>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type name, Reg ID, or phone..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {isSearching && <p className="text-slate-400 text-sm mt-2">Searching...</p>}
          </div>

          {/* RESULTS */}
          {search.trim() && !isSearching && searchResults.length === 0 && (
            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400 border border-slate-100">
              No participants found for "{search}"
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {searchResults.map((p: any) => {
                const foodScanCount = p.foodLogs ? Object.values(p.foodLogs).filter(Boolean).length : 0;
                const workshopScanCount = p.workshopScans ? p.workshopScans.length : 0;

                return (
                  <div
                    key={p._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-100 last:border-none hover:bg-slate-50 transition gap-4"
                  >
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
                      onClick={() => issueCertificate(p)}
                      disabled={isProcessing || p.certificateGiven}
                      className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm whitespace-nowrap h-fit self-end sm:self-center w-full sm:w-auto"
                    >
                      {p.certificateGiven ? "Issued" : "🎓 Issue"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* SCAN RESULT FEEDBACK */}
          {scanResult && (
            <div className={`rounded-2xl p-6 border-2 shadow ${
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
                  <p><span className="font-semibold">Category:</span> {scanResult.user.category}</p>
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

export default CertificateScan;