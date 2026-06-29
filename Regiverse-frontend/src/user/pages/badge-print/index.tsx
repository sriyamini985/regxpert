import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { useAuth } from "../../../contexts/AuthContext";
import LoadingBar from "../../../components/ui/LoadingBar";
import { ArrowLeft, Check, Search } from "lucide-react";
import { API_URL } from "../../../config/api";

const API = API_URL;

interface PrintLog {
  timestamp: string;
  staffMember: string;
}

interface Participant {
  _id: string;
  name: string;
  regId?: string;
  phone?: string;
  email?: string;
  state?: string;
  category?: string;
  printed: boolean;
  printLogs?: PrintLog[];
  qrCode?: string;
  isCheckedIn?: boolean;
  blockKitbag?: boolean;
  blockCertificate?: boolean;
  blockDay1Breakfast?: boolean;
  blockDay1Lunch?: boolean;
  blockDay1Dinner?: boolean;
  blockDay2Breakfast?: boolean;
  blockDay2Lunch?: boolean;
  blockDay2Dinner?: boolean;
  blockDay3Breakfast?: boolean;
  blockDay3Lunch?: boolean;
  blockDay3Dinner?: boolean;
  blockDay4Breakfast?: boolean;
  blockDay4Lunch?: boolean;
  blockDay4Dinner?: boolean;
  blockDay5Breakfast?: boolean;
  blockDay5Lunch?: boolean;
  blockDay5Dinner?: boolean;
  blockWorkshop1?: boolean;
  blockWorkshop2?: boolean;
  blockWorkshop3?: boolean;
  blockWorkshop4?: boolean;
  blockWorkshop5?: boolean;
  dynamicData?: Record<string, any>;
  workshopScans?: string[];
  conferenceName?: string;
  avatar?: string;
  avatarUrl?: string;
  photo?: string;
}

const ALL_CHECKPOINT_OPTIONS = ["Check-In", "Food Counter", "Kitbag", "Certificate", "Workshop", "QR Code"];

interface BadgeDimensions {
  widthMm: number;
  heightMm: number;
  photoWidthMm: number;
  photoHeightMm: number;
  previewWidthPx: number;
  previewPhotoWidthPx: number;
  previewPhotoHeightPx: number;
  fontSizeName: string;
  fontSizeOrg: string;
  fontSizeRegId: string;
  gap: string;
  innerGapPx: number;
}

const BADGE_SIZES: Record<string, BadgeDimensions> = {
  standard: {
    widthMm: 54,
    heightMm: 86,
    photoWidthMm: 20,
    photoHeightMm: 24,
    previewWidthPx: 240,
    previewPhotoWidthPx: 70,
    previewPhotoHeightPx: 84,
    fontSizeName: "text-sm",
    fontSizeOrg: "text-[8px]",
    fontSizeRegId: "text-[8px]",
    gap: "gap-1.5",
    innerGapPx: 4
  },
  A6: {
    widthMm: 105,
    heightMm: 148,
    photoWidthMm: 40,
    photoHeightMm: 48,
    previewWidthPx: 269,
    previewPhotoWidthPx: 90,
    previewPhotoHeightPx: 108,
    fontSizeName: "text-base",
    fontSizeOrg: "text-[10px]",
    fontSizeRegId: "text-[10px]",
    gap: "gap-2.5",
    innerGapPx: 6
  },
  A5: {
    widthMm: 148,
    heightMm: 210,
    photoWidthMm: 58,
    photoHeightMm: 70,
    previewWidthPx: 268,
    previewPhotoWidthPx: 116,
    previewPhotoHeightPx: 139,
    fontSizeName: "text-lg",
    fontSizeOrg: "text-[11px]",
    fontSizeRegId: "text-[12px]",
    gap: "gap-9",
    innerGapPx: 9
  },
  "3x4": {
    widthMm: 76,
    heightMm: 102,
    photoWidthMm: 30,
    photoHeightMm: 36,
    previewWidthPx: 283,
    previewPhotoWidthPx: 80,
    previewPhotoHeightPx: 96,
    fontSizeName: "text-sm",
    fontSizeOrg: "text-[9px]",
    fontSizeRegId: "text-[9px]",
    gap: "gap-2",
    innerGapPx: 5
  },
  "4x6": {
    widthMm: 102,
    heightMm: 152,
    photoWidthMm: 40,
    photoHeightMm: 48,
    previewWidthPx: 255,
    previewPhotoWidthPx: 90,
    previewPhotoHeightPx: 108,
    fontSizeName: "text-base",
    fontSizeOrg: "text-[10px]",
    fontSizeRegId: "text-[10px]",
    gap: "gap-2.5",
    innerGapPx: 6
  }
};

const getCategoryColor = (category: string) => {
  const cat = String(category).toLowerCase();
  if (cat.includes("faculty") || cat.includes("speaker") || cat.includes("presenter") || cat.includes("guest")) {
    return "#312e81"; // Premium Indigo color scheme
  }
  if (cat.includes("organizer") || cat.includes("staff") || cat.includes("admin")) {
    return "#064e3b";
  }
  if (cat.includes("exhibitor") || cat.includes("sponsor")) {
    return "#854d0e";
  }
  if (cat.includes("volunteer")) {
    return "#991b1b";
  }
  return "#1e3a8a"; // Navy for delegates
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

const BadgePrint = () => {
  const navigate = useNavigate();
  const { conferenceSlug } = useParams<"conferenceSlug">();
  const { user } = useAuth();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Mobile Tabs and Zoom support states
  const [activeTab, setActiveTab] = useState<"roster" | "options" | "preview">("roster");
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  // Script loaders for html2canvas and jspdf on component mount
  useEffect(() => {
    const scriptCanvas = document.createElement("script");
    scriptCanvas.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    scriptCanvas.async = true;
    document.body.appendChild(scriptCanvas);

    const scriptPDF = document.createElement("script");
    scriptPDF.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    scriptPDF.async = true;
    document.body.appendChild(scriptPDF);

    return () => {
      document.body.removeChild(scriptCanvas);
      document.body.removeChild(scriptPDF);
    };
  }, []);

  // Selection state
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Editable badge fields
  const [editName, setEditName] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editState, setEditState] = useState("");
  const [selectedCheckpoints, setSelectedCheckpoints] = useState<string[]>([]);
  const [participantCheckpoints, setParticipantCheckpoints] = useState<Record<string, string[]>>({});
  const [badgeSize, setBadgeSize] = useState<string>(() => {
    return localStorage.getItem("regxpert_badge_size") || "standard";
  });
  const [printPhoto, setPrintPhoto] = useState<boolean>(() => {
    const saved = localStorage.getItem("regxpert_print_photo");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [printName, setPrintName] = useState<boolean>(() => {
    const saved = localStorage.getItem("regxpert_print_name");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [printQR, setPrintQR] = useState<boolean>(() => {
    const saved = localStorage.getItem("regxpert_print_qr");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [printRegId, setPrintRegId] = useState<boolean>(() => {
    const saved = localStorage.getItem("regxpert_print_regid");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [printCity, setPrintCity] = useState<boolean>(() => {
    const saved = localStorage.getItem("regxpert_print_city");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [topSpacing, setTopSpacing] = useState<number>(() => {
    const saved = localStorage.getItem("regxpert_badge_top_spacing");
    return saved ? Number(saved) : 20;
  });
  const [photoFit, setPhotoFit] = useState<string>(() => {
    return localStorage.getItem("regxpert_badge_photo_fit") || "cover";
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

  useEffect(() => {
    localStorage.setItem("regxpert_print_photo", JSON.stringify(printPhoto));
  }, [printPhoto]);

  useEffect(() => {
    localStorage.setItem("regxpert_print_name", JSON.stringify(printName));
  }, [printName]);

  useEffect(() => {
    localStorage.setItem("regxpert_print_qr", JSON.stringify(printQR));
  }, [printQR]);

  useEffect(() => {
    localStorage.setItem("regxpert_print_regid", JSON.stringify(printRegId));
  }, [printRegId]);

  useEffect(() => {
    localStorage.setItem("regxpert_print_city", JSON.stringify(printCity));
  }, [printCity]);

  // Load all participants for conference on mount
  useEffect(() => {
    loadParticipants();
  }, [conferenceSlug]);

  const loadParticipants = async () => {
    if (!conferenceSlug) return;
    try {
      setFetching(true);
      const res = await fetch(`${API}/api/participants/conference/${conferenceSlug}`);
      const data = await res.json();
      setParticipants(Array.isArray(data) ? data : []);
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to load participants", err);
    } finally {
      setFetching(false);
    }
  };

  // Determine eligible checkpoints from participant record
  const getAssignedCheckpoints = (p: Participant): string[] => {
    const list: string[] = [];
    if (p.isCheckedIn) list.push("Check-In");
    if (!p.blockKitbag) list.push("Kitbag");
    if (!p.blockCertificate) list.push("Certificate");

    const hasFoodAccess = ![
      p.blockDay1Breakfast, p.blockDay1Lunch, p.blockDay1Dinner,
      p.blockDay2Breakfast, p.blockDay2Lunch, p.blockDay2Dinner,
      p.blockDay3Breakfast, p.blockDay3Lunch, p.blockDay3Dinner,
      p.blockDay4Breakfast, p.blockDay4Lunch, p.blockDay4Dinner,
      p.blockDay5Breakfast, p.blockDay5Lunch, p.blockDay5Dinner
    ].every(Boolean);
    if (hasFoodAccess) list.push("Food Counter");

    const hasWorkshopAccess = ![
      p.blockWorkshop1, p.blockWorkshop2, p.blockWorkshop3,
      p.blockWorkshop4, p.blockWorkshop5
    ].every(Boolean);
    if (hasWorkshopAccess) list.push("Workshop");

    list.push("QR Code"); // QR Code is present by default
    return list;
  };

  // When selected participant changes, update editor states
  useEffect(() => {
    if (selectedParticipant) {
      setEditName(selectedParticipant.name || "");
      setEditDestination(
        selectedParticipant.dynamicData?.Destination || 
        selectedParticipant.category || 
        ""
      );
      setEditState(
        selectedParticipant.state || 
        selectedParticipant.dynamicData?.City || 
        ""
      );
      
      const pId = selectedParticipant._id;
      if (participantCheckpoints[pId]) {
        setSelectedCheckpoints(participantCheckpoints[pId]);
      } else {
        const defaults = getAssignedCheckpoints(selectedParticipant);
        setSelectedCheckpoints(defaults);
        setParticipantCheckpoints(prev => ({
          ...prev,
          [pId]: defaults
        }));
      }
    } else {
      setEditName("");
      setEditDestination("");
      setEditState("");
      setSelectedCheckpoints([]);
    }
  }, [selectedParticipant]);

  const toggleCheckpoint = (cp: string) => {
    if (!selectedParticipant) return;
    const pId = selectedParticipant._id;
    setSelectedCheckpoints((prev) => {
      const next = prev.includes(cp) ? prev.filter((item) => item !== cp) : [...prev, cp];
      setParticipantCheckpoints((prevMap) => ({
        ...prevMap,
        [pId]: next
      }));
      return next;
    });
  };

  // Roster multi-select handlers
  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(p => p._id));
    }
  };

  const handleSelectNotPrinted = () => {
    const notPrinted = filtered.filter(p => !p.printed).map(p => p._id);
    setSelectedIds(notPrinted);
  };

  // Filter list (optimized with useMemo to prevent lag)
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return participants;
    return participants.filter((p) =>
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.regId && p.regId.toLowerCase().includes(term))
    );
  }, [participants, searchTerm]);

  // Individual Print Action
  const handlePrintBadge = async () => {
    if (!selectedParticipant) return;

    if (selectedParticipant.printed) {
      const confirmPrint = window.confirm(
        `⚠️ WARNING: A badge for ${selectedParticipant.name} has already been printed.\nAre you sure you want to print a duplicate badge?`
      );
      if (!confirmPrint) return;
    }

    setUpdating(true);
    try {
      const staffEmail = user?.email || "Staff Operator";
      const newLog: PrintLog = {
        timestamp: new Date().toISOString(),
        staffMember: staffEmail
      };

      const existingLogs = selectedParticipant.printLogs || [];
      const updatedLogs = [...existingLogs, newLog];

      // Update backend database with printed status and audit log
      const res = await fetch(`${API}/api/participants/${selectedParticipant._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printed: true,
          printLogs: updatedLogs
        }),
      });

      if (!res.ok) {
        throw new Error("Server failed to update print status");
      }

      // Update local state instantly
      const updatedList = participants.map((p) => {
        if (p._id === selectedParticipant._id) {
          return { ...p, printed: true, printLogs: updatedLogs };
        }
        return p;
      });
      setParticipants(updatedList);
      setSelectedParticipant({
        ...selectedParticipant,
        printed: true,
        printLogs: updatedLogs
      });

      // Format QR Code value: Simplified to store only Registration ID / Participant ID
      const qrContent = selectedParticipant.regId || selectedParticipant._id;

      // Build Next Badge Payload if available in filtered roster
      const currentIndex = filtered.findIndex(p => p._id === selectedParticipant._id);
      const nextParticipant = currentIndex !== -1 && currentIndex + 1 < filtered.length ? filtered[currentIndex + 1] : null;
      let nextBadgePayload = null;
      if (nextParticipant) {
        const nextAssignments = participantCheckpoints[nextParticipant._id] || getAssignedCheckpoints(nextParticipant);
        const nextName = nextParticipant.name;
        const nextDest = nextParticipant.dynamicData?.Destination || nextParticipant.category || "";
        const nextState = nextParticipant.state || nextParticipant.dynamicData?.City || "";
        const nextRegId = nextParticipant.regId || nextParticipant._id;
        const nextQrContent = nextRegId;
        
        nextBadgePayload = {
          name: nextName,
          destination: nextDest,
          state: nextState,
          regId: nextRegId,
          qrCode: nextQrContent,
          checkpoints: nextAssignments,
          conferenceName: nextParticipant.conferenceName || "",
          dynamicData: nextParticipant.dynamicData || {},
          printPhoto: printPhoto,
          printName: printName,
          printQR: printQR,
          printRegId: printRegId,
          printCity: printCity,
          participantId: nextParticipant._id,
          operatorEmail: staffEmail,
          avatar: nextParticipant.avatar || "",
          avatarUrl: nextParticipant.avatarUrl || "",
          photo: nextParticipant.photo || ""
        };
      }

      // Open Print window with encoded customized data
      const payload = {
        name: editName,
        destination: editDestination,
        state: editState,
        regId: selectedParticipant.regId || selectedParticipant._id,
        qrCode: qrContent, // Formatted text block
        checkpoints: selectedCheckpoints,
        backUrl: `/u/${conferenceSlug}/badge-print`,
        conferenceName: selectedParticipant.conferenceName || "",
        dynamicData: selectedParticipant.dynamicData || {},
        badgeSize: badgeSize,
        topSpacing: topSpacing,
        photoFit: photoFit,
        printPhoto: printPhoto,
        printName: printName,
        printQR: printQR,
        printRegId: printRegId,
        printCity: printCity,
        participantId: selectedParticipant._id,
        operatorEmail: staffEmail,
        nextBadgePayload: nextBadgePayload,
        avatar: selectedParticipant.avatar || "",
        avatarUrl: selectedParticipant.avatarUrl || "",
        photo: selectedParticipant.photo || ""
      };

      sessionStorage.setItem("print_badge_data", JSON.stringify(payload));
      window.open("/print-qr", "_self");

    } catch (err) {
      console.error(err);
      alert("Failed to record print status in database.");
    } finally {
      setUpdating(false);
    }
  };

  // Bulk Print Action
  const handleBulkPrint = async () => {
    if (selectedIds.length === 0) return alert("Please select at least one delegate to print.");
    
    const confirmPrint = window.confirm(`Are you sure you want to print ${selectedIds.length} badges in bulk?`);
    if (!confirmPrint) return;

    setUpdating(true);
    try {
      const staffEmail = user?.email || "Staff Operator";
      const timestamp = new Date().toISOString();

      // Prepare updates for database
      const updatePromises = selectedIds.map(async (id) => {
        const participant = participants.find(p => p._id === id);
        if (!participant) return;

        const existingLogs = participant.printLogs || [];
        const newLog = { timestamp, staffMember: staffEmail };
        const updatedLogs = [...existingLogs, newLog];

        return fetch(`${API}/api/participants/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            printed: true,
            printLogs: updatedLogs
          }),
        }).then(res => res.json());
      });

      await Promise.all(updatePromises);

      // Reload local participants list
      await loadParticipants();
      
      // Open Print window with encoded customized data for all selected badges
      const selectedParticipants = participants.filter(p => selectedIds.includes(p._id));
      const badgesPayload = selectedParticipants.map(p => {
        const assignments = participantCheckpoints[p._id] || getAssignedCheckpoints(p);
        const nameVal = p.name;
        const destVal = p.dynamicData?.Destination || p.category || "";
        const stateVal = p.state || p.dynamicData?.City || "";
        const regIdVal = p.regId || p._id;
        
        // Format QR Code value: Simplified to store only Registration ID / Participant ID
        const qrContent = regIdVal;

        return {
          name: nameVal,
          destination: destVal,
          state: stateVal,
          regId: regIdVal,
          qrCode: qrContent, // Send simplified registration/participant ID only
          checkpoints: assignments,
          conferenceName: p.conferenceName || "",
          dynamicData: p.dynamicData || {},
          printPhoto: printPhoto,
          printName: printName,
          printQR: printQR,
          printRegId: printRegId,
          printCity: printCity,
          participantId: p._id,
          operatorEmail: staffEmail,
          photoFit: photoFit,
          avatar: p.avatar || "",
          avatarUrl: p.avatarUrl || "",
          photo: p.photo || ""
        };
      });

      const payload = {
        badges: badgesPayload,
        backUrl: `/u/${conferenceSlug}/badge-print`,
        badgeSize: badgeSize,
        topSpacing: topSpacing,
        photoFit: photoFit
      };

      sessionStorage.setItem("print_badge_data", JSON.stringify(payload));
      window.open("/print-qr", "_self");

    } catch (err) {
      console.error(err);
      alert("Failed to run bulk printing updates.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadSinglePDF = async () => {
    if (!selectedParticipant) return;
    const jsPDFClass = (window as any).jspdf?.jsPDF || (window as any).jsPDF;
    const html2canvasFn = (window as any).html2canvas;

    if (!jsPDFClass || !html2canvasFn) {
      alert("PDF libraries are still loading. Please try again in a second.");
      return;
    }

    const element = document.getElementById("badge-preview-card");
    if (!element) {
      alert("Preview card not found.");
      return;
    }

    setUpdating(true);
    try {
      const dim = BADGE_SIZES[badgeSize] || BADGE_SIZES.standard;
      const formatVal = badgeSize === "A5" ? "a5" : badgeSize === "A6" ? "a6" : [dim.widthMm, dim.heightMm];

      // Save original styles
      const originalBorderRadius = element.style.borderRadius;
      const originalBorder = element.style.border;
      const originalBoxShadow = element.style.boxShadow;
      const originalTransform = element.style.transform;
      const originalPaddingTop = element.style.paddingTop;
      const originalPaddingLeft = element.style.paddingLeft;
      const originalPaddingRight = element.style.paddingRight;
      const originalPaddingBottom = element.style.paddingBottom;

      // Apply print styles temporarily
      element.style.borderRadius = "0";
      element.style.border = "none";
      element.style.boxShadow = "none";
      element.style.transform = "none";
      element.style.paddingTop = `${topSpacing}mm`;
      element.style.paddingLeft = "0";
      element.style.paddingRight = "0";
      element.style.paddingBottom = "0";

      const canvas = await html2canvasFn(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        imageTimeout: 15000
      });

      // Restore original styles
      element.style.borderRadius = originalBorderRadius;
      element.style.border = originalBorder;
      element.style.boxShadow = originalBoxShadow;
      element.style.transform = originalTransform;
      element.style.paddingTop = originalPaddingTop;
      element.style.paddingLeft = originalPaddingLeft;
      element.style.paddingRight = originalPaddingRight;
      element.style.paddingBottom = originalPaddingBottom;

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDFClass({
        unit: "mm",
        format: formatVal,
        orientation: "portrait"
      });

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        badgeSize === "A5" ? 148 : badgeSize === "A6" ? 105 : dim.widthMm,
        badgeSize === "A5" ? 210 : badgeSize === "A6" ? 148 : dim.heightMm
      );

      pdf.save(`badge-${selectedParticipant.regId || selectedParticipant._id || "pass"}.pdf`);
    } catch (err) {
      console.error(err);
      alert("An error occurred during PDF generation.");
    } finally {
      setUpdating(false);
    }
  };

  const handleShareSinglePDF = async () => {
    if (!selectedParticipant) return;
    const jsPDFClass = (window as any).jspdf?.jsPDF || (window as any).jsPDF;
    const html2canvasFn = (window as any).html2canvas;

    if (!jsPDFClass || !html2canvasFn) {
      alert("PDF libraries are still loading. Please try again in a second.");
      return;
    }

    const element = document.getElementById("badge-preview-card");
    if (!element) {
      alert("Preview card not found.");
      return;
    }

    setUpdating(true);
    try {
      const dim = BADGE_SIZES[badgeSize] || BADGE_SIZES.standard;
      const formatVal = badgeSize === "A5" ? "a5" : badgeSize === "A6" ? "a6" : [dim.widthMm, dim.heightMm];

      // Save original styles
      const originalBorderRadius = element.style.borderRadius;
      const originalBorder = element.style.border;
      const originalBoxShadow = element.style.boxShadow;
      const originalTransform = element.style.transform;
      const originalPaddingTop = element.style.paddingTop;
      const originalPaddingLeft = element.style.paddingLeft;
      const originalPaddingRight = element.style.paddingRight;
      const originalPaddingBottom = element.style.paddingBottom;

      // Apply print styles temporarily
      element.style.borderRadius = "0";
      element.style.border = "none";
      element.style.boxShadow = "none";
      element.style.transform = "none";
      element.style.paddingTop = `${topSpacing}mm`;
      element.style.paddingLeft = "0";
      element.style.paddingRight = "0";
      element.style.paddingBottom = "0";

      const canvas = await html2canvasFn(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        imageTimeout: 15000
      });

      // Restore original styles
      element.style.borderRadius = originalBorderRadius;
      element.style.border = originalBorder;
      element.style.boxShadow = originalBoxShadow;
      element.style.transform = originalTransform;
      element.style.paddingTop = originalPaddingTop;
      element.style.paddingLeft = originalPaddingLeft;
      element.style.paddingRight = originalPaddingRight;
      element.style.paddingBottom = originalPaddingBottom;

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDFClass({
        unit: "mm",
        format: formatVal,
        orientation: "portrait"
      });

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        0,
        badgeSize === "A5" ? 148 : badgeSize === "A6" ? 105 : dim.widthMm,
        badgeSize === "A5" ? 210 : badgeSize === "A6" ? 148 : dim.heightMm
      );

      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], `badge-${selectedParticipant.regId || selectedParticipant._id || "pass"}.pdf`, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "RegXpert Badge Pass",
          text: `Here is the badge pass for ${editName}`
        });
      } else {
        alert("Natively sharing files is not supported on this browser/device. Please download the PDF instead.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to share PDF.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 relative overflow-hidden p-6 md:p-8 font-sans text-slate-800">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      
      <LoadingBar isLoading={fetching || updating} />
      
      <div className="max-w-7xl mx-auto flex flex-col gap-6 relative z-10">
        
        {/* HEADER BAR */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/u/${conferenceSlug}`)}
              className="p-3 bg-white hover:bg-slate-50 active:scale-95 text-slate-650 rounded-2xl transition border border-slate-200 shadow-sm flex items-center justify-center"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">Badge Printing Station</h1>
              <p className="text-slate-500 font-medium text-xs md:text-sm mt-0.5">Configure layout, verify print logs, and print event ID cards.</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-2xl text-xs font-bold shadow-sm flex items-center gap-2 tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Operator Connected
          </div>
        </div>

        {/* Mobile Tabs Header */}
        <div className="flex lg:hidden bg-slate-900/5 backdrop-blur-md rounded-2xl border border-slate-200/80 p-1.5 shadow-inner gap-1">
          {[
            { id: "roster", label: "Roster" },
            { id: "options", label: "Options" },
            { id: "preview", label: "Preview" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 active:scale-95 ${
                  isActive 
                    ? "bg-slate-950 text-white shadow-md" 
                    : "text-slate-500 hover:text-slate-850 hover:bg-slate-100/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* MAIN SPLIT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: SEARCH & ROSTER (Col span 5) */}
          <div className={`lg:col-span-5 bg-white/80 backdrop-blur-md rounded-3xl shadow-sm p-6 border border-slate-200/80 flex flex-col h-[750px] transition-all hover:shadow-md ${activeTab === "roster" ? "flex" : "hidden lg:flex"}`}>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Roster List</span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-extrabold border border-indigo-100/60 shadow-sm">
                {filtered.length} Delegates
              </span>
            </h2>

            {/* Bulk Selection Actions bar */}
            <div className="flex flex-wrap gap-2 mb-3.5 items-center">
              <button 
                onClick={handleSelectAll} 
                className="text-xs bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 px-3 py-2 rounded-xl font-bold border border-slate-200 transition-all"
              >
                {selectedIds.length === filtered.length ? "Deselect All" : "Select All"}
              </button>
              <button 
                onClick={handleSelectNotPrinted} 
                className="text-xs bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 px-3 py-2 rounded-xl font-bold border border-slate-200 transition-all"
              >
                Select Not Printed
              </button>
              {selectedIds.length > 0 && (
                <button 
                  onClick={handleBulkPrint}
                  className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white px-4 py-2 rounded-xl font-bold shadow-md hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 ml-auto animate-fade-in"
                >
                  🖨️ Bulk Print ({selectedIds.length})
                </button>
              )}
            </div>

            {/* Premium search bar with left search icon */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or registration ID..."
                className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/80 pl-11 pr-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-550 font-medium transition-all text-sm"
              />
            </div>

            <div className="flex-grow overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
              {filtered.map((p) => {
                const isSelected = selectedParticipant?._id === p._id;
                const isChecked = selectedIds.includes(p._id);
                return (
                  <div
                    key={p._id}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center select-none group ${
                      p.printed 
                        ? isSelected 
                          ? "bg-emerald-50/60 border-emerald-400 shadow-md shadow-emerald-500/5"
                          : "bg-emerald-50/20 border-emerald-100/70 hover:bg-emerald-50/40 hover:border-emerald-200"
                        : isSelected
                          ? "bg-indigo-50/45 border-indigo-400 shadow-md shadow-indigo-500/5"
                          : "bg-white border-slate-150/70 hover:bg-slate-50/50 hover:border-slate-300"
                    }`}
                  >
                    {/* Roster multi-select checkbox */}
                    <div className="relative flex items-center mr-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(p._id)}
                        className="sr-only"
                      />
                      <div 
                        onClick={() => handleToggleSelect(p._id)}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-all cursor-pointer ${
                          isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white hover:border-slate-400"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3.5px]" />}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1" onClick={() => { setSelectedParticipant(p); setActiveTab("preview"); }}>
                      <p className="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-950 transition-colors">{p.name}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5 truncate">
                        ID: {p.regId || "N/A"} • {p.category || "No Category"}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5 ml-4" onClick={() => { setSelectedParticipant(p); setActiveTab("preview"); }}>
                      {p.printed ? (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-extrabold border border-emerald-500/20 tracking-wide uppercase">
                          Printed ({p.printLogs?.length || 1})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-500/10 text-slate-500 rounded-lg text-[10px] font-extrabold border border-slate-500/20 tracking-wide uppercase">
                          Not Printed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center text-slate-400 font-medium text-sm mt-12">No participants match your query.</div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: EDITOR & LIVE PREVIEW (Col span 7) */}
          <div className={`lg:col-span-7 flex flex-col h-[750px] ${activeTab !== "roster" ? "flex" : "hidden lg:flex"}`}>
            {selectedParticipant ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0">
                
                {/* COLUMN 1: CONFIGURATION & LOGS */}
                <div className={`bg-white/80 backdrop-blur-md rounded-3xl shadow-sm p-6 border border-slate-200/80 flex flex-col h-full min-h-0 ${activeTab === "options" ? "flex" : "hidden md:flex"}`}>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex-none">Badge Options</h2>
                  
                  {/* Scrollable configuration fields container */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-5 custom-scrollbar mb-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-slate-55/65 hover:bg-slate-50 focus:bg-white border border-slate-200/80 p-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-550 font-bold text-sm text-slate-800 transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category Ribbon</label>
                        <input
                          type="text"
                          value={editDestination}
                          onChange={(e) => setEditDestination(e.target.value)}
                          className="w-full bg-slate-55/65 hover:bg-slate-50 focus:bg-white border border-slate-200/80 p-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-550 font-bold text-sm text-slate-800 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Badge Print Size</label>
                        <select
                          value={badgeSize}
                          onChange={(e) => setBadgeSize(e.target.value)}
                          className="w-full bg-slate-55/65 hover:bg-slate-50 focus:bg-white border border-slate-200/80 p-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-555 font-bold text-sm text-slate-850 cursor-pointer transition-all"
                        >
                          <option value="standard">Standard Card (CR80) (86x54mm)</option>
                          <option value="A6">A6 Size Badge (148x105mm)</option>
                          <option value="A5">A5 Size Badge (210x148mm)</option>
                          <option value="3x4">3" x 4" Badge (102x76mm)</option>
                          <option value="4x6">4" x 6" Badge (152x102mm)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Photo Fitting Option</label>
                        <select
                          value={photoFit}
                          onChange={(e) => setPhotoFit(e.target.value)}
                          className="w-full bg-slate-55/65 hover:bg-slate-50 focus:bg-white border border-slate-200/80 p-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-555 font-bold text-sm text-slate-855 cursor-pointer transition-all"
                        >
                          <option value="cover">Crop & Fill (Top-aligned)</option>
                          <option value="contain">Fit Entire Image (No Crop)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Spacing Margin</label>
                          <span className="text-xs font-black text-indigo-650">{topSpacing} mm</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={topSpacing}
                          onChange={(e) => setTopSpacing(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>

                      {/* BADGE FIELDS TO PRINT */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Badge Fields to Print</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          
                          <label className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer transition-all select-none text-xs font-bold ${
                            printPhoto 
                              ? "bg-indigo-50/45 border-indigo-200 text-indigo-700 shadow-sm" 
                              : "bg-slate-50/60 border-slate-200/60 hover:bg-slate-50 text-slate-600 hover:text-slate-700"
                          }`}>
                            <input
                              type="checkbox"
                              checked={printPhoto}
                              onChange={(e) => setPrintPhoto(e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-all ${
                              printPhoto ? "bg-indigo-600 border-indigo-600 text-white animate-scale-up" : "border-slate-300 bg-white"
                            }`}>
                              {printPhoto && <Check className="w-3 h-3 stroke-[3.5px]" />}
                            </div>
                            <span>Photo / Image</span>
                          </label>

                          <label className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer transition-all select-none text-xs font-bold ${
                            printName 
                              ? "bg-indigo-50/45 border-indigo-200 text-indigo-700 shadow-sm" 
                              : "bg-slate-50/60 border-slate-200/60 hover:bg-slate-50 text-slate-600 hover:text-slate-700"
                          }`}>
                            <input
                              type="checkbox"
                              checked={printName}
                              onChange={(e) => setPrintName(e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-all ${
                              printName ? "bg-indigo-600 border-indigo-600 text-white animate-scale-up" : "border-slate-300 bg-white"
                            }`}>
                              {printName && <Check className="w-3 h-3 stroke-[3.5px]" />}
                            </div>
                            <span>Full Name</span>
                          </label>

                          <label className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer transition-all select-none text-xs font-bold ${
                            printQR 
                              ? "bg-indigo-50/45 border-indigo-200 text-indigo-700 shadow-sm" 
                              : "bg-slate-50/60 border-slate-200/60 hover:bg-slate-50 text-slate-600 hover:text-slate-700"
                          }`}>
                            <input
                              type="checkbox"
                              checked={printQR}
                              onChange={(e) => setPrintQR(e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-all ${
                              printQR ? "bg-indigo-600 border-indigo-600 text-white animate-scale-up" : "border-slate-300 bg-white"
                            }`}>
                              {printQR && <Check className="w-3 h-3 stroke-[3.5px]" />}
                            </div>
                            <span>QR Code</span>
                          </label>

                          <label className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer transition-all select-none text-xs font-bold ${
                            printRegId 
                              ? "bg-indigo-50/45 border-indigo-200 text-indigo-700 shadow-sm" 
                              : "bg-slate-50/60 border-slate-200/60 hover:bg-slate-50 text-slate-600 hover:text-slate-700"
                          }`}>
                            <input
                              type="checkbox"
                              checked={printRegId}
                              onChange={(e) => setPrintRegId(e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-all ${
                              printRegId ? "bg-indigo-600 border-indigo-600 text-white animate-scale-up" : "border-slate-300 bg-white"
                            }`}>
                              {printRegId && <Check className="w-3 h-3 stroke-[3.5px]" />}
                            </div>
                            <span>Registration ID</span>
                          </label>

                          <label className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer transition-all select-none text-xs font-bold ${
                            printCity 
                              ? "bg-indigo-50/45 border-indigo-200 text-indigo-700 shadow-sm" 
                              : "bg-slate-50/60 border-slate-200/60 hover:bg-slate-50 text-slate-600 hover:text-slate-700"
                          }`}>
                            <input
                              type="checkbox"
                              checked={printCity}
                              onChange={(e) => setPrintCity(e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-all ${
                              printCity ? "bg-indigo-600 border-indigo-600 text-white animate-scale-up" : "border-slate-300 bg-white"
                            }`}>
                              {printCity && <Check className="w-3 h-3 stroke-[3.5px]" />}
                            </div>
                            <span>City / Location</span>
                          </label>
                        </div>
                      </div>

                      {/* CHECKPOINTS */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Print Checkpoints</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {ALL_CHECKPOINT_OPTIONS.map((cp) => {
                            const isChecked = selectedCheckpoints.includes(cp);
                            return (
                              <label key={cp} className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer transition-all select-none text-xs font-bold ${
                                isChecked 
                                  ? "bg-indigo-50/45 border-indigo-200 text-indigo-700 shadow-sm" 
                                  : "bg-slate-50/60 border-slate-200/60 hover:bg-slate-50 text-slate-600 hover:text-slate-700"
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleCheckpoint(cp)}
                                  className="sr-only"
                                />
                                <div className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-all ${
                                  isChecked ? "bg-indigo-600 border-indigo-600 text-white animate-scale-up" : "border-slate-300 bg-white"
                                }`}>
                                  {isChecked && <Check className="w-3 h-3 stroke-[3.5px]" />}
                                </div>
                                <span>{cp}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PRINT LOG AUDIT */}
                  <div className="border-t border-slate-100 pt-4 mt-2 mb-2 flex-none">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Print Activity Logs ({selectedParticipant.printLogs?.length || 0})
                    </h3>
                    <div className="max-h-[100px] overflow-y-auto space-y-1.5 text-[10px] text-slate-500 font-medium pr-1 custom-scrollbar">
                      {selectedParticipant.printLogs && selectedParticipant.printLogs.length > 0 ? (
                        selectedParticipant.printLogs.map((log, index) => (
                          <div key={index} className="flex justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span>By: {log.staffMember}</span>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400 italic">No print activity logs on file. Ready for initial print.</div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handlePrintBadge}
                    className="w-full mt-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-bold rounded-2xl transition shadow-lg shadow-indigo-600/10 hover:shadow-indigo-650/20 flex items-center justify-center gap-2 flex-none"
                  >
                    🖨️ Generate &amp; Print Badge
                  </button>
                </div>

                {/* COLUMN 2: LIVE PRINT PREVIEW */}
                {(() => {
                  const dim = BADGE_SIZES[badgeSize] || BADGE_SIZES.standard;
                  return (
                    <div className={`bg-white/80 backdrop-blur-md rounded-3xl shadow-sm p-6 border border-slate-200/80 flex flex-col items-center justify-start h-full min-h-0 ${activeTab === "preview" ? "flex" : "hidden md:flex"}`}>
                      <h2 className="text-xl font-bold text-slate-900 w-full text-left mb-4 flex-none">Badge Preview</h2>

                      {/* Zoom Slider (Screen only) */}
                      <div className="no-print w-full flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl mb-4 flex-none">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide flex-none">Card Zoom</span>
                        <input 
                          type="range" 
                          min="50" 
                          max="150" 
                          value={zoomPercent} 
                          onChange={(e) => setZoomPercent(Number(e.target.value))}
                          className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-650"
                        />
                        <span className="text-xs font-mono font-bold text-slate-600 w-10 text-right">{zoomPercent}%</span>
                      </div>
                      
                      <div className="flex-grow flex flex-col items-center justify-center w-full min-h-0 py-4 my-auto relative overflow-auto max-w-full custom-scrollbar">
                        <div style={{
                          transform: `scale(${zoomPercent / 100})`,
                          transformOrigin: "center center",
                          transition: "transform 0.1s ease-out"
                        }} className="flex-none flex items-center justify-center">
                          {(() => {
                            const themeColor = getCategoryColor(editDestination);
                            const photoUrl = getParticipantPhoto(selectedParticipant);
                            return (
                              <div 
                                id="badge-preview-card"
                                className={`bg-white border border-slate-300 rounded-2xl shadow-lg flex flex-col items-center text-center relative overflow-hidden font-sans transition-all duration-300 ${
                                  dim.gap
                                }`}
                                style={{
                                  height: "380px",
                                  width: `${dim.previewWidthPx}px`,
                                  paddingTop: `${(topSpacing * 380) / dim.heightMm}px`,
                                  paddingLeft: "12px",
                                  paddingRight: "12px",
                                  paddingBottom: editDestination ? "35px" : "12px",
                                  boxSizing: "border-box",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "start",
                                  alignItems: "center"
                                }}
                              >
                                {/* Glassmorphic Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-30" />
                                
                                {/* Lanyard Slot Simulator */}
                                <div className="w-8 h-2 rounded-full bg-slate-200 border border-slate-300/65 mt-2.5 mb-1.5 flex items-center justify-center relative z-20 shadow-inner flex-none">
                                  <div className="w-5 h-0.5 rounded-full bg-slate-300/40" />
                                </div>


                                {/* B. Center Attendee Details */}
                                <div 
                                  className="flex-none flex flex-col items-center justify-center w-full px-1 box-border relative z-10 animate-fade-in"
                                  style={{ gap: `${dim.innerGapPx}px` }}
                                >
                                  
                                  {/* Photo Placeholder */}
                                  {printPhoto && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shadow-md transition-all duration-300 relative" 
                                      style={{ 
                                        padding: "1.5px",
                                        width: `${dim.previewPhotoWidthPx}px`,
                                        height: `${dim.previewPhotoHeightPx}px`
                                      }}
                                    >
                                      {/* Viewfinder Corner Accents */}
                                      <div className="absolute top-0 left-0 border-t-[1.5px] border-l-[1.5px] transition-all" style={{ width: badgeSize === "A5" ? "10px" : "5px", height: badgeSize === "A5" ? "10px" : "5px", borderColor: themeColor }} />
                                      <div className="absolute top-0 right-0 border-t-[1.5px] border-r-[1.5px] transition-all" style={{ width: badgeSize === "A5" ? "10px" : "5px", height: badgeSize === "A5" ? "10px" : "5px", borderColor: themeColor }} />
                                      <div className="absolute bottom-0 left-0 border-b-[1.5px] border-l-[1.5px] transition-all" style={{ width: badgeSize === "A5" ? "10px" : "5px", height: badgeSize === "A5" ? "10px" : "5px", borderColor: themeColor }} />
                                      <div className="absolute bottom-0 right-0 border-b-[1.5px] border-r-[1.5px] transition-all" style={{ width: badgeSize === "A5" ? "10px" : "5px", height: badgeSize === "A5" ? "10px" : "5px", borderColor: themeColor }} />
                                      
                                      {photoUrl ? (
                                        <img 
                                          src={photoUrl} 
                                          alt="Delegate" 
                                          className={`w-full h-full rounded-[3px] ${photoFit === "contain" ? "object-contain bg-slate-100" : "object-cover object-top"}`} 
                                        />
                                      ) : (
                                        <svg className={`${badgeSize === "A5" ? "w-10 h-10" : "w-8 h-8"} text-slate-300`} fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0 1 12.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                                        </svg>
                                      )}
                                    </div>
                                  )}

                                  {/* 1. Name */}
                                  {printName && (
                                    <h3 className={`font-extrabold text-slate-900 leading-tight uppercase line-clamp-2 px-1 transition-all duration-300 ${
                                      dim.fontSizeName
                                    }`}>
                                      {editName || "PARTICIPANT NAME"}
                                    </h3>
                                  )}

                                  {/* 2. Designation / Org Suffix */}
                                  {selectedParticipant.dynamicData?.Organization && (
                                    <p className={`font-semibold text-slate-500 uppercase truncate max-w-full transition-all duration-300 ${
                                      dim.fontSizeOrg
                                    }`}>
                                      {selectedParticipant.dynamicData.Organization}
                                    </p>
                                  )}

                                  {/* 3. City / Location */}
                                  {printCity && editState && (
                                    <p className={`font-semibold text-slate-400 uppercase truncate max-w-full transition-all duration-300 ${
                                      dim.fontSizeOrg
                                    }`}>
                                      {editState}
                                    </p>
                                  )}
                                </div>

                                {/* Decorative Divider */}
                                <div 
                                  className="transition-all duration-300 relative z-10"
                                  style={{
                                    width: "80%",
                                    height: "1px",
                                    background: "linear-gradient(to right, transparent, #e2e8f0, transparent)",
                                    marginTop: "2px",
                                    marginBottom: "2px"
                                  }}
                                />

                                {/* C. QR Code Section */}
                                {(printQR || printRegId) && (
                                  <div 
                                    className="flex flex-col items-center justify-center pb-2 box-border relative z-10"
                                    style={{ gap: `${dim.innerGapPx}px` }}
                                  >
                                    {printQR && selectedCheckpoints.includes("QR Code") && (
                                      <div 
                                        className="bg-white p-2 rounded-xl shadow-md flex items-center justify-center transition-all duration-300"
                                        style={{
                                          border: `1.5px solid ${themeColor}25`,
                                          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                                          width: `${dim.previewPhotoWidthPx}px`,
                                          height: `${dim.previewPhotoWidthPx}px`,
                                          boxSizing: "border-box"
                                        }}
                                      >
                                        <QRCode
                                          value={selectedParticipant.regId || selectedParticipant._id}
                                          size={256}
                                          level="L"
                                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        />
                                      </div>
                                    )}
                                    
                                    {/* Registration ID */}
                                    {printRegId && (
                                      <div 
                                        className="flex items-center justify-center transition-all duration-300"
                                      >
                                        <p className={`font-sans text-slate-500 font-bold tracking-wider leading-none ${dim.fontSizeRegId}`}>
                                          <span className="text-slate-800 font-extrabold">{selectedParticipant.regId || selectedParticipant._id}</span>
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Category Ribbon */}
                                {editDestination && (
                                  <div 
                                    className="absolute bottom-0 left-0 w-full text-white font-black uppercase text-center tracking-widest py-2 z-20 text-[10px] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
                                    style={{
                                      backgroundColor: themeColor,
                                    }}
                                  >
                                    {editDestination}
                                  </div>
                                )}

                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Mobile PDF & Print Actions */}
                      <div className="w-full grid grid-cols-3 gap-2 mt-4 no-print flex-none">
                        <button
                          onClick={handleDownloadSinglePDF}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 px-2 rounded-xl active:scale-95 transition-all shadow flex items-center justify-center gap-1.5"
                        >
                          📥 Download
                        </button>
                        <button
                          onClick={handlePrintBadge}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs py-3.5 px-2 rounded-xl active:scale-95 transition-all shadow flex items-center justify-center gap-1.5"
                        >
                          🖨️ Print
                        </button>
                        <button
                          onClick={handleShareSinglePDF}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-3.5 px-2 rounded-xl border border-slate-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        >
                          🔗 Share
                        </button>
                      </div>

                      <p className="text-xs text-slate-400 font-medium text-center mt-4 px-4 flex-none">
                        Rendered in {badgeSize.toUpperCase()} Portrait format ({dim.widthMm}mm x {dim.heightMm}mm).
                      </p>
                    </div>
                  );
                })()}

              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm p-12 border border-slate-200/80 flex flex-col items-center justify-center text-center h-[750px] relative z-10">
                <div 
                  className="w-20 h-20 rounded-full bg-slate-50 border border-slate-200/50 flex items-center justify-center text-4xl shadow-sm mb-6 animate-bounce"
                  style={{ animationDuration: "2s" }}
                >
                  🖨️
                </div>
                <h2 className="text-xl font-bold text-slate-900">Select a Delegate</h2>
                <p className="text-slate-500 text-sm mt-2 max-w-sm leading-relaxed">
                  Search and select a participant on the left, or use the multi-select checkboxes to print multiple badges in a single bulk process.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default BadgePrint;
