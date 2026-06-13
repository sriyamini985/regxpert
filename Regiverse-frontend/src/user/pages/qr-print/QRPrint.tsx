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
}

const QRPrint = () => {
  const [searchParams] = useSearchParams();
  const raw = searchParams.get("data");

  const participant: ParticipantPayload | null = raw ? JSON.parse(decodeURIComponent(raw)) : null;

  useEffect(() => {
    if (!participant) return;
    const timer = setTimeout(() => {
      window.print();
    }, 600);
    return () => clearTimeout(timer);
  }, [participant]);

  if (!participant) {
    return <div className="p-10 text-center font-bold text-red-500">No participant found</div>;
  }

  // Safe fallback values
  const badgeName = participant.name;
  const badgeDestination = participant.destination || participant.category || participant.dynamicData?.Destination || "";
  const badgeState = participant.state || participant.city || participant.dynamicData?.City || "";
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
            padding: 4mm;
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
            border-top: 6px solid #2563eb;
          }

          @media print {
            .no-print { display: none !important; }
            @page { 
              size: 54mm 86mm; 
              margin: 0; 
            }
            body { 
              margin: 0; 
              background: white;
            }
            .badge-container {
              margin: 0;
              border: none;
              box-shadow: none;
              border-radius: 0;
              border-top: 6px solid #2563eb;
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      {/* Screen only top panel */}
      <div className="no-print bg-slate-900 text-white p-4 flex gap-6 items-center justify-center sticky top-0 z-50 shadow-md">
        <span className="text-sm font-semibold">🖨️ CR80 Badge Print Preview</span>
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-bold text-sm transition-all"
        >
          Print Badge
        </button>
      </div>

      {/* CR80 Portrait Badge Container (54mm x 86mm) */}
      <div className="badge-container">
        
        {/* 1. Name */}
        <div style={{ width: "100%", marginTop: "1mm" }}>
          <h1 style={{ 
            fontSize: "15px", 
            fontWeight: 800, 
            color: "#0f172a", 
            margin: 0, 
            lineHeight: 1.25,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical"
          }}>
            {badgeName}
          </h1>
        </div>

        {/* 2. Destination */}
        <div style={{ width: "100%", marginTop: "0.5mm" }}>
          <p style={{ 
            fontSize: "11px", 
            fontWeight: 700, 
            color: "#475569", 
            margin: 0, 
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            {badgeDestination || "Delegate"}
          </p>
        </div>

        {/* 3. City / State */}
        <div style={{ width: "100%", marginTop: "0.5mm" }}>
          <p style={{ 
            fontSize: "9px", 
            fontWeight: 600, 
            color: "#94a3b8", 
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            {badgeState || "Event Attendee"}
          </p>
        </div>

        {/* 4. QR Code */}
        <div style={{ 
          margin: "3mm 0", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          background: "#fff",
          padding: "1.5mm",
          borderRadius: "8px",
          border: "1px solid #f1f5f9"
        }}>
          <QRCode value={badgeQrCode} size={110} />
        </div>

        {/* 5. Registration ID */}
        <div style={{ width: "100%" }}>
          <p style={{ 
            fontSize: "9px", 
            fontFamily: "monospace", 
            fontWeight: 700, 
            color: "#334155", 
            margin: 0,
            letterSpacing: "0.5px"
          }}>
            {badgeRegId}
          </p>
        </div>

        {/* 6. Assigned Checkpoints */}
        <div style={{ width: "100%", marginBottom: "1mm", marginTop: "1mm" }}>
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "2px", 
            justifyContent: "center", 
            maxHeight: "14mm", 
            overflow: "hidden" 
          }}>
            {badgeCheckpoints.map((cp) => (
              <span 
                key={cp}
                style={{ 
                  fontSize: "7px", 
                  fontWeight: 900, 
                  background: "#eff6ff", 
                  color: "#1d4ed8", 
                  border: "0.5px solid #bfdbfe", 
                  borderRadius: "3px", 
                  padding: "0.5px 3.5px", 
                  textTransform: "uppercase" 
                }}
              >
                {cp}
              </span>
            ))}
            {badgeCheckpoints.length === 0 && (
              <span style={{ fontSize: "7px", fontWeight: 700, color: "#cbd5e1", fontStyle: "italic" }}>
                No Checkpoints
              </span>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default QRPrint;