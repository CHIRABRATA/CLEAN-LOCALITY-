import React, { useState } from "react";
import bgImage from "../assets/IMAGE.jpg";
import { supabase } from "../supabaseClient";

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES  — all CSS lives here, zero external files
═══════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', sans-serif;
      background: #030014;
      color: #F0F0FF;
      min-height: 100vh;
    }

    /* ── Keyframes ── */
    @keyframes glowPulse {
      0%,100% { opacity: .35; transform: scale(1); }
      50%      { opacity: .7;  transform: scale(1.06); }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(22px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes shimmer {
      from { background-position: -200% center; }
      to   { background-position:  200% center; }
    }
    @keyframes borderSpin {
      to { transform: rotate(360deg); }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Page ── */
    .cp-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      position: relative;
      overflow: hidden;
    }

    /* ── Background ── */
    .cp-bg {
      position: fixed;
      inset: 0;
      z-index: 0;
      background-size: cover;
      background-position: center;
    }
    .cp-bg-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        rgba(3,0,20,.88) 0%,
        rgba(8,0,35,.82) 50%,
        rgba(3,0,20,.92) 100%
      );
    }
    /* noise grain texture */
    .cp-bg-overlay::after {
      content: '';
      position: absolute;
      inset: 0;
      opacity: .03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      background-size: 200px;
    }

    /* ── Glow orbs ── */
    .cp-orb {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      animation: glowPulse 6s ease-in-out infinite;
    }
    .cp-orb-1 {
      top: 8%; left: 20%;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(124,58,237,.18) 0%, transparent 70%);
    }
    .cp-orb-2 {
      bottom: 8%; right: 12%;
      width: 380px; height: 380px;
      background: radial-gradient(circle, rgba(59,130,246,.15) 0%, transparent 70%);
      animation-delay: 2s;
    }
    .cp-orb-3 {
      top: 50%; left: 50%; transform: translate(-50%,-50%);
      width: 260px; height: 260px;
      background: radial-gradient(circle, rgba(244,114,182,.07) 0%, transparent 70%);
      animation-delay: 1s; animation-duration: 8s;
    }

    /* ── Dot grid ── */
    .cp-grid {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px);
      background-size: 32px 32px;
      mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent);
      -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent);
    }

    /* ── Card ── */
    .cp-card {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 448px;
      background: rgba(8,4,28,.72);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border: 1px solid rgba(255,255,255,.09);
      border-radius: 28px;
      padding: 38px 36px 34px;
      box-shadow:
        0 0 0 1px rgba(124,58,237,.08),
        0 24px 60px rgba(0,0,0,.6),
        0 4px 16px rgba(0,0,0,.4);
      animation: fadeUp .55s cubic-bezier(.22,1,.36,1) both;
    }

    /* subtle top edge glow */
    .cp-card::before {
      content: '';
      position: absolute;
      top: 0; left: 10%; right: 10%;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(124,58,237,.55), rgba(59,130,246,.55), transparent);
      border-radius: 1px;
    }

    /* ── Logo ── */
    .cp-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 30px;
    }
    .cp-logo-mark {
      width: 44px; height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #7C3AED, #3B82F6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Syne', sans-serif;
      font-weight: 900;
      font-size: 14px;
      color: #fff;
      flex-shrink: 0;
      box-shadow: 0 6px 22px rgba(124,58,237,.45);
      position: relative;
      overflow: hidden;
    }
    .cp-logo-mark::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,.15), transparent);
    }
    .cp-logo-title {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 18px;
      color: #fff;
      letter-spacing: -.3px;
      line-height: 1.2;
    }
    .cp-logo-sub {
      font-size: 11px;
      color: rgba(255,255,255,.35);
      font-weight: 500;
      margin-top: 1px;
      letter-spacing: .1px;
    }

    /* ── Mode toggle ── */
    .cp-mode-toggle {
      display: flex;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.07);
      border-radius: 14px;
      padding: 4px;
      gap: 4px;
      margin-bottom: 22px;
    }
    .cp-mode-btn {
      flex: 1;
      border: none;
      padding: 10px 8px;
      background: transparent;
      color: rgba(255,255,255,.4);
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 10px;
      transition: background .22s, color .22s;
      letter-spacing: .1px;
    }
    .cp-mode-btn.active {
      background: rgba(124,58,237,.28);
      color: #C4B5FD;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
    }
    .cp-mode-btn:hover:not(.active) {
      background: rgba(255,255,255,.05);
      color: rgba(255,255,255,.7);
    }

    /* ── Role selector ── */
    .cp-role-row {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      animation: slideDown .3s ease both;
    }
    .cp-role-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 11px 8px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,.09);
      background: rgba(255,255,255,.03);
      color: rgba(255,255,255,.45);
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all .22s;
    }
    .cp-role-btn.active {
      background: rgba(124,58,237,.2);
      border-color: rgba(124,58,237,.6);
      color: #C4B5FD;
      box-shadow: 0 0 0 3px rgba(124,58,237,.1), inset 0 1px 0 rgba(255,255,255,.05);
    }
    .cp-role-btn:hover:not(.active) {
      border-color: rgba(255,255,255,.2);
      color: rgba(255,255,255,.75);
      background: rgba(255,255,255,.05);
    }
    .cp-role-icon { font-size: 15px; }

    /* ── Divider ── */
    .cp-divider {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 2px 0 20px;
    }
    .cp-divider::before, .cp-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255,255,255,.07);
    }
    .cp-divider span {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.3px;
      text-transform: uppercase;
      color: rgba(255,255,255,.22);
      white-space: nowrap;
    }

    /* ── Form fields ── */
    .cp-field { margin-bottom: 14px; }

    .cp-label {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255,255,255,.45);
      margin-bottom: 6px;
    }
    .cp-label-req { color: rgba(248,113,113,.7); }

    .cp-input {
      width: 100%;
      padding: 11px 14px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,.09);
      background: rgba(255,255,255,.05);
      color: #F0F0FF;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color .2s, background .2s, box-shadow .2s;
    }
    .cp-input::placeholder { color: rgba(255,255,255,.22); }
    .cp-input:focus {
      border-color: rgba(124,58,237,.7);
      background: rgba(124,58,237,.07);
      box-shadow: 0 0 0 3px rgba(124,58,237,.16);
    }
    .cp-input:hover:not(:focus) {
      border-color: rgba(255,255,255,.16);
    }

    /* ── Signup form scroll area ── */
    .cp-form-body {
      max-height: 44vh;
      overflow-y: auto;
      padding-right: 3px;
      margin-right: -3px;
    }
    .cp-form-body::-webkit-scrollbar { width: 3px; }
    .cp-form-body::-webkit-scrollbar-track { background: transparent; }
    .cp-form-body::-webkit-scrollbar-thumb {
      background: rgba(124,58,237,.4);
      border-radius: 10px;
    }

    /* ── Primary button ── */
    .cp-btn-primary {
      width: 100%;
      padding: 13px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 40%, #3B82F6 100%);
      background-size: 200% 100%;
      color: #fff;
      font-family: 'Syne', sans-serif;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 10px;
      position: relative;
      overflow: hidden;
      transition: transform .2s, box-shadow .2s;
      box-shadow: 0 8px 28px rgba(124,58,237,.38);
      letter-spacing: .2px;
    }
    .cp-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 40px rgba(124,58,237,.52);
    }
    .cp-btn-primary:active { transform: translateY(0); }
    /* shimmer sweep */
    .cp-btn-primary::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255,255,255,.13) 50%,
        transparent 100%
      );
      background-size: 200% 100%;
      animation: shimmer 2.8s ease-in-out infinite;
    }

    /* ── Switch link ── */
    .cp-switch {
      text-align: center;
      font-size: 13px;
      color: rgba(255,255,255,.3);
      margin-top: 18px;
    }
    .cp-switch-btn {
      background: none;
      border: none;
      color: #A78BFA;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: color .2s;
      padding: 0;
    }
    .cp-switch-btn:hover { color: #C4B5FD; }

    /* ── Floating badge ── */
    .cp-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba(124,58,237,.12);
      border: 1px solid rgba(124,58,237,.28);
      border-radius: 20px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #A78BFA;
      margin-bottom: 20px;
    }
    .cp-badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #A78BFA;
      box-shadow: 0 0 6px #A78BFA;
      animation: glowPulse 2s infinite;
    }

    /* ── Responsive ── */
    @media (max-width: 480px) {
      .cp-card {
        padding: 28px 20px 24px;
        border-radius: 22px;
      }
      .cp-orb-1 { width: 260px; height: 260px; }
      .cp-orb-2 { width: 200px; height: 200px; }
      .cp-form-body { max-height: 38vh; }
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function Login() {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("citizen");

 const [form, setForm] = useState({
  id: "",
  name: "",
  phone: "",
  address: "",
  password: "",
  authCode: ""
});
  const handleChange = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
  };

 const handleSubmit = async () => {

  if(mode === "signup"){

    if(role === "citizen"){
      if (!form.name || !form.phone || !form.address || !form.password) {
  alert("Please fill all required fields");
  return;
}

      const { data, error } = await supabase
      .from("citizens")
      .insert([
        {
          name: form.name,
          phone: form.phone,
          address: form.address,
          password: form.password
        }
      ]);

      if(error){
        console.log(error);
        alert("Signup failed");
      }else{
        alert("Citizen account created");
      }

    }
     if(!form.id || !form.name || !form.phone || !form.address || !form.password){
    alert("Please fill all required fields");
    return;
  }
const AUTH_CODE = "AUTH-6500-VB";
    if(role === "authority"){
  if(form.authCode !== AUTH_CODE ){
    alert("Invalid Authority Access Code");
    return;
  }
 
  

      const { data, error } = await supabase
      .from("authorities")
      .insert([
        {
          id: form.id,
          name: form.name,
          phone: form.phone,
          address: form.address,
          password: form.password,
          verification_status: false
        }
      ]);

      if(error){
        console.log(error);
        alert("Authority signup failed");
      }else{
        alert("Authority account submitted for verification");
      }

    }

  }

  if(mode === "login"){

    const { data: citizen } = await supabase
    .from("citizens")
    .select("*")
    .eq("phone", form.id)
    .eq("password", form.password)
    .single();

    if(citizen){
      alert("Citizen Login Successful");
      console.log(citizen);
      return;
    }

    const { data: authority } = await supabase
    .from("authorities")
    .select("*")
    .eq("id", form.id)
    .eq("password", form.password)
    .single();

    if(authority != null){
      alert("Authority Login Successful");
      console.log(authority);
      return;
    }

    alert("Invalid login credentials");

  }

};

  const switchMode = (m) => {
    setMode(m);
    setForm({ id: "", name: "", phone: "", address: "", password: "", authCode: "" });
  };

  return (
    <div className="cp-page">
      <GlobalStyles />

      {/* ── Background ── */}
      <div className="cp-bg" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="cp-bg-overlay" />
        <div className="cp-grid" />
        <div className="cp-orb cp-orb-1" />
        <div className="cp-orb cp-orb-2" />
        <div className="cp-orb cp-orb-3" />
      </div>

      {/* ── Card ── */}
      <div className="cp-card">

        {/* Logo */}
        <div className="cp-logo">
          <div className="cp-logo-mark">CP</div>
          <div>
            <div className="cp-logo-title">CivicPulse</div>
            <div className="cp-logo-sub">Decentralized Urban Governance</div>
          </div>
        </div>

        {/* Live badge */}
        <div className="cp-badge">
          <span className="cp-badge-dot" />
          Active in 14 cities
        </div>

        {/* Mode toggle */}
        <div className="cp-mode-toggle">
          <button
            className={`cp-mode-btn${mode === "login" ? " active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Sign In
          </button>
          <button
            className={`cp-mode-btn${mode === "signup" ? " active" : ""}`}
            onClick={() => switchMode("signup")}
          >
            Create Account
          </button>
        </div>

        {/* Role selector — signup only */}
        {mode === "signup" && (
          <div className="cp-role-row">
            <button
              className={`cp-role-btn${role === "citizen" ? " active" : ""}`}
              onClick={() => setRole("citizen")}
            >
              <span className="cp-role-icon">👤</span> Citizen
            </button>
            <button
              className={`cp-role-btn${role === "authority" ? " active" : ""}`}
              onClick={() => setRole("authority")}
            >
              <span className="cp-role-icon">🏛️</span> Authority
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="cp-divider">
          <span>
            {mode === "login"
              ? "Enter your credentials"
              : role === "citizen"
              ? "New citizen account"
              : "Authority registration"}
          </span>
        </div>

        {/* ── Login fields ── */}
        {mode === "login" && (
          <>
            <div className="cp-field">
              <label className="cp-label">
                User ID / Phone <span className="cp-label-req">*</span>
              </label>
              <input
                className="cp-input"
                placeholder="Your ID or phone number"
                value={form.id}
                onChange={e => handleChange("id", e.target.value)}
              />
            </div>

            <div className="cp-field">
              <label className="cp-label">
                Password <span className="cp-label-req">*</span>
              </label>
              <input
                type="password"
                className="cp-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => handleChange("password", e.target.value)}
              />
            </div>
          </>
        )}

        {/* ── Signup fields ── */}
        {mode === "signup" && (
          <div className="cp-form-body">

{role === "authority" && (
  <>
    <div className="cp-field">
      <label className="cp-label">
        Authority ID <span className="cp-label-req">*</span>
      </label>
      <input
        className="cp-input"
        placeholder="AUTH-2026-XXX"
        value={form.id}
        onChange={e => handleChange("id", e.target.value)}
      />
    </div>

    <div className="cp-field">
      <label className="cp-label">
        Authority Access Code <span className="cp-label-req">*</span>
      </label>
      <input
        className="cp-input"
        placeholder="Enter Authority Access Code"
        value={form.authCode}
        onChange={e => handleChange("authCode", e.target.value)}
      />
    </div>
  </>
)}

<div className="cp-field">
  <label className="cp-label">
    Full Name <span className="cp-label-req">*</span>
  </label>
  <input
    className="cp-input"
    placeholder="Your full name"
    value={form.name}
    onChange={e => handleChange("name", e.target.value)}
  />
</div>

<div className="cp-field">
  <label className="cp-label">
    Phone <span className="cp-label-req">*</span>
  </label>

              <input
                className="cp-input"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={e => handleChange("phone", e.target.value)}
              />
            </div>

            <div className="cp-field">
              <label className="cp-label">
                Address <span className="cp-label-req">*</span>
              </label>
              <input
                className="cp-input"
                placeholder="Ward / locality / area"
                value={form.address}
                onChange={e => handleChange("address", e.target.value)}
              />
            </div>

            <div className="cp-field">
              <label className="cp-label">
                Password <span className="cp-label-req">*</span>
              </label>
              <input
                type="password"
                className="cp-input"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => handleChange("password", e.target.value)}
              />
            </div>

          </div>
        )}

        {/* Submit */}
        <button className="cp-btn-primary" onClick={handleSubmit}>
          {mode === "login" ? "Access Dashboard →" : "Create Account →"}
        </button>

        {/* Switch link */}
        <p className="cp-switch">
          {mode === "login" ? "Don't have an account? " : "Already registered? "}
          <button
            className="cp-switch-btn"
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>

      </div>
    </div>
  );
}