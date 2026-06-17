import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import QRCode from "react-qr-code";

interface BadgePayload {
  name: string;
  destination?: string;
  category?: string;
  state?: string;
  city?: string;
  regId: string;
  qrCode?: string; // Formatted details text block
  checkpoints?: string[];
  conferenceName?: string;
  dynamicData?: Record<string, any>;
}

interface RootPayload {
  badges?: BadgePayload[];
  name?: string;
  destination?: string;
  category?: string;
  state?: string;
  city?: string;
  regId?: string;
  qrCode?: string;
  checkpoints?: string[];
  conferenceName?: string;
  dynamicData?: Record<string, any>;
  backUrl?: string;
  badgeSize?: string;
}

const getCategoryColor = (category: string) => {
  const cat = String(category).toLowerCase();
  if (cat.includes("faculty") || cat.includes("speaker") || cat.includes("presenter") || cat.includes("guest")) {
    return "#312e81"; // Premium Deep Indigo
  }
  if (cat.includes("organizer") || cat.includes("staff") || cat.includes("admin")) {
    return "#064e3b"; // Deep Emerald Green
  }
  if (cat.includes("exhibitor") || cat.includes("sponsor")) {
    return "#854d0e"; // Deep Gold/Amber
  }
  if (cat.includes("volunteer")) {
    return "#991b1b"; // Deep Crimson Red
  }
  return "#1e3a8a"; // Deep Blue for Delegates
};

const QRPrint = () => {
  const [searchParams] = useSearchParams();
  const raw = searchParams.get("data");

  let payload: RootPayload | null = null;
  if (raw) {
    try {
      payload = JSON.parse(decodeURIComponent(raw));
    } catch (e) {
      console.error("Failed to parse URL search data", e);
    }
  }

  if (!payload) {
    const sessionData = sessionStorage.getItem("print_badge_data");
    if (sessionData) {
      try {
        payload = JSON.parse(sessionData);
      } catch (e) {
        console.error("Failed to parse sessionStorage print data", e);
      }
    }
  }

  const badgeBackUrl = payload?.backUrl || "";

  // Normalize single vs bulk print payloads
  const badges: BadgePayload[] = payload?.badges || (payload ? [payload as BadgePayload] : []);

  const [badgeSize, setBadgeSize] = useState<string>(() => {
    return payload?.badgeSize || (payload?.badges && payload.badges[0]?.badgeSize) || "standard";
  });

  // 1. Dynamic html2pdf script loader
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 2. Auto-trigger print dialog after 1s
  useEffect(() => {
    if (badges.length === 0) return;
    const timer = setTimeout(() => {
      window.print();
      if (badgeBackUrl) {
        window.location.href = badgeBackUrl;
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [payload, badgeBackUrl]);

  const handleDownloadPDF = () => {
    if (!(window as any).html2pdf) {
      alert("PDF library is still loading. Please try again in a second.");
      return;
    }

    const element = document.getElementById("badges-container-wrapper");
    if (!element) return;

    const opt = {
      margin:       0,
      filename:     badges.length === 1 ? `badge-${badges[0].regId || "pass"}.pdf` : `badges-bulk-${badges.length}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: badgeSize === "A5" ? 'a5' : [54, 86], orientation: 'portrait' }
    };

    (window as any).html2pdf().from(element).set(opt).save();
  };

  if (badges.length === 0) {
    return <div className="p-10 text-center font-bold text-red-500">No badge records found.</div>;
  }

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
            width: ${badgeSize === "A5" ? "148mm" : "54mm"};
            height: ${badgeSize === "A5" ? "210mm" : "86mm"};
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
            #badges-container-wrapper,
            #badges-container-wrapper * {
              visibility: visible !important;
            }
            @page { 
              size: ${badgeSize === "A5" ? "148mm 210mm" : "54mm 86mm"}; 
              margin: 0 !important; 
            }
            html, body { 
              margin: 0 !important; 
              padding: 0 !important;
              background: white;
            }
            .badge-container {
              position: relative !important;
              width: ${badgeSize === "A5" ? "148mm !important" : "54mm !important"};
              height: ${badgeSize === "A5" ? "210mm !important" : "86mm !important"};
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              page-break-after: always !important;
              page-break-inside: avoid !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              background: white !important;
            }
          }
        `}
      </style>

      {/* Screen-only top control panel */}
      <div className="no-print bg-slate-900 text-white p-4 flex flex-col gap-2 items-center justify-center sticky top-0 z-50 shadow-md">
        <div className="flex gap-6 items-center flex-wrap justify-center">
          <span className="text-sm font-semibold">🖨️ RegXperts Premium Badge Printing Portal</span>
          <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-mono">
            Count: {badges.length} Badge(s)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Size:</span>
            <select
              value={badgeSize}
              onChange={(e) => setBadgeSize(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 px-3 py-1 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="standard">Standard (CR80)</option>
              <option value="A5">A5 Size Badge</option>
            </select>
          </div>
          <button 
            onClick={() => {
              if (badgeBackUrl) {
                window.location.href = badgeBackUrl;
              } else {
                window.history.back();
              }
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-1.5 rounded-lg font-bold text-sm transition-all"
          >
            ← Back
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-bold text-sm transition-all"
          >
            Print Badge(s)
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg font-bold text-sm transition-all"
          >
            Download PDF
          </button>
        </div>
        <p className="text-[11px] text-slate-400 font-bold">
          ⚠️ Tip: In the printer settings, uncheck "Headers and footers" and set "Margins" to "None" for a perfect print!
        </p>
      </div>

      {/* Badges container wrapper */}
      <div id="badges-container-wrapper" className="flex flex-col items-center bg-slate-100 min-h-screen py-10 print:py-0 print:bg-white">
        {badges.map((badge, index) => {
          const badgeName = badge.name;
          const badgeDestination = badge.destination || badge.category || badge.dynamicData?.Destination || "";
          const badgeState = badge.state || badge.city || badge.dynamicData?.City || "";
          const badgeRegId = badge.regId || "";
          const badgeQrCode = badge.qrCode || badgeRegId;
          const badgeConferenceName = badge.conferenceName || "";
          const badgeCheckpoints = badge.checkpoints || [];

          // Dynamic fields parsing from Excel spreadsheet imports
          const themeStr = badge.dynamicData?.Theme || badge.dynamicData?.["Event Theme"] || "Innovate | Collaborate | Transform";
          const venueStr = badge.dynamicData?.Venue || badge.dynamicData?.["Event Venue"] || "Radisson Blu Resort, Temple Bay Mamallapuram";
          const datesStr = badge.dynamicData?.Dates || badge.dynamicData?.["Event Dates"] || "08th - 11th Jan 2026";
          const photoUrl = badge.dynamicData?.Photo || badge.dynamicData?.["Participant Photo"] || badge.dynamicData?.Avatar || "";
          const orgStr = badge.dynamicData?.Organization || badge.dynamicData?.Institution || badge.dynamicData?.Company || "";

          return (
            <div key={index} className="badge-container">
              
              {/* B. Middle Section: Attendee Profile */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexGrow: 1,
                width: "100%",
                padding: badgeSize === "A5" ? "18mm 10mm 2mm 10mm" : "6.5mm 3.5mm 0.5mm 3.5mm",
                boxSizing: "border-box"
              }}>
                {/* 1. Portrait Photo Frame */}
                <div style={{
                  width: badgeSize === "A5" ? "45mm" : "18mm",
                  height: badgeSize === "A5" ? "55mm" : "22mm",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  marginBottom: badgeSize === "A5" ? "4mm" : "1.5mm",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
                }}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="Participant" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <svg style={{ width: badgeSize === "A5" ? "20mm" : "8mm", height: badgeSize === "A5" ? "20mm" : "8mm", color: "#cbd5e1" }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0 1 12.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                    </svg>
                  )}
                </div>

                {/* 2. Full Name */}
                <h1 style={{ 
                  fontSize: badgeSize === "A5" ? "32px" : "13px", 
                  fontWeight: 900, 
                  color: "#000000", 
                  margin: 0, 
                  lineHeight: 1.2,
                  textTransform: "uppercase",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical"
                }}>
                  {badgeName}
                </h1>

                {/* 3. Designation & Organization Details */}
                {orgStr && (
                  <p style={{
                    fontSize: badgeSize === "A5" ? "18px" : "7.5px",
                    fontWeight: 600,
                    color: "#475569",
                    margin: badgeSize === "A5" ? "1.5mm 0 0 0" : "0.5mm 0 0 0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                    textTransform: "uppercase"
                  }}>
                    {orgStr}
                  </p>
                )}
                
                <p style={{
                  fontSize: badgeSize === "A5" ? "16px" : "7px",
                  fontWeight: 600,
                  color: "#64748b",
                  margin: badgeSize === "A5" ? "1mm 0 0 0" : "0.2mm 0 0 0",
                  textTransform: "uppercase"
                }}>
                  {badgeState || "India"}
                </p>
              </div>

              {/* C. QR Code & Reg ID Section */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: badgeSize === "A5" ? "0 10mm 4mm 10mm" : "0 3.5mm 1.5mm 3.5mm",
                boxSizing: "border-box"
              }}>
                {badgeCheckpoints.includes("QR Code") && (
                  <div style={{ 
                    margin: badgeSize === "A5" ? "0 0 3mm 0" : "0 0 1mm 0", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    background: "#ffffff",
                    padding: badgeSize === "A5" ? "3.2mm" : "1.2mm",
                    borderRadius: badgeSize === "A5" ? "10px" : "4px",
                    border: "0.5px solid #cbd5e1"
                  }}>
                    <QRCode value={badgeQrCode} size={badgeSize === "A5" ? 180 : 90} />
                  </div>
                )}
                <p style={{ 
                  fontSize: badgeSize === "A5" ? "22px" : "9px", 
                  fontFamily: "monospace", 
                  fontWeight: 800, 
                  color: "#1e293b", 
                  margin: 0,
                  letterSpacing: badgeSize === "A5" ? "0.5px" : "0.2px"
                }}>
                  {badgeRegId}
                </p>
              </div>

              {/* D. Bottom Section: Category Ribbon Banner */}
              <div style={{
                width: "100%",
                background: getCategoryColor(badgeDestination),
                padding: badgeSize === "A5" ? "6mm 0" : "2.5mm 0",
                textAlign: "center",
                boxSizing: "border-box",
                flexShrink: 0
              }}>
                <p style={{
                  fontSize: badgeSize === "A5" ? "26px" : "10.5px",
                  fontWeight: 900,
                  color: "#ffffff",
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: badgeSize === "A5" ? "2px" : "0.8px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {badgeDestination || "DELEGATE"}
                </p>
              </div>

            </div>
          );
        })}
      </div>
    </>
  );
};

export default QRPrint;