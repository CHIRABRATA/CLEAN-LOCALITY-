import { useState } from "react";

/* ─── Inline global styles injected once ─────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: #030014;
      min-height: 100vh;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes glowPulse {
      0%,100% { opacity: 0.4; }
      50%      { opacity: 0.75; }
    }
    @keyframes shimmer {
      from { background-position: -200% center; }
      to   { background-position:  200% center; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .cp-fade-up { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
    .cp-fade-up-1 { animation: fadeUp 0.5s 0.05s cubic-bezier(0.22,1,0.36,1) both; }
    .cp-fade-up-2 { animation: fadeUp 0.5s 0.10s cubic-bezier(0.22,1,0.36,1) both; }
    .cp-fade-up-3 { animation: fadeUp 0.5s 0.15s cubic-bezier(0.22,1,0.36,1) both; }

    .cp-input {
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 10px;
      padding: 11px 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: #F0F0FF;
      outline: none;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .cp-input::placeholder { color: rgba(255,255,255,0.28); }
    .cp-input:focus {
      border-color: rgba(124,58,237,0.6);
      background: rgba(124,58,237,0.07);
      box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
    }
    .cp-input.cp-error {
      border-color: rgba(239,68,68,0.65);
      box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
    }
    .cp-input:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    /* select arrow override */
    .cp-input option { background: #0D0D28; color: #F0F0FF; }

    .cp-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: rgba(255,255,255,0.42);
      margin-bottom: 6px;
    }

    .cp-btn-primary {
      width: 100%;
      padding: 13px;
      background: linear-gradient(135deg, #7C3AED, #3B82F6);
      color: #fff;
      font-family: 'Syne', sans-serif;
      font-size: 15px;
      font-weight: 700;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: transform 0.18s, box-shadow 0.18s;
      box-shadow: 0 8px 28px rgba(124,58,237,0.35);
    }
    .cp-btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 14px 36px rgba(124,58,237,0.45);
    }
    .cp-btn-primary:active:not(:disabled) { transform: translateY(0); }
    .cp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .cp-btn-primary::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
      background-size: 200% 100%;
      animation: shimmer 2.5s infinite;
    }

    .cp-role-btn {
      flex: 1;
      padding: 10px 6px;
      background: transparent;
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 10px;
      color: rgba(255,255,255,0.45);
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.22s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
    }
    .cp-role-btn.active {
      background: rgba(124,58,237,0.18);
      border-color: rgba(124,58,237,0.55);
      color: #C4B5FD;
      box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
    }
    .cp-role-btn:hover:not(.active) {
      border-color: rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.7);
    }

    .cp-mode-toggle {
      display: flex;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      padding: 4px;
      gap: 4px;
    }
    .cp-mode-btn {
      flex: 1;
      padding: 9px;
      background: transparent;
      border: none;
      border-radius: 9px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: rgba(255,255,255,0.38);
      cursor: pointer;
      transition: all 0.22s;
    }
    .cp-mode-btn.active {
      background: rgba(124,58,237,0.25);
      color: #C4B5FD;
    }

    .cp-error-text {
      font-size: 11px;
      color: #F87171;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .cp-toast {
      position: fixed;
      bottom: 28px;
      right: 28px;
      padding: 14px 20px;
      border-radius: 12px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      z-index: 999;
      animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
      max-width: 320px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .cp-toast.success {
      background: rgba(16,185,129,0.15);
      border: 1px solid rgba(16,185,129,0.4);
      color: #6EE7B7;
    }
    .cp-toast.error {
      background: rgba(239,68,68,0.13);
      border: 1px solid rgba(239,68,68,0.4);
      color: #FCA5A5;
    }

    .cp-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 4px 0;
    }
    .cp-divider::before, .cp-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255,255,255,0.07);
    }
    .cp-divider span {
      font-size: 11px;
      color: rgba(255,255,255,0.25);
      font-weight: 600;
      letter-spacing: 1px;
    }

    .cp-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }

    .cp-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 9px;
      background: rgba(124,58,237,0.14);
      border: 1px solid rgba(124,58,237,0.3);
      border-radius: 20px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #A78BFA;
    }

    /* scrollbar for long forms */
    .cp-scroll::-webkit-scrollbar { width: 3px; }
    .cp-scroll::-webkit-scrollbar-track { background: transparent; }
    .cp-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.4); border-radius: 10px; }

    @media (max-width: 480px) {
      .cp-card { margin: 16px !important; padding: 28px 20px !important; }
      .cp-grid-2 { grid-template-columns: 1fr !important; }
    }
  `}</style>
);

/* ─── Constants ─────────────────────────────────────────────────────────── */
const CITIZEN_FIELDS = [
  { key: "name",     label: "Full Name",    type: "text",     placeholder: "e.g. Arjun Mehta",         required: true },
  { key: "phone",    label: "Phone Number", type: "tel",      placeholder: "+91 98765 43210",           required: true },
  { key: "address",  label: "Address",      type: "textarea", placeholder: "Your ward / locality",      required: true },
  { key: "password", label: "Password",     type: "password", placeholder: "Min. 8 characters",         required: true },
];

const AUTHORITY_FIELDS = [
  { key: "id",       label: "Authority ID",   type: "text",     placeholder: "AUTH-2026-XXX",             required: true },
  { key: "name",     label: "Full Name",      type: "text",     placeholder: "e.g. Priya Sharma",         required: true },
  { key: "phone",    label: "Phone Number",   type: "tel",      placeholder: "+91 98765 43210",           required: true },
  { key: "address",  label: "Office Address", type: "textarea", placeholder: "Municipal office location", required: true },
  { key: "password", label: "Password",       type: "password", placeholder: "Min. 8 characters",         required: true },
];

const LOGIN_FIELDS = [
  { key: "id",       label: "User ID / Phone", type: "text",     placeholder: "Your ID or phone number", required: true },
  { key: "password", label: "Password",         type: "password", placeholder: "Enter your password",      required: true },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function validate(fields, data) {
  const errors = {};
  fields.forEach(f => {
    if (!f.required) return;
    const val = (data[f.key] || "").toString().trim();
    if (!val) { errors[f.key] = "This field is required"; return; }
    if (f.key === "phone" && !/^[+\d\s\-()]{7,15}$/.test(val)) errors[f.key] = "Invalid phone number";
    if (f.key === "password" && val.length < 8) errors[f.key] = "Minimum 8 characters";
    if (f.key === "latitude" && (isNaN(val) || val < -90  || val > 90))  errors[f.key] = "Must be between -90 and 90";
    if (f.key === "longitude"&& (isNaN(val) || val < -180 || val > 180)) errors[f.key] = "Must be between -180 and 180";
    if (f.key === "radius"   && (isNaN(val) || Number(val) <= 0))         errors[f.key] = "Must be a positive number";
  });
  return errors;
}

/* ─── FormField ──────────────────────────────────────────────────────────── */
function FormField({ field, value, onChange, error }) {
  const base = `cp-input${error ? " cp-error" : ""}`;

  if (field.type === "textarea")
    return (
      <div>
        <label className="cp-label">{field.label}{field.required && <span style={{ color: "#F87171" }}> *</span>}</label>
        <textarea className={base} rows={2} placeholder={field.placeholder} value={value}
          onChange={e => onChange(field.key, e.target.value)}
          style={{ resize: "none", lineHeight: "1.5" }} />
        {error && <p className="cp-error-text">⚠ {error}</p>}
      </div>
    );

  if (field.type === "select")
    return (
      <div>
        <label className="cp-label">{field.label}{field.required && <span style={{ color: "#F87171" }}> *</span>}</label>
        <select className={base} value={value} onChange={e => onChange(field.key, e.target.value)}>
          <option value="">— Select —</option>
          {field.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {error && <p className="cp-error-text">⚠ {error}</p>}
      </div>
    );

  return (
    <div>
      <label className="cp-label">{field.label}{field.required && <span style={{ color: "#F87171" }}> *</span>}</label>
      <input className={base} type={field.type} placeholder={field.placeholder} value={value}
        onChange={e => onChange(field.key, e.target.value)} />
      {error && <p className="cp-error-text">⚠ {error}</p>}
    </div>
  );
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`cp-toast ${toast.type}`}>
      <span>{toast.type === "success" ? "✓" : "✕"}</span>
      {toast.message}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function Profile() {
  const [mode, setMode]     = useState("login");   // "login" | "signup"
  const [role, setRole]     = useState("citizen"); // "citizen" | "authority"
  const [formData, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState(null);
  const [loggedIn, setLoggedIn] = useState(null);  // holds user after success

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  const handleChange = (key, val) => {
    setData(d => ({ ...d, [key]: val }));
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const switchMode = (m) => {
    setMode(m);
    setData({});
    setErrors({});
  };

  /* ── Login ── */
  const handleLogin = async () => {
    const errs = validate(LOGIN_FIELDS, formData);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // simulate API
    setLoading(false);

    // Mock auth — replace with real API call
    if (formData.id && formData.password) {
      const user = { id: formData.id, role, name: formData.id };
      setLoggedIn(user);
      showToast(`Welcome back, ${formData.id}! ✓`);
    } else {
      showToast("Invalid credentials. Please try again.", "error");
    }
  };

  /* ── Signup ── */
  const handleSignup = async () => {
    const fields = role === "citizen" ? CITIZEN_FIELDS : AUTHORITY_FIELDS;
    const errs = validate(fields, formData);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1400)); // simulate API
    setLoading(false);

    const payload = { role, ...formData };
    console.log("Signup payload →", payload); // send to your API here

    showToast(`Account created! Welcome, ${formData.name || formData.id}.`);
    setTimeout(() => switchMode("login"), 1200);
  };

  /* ── Logged-in view ── */
  if (loggedIn) {
    return (
      <>
        <GlobalStyles />
        <Toast toast={toast} />
        <div style={wrap}>
          <div style={bg1} />
          <div style={bg2} />
          <div className="cp-card cp-fade-up" style={{ ...card, maxWidth: 420, textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>
              {role === "citizen" ? "👤" : "🏛️"}
            </div>
            <span className="cp-tag" style={{ marginBottom: 14 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", display: "inline-block" }} />
              {role === "citizen" ? "Citizen" : "Authority"}
            </span>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", margin: "12px 0 6px" }}>
              {loggedIn.name}
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 28 }}>ID: {loggedIn.id}</p>
            <button className="cp-btn-primary" onClick={() => { setLoggedIn(null); setData({}); switchMode("login"); }}>
              Sign Out
            </button>
          </div>
        </div>
      </>
    );
  }

  const activeFields = mode === "login"
    ? LOGIN_FIELDS
    : role === "citizen" ? CITIZEN_FIELDS : AUTHORITY_FIELDS;

  /* layout: put lat/lng side-by-side */
  const renderFields = () => {
    const items = [];
    let i = 0;
    while (i < activeFields.length) {
      const f = activeFields[i];
      const next = activeFields[i + 1];

      if (f.key === "latitude" && next?.key === "longitude") {
        items.push(
          <div key="latlon" className="cp-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField field={f}    value={formData[f.key]    || ""} onChange={handleChange} error={errors[f.key]} />
            <FormField field={next} value={formData[next.key] || ""} onChange={handleChange} error={errors[next.key]} />
          </div>
        );
        i += 2;
      } else {
        items.push(
          <FormField key={f.key} field={f} value={formData[f.key] || ""} onChange={handleChange} error={errors[f.key]} />
        );
        i++;
      }
    }
    return items;
  };

  return (
    <>
      <GlobalStyles />
      <Toast toast={toast} />

      <div style={wrap}>
        {/* background orbs */}
        <div style={bg1} />
        <div style={bg2} />

        <div className="cp-card" style={card}>

          {/* ── Logo ── */}
          <div className="cp-fade-up" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#7C3AED,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 13, color: "#fff", flexShrink: 0 }}>CP</div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: "-0.3px" }}>CivicPulse</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", fontWeight: 600 }}>Urban Accountability Platform</div>
            </div>
          </div>

          {/* ── Mode toggle ── */}
          <div className="cp-mode-toggle cp-fade-up-1">
            {["login","signup"].map(m => (
              <button key={m} className={`cp-mode-btn${mode === m ? " active" : ""}`} onClick={() => switchMode(m)}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* ── Role selector (signup only) ── */}
          {mode === "signup" && (
            <div className="cp-fade-up-1" style={{ marginTop: 18 }}>
              <label className="cp-label" style={{ marginBottom: 8 }}>I am a</label>
              <div style={{ display: "flex", gap: 10 }}>
                <button className={`cp-role-btn${role === "citizen" ? " active" : ""}`} onClick={() => { setRole("citizen"); setData({}); setErrors({}); }}>
                  <span style={{ fontSize: 16 }}>👤</span> Citizen
                </button>
                <button className={`cp-role-btn${role === "authority" ? " active" : ""}`} onClick={() => { setRole("authority"); setData({}); setErrors({}); }}>
                  <span style={{ fontSize: 16 }}>🏛️</span> Authority
                </button>
              </div>
            </div>
          )}

          <div className="cp-divider" style={{ margin: "20px 0 0" }}>
            <span>
              {mode === "login"
                ? "SIGN IN TO YOUR ACCOUNT"
                : role === "citizen" ? "NEW CITIZEN ACCOUNT" : "AUTHORITY REGISTRATION"}
            </span>
          </div>

          {/* ── Form fields ── */}
          <div
            className="cp-scroll cp-fade-up-2"
            style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18, maxHeight: mode === "signup" && role === "authority" ? "44vh" : "auto", overflowY: mode === "signup" && role === "authority" ? "auto" : "visible", paddingRight: mode === "signup" && role === "authority" ? 4 : 0 }}
          >
            {renderFields()}
          </div>

          {/* ── Submit ── */}
          <div className="cp-fade-up-3" style={{ marginTop: 24 }}>
            <button className="cp-btn-primary" onClick={mode === "login" ? handleLogin : handleSignup} disabled={loading}>
              {loading
                ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><span className="cp-spinner" /> {mode === "login" ? "Signing in…" : "Creating account…"}</span>
                : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </div>

          {/* ── Switch link ── */}
          <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.32)", marginTop: 18 }}>
            {mode === "login" ? "Don't have an account? " : "Already registered? "}
            <button onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              style={{ background: "none", border: "none", color: "#A78BFA", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>

        </div>
      </div>
    </>
  );
}

/* ─── Layout styles ──────────────────────────────────────────────────────── */
const wrap = {
  minHeight: "100vh",
  background: "#030014",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px 16px",
  position: "relative",
  overflow: "hidden",
};

const bg1 = {
  position: "fixed", top: "10%", left: "30%",
  width: 480, height: 480, borderRadius: "50%",
  background: "radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)",
  animation: "glowPulse 5s ease-in-out infinite",
  pointerEvents: "none", zIndex: 0,
};
const bg2 = {
  position: "fixed", bottom: "5%", right: "20%",
  width: 360, height: 360, borderRadius: "50%",
  background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
  animation: "glowPulse 6s 1.5s ease-in-out infinite",
  pointerEvents: "none", zIndex: 0,
};

const card = {
  width: "100%",
  maxWidth: 480,
  background: "rgba(255,255,255,0.025)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 22,
  padding: "36px 32px",
  position: "relative",
  zIndex: 1,
  boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
};
