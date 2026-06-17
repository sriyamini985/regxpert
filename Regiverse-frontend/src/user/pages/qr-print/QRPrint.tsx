import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import QRCode from "react-qr-code";

interface ParticipantPayload {
  name: string;
  destination?: string;
  category?: string;
  state?: string;
  city?: string;
  regId: string;
  qrCode?: string;
  checkpoints?: string[];
  _id?: string;
  dynamicData?: Record<string, any>;
  conferenceName?: string;
}

const QRPrint = () => {
  const [searchParams] = useSearchParams();
  const raw = searchParams.get("data");

  const participant: (ParticipantPayload & { backUrl?: string }) | null = raw ? JSON.parse(decodeURIComponent(raw)) : null;
  const badgeConferenceName = participant?.conferenceName || "";

  useEffect(() => {
    if (!participant) return;
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, [participant]);

  if (!participant) {
    return <div className="p-10 text-center font-bold text-red-500">No participant found</div>;
  }

  // Safe fallback values
  const badgeName = participant.name;
  const badgeDestination = participant.destination || participant.category || participant.dynamicData?.Destination || "";
  const badgeRegId = participant.regId || participant._id || "";
  const badgeQrCode = participant.qrCode || badgeRegId;
  const badgeCheckpoints = participant.checkpoints || [];

  return (
    <>
      <style>
        {`
          body { 
            margin: 0; 
            background: white; 
            font-family: system-ui, -apple-system, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Container styling for preview on screen */
          .badge-container {
            width: 54mm;
            height: 86mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            text-align: center;
            background: white;
            margin: 20px auto;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            padding: 0;
          }

          @media print {
            .no-print { display: none !important; }
            body * {
              visibility: hidden;
            }
            .badge-container,
            .badge-container * {
              visibility: visible !important;
            }
            @page { 
              size: 54mm 86mm; 
              margin: 0 !important; 
            }
            html, body { 
              margin: 0 !important; 
              padding: 0 !important;
              background: white;
            }
            .badge-container {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 54mm !important;
              height: 86mm !important;
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              page-break-inside: avoid !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              background: white !important;
            }
          }
        `}
      </style>

      {/* Screen only top panel */}
      <div className="no-print bg-slate-900 text-white p-4 flex flex-col gap-2 items-center justify-center sticky top-0 z-50 shadow-md">
        <div className="flex gap-6 items-center">
          <span className="text-sm font-semibold">🖨️ Premium ID Badge Print Preview</span>
          <button 
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-bold text-sm transition-all"
          >
            Print Badge
          </button>
        </div>
        <p className="text-xs text-slate-400 font-bold">
          ⚠️ Tip: In the printer settings, uncheck "Headers and footers" and set "Margins" to "None" for a perfect print!
        </p>
      </div>

      {/* Premium Event ID Card layout (54mm x 86mm) */}
      <div className="badge-container">
        
        {/* A. Conference Title Header */}
        <div style={{
          width: "100%",
          padding: "4mm 4mm 1mm 4mm",
          boxSizing: "border-box"
        }}>
          <p style={{
            fontSize: "7.5px",
            fontWeight: 800,
            color: "#1e293b",
            margin: 0,
            textTransform: "uppercase",
            lineHeight: 1.25,
            letterSpacing: "0.4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical"
          }}>
            {badgeConferenceName || "EVENT ATTENDEE"}
          </p>
        </div>

        {/* B. Center Attendee Details */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1,
          width: "100%",
          padding: "0 4mm",
          boxSizing: "border-box"
        }}>
          {/* 1. Name */}
          <h1 style={{ 
            fontSize: "14px", 
            fontWeight: 800, 
            color: "#000000", 
            margin: "0 0 3.5mm 0", 
            lineHeight: 1.25,
            textTransform: "uppercase",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical"
          }}>
            {badgeName}
          </h1>

          {/* 2. QR Code */}
          {badgeCheckpoints.includes("QR Code") && (
            <div style={{ 
              margin: "0 0 2.5mm 0", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              background: "#ffffff",
              padding: "1.5mm",
              borderRadius: "4px",
              border: "1px solid #e2e8f0"
            }}>
              <QRCode value={badgeQrCode} size={110} />
            </div>
          )}

          {/* 3. Registration ID */}
          <p style={{ 
            fontSize: "10px", 
            fontFamily: "monospace", 
            fontWeight: 700, 
            color: "#334155", 
            margin: 0,
            letterSpacing: "0.5px"
          }}>
            {badgeRegId}
          </p>
        </div>

        {/* C. Solid Black Category Banner */}
        <div style={{
          width: "100%",
          background: "#000000",
          padding: "3mm 0",
          textAlign: "center",
          boxSizing: "border-box"
        }}>
          <p style={{
            fontSize: "11px",
            fontWeight: 900,
            color: "#ffffff",
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "1px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            {badgeDestination || "DELEGATE"}
          </p>
        </div>

      </div>
    </>
  );
};

export default QRPrint;