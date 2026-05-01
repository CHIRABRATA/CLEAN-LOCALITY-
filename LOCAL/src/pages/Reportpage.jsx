import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ═══════════════════════════════════════════════════════
   HAVERSINE DISTANCE (km)
═══════════════════════════════════════════════════════ */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #080810; color: #F0F0FF; font-family: 'DM Sans', sans-serif; }

    .ac-page { min-height: 100vh; background: #080810; }

    /* NAV */
    .ac-nav {
      position: sticky; top: 0; z-index: 100;
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 28px;
      background: rgba(8,8,16,0.85);
      border-bottom: 1px solid rgba(255,255,255,0.07);
      backdrop-filter: blur(20px);
    }
    .ac-nav-brand { display: flex; align-items: center; gap: 10px; }
    .ac-nav-logo {
      width: 34px; height: 34px; border-radius: 10px;
      background: linear-gradient(135deg,#7C3AED,#3B82F6);
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 13px; color: #fff;
    }
    .ac-nav-title { font-family: 'Syne',sans-serif; font-weight: 800; font-size: 17px; letter-spacing: -0.4px; }
    .ac-nav-subtitle { font-size: 10px; color: rgba(255,255,255,0.35); letter-spacing: 1px; text-transform: uppercase; }

    /* LOCATION BANNER */
    .ac-loc-banner {
      margin: 20px 28px;
      padding: 18px 22px;
      border-radius: 16px;
      border: 1px solid rgba(124,58,237,0.3);
      background: rgba(124,58,237,0.08);
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      animation: fadeIn 0.5s ease;
    }
    .ac-loc-banner.error { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.07); }
    .ac-loc-banner.success { border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.07); }

    /* TABS */
    .ac-tabs {
      display: flex; gap: 4px;
      margin: 0 28px 24px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px; padding: 5px;
    }
    .ac-tab {
      flex: 1; padding: 10px 8px; border: none;
      background: transparent; color: rgba(255,255,255,0.4);
      font-family: 'DM Sans',sans-serif; font-weight: 600; font-size: 13px;
      border-radius: 10px; cursor: pointer; transition: all 0.25s;
      display: flex; align-items: center; justify-content: center; gap: 7px;
    }
    .ac-tab.active {
      background: rgba(255,255,255,0.07);
      color: #fff;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
    }
    .ac-tab-badge {
      padding: 2px 7px; border-radius: 20px; font-size: 10px; font-weight: 700;
    }
    .ac-tab-badge.pending { background: rgba(251,191,36,0.2); color: #FBB724; }
    .ac-tab-badge.verify { background: rgba(59,130,246,0.2); color: #60A5FA; }
    .ac-tab-badge.solved { background: rgba(34,197,94,0.2); color: #4ADE80; }

    /* MAIN */
    .ac-main { max-width: 1000px; margin: 0 auto; padding: 0 28px 40px; }

    /* REPORT GRID */
    .ac-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }

    /* REPORT CARD */
    .ac-card {
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.07);
      background: rgba(255,255,255,0.02);
      overflow: hidden;
      transition: transform 0.2s, border-color 0.2s;
      animation: cardIn 0.4s ease both;
    }
    .ac-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.14); }

    @keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .ac-card-img {
      width: 100%; height: 180px; object-fit: cover;
      background: rgba(255,255,255,0.04);
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.2); font-size: 13px;
    }
    .ac-card-img img { width: 100%; height: 100%; object-fit: cover; }

    /* PRIORITY BADGE */
    .ac-priority {
      position: absolute; top: 10px; left: 10px;
      padding: 4px 10px; border-radius: 8px;
      font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
      backdrop-filter: blur(10px);
    }
    .ac-priority.high { background: rgba(239,68,68,0.85); color: #fff; }
    .ac-priority.mid { background: rgba(251,191,36,0.85); color: #000; }
    .ac-priority.low { background: rgba(100,116,139,0.85); color: #fff; }

    .ac-card-body { padding: 16px; }
    .ac-card-title { font-weight: 600; font-size: 15px; margin-bottom: 6px; line-height: 1.4; }
    .ac-card-desc { font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 12px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .ac-card-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
    .ac-votes {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 10px; border-radius: 8px;
      background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.25);
      font-size: 12px; font-weight: 700; color: #C4B5FD;
    }
    .ac-dist {
      font-size: 11px; color: rgba(255,255,255,0.35);
    }
    .ac-status-pill {
      padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
    }
    .ac-status-pill.pending { background: rgba(251,191,36,0.15); color: #FBB724; border: 1px solid rgba(251,191,36,0.25); }
    .ac-status-pill.verified { background: rgba(59,130,246,0.15); color: #60A5FA; border: 1px solid rgba(59,130,246,0.25); }
    .ac-status-pill.solved { background: rgba(34,197,94,0.15); color: #4ADE80; border: 1px solid rgba(34,197,94,0.25); }

    /* ACTION BUTTONS */
    .ac-card-actions { display: flex; gap: 8px; margin-top: 12px; }
    .ac-btn {
      flex: 1; padding: 9px 10px; border-radius: 10px;
      border: none; font-size: 12px; font-weight: 700;
      cursor: pointer; transition: all 0.2s;
    }
    .ac-btn-verify {
      background: rgba(59,130,246,0.15); color: #60A5FA;
      border: 1px solid rgba(59,130,246,0.25);
    }
    .ac-btn-verify:hover { background: rgba(59,130,246,0.25); }
    .ac-btn-solve {
      background: rgba(34,197,94,0.15); color: #4ADE80;
      border: 1px solid rgba(34,197,94,0.25);
    }
    .ac-btn-solve:hover { background: rgba(34,197,94,0.25); }
    .ac-btn-reopen {
      background: rgba(251,191,36,0.1); color: #FBB724;
      border: 1px solid rgba(251,191,36,0.2);
    }

    /* MODAL */
    .ac-modal-overlay {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .ac-modal {
      width: 100%; max-width: 440px;
      background: #12121e; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px; padding: 28px;
      animation: cardIn 0.3s ease;
    }
    .ac-modal-title { font-family: 'Syne',sans-serif; font-weight: 800; font-size: 20px; margin-bottom: 8px; }
    .ac-modal-sub { font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 20px; line-height: 1.5; }
    .ac-modal-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.3); margin-bottom: 8px; display: block; }
    .ac-modal-input {
      width: 100%; padding: 12px 14px; border-radius: 12px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      color: #fff; font-size: 14px; outline: none; margin-bottom: 16px;
      font-family: 'DM Sans',sans-serif;
    }
    .ac-modal-input:focus { border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.15); }
    .ac-modal-row { display: flex; gap: 10px; margin-top: 4px; }
    .ac-modal-btn-cancel {
      flex: 1; padding: 12px; border-radius: 12px;
      background: transparent; border: 1px solid rgba(255,255,255,0.12);
      color: rgba(255,255,255,0.6); font-weight: 700; cursor: pointer;
    }
    .ac-modal-btn-confirm {
      flex: 1; padding: 12px; border-radius: 12px;
      background: linear-gradient(135deg,#7C3AED,#3B82F6);
      border: none; color: #fff; font-weight: 700; cursor: pointer;
      font-family: 'DM Sans',sans-serif;
    }
    .ac-modal-btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
    .ac-modal-error {
      font-size: 12px;
      color: #f87171;
      margin: 2px 0 10px;
      line-height: 1.4;
    }
    .ac-thumb {
      width: 100%;
      height: 150px;
      border-radius: 12px;
      object-fit: cover;
      border: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 10px;
    }

    .ac-map-overlay {
      position: fixed;
      inset: 0;
      z-index: 300;
      background: rgba(0,0,0,0.75);
      display: flex;
      flex-direction: column;
    }
    .ac-map-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: rgba(8,8,16,0.92);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
    }
    .ac-map-wrap {
      position: relative;
      flex: 1;
    }
    .ac-map-wrap .leaflet-container {
      width: 100%;
      height: 100%;
    }
    .ac-map-stats {
      position: absolute;
      left: 14px;
      bottom: 14px;
      z-index: 500;
      background: rgba(8,8,16,0.85);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      padding: 10px 12px;
      font-size: 12px;
      line-height: 1.55;
      backdrop-filter: blur(10px);
    }

    /* EMPTY STATE */
    .ac-empty {
      grid-column: 1/-1; text-align: center; padding: 60px 20px;
      color: rgba(255,255,255,0.3); font-size: 15px;
    }
    .ac-empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.4; }

    /* LOADING */
    .ac-loading {
      grid-column: 1/-1; text-align: center; padding: 60px;
      color: rgba(255,255,255,0.3);
    }
    .ac-spinner {
      width: 32px; height: 32px; border-radius: 50%;
      border: 3px solid rgba(124,58,237,0.2);
      border-top-color: #7C3AED;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 12px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* SECTION HEADER */
    .ac-section-head {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px;
    }
    .ac-section-title { font-family: 'Syne',sans-serif; font-weight: 800; font-size: 22px; }
    .ac-section-count { font-size: 13px; color: rgba(255,255,255,0.35); }

    /* PROOF IMAGE */
    .ac-proof-img { width: 100%; height: 140px; object-fit: cover; border-radius: 10px; margin-top: 10px; border: 1px solid rgba(255,255,255,0.08); }

    /* LOGOUT BTN */
    .ac-logout {
      padding: 8px 14px; border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.1);
      background: transparent; color: rgba(255,255,255,0.6);
      font-weight: 600; font-size: 13px; cursor: pointer;
      transition: all 0.2s;
    }
    .ac-logout:hover { background: rgba(255,255,255,0.05); color: #fff; }

    /* LOCATION STATUS DOT */
    .ac-loc-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #4ADE80;
      box-shadow: 0 0 8px #4ADE80;
      animation: pulse 2s ease infinite;
      flex-shrink: 0;
    }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

    /* RELATIVE wrapper for card image */
    .ac-card-imgwrap { position: relative; }

    /* SOLVED BY INFO */
    .ac-solved-info {
      margin-top: 10px; padding: 10px 12px; border-radius: 10px;
      background: rgba(34,197,94,0.07); border: 1px solid rgba(34,197,94,0.15);
      font-size: 12px; color: rgba(255,255,255,0.6);
    }
    .ac-solved-info span { color: #4ADE80; font-weight: 600; }

    /* ═══════════════════════════════════════════════════════
       MOBILE RESPONSIVE
    ═══════════════════════════════════════════════════════ */
    @media (max-width: 768px) {
      /* NAV */
      .ac-nav {
        padding: 12px 16px;
      }
      .ac-nav-logo {
        width: 30px; height: 30px; font-size: 11px;
      }
      .ac-nav-title { font-size: 14px; }
      .ac-nav-subtitle { font-size: 8px; }

      /* LOCATION BANNER */
      .ac-loc-banner {
        margin: 12px 16px;
        padding: 14px 16px;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      /* TABS */
      .ac-tabs {
        margin: 0 16px 16px;
        padding: 3px;
        overflow-x: auto;
      }
      .ac-tab {
        padding: 8px 6px;
        font-size: 11px;
        white-space: nowrap;
        flex-shrink: 0;
      }

      /* MAIN */
      .ac-main {
        padding: 0 16px 30px;
      }

      /* REPORT GRID */
      .ac-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      /* REPORT CARD */
      .ac-card {
        border-radius: 16px;
      }
      .ac-card-img {
        height: 140px;
      }
      .ac-card-body {
        padding: 12px;
      }
      .ac-card-title {
        font-size: 13px;
      }
      .ac-card-desc {
        font-size: 12px;
      }

      /* PRIORITY BADGE */
      .ac-priority {
        padding: 3px 8px;
        font-size: 9px;
      }

      /* VOTES & META */
      .ac-votes {
        padding: 4px 8px;
        font-size: 11px;
      }
      .ac-dist {
        font-size: 10px;
      }
      .ac-status-pill {
        padding: 3px 8px;
        font-size: 10px;
      }

      /* ACTION BUTTONS */
      .ac-btn {
        padding: 8px 8px;
        font-size: 11px;
      }

      /* MODAL */
      .ac-modal {
        max-width: 90vw;
        padding: 20px 16px;
      }
      .ac-modal-title { font-size: 18px; }
      .ac-modal-sub { font-size: 12px; }

      /* SECTION HEADER */
      .ac-section-title { font-size: 18px; }

      /* LOGOUT BTN */
      .ac-logout {
        padding: 6px 12px;
        font-size: 12px;
      }
    }

    @media (max-width: 480px) {
      /* NAV */
      .ac-nav {
        padding: 10px 12px;
        flex-wrap: wrap;
      }
      .ac-nav-brand {
        gap: 8px;
      }
      .ac-nav-logo {
        width: 28px; height: 28px; font-size: 10px;
      }
      .ac-nav-title { font-size: 13px; }
      .ac-nav-subtitle { font-size: 7px; }

      /* LOCATION BANNER */
      .ac-loc-banner {
        margin: 10px 12px;
        padding: 10px 12px;
        font-size: 12px;
      }

      /* TABS */
      .ac-tabs {
        margin: 0 12px 12px;
      }
      .ac-tab {
        padding: 6px 4px;
        font-size: 10px;
        gap: 3px;
      }
      .ac-tab-badge {
        padding: 1px 4px;
        font-size: 8px;
      }

      /* MAIN */
      .ac-main {
        padding: 0 12px 20px;
      }

      /* REPORT CARD */
      .ac-card-img {
        height: 120px;
      }
      .ac-card-body {
        padding: 10px;
      }
      .ac-card-title {
        font-size: 12px;
        margin-bottom: 4px;
      }
      .ac-card-desc {
        font-size: 11px;
        margin-bottom: 8px;
      }

      /* MODAL */
      .ac-modal {
        padding: 16px 12px;
      }
      .ac-modal-title { font-size: 16px; }
      .ac-modal-label { font-size: 9px; }
      .ac-modal-input {
        padding: 10px 12px;
        font-size: 13px;
        margin-bottom: 12px;
      }

      /* SECTION HEADER */
      .ac-section-title { font-size: 16px; }
      .ac-section-count { font-size: 11px; }

      /* MAP TOPBAR */
      .ac-map-topbar {
        padding: 10px 12px;
      }

      .ac-logout {
        padding: 5px 10px;
        font-size: 11px;
      }
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════
   VERIFY MODAL
═══════════════════════════════════════════════════════ */
function VerifyModal({ post, authorityId, onClose, onVerified }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const validateFile = (selected) => new Promise((resolve, reject) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(selected.type)) return reject(new Error("Only JPG, PNG, WEBP are allowed"));
    if (selected.size > 5 * 1024 * 1024) return reject(new Error("Image must be <= 5MB"));
    const img = new Image();
    img.onload = () => {
      if (img.width < 800 || img.height < 600) reject(new Error("Minimum image resolution is 800x600"));
      else resolve();
    };
    img.onerror = () => reject(new Error("Invalid image file"));
    img.src = URL.createObjectURL(selected);
  });

  const onPick = async (evt) => {
    const selected = evt.target.files?.[0];
    if (!selected) return;
    setErrorMsg("");
    try {
      await validateFile(selected);
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    } catch (err) {
      setFile(null);
      setPreview("");
      setErrorMsg(err.message);
    }
  };

  const handleVerify = async () => {
    if (!file) {
      setErrorMsg("Attach at least one valid photo before verification");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      console.log("🔵 [VERIFY STEP 1] Starting verification...");
      console.log("   Authority ID:", authorityId);
      console.log("   Post ID:", post.id);
      
      const ts = new Date().toISOString();
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `authority/${authorityId}/${post.id}/${Date.now()}.${ext}`;
      
      console.log("🔵 [VERIFY STEP 2] Uploading image to storage...");
      console.log("   Path:", path);
      const { error: uploadErr } = await supabase.storage
        .from("post-images")
        .upload(path, file, {
          upsert: false,
          contentType: file.type,
          cacheControl: "3600",
          metadata: {
            authority_id: authorityId,
            post_id: post.id,
            verified_at: ts,
          },
        });
      if (uploadErr) {
        console.error("❌ [UPLOAD ERROR]", uploadErr);
        throw new Error(`Storage upload failed: ${uploadErr.message}`);
      }
      console.log("✅ [VERIFY STEP 2] Image uploaded successfully");
      
      const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
      const proofImage = urlData?.publicUrl || null;
      console.log("🔵 [VERIFY STEP 3] Updating posts table...");
      console.log("   Proof URL:", proofImage);
      console.log("   Data to update:", { status: "verified", proof_image_url: proofImage, solved_by: authorityId });
      
      const { error: verifyErr, data: updateData } = await supabase
        .from("posts")
        .update({
          status: "verified",
          proof_image_url: proofImage,
          solved_by: authorityId,
          solved_at: null,
        })
        .eq("id", post.id)
        .select();
      
      if (verifyErr) {
        console.error("❌ [RLS POLICY ERROR - THIS IS THE MAIN ISSUE]", verifyErr);
        console.error("   Error Code:", verifyErr.code);
        console.error("   Error Details:", JSON.stringify(verifyErr, null, 2));
        alert(`❌ RLS POLICY ERROR:\n\nCode: ${verifyErr.code}\n\nMessage: ${verifyErr.message}\n\nDetails: Check browser console (F12) for full error`);
        throw new Error(`RLS Policy violation: ${verifyErr.message}`);
      }
      console.log("✅ [VERIFY STEP 3] Posts table updated successfully");
      console.log("   Updated rows:", updateData);
      
      console.log("🔵 [VERIFY STEP 4] Inserting into verification_audit...");
      const { error: auditErr } = await supabase.from("verification_audit").insert({
        post_id: post.id,
        authority_id: authorityId,
        image_url: proofImage,
        action: "verified",
        created_at: ts,
      });
      if (auditErr) {
        console.warn("⚠️  [AUDIT TABLE WARNING] verification_audit insert failed:", auditErr.message);
      } else {
        console.log("✅ [VERIFY STEP 4] Audit log created");
      }
      
      console.log("✅ [ALL STEPS COMPLETE] Verification successful!");
      onVerified(post.id, proofImage, ts);
      onClose();
    } catch (err) {
      console.error("❌ [CATCH BLOCK] Error during verification:", err);
      console.error("   Stack:", err.stack);
      setErrorMsg(err.message || "Verification failed");
      alert(`❌ VERIFICATION ERROR:\n\n${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ac-modal-overlay" onClick={onClose}>
      <div className="ac-modal" onClick={e => e.stopPropagation()}>
        <div className="ac-modal-title">Verify Report</div>
        <div className="ac-modal-sub">
          Upload mandatory proof for:<br />
          <strong style={{ color: "#fff" }}>{post.description?.slice(0, 60) || "Report"}</strong>
        </div>
        {preview && <img src={preview} alt="preview" className="ac-thumb" />}
        <label className="ac-modal-label">Proof Image *</label>
        <input
          className="ac-modal-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPick}
        />
        {errorMsg && <div className="ac-modal-error">{errorMsg}</div>}
        <div className="ac-modal-row">
          <button className="ac-modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="ac-modal-btn-confirm" onClick={handleVerify} disabled={loading || !file}>
            {loading ? "Verifying..." : "Verify ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   LOCATION MODAL
═══════════════════════════════════════════════════════ */
function LocationModal({ onGranted, onDenied }) {
  return (
    <div className="ac-modal-overlay">
      <div className="ac-modal">
        <div style={{ fontSize: 36, marginBottom: 16, textAlign: "center" }}>📍</div>
        <div className="ac-modal-title" style={{ textAlign: "center" }}>Location Access Required</div>
        <div className="ac-modal-sub" style={{ textAlign: "center" }}>
          CivicPulse needs your location to show reports within your jurisdiction radius (5 km). 
          Your coordinates will be saved to your authority profile.
        </div>
        <div className="ac-modal-row">
          <button className="ac-modal-btn-cancel" onClick={onDenied}>Skip</button>
          <button className="ac-modal-btn-confirm" onClick={onGranted}>Allow Location →</button>
        </div>
      </div>
    </div>
  );
}

function ReportMapModal({ post, authorityLocation, onClose }) {
  const [routePoints, setRoutePoints] = useState([]);
  const [distanceKm, setDistanceKm] = useState(0);
  const [durationMin, setDurationMin] = useState(0);

  const start = useMemo(() => {
    if (!authorityLocation?.lat || !authorityLocation?.lon) return null;
    return [authorityLocation.lat, authorityLocation.lon];
  }, [authorityLocation]);
  const end = useMemo(() => {
    if (!post?.latitude || !post?.longitude) return null;
    return [post.latitude, post.longitude];
  }, [post]);

  useEffect(() => {
    if (!start || !end) return;
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        const route = data?.routes?.[0];
        if (route?.geometry?.coordinates?.length) {
          setRoutePoints(route.geometry.coordinates.map(([lon, lat]) => [lat, lon]));
          setDistanceKm(route.distance / 1000);
          setDurationMin(route.duration / 60);
          return;
        }
      } catch { void 0; }
      const fallbackKm = haversine(start[0], start[1], end[0], end[1]);
      setRoutePoints([start, end]);
      setDistanceKm(fallbackKm);
      setDurationMin((fallbackKm / 28) * 60);
    };
    fetchRoute();
  }, [start, end]);

  const openDirections = () => {
    if (!end) return;
    const originParam = start ? `&origin=${start[0]},${start[1]}` : "";
    const url = `https://www.google.com/maps/dir/?api=1&destination=${end[0]},${end[1]}${originParam}&travelmode=driving`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!end) return null;

  return (
    <div className="ac-map-overlay">
      <div className="ac-map-topbar">
        <div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Route to Report</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{post.address || "Location pinned by reporter"}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ac-modal-btn-confirm" style={{ padding: "8px 12px", fontSize: 12 }} onClick={openDirections}>Directions</button>
          <button className="ac-modal-btn-cancel" style={{ padding: "8px 12px", fontSize: 12 }} onClick={onClose}>Close</button>
        </div>
      </div>
      <div className="ac-map-wrap">
        <MapContainer center={end} zoom={14} style={{ width: "100%", height: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {start && <Marker position={start}><Popup>Authority Location</Popup></Marker>}
          <Marker position={end}><Popup>Report Location</Popup></Marker>
          {routePoints.length > 1 && <Polyline positions={routePoints} pathOptions={{ color: "#60A5FA", weight: 5 }} />}
        </MapContainer>
        <div className="ac-map-stats">
          <div><strong>Distance:</strong> {distanceKm >= 1 ? `${distanceKm.toFixed(2)} km` : `${Math.round(distanceKm * 1000)} m`}</div>
          <div><strong>ETA:</strong> {durationMin >= 60 ? `${Math.floor(durationMin / 60)}h ${Math.round(durationMin % 60)}m` : `${Math.max(1, Math.round(durationMin))} min`}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   REPORT CARD
═══════════════════════════════════════════════════════ */
function ReportCard({ post, rank, tab, onAction, onOpenMap, authLat, authLon }) {
  const dist = authLat && post.latitude
    ? haversine(authLat, authLon, post.latitude, post.longitude).toFixed(1)
    : null;

  const getPriority = (votes, idx) => {
    if (idx === 0) return "high";
    if (idx < 3) return "mid";
    return "low";
  };

  const priority = getPriority(post.votes, rank);

  return (
    <div className="ac-card" style={{ animationDelay: `${rank * 0.06}s`, cursor: "pointer" }} onClick={() => onOpenMap(post)}>
      <div className="ac-card-imgwrap">
        <div className="ac-card-img">
          {post.image_url
            ? <img src={post.image_url} alt="report" onError={e => { e.target.style.display = "none"; }} />
            : <span>No Image</span>
          }
        </div>
        {tab === "pending" && (
          <div className={`ac-priority ${priority}`}>
            {priority === "high" ? "🔴 HIGH" : priority === "mid" ? "🟡 MID" : "⚪ LOW"}
          </div>
        )}
      </div>

      <div className="ac-card-body">
        <div className="ac-card-title">
          {post.description?.slice(0, 55) || "Civic Report"}
          {post.description?.length > 55 ? "..." : ""}
        </div>
        {post.address && (
          <div className="ac-card-desc">📍 {post.address}</div>
        )}

        <div className="ac-card-meta">
          <div className="ac-votes">
            ▲ {post.votes ?? 0} votes
          </div>
          {dist && <div className="ac-dist">{dist} km away</div>}
          <div className={`ac-status-pill ${post.status}`}>{post.status}</div>
        </div>

        {/* PROOF for solved */}
        {post.proof_image_url && (
          <img src={post.proof_image_url} alt="proof" className="ac-proof-img" />
        )}

        {/* SOLVED INFO */}
        {post.status === "solved" && post.solved_at && (
          <div className="ac-solved-info">
            Resolved on <span>{new Date(post.solved_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        )}

        {/* ACTIONS */}
        {tab === "pending" && (
          <div className="ac-card-actions">
            <button className="ac-btn ac-btn-verify" onClick={(e) => { e.stopPropagation(); onAction("verify", post); }}>
              ✓ Verify
            </button>
          </div>
        )}
        {tab === "verify" && <div style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Verified with proof attached</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function ReportPage({ user }) {
  const [tab, setTab] = useState("pending");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authProfile, setAuthProfile] = useState(null);
  const [runtimeLoc, setRuntimeLoc] = useState(null);
  const [locState, setLocState] = useState("idle"); // idle | requesting | granted | denied
  const [verifyModal, setVerifyModal] = useState(null);
  const [mapPost, setMapPost] = useState(null);
  const [showLocModal, setShowLocModal] = useState(false);
  const [counts, setCounts] = useState({ pending: 0, verify: 0 });

  /* ── Load authority profile ── */
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("authorities")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error || !data) {
        setAuthProfile({ id: user.id, dept_id: "Department", radius: 5, lat: null, lon: null });
        setShowLocModal(true);
        return;
      }
      setAuthProfile(data);
      if (data.lat && data.lon) {
        setRuntimeLoc({ lat: data.lat, lon: data.lon });
        setLocState("granted");
      } else {
        setShowLocModal(true);
      }
    })();
  }, [user]);

  /* ── Request geolocation ── */
  const requestLocation = useCallback(async () => {
    setShowLocModal(false);
    setLocState("requesting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setRuntimeLoc({ lat, lon });
        setAuthProfile(prev => ({ ...(prev || { id: user.id, radius: 5 }), lat, lon, radius: (prev?.radius || 5) }));
        setLocState("granted");
        const { error } = await supabase
          .from("authorities")
          .update({ lat, lon, radius: 5 })
          .eq("id", user.id);
        if (error) {
          console.warn("authority location DB update failed:", error.message);
        }
      },
      () => setLocState("denied"),
      { timeout: 10000, enableHighAccuracy: false, maximumAge: 60000 }
    );
  }, [user]);

  /* ── Load posts filtered by distance ── */
  useEffect(() => {
    if (!authProfile) return;
    loadPosts();
  }, [authProfile, runtimeLoc, tab]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("posts")
        .select("*")
        .order("votes", { ascending: false });

      if (tab === "pending") query = query.ilike("status", "pending");
      else if (tab === "verify") query = query.ilike("status", "verified");

      const { data, error } = await query;
      if (error) throw error;

      // Filter by distance if location available
      let filtered = data || [];
      const activeLat = runtimeLoc?.lat ?? authProfile?.lat;
      const activeLon = runtimeLoc?.lon ?? authProfile?.lon;
      if (activeLat && activeLon) {
        const radius = authProfile.radius || 5;
        filtered = filtered.filter(p => {
          if (!p.latitude || !p.longitude) return true; // include if no coords
          return haversine(activeLat, activeLon, p.latitude, p.longitude) <= radius;
        });
      }

      setPosts(filtered);

      // Update counts
      const allRes = await supabase.from("posts").select("status");
      if (allRes.data) {
        const normalized = allRes.data.map(p => (p.status || "").toString().trim().toLowerCase());
        setCounts({
          pending: normalized.filter(s => s === "pending").length,
          verify: normalized.filter(s => s === "verified").length,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Actions ── */
  const handleAction = async (action, post) => {
    if (action === "verify") {
      setVerifyModal(post);
    }
  };

  const handleVerified = async (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    await loadPosts();
  };

  const tabConfig = [
    { key: "pending", label: "Pending", badge: "pending" },
    { key: "verify",  label: "Verified", badge: "verify" },
  ];

  const sectionTitles = {
    pending: "Priority Reports",
    verify: "Authority Verified",
  };

  const sectionSubtitles = {
    pending: "Sorted by highest votes · within 5 km radius",
    verify: "Marked as verified by your department with proof",
  };

  return (
    <div className="ac-page">
      <GlobalStyles />

      {/* LOCATION MODAL */}
      {showLocModal && (
        <LocationModal onGranted={requestLocation} onDenied={() => { setShowLocModal(false); setLocState("denied"); }} />
      )}

      {/* VERIFY MODAL */}
      {verifyModal && (
        <VerifyModal
          post={verifyModal}
          authorityId={user?.id}
          onClose={() => setVerifyModal(null)}
          onVerified={handleVerified}
        />
      )}
      {mapPost && (
        <ReportMapModal
          post={mapPost}
          authorityLocation={{ lat: (runtimeLoc?.lat ?? authProfile?.lat), lon: (runtimeLoc?.lon ?? authProfile?.lon) }}
          onClose={() => setMapPost(null)}
        />
      )}

      {/* NAV */}
      <nav className="ac-nav">
        <div className="ac-nav-brand">
          <div className="ac-nav-logo">CP</div>
          <div>
            <div className="ac-nav-title">Authority Console</div>
            <div className="ac-nav-subtitle">CivicPulse · {authProfile?.dept_id || "Department"}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {locState === "granted" && Number.isFinite(runtimeLoc?.lat ?? authProfile?.lat) && Number.isFinite(runtimeLoc?.lon ?? authProfile?.lon) && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              <div className="ac-loc-dot" />
              {Number(runtimeLoc?.lat ?? authProfile?.lat).toFixed(3)}, {Number(runtimeLoc?.lon ?? authProfile?.lon).toFixed(3)}
            </div>
          )}
          {locState === "denied" && (
            <button
              style={{ padding: "7px 12px", borderRadius: 9, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#F87171", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              onClick={requestLocation}
            >
              📍 Enable Location
            </button>
          )}
          <button
            className="ac-logout"
            onClick={async () => { await supabase.auth.signOut(); window.location.hash = "#/"; }}
          >
            Log Out
          </button>
        </div>
      </nav>

      <div className="ac-main">
        {/* LOCATION BANNER (requesting) */}
        {locState === "requesting" && (
          <div className="ac-loc-banner">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="ac-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Acquiring your location...</span>
            </div>
          </div>
        )}

        {/* TABS */}
        <div className="ac-tabs">
          {tabConfig.map(t => (
            <button
              key={t.key}
              className={`ac-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span className={`ac-tab-badge ${t.badge}`}>{counts[t.key] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* SECTION HEADER */}
        <div className="ac-section-head">
          <div>
            <div className="ac-section-title">{sectionTitles[tab]}</div>
            <div className="ac-section-count">{sectionSubtitles[tab]}</div>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            {posts.length} report{posts.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* GRID */}
        <div className="ac-grid">
          {loading ? (
            <div className="ac-loading">
              <div className="ac-spinner" />
              Loading reports...
            </div>
          ) : posts.length === 0 ? (
            <div className="ac-empty">
              <div className="ac-empty-icon">
                {tab === "pending" ? "📋" : "✅"}
              </div>
              No {tab} reports in your area
            </div>
          ) : (
            posts.map((post, i) => (
              <ReportCard
                key={post.id}
                post={post}
                rank={i}
                tab={tab}
                onAction={handleAction}
                onOpenMap={setMapPost}
                authLat={authProfile?.lat}
                authLon={authProfile?.lon}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});
