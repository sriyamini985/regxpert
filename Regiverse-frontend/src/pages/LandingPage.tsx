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

          {/* Hero content */}
          <div style={{ position: "relative", zIndex: 1, maxWidth: 1160, margin: "0 auto", padding: "120px 28px 80px", width: "100%" }}>
            <div style={{ maxWidth: 780 }}>
              {/* Pill badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28,
                background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 100, padding: "6px 14px",
                backdropFilter: "blur(8px)",
                animation: "rx-fadein 0.8s ease forwards",
                opacity: 0,
                animationDelay: "0.1s",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,0.25)" }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#93c5fd", letterSpacing: 0.2 }}>Live at ISVIR 2026 · Conference Platform</span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontSize: "clamp(40px, 6.5vw, 76px)", fontWeight: 900, lineHeight: 1.02,
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
                fontSize: "clamp(16px, 2vw, 19px)", color: "rgba(255,255,255,0.55)", lineHeight: 1.75,
                maxWidth: 520, marginBottom: 40,
                animation: "rx-fadein 1s ease forwards", opacity: 0, animationDelay: "0.4s",
              }}>
                RegXpert handles everything — registration, badge printing, QR scanning,
                live dashboards, and reporting. So you can focus on running a great event.
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
            </div>

            {/* Stats row */}
            <div ref={statsRef} style={{
              display: "flex", flexWrap: "wrap", gap: 0, marginTop: 80,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, overflow: "hidden",
              backdropFilter: "blur(12px)",
              maxWidth: 680,
            }}>
              {BENEFITS.map((b, i) => (
                <div key={b.label} style={{ flex: "1 1 140px", padding: "24px 20px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                  <StatCard num={b.num} label={b.label} sub={b.sub} inView={statsInView} i={i} />
                </div>
              ))}
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

          .rx-feature-card:hover .rx-feature-icon {
            background: #dbeafe !important;
            transform: scale(1.08);
          }

          /* Responsive */
          @media (max-width: 900px) {
            .rx-nav-links  { display: none !important; }
            .rx-burger     { display: flex !important; }
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
