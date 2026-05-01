import React, { useState, useEffect } from "react";

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────
const GlobalStyles = ({ theme }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

    :root {
      --bg: ${theme.bg};
      --text: ${theme.text};
      --accent: #7C3AED;
      --secondary: #3B82F6;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { 
      font-family: 'DM Sans', system-ui, sans-serif; 
      background: var(--bg); 
      color: var(--text); 
      overflow-x: hidden; 
      transition: background 0.4s ease, color 0.4s ease;
    }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 10px; }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-14px); }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes pulseDot {
      0%, 100% { box-shadow: 0 0 0 0 ${theme.pulseColor}; }
      50% { box-shadow: 0 0 0 8px rgba(167,139,250,0); }
    }
    @keyframes glowPulse {
      0%, 100% { opacity: 0.35; }
      50% { opacity: 0.65; }
    }
    @keyframes orbitA {
      from { transform: rotate(0deg) translateX(88px) rotate(0deg); }
      to   { transform: rotate(360deg) translateX(88px) rotate(-360deg); }
    }
    @keyframes orbitB {
      from { transform: rotate(0deg) translateX(128px) rotate(0deg); }
      to   { transform: rotate(-360deg) translateX(128px) rotate(360deg); }
    }

    .reveal {
      opacity: 0;
      transform: translateY(32px);
      transition: opacity 0.72s cubic-bezier(0.2,0.8,0.2,1), transform 0.72s cubic-bezier(0.2,0.8,0.2,1);
    }
    .reveal.in { opacity: 1; transform: translateY(0); }

    .accent-text {
      background: linear-gradient(90deg, #A78BFA, #60A5FA);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .glass {
      background: ${theme.cardBg};
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid ${theme.cardBorder};
      box-shadow: ${theme.glassShadow};
    }

    .nav-link { transition: color 0.2s; color: ${theme.linkMuted} !important; text-decoration: none; font-size: 14px; font-weight: 600; }
    .nav-link:hover { color: ${theme.text} !important; }

    .step-card { transition: transform 0.28s, border-color 0.28s, box-shadow 0.28s; }
    .step-card:hover { transform: translateY(-4px); border-color: rgba(124,58,237,0.45) !important; box-shadow: ${theme.hoverShadow}; }

    .ai-chip { transition: transform 0.28s, border-color 0.28s; }
    .ai-chip:hover { transform: translateY(-4px); border-color: rgba(96,165,250,0.45) !important; }

    .issue-row { transition: background 0.2s; cursor: pointer; border-bottom: 1px solid ${theme.hairline} !important; }
    .issue-row:hover { background: ${theme.rowHover} !important; }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease;
    }

    .modal-content {
      animation: slideUp 0.4s cubic-bezier(0.2,0.8,0.2,1);
    }

    /* ── TABLET & DESKTOP ── */
    @media (min-width: 821px) {
      .nav-mobile-btn { display: none !important; }
      .nav-mobile-menu { display: none !important; }
      .orbit-model { display: flex !important; }
      .hero-visual { display: flex !important; }
    }

    /* ── TABLET ── */
    @media (max-width: 1024px) and (min-width: 821px) {
      .hero-title { font-size: clamp(38px, 8vw, 62px) !important; }
      .ai-chips-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .dash-mock { flex-direction: column !important; }
      .dash-sidebar { width: 100% !important; flex-direction: row !important; height: auto !important; }
    }

    /* ── MOBILE ── */
    @media (max-width: 820px) {
      .hero-wrap { flex-direction: column !important; padding-top: 20px !important; gap: 24px !important; text-align: center; padding-bottom: 40px; }
      .hero-visual { display: none !important; }
      .hero-title { font-size: clamp(32px, 9vw, 54px) !important; letter-spacing: -1.5px !important; }
      .orbit-model { display: none !important; }
      .nav-desktop { display: none !important; }
      .nav-mobile-btn { display: flex !important; }
      .stats-bar { gap: 16px !important; padding: 32px 16px !important; flex-direction: column; align-items: stretch; }
      .stats-bar > div { width: 100% !important; }
      .section-pad { padding: 56px 16px !important; }
      .section-h2 { font-size: clamp(26px, 8vw, 40px) !important; }
      .ai-feature-row { flex-direction: column !important; gap: 20px !important; }
      .ai-chips-grid { grid-template-columns: 1fr !important; }
      .dash-mock { height: auto !important; flex-direction: column !important; }
      .dash-sidebar { width: 100% !important; flex-direction: row !important; height: 50px !important; padding: 0 12px !important; gap: 8px !important; align-items: center !important; }
      .dash-grid { flex-direction: column !important; gap: 10px !important; }
      .btn-group { flex-direction: column !important; gap: 10px !important; }
      .timeline-wrap { padding-left: 24px !important; }
      .hero-stats { justify-content: center; }
      
      .modal-content {
        width: 90% !important;
        max-width: 100% !important;
        margin: 16px !important;
        border-radius: 16px !important;
      }

      .login-form input,
      .login-form button {
        font-size: 16px !important;
        padding: 12px 14px !important;
      }

      .form-group {
        margin-bottom: 14px !important;
      }
    }

    @media (max-width: 480px) {
      .hero-title { font-size: clamp(28px, 10vw, 42px) !important; letter-spacing: -1px !important; }
      .ai-chips-grid { grid-template-columns: 1fr !important; }
      .hero-stats { gap: 12px !important; }
      .stats-bar { padding: 20px 12px !important; }
      .section-pad { padding: 40px 12px !important; }
      .timeline-wrap { padding-left: 20px !important; }
      
      .btn-group button {
        padding: 12px 16px !important;
        font-size: 13px !important;
      }
    }
  `}</style>
);

// ─── DATA ────────────────────────────────────────────────────────────────
const STATS = [
  { val: "14.2K+", label: "Issues Reported" },
  { val: "9,102",  label: "Authority Solved" },
  { val: "8,840",  label: "Community Verified" },
  { val: "42",     label: "Active Wards" },
];

const TIMELINE = [
  { icon: "📍", num: "01", t: "Report",         d: "Citizen spots an issue, uploads photo + GPS. AI checks for duplicates before publishing." },
  { icon: "🔥", num: "02", t: "Upvote Priority",d: "Neighbours upvote. More votes = higher on the Authority queue — automatically." },
  { icon: "🏛️", num: "03", t: "Authority Fixes", d: "Officials mark it 'Solved' and MUST upload a Proof-of-Fix photo. No photo = not accepted." },
  { icon: "✅", num: "04", t: "Community Verdict",d: "The reporter verifies on the ground. Approved = archived. Rejected = re-opened publicly." },
];

const AI_CARDS = [
  { icon: "🔍", title: "Duplicate Clustering",   desc: "Vector embeddings merge 40 separate reports of the same pothole into one ticket." },
  { icon: "📸", title: "Photo Validation",       desc: "Classifier confirms your photo actually matches the problem you described." },
  { icon: "🗓️", title: "Resolution ETA",          desc: "Based on ward history & issue type, AI gives a realistic deadline — not a promise." },
  { icon: "🧾", title: "Authority Brief",         desc: "Messy community text auto-converted into clean formal briefs for officials." },
  { icon: "🌊", title: "Trend Clusters",          desc: "Three water reports in one ward? AI flags systemic pipeline failure, not random noise." },
];

const ISSUES = [
  { id: "#1042", title: "Sewage overflow — Market St",    votes: 247, status: "pending",   ward: "Ward 12" },
  { id: "#1039", title: "Broken streetlights — NH-58",   votes: 189, status: "auth",     ward: "Ward 7"  },
  { id: "#1031", title: "Garbage pile-up — Sector 4",    votes: 312, status: "verified", ward: "Ward 3"  },
  { id: "#1028", title: "Pothole near school gate",       votes: 156, status: "pending",   ward: "Ward 9"  },
];

const STATUS = {
  pending:  { label: "Pending",       color: "#F97316" },
  auth:     { label: "Auth. Solved",  color: "#FBBF24" },
  verified: { label: "Verified ✓",   color: "#10B981" },
};

// ─── LOGIN MODAL ───────────────────────────────────────────────────────────
function LoginModal({ isOpen, onClose, theme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      alert(`${isSignUp ? "Sign up" : "Login"} successful!\nEmail: ${email}`);
      setIsLoading(false);
      setEmail("");
      setPassword("");
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 20,
          padding: 40,
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "transparent",
            border: "none",
            fontSize: 24,
            cursor: "pointer",
            color: theme.muted,
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 28,
              fontWeight: 900,
              marginBottom: 8,
            }}
          >
            {isSignUp ? "Join CivicPulse" : "Welcome Back"}
          </h2>
          <p style={{ fontSize: 14, color: theme.muted }}>
            {isSignUp
              ? "Report issues and fix your city"
              : "Report issues and make change"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: theme.dim,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: `1px solid ${theme.cardBorder}`,
                background: theme.innerCard,
                color: theme.text,
                fontSize: 14,
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#7C3AED";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.cardBorder;
              }}
            />
          </div>

          <div className="form-group">
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: theme.dim,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: `1px solid ${theme.cardBorder}`,
                background: theme.innerCard,
                color: theme.text,
                fontSize: 14,
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#7C3AED";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.cardBorder;
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: isLoading
                ? "rgba(124, 58, 237, 0.5)"
                : "linear-gradient(135deg, #7C3AED, #3B82F6)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: 14,
              fontSize: 15,
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              marginTop: 8,
            }}
          >
            {isLoading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Toggle */}
        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 13,
            color: theme.muted,
          }}
        >
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: "none",
              border: "none",
              color: "#7C3AED",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ORBIT MODEL — hidden on mobile via CSS ───────────────────────────────
function OrbitModel({ theme }) {
  const NODES = [
    { label: "Report",  color: "#A78BFA", anim: "orbitA", delay: "0s",  dur: "9s"  },
    { label: "Vote",    color: "#60A5FA", anim: "orbitB", delay: "2.5s",dur: "13s" },
    { label: "Fix",     color: "#34D399", anim: "orbitA", delay: "1.2s",dur: "11s" },
    { label: "Verify",  color: "#F472B6", anim: "orbitB", delay: "3.8s",dur: "10s" },
  ];
  return (
    <div className="orbit-model" style={{ position: "relative", width: 300, height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {[88, 128].map(r => (
        <div key={r} style={{ position: "absolute", width: r * 2, height: r * 2, borderRadius: "50%", border: `1px solid ${theme.hairline}` }} />
      ))}
      <div style={{
        width: 68, height: 68, borderRadius: "50%",
        background: "linear-gradient(135deg, #7C3AED, #3B82F6)",
        boxShadow: theme.coreShadow,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 10, color: "#fff", textAlign: "center", lineHeight: 1.3, zIndex: 10,
      }}>CIVIC<br/>PULSE</div>
      {NODES.map(n => (
        <div key={n.label} style={{
          position: "absolute", width: 38, height: 38, borderRadius: "50%",
          background: theme.nodeBg, border: `1.5px solid ${n.color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 800, color: n.color, letterSpacing: 0.3,
          animation: `${n.anim} ${n.dur} ${n.delay} linear infinite`,
          boxShadow: `0 0 10px ${n.color}44`,
        }}>{n.label}</div>
      ))}
    </div>
  );
}

// ─── MOCK PHONE ───────────────────────────────────────────────────────────
function MockPhone({ theme }) {
  return (
    <div style={{ width: 240, height: 488, background: theme.phoneBg, borderRadius: 38, border: `2px solid ${theme.hairline}`, overflow: "hidden", boxShadow: theme.phoneShadow, position: "relative", marginTop: "100px" }}>
      <div style={{ width: 76, height: 22, background: theme.phoneBg, borderRadius: "0 0 14px 14px", margin: "0 auto", border: `1.5px solid ${theme.hairline}`, borderTop: "none" }} />
      <div style={{ padding: "0 14px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 10px", borderBottom: `1px solid ${theme.hairline}`, marginBottom: 12 }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 900, color: "#A78BFA" }}>⬡ CivicPulse</span>
          <span style={{ fontSize: 13 }}>🔔</span>
        </div>
        {ISSUES.slice(0, 3).map((issue, i) => (
          <div key={i} style={{ background: theme.innerCard, borderRadius: 10, padding: "9px 10px", marginBottom: 8, border: `1px solid ${theme.hairline}`, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ textAlign: "center", minWidth: 26 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: theme.text, lineHeight: 1 }}>{issue.votes}</div>
              <div style={{ fontSize: 9, color: "#A78BFA" }}>▲</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 8, fontWeight: 800, color: STATUS[issue.status].color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{issue.ward}</div>
              <div style={{ fontSize: 10, color: theme.muted, lineHeight: 1.35, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{issue.title}</div>
            </div>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS[issue.status].color, flexShrink: 0 }} />
          </div>
        ))}
        <div style={{ background: "linear-gradient(135deg,#7C3AED,#3B82F6)", borderRadius: 20, padding: "8px 0", textAlign: "center", marginTop: 6, fontSize: 11, fontWeight: 800, color: "#fff" }}>+ Report Issue</div>
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const theme = {
    bg: darkMode ? "#030014" : "#F8FAFF",
    text: darkMode ? "#F0F0FF" : "#0F172A",
    cardBg: darkMode ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
    cardBorder: darkMode ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)",
    hairline: darkMode ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.06)",
    muted: darkMode ? "rgba(255,255,255,0.5)" : "#64748B",
    dim: darkMode ? "rgba(255,255,255,0.3)" : "#94A3B8",
    linkMuted: darkMode ? "rgba(255,255,255,0.5)" : "#475569",
    statsBarBg: darkMode ? "rgba(255,255,255,0.02)" : "#FFFFFF",
    mobileMenuBg: darkMode ? "rgba(3,0,20,0.98)" : "rgba(255,255,255,0.98)",
    actionBorder: darkMode ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.15)",
    issueTitle: darkMode ? "rgba(255,255,255,0.7)" : "#1E293B",
    rowHover: darkMode ? "rgba(124,58,237,0.07)" : "rgba(124,58,237,0.04)",
    pulseColor: darkMode ? "rgba(167,139,250,0.6)" : "rgba(124,58,237,0.4)",
    glassShadow: darkMode ? "none" : "0 10px 30px -10px rgba(0,0,0,0.05)",
    hoverShadow: darkMode ? "0 20px 40px -10px rgba(0,0,0,0.5)" : "0 20px 40px -10px rgba(124,58,237,0.1)",
    phoneBg: darkMode ? "#0D0D22" : "#FFFFFF",
    phoneShadow: darkMode ? "0 40px 80px rgba(0,0,0,0.65)" : "0 40px 80px rgba(124,58,237,0.15)",
    innerCard: darkMode ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.02)",
    coreShadow: darkMode ? "0 0 28px rgba(124,58,237,0.55)" : "0 10px 30px rgba(124,58,237,0.3)",
    nodeBg: darkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)",
    gridOpacity: darkMode ? "0.045" : "0.08",
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => { window.removeEventListener("scroll", onScroll); obs.disconnect(); };
  }, []);

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: "100vh" }}>
      <GlobalStyles theme={theme} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} theme={theme} />

      {/* ══ NAV ══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: scrolled ? (darkMode ? "rgba(3,0,20,0.88)" : "rgba(255,255,255,0.92)") : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${theme.hairline}` : "none",
        padding: scrolled ? "11px 0" : "16px 0",
        transition: "all 0.3s ease",
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#7C3AED,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 11, color: "#fff" }}>CP</div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "-0.4px" }}>CivicPulse</span>
          </div>

          <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {[["How it Works","#HowitWorks"],["AI Engine","#AIEngine"],["Live Issues","#LiveIssues"]].map(([l, h]) => (
              <a key={l} href={h} className="nav-link">{l}</a>
            ))}
            <button onClick={() => setDarkMode(!darkMode)} style={{ background: "transparent", border: `1px solid ${theme.actionBorder}`, borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
              {darkMode ? "🌙" : "☀️"}
            </button>
            <button onClick={() => window.location.hash = "#/login"} style={{ background: "#7C3AED", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Launch App</button>
          </div>

          <button className="nav-mobile-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", display: "none" }}>☰</button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="nav-mobile-menu" style={{ display: "none", background: theme.mobileMenuBg, borderTop: `1px solid ${theme.hairline}`, padding: "16px" }}>
            {[["How it Works","#HowitWorks"],["AI Engine","#AIEngine"],["Live Issues","#LiveIssues"]].map(([l, h]) => (
              <a key={l} href={h} className="nav-link" style={{ display: "block", padding: "10px 0" }}>{l}</a>
            ))}
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button onClick={() => { setDarkMode(!darkMode); setMobileMenuOpen(false); }} style={{ flex: 1, background: "transparent", border: `1px solid ${theme.actionBorder}`, borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {darkMode ? "🌙 Light" : "☀️ Dark"}
              </button>
              <button onClick={() => { window.location.hash = "#/login"; setMobileMenuOpen(false); }} style={{ flex: 1, background: "#7C3AED", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Launch</button>
            </div>
          </div>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", paddingTop: 60 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(100,100,255,${theme.gridOpacity}) 1px,transparent 1px),linear-gradient(90deg,rgba(100,100,255,${theme.gridOpacity}) 1px,transparent 1px)`, backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)", zIndex: 0 }} />
        <div style={{ position: "absolute", top: "15%", left: "52%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)", zIndex: 0, animation: "glowPulse 4s ease-in-out infinite" }} />

        <div className="hero-wrap" style={{ maxWidth: 1160, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 64, position: "relative", zIndex: 1, width: "100%" }}>
          <div style={{ flex: 1.2 }}>
            <div className="reveal" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#7C3AED", marginBottom: 20 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7C3AED", display: "inline-block", animation: "pulseDot 2s infinite" }} />
              Decentralized Civic Infrastructure
            </div>
            <h1 className="hero-title reveal" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(44px,7.5vw,86px)", fontWeight: 700, lineHeight: 0.93, letterSpacing: "-2.5px", marginBottom: 20 }}>
              Engineering<br /><span className="accent-text">Transparency.</span>
            </h1>
            <p className="reveal" style={{ fontSize: 16, color: theme.muted, lineHeight: 1.72, maxWidth: 460, marginBottom: 28 }}>
              A 3-layer civic verification system. AI clusters complaints. Community upvotes prioritize. Authorities prove their work. You verify.
            </p>
            <div className="reveal btn-group" style={{ display: "flex", gap: 12 }}>
              <button onClick={() => window.location.hash = "#/login"} style={{ background: "linear-gradient(135deg,#7C3AED,#3B82F6)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 14px 36px rgba(124,58,237,0.3)" }}>Report Issue</button>
              <button onClick={() => window.location.hash = "#/login"} style={{ background: "transparent", color: theme.muted, border: `1px solid ${theme.actionBorder}`, borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Explore Map →</button>
            </div>
          </div>
          <div className="hero-visual" style={{ flex: 0.8, display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
            <div style={{ animation: "float 6s ease-in-out infinite" }}>
              <MockPhone theme={theme} />
            </div>
            <OrbitModel theme={theme} />
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <div className="stats-bar" style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 20, padding: "48px 16px", background: theme.statsBarBg, borderTop: `1px solid ${theme.hairline}` }}>
        {STATS.map((s, i) => (
          <div key={i} className="reveal" style={{ textAlign: "center", flex: "1 1 120px" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(24px, 6vw, 32px)", fontWeight: 900, color: "#7C3AED" }}>{s.val}</div>
            <div style={{ fontSize: 10, color: theme.dim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══ HOW IT WORKS ══ */}
      <section id="HowitWorks" className="section-pad" style={{ maxWidth: 1160, margin: "0 auto", padding: "80px 16px" }}>
        <div className="reveal" style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", color: "#7C3AED", marginBottom: 12 }}>The Loop</div>
          <h2 className="section-h2" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: 12 }}>
            From Problem to <span className="accent-text">Proof.</span>
          </h2>
          <p style={{ fontSize: 15, color: theme.muted, maxWidth: 460 }}>A four-step loop that can't be gamed. Publicly on-record.</p>
        </div>
        <div className="timeline-wrap" style={{ position: "relative", paddingLeft: 44, maxWidth: 740 }}>
          <div style={{ position: "absolute", left: 12, top: 10, bottom: 10, width: 2, background: theme.hairline, borderRadius: 2 }} />
          <div style={{ position: "absolute", left: 12, top: 10, width: 2, height: "70%", background: "#7C3AED", borderRadius: 2 }} />
          {TIMELINE.map((step, i) => (
            <div key={i} className="step-card reveal glass" style={{ position: "relative", marginBottom: 18, borderRadius: 14, padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ position: "absolute", left: -38, top: 20, width: 12, height: 12, borderRadius: "50%", background: i < 3 ? "#7C3AED" : theme.dim, border: `2px solid ${theme.bg}`, zIndex: 2 }} />
              <div style={{ fontSize: 20 }}>{step.icon}</div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "1.2px", textTransform: "uppercase", color: theme.dim, marginBottom: 4 }}>Step {step.num}</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{step.t}</h3>
                <p style={{ fontSize: 13, color: theme.muted, lineHeight: 1.6 }}>{step.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ AI ENGINE ══ */}
      <section id="AIEngine" style={{ background: darkMode ? "#050010" : "#F1F5F9", transition: "background 0.4s ease" }}>
        <div className="section-pad" style={{ maxWidth: 1160, margin: "0 auto", padding: "80px 16px" }}>
          <div className="reveal" style={{ marginBottom: 44 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", color: "#3B82F6", marginBottom: 12 }}>Deep Tech</div>
            <h2 className="section-h2" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: 12 }}>
              AI That Does <span className="accent-text">Actual Work.</span>
            </h2>
          </div>
          <div className="ai-feature-row reveal" style={{ display: "flex", gap: 36, alignItems: "center", marginBottom: 40 }}>
            <div className="glass" style={{ flex: "0 0 240px", borderRadius: 16, padding: 24, minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <svg width="100" height="100" viewBox="0 0 160 150">
                {[[80,75,34,36],[80,75,122,30],[80,75,22,105],[80,75,135,108]].map(([x1,y1,x2,y2],i) => (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7C3AED" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
                ))}
                <circle cx="80" cy="75" r="8" fill="#7C3AED" />
                {[[34,36,"#60A5FA"],[122,30,"#60A5FA"],[22,105,"#7C3AED"],[135,108,"#7C3AED"]].map(([cx,cy,f],i) => (
                  <circle key={i} cx={cx} cy={cy} r="5" fill={f} opacity="0.8" />
                ))}
              </svg>
              <div style={{ marginTop: 10, fontSize: 9, fontWeight: 800, color: "#3B82F6", letterSpacing: "0.8px" }}>CLUSTERING</div>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Vector Similarity Clustering</h3>
              <p style={{ fontSize: 14, color: theme.muted, lineHeight: 1.68, marginBottom: 16 }}>
                Our AI analyzes images as high-dimensional vectors. When multiple reports of the same pothole appear, the system merges them automatically, combining upvotes to signal high urgency to the local ward office.
              </p>
            </div>
          </div>
          <div className="ai-chips-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
            {AI_CARDS.map((card, i) => (
              <div key={i} className="ai-chip glass reveal" style={{ borderRadius: 12, padding: "18px 16px", cursor: "pointer" }}>
                <div style={{ fontSize: 20, marginBottom: 10 }}>{card.icon}</div>
                <h4 style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{card.title}</h4>
                <p style={{ fontSize: 11, color: theme.dim, lineHeight: 1.55 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ AUTHORITY DASHBOARD ══ */}
      <section id="LiveIssues" className="section-pad" style={{ maxWidth: 1160, margin: "0 auto", padding: "80px 16px" }}>
        <div className="reveal" style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", color: "#10B981", marginBottom: 12 }}>Dashboard</div>
          <h2 className="section-h2" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-1.5px" }}>
            The Command <span className="accent-text">Center.</span>
          </h2>
        </div>
        <div className="dash-mock glass reveal" style={{ borderRadius: 16, display: "flex", overflow: "hidden" }}>
          <div className="dash-sidebar" style={{ width: 60, background: "rgba(124,58,237,0.05)", borderRight: `1px solid ${theme.hairline}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 0", gap: 10 }}>
            {["📊","📋","🏛️","⚙️"].map((ic, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: i===0 ? "rgba(124,58,237,0.15)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, cursor: "pointer" }}>{ic}</div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "20px 22px", minWidth: 0 }}>
            <div className="dash-grid" style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              {[["Pending","24","#F97316"],["Critical","08","#EF4444"],["Resolved","142","#10B981"]].map(([l,v,c]) => (
                <div key={l} style={{ flex: 1, background: theme.innerCard, borderRadius: 10, padding: "12px", border: `1px solid ${c}22` }}>
                  <div style={{ fontSize: 9, color: theme.dim, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 900, color: c }}>{v}</div>
                </div>
              ))}
            </div>
            {ISSUES.map((issue, i) => (
              <div key={i} className="issue-row" style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ flex: 1, fontSize: 12, color: theme.issueTitle, fontWeight: 600 }}>{issue.title}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: STATUS[issue.status].color, background: STATUS[issue.status].color + "15", padding: "3px 8px", borderRadius: 8, whiteSpace: "nowrap" }}>{STATUS[issue.status].label}</span>
                <button onClick={() => window.location.hash = "#/login"} style={{ background: "#7C3AED", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>Act →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding: "60px 16px 32px", borderTop: `1px solid ${theme.hairline}`, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#7C3AED,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 10, color: "#fff" }}>CP</div>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15 }}>CivicPulse</span>
        </div>
        <p style={{ fontSize: 13, color: theme.dim, marginBottom: 16 }}>Designed for a better city. Built for 2026.</p>
        <div style={{ display: "flex", gap: 18, justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#7C3AED" }}>
          <span style={{ cursor: "pointer" }}>GitHub</span><span style={{ cursor: "pointer" }}>Twitter</span><span style={{ cursor: "pointer" }}>LinkedIn</span>
        </div>
      </footer>
    </div>
  );
}