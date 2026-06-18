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
  badgeSize?: string;
  topSpacing?: number;
  printPhoto?: boolean;
  printName?: boolean;
  printQR?: boolean;
  printRegId?: boolean;
  printCity?: boolean;
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
  topSpacing?: number;
  printPhoto?: boolean;
  printName?: boolean;
  printQR?: boolean;
  printRegId?: boolean;
  printCity?: boolean;
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

interface BadgeDimensions {
  widthMm: number;
  heightMm: number;
  photoWidthMm: number;
  photoHeightMm: number;
  fontSizeName: string;
  fontSizeOrg: string;
  fontSizeRegId: string;
  gap: string;
}

const BADGE_SIZES: Record<string, BadgeDimensions> = {
  standard: {
    widthMm: 54,
    heightMm: 86,
    photoWidthMm: 20,
    photoHeightMm: 24,
    fontSizeName: "12px",
    fontSizeOrg: "7.5px",
    fontSizeRegId: "7px",
    gap: "1.5mm"
  },
  A6: {
    widthMm: 105,
    heightMm: 148,
    photoWidthMm: 40,
    photoHeightMm: 48,
    fontSizeName: "20px",
    fontSizeOrg: "12px",
    fontSizeRegId: "10px",
    gap: "2.5mm"
  },
  A5: {
    widthMm: 148,
    heightMm: 210,
    photoWidthMm: 58,
    photoHeightMm: 70,
    fontSizeName: "30px",
    fontSizeOrg: "18px",
    fontSizeRegId: "14px",
    gap: "4mm"
  },
  "3x4": {
    widthMm: 76,
    heightMm: 102,
    photoWidthMm: 30,
    photoHeightMm: 36,
    fontSizeName: "16px",
    fontSizeOrg: "9px",
    fontSizeRegId: "8.5px",
    gap: "2mm"
  },
  "4x6": {
    widthMm: 102,
    heightMm: 152,
    photoWidthMm: 40,
    photoHeightMm: 48,
    fontSizeName: "22px",
    fontSizeOrg: "13px",
    fontSizeRegId: "11px",
    gap: "3mm"
  }
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

  const [topSpacing, setTopSpacing] = useState<number>(() => {
    return payload?.topSpacing !== undefined 
      ? payload.topSpacing 
      : (payload?.badges && (payload.badges as any)[0]?.topSpacing !== undefined) 
        ? (payload.badges as any)[0].topSpacing 
        : 20;
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

  // 2. Auto-trigger print dialog after images load
  useEffect(() => {
    if (badges.length === 0) return;

    const triggerPrint = () => {
      window.print();
      if (badgeBackUrl) {
        window.location.href = badgeBackUrl;
      }
    };

    // Find all images within the badge container
    const images = Array.from(document.querySelectorAll(".badge-container img"));
    
    if (images.length === 0) {
      const timer = setTimeout(triggerPrint, 1200);
      return () => clearTimeout(timer);
    }

    let loadedCount = 0;
    let resolved = false;

    // Set a maximum fallback timeout of 4 seconds so it will still print even if an image fails to load
    const fallbackTimer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        triggerPrint();
      }
    }, 4000);

    const checkAllLoaded = () => {
      if (loadedCount === images.length && !resolved) {
        resolved = true;
        clearTimeout(fallbackTimer);
        // Small delay to ensure rendering completes
        setTimeout(triggerPrint, 500);
      }
    };

    images.forEach((img: any) => {
      if (img.complete) {
        loadedCount++;
        checkAllLoaded();
      } else {
        img.addEventListener("load", () => {
          loadedCount++;
          checkAllLoaded();
        });
        img.addEventListener("error", () => {
          loadedCount++;
          checkAllLoaded();
        });
      }
    });

    return () => clearTimeout(fallbackTimer);
  }, [payload, badgeBackUrl]);

  const handleDownloadPDF = () => {
    if (!(window as any).html2pdf) {
      alert("PDF library is still loading. Please try again in a second.");
      return;
    }

    const element = document.getElementById("badges-container-wrapper");
    if (!element) return;

    const dim = BADGE_SIZES[badgeSize] || BADGE_SIZES.standard;
    const formatVal = badgeSize === "A5" ? "a5" : badgeSize === "A6" ? "a6" : [dim.widthMm, dim.heightMm];

    const opt = {
      margin:       0,
      filename:     badges.length === 1 ? `badge-${badges[0].regId || "pass"}.pdf` : `badges-bulk-${badges.length}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: formatVal, orientation: 'portrait' }
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
            width: ${BADGE_SIZES[badgeSize]?.widthMm || 54}mm;
            height: ${BADGE_SIZES[badgeSize]?.heightMm || 86}mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            text-align: center;
            background: white;
            margin: 20px auto;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            padding-top: ${topSpacing}mm;
            padding-left: 0;
            padding-right: 0;
            padding-bottom: 0;
            gap: ${BADGE_SIZES[badgeSize]?.gap || "1.5mm"};
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
              size: ${BADGE_SIZES[badgeSize]?.widthMm || 54}mm ${BADGE_SIZES[badgeSize]?.heightMm || 86}mm; 
              margin: 0 !important; 
            }
            html, body { 
              margin: 0 !important; 
              padding: 0 !important;
              background: white;
            }
            .badge-container {
              position: relative !important;
              width: ${BADGE_SIZES[badgeSize]?.widthMm || 54}mm !important;
              height: ${BADGE_SIZES[badgeSize]?.heightMm || 86}mm !important;
              margin: 0 !important;
              padding-top: ${topSpacing}mm !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
              padding-bottom: 0 !important;
              box-sizing: border-box !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              page-break-after: always !important;
              page-break-inside: avoid !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: flex-start !important;
              align-items: center !important;
              background: white !important;
              gap: ${BADGE_SIZES[badgeSize]?.gap || "1.5mm"} !important;
            }
          }
        `}
      </style>

      {/* Screen-only top control panel */}
      <div className="no-print bg-slate-900 text-white p-4 flex flex-col gap-2 items-center justify-center sticky top-0 z-50 shadow-md">
        <div className="flex gap-6 items-center flex-wrap justify-center font-sans">
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
              <option value="standard">Standard (CR80) (86x54mm)</option>
              <option value="A6">A6 Size Badge (148x105mm)</option>
              <option value="A5">A5 Size Badge (210x148mm)</option>
              <option value="3x4">3" x 4" Badge (102x76mm)</option>
              <option value="4x6">4" x 6" Badge (152x102mm)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Top Spacing:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={topSpacing}
              onChange={(e) => setTopSpacing(Number(e.target.value))}
              className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-xs font-bold text-blue-400 font-mono w-10">{topSpacing}mm</span>
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
        <p className="text-[11px] text-slate-400 font-bold font-sans">
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
          const badgeCheckpoints = badge.checkpoints || [];

          // Dynamic fields parsing from Excel spreadsheet imports
          const photoUrl = badge.dynamicData?.Photo || badge.dynamicData?.["Participant Photo"] || badge.dynamicData?.Avatar || "";
          const orgStr = badge.dynamicData?.Organization || badge.dynamicData?.Institution || badge.dynamicData?.Company || "";

          const showPhoto = badge.printPhoto ?? true;
          const showName = badge.printName ?? true;
          const showQR = badge.printQR ?? true;
          const showRegId = badge.printRegId ?? true;
          const showCity = badge.printCity ?? true;

          const themeColor = getCategoryColor(badgeDestination);
          const dim = BADGE_SIZES[badgeSize] || BADGE_SIZES.standard;

          return (
            <div key={index} className="badge-container">
              


              {/* B. Middle Section: Attendee Profile */}
              <div style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: "0 3.5mm",
                boxSizing: "border-box"
              }}>
                {/* 1. Portrait Photo Frame with viewfinder corners */}
                {showPhoto && (
                  <div style={{
                    position: "relative",
                    width: `${dim.photoWidthMm}mm`,
                    height: `${dim.photoHeightMm}mm`,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    marginBottom: "1mm",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    padding: "1.5px"
                  }}>
                    {/* Viewfinder Corner Accents */}
                    <div style={{ position: "absolute", top: 0, left: 0, width: "5px", height: "5px", borderTop: `1.5px solid ${themeColor}`, borderLeft: `1.5px solid ${themeColor}` }} />
                    <div style={{ position: "absolute", top: 0, right: 0, width: "5px", height: "5px", borderTop: `1.5px solid ${themeColor}`, borderRight: `1.5px solid ${themeColor}` }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, width: "5px", height: "5px", borderBottom: `1.5px solid ${themeColor}`, borderLeft: `1.5px solid ${themeColor}` }} />
                    <div style={{ position: "absolute", bottom: 0, right: 0, width: "5px", height: "5px", borderBottom: `1.5px solid ${themeColor}`, borderRight: `1.5px solid ${themeColor}` }} />

                    {photoUrl ? (
                      <img src={photoUrl} alt="Participant" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "2px" }} />
                    ) : (
                      <svg style={{ width: "9mm", height: "9mm", color: "#cbd5e1" }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0 1 12.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                      </svg>
                    )}
                  </div>
                )}

                {/* 2. Full Name */}
                {showName && (
                  <h1 style={{ 
                    fontSize: dim.fontSizeName, 
                    fontWeight: 800, 
                    color: "#0f172a", 
                    margin: 0, 
                    lineHeight: 1.15,
                    textTransform: "uppercase",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    letterSpacing: "0.1px",
                    fontFamily: "system-ui, -apple-system, sans-serif"
                  }}>
                    {badgeName}
                  </h1>
                )}

                {/* 3. Designation & Organization Details */}
                {orgStr && (
                  <p style={{
                    fontSize: dim.fontSizeOrg,
                    fontWeight: 600,
                    color: "#475569",
                    margin: "0.5mm 0 0 0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                    textTransform: "uppercase"
                  }}>
                    {orgStr}
                  </p>
                )}
                
                {/* 4. City / Location Details */}
                {showCity && badgeState && (
                  <p style={{
                    fontSize: dim.fontSizeOrg,
                    fontWeight: 600,
                    color: "#64748b",
                    margin: "0.2mm 0 0 0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                    textTransform: "uppercase"
                  }}>
                    {badgeState}
                  </p>
                )}
              </div>

              {/* Decorative Divider */}
              <div style={{
                position: "relative",
                zIndex: 1,
                width: "80%",
                height: "1px",
                background: "linear-gradient(to right, transparent, #e2e8f0, transparent)",
                margin: "0.5mm 0"
              }} />

              {/* C. QR Code & Reg ID Section */}
              {(showQR || showRegId) && (
                <div style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3.5mm 4mm 3.5mm",
                  boxSizing: "border-box"
                }}>
                  {showQR && badgeCheckpoints.includes("QR Code") && (
                    <div style={{ 
                      margin: "0 0 0.5mm 0", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      background: "#ffffff",
                      padding: "0.8mm",
                      borderRadius: "6px",
                      border: `1.5px solid ${themeColor}25`,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                      width: `${dim.photoWidthMm}mm`,
                      height: `${dim.photoWidthMm}mm`,
                      boxSizing: "border-box"
                    }}>
                      <QRCode 
                        value={badgeQrCode} 
                        size={256} 
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      />
                    </div>
                  )}
                  {showRegId && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "1mm"
                    }}>
                      <p style={{ 
                        fontSize: dim.fontSizeRegId, 
                        fontWeight: 700, 
                        color: "#475569", 
                        margin: 0,
                        letterSpacing: "0.2px",
                        fontFamily: "system-ui, -apple-system, sans-serif"
                      }}>
                        Reg ID: <span style={{ color: "#0f172a", fontWeight: 800 }}>{badgeRegId}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </>
  );
};

export default QRPrint;