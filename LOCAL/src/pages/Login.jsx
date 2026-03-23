import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import bgImage from "../assets/IMAGE.jpg";

/* ═══════════════════════════════════════════════════════
    GLOBAL CSS ENGINE
═══════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { 
      margin: 0; padding: 0; width: 100%; height: 100%; 
      overflow: hidden; font-family: 'DM Sans', sans-serif;
      background: #02000d; color: #F0F0FF;
    }
    .cp-page { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; perspective: 1200px; overflow: hidden; }
    .cp-bg-base { position: absolute; inset: 0; background-image: url(${bgImage}); background-size: cover; background-position: center; z-index: 0; filter: brightness(0.3) saturate(1.2); }
    .cp-bg-overlay { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(3,0,20,0.4), #02000d); z-index: 1; }
    .cp-grid { position: absolute; inset: -100%; background-image: linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px); background-size: 60px 60px; transform: rotateX(60deg) translateY(-100px); animation: gridMove 30s linear infinite; z-index: 2; pointer-events: none; }
    @keyframes gridMove { from { background-position: 0 0; } to { background-position: 0 60px; } }
    .cp-orb { position: absolute; border-radius: 50%; filter: blur(100px); animation: orbFloat 15s ease-in-out infinite; z-index: 3; pointer-events: none; }
    .cp-orb-1 { top: 5%; left: 10%; width: 500px; height: 500px; background: rgba(124, 58, 237, 0.15); }
    .cp-orb-2 { bottom: 5%; right: 5%; width: 450px; height: 450px; background: rgba(59, 130, 246, 0.12); animation-delay: -7s; }
    .cp-card { position: relative; z-index: 10; max-width: 440px; width: 90%; background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(40px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 32px; padding: 40px; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.8); animation: cardEnter 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
    @keyframes cardEnter { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .cp-logo { display: flex; align-items: center; gap: 14px; margin-bottom: 30px; }
    .cp-logo-mark { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #7C3AED, #3B82F6); display: flex; align-items: center; justify-content: center; font-weight: 900; color: #fff; box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4); }
    .cp-logo-title { font-family: 'Syne'; font-weight: 800; font-size: 22px; letter-spacing: -0.5px; }
    .cp-mode-toggle { display: flex; background: rgba(255, 255, 255, 0.04); border-radius: 14px; padding: 4px; gap: 4px; margin-bottom: 24px; }
    .cp-mode-btn { flex: 1; border: none; padding: 10px; background: transparent; color: rgba(255, 255, 255, 0.4); font-weight: 700; cursor: pointer; border-radius: 10px; transition: 0.3s; }
    .cp-mode-btn.active { background: rgba(255, 255, 255, 0.08); color: #fff; }
    .cp-role-row { display: flex; gap: 10px; margin-bottom: 20px; }
    .cp-role-btn { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(255, 255, 255, 0.03); color: rgba(255, 255, 255, 0.4); cursor: pointer; font-weight: 600; transition: 0.3s; }
    .cp-role-btn.active { background: rgba(124, 58, 237, 0.15); border-color: #7C3AED; color: #C4B5FD; }
    .cp-field { margin-bottom: 16px; animation: slideUp 0.5s ease forwards; opacity: 0; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .cp-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255, 255, 255, 0.3); margin-bottom: 8px; display: block; }
    .cp-input { width: 100%; padding: 14px 16px; border-radius: 14px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: white; outline: none; transition: 0.3s; font-size: 14px; }
    .cp-input:focus { border-color: #7C3AED; background: rgba(124, 58, 237, 0.08); box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.15); }
    .cp-btn-primary { width: 100%; padding: 16px; border: none; border-radius: 16px; background: linear-gradient(135deg, #7C3AED, #3B82F6); color: white; font-family: 'Syne'; font-weight: 800; cursor: pointer; margin-top: 10px; transition: 0.4s; box-shadow: 0 10px 25px rgba(124, 58, 237, 0.3); }
    .cp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .cp-scroll { max-height: 320px; overflow-y: auto; padding-right: 10px; }
    .cp-scroll::-webkit-scrollbar { width: 4px; }
    .cp-scroll::-webkit-scrollbar-thumb { background: rgba(124, 58, 237, 0.4); border-radius: 10px; }
  `}</style>
);

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("citizen");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", phone: "", address: "", password: "", authCode: "" });

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

const handleSubmit = async (e) => {
  if (e) e.preventDefault();
  setLoading(true);

  try {
    if (mode === "signup") {
      // 1. Validations
      if (role === "authority" && form.authCode !== "AUTH-6500-VB") throw new Error("Invalid Auth Code.");
      if (form.password.length < 8) throw new Error("Password must be 8+ characters.");
      if (!form.phone || !form.name) throw new Error("Phone and Name are required.");

      const email = role === "citizen"
        ? `${form.phone}@civicpulse.com`
        : `${form.id}@authority.com`;

      // 2. Step One: Auth Signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: { data: { full_name: form.name, user_role: role } }
      });
      if (authError) throw new Error(`AUTH: ${authError.message}`);
      if (!authData?.user) throw new Error("No user returned from signUp");
      console.log("Auth user created:", authData.user.id);
      console.log("Session:", authData.session);
      const userId = authData.user.id;
      if (role === "citizen") {
        const { error: dbError } = await supabase
          .from("citizens")
          .insert({
            id: userId,
            name: form.name,
            phone: form.phone,
            address: form.address
          });
        if (dbError) throw new Error(`DB: ${dbError.code} — ${dbError.message} — ${dbError.details}`);
      } else {
        const { error: dbError } = await supabase
          .from("authorities")
          .insert({
            id: userId,
            dept_id: form.id,
            name: form.name,
            phone: form.phone,
            address: form.address,
            verification_status: false
          });
        if (dbError) throw new Error(`DB: ${dbError.code} — ${dbError.message} — ${dbError.details}`);
      }

      alert("Account Created! Please Sign In.");
      setMode("login");

    } else {
      // 4. Login Logic
      const loginEmail = form.id.includes("@") 
        ? form.id 
        : role === "citizen" 
          ? `${form.id}@civicpulse.com` 
          : `${form.id}@authority.com`;

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: form.password,
      });

      if (loginError) throw loginError;
      window.location.hash = "#/feed";
    }
  } catch (err) {
    console.error("Auth System Error:", err);
    // If you see 'duplicate key value violates unique constraint', 
    // it means that phone number is already taken.
    alert(err.message || "An unexpected error occurred.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="cp-page">
      <GlobalStyles />
      <div className="cp-bg-base" />
      <div className="cp-bg-overlay" />
      <div className="cp-grid" />
      <div className="cp-orb cp-orb-1" />
      <div className="cp-orb cp-orb-2" />

      <div className="cp-card">
        <header className="cp-logo">
          <div className="cp-logo-mark">CP</div>
          <div>
            <div className="cp-logo-title">CivicPulse</div>
            <div style={{ fontSize: "10px", opacity: 0.4, letterSpacing: "1px" }}>ACCOUNTABILITY SYSTEM</div>
          </div>
        </header>

        <div className="cp-mode-toggle">
          <button className={`cp-mode-btn ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Sign In</button>
          <button className={`cp-mode-btn ${mode === "signup" ? "active" : ""}`} onClick={() => setMode("signup")}>Register</button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="cp-role-row">
              <button type="button" className={`cp-role-btn ${role === "citizen" ? "active" : ""}`} onClick={() => setRole("citizen")}>👤 Citizen</button>
              <button type="button" className={`cp-role-btn ${role === "authority" ? "active" : ""}`} onClick={() => setRole("authority")}>🏛 Authority</button>
            </div>
          )}

          <div className="cp-scroll" key={mode + role}>
            {mode === "login" ? (
              <>
                <div className="cp-field" style={{ animationDelay: "0.1s" }}>
                  <label className="cp-label">Phone or ID</label>
                  <input className="cp-input" placeholder="Enter credentials" required onChange={e => handleChange("id", e.target.value)} />
                </div>
                <div className="cp-field" style={{ animationDelay: "0.2s" }}>
                  <label className="cp-label">Password</label>
                  <input type="password" className="cp-input" placeholder="••••••••" required onChange={e => handleChange("password", e.target.value)} />
                </div>
              </>
            ) : (
              <>
                {role === "authority" && (
                  <div className="cp-field" style={{ animationDelay: "0.1s" }}>
                    <label className="cp-label">Dept ID</label>
                    <input className="cp-input" placeholder="DEPT-123" required onChange={e => handleChange("id", e.target.value)} />
                  </div>
                )}
                {role === "authority" && (
                  <div className="cp-field" style={{ animationDelay: "0.12s" }}>
                    <label className="cp-label">Access Code</label>
                    <input className="cp-input" placeholder="AUTH-XXXX" required onChange={e => handleChange("authCode", e.target.value)} />
                  </div>
                )}
                <div className="cp-field" style={{ animationDelay: "0.15s" }}>
                  <label className="cp-label">Full Name</label>
                  <input className="cp-input" placeholder="John Doe" required onChange={e => handleChange("name", e.target.value)} />
                </div>
                <div className="cp-field" style={{ animationDelay: "0.2s" }}>
                  <label className="cp-label">Contact No.</label>
                  <input className="cp-input" placeholder="+91..." required onChange={e => handleChange("phone", e.target.value)} />
                </div>
                <div className="cp-field" style={{ animationDelay: "0.25s" }}>
                  <label className="cp-label">Address / Ward</label>
                  <input className="cp-input" placeholder="Locality details" required onChange={e => handleChange("address", e.target.value)} />
                </div>
                <div className="cp-field" style={{ animationDelay: "0.3s" }}>
                  <label className="cp-label">Password (8+ chars)</label>
                  <input type="password" className="cp-input" placeholder="••••••••" required onChange={e => handleChange("password", e.target.value)} />
                </div>
              </>
            )}
          </div>

          <button type="submit" className="cp-btn-primary" disabled={loading}>
            {loading ? "Processing..." : (mode === "login" ? "Access Feed →" : "Create Account →")}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
          {mode === "login" ? "New here? " : "Already registered? "}
          <span style={{ color: "#7C3AED", fontWeight: "700", cursor: "pointer" }} onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Join now" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}
