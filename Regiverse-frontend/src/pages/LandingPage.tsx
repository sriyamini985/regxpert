import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ══════════════════════════════════════════════════════════════
   REGXPERT — Premium Landing Page
   Design: Original enterprise SaaS aesthetic
   Inspired by: Linear, Stripe, Vercel — not copied from any.
══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const FEATURES = [
  {
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: "Event Registration",
    desc: "Smart forms, bulk Excel imports, and real-time duplicate detection. Get your participant list production-ready in minutes.",
  },
  {
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    title: "Badge Printing",
    desc: "Design category-specific badge templates. Print on demand — single or batch — with your own branding and QR codes.",
  },
  {
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        <path d="M14 17h3v3m0-6h.01M17 14h.01"/>
      </svg>
    ),
    title: "QR Scanning",
    desc: "Instant check-in, kitbag collection, meal tracking, and hall access — all via QR scan. Works on any device.",
  },
  {
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: "Live Dashboard",
    desc: "Real-time attendance, food counters, and scan metrics update live across every station simultaneously.",
  },
  {
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z"/>
      </svg>
    ),
    title: "Bulk Communication",
    desc: "One-click personalised emails and WhatsApp messages to all participants. Track open and delivery rates.",
  },
  {
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: "Reports & Analytics",
    desc: "Export granular Excel reports. Every scan, every meal, every transaction — timestamped and attributed.",
  },
];

const BENEFITS = [
  { num: "80%", label: "Faster Check-in", sub: "vs manual processes" },
  { num: "3K+", label: "Participants Managed", sub: "across all events" },
  { num: "10+", label: "Events Powered", sub: "and growing" },
  { num: "99.9%", label: "Uptime", sub: "during live events" },
];

const WHY = [
  {
    title: "Real-Time Operations",
    desc: "Every scan propagates live to all connected stations. No refresh needed, no data lag.",
  },
  {
    title: "Secure by Design",
    desc: "Role-based access, JWT authentication, and encrypted data at rest and in transit.",
  },
  {
    title: "Offline-Resilient",
    desc: "Stations continue to function during connectivity drops and sync automatically on reconnect.",
  },
  {
    title: "Zero Training Needed",
    desc: "Designed for event-day volunteers. One-screen workflows mean anyone can operate it.",
  },
];

const PAST_EVENTS = [
  {
    name: "ISVIR 2026",
    org: "Indian Society for Vascular & Interventional Radiology",
    location: "Hyderabad",
    date: "July 2026",
    participants: 572,
    color: "#2563eb",
  },
  {
    name: "TYPSCON 2026",
    org: "Thyroid, Parathyroid & Salivary Gland Conference",
    location: "Mumbai",
    date: "June 2026",
    participants: 1240,
    color: "#7c3aed",
  },
  {
    name: "MedConf 2025",
    org: "National Medical Education Summit",
    location: "Bengaluru",
    date: "December 2025",
    participants: 890,
    color: "#0891b2",
  },
];

// ─────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────
function useInView(threshold = 0.12): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useCountUp(target: number, inView: boolean, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return count;
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; y?: number; className?: string }> = ({
  children, delay = 0, y = 24, className = ""
}) => {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : `translateY(${y}px)`,
      transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

const StatCard: React.FC<{ num: string; label: string; sub: string; inView: boolean; i: number }> = ({ num, label, sub, inView, i }) => {
  const isNum = /^\d+/.test(num);
  const numericPart = parseInt(num.replace(/\D/g, ""), 10) || 0;
  const suffix = num.replace(/[\d]/g, "");
  const counted = useCountUp(numericPart, inView);
  return (
    <div style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.6s ease ${i * 120 + 200}ms, transform 0.6s ease ${i * 120 + 200}ms`,
      textAlign: "center", padding: "0 24px",
      borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none",
    }}>
      <div style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, color: "#fff", letterSpacing: -1, lineHeight: 1 }}>
        {isNum ? `${counted}${suffix}` : num}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>{label}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{sub}</div>
    </div>
  );
};

// ─────────────────────────────────────────────
// QR CODE SVG (simplified finder-pattern approximation)
// ─────────────────────────────────────────────
const MiniQR: React.FC<{ size?: number; fg?: string; bg?: string }> = ({ size = 56, fg = "#0f172a", bg = "#fff" }) => {
  const u = size / 14;
  // cells: [col, row] filled positions
  const cells: [number, number][] = [
    // Top-left finder 7x7
    ...(Array.from({length:7},(_,c)=>[[c,0],[c,6]] as [number,number][]).flat()),
    ...(Array.from({length:5},(_,r)=>[[0,r+1],[6,r+1]] as [number,number][]).flat()),
    [2,2],[2,3],[2,4],[3,2],[3,3],[3,4],[4,2],[4,3],[4,4],
    // Top-right finder
    ...(Array.from({length:7},(_,c)=>[[c+7,0],[c+7,6]] as [number,number][]).flat()),
    ...(Array.from({length:5},(_,r)=>[[7,r+1],[13,r+1]] as [number,number][]).flat()),
    [9,2],[9,3],[9,4],[10,2],[10,3],[10,4],[11,2],[11,3],[11,4],
    // Bottom-left finder
    ...(Array.from({length:7},(_,c)=>[[c,7],[c,13]] as [number,number][]).flat()),
    ...(Array.from({length:5},(_,r)=>[[0,r+8],[6,r+8]] as [number,number][]).flat()),
    [2,9],[2,10],[2,11],[3,9],[3,10],[3,11],[4,9],[4,10],[4,11],
    // Data modules
    [8,8],[10,8],[12,8],[9,9],[11,9],[13,9],[8,10],[10,10],[12,10],
    [8,11],[9,11],[11,11],[13,11],[10,12],[12,12],[8,13],[11,13],[13,13],
    [7,7],[7,9],[7,11],[7,13],
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect width={size} height={size} fill={bg} rx={2}/>
      {cells.map(([c, r], i) => (
        <rect key={i} x={c*u+0.5} y={r*u+0.5} width={u-1} height={u-1} rx={0.8} fill={fg}/>
      ))}
    </svg>
  );
};

// ─────────────────────────────────────────────
// MINI BAR CHART SVG
// ─────────────────────────────────────────────
const MiniBarChart: React.FC<{ color?: string }> = ({ color = "#3b82f6" }) => {
  const bars = [40, 65, 52, 78, 60, 88, 72];
  const h = 36, w = 90;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {bars.map((pct, i) => {
        const bh = (pct / 100) * h;
        const bw = 9;
        const x = i * (bw + 3);
        return (
          <rect key={i} x={x} y={h - bh} width={bw} height={bh}
            fill={i === 6 ? color : `rgba(59,130,246,${0.25 + i * 0.07})`}
            rx={2}/>
        );
      })}
    </svg>
  );
};

// ─────────────────────────────────────────────
// HERO ILLUSTRATION
// ─────────────────────────────────────────────
const HeroIllustration: React.FC = () => (
  <div style={{ position: "relative", width: 520, height: 580, margin: "0 auto" }}>

    {/* ── Ambient glow orbs behind cards ── */}
    <div style={{
      position: "absolute", width: 280, height: 280, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)",
      top: 90, left: 80, zIndex: 0, pointerEvents: "none",
    }}/>
    <div style={{
      position: "absolute", width: 180, height: 180, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
      top: 280, right: 40, zIndex: 0, pointerEvents: "none",
    }}/>

    {/* ══ 1. MAIN DASHBOARD CARD ══ */}
    <div style={{
      position: "absolute", top: 92, left: 32, width: 358, zIndex: 10,
      background: "linear-gradient(145deg, rgba(8,18,46,0.96) 0%, rgba(13,28,68,0.92) 100%)",
      border: "1px solid rgba(59,130,246,0.28)",
      borderRadius: 16, overflow: "hidden",
      backdropFilter: "blur(20px)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 40px rgba(59,130,246,0.12)",
      transform: "perspective(1100px) rotateY(-5deg) rotateX(2deg)",
      animation: "rx-illus-float-slow 10s ease-in-out infinite",
    }}>
      {/* Dashboard header */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }}/>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }}/>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }}/>
        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: 0.3 }}>ISVIR 2026 — RegXpert Dashboard</span>
        <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }}/>
      </div>
      {/* Stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 14px", gap: 8 }}>
        {[["572","Registered","#3b82f6"],["318","Checked In","#22c55e"],["89","Pending","#f59e0b"],["245","Meals","#8b5cf6"]].map(([n,l,c])=>(
          <div key={l} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 8px 7px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: c as string, letterSpacing: -0.5, lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 3, fontWeight: 500 }}>{l}</div>
          </div>
        ))}
      </div>
      {/* Participant list */}
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
        {[
          ["RK","Dr. Rohit Kumar","Faculty","#3b82f6",true],
          ["PS","Dr. Priya Shah","Speaker","#8b5cf6",true],
          ["AM","Mr. Arjun Mehta","Delegate","#06b6d4",true],
          ["SG","Dr. Sneha Gupta","Faculty","#f59e0b",false],
        ].map(([init,name,role,col,chk])=>(
          <div key={name as string} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: col as string, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{init}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{name as string}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{role as string}</div>
            </div>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: chk ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {chk && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div style={{ padding: "8px 14px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Check-in Progress</span>
          <span style={{ fontSize: 9, color: "#3b82f6", fontWeight: 700 }}>55.6%</span>
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 100 }}>
          <div style={{ width: "55.6%", height: "100%", background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", borderRadius: 100 }}/>
        </div>
      </div>
    </div>

    {/* ══ 2. CONFERENCE BADGE CARD ══ */}
    <div style={{
      position: "absolute", top: 12, right: 8, width: 144, zIndex: 20,
      background: "#ffffff",
      borderRadius: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(59,130,246,0.15)",
      overflow: "hidden",
      animation: "rx-illus-float-a 6.5s ease-in-out infinite",
    }}>
      <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", padding: "10px 12px 8px" }}>
        <div style={{ fontSize: 7.5, fontWeight: 800, color: "rgba(255,255,255,0.6)", letterSpacing: 1.5, textTransform: "uppercase" }}>ISVIR 2026</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#fff", marginTop: 2 }}>Conference Badge</div>
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6, border: "2px solid #3b82f6" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#1d4ed8" }}>RK</span>
        </div>
        <div style={{ fontSize: 10.5, fontWeight: 800, color: "#0f172a", lineHeight: 1.2, marginBottom: 2 }}>Dr. Rohit Kumar</div>
        <div style={{ fontSize: 8.5, color: "#64748b", marginBottom: 8 }}>AIIMS, New Delhi</div>
        <div style={{ display: "inline-block", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 4, padding: "2px 7px", fontSize: 8, fontWeight: 700, color: "#2563eb", marginBottom: 8 }}>FACULTY</div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <MiniQR size={58} fg="#1e293b" bg="#f8fafc" />
        </div>
        <div style={{ fontSize: 7.5, textAlign: "center", color: "#94a3b8", marginTop: 4 }}>Scan to verify</div>
      </div>
    </div>

    {/* ══ 3. ANALYTICS MINI CARD ══ */}
    <div style={{
      position: "absolute", top: 22, left: 4, width: 156, zIndex: 20,
      background: "linear-gradient(145deg, rgba(8,18,46,0.95), rgba(13,28,68,0.9))",
      border: "1px solid rgba(99,102,241,0.3)",
      borderRadius: 12, padding: "12px 14px",
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
      animation: "rx-illus-float-b 8s ease-in-out infinite",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Live Analytics</span>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }}/>
      </div>
      <MiniBarChart color="#6366f1" />
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>+12%</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>vs yesterday</span>
      </div>
    </div>

    {/* ══ 4. PHONE QR SCANNER ══ */}
    <div style={{
      position: "absolute", top: 200, right: 2, width: 106, height: 198, zIndex: 20,
      background: "linear-gradient(180deg, rgba(5,10,25,0.98), rgba(8,16,40,0.96))",
      border: "2px solid rgba(255,255,255,0.1)",
      borderRadius: 22,
      boxShadow: "0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset",
      overflow: "hidden",
      animation: "rx-illus-float-c 7.5s ease-in-out infinite",
    }}>
      {/* Notch */}
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 0" }}>
        <div style={{ width: 32, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 100 }}/>
      </div>
      {/* Screen content */}
      <div style={{ padding: "8px 8px 0", textAlign: "center" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 6, letterSpacing: 0.3 }}>QR SCANNER</div>
        {/* Viewfinder */}
        <div style={{ position: "relative", width: "100%", height: 82, background: "rgba(0,0,0,0.6)", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
          {/* Corner brackets */}
          {[[0,0],["auto",0],[0,"auto"],["auto","auto"]].map(([t,l],i)=>(
            <div key={i} style={{
              position: "absolute",
              top: typeof t === "number" ? t+4 : undefined, bottom: typeof t === "string" ? 4 : undefined,
              left: typeof l === "number" ? l+4 : undefined, right: typeof l === "string" ? 4 : undefined,
              width: 14, height: 14,
              borderTop: i < 2 ? "2px solid #3b82f6" : "none",
              borderBottom: i >= 2 ? "2px solid #3b82f6" : "none",
              borderLeft: (i === 0 || i === 2) ? "2px solid #3b82f6" : "none",
              borderRight: (i === 1 || i === 3) ? "2px solid #3b82f6" : "none",
            }}/>
          ))}
          {/* QR in center */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.9 }}>
            <MiniQR size={38} fg="rgba(255,255,255,0.85)" bg="transparent" />
          </div>
          {/* Scan line */}
          <div style={{ position: "absolute", left: 8, right: 8, height: 1.5, background: "linear-gradient(90deg, transparent, #3b82f6, transparent)", animation: "rx-scanline 2s ease-in-out infinite", top: 0 }}/>
        </div>
        {/* Status */}
        <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 6, padding: "5px 4px" }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#22c55e", textAlign: "center" }}>✓ VERIFIED</div>
          <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 1 }}>Dr. Rohit Kumar</div>
        </div>
      </div>
      {/* Home bar */}
      <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 6px" }}>
        <div style={{ width: 28, height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 100 }}/>
      </div>
    </div>

    {/* ══ 5. NOTIFICATION PILL — Check-in ══ */}
    <div style={{
      position: "absolute", top: 330, left: 8, zIndex: 25,
      background: "rgba(8,18,46,0.92)",
      border: "1px solid rgba(34,197,94,0.3)",
      borderRadius: 100, padding: "9px 14px",
      backdropFilter: "blur(12px)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", gap: 8,
      animation: "rx-illus-float-a 7s ease-in-out infinite 1.2s",
      whiteSpace: "nowrap",
    }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 4.5,8.5 10,3" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>Checked In</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>Dr. Priya Shah · Speaker</div>
      </div>
    </div>

    {/* ══ 6. LIVE STATS CARD ══ */}
    <div style={{
      position: "absolute", bottom: 48, left: 28, width: 168, zIndex: 20,
      background: "linear-gradient(145deg, rgba(8,18,46,0.95), rgba(13,28,68,0.9))",
      border: "1px solid rgba(59,130,246,0.25)",
      borderRadius: 12, padding: "12px 14px",
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
      animation: "rx-illus-float-b 9s ease-in-out infinite 2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }}/>
        <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: 0.3 }}>LIVE STATS</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -1, lineHeight: 1 }}>268</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3, marginBottom: 10 }}>Participants Checked In</div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 100 }}>
        <div style={{ width: "46.7%", height: "100%", background: "linear-gradient(90deg, #3b82f6, #22c55e)", borderRadius: 100 }}/>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.3)" }}>0</span>
        <span style={{ fontSize: 8.5, color: "#3b82f6", fontWeight: 600 }}>46.7% of 572</span>
      </div>
    </div>

    {/* ══ 7. EMAIL NOTIFICATION CARD ══ */}
    <div style={{
      position: "absolute", bottom: 36, right: 10, width: 160, zIndex: 20,
      background: "linear-gradient(145deg, rgba(8,18,46,0.95), rgba(13,28,68,0.9))",
      border: "1px solid rgba(139,92,246,0.25)",
      borderRadius: 12, padding: "10px 12px",
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
      animation: "rx-illus-float-c 6.5s ease-in-out infinite 0.8s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
        <div style={{ width: 22, height: 22, borderRadius: 7, background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Registration Confirmed</div>
          <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.35)" }}>just now</div>
        </div>
      </div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>Sent to <span style={{ color: "#8b5cf6", fontWeight: 600 }}>Mr. Arjun Mehta</span> · Delegate</div>
    </div>

  </div>
);

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [statsRef, statsInView] = useInView(0.3);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  }, []);

  const navScrolled = scrollY > 40;

  const requestDemo = () => {
    window.location.href = "mailto:sriyamini659@gmail.com?subject=RegXpert%20Demo%20Request&body=Hi%2C%20I%27d%20like%20to%20schedule%20a%20demo%20of%20RegXpert.";
  };

  return (
    <>
      {/* ── Google Font ── */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <div id="rx-root" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#fff", color: "#0f172a", overflowX: "hidden" }}>

        {/* ══════════ NAV ══════════ */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 900,
          transition: "all 0.35s ease",
          background: navScrolled ? "rgba(255,255,255,0.94)" : "transparent",
          backdropFilter: navScrolled ? "blur(16px) saturate(180%)" : "none",
          borderBottom: navScrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
          boxShadow: navScrolled ? "0 1px 0 rgba(0,0,0,0.04)" : "none",
        }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Logo */}
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, padding: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 15, color: "#fff",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.15) inset, 0 2px 6px rgba(59,130,246,0.4)",
              }}>R</div>
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.4, color: navScrolled ? "#0f172a" : "#fff" }}>
                Reg<span style={{ color: navScrolled ? "#3b82f6" : "#93c5fd" }}>Xpert</span>
              </span>
            </button>

            {/* Desktop links */}
            <div className="rx-nav-links" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {[["Features", "features"], ["Why Us", "why"], ["Events", "events"]].map(([l, id]) => (
                <button key={id} onClick={() => scrollTo(id)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 14, fontWeight: 500,
                  color: navScrolled ? "#64748b" : "rgba(255,255,255,0.75)",
                  padding: "6px 12px", borderRadius: 6, transition: "all 0.15s",
                }}
                  onMouseOver={e => { e.currentTarget.style.color = navScrolled ? "#0f172a" : "#fff"; e.currentTarget.style.background = navScrolled ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.08)"; }}
                  onMouseOut={e => { e.currentTarget.style.color = navScrolled ? "#64748b" : "rgba(255,255,255,0.75)"; e.currentTarget.style.background = "transparent"; }}
                >{l}</button>
              ))}
              <div style={{ width: 1, height: 16, background: navScrolled ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.15)", margin: "0 6px" }} />
              <button onClick={() => navigate("/admin-login")} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 500,
                color: navScrolled ? "#64748b" : "rgba(255,255,255,0.75)",
                padding: "6px 12px", borderRadius: 6, transition: "all 0.15s",
              }}
                onMouseOver={e => { e.currentTarget.style.color = navScrolled ? "#0f172a" : "#fff"; }}
                onMouseOut={e => { e.currentTarget.style.color = navScrolled ? "#64748b" : "rgba(255,255,255,0.75)"; }}
              >Log in</button>
              <button onClick={requestDemo} style={{
                background: "#3b82f6", color: "#fff", border: "none",
                borderRadius: 8, padding: "8px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s", letterSpacing: -0.1,
                boxShadow: "0 1px 3px rgba(59,130,246,0.4)",
              }}
                onMouseOver={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(59,130,246,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseOut={e => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(59,130,246,0.4)"; e.currentTarget.style.transform = "none"; }}
              >Request Demo</button>
            </div>

            {/* Mobile burger */}
            <button className="rx-burger" onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 6 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={navScrolled ? "#0f172a" : "#fff"} strokeWidth="2" strokeLinecap="round">
                {menuOpen ? (<><line x1="4" y1="4" x2="18" y2="18"/><line x1="18" y1="4" x2="4" y2="18"/></>) : (<><line x1="3" y1="6" x2="19" y2="6"/><line x1="3" y1="11" x2="19" y2="11"/><line x1="3" y1="16" x2="19" y2="16"/></>)}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div style={{ background: "#fff", borderTop: "1px solid #f1f5f9", padding: "12px 20px 20px" }}>
              {[["Features", "features"], ["Why Us", "why"], ["Events", "events"]].map(([l, id]) => (
                <button key={id} onClick={() => scrollTo(id)} style={{
                  display: "block", width: "100%", textAlign: "left", background: "none", border: "none",
                  fontSize: 15, fontWeight: 500, color: "#374151", padding: "11px 4px", cursor: "pointer",
                  borderBottom: "1px solid #f8fafc",
                }}>{l}</button>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button onClick={() => navigate("/admin-login")} style={{ flex: 1, padding: "10px", fontSize: 14, fontWeight: 600, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", color: "#374151" }}>Log in</button>
                <button onClick={requestDemo} style={{ flex: 1, padding: "10px", fontSize: 14, fontWeight: 600, background: "#3b82f6", border: "none", borderRadius: 8, cursor: "pointer", color: "#fff" }}>Request Demo</button>
              </div>
            </div>
          )}
        </nav>

        {/* ══════════ HERO ══════════ */}
        <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden", background: "#060d1f" }}>

          {/* Layered background */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
            {/* Deep radial base */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 80% at 60% -10%, #1e3a8a 0%, transparent 60%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at -10% 60%, #1e1b4b 0%, transparent 60%)" }} />
            {/* Orb 1 */}
            <div style={{
              position: "absolute", width: 600, height: 600, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
              top: "5%", right: "-8%",
              animation: "rx-float 8s ease-in-out infinite",
            }} />
            {/* Orb 2 */}
            <div style={{
              position: "absolute", width: 400, height: 400, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)",
              bottom: "10%", left: "5%",
              animation: "rx-float 11s ease-in-out infinite reverse",
            }} />
            {/* Subtle dot grid */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
            }} />
            {/* Horizontal glow line */}
            <div style={{
              position: "absolute", left: 0, right: 0, top: "55%",
              height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.25) 25%, rgba(99,102,241,0.35) 50%, rgba(59,130,246,0.25) 75%, transparent 100%)",
              transform: "translateY(-50%)",
            }} />
          </div>

          {/* Hero content — 2-col grid */}
          <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 28px", width: "100%", minHeight: "100vh", display: "flex", alignItems: "center" }}>
            <div className="rx-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center", width: "100%", paddingTop: 80, paddingBottom: 60 }}>

              {/* LEFT — text */}
              <div>
                {/* Pill badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28,
                  background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)",
                  borderRadius: 100, padding: "6px 14px",
                  backdropFilter: "blur(8px)",
                  animation: "rx-fadein 0.8s ease forwards",
                  opacity: 0, animationDelay: "0.1s",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,0.25)" }} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#93c5fd", letterSpacing: 0.2 }}>Live at ISVIR 2026 · Conference Platform</span>
                </div>

                {/* Headline */}
                <h1 style={{
                  fontSize: "clamp(36px, 5vw, 66px)", fontWeight: 900, lineHeight: 1.04,
                  letterSpacing: "-2px", color: "#fff", marginBottom: 22,
                  animation: "rx-slidein 0.9s cubic-bezier(.16,1,.3,1) forwards",
                  opacity: 0, animationDelay: "0.2s",
                }}>
                  Conference<br />
                  <span style={{
                    background: "linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>management,</span>
                  <br />redefined.
                </h1>

                {/* Description */}
                <p style={{
                  fontSize: "clamp(15px, 1.6vw, 18px)", color: "rgba(255,255,255,0.52)", lineHeight: 1.75,
                  maxWidth: 440, marginBottom: 36,
                  animation: "rx-fadein 1s ease forwards", opacity: 0, animationDelay: "0.4s",
                }}>
                  RegXpert handles registration, badge printing, QR scanning,
                  live dashboards, and reporting — so your team stays focused on the event.
                </p>

                {/* CTAs */}
                <div style={{
                  display: "flex", gap: 12, flexWrap: "wrap",
                  animation: "rx-fadein 1s ease forwards", opacity: 0, animationDelay: "0.55s",
                }}>
                  <button onClick={requestDemo} id="hero-demo-btn" style={{
                    background: "#3b82f6", color: "#fff", border: "none",
                    borderRadius: 10, padding: "13px 26px", fontSize: 15, fontWeight: 700,
                    cursor: "pointer", letterSpacing: -0.2,
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.1) inset, 0 4px 20px rgba(59,130,246,0.45)",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                    onMouseOver={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.15) inset, 0 8px 28px rgba(59,130,246,0.55)"; }}
                    onMouseOut={e => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.1) inset, 0 4px 20px rgba(59,130,246,0.45)"; }}
                  >Request a demo
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                  <button onClick={() => navigate("/admin-login")} id="hero-login-btn" style={{
                    background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
                    padding: "13px 26px", fontSize: 15, fontWeight: 600, cursor: "pointer",
                    transition: "all 0.2s", backdropFilter: "blur(8px)",
                  }}
                    onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                  >Log in to portal</button>
                </div>

                {/* Stats strip */}
                <div ref={statsRef} style={{
                  display: "flex", flexWrap: "wrap", gap: 0, marginTop: 48,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14, overflow: "hidden",
                  backdropFilter: "blur(12px)",
                  maxWidth: 420,
                  animation: "rx-fadein 1s ease forwards", opacity: 0, animationDelay: "0.7s",
                }}>
                  {BENEFITS.map((b, i) => (
                    <div key={b.label} style={{ flex: "1 1 90px", padding: "16px 14px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                      <StatCard num={b.num} label={b.label} sub={b.sub} inView={statsInView} i={i} />
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — illustration */}
              <div className="rx-hero-illus" style={{
                display: "flex", justifyContent: "center", alignItems: "center",
                animation: "rx-fadein 1.1s ease forwards", opacity: 0, animationDelay: "0.5s",
              }}>
                <HeroIllustration />
              </div>

            </div>
          </div>

          {/* Bottom fade */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to bottom, transparent, #fff)", zIndex: 1, pointerEvents: "none" }} />
        </section>

        {/* ══════════ FEATURES ══════════ */}
        <section id="features" style={{ background: "#fff", padding: "100px 28px" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <Reveal>
              <div style={{ marginBottom: 64 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#3b82f6", marginBottom: 14 }}>Platform</div>
                <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, letterSpacing: -1.2, color: "#0f172a", lineHeight: 1.1, marginBottom: 14 }}>
                  One platform.<br />Every workflow.
                </h2>
                <p style={{ fontSize: 17, color: "#64748b", maxWidth: 480, lineHeight: 1.7 }}>
                  From day-one registration to the final report — RegXpert handles every step so nothing slips through.
                </p>
              </div>
            </Reveal>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "#e2e8f0", border: "1px solid #e2e8f0", borderRadius: 20, overflow: "hidden" }}>
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 60}>
                  <div
                    style={{
                      background: "#fff", padding: "32px 30px",
                      transition: "background 0.2s",
                      position: "relative", overflow: "hidden", minHeight: 200,
                    }}
                    className="rx-feature-card"
                    onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.background = "#fafbff"; }}
                    onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.background = "#fff"; }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "#eff6ff", color: "#3b82f6",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: 18, transition: "all 0.2s",
                    }} className="rx-feature-icon">
                      {f.svg}
                    </div>
                    <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#0f172a", marginBottom: 8, letterSpacing: -0.2 }}>{f.title}</h3>
                    <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65 }}>{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ WHY ══════════ */}
        <section id="why" style={{ background: "#f8fafc", padding: "100px 28px", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }} className="rx-why-grid">
              {/* Left sticky text */}
              <Reveal>
                <div style={{ position: "sticky", top: 100 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#3b82f6", marginBottom: 14 }}>Why RegXpert</div>
                  <h2 style={{ fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 800, letterSpacing: -1, color: "#0f172a", lineHeight: 1.12, marginBottom: 20 }}>
                    Built for the pace<br />of live events
                  </h2>
                  <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.75, maxWidth: 380 }}>
                    Conference teams don't get second chances on event day. RegXpert is built for the pressure — fast, reliable, and dead simple to operate.
                  </p>
                  <div style={{ marginTop: 36, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button onClick={requestDemo} style={{
                      background: "#0f172a", color: "#fff", border: "none",
                      borderRadius: 9, padding: "11px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                      onMouseOver={e => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseOut={e => { e.currentTarget.style.background = "#0f172a"; e.currentTarget.style.transform = "none"; }}
                    >Get a demo</button>
                  </div>
                </div>
              </Reveal>

              {/* Right cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {WHY.map((w, i) => (
                  <Reveal key={w.title} delay={i * 100}>
                    <div style={{
                      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14,
                      padding: "26px 28px",
                      transition: "all 0.25s ease",
                    }}
                      onMouseOver={e => {
                        const d = e.currentTarget as HTMLDivElement;
                        d.style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)";
                        d.style.transform = "translateY(-2px)";
                        d.style.borderColor = "#bfdbfe";
                      }}
                      onMouseOut={e => {
                        const d = e.currentTarget as HTMLDivElement;
                        d.style.boxShadow = "none";
                        d.style.transform = "none";
                        d.style.borderColor = "#e2e8f0";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%", background: "#3b82f6",
                          marginTop: 7, flexShrink: 0,
                          boxShadow: "0 0 0 3px rgba(59,130,246,0.15)",
                        }} />
                        <div>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6, letterSpacing: -0.1 }}>{w.title}</h3>
                          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65 }}>{w.desc}</p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ PAST EVENTS ══════════ */}
        <section id="events" style={{ background: "#fff", padding: "100px 28px", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <Reveal>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, flexWrap: "wrap", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#3b82f6", marginBottom: 14 }}>Track Record</div>
                  <h2 style={{ fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 800, letterSpacing: -1, color: "#0f172a", lineHeight: 1.1 }}>
                    Events we've powered
                  </h2>
                </div>
                <p style={{ fontSize: 15, color: "#94a3b8", maxWidth: 280, lineHeight: 1.6 }}>
                  Trusted by medical, academic, and industry conference teams across India.
                </p>
              </div>
            </Reveal>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="rx-events-grid">
              {PAST_EVENTS.map((ev, i) => (
                <Reveal key={ev.name} delay={i * 120}>
                  <div style={{
                    border: "1px solid #e2e8f0", borderRadius: 18, overflow: "hidden",
                    background: "#fff", transition: "all 0.3s ease",
                  }}
                    onMouseOver={e => {
                      const d = e.currentTarget as HTMLDivElement;
                      d.style.boxShadow = "0 16px 40px rgba(0,0,0,0.09)";
                      d.style.transform = "translateY(-4px)";
                    }}
                    onMouseOut={e => {
                      const d = e.currentTarget as HTMLDivElement;
                      d.style.boxShadow = "none";
                      d.style.transform = "none";
                    }}
                  >
                    {/* Colored top bar */}
                    <div style={{ height: 5, background: `linear-gradient(90deg, ${ev.color}, ${ev.color}aa)` }} />
                    <div style={{ padding: "28px 28px 28px" }}>
                      {/* Participant count badge */}
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "#f8fafc", border: "1px solid #e2e8f0",
                        borderRadius: 100, padding: "4px 12px",
                        fontSize: 12.5, fontWeight: 600, color: "#64748b", marginBottom: 20,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        {ev.participants.toLocaleString()} participants
                      </div>
                      <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: -0.5, marginBottom: 6 }}>{ev.name}</h3>
                      <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5, marginBottom: 20 }}>{ev.org}</p>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#64748b" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {ev.location}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#64748b" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {ev.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ CTA ══════════ */}
        <section style={{ padding: "100px 28px", background: "#060d1f", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }} />
          </div>
          <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
            <Reveal>
              <h2 style={{ fontSize: "clamp(28px,4.5vw,52px)", fontWeight: 900, color: "#fff", letterSpacing: -1.5, lineHeight: 1.08, marginBottom: 18 }}>
                Ready to simplify your<br />next conference?
              </h2>
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: 40 }}>
                Request a free demo and see how RegXpert transforms event management from registration to the final report.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={requestDemo} id="cta-demo-btn" style={{
                  background: "#3b82f6", color: "#fff", border: "none", borderRadius: 10,
                  padding: "13px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 24px rgba(59,130,246,0.5)",
                  transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
                }}
                  onMouseOver={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(59,130,246,0.6)"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(59,130,246,0.5)"; }}
                >Request a demo
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <button onClick={() => navigate("/admin-login")} id="cta-login-btn" style={{
                  background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                  padding: "13px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s", backdropFilter: "blur(8px)",
                }}
                  onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                >Log in to portal</button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════ FOOTER ══════════ */}
        <footer id="contact" style={{ background: "#030711", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "48px 28px 32px" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 40 }} className="rx-footer-grid">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "#fff" }}>R</div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>Reg<span style={{ color: "#60a5fa" }}>Xpert</span></span>
                </div>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, maxWidth: 260 }}>Professional conference management for medical, academic, and industry events across India.</p>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#334155", marginBottom: 16 }}>Navigate</p>
                {[["Features", "features"], ["Why Us", "why"], ["Events", "events"]].map(([l, id]) => (
                  <button key={id} onClick={() => scrollTo(id)} style={{ display: "block", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#475569", padding: "5px 0", textAlign: "left", transition: "color 0.15s" }}
                    onMouseOver={e => (e.currentTarget.style.color = "#93c5fd")}
                    onMouseOut={e => (e.currentTarget.style.color = "#475569")}
                  >{l}</button>
                ))}
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#334155", marginBottom: 16 }}>Contact</p>
                <a href="mailto:sriyamini659@gmail.com" style={{ display: "block", fontSize: 14, color: "#475569", textDecoration: "none", marginBottom: 8, transition: "color 0.15s" }}
                  onMouseOver={e => (e.currentTarget.style.color = "#93c5fd")}
                  onMouseOut={e => (e.currentTarget.style.color = "#475569")}
                >sriyamini659@gmail.com</a>
                <span style={{ fontSize: 14, color: "#475569" }}>Hyderabad, India</span>
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: 13, color: "#334155" }}>© 2026 RegXpert. All rights reserved.</span>
              <span style={{ fontSize: 13, color: "#334155" }}>Built for conference organisers</span>
            </div>
          </div>
        </footer>

        {/* ══════════ GLOBAL STYLES ══════════ */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

          @keyframes rx-fadein {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes rx-slidein {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes rx-float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33%       { transform: translate(18px, -22px) scale(1.04); }
            66%       { transform: translate(-12px, 14px) scale(0.97); }
          }

          /* Illustration float animations */
          @keyframes rx-illus-float-slow {
            0%, 100% { transform: perspective(1100px) rotateY(-5deg) rotateX(2deg) translateY(0px); }
            50%       { transform: perspective(1100px) rotateY(-5deg) rotateX(2deg) translateY(-10px); }
          }
          @keyframes rx-illus-float-a {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-11px); }
          }
          @keyframes rx-illus-float-b {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-8px); }
          }
          @keyframes rx-illus-float-c {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-14px); }
          }
          @keyframes rx-scanline {
            0%   { top: 8px;  opacity: 1; }
            80%  { opacity: 1; }
            100% { top: calc(100% - 8px); opacity: 0; }
          }

          .rx-feature-card:hover .rx-feature-icon {
            background: #dbeafe !important;
            transform: scale(1.08);
          }

          /* Responsive */
          @media (max-width: 900px) {
            .rx-nav-links  { display: none !important; }
            .rx-burger     { display: flex !important; }
            .rx-hero-grid  { grid-template-columns: 1fr !important; }
            .rx-hero-illus { display: none !important; }
            .rx-why-grid   { grid-template-columns: 1fr !important; gap: 40px !important; }
            .rx-events-grid { grid-template-columns: 1fr !important; }
            #rx-root section[id="features"] .rx-features-inner,
            #rx-root .rx-events-grid { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 1024px) {
            .rx-events-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 700px) {
            .rx-footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          }
          @media (min-width: 901px) {
            .rx-burger { display: none !important; }
          }

          /* Feature grid responsive */
          #features .rx-features-inner { display: grid; grid-template-columns: repeat(3,1fr); }
          @media (max-width: 900px) {
            #features .rx-features-inner { grid-template-columns: 1fr !important; }
          }

          /* Ensure feature grid is always 3 cols on desktop */
          @media (max-width: 900px) {
            #rx-root section[id="features"] > div > div:last-child {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 700px) {
            #rx-root section[id="features"] > div > div:last-child {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default LandingPage;
