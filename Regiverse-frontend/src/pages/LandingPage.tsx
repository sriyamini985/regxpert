import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* =====================================================
   REGXPERT LANDING PAGE
   Clean, modern, minimal SaaS landing page
===================================================== */

// ── Types ──────────────────────────────────────────
interface PastEvent {
  name: string;
  location: string;
  date: string;
  participants: number;
  banner: string;
}

// ── Data ───────────────────────────────────────────
const FEATURES = [
  {
    icon: "📋",
    title: "Event Registration",
    desc: "Streamline participant sign-ups with smart forms, bulk imports, and real-time validation.",
  },
  {
    icon: "🎫",
    title: "Badge Printing",
    desc: "Design and print professional badges instantly. Custom templates per category.",
  },
  {
    icon: "📲",
    title: "QR Scanning",
    desc: "Scan QR codes for check-in, kitbag collection, meals, and hall entry in seconds.",
  },
  {
    icon: "📊",
    title: "Live Dashboard",
    desc: "Monitor attendance, food counters, and distributions live as the event unfolds.",
  },
  {
    icon: "📧",
    title: "Bulk Communication",
    desc: "Send personalised emails and WhatsApp messages to participants in one click.",
  },
  {
    icon: "📈",
    title: "Reports & Analytics",
    desc: "Export detailed Excel reports. Track every scan, every meal, every distribution.",
  },
];

const BENEFITS = [
  {
    icon: "⚡",
    title: "Faster Event Management",
    desc: "Cut check-in time by 80% with automated workflows and QR-powered scanning.",
  },
  {
    icon: "🟢",
    title: "Real-Time Operations",
    desc: "Live updates across all stations. Every scan reflected instantly on your dashboard.",
  },
  {
    icon: "🔒",
    title: "Secure & Reliable",
    desc: "Enterprise-grade security. Your participant data is always protected.",
  },
  {
    icon: "🎯",
    title: "Easy to Use",
    desc: "Intuitive interface designed for event teams. No training needed.",
  },
];

const PAST_EVENTS: PastEvent[] = [
  {
    name: "ISVIR 2026",
    location: "Hyderabad, India",
    date: "July 4–6, 2026",
    participants: 567,
    banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
  },
  {
    name: "TYPSCON 2026",
    location: "Mumbai, India",
    date: "June 14–15, 2026",
    participants: 1240,
    banner: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80",
  },
  {
    name: "MedConf 2025",
    location: "Bengaluru, India",
    date: "December 10–12, 2025",
    participants: 890,
    banner: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&q=80",
  },
];

// ── Intersection observer hook ──────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── Sub-components ─────────────────────────────────
const AnimatedSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children, className = "", delay = 0
}) => {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// ── Main Component ─────────────────────────────────
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const handleDemoRequest = () => {
    window.location.href = "mailto:sriyamini659@gmail.com?subject=RegXpert%20Demo%20Request&body=Hi%2C%20I%20would%20like%20to%20request%20a%20demo%20of%20RegXpert.";
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#ffffff", color: "#111827", overflowX: "hidden" }}>

      {/* ── Google Font ── */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ────────────────── NAV ────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled ? "1px solid #e5e7eb" : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: -0.5,
              boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
            }}>R</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#111827", letterSpacing: -0.5 }}>Reg<span style={{ color: "#2563eb" }}>Xpert</span></span>
          </div>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="landing-nav-desktop">
            {[["Home", "hero"], ["Features", "features"], ["Contact", "contact"]].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 500, color: "#374151",
                padding: "4px 0", transition: "color 0.2s",
              }}
                onMouseOver={e => (e.currentTarget.style.color = "#2563eb")}
                onMouseOut={e => (e.currentTarget.style.color = "#374151")}
              >{label}</button>
            ))}
            <button
              onClick={() => navigate("/admin-login")}
              style={{
                background: "#2563eb", color: "#fff", border: "none", borderRadius: 8,
                padding: "8px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                transition: "background 0.2s, transform 0.15s",
                boxShadow: "0 1px 4px rgba(37,99,235,0.3)",
              }}
              onMouseOver={e => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; }}
            >Login</button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="landing-nav-mobile"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "none" }}
            aria-label="Toggle menu"
          >
            <div style={{ width: 22, display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ display: "block", height: 2, background: "#374151", borderRadius: 2, transition: "transform 0.3s", transform: mobileOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
              <span style={{ display: "block", height: 2, background: "#374151", borderRadius: 2, opacity: mobileOpen ? 0 : 1, transition: "opacity 0.2s" }} />
              <span style={{ display: "block", height: 2, background: "#374151", borderRadius: 2, transition: "transform 0.3s", transform: mobileOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{
            background: "#fff", borderTop: "1px solid #f3f4f6", padding: "16px 24px 24px",
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            {[["Home", "hero"], ["Features", "features"], ["Contact", "contact"]].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{
                background: "none", border: "none", cursor: "pointer", textAlign: "left",
                fontSize: 15, fontWeight: 500, color: "#374151", padding: "10px 0",
              }}>{label}</button>
            ))}
            <button
              onClick={() => navigate("/admin-login")}
              style={{
                background: "#2563eb", color: "#fff", border: "none", borderRadius: 8,
                padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 8,
              }}
            >Login</button>
          </div>
        )}
      </nav>

      {/* ────────────────── HERO ────────────────── */}
      <section id="hero" style={{ paddingTop: 128, paddingBottom: 96, textAlign: "center", background: "#ffffff", position: "relative", overflow: "hidden" }}>
        {/* Background decoration */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 100,
            padding: "6px 16px", fontSize: 13, fontWeight: 600, color: "#2563eb",
            marginBottom: 28, letterSpacing: 0.3,
          }}>
            <span style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }} />
            Live at ISVIR 2026 — Conference Management Platform
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, lineHeight: 1.1,
            color: "#0f172a", letterSpacing: -1.5, marginBottom: 20,
          }}>
            Conference Management,<br />
            <span style={{ color: "#2563eb" }}>Redefined.</span>
          </h1>

          <p style={{
            fontSize: "clamp(16px, 2vw, 19px)", color: "#4b5563", lineHeight: 1.7,
            marginBottom: 40, maxWidth: 560, margin: "0 auto 40px",
          }}>
            RegXpert handles registration, badge printing, QR scanning, live dashboards,
            and reporting — so you can focus on running a great event.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleDemoRequest}
              id="hero-demo-btn"
              style={{
                background: "#2563eb", color: "#fff", border: "none", borderRadius: 10,
                padding: "14px 30px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 8,
              }}
              onMouseOver={e => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,0.4)"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,99,235,0.35)"; }}
            >
              Request a Demo →
            </button>
            <button
              onClick={() => navigate("/admin-login")}
              id="hero-login-btn"
              style={{
                background: "#fff", color: "#1e293b", border: "1.5px solid #e2e8f0", borderRadius: 10,
                padding: "14px 30px", fontSize: 15, fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 8,
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#1e293b"; }}
            >
              Login to Portal
            </button>
          </div>

          {/* Stats strip */}
          <div style={{
            display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap",
            marginTop: 60, paddingTop: 40, borderTop: "1px solid #f1f5f9",
          }}>
            {[["3,000+", "Participants Managed"], ["10+", "Events Powered"], ["99.9%", "Uptime"]].map(([val, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: -0.5 }}>{val}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── FEATURES ────────────────── */}
      <section id="features" style={{ padding: "96px 24px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <AnimatedSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Platform Features</p>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#0f172a", letterSpacing: -0.8, lineHeight: 1.2 }}>
                Everything you need to run<br />a flawless event
              </h2>
              <p style={{ fontSize: 17, color: "#6b7280", marginTop: 14, maxWidth: 520, margin: "14px auto 0" }}>
                One platform. Every workflow. From registration day to the final report.
              </p>
            </div>
          </AnimatedSection>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}>
            {FEATURES.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 80}>
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 16,
                    padding: "28px 28px",
                    transition: "all 0.25s ease",
                    cursor: "default",
                  }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(37,99,235,0.10)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#bfdbfe";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  }}
                >
                  <div style={{
                    width: 48, height: 48, background: "#eff6ff", borderRadius: 12,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, marginBottom: 16,
                  }}>{f.icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── WHY REGXPERT ────────────────── */}
      <section id="why" style={{ padding: "96px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="landing-why-grid">
          <AnimatedSection>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Why RegXpert</p>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, color: "#0f172a", letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 20 }}>
              Built for the pace of<br />live conferences
            </h2>
            <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.75, maxWidth: 460 }}>
              RegXpert was built because conference teams deserve software that keeps up with them.
              Real-time updates, zero-latency scanning, and reports that actually make sense.
            </p>
          </AnimatedSection>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {BENEFITS.map((b, i) => (
              <AnimatedSection key={b.title} delay={i * 100}>
                <div style={{
                  padding: "24px", background: "#f8fafc", borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  transition: "all 0.25s",
                }}
                  onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.background = "#eff6ff"; (e.currentTarget as HTMLDivElement).style.borderColor = "#bfdbfe"; }}
                  onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"; (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0"; }}
                >
                  <div style={{ fontSize: 26, marginBottom: 12 }}>{b.icon}</div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{b.title}</h3>
                  <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{b.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── PAST EVENTS ────────────────── */}
      <section id="events" style={{ padding: "96px 24px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <AnimatedSection>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Track Record</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, color: "#0f172a", letterSpacing: -0.8, lineHeight: 1.2 }}>
                Events we've powered
              </h2>
              <p style={{ fontSize: 16, color: "#6b7280", marginTop: 12 }}>
                Trusted by conference organisers across India.
              </p>
            </div>
          </AnimatedSection>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {PAST_EVENTS.map((event, i) => (
              <AnimatedSection key={event.name} delay={i * 100}>
                <div style={{
                  background: "#fff", borderRadius: 18, overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.25s",
                }}
                  onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.10)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
                  onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                >
                  <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                    <img
                      src={event.banner}
                      alt={event.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s" }}
                      onMouseOver={e => (e.currentTarget.style.transform = "scale(1.04)")}
                      onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
                    />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)",
                    }} />
                  </div>
                  <div style={{ padding: "20px 22px 24px" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>{event.name}</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#6b7280" }}>
                        <span>📍</span> {event.location}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#6b7280" }}>
                        <span>🗓️</span> {event.date}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#2563eb", fontWeight: 600, marginTop: 4 }}>
                        <span>👥</span> {event.participants.toLocaleString()} Participants
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── CTA ────────────────── */}
      <section style={{ padding: "96px 24px", background: "#0f172a" }}>
        <AnimatedSection>
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800,
              color: "#ffffff", letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 20,
            }}>
              Ready to simplify your<br />next conference?
            </h2>
            <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.7, marginBottom: 40 }}>
              Request a free demo and see how RegXpert transforms event management from end to end.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={handleDemoRequest}
                id="cta-demo-btn"
                style={{
                  background: "#2563eb", color: "#fff", border: "none", borderRadius: 10,
                  padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(37,99,235,0.45)",
                  transition: "all 0.2s",
                }}
                onMouseOver={e => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseOut={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Request a Demo →
              </button>
              <button
                onClick={() => navigate("/admin-login")}
                id="cta-login-btn"
                style={{
                  background: "transparent", color: "#94a3b8",
                  border: "1.5px solid #334155", borderRadius: 10,
                  padding: "14px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#fff"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#94a3b8"; }}
              >
                Login to Portal
              </button>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer id="contact" style={{ background: "#0a0f1e", padding: "48px 24px 32px", borderTop: "1px solid #1e293b" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 40 }} className="landing-footer-grid">
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 15,
                }}>R</div>
                <span style={{ fontWeight: 800, fontSize: 17, color: "#fff" }}>Reg<span style={{ color: "#60a5fa" }}>Xpert</span></span>
              </div>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, maxWidth: 280 }}>
                Professional conference management software for medical, academic, and industry events across India.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#cbd5e1", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 16 }}>Navigation</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[["Home", "hero"], ["Features", "features"], ["Events", "events"]].map(([label, id]) => (
                  <button key={id} onClick={() => scrollTo(id)} style={{
                    background: "none", border: "none", cursor: "pointer", textAlign: "left",
                    fontSize: 14, color: "#64748b", padding: 0, transition: "color 0.2s",
                  }}
                    onMouseOver={e => (e.currentTarget.style.color = "#60a5fa")}
                    onMouseOut={e => (e.currentTarget.style.color = "#64748b")}
                  >{label}</button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#cbd5e1", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 16 }}>Contact</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="mailto:sriyamini659@gmail.com" style={{ fontSize: 14, color: "#64748b", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseOver={e => (e.currentTarget.style.color = "#60a5fa")}
                  onMouseOut={e => (e.currentTarget.style.color = "#64748b")}
                >
                  📧 sriyamini659@gmail.com
                </a>
                <span style={{ fontSize: 14, color: "#64748b" }}>📍 Hyderabad, India</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #1e293b", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 13, color: "#475569" }}>© 2026 RegXpert. All rights reserved.</p>
            <p style={{ fontSize: 13, color: "#475569" }}>Built with ❤️ for conference organisers</p>
          </div>
        </div>
      </footer>

      {/* ────────────────── RESPONSIVE CSS ────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .landing-nav-desktop { display: none !important; }
          .landing-nav-mobile { display: flex !important; }
          .landing-why-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .landing-footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (min-width: 769px) {
          .landing-nav-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
