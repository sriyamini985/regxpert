import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { API_URL } from "../../../config/api";

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
  participantId?: string;
  operatorEmail?: string;
  nextBadgePayload?: any;
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
  participantId?: string;
  operatorEmail?: string;
  nextBadgePayload?: any;
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

const getParticipantPhoto = (p: any): string => {
  if (!p) return "";
  
  let rawPhoto = "";
  
  // 1. Check root level properties first
  if (p.avatar) rawPhoto = p.avatar;
  else if (p.avatarUrl) rawPhoto = p.avatarUrl;
  else if (p.photo) rawPhoto = p.photo;
  else if (p.dynamicData) {
    // 2. Direct dynamicData checks
    if (p.dynamicData.Photo) rawPhoto = p.dynamicData.Photo;
    else if (p.dynamicData.Avatar) rawPhoto = p.dynamicData.Avatar;
    else if (p.dynamicData.avatarUrl) rawPhoto = p.dynamicData.avatarUrl;
    else {
      // 3. Scan keys for variations in dynamicData
      const keys = Object.keys(p.dynamicData);
      const photoKeys = [
        "photo", "profilephoto", "participantphoto", "avatar", "image", 
        "picture", "pic", "photourl", "imagelink", "photolink"
      ];
      for (const key of keys) {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (photoKeys.includes(normalizedKey)) {
          rawPhoto = p.dynamicData[key];
          break;
        }
      }
      
      // 4. Scan values for image patterns in dynamicData
      if (!rawPhoto) {
        for (const key of keys) {
          const val = String(p.dynamicData[key] || "").trim();
          if (val.startsWith("http") && (
            val.toLowerCase().endsWith(".jpg") || val.toLowerCase().endsWith(".jpeg") || 
            val.toLowerCase().endsWith(".png") || val.toLowerCase().endsWith(".webp") || 
            val.toLowerCase().endsWith(".gif") || val.includes("/profile_photo/") ||
            val.includes("/uploads/")
          )) {
            rawPhoto = p.dynamicData[key];
            break;
          }
        }
      }
    }
  }

  if (!rawPhoto) return "";

  // Convert to string and trim
  let srcUrl = String(rawPhoto).trim();
  if (!srcUrl) return "";

  // If it's already a full URL, return it
  if (srcUrl.startsWith("http://") || srcUrl.startsWith("https://") || srcUrl.startsWith("data:image")) {
    return srcUrl;
  }

  // If it's a relative URL, prefix it with API_URL
  const apiBase = API_URL;
  // Check if it looks like a path or just a filename
  if (srcUrl.startsWith("/") || srcUrl.includes("uploads") || srcUrl.includes("profile_photo")) {
    return `${apiBase}/${srcUrl.startsWith("/") ? srcUrl.slice(1) : srcUrl}`;
  } else {
    // Treat as raw filename in uploads
    return `${apiBase}/uploads/${srcUrl}`;
  }
};

const shouldApplyCors = (url: string) => {
  if (!url) return false;
  if (url.startsWith("data:")) return false;
  if (url.startsWith(API_URL) || url.startsWith("/")) return true;
  return false;
};

const QRPrint = () => {
  const [searchParams] = useSearchParams();
  const raw = searchParams.get("data");

  // Load initial payload
  const initialPayload = (() => {
    if (raw) {
      try {
        return JSON.parse(decodeURIComponent(raw));
      } catch (e) {
        console.error("Failed to parse URL search data", e);
      }
    }
    const sessionData = sessionStorage.getItem("print_badge_data");
    if (sessionData) {
      try {
        return JSON.parse(sessionData);
      } catch (e) {
        console.error("Failed to parse sessionStorage print data", e);
      }
    }
    return null;
  })();

  const [activePayload, setActivePayload] = useState<RootPayload | null>(initialPayload);
  const [badgeSize, setBadgeSize] = useState<string>(() => {
    const localVal = localStorage.getItem("regxpert_badge_size");
    if (localVal) return localVal;
    return activePayload?.badgeSize || (activePayload?.badges && activePayload.badges[0]?.badgeSize) || "standard";
  });

  const [topSpacing, setTopSpacing] = useState<number>(() => {
    const localVal = localStorage.getItem("regxpert_badge_top_spacing");
    if (localVal !== null) return Number(localVal);
    return activePayload?.topSpacing !== undefined 
      ? activePayload.topSpacing 
      : (activePayload?.badges && (activePayload.badges as any)[0]?.topSpacing !== undefined) 
        ? (activePayload.badges as any)[0].topSpacing 
        : 20;
  });

  const [photoFit, setPhotoFit] = useState<string>(() => {
    const localVal = localStorage.getItem("regxpert_badge_photo_fit");
    if (localVal) return localVal;
    return activePayload?.photoFit || (activePayload?.badges && (activePayload.badges as any)[0]?.photoFit) || "cover";
  });

  useEffect(() => {
    localStorage.setItem("regxpert_badge_size", badgeSize);
  }, [badgeSize]);

  useEffect(() => {
    localStorage.setItem("regxpert_badge_top_spacing", String(topSpacing));
  }, [topSpacing]);

  useEffect(() => {
    localStorage.setItem("regxpert_badge_photo_fit", photoFit);
  }, [photoFit]);

  const [isPrinted, setIsPrinted] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [base64Photos, setBase64Photos] = useState<{[url: string]: string}>({});

  const badgeBackUrl = activePayload?.backUrl || "";
  const badges: BadgePayload[] = activePayload?.badges || (activePayload ? [activePayload as BadgePayload] : []);

  // 0. On-the-fly base64 image converter to prevent CORS errors during PDF generation
  useEffect(() => {
    if (!badges || badges.length === 0) return;

    const fetchAndConvertImage = async (url: string) => {
      if (!url) return null;
      if (url.startsWith("data:image")) return url;

      // 1. Try direct fetch first
      try {
        const response = await fetch(url);
        if (response.ok) {
          const blob = await response.blob();
          return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      } catch (e) {
        console.log("Direct image fetch failed, trying proxy:", url);
      }

      // 2. Try proxying via our backend API proxy
      try {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          return null; // Don't proxy relative paths
        }
        const proxyUrl = `${API_URL}/api/participants/proxy-image?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("CORS Proxy fetch failed");

        const blob = await response.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn("Base64 photo conversion failed for url:", url, err);
        return null;
      }
    };

    const convertAllPhotos = async () => {
      const newMap: {[url: string]: string} = {};
      for (const badge of badges) {
        const url = getParticipantPhoto(badge);
        if (url && !url.startsWith("data:image") && !newMap[url] && !base64Photos[url]) {
          const base64 = await fetchAndConvertImage(url);
          if (base64) {
            newMap[url] = base64;
          }
        }
      }
      if (Object.keys(newMap).length > 0) {
        setBase64Photos(prev => ({ ...prev, ...newMap }));
      }
    };

    convertAllPhotos();
  }, [badges]);

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

  // 2. Auto-trigger print dialog once images are loaded (but DO NOT redirect)
  useEffect(() => {
    if (badges.length === 0) return;
    if (imagesLoaded) return;

    const triggerPrint = () => {
      window.print();
    };

    const images = Array.from(document.querySelectorAll(".badge-container img"));
    
    if (images.length === 0) {
      setImagesLoaded(true);
      const timer = setTimeout(triggerPrint, 1200);
      return () => clearTimeout(timer);
    }

    let loadedCount = 0;
    let resolved = false;

    const fallbackTimer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        setImagesLoaded(true);
        triggerPrint();
      }
    }, 4000);

    const checkAllLoaded = () => {
      if (loadedCount === images.length && !resolved) {
        resolved = true;
        setImagesLoaded(true);
        clearTimeout(fallbackTimer);
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
  }, [activePayload, imagesLoaded]);

  // 3. Listen to print finish events to trigger success overlay options
  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinted(true);
      
      // Auto-update db status for current participant if ID is present
      const currentId = activePayload?.participantId;
      if (currentId) {
        markAsPrintedInDb(currentId);
      }
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, [activePayload]);

  const markAsPrintedInDb = async (participantId: string) => {
    try {
      const staffEmail = activePayload?.operatorEmail || "Staff Operator";
      const timestamp = new Date().toISOString();
      const apiURL = API_URL;
      
      await fetch(`${apiURL}/api/participants/${participantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printed: true,
          printLogs: [{ timestamp, staffMember: staffEmail }]
        })
      });
    } catch (e) {
      console.error("Failed to sync printed state to DB:", e);
    }
  };

  const handlePrintNext = async () => {
    if (!activePayload?.nextBadgePayload) return;
    
    const nextBadge = activePayload.nextBadgePayload;
    setUpdating(true);
    
    try {
      // 1. Sync its printed status in DB
      if (nextBadge.participantId) {
        await markAsPrintedInDb(nextBadge.participantId);
      }
      
      // 2. Set next payload as active, resetting loaders
      setActivePayload(nextBadge);
      setIsPrinted(false);
      setImagesLoaded(false);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

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
      html2canvas:  { 
        scale: 2, 
        useCORS: true,
        onclone: (clonedDoc: any) => {
          const badgeContainers = clonedDoc.querySelectorAll(".badge-container");
          badgeContainers.forEach((container: any, idx: number) => {
            // Remove margins and rounding for a clean edge-to-edge PDF render
            container.style.margin = "0";
            container.style.borderRadius = "0";
            container.style.border = "none";
            container.style.boxShadow = "none";
            
            // Apply page breaks between badge pages (but avoid trailing empty page)
            if (idx < badgeContainers.length - 1) {
              container.style.pageBreakAfter = "always";
              container.style.breakAfter = "page";
            }
          });
        }
      },
      jsPDF:        { unit: 'mm', format: formatVal, orientation: 'portrait' },
      pagebreak:    { mode: ['css'] }
    };

    (window as any).html2pdf().from(element).set(opt).save();
  };

  if (badges.length === 0) {
    return <div className="p-10 text-center font-bold text-red-500">No badge records found.</div>;
  }

  const primaryBadge = badges[0];
  const primaryCategory = primaryBadge.destination || primaryBadge.category || primaryBadge.dynamicData?.Destination || "";
  const themeColor = getCategoryColor(primaryCategory);

  return (
    <>
      <style>
        {`
          body { 
            margin: 0; 
            background: #f1f5f9; 
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
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
            padding-top: ${topSpacing}mm;
            padding-left: 0;
            padding-right: 0;
            padding-bottom: 0;
            gap: ${BADGE_SIZES[badgeSize]?.gap || "1.5mm"};
            position: relative;
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

      {/* Modern Split Page Layout for Printing Desk */}
      <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row print:bg-white print:block">
        
        {/* LEFT CONTROL PANEL - SCREEN ONLY */}
        <div className="no-print w-full lg:w-[420px] bg-slate-900 text-white border-r border-slate-800 p-6 flex flex-col justify-between shadow-2xl lg:sticky lg:top-0 lg:h-screen overflow-y-auto font-sans">
          
          <div className="flex-1">
            {/* Header branding */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow shadow-blue-500/20">
                RX
              </div>
              <div>
                <h2 className="font-extrabold text-sm tracking-tight text-white">RegXpert Terminal</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Badge Printing Station</p>
              </div>
            </div>

            {/* Active Attendee Profile Details */}
            <div className="bg-slate-800/50 border border-slate-800/80 rounded-2xl p-5 mb-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5">Attendee Profile</h3>
              <div className="space-y-3.5">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Full Name</span>
                  <span className="text-sm font-bold text-white truncate block">{primaryBadge.name || "Unknown"}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Reg ID</span>
                    <span className="text-xs font-mono font-bold text-blue-400 block">{primaryBadge.regId || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Category</span>
                    <span className="text-xs font-bold text-white truncate block">{primaryCategory || "Delegate"}</span>
                  </div>
                </div>

                {primaryBadge.state && (
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Location / City</span>
                    <span className="text-xs text-white block truncate">{primaryBadge.state}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Controls panel */}
            <div className="bg-slate-800/35 border border-slate-800/60 rounded-2xl p-5 mb-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adjust Layout</h3>
              
              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1.5 tracking-wider">Badge Dimensions</label>
                <select
                  value={badgeSize}
                  onChange={(e) => setBadgeSize(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="standard">Standard Card (CR80) (86x54mm)</option>
                  <option value="A6">A6 Size Badge (148x105mm)</option>
                  <option value="A5">A5 Size Badge (210x148mm)</option>
                  <option value="3x4">3" x 4" Badge (102x76mm)</option>
                  <option value="4x6">4" x 6" Badge (152x102mm)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1.5 tracking-wider">Photo Fitting Option</label>
                <select
                  value={photoFit}
                  onChange={(e) => setPhotoFit(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="cover">Crop & Fill (Top-aligned)</option>
                  <option value="contain">Fit Entire Image (No Crop)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Top Spacing Margin</label>
                  <span className="text-xs font-bold text-blue-400 font-mono">{topSpacing}mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={topSpacing}
                  onChange={(e) => setTopSpacing(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            {/* Standard Trigger Action Buttons */}
            <div className="space-y-3">
              <button 
                onClick={() => window.print()}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>🖨️ Print Badge</span>
              </button>
              <button 
                onClick={handleDownloadPDF}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>📥 Download PDF</span>
              </button>
            </div>

            {/* Success Post-Print card */}
            {isPrinted && (
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-5 mt-6 animate-in slide-in-from-bottom duration-200">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <span className="text-sm">✓</span>
                  <span className="text-xs font-black uppercase tracking-wider">Badge Printed Successfully</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  The attendee status is updated. Choose your next action below:
                </p>
                <div className="space-y-2.5">
                  {activePayload?.nextBadgePayload ? (
                    <button 
                      onClick={handlePrintNext}
                      disabled={updating}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl font-bold text-xs shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                    >
                      {updating ? "Syncing..." : (
                        <>
                          <span>Print Next Badge:</span>
                          <span className="underline max-w-[140px] truncate block">{activePayload.nextBadgePayload.name}</span>
                          <span>→</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="text-center p-2.5 bg-slate-800/40 rounded-xl border border-slate-800 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      End of Roster Queue reached
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => window.print()}
                      className="bg-slate-800 hover:bg-slate-700 text-white py-2 px-3 rounded-xl font-bold text-xs transition-colors"
                    >
                      Print Again
                    </button>
                    <button 
                      onClick={handleDownloadPDF}
                      className="bg-slate-800 hover:bg-slate-700 text-white py-2 px-3 rounded-xl font-bold text-xs transition-colors"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Exit back link */}
          <div className="mt-8 pt-4 border-t border-slate-800">
            <button 
              onClick={() => {
                if (badgeBackUrl) {
                  window.location.href = badgeBackUrl;
                } else {
                  window.history.back();
                }
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>← Exit Printing Terminal</span>
            </button>
          </div>
        </div>

        {/* RIGHT PREVIEW CANVAS */}
        <div className="flex-1 p-6 md:p-12 flex flex-col items-center justify-center print:p-0 print:bg-white relative min-w-0">
          <div className="no-print absolute top-6 right-6 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
            <span>Badge Preview</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>

          <div id="badges-container-wrapper" className="print:w-full">
            {badges.map((badge, index) => {
              const badgeName = badge.name;
              const badgeDestination = badge.destination || badge.category || badge.dynamicData?.Destination || "";
              const badgeState = badge.state || badge.city || badge.dynamicData?.City || "";
              const badgeRegId = badge.regId || "";
              const badgeQrCode = badge.qrCode || badgeRegId;
              const badgeCheckpoints = badge.checkpoints || [];

              // Parse spreadsheet photo url links
              const photoUrl = getParticipantPhoto(badge);
              const orgStr = badge.dynamicData?.Organization || badge.dynamicData?.Institution || badge.dynamicData?.Company || "";

              const showPhoto = badge.printPhoto ?? true;
              const showName = badge.printName ?? true;
              const showQR = badge.printQR ?? true;
              const showRegId = badge.printRegId ?? true;
              const showCity = badge.printCity ?? true;

              const badgeColor = getCategoryColor(badgeDestination);
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
                    boxSizing: "border-box",
                    gap: `calc(${dim.gap} * 0.6)`
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
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        padding: "1.5px"
                      }}>
                        {/* Viewfinder Corner Accents */}
                        <div style={{ position: "absolute", top: 0, left: 0, width: "5px", height: "5px", borderTop: `1.5px solid ${badgeColor}`, borderLeft: `1.5px solid ${badgeColor}` }} />
                        <div style={{ position: "absolute", top: 0, right: 0, width: "5px", height: "5px", borderTop: `1.5px solid ${badgeColor}`, borderRight: `1.5px solid ${badgeColor}` }} />
                        <div style={{ position: "absolute", bottom: 0, left: 0, width: "5px", height: "5px", borderBottom: `1.5px solid ${badgeColor}`, borderLeft: `1.5px solid ${badgeColor}` }} />
                        <div style={{ position: "absolute", bottom: 0, right: 0, width: "5px", height: "5px", borderBottom: `1.5px solid ${badgeColor}`, borderRight: `1.5px solid ${badgeColor}` }} />

                        {photoUrl ? (
                          <img 
                            src={base64Photos[photoUrl] || photoUrl} 
                            alt="Participant" 
                            crossOrigin={shouldApplyCors(base64Photos[photoUrl] || photoUrl) ? "anonymous" : undefined}
                            style={{ 
                              width: "100%", 
                              height: "100%", 
                              objectFit: photoFit === "contain" ? "contain" : "cover", 
                              objectPosition: photoFit === "contain" ? "center" : "top", 
                              borderRadius: "2px",
                              backgroundColor: photoFit === "contain" ? "#f8fafc" : "transparent"
                            }} 
                          />
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
                        margin: 0,
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
                        margin: 0,
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
                      padding: "0 3.5mm 8mm 3.5mm", // Expanded bottom padding to clear solid ribbon
                      boxSizing: "border-box",
                      gap: `calc(${dim.gap} * 0.6)`
                    }}>
                      {showQR && badgeCheckpoints.includes("QR Code") && (
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          background: "#ffffff",
                          padding: "0.8mm",
                          borderRadius: "6px",
                          border: `1.5px solid ${badgeColor}25`,
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
                          justifyContent: "center"
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

                  {/* D. Category Ribbon - Colored Solid Band at the Bottom */}
                  {badgeDestination && (
                    <div style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      background: badgeColor,
                      color: "#ffffff",
                      fontWeight: 900,
                      fontSize: dim.fontSizeOrg,
                      padding: "1.5mm 0",
                      textTransform: "uppercase",
                      textAlign: "center",
                      letterSpacing: "1px",
                      zIndex: 10
                    }}>
                      {badgeDestination}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </>
  );
};

export default QRPrint;