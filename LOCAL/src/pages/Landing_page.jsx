import React, { useState, useEffect } from "react";

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: 'DM Sans', system-ui, sans-serif; background: #030014; color: #F0F0FF; overflow-x: hidden; }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #030014; }
    ::-webkit-scrollbar-thumb { background: #7C3AED; border-radius: 10px; }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-14px); }
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
      to   { transform: rotate(360deg) translateX(88px) rotate(-360deg); }
    }
    @keyframes orbitB {
      from { transform: rotate(0deg) translateX(128px) rotate(0deg); }
      to   { transform: rotate(-360deg) translateX(128px) rotate(360deg); }
    }
    @keyframes lineDash {
      from { stroke-dashoffset: 300; }
      to   { stroke-dashoffset: 0; }
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
      background: rgba(255,255,255,0.03);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(255,255,255,0.07);
    }

    .nav-link { transition: color 0.2s; }
    .nav-link:hover { color: #fff !important; }

    .step-card { transition: transform 0.28s, border-color 0.28s; }
    .step-card:hover { transform: translateY(-4px); border-color: rgba(124,58,237,0.45) !important; }

    .ai-chip { transition: transform 0.28s, border-color 0.28s; }
    .ai-chip:hover { transform: translateY(-4px); border-color: rgba(96,165,250,0.45) !important; }

    .issue-row { transition: background 0.2s; cursor: pointer; }
    .issue-row:hover { background: rgba(124,58,237,0.07) !important; }

    /* ── MOBILE RESPONSIVE ── */
    @media (max-width: 820px) {
      .hero-wrap { flex-direction: column !important; padding-top: 88px !important; gap: 36px !important; }
      .hero-visual { display: none !important; }
      .hero-title { font-size: clamp(38px, 10vw, 58px) !important; letter-spacing: -2px !important; }
      .orbit-model { display: none !important; }
      .nav-desktop { display: none !important; }
      .nav-mobile-btn { display: flex !important; }
      .stats-bar { gap: 18px !important; padding: 36px 20px !important; }
      .section-pad { padding: 64px 20px !important; }
      .section-h2 { font-size: clamp(26px, 7vw, 38px) !important; }
      .ai-feature-row { flex-direction: column !important; }
      .ai-chips-grid { grid-template-columns: 1fr 1fr !important; }
      .dash-mock { height: auto !important; flex-direction: column !important; }
      .dash-sidebar { width: 100% !important; flex-direction: row !important; height: 52px !important; padding: 0 16px !important; gap: 12px !important; align-items: center !important; }
      .dash-grid { flex-direction: column !important; gap: 10px !important; }
      .btn-group { flex-wrap: wrap !important; }
      .timeline-wrap { padding-left: 32px !important; }
    }
    @media (max-width: 480px) {
      .hero-title { font-size: 34px !important; }
      .ai-chips-grid { grid-template-columns: 1fr !important; }
      .hero-stats { gap: 20px !important; }
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
  { icon: "🔍", title: "Duplicate Clustering",  desc: "Vector embeddings merge 40 separate reports of the same pothole into one ticket." },
  { icon: "📸", title: "Photo Validation",       desc: "Classifier confirms your photo actually matches the problem you described." },
  { icon: "🗓️", title: "Resolution ETA",         desc: "Based on ward history & issue type, AI gives a realistic deadline — not a promise." },
  { icon: "🧾", title: "Authority Brief",         desc: "Messy community text auto-converted into clean formal briefs for officials." },
  { icon: "🌊", title: "Trend Clusters",          desc: "Three water reports in one ward? AI flags systemic pipeline failure, not random noise." },
];
const ISSUES = [
  { id: "#1042", title: "Sewage overflow — Market St",    votes: 247, status: "pending",  ward: "Ward 12" },
  { id: "#1039", title: "Broken streetlights — NH-58",   votes: 189, status: "auth",     ward: "Ward 7"  },
  { id: "#1031", title: "Garbage pile-up — Sector 4",    votes: 312, status: "verified", ward: "Ward 3"  },
  { id: "#1028", title: "Pothole near school gate",       votes: 156, status: "pending",  ward: "Ward 9"  },
];
const STATUS = {
  pending:  { label: "Pending",       color: "#F97316" },
  auth:     { label: "Auth. Solved",  color: "#FBBF24" },
  verified: { label: "Verified ✓",   color: "#34D399" },
};

// ─── ORBIT MODEL — hidden on mobile via CSS ───────────────────────────────
function OrbitModel() {
  const NODES = [
    { label: "Report",  color: "#A78BFA", anim: "orbitA", delay: "0s",  dur: "9s"  },
    { label: "Vote",    color: "#60A5FA", anim: "orbitB", delay: "2.5s",dur: "13s" },
    { label: "Fix",     color: "#34D399", anim: "orbitA", delay: "1.2s",dur: "11s" },
    { label: "Verify",  color: "#F472B6", anim: "orbitB", delay: "3.8s",dur: "10s" },
  ];
  return (
    <div className="orbit-model" style={{ position: "relative", width: 300, height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* rings */}
      {[88, 128].map(r => (
        <div key={r} style={{ position: "absolute", width: r * 2, height: r * 2, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)" }} />
      ))}
      {/* core */}
      <div style={{
        width: 68, height: 68, borderRadius: "50%",
        background: "linear-gradient(135deg, #7C3AED, #3B82F6)",
        boxShadow: "0 0 28px rgba(124,58,237,0.55), 0 0 56px rgba(124,58,237,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 10, color: "#fff", textAlign: "center", lineHeight: 1.3, zIndex: 10,
      }}>CIVIC<br/>PULSE</div>
      {/* orbiting nodes */}
      {NODES.map(n => (
        <div key={n.label} style={{
          position: "absolute", width: 38, height: 38, borderRadius: "50%",
          background: n.color + "1A", border: `1.5px solid ${n.color}`,
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
function MockPhone() {
  return (
    <div style={{ width: 240, height: 488, background: "#0D0D22", borderRadius: 38, border: "2px solid rgba(255,255,255,0.09)", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)", position: "relative" }}>
      {/* notch */}
      <div style={{ width: 76, height: 22, background: "#0D0D22", borderRadius: "0 0 14px 14px", margin: "0 auto", border: "1.5px solid rgba(255,255,255,0.06)", borderTop: "none" }} />
      <div style={{ padding: "0 14px 14px" }}>
        {/* app bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 10px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 900, color: "#A78BFA" }}>⬡ CivicPulse</span>
          <span style={{ fontSize: 13 }}>🔔</span>
        </div>
        {/* issue cards */}
        {ISSUES.slice(0, 3).map((issue, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "9px 10px", marginBottom: 8, border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ textAlign: "center", minWidth: 26 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{issue.votes}</div>
              <div style={{ fontSize: 9, color: "#A78BFA" }}>▲</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 8, fontWeight: 800, color: STATUS[issue.status].color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{issue.ward}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", lineHeight: 1.35, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{issue.title}</div>
            </div>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS[issue.status].color, flexShrink: 0 }} />
          </div>
        ))}
        {/* FAB */}
        <div style={{ background: "linear-gradient(135deg,#7C3AED,#3B82F6)", borderRadius: 20, padding: "8px 0", textAlign: "center", marginTop: 6, fontSize: 11, fontWeight: 800, color: "#fff" }}>+ Report Issue</div>
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled,       setScrolled]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [activeFilter,   setActiveFilter]   = useState("all");

  /* scroll + reveal observer */
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

  const filtered = activeFilter === "all" ? ISSUES : ISSUES.filter(i => i.status === activeFilter);

  return (
    <div style={{ backgroundColor: "#030014", color: "#F0F0FF", overflowX: "hidden" }}>
      <GlobalStyles />

      {/* ══ NAV ══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: scrolled ? "rgba(3,0,20,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        padding: scrolled ? "11px 0" : "20px 0",
        transition: "all 0.3s ease",
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7C3AED,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 12, color: "#fff" }}>CP</div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-0.4px" }}>CivicPulse</span>
          </div>

          {/* Desktop */}
          <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {[["How it Works","#HowitWorks"],["AI Engine","#AIEngine"],["Live Issues","#LiveIssues"]].map(([l, h]) => (
              <a key={l} href={h} className="nav-link" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>{l}</a>
            ))}
            <button style={{ background: "#7C3AED", color: "#fff", border: "none", borderRadius: 9, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Launch App</button>
          </div>

          {/* Mobile hamburger */}
          <button className="nav-mobile-btn" onClick={() => setMobileOpen(o => !o)}
            style={{ display: "none", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px", cursor: "pointer", flexDirection: "column", gap: 4 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width: 18, height: 2, background: "#fff", borderRadius: 2, display: "block", transition: "all 0.3s",
                transform: mobileOpen ? (i===0 ? "rotate(45deg) translate(4px,4px)" : i===2 ? "rotate(-45deg) translate(4px,-4px)" : "scaleX(0)") : "none"
              }}/>
            ))}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div style={{ background: "rgba(3,0,20,0.98)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "18px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
            {[["How it Works","#HowitWorks"],["AI Engine","#AIEngine"],["Live Issues","#LiveIssues"]].map(([l,h]) => (
              <a key={l} href={h} onClick={() => setMobileOpen(false)} style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 15, fontWeight: 600 }}>{l}</a>
            ))}
            <button style={{ background: "#7C3AED", color: "#fff", border: "none", borderRadius: 9, padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", textAlign: "left" }}>
              Launch App →
            </button>
          </div>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
        {/* Grid bg */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(100,100,255,0.045) 1px,transparent 1px),linear-gradient(90deg,rgba(100,100,255,0.045) 1px,transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)", zIndex: 0 }} />
        {/* Glow orb */}
        <div style={{ position: "absolute", top: "15%", left: "52%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.17) 0%, transparent 70%)", zIndex: 0, animation: "glowPulse 4s ease-in-out infinite" }} />

        <div className="hero-wrap" style={{ maxWidth: 1160, margin: "0 auto", padding: "110px 24px 64px", display: "flex", alignItems: "center", gap: 64, position: "relative", zIndex: 1 }}>
          {/* Left */}
          <div style={{ flex: 1 }}>
            <div className="reveal" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#A78BFA", marginBottom: 28 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#A78BFA", display: "inline-block", animation: "pulseDot 2s infinite" }} />
              Decentralized Civic Infrastructure
            </div>

            <h1 className="hero-title reveal" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(44px,7.5vw,86px)", fontWeight: 900, lineHeight: 0.93, letterSpacing: "-2.5px", marginBottom: 24, color: "#fff" }}>
              Engineering<br /><span className="accent-text">Transparency.</span>
            </h1>

            <p className="reveal" style={{ fontSize: 17, color: "rgba(255,255,255,0.48)", lineHeight: 1.72, maxWidth: 460, marginBottom: 36 }}>
              A 3-layer civic verification system. AI clusters complaints. Community upvotes prioritize. Authorities prove their work. You verify.
            </p>

            <div className="reveal btn-group" style={{ display: "flex", gap: 14, marginBottom: 52 }}>
              <button style={{ background: "linear-gradient(135deg,#7C3AED,#3B82F6)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 30px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 14px 36px rgba(124,58,237,0.35)" }}>
                Report Issue
              </button>
              <button style={{ background: "transparent", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "14px 30px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                Explore Map →
              </button>
            </div>

            {/* Inline stats */}
            <div className="hero-stats reveal" style={{ display: "flex", gap: 36, flexWrap: "wrap" }}>
              {STATS.slice(0,3).map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.3px", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right visual — hidden on mobile via CSS */}
          <div className="hero-visual" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
            <div style={{ animation: "float 6s ease-in-out infinite" }}>
              <MockPhone />
            </div>
            <OrbitModel />
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <div className="stats-bar" style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24, padding: "52px 24px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {STATS.map((s, i) => (
          <div key={i} className="reveal" style={{ textAlign: "center", minWidth: 110 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 34, fontWeight: 900, background: "linear-gradient(90deg,#A78BFA,#60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══ HOW IT WORKS ══ */}
      <section id="HowitWorks" className="section-pad" style={{ maxWidth: 1160, margin: "0 auto", padding: "96px 24px" }}>
        <div className="reveal" style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", color: "#A78BFA", marginBottom: 14 }}>The Loop</div>
          <h2 className="section-h2" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-1.5px", color: "#fff", marginBottom: 14 }}>
            From Problem to <span className="accent-text">Proof.</span>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.42)", maxWidth: 460 }}>A four-step loop that can't be gamed. Publicly on-record.</p>
        </div>

        <div className="timeline-wrap" style={{ position: "relative", paddingLeft: 50, maxWidth: 740 }}>
          {/* Track */}
          <div style={{ position: "absolute", left: 16, top: 10, bottom: 10, width: 2, background: "rgba(255,255,255,0.07)", borderRadius: 2 }} />
          <div style={{ position: "absolute", left: 16, top: 10, width: 2, height: "66%", background: "linear-gradient(to bottom,#7C3AED,#3B82F6)", borderRadius: 2 }} />

          {TIMELINE.map((step, i) => (
            <div key={i} className="step-card reveal glass" style={{ position: "relative", marginBottom: 22, borderRadius: 16, padding: "22px 26px", display: "flex", gap: 18, alignItems: "flex-start" }}>
              {/* dot on track */}
              <div style={{ position: "absolute", left: -43, top: 24, width: 14, height: 14, borderRadius: "50%", background: i < 3 ? "linear-gradient(135deg,#7C3AED,#3B82F6)" : "rgba(255,255,255,0.12)", border: "2px solid #030014", zIndex: 2 }} />
              <div style={{ fontSize: 26, flexShrink: 0 }}>{step.icon}</div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 5 }}>Step {step.num}</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 7 }}>{step.t}</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.48)", lineHeight: 1.65 }}>{step.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ AI ENGINE ══ */}
      <section id="AIEngine" style={{ background: "#050010" }}>
        <div className="section-pad" style={{ maxWidth: 1160, margin: "0 auto", padding: "96px 24px" }}>
          <div className="reveal" style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", color: "#60A5FA", marginBottom: 14 }}>Real AI, Real Use Cases</div>
            <h2 className="section-h2" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-1.5px", color: "#fff", marginBottom: 14 }}>
              AI That Does <span className="accent-text">Actual Work</span>
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.42)", maxWidth: 500 }}>No buzzwords. Every feature solves a real civic data problem.</p>
          </div>

          {/* Feature spotlight row */}
          <div className="ai-feature-row reveal" style={{ display: "flex", gap: 44, alignItems: "center", marginBottom: 44, flexWrap: "wrap" }}>
            {/* Node viz card */}
            <div className="glass" style={{ flex: "0 0 280px", borderRadius: 22, padding: 32, minHeight: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.14) 0%, transparent 70%)" }} />
              {/* SVG node cluster */}
              <svg width="160" height="150" viewBox="0 0 160 150" style={{ position: "relative", zIndex: 1 }}>
                {/* connecting lines */}
                {[[80,75,34,36],[80,75,122,30],[80,75,22,105],[80,75,135,108],[80,75,74,132]].map(([x1,y1,x2,y2],i) => (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(167,139,250,0.22)" strokeWidth="1.2" strokeDasharray="5 3"
                    style={{ animation: `lineDash 2s ${i * 0.3}s ease-out forwards`, strokeDashoffset: 300 }} />
                ))}
                {/* main node */}
                <circle cx="80" cy="75" r="10" fill="#7C3AED" style={{ filter: "drop-shadow(0 0 12px #7C3AED)" }} />
                {/* child nodes */}
                {[[34,36,"#60A5FA",7],[122,30,"#60A5FA",7],[22,105,"#A78BFA",6],[135,108,"#A78BFA",6],[74,132,"#34D399",7]].map(([cx,cy,fill,r],i) => (
                  <circle key={i} cx={cx} cy={cy} r={r} fill={fill} opacity="0.85" style={{ filter: `drop-shadow(0 0 6px ${fill})` }} />
                ))}
              </svg>
              <div style={{ position: "relative", zIndex: 1, marginTop: 12, fontSize: 10, fontWeight: 800, color: "rgba(167,139,250,0.65)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Clustering Active</div>
            </div>

            <div style={{ flex: 1, minWidth: 240 }}>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 14 }}>Vector Embedding Detection</h3>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.48)", lineHeight: 1.72, marginBottom: 20 }}>
                A photo of a water leak is converted to a 768-dim vector. If another user reports the same leak 5 m away, vectors collide — reports auto-merge, upvotes combine, priority climbs.
              </p>
              {["Prevents authority dashboard flooding", "Aggregates votes for higher urgency", "Cuts manual moderation by ~80%"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9, fontSize: 14, color: "rgba(255,255,255,0.58)" }}>
                  <span style={{ color: "#60A5FA", fontWeight: 900 }}>✓</span>{item}
                </div>
              ))}
            </div>
          </div>

          {/* AI chips grid */}
          <div className="ai-chips-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))", gap: 16 }}>
            {AI_CARDS.map((card, i) => (
              <div key={i} className="ai-chip glass reveal" style={{ borderRadius: 14, padding: "22px 18px", transition: "transform 0.28s, border-color 0.28s" }}>
                <div style={{ fontSize: 22, marginBottom: 12 }}>{card.icon}</div>
                <h4 style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 7 }}>{card.title}</h4>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.43)", lineHeight: 1.6 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LIVE ISSUES / AUTHORITY ══ */}
      <section id="LiveIssues" className="section-pad" style={{ maxWidth: 1160, margin: "0 auto", padding: "96px 24px" }}>
        <div className="reveal" style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", color: "#34D399", marginBottom: 14 }}>Authority View</div>
          <h2 className="section-h2" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-1.5px", color: "#fff", marginBottom: 14 }}>
            The Command <span className="accent-text">Center</span>
          </h2>
        </div>

        {/* Dashboard mock */}
        <div className="dash-mock glass reveal" style={{ borderRadius: 22, display: "flex", overflow: "hidden" }}>
          {/* Sidebar */}
          <div className="dash-sidebar" style={{ width: 68, background: "rgba(124,58,237,0.07)", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", alignItems: "center", padding: "22px 0", gap: 12, flexShrink: 0 }}>
            {["📊","📋","🏛️","⚙️"].map((ic, i) => (
              <div key={i} style={{ width: 36, height: 36, borderRadius: 9, background: i===0 ? "rgba(124,58,237,0.28)" : "transparent", border: i===0 ? "1px solid rgba(124,58,237,0.4)" : "1px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" }}>{ic}</div>
            ))}
          </div>
          {/* Main area */}
          <div style={{ flex: 1, padding: "26px 28px", minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 20, letterSpacing: "0.5px" }}>AUTHORITY COMMAND CENTER — WARD 12</div>
            {/* Metric cards */}
            <div className="dash-grid" style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
              {[["Pending","24","#F97316"],["Critical","08","#EF4444"],["Resolved","142","#34D399"]].map(([l,v,c]) => (
                <div key={l} style={{ flex: "1 1 100px", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "16px 18px", border: `1px solid ${c}22` }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>{l}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 900, color: c }}>{v}</div>
                </div>
              ))}
            </div>
            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {[["all","All"],["pending","Pending"],["auth","Auth. Solved"],["verified","Verified"]].map(([k,l]) => (
                <button key={k} onClick={() => setActiveFilter(k)} style={{ background: activeFilter===k ? "rgba(124,58,237,0.22)" : "transparent", color: activeFilter===k ? "#A78BFA" : "rgba(255,255,255,0.38)", border: `1px solid ${activeFilter===k ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.07)"}`, borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>{l}</button>
              ))}
            </div>
            {/* Issue list */}
            <div>
              {filtered.map((issue, i) => (
                <div key={i} className="issue-row" style={{ padding: "11px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 12, borderRadius: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.25)", fontFamily: "'Syne',sans-serif", minWidth: 42 }}>{issue.id}</span>
                  <span style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.68)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{issue.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: STATUS[issue.status].color, background: STATUS[issue.status].color + "18", padding: "3px 9px", borderRadius: 10, whiteSpace: "nowrap" }}>{STATUS[issue.status].label}</span>
                  {issue.status !== "verified" && (
                    <button style={{ background: "rgba(59,130,246,0.14)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.28)", borderRadius: 7, padding: "5px 11px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>Act →</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: "80px 24px", textAlign: "center", background: "linear-gradient(180deg,#030014 0%,#08001E 100%)", borderTop: "1px solid rgba(124,58,237,0.1)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 className="section-h2 reveal" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(26px,5vw,44px)", fontWeight: 900, letterSpacing: "-1px", color: "#fff", marginBottom: 18 }}>
            Your city works better<br />when you speak up.
          </h2>
          <p className="reveal" style={{ fontSize: 16, color: "rgba(255,255,255,0.42)", marginBottom: 36, lineHeight: 1.7 }}>
            Join thousands of residents holding local authorities accountable — one upvote at a time.
          </p>
          <div className="reveal btn-group" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ background: "linear-gradient(135deg,#7C3AED,#3B82F6)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 14px 36px rgba(124,58,237,0.35)" }}>Report a Problem Now</button>
            <button style={{ background: "transparent", color: "rgba(255,255,255,0.62)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>View Authority View →</button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ padding: "44px 24px 32px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#7C3AED,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 11, color: "#fff" }}>CP</div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17 }}>CivicPulse</span>
          </div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.28)" }}>Building the future of urban accountability. Designed in 2026.</p>
          <div style={{ display: "flex", gap: 20, fontSize: 12, fontWeight: 700, color: "#A78BFA" }}>
            {["GitHub","Twitter","LinkedIn"].map(l => <span key={l} style={{ cursor: "pointer" }}>{l}</span>)}
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.14)", marginTop: 6 }}>© 2026 CivicPulse — Open civic infrastructure.</p>
        </div>
      </footer>
    </div>
  );
}