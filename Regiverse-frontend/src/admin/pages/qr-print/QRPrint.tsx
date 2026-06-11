import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import QRCode from "react-qr-code";

const QRPrint = () => {
  const [searchParams] = useSearchParams();

  const raw = searchParams.get("data");
  const participant = raw ? JSON.parse(decodeURIComponent(raw)) : null;

  const [showQR, setShowQR] = useState(() => {
    const saved = localStorage.getItem("badge_showQR");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("badge_showQR", JSON.stringify(showQR));
  }, [showQR]);

  useEffect(() => {
    if (!participant) return;

    const timer = setTimeout(() => {
      window.print();
    }, 1000); // 1-second delay ensures the QR code is fully loaded before launching

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
          /* SCREEN STYLES */
          body {
            margin: 0;
            background: white;
          }

          /* PRINT STYLES: This isolates ONLY the badge area */
          @media print {
            /* 1. Hide absolutely every single element on the entire webpage */
            body * {
              visibility: hidden !important;
            }

            /* 2. Make ONLY our specific badge block and its internal text/images visible */
            .printable-badge-area, .printable-badge-area * {
              visibility: visible !important;
            }

            /* 3. Force the badge block to sit perfectly at the top-left corner of the paper printout */
            .printable-badge-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
            }

            @page {
              margin: 0;
              size: auto;
            }
          }
        `}
      </style>

      {/* --- TOP CONTROL PANEL (Only on screen, hidden automatically) --- */}
      <div className="no-print bg-slate-900 text-white p-4 flex gap-6 items-center justify-center sticky top-0 z-50 shadow-md font-sans">
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

      {/* --- THE ISOLATED BADGE AREA --- */}
      {/* The class "printable-badge-area" matches our strict visibility CSS rule above */}
      <div className="printable-badge-area w-screen h-screen flex flex-col items-center justify-center bg-white text-center px-4 font-sans">

        {showQR && (
          <div className="mb-8 p-2 bg-white inline-block">
            <QRCode
              value={participant.regId || participant._id}
              size={250}
            />
          </div>
        )}

        <h1 className="text-4xl font-bold text-black tracking-tight max-w-xl uppercase break-words">
          {participant.name}
        </h1>

      </div>
    </>
  );
};

export default QRPrint;