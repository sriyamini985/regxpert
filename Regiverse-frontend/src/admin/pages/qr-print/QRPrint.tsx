import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import QRCode from "react-qr-code";

const QRPrint = () => {
  const [searchParams] = useSearchParams();

  const raw = searchParams.get("data");
  const participant = raw ? JSON.parse(decodeURIComponent(raw)) : null;

  // --- PERSISTENT TICK BUTTON LOGIC ---
  // Saves your check/uncheck selection directly to the browser memory
  const [showQR, setShowQR] = useState(() => {
    const saved = localStorage.getItem("badge_showQR");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("badge_showQR", JSON.stringify(showQR));
  }, [showQR]);

  // Triggers the browser print prompt automatically on window load
  useEffect(() => {
    if (!participant) return;

    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, [participant]);

  if (!participant) {
    return (
      <div className="p-10 text-center font-bold text-lg text-red-500">
        No participant found
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          body {
            margin: 0;
            background: white;
          }

          @media print {
            .no-print { display: none !important; }
            @page { margin: 0; }
          }
        `}
      </style>

      {/* --- TOP PANEL (Only visible on screen, hidden on physical print) --- */}
      <div className="no-print bg-slate-900 text-white p-4 flex gap-6 items-center justify-center sticky top-0 z-50 shadow-md">
        <label className="flex items-center gap-2 cursor-pointer font-bold text-white select-none">
          <input 
            type="checkbox" 
            checked={showQR} 
            onChange={(e) => setShowQR(e.target.checked)}
            className="w-5 h-5 accent-blue-500 cursor-pointer"
          />
          Include QR Code
        </label>
        
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-bold text-sm transition-all"
        >
          🖨️ Print Badge
        </button>
      </div>

      {/* --- THE BADGE LAYOUT (Permanently centered, no alignment options, no ID text) --- */}
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-white text-center px-4">

        {showQR && (
          <div className="mb-8">
            <QRCode
              value={participant.regId || participant._id}
              size={250} // Fixed fallback dimension
            />
          </div>
        )}

        <h1 className="text-4xl font-bold text-black tracking-tight max-w-xl">
          {participant.name}
        </h1>

      </div>
    </>
  );
};

export default QRPrint;