import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft } from "lucide-react";

import { API_URL as API } from "../../config/api";
const days = [1, 2, 3, 4, 5];
const meals = ["Breakfast", "Lunch", "Dinner"] as const;
type Meal = typeof meals[number];

type Step = "day" | "meal" | "scan";

const FoodCounter = () => {
  const navigate = useNavigate();
  const { conferenceSlug } = useParams<"conferenceSlug">();

  // Step-by-step selection
  const [step, setStep] = useState<Step>("day");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  // Scan state
  const [qrInput, setQrInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Disambiguation for shared QR codes (e.g. industry partners)
  const [ambiguousMatches, setAmbiguousMatches] = useState<any[]>([]);
  const [pendingIdentifier, setPendingIdentifier] = useState("");

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {});
        }
      }
    };
  }, []);
  const [scanResult, setScanResult] = useState<{
    type: "success" | "error" | "warning";
    message: string;
    user?: any;
  } | null>(null);

  // Build mealType string like "day1-lunch"
  const getMealType = () =>
    selectedDay && selectedMeal
      ? `day${selectedDay}-${selectedMeal.toLowerCase()}`
      : "";

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
        const html5QrCode = new Html5Qrcode("reader-food");
        html5QrCodeRef.current = html5QrCode;

        html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            if (decodedText) {
              callScanAPI(decodedText);
              stopCameraScanner();
            }
          },
          (errorMessage) => {}
        ).catch(err => {
          console.error("Failed to start camera scan:", err);
          setCameraStarted(false);
          alert("Camera access denied or failed to initialize.");
        });
      } catch (err) {
        console.error("Camera scanner failed to init:", err);
        setCameraStarted(false);
      }
    }, 150);
  };

  const stopCameraScanner = () => {
    if (html5QrCodeRef.current) {
      if (html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current = null;
        }).catch(err => {
          console.error("Failed to stop scanner:", err);
        });
      } else {
        html5QrCodeRef.current = null;
      }
    }
    setCameraStarted(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setScanResult(null);

    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop().catch(() => {});
      html5QrCodeRef.current = null;
      setCameraStarted(false);
    }

    try {
      const tempScanner = new Html5Qrcode("reader-food");
      const decodedText = await tempScanner.scanFile(file, true);
      if (decodedText) {
        callScanAPI(decodedText);
      } else {
        setScanResult({ type: "error", message: "❌ Failed to decode QR code from image. Please ensure QR code is clear." });
      }
    } catch (err) {
      console.error("Image scan failed:", err);
      setScanResult({ type: "error", message: "❌ Could not find a valid QR code in this image." });
    } finally {
      setIsProcessing(false);
      e.target.value = "";
    }
  };

  /* ===========================
     SCAN API CALL
  =========================== */
  const callScanAPI = async (identifier: string, participantId?: string) => {
    if (!identifier.trim() || !getMealType()) return;
    setIsProcessing(true);
    setScanResult(null);
    setAmbiguousMatches([]);

    try {
      const body: any = { 
        identifier: identifier.trim(), 
        mealType: getMealType(), 
        conferenceId: conferenceSlug 
      };
      if (participantId) body.participantId = participantId;

      const res = await fetch(`${API}/api/participants/scan-food`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.status === 300 && data.multipleMatches) {
        setPendingIdentifier(identifier.trim());
        setAmbiguousMatches(data.participants || []);
      } else if (res.status === 403) {
        setScanResult({ type: "error", message: `🚫 Access Denied: ${data.msg}`, user: data.user });
      } else if (res.status === 409) {
        setScanResult({ type: "error", message: `❌ ${data.msg || "Meal Already Claimed"}`, user: data.user });
        
        // Update local search result status if present
        if (data.user) {
          setSearchResults(prev => prev.map(p => {
            if (p._id === data.user._id || p.regId === data.user.regId) {
              const updatedLogs = { ...p.foodLogs, [getMealType()]: true };
              return { ...p, foodLogs: updatedLogs };
            }
            return p;
          }));
        }
      } else if (!res.ok) {
        setScanResult({ type: "error", message: `❌ ${data.msg || "Participant not found."}` });
      } else {
        playBeep();
        setScanResult({ type: "success", message: `✅ ${data.message}`, user: data.user });
        
        // Update local search result status if present
        if (data.user) {
          setSearchResults(prev => prev.map(p => {
            if (p._id === data.user._id || p.regId === data.user.regId) {
              const updatedLogs = { ...p.foodLogs, [getMealType()]: true };
              return { ...p, foodLogs: updatedLogs };
            }
            return p;
          }));
        }
      }
    } catch {
      setScanResult({ type: "error", message: "❌ Network error. Check backend connection." });
    }

    setIsProcessing(false);
  };

  const confirmPersonScan = async (person: any) => {
    setAmbiguousMatches([]);
    setPendingIdentifier("");
    await callScanAPI(pendingIdentifier || person.regId, String(person._id));
  };

  /* ===========================
     QR SCAN (barcode input)
  =========================== */
  const handleQRScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrInput.trim()) {
      callScanAPI(qrInput.trim());
      setQrInput("");
    }
  };

  /* ===========================
     MANUAL SEARCH (with debounce & immediate overrides)
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
  }, [searchQuery, conferenceSlug]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`${API}/api/participants?identifier=${encodeURIComponent(searchQuery.trim())}&conferenceId=${conferenceSlug}`);
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  /* ===========================
     RESET
  =========================== */
  const reset = (toStep: Step = "day") => {
    setScanResult(null);
    setSearchQuery("");
    setSearchResults([]);
    setQrInput("");
    setAmbiguousMatches([]);
    setPendingIdentifier("");
    if (toStep === "day") { setSelectedDay(null); setSelectedMeal(null); }
    if (toStep === "meal") { setSelectedMeal(null); }
    setStep(toStep);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
        <button 
          onClick={() => {
            if (step === "day") {
              navigate(`/u/${conferenceSlug}/scan-center`);
            } else if (step === "meal") {
              reset("day");
            } else {
              reset("meal");
            }
          }}
          className="p-2.5 hover:bg-slate-100 rounded-xl transition text-slate-600 flex items-center justify-center border border-slate-200/60 shadow-sm"
          title={step === "day" ? "Back to Scan Center" : step === "meal" ? "Back to Days" : "Back to Meals"}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🍽️ Food Scan</h1>
          <p className="text-slate-500 text-sm mt-1">
            {step === "day" && "Step 1 — Select Day"}
            {step === "meal" && `Step 2 — Select Meal for Day ${selectedDay}`}
            {step === "scan" && `Day ${selectedDay} · ${selectedMeal} — Scan Participant`}
          </p>
        </div>
      </div>

      {/* STEP 1: SELECT DAY */}
      {step === "day" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => { setSelectedDay(day); setStep("meal"); }}
              className="bg-white shadow-md rounded-3xl p-10 hover:scale-105 transition-all border border-slate-200 hover:border-orange-400 hover:shadow-orange-100"
            >
              <h2 className="text-2xl font-bold text-orange-500">Day {day}</h2>
              <p className="text-gray-400 mt-2 text-sm">Select Meals</p>
            </button>
          ))}
        </div>
      )}

      {/* STEP 2: SELECT MEAL */}
      {step === "meal" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {meals.map((meal) => {
            const emoji = meal === "Breakfast" ? "☕" : meal === "Lunch" ? "🍱" : "🍽️";
            return (
              <button
                key={meal}
                onClick={() => { setSelectedMeal(meal); setStep("scan"); }}
                className="bg-white shadow-md rounded-3xl p-12 hover:scale-105 transition-all border border-slate-200 hover:border-orange-400 hover:shadow-orange-100"
              >
                <div className="text-4xl mb-3">{emoji}</div>
                <h2 className="text-xl font-bold text-slate-800">{meal}</h2>
                <p className="text-gray-400 mt-1 text-sm">Day {selectedDay}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* STEP 3: SCAN */}
      {step === "scan" && selectedDay && selectedMeal && (
        <div className="space-y-5">

          {/* QR / BARCODE INPUT */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-700 mb-3">🔍 QR / Barcode Scan</h3>
            <form onSubmit={handleQRScan} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Scan QR or type Reg ID / Phone..."
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                autoFocus
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={isProcessing || !qrInput.trim()}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 transition w-full sm:w-auto"
              >
                {isProcessing ? "..." : "Scan"}
              </button>
            </form>

            {/* Webcam scanner container */}
            <div className={`max-w-md mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 ${cameraStarted ? "block my-4" : "hidden"}`}>
              <div id="reader-food" className="w-full aspect-square" />
            </div>

            {/* Webcam scanner toggle & upload buttons */}
            <div className="border-t border-slate-100 mt-4 pt-4">
              {!cameraStarted ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={startCameraScanner}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 active:scale-95 transition-all text-base font-bold shadow-lg shadow-orange-500/15"
                  >
                    📷 Start Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById("qr-image-upload")?.click()}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-800 text-white rounded-2xl hover:bg-slate-900 active:scale-95 transition-all text-base font-bold shadow-lg shadow-slate-800/15"
                  >
                    🖼️ Upload QR Image
                  </button>
                  <input
                    type="file"
                    id="qr-image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-550 font-bold animate-pulse">📷 Camera active...</span>
                  <button
                    type="button"
                    onClick={stopCameraScanner}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 active:scale-95 transition-all text-sm font-bold border border-red-200"
                  >
                    ❌ Close Camera
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* MANUAL SEARCH */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-700 mb-3">🔎 Manual Search</h3>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by name, phone, or Reg ID..."
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition w-full sm:w-auto"
              >
                Search
              </button>
            </div>

            {isSearching && <p className="text-slate-500 text-sm">Searching...</p>}

            {searchResults.length === 0 && searchQuery && !isSearching && (
              <p className="text-slate-400 text-sm bg-gray-50 rounded-xl p-4">No participants found.</p>
            )}

            {searchResults.map((p: any) => {
              const mealKey = getMealType();
              const alreadyCollected = p.foodLogs && (p.foodLogs[mealKey] === true);
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
                        alreadyCollected 
                          ? "bg-green-600 text-white border-green-700 shadow-sm shadow-green-600/10" 
                          : foodScanCount > 0
                          ? "bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/10"
                          : "bg-slate-100 text-slate-400 border-slate-200/50"
                      }`}>
                        {selectedMeal} {alreadyCollected ? "Collected" : `Pending (${foodScanCount} other)`}
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
                      callScanAPI(p.regId || p._id);
                    }}
                    disabled={isProcessing || alreadyCollected}
                    className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm whitespace-nowrap h-fit self-end sm:self-center"
                  >
                    {alreadyCollected ? "Collected" : "✅ Mark Collected"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* DISAMBIGUATION PICKER — shown when multiple people share the same QR code */}
          {ambiguousMatches.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border-2 border-orange-400 p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-bold text-orange-700 text-lg">Multiple People Found</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    The scanned badge (<span className="font-mono font-bold">{pendingIdentifier}</span>) is shared by
                    <span className="font-bold text-orange-700"> {ambiguousMatches.length} people</span>.
                    Tap the <span className="font-bold">correct person</span> to log their food scan.
                  </p>
                </div>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {ambiguousMatches.map((p: any) => {
                  const mealKey = getMealType();
                  const alreadyCollected = p.foodLogs && (p.foodLogs[mealKey] === true);
                  return (
                    <button
                      key={String(p._id)}
                      onClick={() => !alreadyCollected && confirmPersonScan(p)}
                      disabled={isProcessing || alreadyCollected}
                      className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-xl border transition active:scale-95 disabled:opacity-60 ${
                        alreadyCollected
                          ? 'border-gray-200 bg-gray-50'
                          : 'border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-400'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-slate-800 text-base">{p.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {p.phone || "No phone"} · <span className="font-semibold">{p.category}</span> · {alreadyCollected ? '✅ Food Already Claimed' : '🍴 Pending'}
                        </p>
                      </div>
                      <span className={`text-sm font-bold px-3 py-1.5 rounded-lg text-white ${
                        alreadyCollected ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        {alreadyCollected ? 'Collected' : 'Select ✓'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => { setAmbiguousMatches([]); setPendingIdentifier(""); }}
                className="mt-4 text-sm text-slate-400 underline"
              >
                Cancel
              </button>
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
                  <p><span className="font-semibold">Reg ID:</span> {(scanResult.user.regId || scanResult.user._id || "").replace(/^(reg\s*id|regid)\s*[-\s:]*/i, "")}</p>
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

export default FoodCounter;
