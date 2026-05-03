import React, { useState, useEffect } from "react";

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────
const GlobalStyles = ({ theme, isLoading, isMobile }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;700&display=swap');

    :root {
      --bg: ${theme.bg};
      --text: ${theme.text};
      --accent: #7C3AED;
      --secondary: #3B82F6;
    }

    *, *::before, *::after { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0; 
    }

    html { 
      scroll-behavior: smooth;
      width: 100%;
      overflow-x: hidden;
    }

    body { 
      font-family: 'DM Sans', system-ui, sans-serif; 
      background: var(--bg); 
      color: var(--text); 
      overflow-x: hidden; 
      transition: background 0.4s ease, color 0.4s ease;
      overflow-y: ${isLoading && !isMobile ? 'hidden' : 'auto'};
      width: 100%;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 10px; }

    /* ─── ANIMATIONS ─── */
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-14px); }
    }

    @keyframes fadeIn { 
      from { opacity: 0; } 
      to { opacity: 1; } 
    }

    @keyframes slideUp { 
      from { transform: translateY(20px); opacity: 0; } 
      to { transform: translateY(0); opacity: 1; } 
    }

    @keyframes pulseDot {
      0%, 100% { box-shadow: 0 0 0 0 rgba(167,139,250,0.6); }
      50% { box-shadow: 0 0 0 8px rgba(167,139,250,0); }
    }

    @keyframes glowPulse {
      0%, 100% { opacity: 0.35; }
      50% { opacity: 0.65; }
    }

    @keyframes orbitA {
      from { transform: rotate(0deg) translateX(88px) rotate(0deg); }
      to { transform: rotate(360deg) translateX(88px) rotate(-360deg); }
    }

    @keyframes orbitB {
      from { transform: rotate(0deg) translateX(128px) rotate(0deg); }
      to { transform: rotate(-360deg) translateX(128px) rotate(360deg); }
    }

    @keyframes preloaderExit {
      0% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(1.1); visibility: hidden; }
    }

    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }

    @keyframes textGlitch {
      0% { opacity: 0.5; }
      50% { opacity: 1; }
      100% { opacity: 0.5; }
    }

    @keyframes heroReveal {
      0% { transform: translateY(60px); opacity: 0; filter: blur(10px); }
      100% { transform: translateY(0); opacity: 1; filter: blur(0); }
    }

    @keyframes loadMove {
      0% { width: 0%; left: 0%; }
      50% { width: 100%; left: 0%; }
      100% { width: 0%; left: 100%; }
    }

    /* ─── REVEAL CLASSES ─── */
    .reveal {
      opacity: 0;
      transform: translateY(32px);
      transition: opacity 0.72s cubic-bezier(0.2,0.8,0.2,1), transform 0.72s cubic-bezier(0.2,0.8,0.2,1);
    }
    .reveal.in { opacity: 1; transform: translateY(0); }

    .hero-animate {
      animation: heroReveal 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      opacity: 0;
    }

    .hero-delay-1 { animation-delay: 0.2s; }
    .hero-delay-2 { animation-delay: 0.4s; }
    .hero-delay-3 { animation-delay: 0.6s; }

    /* ─── PRELOADER ─── */
    .preloader {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: #030014;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: all 0.8s cubic-bezier(0.8, 0, 0.2, 1);
    }

    .preloader.fade-out {
      animation: preloaderExit 0.8s forwards;
    }

    .loader-bar {
      width: 200px;
      height: 2px;
      background: rgba(124, 58, 237, 0.2);
      position: relative;
      margin-top: 24px;
      overflow: hidden;
    }

    .loader-progress {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: #7C3AED;
      animation: loadMove 2.5s infinite ease-in-out;
    }

    /* ─── UTILITY CLASSES ─── */
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

    .nav-link { 
      transition: color 0.2s; 
      color: ${theme.linkMuted} !important; 
      text-decoration: none; 
      font-size: 14px; 
      font-weight: 600; 
    }
    .nav-link:hover { color: ${theme.text} !important; }

    .step-card { 
      transition: transform 0.28s, border-color 0.28s, box-shadow 0.28s; 
    }
    .step-card:hover { 
      transform: translateY(-4px); 
      border-color: rgba(124,58,237,0.45) !important; 
      box-shadow: ${theme.hoverShadow}; 
    }

    .ai-chip { 
      transition: transform 0.28s, border-color 0.28s; 
    }
    .ai-chip:hover { 
      transform: translateY(-4px); 
      border-color: rgba(96,165,250,0.45) !important; 
    }

    .issue-row { 
      transition: background 0.2s; 
      cursor: pointer; 
      border-bottom: 1px solid ${theme.hairline} !important; 
    }
    .issue-row:hover { 
      background: ${theme.rowHover} !important; 
    }

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

    /* ─── DESKTOP (821px+) ─── */
    @media (min-width: 821px) {
      .nav-mobile-btn { display: none !important; }
      .nav-mobile-menu { display: none !important; }
      .orbit-model { display: flex !important; }
      .hero-visual { display: flex !important; }
      .mock-phone { display: flex !important; }
      .preloader { display: ${isMobile ? 'none' : 'flex'} !important; }
    }

    /* ─── TABLET (821px - 1024px) ─── */
    @media (max-width: 1024px) and (min-width: 821px) {
      .hero-wrap { gap: 40px !important; }
      .hero-title { font-size: clamp(38px, 8vw, 62px) !important; }
      .ai-chips-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .dash-mock { flex-direction: column !important; }
      .dash-sidebar { width: 100% !important; flex-direction: row !important; height: auto !important; }
      .section-pad { padding: 60px 24px !important; }
    }

    /* ─── MOBILE (max 820px) ─── */
    @media (max-width: 820px) {
      body { 
        overflow-y: auto !important;
        padding-bottom: 20px;
      }

      .preloader { display: none !important; }

      .nav-desktop { display: none !important; }
      .nav-mobile-btn { display: flex !important; }
      .nav-mobile-menu { display: none !important; }
      .orbit-model { display: none !important; }
      .hero-visual { display: none !important; }
      .mock-phone { display: none !important; }

      nav {
        padding: 12px 16px !important;
        background: ${theme.cardBg} !important;
        backdrop-filter: blur(14px) !important;
        border-bottom: 1px solid ${theme.hairline} !important;
        position: relative !important;
        top: 0 !important;
      }

      .hero-wrap { 
        flex-direction: column !important; 
        padding-top: 16px !important; 
        gap: 0 !important; 
        text-align: center; 
        padding-bottom: 20px; 
      }

      .hero-title { 
        font-size: clamp(32px, 9vw, 54px) !important; 
        letter-spacing: -1.5px !important; 
        line-height: 1 !important;
        margin-bottom: 16px !important;
      }

      .hero-subtitle {
        font-size: 14px !important;
        line-height: 1.5 !important;
        margin-bottom: 24px !important;
      }

      .btn-group { 
        flex-direction: column !important; 
        gap: 10px !important; 
        width: 100% !important;
      }

      .btn-group button {
        width: 100% !important;
        padding: 12px 16px !important;
        font-size: 14px !important;
      }

      .stats-bar { 
        gap: 12px !important; 
        padding: 24px 16px !important; 
        flex-direction: column; 
        align-items: stretch; 
      }
      .stats-bar > div { width: 100% !important; }

      .section-pad { 
        padding: 48px 16px !important; 
      }

      .section-h2 { 
        font-size: clamp(26px, 8vw, 40px) !important; 
        line-height: 1.1 !important;
      }

      .ai-feature-row { 
        flex-direction: column !important; 
        gap: 20px !important; 
      }

      .ai-chips-grid { 
        grid-template-columns: 1fr !important; 
        gap: 12px !important;
      }

      .ai-chip {
        padding: 14px 12px !important;
      }

      .dash-mock { 
        height: auto !important; 
        flex-direction: column !important; 
      }

      .dash-sidebar { 
        width: 100% !important; 
        flex-direction: row !important; 
        height: 50px !important; 
        padding: 0 12px !important; 
        gap: 8px !important; 
        align-items: center !important; 
      }

      .dash-grid { 
        flex-direction: column !important; 
        gap: 10px !important; 
      }

      .timeline-wrap { 
        padding-left: 24px !important; 
      }

      .hero-stats { 
        justify-content: center !important;
      }

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

      .hero-animate {
        animation: heroReveal 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards !important;
      }

      .hero-delay-1,
      .hero-delay-2,
      .hero-delay-3 {
        animation-delay: 0s !important;
      }

      .step-card {
        border-radius: 12px !important;
        padding: 14px 14px !important;
        margin-bottom: 12px !important;
      }

      .issue-row {
        padding: 8px 10px !important;
        font-size: 12px !important;
      }
    }

    /* ─── SMALL MOBILE (max 480px) ─── */
    @media (max-width: 480px) {
      .hero-title { 
        font-size: clamp(24px, 10vw, 40px) !important; 
        letter-spacing: -1px !important; 
      }

      .hero-subtitle {
        font-size: 13px !important;
      }

      .ai-chips-grid { 
        grid-template-columns: 1fr !important; 
      }

      .stats-bar { 
        padding: 18px 12px !important; 
        gap: 10px !important;
      }

      .section-pad { 
        padding: 32px 12px !important; 
      }

      .timeline-wrap { 
        padding-left: 20px !important; 
      }

      .btn-group button {
        padding: 10px 14px !important;
        font-size: 13px !important;
      }

      .section-h2 {
        font-size: clamp(22px, 7vw, 32px) !important;
      }
    }
  `}</style>
);

// ─── PRELOADER COMPONENT ──────────────────────────────────────────────────
function Preloader({ isVisible }) {
  const [loadingText, setLoadingText] = useState("Initializing System...");

  useEffect(() => {
    const sequence = [
      "Establishing Connection...",
      "Syncing Ward Protocols...",
      "Decrypting Urban Data...",
      "CivicPulse Online."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setLoadingText(sequence[i]);
        i++;
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`preloader ${!isVisible ? "fade-out" : ""}`}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(124,58,237,0.05), transparent)', height: '20%', width: '100%', animation: 'scanline 3s linear infinite', pointerEvents: 'none' }} />
      
      <div style={{ width: 80, height: 80, borderRadius: 16, background: "linear-gradient(135deg,#7C3AED,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(124,58,237,0.4)", fontFamily: "'Syne', sans-serif", fontWeight: 900, color: "#fff", fontSize: 24, marginBottom: 20, zIndex: 10 }}>CP</div>

      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#7C3AED", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", animation: "textGlitch 1s infinite", zIndex: 10, position: 'relative' }}>
        {loadingText}
      </div>

      <div className="loader-bar">
        <div className="loader-progress" />
      </div>
    </div>
  );
}

// ─── ORBIT MODEL ───────────────────────────────────────────────────────────
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
      <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #3B82F6)", boxShadow: theme.coreShadow, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 10, color: "#fff", textAlign: "center", lineHeight: 1.3, zIndex: 10 }}>CIVIC<br/>PULSE</div>
      {NODES.map(n => (
        <div key={n.label} style={{ position: "absolute", width: 38, height: 38, borderRadius: "50%", background: theme.nodeBg, border: `1.5px solid ${n.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: n.color, letterSpacing: 0.3, animation: `${n.anim} ${n.dur} ${n.delay} linear infinite`, boxShadow: `0 0 10px ${n.color}44` }}>{n.label}</div>
      ))}
    </div>
  );
}

// ─── MOCK PHONE ───────────────────────────────────────────────────────────
function MockPhone({ theme }) {
  const ISSUES = [
    { title: "Sewage overflow — Market St", votes: 247, status: "pending", ward: "Ward 12" },
    { title: "Broken streetlights — NH-58", votes: 189, status: "auth", ward: "Ward 7" },
    { title: "Garbage pile-up — Sector 4", votes: 312, status: "verified", ward: "Ward 3" },
  ];

  const STATUS = {
    pending: { label: "Pending", color: "#F97316" },
    auth: { label: "Auth. Solved", color: "#FBBF24" },
    verified: { label: "Verified ✓", color: "#10B981" },
  };

  return (
    <div className="mock-phone" style={{ width: 240, height: 488, background: theme.phoneBg, borderRadius: 38, border: `2px solid ${theme.hairline}`, overflow: "hidden", boxShadow: theme.phoneShadow, position: "relative" }}>
      <div style={{ width: 76, height: 22, background: theme.phoneBg, borderRadius: "0 0 14px 14px", margin: "0 auto", border: `1.5px solid ${theme.hairline}`, borderTop: "none" }} />
      <div style={{ padding: "0 14px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 10px", borderBottom: `1px solid ${theme.hairline}`, marginBottom: 12 }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 900, color: "#A78BFA" }}>⬡ CivicPulse</span>
          <span style={{ fontSize: 13 }}>🔔</span>
        </div>
        {ISSUES.map((issue, i) => (
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

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    // Detect mobile on mount and resize
    const checkMobile = () => {
      const mobile = window.innerWidth <= 820;
      setIsMobile(mobile);
      if (mobile) {
        setLoading(false); // Skip preloader on mobile
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Desktop preloader timer
    let timer;
    if (!isMobile) {
      timer = setTimeout(() => setLoading(false), 2800);
    }

    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });

    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
      obs.disconnect();
    };
  }, [isMobile]);

  const STATS = [
    { val: "14.2K+", label: "Issues Reported" },
    { val: "9,102", label: "Authority Solved" },
    { val: "8,840", label: "Community Verified" },
    { val: "42", label: "Active Wards" },
  ];

  const TIMELINE = [
    { icon: "📍", num: "01", t: "Report", d: "Citizen spots an issue, uploads photo + GPS. AI checks for duplicates before publishing." },
    { icon: "🔥", num: "02", t: "Upvote Priority", d: "Neighbours upvote. More votes = higher on the Authority queue — automatically." },
    { icon: "🏛️", num: "03", t: "Authority Fixes", d: "Officials mark it 'Solved' and MUST upload a Proof-of-Fix photo. No photo = not accepted." },
    { icon: "✅", num: "04", t: "Community Verdict", d: "The reporter verifies on the ground. Approved = archived. Rejected = re-opened publicly." },
  ];

  const AI_CARDS = [
    { icon: "🔍", title: "Duplicate Clustering", desc: "Vector embeddings merge 40 separate reports of the same pothole into one ticket." },
    { icon: "📸", title: "Photo Validation", desc: "Classifier confirms your photo actually matches the problem you described." },
    { icon: "🗓️", title: "Resolution ETA", desc: "Based on ward history & issue type, AI gives a realistic deadline — not a promise." },
    { icon: "🧾", title: "Authority Brief", desc: "Messy community text auto-converted into clean formal briefs for officials." },
    { icon: "🌊", title: "Trend Clusters", desc: "Three water reports in one ward? AI flags systemic pipeline failure, not random noise." },
  ];

  const ISSUES = [
    { id: "#1042", title: "Sewage overflow — Market St", votes: 247, status: "pending", ward: "Ward 12" },
    { id: "#1039", title: "Broken streetlights — NH-58", votes: 189, status: "auth", ward: "Ward 7" },
    { id: "#1031", title: "Garbage pile-up — Sector 4", votes: 312, status: "verified", ward: "Ward 3" },
    { id: "#1028", title: "Pothole near school gate", votes: 156, status: "pending", ward: "Ward 9" },
  ];

  const STATUS = {
    pending: { label: "Pending", color: "#F97316" },
    auth: { label: "Auth. Solved", color: "#FBBF24" },
    verified: { label: "Verified ✓", color: "#10B981" },
  };

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: "100vh" }}>
      <GlobalStyles theme={theme} isLoading={loading} isMobile={isMobile} />

      {/* Preloader - Desktop Only */}
      {!isMobile && <Preloader isVisible={loading} />}

      {/* ══ NAV ══ */}
      <nav style={{
        position: isMobile ? "relative" : "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: scrolled && !isMobile ? (darkMode ? "rgba(3,0,20,0.88)" : "rgba(255,255,255,0.92)") : (isMobile ? theme.cardBg : "transparent"),
        backdropFilter: scrolled && !isMobile ? "blur(16px)" : (isMobile ? "blur(14px)" : "none"),
        borderBottom: scrolled && !isMobile ? `1px solid ${theme.hairline}` : (isMobile ? `1px solid ${theme.hairline}` : "none"),
        padding: isMobile ? "0" : scrolled ? "11px 0" : "16px 0",
        transition: "all 0.3s ease",
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: isMobile ? "12px 16px" : "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#7C3AED,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 11, color: "#fff" }}>CP</div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: isMobile ? 14 : 16, letterSpacing: "-0.4px" }}>CivicPulse</span>
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
      <section style={{ minHeight: isMobile ? "auto" : "100vh", position: "relative", display: "flex", alignItems: "center", paddingTop: isMobile ? 0 : 60, marginTop: isMobile ? 0 : 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(100,100,255,${theme.gridOpacity}) 1px,transparent 1px),linear-gradient(90deg,rgba(100,100,255,${theme.gridOpacity}) 1px,transparent 1px)`, backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)", zIndex: 0 }} />
        <div style={{ position: "absolute", top: "15%", left: "52%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)", zIndex: 0, animation: "glowPulse 4s ease-in-out infinite" }} />

        <div className="hero-wrap" style={{ maxWidth: 1160, margin: "0 auto", padding: isMobile ? "16px" : "0 16px", display: "flex", alignItems: "center", gap: 64, position: "relative", zIndex: 1, width: "100%" }}>
          <div style={{ flex: 1.2 }}>
            <div className={isMobile ? "" : "hero-animate hero-delay-1"} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#7C3AED", marginBottom: 20 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7C3AED", display: "inline-block", animation: "pulseDot 2s infinite" }} />
              Decentralized Civic Infrastructure
            </div>
            <h1 className={isMobile ? "hero-title" : "hero-animate hero-delay-2 hero-title"} style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(44px,7.5vw,86px)", fontWeight: 700, lineHeight: 0.93, letterSpacing: "-2.5px", marginBottom: 20 }}>
              Engineering<br /><span className="accent-text">Transparency.</span>
            </h1>
            <p className={isMobile ? "hero-subtitle" : "hero-animate hero-delay-3 hero-subtitle"} style={{ fontSize: 16, color: theme.muted, lineHeight: 1.72, maxWidth: 460, marginBottom: 28 }}>
              A 3-layer civic verification system. AI clusters complaints. Community upvotes prioritize. Authorities prove their work. You verify.
            </p>
            <div className={isMobile ? "btn-group" : "hero-animate hero-delay-3 btn-group"} style={{ display: "flex", gap: 12 }}>
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
      <div className="stats-bar" style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 20, padding: "48px 16px", background: theme.statsBarBg, borderTop: `1px solid ${theme.hairline}`, marginTop: isMobile ? 20 : 0 }}>
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