import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Search, 
  Download, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ArrowLeft, 
  WifiOff, 
  LogOut, 
  Grid, 
  FileText,
  Presentation,
  Bookmark,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { API_URL } from "../../../config/api";

// Clean corrupted UTF-8 entities (like Windows-1252/Latin-1 double encoded quotes and dashes)
export const cleanText = (str?: string): string => {
  if (!str) return "";
  return str
    .replace(/â€“/g, "–")
    .replace(/â€”/g, "—")
    .replace(/â€˜/g, "‘")
    .replace(/â€™/g, "’")
    .replace(/â€œ/g, "“")
    .replace(/â€ /g, "”")
    .replace(/â€¢/g, "•")
    .replace(/Ã©/g, "é")
    .replace(/Ã¨/g, "è")
    .replace(/Ã /g, "à")
    .replace(/Ã¡/g, "á")
    .replace(/Â/g, "")
    .trim();
};

export const getFullMediaUrl = (url?: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${API_URL}${cleanPath}`;
};

export const getFileType = (url?: string): "image" | "pdf" | "ppt" | "other" => {
  if (!url) return "other";
  const cleanUrl = url.split("?")[0].toLowerCase();
  if (cleanUrl.endsWith(".pdf")) return "pdf";
  if (cleanUrl.endsWith(".pptx") || cleanUrl.endsWith(".ppt")) return "ppt";
  if (/\.(jpg|jpeg|png|webp|gif|svg|bmp|avif)$/i.test(cleanUrl)) return "image";
  return "other";
};

// --- Cached Image Component with Smart PDF, PPTX & Error Fallbacks ---
interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

const CachedImage: React.FC<CachedImageProps> = ({ src, alt, className, ...props }) => {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fullUrl = getFullMediaUrl(src);
  const fileType = getFileType(fullUrl);
  const isDocument = fileType === "pdf" || fileType === "ppt" || fileType === "other";

  useEffect(() => {
    let active = true;
    let objectUrl = "";

    setHasError(false);

    // If it's a document (PDF, PPTX, etc.), do not load as <img>
    if (!fullUrl || isDocument) {
      setLoading(false);
      return;
    }

    const resolveSrc = async () => {
      setLoading(true);
      // Try local cache storage first if offline or anyway for speed
      try {
        const cache = await caches.open("posters-media-cache");
        const matchedResponse = await cache.match(fullUrl);
        
        if (matchedResponse) {
          const blob = await matchedResponse.blob();
          if (active) {
            objectUrl = URL.createObjectURL(blob);
            setImgSrc(objectUrl);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Cache match failed, fallback to normal fetch", err);
      }

      // Fallback/Default: online source load
      if (active) {
        setImgSrc(fullUrl);
      }
    };

    resolveSrc();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fullUrl, isDocument]);

  // If the file is a PowerPoint Presentation, render a sleek presentation slide preview card
  if (fileType === "ppt") {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-amber-950 via-slate-900 to-orange-950 flex flex-col items-center justify-center p-6 text-center select-none relative group-hover:scale-105 transition-transform duration-500 ${className || ""}`}>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2.5 shadow-lg group-hover:scale-110 transition-transform">
          <Presentation size={28} />
        </div>
        <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-[9px] tracking-widest uppercase rounded-full shadow-md mb-2">
          PowerPoint Slides
        </span>
        <p className="text-[11px] font-bold text-slate-200 line-clamp-2 px-2 text-center leading-snug">
          {cleanText(alt as string)}
        </p>
        <span className="text-[9px] font-bold text-amber-400/90 mt-2 flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
          <span>Click to launch slide viewer</span>
        </span>
      </div>
    );
  }

  // If the file is a PDF, render a clean presentation badge preview instead of a broken img tag
  if (fileType === "pdf") {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col items-center justify-center p-6 text-center select-none relative group-hover:scale-105 transition-transform duration-500 ${className || ""}`}>
        <div className="w-13 h-13 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-2.5 shadow-lg group-hover:scale-110 transition-transform">
          <FileText size={28} />
        </div>
        <span className="px-2.5 py-0.5 bg-rose-600/90 text-white font-black text-[9px] tracking-widest uppercase rounded-full shadow-sm mb-2">
          PDF Presentation
        </span>
        <p className="text-[11px] font-bold text-slate-300 line-clamp-2 px-2 text-center leading-snug">
          {cleanText(alt as string)}
        </p>
        <span className="text-[9px] font-bold text-rose-400/90 mt-2 flex items-center gap-1 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
          <span>Click to view PDF document</span>
        </span>
      </div>
    );
  }

  // If broken, empty source, or generic document
  if (hasError || !fullUrl || fileType === "other") {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-5 text-center select-none ${className || ""}`}>
        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-2 shadow-inner">
          <FileText size={24} />
        </div>
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
          Scientific Presentation
        </span>
        <p className="text-[10px] font-medium text-slate-400 line-clamp-2 px-2 text-center mt-1">
          {cleanText(alt as string)}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className || ""}`}>
      {loading && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      {imgSrc && (
        <img
          src={imgSrc}
          alt=""
          className="w-full h-full object-cover"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setHasError(true);
          }}
          {...props}
        />
      )}
    </div>
  );
};

// --- Main Poster Portal Component ---
export default function PosterPortal() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Authentication states
  const [identifier, setIdentifier] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState("");
  const [attendee, setAttendee] = useState<any>(null);
  const [conference, setConference] = useState<any>(null);

  // Posters data states
  const [posters, setPosters] = useState<any[]>([]);
  const [loadingPosters, setLoadingPosters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchField, setSearchField] = useState<"all" | "number" | "presenter" | "title" | "institution">("all");
  
  // Navigation / Detail Page states
  const [selectedPoster, setSelectedPoster] = useState<any>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDraggingState, setIsDraggingState] = useState(false);

  // Offline status tracking
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Touch zoom / pan refs
  const viewerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startDrag = useRef({ x: 0, y: 0 });
  const pinchStartDist = useRef(0);
  const zoomScaleRef = useRef(zoomScale);
  zoomScaleRef.current = zoomScale;
  const panOffsetRef = useRef(panOffset);
  panOffsetRef.current = panOffset;

  // Listen to network changes
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Check auth on mount
  useEffect(() => {
    if (!slug) return;

    // Admin session bypass verification check
    const savedUserStr = localStorage.getItem("user");
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && (savedUser.role === "admin" || savedUser.role === "client")) {
          // Fetch conference list via public route to resolve slug -> _id
          fetch(`${API_URL}/api/conferences`)
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data)) {
                const found = data.find(c => c.slug === slug || c._id === slug);
                if (found) {
                  setConference(found);
                  setAttendee({ name: savedUser.name || (savedUser.role === "admin" ? "Administrator" : "Organizer"), isStaff: true, isBypassAdmin: true });
                }
              }
            })
            .catch(err => {
              console.error("Admin session bypass failed:", err);
            });
          return;
        }
      } catch (e) {
        // Fallback to normal flow
      }
    }

    const session = localStorage.getItem(`verified_attendee_${slug}`);
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setAttendee(parsed.participant);
        setConference(parsed.conference);
        
        // Load posters from cache initially
        const cachedPosters = localStorage.getItem(`posters_cache_${slug}`);
        if (cachedPosters) {
          const parsedPosters = JSON.parse(cachedPosters);
          setPosters(parsedPosters);
          extractCategories(parsedPosters);
        }
      } catch (e) {
        localStorage.removeItem(`verified_attendee_${slug}`);
      }
    }
  }, [slug]);

  // Load / Sync posters if authenticated
  useEffect(() => {
    if (!conference?._id) return;
    fetchPosters();
  }, [conference, isOffline]);

  const extractCategories = (list: any[]) => {
    const cats: string[] = [];
    list.forEach(p => {
      if (p.category && !cats.includes(p.category)) {
        cats.push(p.category);
      }
    });
    setCategories(cats.sort());
  };

  const fetchPosters = async () => {
    if (!conference?._id || !slug) return;
    setLoadingPosters(true);

    // If offline, serve from cache only
    if (isOffline) {
      const cached = localStorage.getItem(`posters_cache_${slug}`);
      if (cached) {
        const list = JSON.parse(cached);
        setPosters(list);
        extractCategories(list);
      }
      setLoadingPosters(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/posters/list/${conference._id}`);
      if (!res.ok) throw new Error("Failed to fetch posters");
      const list = await res.json();
      
      setPosters(list);
      extractCategories(list);
      
      // Save metadata to local storage
      localStorage.setItem(`posters_cache_${slug}`, JSON.stringify(list));
      
      // Programmatically cache images in Cache Storage for offline use
      preCachePosterMedia(list);
    } catch (err) {
      console.error("Poster synchronization failed:", err);
      // If error occurs, check if we have offline cache available
      const cached = localStorage.getItem(`posters_cache_${slug}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setPosters(parsed);
        extractCategories(parsed);
      }
    } finally {
      setLoadingPosters(false);
    }
  };

  // Programmatically pre-fetch and store images inside browser Cache Storage
  const preCachePosterMedia = async (posterList: any[]) => {
    try {
      const cache = await caches.open("posters-media-cache");
      for (const p of posterList) {
        if (p.thumbnailUrl) {
          cache.add(p.thumbnailUrl).catch(() => {});
        }
        if (p.imageUrl) {
          cache.add(p.imageUrl).catch(() => {});
        }
      }
    } catch (e) {
      console.warn("Failed to write to browser Cache Storage:", e);
    }
  };

  // --- Attendee Authentication Handler ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !slug) return;

    setVerifying(true);
    setAuthError("");

    // Offline registration fallback check
    if (isOffline) {
      // Check if there is any cached attendee session we can compare against
      const cachedPosters = localStorage.getItem(`posters_cache_${slug}`);
      if (cachedPosters) {
        // If offline and there's a cached set, try to allow lookup if we have cached participant lists,
        // but since we only cache the verified attendee session, we check if they log in as that exact user.
        setAuthError("Internet connection required for initial sign-in.");
        setVerifying(false);
        return;
      }
    }

    try {
      const res = await fetch(`${API_URL}/api/posters/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, identifier }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      // Save session
      localStorage.setItem(`verified_attendee_${slug}`, JSON.stringify(data));
      setAttendee(data.participant);
      setConference(data.conference);
    } catch (err: any) {
      setAuthError(err.message || "Invalid registration credential.");
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    if (!slug) return;
    localStorage.removeItem(`verified_attendee_${slug}`);
    setAttendee(null);
    setConference(null);
    setPosters([]);
  };

  // --- Search & Filtering Logic ---
  const filteredPosters = posters.filter(poster => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      // Only filter by category if no search query
      return !selectedCategory || poster.category === selectedCategory;
    }

    const matchesCategory = !selectedCategory || poster.category === selectedCategory;
    if (!matchesCategory) return false;

    const matchesNumber = poster.posterNumber.toLowerCase().includes(q);
    const matchesTitle = poster.title.toLowerCase().includes(q);
    const matchesPresenter = poster.presenterName.toLowerCase().includes(q);
    const matchesInstitution = (poster.institution || "").toLowerCase().includes(q);

    if (searchField === "number") return matchesNumber;
    if (searchField === "title") return matchesTitle;
    if (searchField === "presenter") return matchesPresenter;
    if (searchField === "institution") return matchesInstitution;

    return matchesNumber || matchesTitle || matchesPresenter || matchesInstitution;
  });

  // --- Zoom & Pan Logic for Details Screen ---
  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoomScale(prev => {
    const next = Math.max(prev - 0.25, 1);
    if (next === 1) setPanOffset({ x: 0, y: 0 }); // Reset positioning
    return next;
  });

  const handleDoubleClick = () => {
    if (zoomScale > 1) {
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
    } else {
      setZoomScale(2);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale === 1) return;
    isDragging.current = true;
    setIsDraggingState(true);
    startDrag.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || zoomScale === 1) return;
    const newX = e.clientX - startDrag.current.x;
    const newY = e.clientY - startDrag.current.y;
    setPanOffset({ x: newX, y: newY });
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
    setIsDraggingState(false);
  };

  // Active non-passive event listeners on viewerRef to prevent browser viewport pinch-zoom & page scaling
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !selectedPoster) return;

    const handleNativeTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1 && zoomScaleRef.current > 1) {
        isDragging.current = true;
        setIsDraggingState(true);
        startDrag.current = { 
          x: e.touches[0].clientX - panOffsetRef.current.x, 
          y: e.touches[0].clientY - panOffsetRef.current.y 
        };
      } else if (e.touches.length >= 2) {
        // Prevent native browser pinch zoom on the entire webpage
        e.preventDefault();
        isDragging.current = false;
        setIsDraggingState(false);
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        pinchStartDist.current = dist;
      }
    };

    const handleNativeTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        // Stop browser native page zoom
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (pinchStartDist.current > 0) {
          const ratio = dist / pinchStartDist.current;
          pinchStartDist.current = dist;
          setZoomScale(prev => {
            const next = Math.max(1, Math.min(prev * ratio, 4));
            if (next === 1) setPanOffset({ x: 0, y: 0 });
            return next;
          });
        }
      } else if (isDragging.current && e.touches.length === 1 && zoomScaleRef.current > 1) {
        e.preventDefault();
        const newX = e.touches[0].clientX - startDrag.current.x;
        const newY = e.touches[0].clientY - startDrag.current.y;
        setPanOffset({ x: newX, y: newY });
      }
    };

    const handleNativeTouchEnd = () => {
      isDragging.current = false;
      setIsDraggingState(false);
      pinchStartDist.current = 0;
    };

    const handleNativeWheel = (e: WheelEvent) => {
      // Intercept trackpad pinch gesture or Ctrl + wheel to prevent browser page zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.08 : 0.92;
        setZoomScale(prev => {
          const next = Math.max(1, Math.min(prev * factor, 4));
          if (next === 1) setPanOffset({ x: 0, y: 0 });
          return next;
        });
      } else if (zoomScaleRef.current > 1) {
        e.preventDefault();
        setPanOffset(prev => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    const handleGesture = (e: Event) => {
      e.preventDefault();
    };

    viewer.addEventListener("touchstart", handleNativeTouchStart, { passive: false });
    viewer.addEventListener("touchmove", handleNativeTouchMove, { passive: false });
    viewer.addEventListener("touchend", handleNativeTouchEnd, { passive: true });
    viewer.addEventListener("touchcancel", handleNativeTouchEnd, { passive: true });
    viewer.addEventListener("wheel", handleNativeWheel, { passive: false });
    viewer.addEventListener("gesturestart", handleGesture as EventListener, { passive: false });
    viewer.addEventListener("gesturechange", handleGesture as EventListener, { passive: false });
    viewer.addEventListener("gestureend", handleGesture as EventListener, { passive: false });

    return () => {
      viewer.removeEventListener("touchstart", handleNativeTouchStart);
      viewer.removeEventListener("touchmove", handleNativeTouchMove);
      viewer.removeEventListener("touchend", handleNativeTouchEnd);
      viewer.removeEventListener("touchcancel", handleNativeTouchEnd);
      viewer.removeEventListener("wheel", handleNativeWheel);
      viewer.removeEventListener("gesturestart", handleGesture as EventListener);
      viewer.removeEventListener("gesturechange", handleGesture as EventListener);
      viewer.removeEventListener("gestureend", handleGesture as EventListener);
    };
  }, [selectedPoster]);

  // Slide list is filtered by category if selected, but ignores search text query to allow sliding
  const slidePosters = posters.filter(p => !selectedCategory || p.category === selectedCategory);

  // Slide to next/prev poster in slide list
  const handleNextPoster = () => {
    if (!selectedPoster) return;
    const currentIndex = slidePosters.findIndex(p => p._id === selectedPoster._id);
    if (currentIndex !== -1 && currentIndex < slidePosters.length - 1) {
      const nextPoster = slidePosters[currentIndex + 1];
      setSelectedPoster(nextPoster);
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
      navigate(`?poster=${nextPoster.posterNumber}`, { replace: true });
    }
  };

  const handlePrevPoster = () => {
    if (!selectedPoster) return;
    const currentIndex = slidePosters.findIndex(p => p._id === selectedPoster._id);
    if (currentIndex > 0) {
      const prevPoster = slidePosters[currentIndex - 1];
      setSelectedPoster(prevPoster);
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
      navigate(`?poster=${prevPoster.posterNumber}`, { replace: true });
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // Keyboard Navigation for Selected Poster slider
  useEffect(() => {
    if (!selectedPoster) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      
      if (e.key === "ArrowRight") {
        handleNextPoster();
      } else if (e.key === "ArrowLeft") {
        handlePrevPoster();
      } else if (e.key === "Escape") {
        setSelectedPoster(null);
        navigate(window.location.pathname, { replace: true });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPoster, slidePosters]);

  // Share functionality
  const handleShare = async () => {
    if (!selectedPoster) return;
    const shareUrl = `${window.location.origin}/events/${slug}/posters?poster=${selectedPoster.posterNumber}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: cleanText(selectedPoster.title),
          text: `View Scientific Poster ${selectedPoster.posterNumber} presented by ${cleanText(selectedPoster.presenterName)}`,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Web Share API aborted or failed");
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Poster link copied to clipboard!");
    }
  };

  // Download functionality
  const handleDownload = async () => {
    if (!selectedPoster?.imageUrl) return;
    try {
      const url = getFullMediaUrl(selectedPoster.imageUrl);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const fileType = getFileType(selectedPoster.imageUrl);
      const ext = fileType === "pdf" ? "pdf" : fileType === "ppt" ? "pptx" : "jpg";
      const fileLabel = fileType === "ppt" ? "Slides" : "Poster";
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${selectedPoster.posterNumber || "Presentation"}_${fileLabel}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback direct open in case of CORS or local failures
      const fullUrl = getFullMediaUrl(selectedPoster.imageUrl);
      window.open(fullUrl, "_blank");
    }
  };

  // Check URL query parameters for direct poster navigation (from share links)
  useEffect(() => {
    if (posters.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const posterNum = params.get("poster");
      if (posterNum) {
        const found = posters.find(p => p.posterNumber.toLowerCase() === posterNum.toLowerCase());
        if (found) {
          setSelectedPoster(found);
          setZoomScale(1);
          setPanOffset({ x: 0, y: 0 });
        }
      }
    }
  }, [posters]);

  // --- VIEW 1: LOGIN PORTAL ---
  if (!attendee) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-60 translate-x-20 -translate-y-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-60 -translate-x-20 translate-y-20 pointer-events-none"></div>

        <header className="p-6 flex items-center justify-between border-b border-slate-200 bg-white/70 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md">
              R
            </div>
            <span className="font-extrabold text-slate-800 text-lg tracking-tight">
              Reg<span className="text-blue-600">Xpert</span>
            </span>
          </div>

          {isOffline && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full">
              <WifiOff size={13} />
              <span>Offline Mode</span>
            </div>
          )}
        </header>

        <main className="flex-1 flex items-center justify-center p-6 z-10">
          <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-xl p-8 transition-all">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                📑
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Scientific Poster Portal</h2>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Enter your registered Email Address or Registration ID to browse scientific presentations.
              </p>
            </div>

            {authError && (
              <div className="mb-5 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold leading-normal">
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Registration Credentials
                </label>
                <input
                  type="text"
                  placeholder="e.g. ID - ABCD123 or doctor@gmail.com"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-700 font-bold transition-all text-sm shadow-inner"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] text-sm flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Access Portal</span>
                )}
              </button>
            </form>
          </div>
        </main>

        <footer className="py-6 border-t border-slate-200 bg-white/50 text-center text-xs text-slate-400 font-semibold z-10">
          © 2026 RegXpert Scientific Modules. Accessible only to verified attendees.
        </footer>
      </div>
    );
  }

  // --- VIEW 2: POSTER DETAILS FULL-SCREEN VIEW ---
  if (selectedPoster) {
    const currentIndex = slidePosters.findIndex(p => p._id === selectedPoster._id);
    const mediaUrl = getFullMediaUrl(selectedPoster.imageUrl);
    const mediaType = getFileType(mediaUrl);
    const isPpt = mediaType === "ppt";
    const isPdf = mediaType === "pdf";
    const pptEmbedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(mediaUrl)}`;

    return (
      <div 
        className="min-h-screen bg-slate-900 text-white font-sans flex flex-col justify-between overflow-hidden relative select-none touch-none"
        style={{ touchAction: "none" }}
      >
        {/* Top Header Controls */}
        <header className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between z-20 backdrop-blur-md">
          <button
            onClick={() => {
              setSelectedPoster(null);
              // Clean query parameter when returning
              navigate(window.location.pathname, { replace: true });
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all text-sm font-bold active:scale-95"
          >
            <ArrowLeft size={16} />
            <span>Back to Gallery</span>
          </button>

          <div className="hidden md:block text-center max-w-lg">
            <span className="px-2.5 py-0.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-black rounded-lg uppercase tracking-wider mb-1 inline-block">
              {selectedPoster.posterNumber}
            </span>
            <h3 className="font-extrabold text-sm truncate leading-tight">{cleanText(selectedPoster.title)}</h3>
          </div>

          <div className="flex items-center gap-2">
            {!isPpt && (
              <>
                <button
                  onClick={handleZoomOut}
                  disabled={zoomScale === 1}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl transition-all active:scale-95"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="text-xs font-mono font-bold w-12 text-center bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomScale === 4}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl transition-all active:scale-95"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>

                <div className="h-6 w-px bg-slate-800 mx-1"></div>
              </>
            )}

            {isPpt && (
              <a
                href={mediaUrl}
                download={`${selectedPoster.posterNumber || "Presentation"}_Slides.pptx`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Presentation size={15} />
                <span className="hidden sm:inline">Open Slides</span>
              </a>
            )}

            <button
              onClick={handleDownload}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all active:scale-95"
              title={isPpt ? "Download PowerPoint Presentation" : "Download Poster File"}
            >
              <Download size={18} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all active:scale-95"
              title="Share Poster Link"
            >
              <Share2 size={18} />
            </button>
          </div>
        </header>

        {/* Poster Viewer Frame */}
        <main 
          ref={viewerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onDoubleClick={handleDoubleClick}
          className={`flex-1 flex items-center justify-center relative select-none touch-none ${
            zoomScale > 1 ? "cursor-move" : "cursor-default"
          } bg-slate-950/40`}
          style={{ overflow: "hidden", touchAction: "none" }}
        >
          {isPdf ? (
            <iframe
              src={mediaUrl}
              title={cleanText(selectedPoster.title)}
              className="w-full h-full border-none z-10"
              style={{
                transform: `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)`,
                transition: isDragging.current ? "none" : "transform 0.15s ease-out"
              }}
            />
          ) : isPpt ? (
            <div className="w-full h-full flex flex-col items-center justify-center relative z-10 p-2 md:p-6">
              <iframe
                src={pptEmbedUrl}
                title={cleanText(selectedPoster.title)}
                className="w-full h-full rounded-2xl border border-slate-800 shadow-2xl bg-white"
                allowFullScreen
              />
            </div>
          ) : (
            <div
              className="max-h-[85vh] md:max-h-[88vh] max-w-[95%] transition-transform duration-75 ease-out select-none"
              style={{
                transform: `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)`,
                transition: isDragging.current ? "none" : "transform 0.15s ease-out"
              }}
            >
              <CachedImage
                src={selectedPoster.imageUrl}
                alt={selectedPoster.title}
                className="max-h-[85vh] md:max-h-[88vh] object-contain rounded-lg shadow-2xl"
                draggable={false}
              />
            </div>
          )}
        </main>

        {/* Floating navigation and control elements */}
        {/* Floating Left Slide Button */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevPoster}
            className={`fixed md:absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 md:w-14 md:h-14 flex items-center justify-center shrink-0 bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 text-white rounded-full transition-all duration-200 active:scale-95 shadow-2xl group focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDraggingState ? "opacity-0 pointer-events-none" : zoomScale > 1 ? "opacity-30 hover:opacity-100" : "opacity-90 hover:opacity-100"
            }`}
            style={{ transform: "translateY(-50%)" }}
            title="Previous Poster (Left Arrow Key)"
          >
            <ChevronLeft size={24} className="shrink-0 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Floating Right Slide Button */}
        {currentIndex < slidePosters.length - 1 && (
          <button
            onClick={handleNextPoster}
            className={`fixed md:absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 md:w-14 md:h-14 flex items-center justify-center shrink-0 bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 text-white rounded-full transition-all duration-200 active:scale-95 shadow-2xl group focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDraggingState ? "opacity-0 pointer-events-none" : zoomScale > 1 ? "opacity-30 hover:opacity-100" : "opacity-90 hover:opacity-100"
            }`}
            style={{ transform: "translateY(-50%)" }}
            title="Next Poster (Right Arrow Key)"
          >
            <ChevronRight size={24} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    );
  }

  // --- VIEW 3: POSTER GALLERY GRID ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Banner / Header details */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        
        {/* Dynamic Warning Notification */}
        {isOffline && (
          <div className="bg-amber-500 text-white font-bold text-center py-2 text-xs flex items-center justify-center gap-2 shadow-inner">
            <WifiOff size={14} />
            <span>You are currently offline. Browsing previously loaded scientific posters.</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-md shrink-0">
              📑
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-slate-900 tracking-tight leading-tight">
                {conference?.name || "Scientific Presentations"}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Poster Gallery Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-800 leading-tight">{attendee.name}</p>
              <p className="text-[10px] font-semibold text-slate-400">{attendee.regId}</p>
            </div>

            <button
              onClick={handleLogout}
              className="p-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-slate-500 transition-all active:scale-95 shrink-0 border border-slate-200/50"
              title="Logout Portal"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Live search filters dashboard */}
        <div className="max-w-7xl mx-auto px-6 pb-5 pt-1">
          <div className="bg-slate-50/70 border border-slate-200/60 p-4 rounded-2xl flex flex-col lg:flex-row gap-4">
            
            {/* Search inputs */}
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder={
                  searchField === "number" ? "Search by Poster Number..." :
                  searchField === "title" ? "Search by Poster Title..." :
                  searchField === "presenter" ? "Search by Presenter Name..." :
                  searchField === "institution" ? "Search by Institution..." :
                  "Search by Number, Title, Author..."
                }
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold text-slate-700 text-sm transition-all shadow-inner"
              />
            </div>

            {/* Selector criteria filter */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1 shadow-sm shrink-0">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Search in:</span>
                <select
                  value={searchField}
                  onChange={e => setSearchField(e.target.value as any)}
                  className="bg-transparent font-bold text-xs text-slate-600 focus:outline-none border-none py-1 pr-6 cursor-pointer"
                >
                  <option value="all">All Fields</option>
                  <option value="number">Poster Number</option>
                  <option value="title">Poster Title</option>
                  <option value="presenter">Presenter</option>
                  <option value="institution">Institution</option>
                </select>
              </div>

              {categories.length > 0 && (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1 shadow-sm shrink-0">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="bg-transparent font-bold text-xs text-slate-600 focus:outline-none border-none py-1 pr-6 cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main posters grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {loadingPosters && posters.length === 0 ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Syncing presentations database...</p>
          </div>
        ) : filteredPosters.length === 0 ? (
          <div className="min-h-[40vh] bg-white border border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-2xl text-slate-400 mb-4">
              🔍
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg mb-1">No posters found</h3>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed font-medium">
              We couldn't find any scientific presentations matching your active search filters.
            </p>
          </div>
        ) : (
          <div>
            {/* Grid count summary */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Showing {filteredPosters.length} of {posters.length} Scientific Presentations
              </span>
            </div>

            {/* Poster grid cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPosters.map((poster) => (
                <div
                  key={poster._id}
                  className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all flex flex-col group"
                >
                  {/* Poster Thumbnail frame */}
                  <div className="h-56 bg-slate-100 border-b border-slate-200/60 overflow-hidden relative">
                    <CachedImage
                      src={poster.thumbnailUrl || poster.imageUrl}
                      alt={cleanText(poster.title)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Poster Category / Number Tag */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-white text-[10px] font-black rounded-lg shadow-md uppercase tracking-wider">
                        {poster.posterNumber}
                      </span>
                    </div>

                    {poster.category && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className="px-2.5 py-1 bg-blue-600 border border-blue-500 text-white text-[9px] font-bold rounded-lg shadow-md uppercase tracking-widest">
                          {cleanText(poster.category)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Poster Info (Limited preview details for gallery visual cleanliness) */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="mb-4">
                      <h3 
                        className="font-extrabold text-slate-800 text-sm tracking-tight leading-snug line-clamp-2 min-h-[2.5rem]"
                        title={cleanText(poster.title)}
                      >
                        {cleanText(poster.title)}
                      </h3>
                      <p className="text-xs text-slate-500 font-bold mt-2 truncate">
                        🎙️ Author: <span className="text-slate-800 font-extrabold">{cleanText(poster.presenterName)}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPoster(poster);
                        setZoomScale(1);
                        setPanOffset({ x: 0, y: 0 });
                      }}
                      className="w-full py-3 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 hover:border-transparent transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm group-hover:border-blue-300"
                    >
                      {getFileType(poster.imageUrl) === "ppt" ? (
                        <>
                          <Presentation size={15} className="text-amber-500" />
                          <span>View PowerPoint Slides</span>
                        </>
                      ) : (
                        <>
                          <FileText size={15} className="text-blue-500" />
                          <span>View Presentation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Portal footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-semibold mt-12">
        Powered by RegXpert Scientific Presentation Manager. Local caching active.
      </footer>
    </div>
  );
}
