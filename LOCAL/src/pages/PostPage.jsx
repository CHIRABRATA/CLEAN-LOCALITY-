import React, { useState, useRef, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "../supabaseClient";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const pulseIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;width:32px;height:32px;border-radius:50%;background:rgba(59,130,246,0.25);animation:mapPulse 1.8s ease-out infinite;"></div><div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid #fff;box-shadow:0 2px 10px rgba(59,130,246,0.6);position:relative;z-index:1;"></div></div>`,
  iconSize: [32, 32], iconAnchor: [16, 16],
});
const userIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;width:24px;height:24px;border-radius:50%;background:rgba(16,185,129,0.3);animation:mapPulse 2s ease-out infinite;"></div><div style="width:12px;height:12px;border-radius:50%;background:#10B981;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(16,185,129,0.7);position:relative;z-index:1;"></div></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12],
});




function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo(coords, 16, { duration: 1.3 }); }, [coords, map]);
  return null;
}

function DraggableMarker({ position, setPosition, onLocationPicked }) {
  const markerRef = useRef(null);
  const map = useMap();
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      onLocationPicked({ lat, lng, address: data.display_name || "Unknown location" });
    } catch { onLocationPicked({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }); }
  }, [onLocationPicked]);
  useEffect(() => {
    const onClick = (e) => { const { lat, lng } = e.latlng; setPosition([lat, lng]); reverseGeocode(lat, lng); };
    map.on("click", onClick);
    return () => map.off("click", onClick);
  }, [map, setPosition, reverseGeocode]);
  return position ? (
    <Marker draggable position={position} icon={pulseIcon} ref={markerRef}
      eventHandlers={{ dragend() { const m = markerRef.current; if (m) { const { lat, lng } = m.getLatLng(); setPosition([lat, lng]); reverseGeocode(lat, lng); } } }}
    />
  ) : null;
}

function MapPicker({ setLocation }) {
  const DEFAULT = [22.5726, 88.3639];
  const [markerPos, setMarkerPos] = useState(null);
  const [flyCoords, setFlyCoords] = useState(null);
  const [locating, setLocating] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const reverseGeocode = async (lat, lng) => {
    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      setLocation({ lat, lng, address: data.display_name || "Unknown location" });
    } catch { setLocation({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }); }
    finally { setGeocoding(false); }
  };
  const locateUser = () => {
    if (!navigator.geolocation) { setGpsError(true); setLocating(false); return; }
    setLocating(true); setGpsError(false);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { const pos = [coords.latitude, coords.longitude]; setMarkerPos(pos); setFlyCoords(pos); setLocating(false); reverseGeocode(coords.latitude, coords.longitude); },
      () => { setGpsError(true); setLocating(false); },
      { timeout: 10000, enableHighAccuracy: false, maximumAge: 60000 }
    );
  };
  useEffect(() => { locateUser(); }, []);
  const handleLocationPicked = useCallback(({ lat, lng, address }) => { setLocation({ lat, lng, address }); }, [setLocation]);
  return (
    <div style={{ position: "relative", borderRadius: "18px", overflow: "hidden" }}>
      {locating && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1000, background: "rgba(8,8,15,.8)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: "18px" }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", border: "3px solid rgba(255,255,255,.1)", borderTopColor: "#3B82F6", animation: "spin .8s linear infinite" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.65)", fontWeight: 600 }}>Getting your location…</span>
        </div>
      )}
      <MapContainer center={DEFAULT} zoom={13} style={{ height: "260px", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {flyCoords && <FlyTo coords={flyCoords} />}
        <DraggableMarker position={markerPos} setPosition={setMarkerPos} onLocationPicked={handleLocationPicked} />
      </MapContainer>
      <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", zIndex: 999, background: "rgba(0,0,0,.72)", backdropFilter: "blur(8px)", color: "#fff", padding: "5px 14px", borderRadius: "20px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", border: "1px solid rgba(255,255,255,.1)", pointerEvents: "none" }}>
        {geocoding ? "⟳ Fetching address…" : gpsError ? "📍 Tap map to set location" : "📍 Tap map or drag pin to adjust"}
      </div>
      <button onClick={locateUser} disabled={locating} style={{ position: "absolute", top: 10, right: 10, zIndex: 999, width: 36, height: 36, borderRadius: "10px", background: "#3B82F6", border: "none", cursor: "pointer", color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(59,130,246,.5)" }}>
        {locating ? "⟳" : "⌖"}
      </button>
    </div>
  );
}

// ── LEAFLET ICON HELPERS ───────────────────────────────────────────────────────
const makePin = (color) => L.divIcon({
  className: "",
  html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:22px;height:22px;">
    <div style="position:absolute;width:22px;height:22px;border-radius:50%;background:${color};opacity:.22;animation:mapPulse 2s ease-out infinite;"></div>
    <div style="width:11px;height:11px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 8px ${color}99;position:relative;z-index:1;"></div>
  </div>`,
  iconSize: [22, 22], iconAnchor: [11, 11],
});
const redPin   = makePin("#EF4444");
const greenPin = makePin("#10B981");

// ── COMMUNITY MAP (Leaflet) ────────────────────────────────────────────────────
function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    // Force Leaflet to recalculate its size after the container renders
    setTimeout(() => { map.invalidateSize(); }, 120);
  }, [map]);
  return null;
}

function CommunityHeatmap({ posts, userLocation }) {
  const DEFAULT = [22.5726, 88.3639];
  const center  = userLocation || DEFAULT;
  const pending = posts.filter(p => p.latitude && p.longitude && p.status === "pending");
  const solved  = posts.filter(p => p.latitude && p.longitude && p.status === "solved");

  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", height: 240 }}>
      {/* Leaflet CSS height fix — must be explicit px, not % */}
      <style>{`
        .community-map { height: 240px !important; width: 100% !important; }
        .community-map .leaflet-control-attribution { display: none !important; }
        .community-map .leaflet-control-zoom a {
          background: rgba(10,10,20,.85) !important;
          color: #fff !important;
          border-color: rgba(255,255,255,.15) !important;
          border-radius: 7px !important;
        }
        @keyframes mapPulse {
          0%   { transform: scale(.8); opacity: .8; }
          70%  { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(.8); opacity: 0; }
        }
      `}</style>

      <MapContainer
        className="community-map"
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "240px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapInvalidator />

        {/* User location */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup><b>📍 You are here</b></Popup>
          </Marker>
        )}

        {/* Pending (red) */}
        {pending.map(p => (
          <Marker key={p.id} position={[p.latitude, p.longitude]} icon={redPin}>
            <Popup>
              <div style={{ maxWidth: 180 }}>
                <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 4 }}>⚠️ Active Issue</div>
                <div style={{ fontSize: 12, color: "#333" }}>{p.description?.slice(0, 80)}</div>
                <div style={{ fontSize: 10, color: "#999", marginTop: 4 }}>📍 {p.address?.split(",")[0]}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Solved (green) */}
        {solved.map(p => (
          <Marker key={p.id} position={[p.latitude, p.longitude]} icon={greenPin}>
            <Popup>
              <div style={{ maxWidth: 180 }}>
                <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 4, color: "#10B981" }}>✅ Resolved</div>
                <div style={{ fontSize: 12, color: "#333" }}>{p.description?.slice(0, 80)}</div>
                <div style={{ fontSize: 10, color: "#999", marginTop: 4 }}>📍 {p.address?.split(",")[0]}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend overlay */}
      <div style={{ position: "absolute", bottom: 10, left: 10, zIndex: 999, display: "flex", gap: 6, pointerEvents: "none" }}>
        {[["#EF4444", `${pending.length} Active`], ["#10B981", `${solved.length} Solved`], ["#10B981", "You", true]].map(([color, label, glow], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(0,0,0,.72)", backdropFilter: "blur(8px)", padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, color: "#fff", border: "1px solid rgba(255,255,255,.12)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: glow ? `0 0 6px ${color}` : "none" }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ACHIEVEMENTS PANEL ─────────────────────────────────────────────────────────
const ALL_ACHIEVEMENTS = [
  { id: "first",    icon: "🌱", label: "First Report",    desc: "Filed your first issue",        req: c => c >= 1  },
  { id: "three",    icon: "🔥", label: "On a Roll",       desc: "3 reports filed",               req: c => c >= 3  },
  { id: "five",     icon: "⭐", label: "Star Reporter",   desc: "5 reports filed",               req: c => c >= 5  },
  { id: "ten",      icon: "🏆", label: "Champion",        desc: "10 reports — legend",           req: c => c >= 10 },
  { id: "solver",   icon: "✅", label: "Problem Solver",  desc: "Confirmed a fix",               req: (c, s) => s >= 1 },
  { id: "veteran",  icon: "💎", label: "Veteran",         desc: "20 reports — city hero",        req: c => c >= 20 },
];

function AchievementsPanel({ reportCount, solvedCount }) {
  return (
    <div className="achievements-panel">
      <div className="panel-hdr">
        <span style={{ fontSize: 18 }}>🏅</span>
        <div>
          <div className="panel-title">Achievements</div>
          <div className="panel-sub">{ALL_ACHIEVEMENTS.filter(a => a.req(reportCount, solvedCount)).length}/{ALL_ACHIEVEMENTS.length} unlocked</div>
        </div>
      </div>
      <div className="achievements-grid">
        {ALL_ACHIEVEMENTS.map(a => {
          const unlocked = a.req(reportCount, solvedCount);
          return (
            <div key={a.id} className={`achievement-item ${unlocked ? "unlocked" : "locked"}`} title={a.desc}>
              <div className="ach-icon">{unlocked ? a.icon : "🔒"}</div>
              <div className="ach-label">{a.label}</div>
              {unlocked && <div className="ach-glow" />}
            </div>
          );
        })}
      </div>
      <div className="xp-bar-wrap">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--txt3)" }}>XP Progress</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--accent)" }}>{reportCount * 10} XP</span>
        </div>
        <div className="xp-track">
          <div className="xp-fill" style={{ width: `${Math.min((reportCount % 10) * 10, 100)}%` }} />
        </div>
        <div style={{ fontSize: 10, color: "var(--txt3)", marginTop: 4, fontWeight: 600 }}>
          {10 - (reportCount % 10)} more reports to next level
        </div>
      </div>
    </div>
  );
}

// ── LEADERBOARD ────────────────────────────────────────────────────────────────
const MEDALS = ["🥇", "🥈", "🥉"];
function Leaderboard({ data, expanded, onToggle, currentUserId }) {
  const visible = expanded ? data : data.slice(0, 3);
  return (
    <div className="side-panel">
      <div className="panel-hdr">
        <span style={{ fontSize: 18 }}>🏆</span>
        <div>
          <div className="panel-title">Top Contributors</div>
          <div className="panel-sub">This month</div>
        </div>
        {data.length > 3 && (
          <button className="toggle-btn" onClick={onToggle}>{expanded ? "▲" : "▼"}</button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
        {data.length === 0 ? (
          <div style={{ textAlign: "center", padding: "16px 0", color: "var(--txt3)", fontSize: 12, fontWeight: 600 }}>No reports yet 🌟</div>
        ) : visible.map((entry, i) => {
          const isMe = entry.user_id === currentUserId;
          return (
            <div key={entry.user_id} className={`lb-row ${isMe ? "lb-me" : ""}`}>
              <span style={{ fontSize: 16, width: 24, textAlign: "center", flexShrink: 0 }}>{i < 3 ? MEDALS[i] : `${i + 1}.`}</span>
              <div className="lb-avatar">{(entry.name || "?")[0].toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "var(--txt)", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.name || "Anon"}</span>
                  {isMe && <span style={{ fontSize: 9, fontWeight: 800, color: "var(--accent)", background: "var(--as)", padding: "1px 5px", borderRadius: 8, flexShrink: 0 }}>You</span>}
                </div>
              </div>
              <span style={{ fontWeight: 800, fontSize: 13, color: "var(--txt)", flexShrink: 0 }}>{entry.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Spinner({ size = 18 }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", border: `2.5px solid rgba(255,255,255,.25)`, borderTopColor: "#fff", animation: "spin .7s linear infinite", flexShrink: 0 }} />;
}
function Toast({ message, type }) {
  return (
    <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: type === "error" ? "#EF4444" : "#10B981", color: "#fff", padding: "10px 22px", borderRadius: "14px", fontSize: 13, fontWeight: 700, zIndex: 9999, boxShadow: "0 8px 24px rgba(0,0,0,.3)", animation: "toastIn .3s cubic-bezier(.34,1.56,.64,1)", whiteSpace: "nowrap" }}>
      {message}
    </div>
  );
}
function DeleteDialog({ onConfirm, onCancel, loading }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(14px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--mcard)", border: "1px solid var(--border-s)", borderRadius: 24, padding: "28px 24px", maxWidth: 320, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 38, marginBottom: 12 }}>🗑️</div>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 8, color: "var(--txt)" }}>Delete Report?</h3>
        <p style={{ fontSize: 13, color: "var(--txt2)", marginBottom: 24, lineHeight: 1.5 }}>This will permanently remove your report and image.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 12, borderRadius: 13, border: "1px solid var(--border-s)", background: "var(--surface)", color: "var(--txt)", fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: 12, borderRadius: 13, border: "none", background: "#EF4444", color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: "'DM Sans',sans-serif", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? .6 : 1 }}>
            {loading && <Spinner size={15} />}{loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button onClick={toggleTheme} style={{ background: "var(--surface)", border: "1px solid var(--border-s)", borderRadius: 50, padding: 3, cursor: "pointer", display: "flex" }} aria-label="Toggle theme">
      <span style={{ width: 44, height: 24, background: "var(--tag)", borderRadius: 50, display: "flex", alignItems: "center", padding: "0 3px" }}>
        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, boxShadow: "0 2px 8px var(--ag)", transition: "transform .35s cubic-bezier(.34,1.56,.64,1)", transform: theme === "dark" ? "translateX(20px)" : "translateX(0)" }}>
          {theme === "dark" ? "🌙" : "☀️"}
        </span>
      </span>
    </button>
  );
}

// ── VERIFIED SECTION ───────────────────────────────────────────────────────────
function VerifiedSection({ posts, currentUserId, onApprove, approvingId }) {
  const verifiedPosts = posts.filter(p => p.status === "verified");
  if (verifiedPosts.length === 0) return null;
  return (
    <section className="feed-section verified-feed-section">
      {/* Section label */}
      <div className="section-label verified-label">
        <div className="section-label-dot verified-dot" />
        <span>Authority Verified — Awaiting Citizen Confirmation</span>
        <div className="section-label-count">{verifiedPosts.length}</div>
      </div>
      <div className="cards-stack">
        {verifiedPosts.map((post, i) => {
          const isOwner = post.user_id === currentUserId;
          const isApproving = approvingId === post.id;
          return (
            <div key={post.id} className="report-card verified-card" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="card-inner">
                {/* Image */}
                {post.image && (
                  <div className="card-img-wrap">
                    <img src={post.image} alt="issue" className="card-img" />
                    <div className="card-img-overlay" />
                    <span className="card-img-badge verified-badge-pill">✓ Verified</span>
                  </div>
                )}
                <div className="card-content">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    {isOwner && <span className="owner-tag">Your Report</span>}
                    <span style={{ fontSize: 11, color: "var(--txt3)", fontWeight: 600 }}>{post.time}</span>
                  </div>
                  <p className="card-desc">{post.description}</p>
                  <div className="card-loc">📍 {post.address?.split(",").slice(0, 2).join(",")}</div>

                  {/* Proof image */}
                  {post.proof_image_url && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(16,185,129,.7)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5 }}>Authority Proof</div>
                      <img src={post.proof_image_url} alt="proof" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(16,185,129,.25)" }} />
                    </div>
                  )}

                  {/* Stepper */}
                  <div className="stepper">
                    <div className="step done"><div className="step-dot done" /><div className="step-lbl">Reported</div></div>
                    <div className="step-line done" />
                    <div className="step done"><div className="step-dot done" /><div className="step-lbl">Authority<br />Verified</div></div>
                    <div className="step-line pending" />
                    <div className={`step ${isOwner ? "active" : "pending"}`}><div className={`step-dot ${isOwner ? "active" : "pending"}`} /><div className="step-lbl">Citizen<br />Confirms</div></div>
                  </div>

                  {isOwner ? (
                    <button className="approve-btn" onClick={() => onApprove(post)} disabled={isApproving}>
                      {isApproving ? <><div className="btn-spin" />Confirming…</> : <>✅ Yes, it's fixed!</>}
                    </button>
                  ) : (
                    <div className="waiting-chip">⏳ Waiting for reporter to confirm</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── PENDING FEED SECTION ───────────────────────────────────────────────────────
function PendingSection({ posts, votedIds, onVote, onDelete, userId, loading }) {
  const statusColors = { pending: "#F59E0B", verified: "#3B82F6", solved: "#10B981", rejected: "#EF4444" };
  return (
    <section className="feed-section pending-feed-section">
      <div className="section-label pending-label">
        <div className="section-label-dot pending-dot" />
        <span>Active Community Reports</span>
        <div className="section-label-count pending-count">{posts.length}</div>
      </div>

      {loading && [1, 2].map(i => (
        <div key={i} className="report-card" style={{ padding: 18, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div className="skeleton" style={{ width: 70, height: 20, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 40, height: 16, borderRadius: 8 }} />
          </div>
          <div className="skeleton" style={{ width: "80%", height: 14, marginBottom: 8, borderRadius: 8 }} />
          <div className="skeleton" style={{ width: "100%", height: 180, borderRadius: 14 }} />
        </div>
      ))}

      {!loading && posts.length === 0 && (
        <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--txt3)" }}>
          <div style={{ fontSize: 44, marginBottom: 12, opacity: .5 }}>📭</div>
          <p style={{ fontSize: 14, fontWeight: 600 }}>No active reports. Tap 📸 to be first!</p>
        </div>
      )}

      <div className="cards-stack">
        {!loading && posts.map((post, i) => (
          <div key={post.id} className="report-card" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="card-inner">
              {post.image && (
                <div className="card-img-wrap">
                  <img src={post.image} alt="Issue" className="card-img" loading="lazy" />
                  <div className="card-img-overlay" />
                  {post.status && (
                    <span className="card-img-badge" style={{ background: `${statusColors[post.status] || "#888"}22`, color: statusColors[post.status] || "#888", border: `1px solid ${statusColors[post.status] || "#888"}44` }}>
                      {post.status}
                    </span>
                  )}
                </div>
              )}
              <div className="card-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#3B82F6", textTransform: "uppercase", letterSpacing: ".8px" }}>Report</span>
                  <span style={{ fontSize: 11, color: "var(--txt3)", fontWeight: 600 }}>{post.time}</span>
                </div>
                <p className="card-desc">{post.description}</p>
                <div className="card-loc">📍 {post.address}</div>
                <div className="card-actions">
                  <button className={`vote-btn ${votedIds.has(post.id) ? "voted" : ""}`} onClick={() => onVote(post.id)}>
                    <span>❤️</span> {post.votes}
                  </button>
                  <button className="share-btn-sm">↗ Share</button>
                  {userId && post.user_id === userId && (
                    <button className="del-btn" onClick={() => onDelete(post)}>🗑️</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
export default function PostPage({ user }) {
  const [theme, setTheme]               = useState("dark");
  const [step, setStep]                 = useState("feed");
  const [selectedImg, setSelectedImg]   = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [location, setLocation]         = useState({ lat: null, lng: null, address: "" });
  const [description, setDescription]   = useState("");
  const [showMap, setShowMap]           = useState(false);
  const [posts, setPosts]               = useState([]);
  const [feedLoading, setFeedLoading]   = useState(true);
  const [votedIds, setVotedIds]         = useState(new Set());
  const [publishing, setPublishing]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast]               = useState(null);
  const [approvingId, setApprovingId]   = useState(null);
  const [leaderboard, setLeaderboard]   = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [lbExpanded, setLbExpanded]     = useState(false);
  const [activeTab, setActiveTab]       = useState("feed"); // "feed" | "map" | "achievements"

  const fileInputRef = useRef(null);

  const showToast = (msg, type = "success") => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3200); };
  const formatTime = (ts) => {
    if (!ts) return "Just now";
    const d = (Date.now() - new Date(ts)) / 1000;
    if (d < 60) return "Just now";
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
  };

  const fetchPosts = async () => {
    setFeedLoading(true);
    try {
      const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setPosts(data.map(p => ({
        status: (p.status || "pending").toString().trim().toLowerCase(),
        id: p.id, description: p.description, address: p.address,
        image: p.image_url, proof_image_url: p.proof_image_url,
        solved_by: p.solved_by, solved_at: p.solved_at,
        votes: p.votes || 0, time: formatTime(p.created_at),
        user_id: p.user_id, latitude: p.latitude, longitude: p.longitude,
      })));
      if (user?.id) {
        const { data: vd } = await supabase.from("votes").select("post_id").eq("user_id", user.id);
        if (vd) setVotedIds(new Set(vd.map(v => v.post_id)));
      }
    } catch (err) { showToast("Failed to load posts", "error"); }
    finally { setFeedLoading(false); }
  };

  const fetchLeaderboard = async () => {
  try {
    // 1. Get all posts and count them by user_id
    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select("user_id")
      .not("user_id", "is", null);

    if (postsError) throw postsError;

    const counts = {};
    postsData.forEach(post => {
      const uid = post.user_id;
      if (!counts[uid]) {
        counts[uid] = { 
          user_id: uid, 
          name: "Anonymous", // Default fallback
          count: 0 
        };
      }
      counts[uid].count++;
    });

    const userIds = Object.keys(counts);

    if (userIds.length > 0) {
      // 2. Fetch the names from the 'citizens' table
      const { data: citizens, error: citizensError } = await supabase
        .from("citizens")
        .select("id, name")
        .in("id", userIds);

      if (citizensError) {
        console.error("Error fetching names:", citizensError);
      } else if (citizens) {
        // 3. Map the names back to our counts object
        citizens.forEach(citizen => {
          if (counts[citizen.id]) {
            // Only update if name actually exists in DB
            counts[citizen.id].name = citizen.name || "Anonymous";
          }
        });
      }
    }

    // 4. Convert object to sorted array and update state
    const sortedLeaderboard = Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
      
    setLeaderboard(sortedLeaderboard);
  } catch (err) {
    console.error("Leaderboard error:", err.message);
  }
};

  useEffect(() => {
    fetchPosts();
    fetchLeaderboard();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setUserLocation([coords.latitude, coords.longitude]),
        () => {},
        { timeout: 10000, enableHighAccuracy: false, maximumAge: 60000 }
      );
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file); setSelectedImg(URL.createObjectURL(file));
    setStep("upload"); setShowMap(false);
    setLocation({ lat: null, lng: null, address: "" }); setDescription("");
    e.target.value = "";
  };

  const uploadImage = async (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("post-images").upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type || "image/jpeg" });
    if (uploadErr) throw new Error(`Storage: ${uploadErr.message}`);
    const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handlePost = async () => {
    if (!description.trim()) return showToast("Add a description", "error");
    if (!location.address) return showToast("Pin a location on the map", "error");
    if (!user?.id) return showToast("Log in required", "error");
    if (!selectedFile) return showToast("No image selected", "error");
    setPublishing(true);
    try {
      console.log("🔵 [POST CREATION STEP 1] User uploading image...");
      console.log("   User ID:", user.id);
      console.log("   File:", selectedFile.name);
      let imageUrl;
      try { 
        imageUrl = await uploadImage(selectedFile);
        console.log("✅ [POST CREATION STEP 1] Image uploaded successfully");
        console.log("   Image URL:", imageUrl);
      }
      catch (e) {
        console.error("❌ [IMAGE UPLOAD ERROR]", e.message);
        showToast(e.message || "Upload failed", "error");
        setPublishing(false);
        return;
      }
      
      console.log("🔵 [POST CREATION STEP 2] Inserting post into database...");
      console.log("   Data:", { user_id: user.id, description, address: location.address, lat: location.lat, lng: location.lng });
      const { data, error } = await supabase.from("posts")
        .insert({ user_id: user.id, description, image_url: imageUrl, address: location.address, latitude: location.lat ?? null, longitude: location.lng ?? null, status: "pending", votes: 0 })
        .select().single();
      
      if (error) {
        console.error("❌ [RLS POLICY ERROR - POST INSERT]", error);
        console.error("   Error Code:", error.code);
        console.error("   Error Details:", JSON.stringify(error, null, 2));
        alert(`❌ RLS POLICY ERROR (Post Insert):\n\nCode: ${error.code}\n\nMessage: ${error.message}\n\nDetails: Check browser console (F12)`);
        throw new Error(`DB: ${error.message}`);
      }
      console.log("✅ [POST CREATION STEP 2] Post inserted successfully");
      console.log("   Post ID:", data.id);
      
      setPosts(prev => [{ id: data.id, description: data.description, address: data.address, image: data.image_url, votes: 0, time: "Just now", status: "pending", user_id: data.user_id, latitude: data.latitude, longitude: data.longitude }, ...prev]);
      setStep("feed"); setSelectedImg(null); setSelectedFile(null); setDescription(""); setLocation({ lat: null, lng: null, address: "" }); setShowMap(false);
      console.log("✅ [POST CREATION COMPLETE] Report published successfully! ✅");
      showToast("Report published! ✅");
      fetchLeaderboard();
    } catch (err) {
      console.error("❌ [POST CREATION ERROR]", err.message);
      showToast(err.message || "Failed to publish.", "error");
    }
    finally { setPublishing(false); }
  };

  const handleVote = async (postId) => {
    if (!user?.id) return showToast("Log in to vote", "error");
    if (votedIds.has(postId)) return;

    console.log("🔵 [VOTE STEP 1] User clicking vote on post:", postId);
    
    // Optimistic UI immediately
    setVotedIds(prev => new Set([...prev, postId]));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, votes: (p.votes || 0) + 1 } : p));

    try {
      // Step 1: insert vote row
      console.log("🔵 [VOTE STEP 2] Inserting vote record...");
      const { error: insertErr, data: insertData } = await supabase
        .from("votes")
        .insert({ post_id: postId, user_id: user.id, count: 1 });

      if (insertErr) {
        const msg = insertErr.message?.toLowerCase() || "";
        // Duplicate vote — already voted, ignore silently
        if (msg.includes("duplicate") || msg.includes("unique") || insertErr.code === "23505") {
          console.log("⚠️  Already voted — ignoring duplicate");
        } else {
          // Real error — roll back optimistic update
          console.error("❌ Vote insert error:", insertErr);
          alert(`❌ VOTE ERROR:\n\nMessage: ${insertErr.message}`);
          setVotedIds(prev => { const s = new Set(prev); s.delete(postId); return s; });
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, votes: Math.max(0, (p.votes || 1) - 1) } : p));
          showToast(`Vote failed: ${insertErr.message}`, "error");
          return;
        }
      }
      console.log("✅ [VOTE STEP 2] Vote record inserted");

      // Step 2: get accurate count from DB
      console.log("🔵 [VOTE STEP 3] Fetching vote count...");
      const { count, error: countErr } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      if (countErr) {
        console.error("❌ Vote count error:", countErr);
        // Keep optimistic count but log the error
      } else {
        console.log("✅ [VOTE STEP 3] Vote count fetched:", count);
      }

      if (typeof count === "number") {
        // Step 3: Update posts table votes column with ACCURATE count
        console.log("🔵 [VOTE STEP 4] Updating posts table with vote count:", count);
        const { error: updateErr, data: updateData } = await supabase
          .from("posts")
          .update({ votes: count })
          .eq("id", postId)
          .select("id, votes");

        if (updateErr) {
          console.error("❌ Vote update posts error:", updateErr);
          alert(`❌ VOTE UPDATE ERROR:\n\nMessage: ${updateErr.message}`);
        } else {
          console.log("✅ [VOTE STEP 4] Posts table updated with vote count:", updateData);
          // Update UI with real count from DB
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, votes: count } : p));
        }
      }

      console.log("✅ [VOTE COMPLETE] Vote recorded successfully!");
      
    } catch (err) {
      console.error("❌ handleVote unexpected error:", err);
      alert(`❌ UNEXPECTED ERROR:\n\n${err.message}`);
      showToast("Vote failed — check console", "error");
      // Rollback
      setVotedIds(prev => { const s = new Set(prev); s.delete(postId); return s; });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, votes: Math.max(0, (p.votes || 1) - 1) } : p));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const pathMatch = (deleteTarget.image || "").match(/post-images\/(.+)$/);
      if (pathMatch) await supabase.storage.from("post-images").remove([pathMatch[1]]);
      await supabase.from("votes").delete().eq("post_id", deleteTarget.id);
      const { error } = await supabase.from("posts").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== deleteTarget.id));
      showToast("Report deleted"); fetchLeaderboard();
    } catch { showToast("Delete failed.", "error"); }
    finally { setDeleteLoading(false); setDeleteTarget(null); }
  };

  const handleCitizenApprove = async (post) => {
    if (!user?.id) return showToast("Log in required", "error");
    if (post.user_id !== user.id) return showToast("Only the original reporter can confirm", "error");
    if (post.status?.toLowerCase() !== "verified") return showToast("Report must be authority-verified first", "error");
    setApprovingId(post.id);
    try {
      console.log("🔵 [CITIZEN APPROVE STEP 1] User confirming solved status...");
      console.log("   User ID:", user.id);
      console.log("   Post ID:", post.id);
      console.log("   Current Status:", post.status);
      
      const ts = new Date().toISOString();
      console.log("🔵 [CITIZEN APPROVE STEP 2] Updating posts table with solved status...");
      const { data: updatedRows, error } = await supabase
        .from("posts")
        .update({ status: "solved", solved_at: ts })
        .eq("id", post.id)
        .eq("user_id", user.id)
        .select("id, status");
      
      if (error) {
        console.error("❌ [RLS POLICY ERROR - CITIZEN APPROVAL]", error);
        console.error("   Error Code:", error.code);
        console.error("   Error Details:", JSON.stringify(error, null, 2));
        alert(`❌ RLS POLICY ERROR (Citizen Approve):\n\nCode: ${error.code}\n\nMessage: ${error.message}\n\nDetails: Check browser console (F12)`);
        throw error;
      }
      console.log("✅ [CITIZEN APPROVE STEP 2] Posts table updated");
      console.log("   Updated rows:", updatedRows);
      if (!updatedRows || updatedRows.length === 0) {
        console.error("❌ [UPDATE FAILED] No rows were updated. RLS policy may be blocking this user.");
        throw new Error("Update failed — check your Supabase RLS UPDATE policy.");
      }
      console.log("✅ [CITIZEN APPROVE COMPLETE] Issue marked as solved!");
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: "solved", solved_at: ts } : p));
      showToast("🎉 Issue confirmed solved! Thank you.");
    } catch (err) {
      console.error("❌ [CITIZEN APPROVE ERROR]", err.message);
      showToast(err.message || "Approval failed", "error");
    }
    finally { setApprovingId(null); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.hash = "#/"; };

  // Derived
  const feedPosts    = posts.filter(p => p.status === "pending");
  const verifiedPosts = posts.filter(p => p.status === "verified");
  const myReports    = posts.filter(p => p.user_id === user?.id);
  const mySolved     = posts.filter(p => p.user_id === user?.id && p.status === "solved");
  const myRank       = leaderboard.findIndex(e => e.user_id === user?.id);
  const canPublish   = description.trim() && location.address && !publishing;

  return (
    <div className={`cp-root ${theme}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .cp-root.dark{
          --bg:#07080d;--bg2:#0e0f16;--surface:rgba(255,255,255,.038);--surface-h:rgba(255,255,255,.065);
          --border:rgba(255,255,255,.07);--border-s:rgba(255,255,255,.12);
          --txt:#eeeef5;--txt2:rgba(238,238,245,.5);--txt3:rgba(238,238,245,.25);
          --accent:#4F8EF7;--ag:rgba(79,142,247,.28);--as:rgba(79,142,247,.1);
          --danger:#EF4444;--ds:rgba(239,68,68,.13);
          --nav:rgba(7,8,13,.88);--shadow:0 20px 50px rgba(0,0,0,.6);
          --mbg:rgba(0,0,0,.9);--mcard:#0e0f16;--tag:rgba(255,255,255,.06);
          --scroll:rgba(255,255,255,.07);--green:#10B981;--green-bg:rgba(16,185,129,.1);
          --green-border:rgba(16,185,129,.25);--verified-bg:rgba(16,185,129,.06);
          --pending-bg:rgba(245,158,11,.06);
        }
        .cp-root.light{
          --bg:#f2f4f9;--bg2:#fff;--surface:rgba(255,255,255,.92);--surface-h:#fff;
          --border:rgba(0,0,0,.07);--border-s:rgba(0,0,0,.12);
          --txt:#0d0e18;--txt2:rgba(13,14,24,.55);--txt3:rgba(13,14,24,.3);
          --accent:#2563EB;--ag:rgba(37,99,235,.18);--as:rgba(37,99,235,.08);
          --danger:#DC2626;--ds:rgba(220,38,38,.1);
          --nav:rgba(242,244,249,.92);--shadow:0 8px 30px rgba(0,0,0,.07);
          --mbg:rgba(0,0,0,.5);--mcard:#fff;--tag:rgba(0,0,0,.05);
          --scroll:rgba(0,0,0,.1);--green:#059669;--green-bg:rgba(5,150,105,.08);
          --green-border:rgba(5,150,105,.2);--verified-bg:rgba(5,150,105,.04);
          --pending-bg:rgba(217,119,6,.04);
        }

        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes cardIn{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes sheetUp{from{transform:translateY(100%);opacity:.4}to{transform:none;opacity:1}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes heartPop{0%,100%{transform:scale(1)}50%{transform:scale(1.7)}}
        @keyframes mapPulse{0%{transform:scale(.8);opacity:.8}70%{transform:scale(2.2);opacity:0}100%{transform:scale(.8);opacity:0}}
        @keyframes glowPulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.8;transform:scale(1.04)}}
        @keyframes unlockPop{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}

        .cp-root{background:var(--bg);min-height:100vh;color:var(--txt);font-family:'DM Sans',sans-serif;overflow-x:hidden;transition:background .35s,color .35s;}

        /* NAV */
        .cp-nav{display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:var(--nav);backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:600;}
        .cp-logo{display:flex;align-items:center;gap:9px;}
        .cp-logo-badge{width:30px;height:30px;border-radius:9px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 4px 14px var(--ag);}
        .cp-logo-txt{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;letter-spacing:-.5px;}
        .cp-nav-r{display:flex;align-items:center;gap:8px;}
        .logout-btn{padding:6px 13px;background:var(--surface);border:1px solid var(--border-s);border-radius:9px;color:var(--txt2);font-size:12px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:.2s;}
        .logout-btn:hover{border-color:var(--danger);color:var(--danger);}

        /* LAYOUT */
        .cp-layout{display:flex;max-width:1100px;margin:0 auto;padding:24px 14px 100px;gap:22px;align-items:flex-start;}
        
        /* SIDEBAR */
        .cp-sidebar{width:260px;flex-shrink:0;display:flex;flex-direction:column;gap:16px;position:sticky;top:68px;}
        
        /* MAIN FEED */
        .cp-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:0;}

        /* STAT BAR */
        .stat-bar{display:flex;gap:10px;margin-bottom:20px;}
        .stat-chip{flex:1;background:var(--surface);border:1px solid var(--border-s);border-radius:14px;padding:12px 14px;text-align:center;}
        .stat-chip-val{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:var(--txt);display:block;}
        .stat-chip-lbl{font-size:10px;color:var(--txt3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:2px;}

        /* SECTION LABELS */
        .section-label{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;font-size:12px;font-weight:800;margin-bottom:12px;letter-spacing:.2px;}
        .section-label-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
        .section-label-count{margin-left:auto;font-size:11px;font-weight:800;padding:2px 8px;border-radius:20px;}
        
        .verified-label{background:var(--verified-bg);border:1px solid var(--green-border);color:var(--green);}
        .verified-dot{background:var(--green);box-shadow:0 0 8px rgba(16,185,129,.6);}
        .verified-label .section-label-count{background:var(--green-bg);color:var(--green);}
        
        .pending-label{background:var(--pending-bg);border:1px solid rgba(245,158,11,.2);color:#F59E0B;}
        .pending-dot{background:#F59E0B;box-shadow:0 0 8px rgba(245,158,11,.6);}
        .pending-label .pending-count{background:rgba(245,158,11,.12);color:#F59E0B;}

        /* FEED SECTION */
        .feed-section{margin-bottom:28px;}
        .verified-feed-section{background:var(--verified-bg);border:1.5px solid var(--green-border);border-radius:20px;padding:14px;}
        .pending-feed-section{}
        .cards-stack{display:flex;flex-direction:column;gap:14px;}

        /* REPORT CARD */
        .report-card{background:var(--surface);border:1px solid var(--border);border-radius:18px;overflow:hidden;animation:cardIn .4s cubic-bezier(.16,1,.3,1) both;transition:transform .25s,box-shadow .25s,border-color .2s;}
        .report-card:hover{transform:translateY(-2px);box-shadow:var(--shadow);border-color:var(--border-s);}
        .verified-card{border-color:var(--green-border) !important;background:var(--surface) !important;}
        .verified-card:hover{border-color:var(--green) !important;}
        .card-inner{display:flex;gap:0;flex-direction:column;}
        .card-img-wrap{position:relative;overflow:hidden;}
        .card-img{width:100%;height:200px;object-fit:cover;display:block;transition:transform .5s;}
        .report-card:hover .card-img{transform:scale(1.03);}
        .card-img-overlay{position:absolute;bottom:0;left:0;right:0;height:60px;background:linear-gradient(to top,rgba(0,0,0,.45),transparent);pointer-events:none;}
        .card-img-badge{position:absolute;top:10px;left:10px;font-size:10px;font-weight:800;padding:3px 9px;border-radius:20px;backdrop-filter:blur(8px);}
        .verified-badge-pill{background:rgba(16,185,129,.2);color:#10B981;border:1px solid rgba(16,185,129,.4);}
        .card-content{padding:14px 16px 16px;}
        .card-desc{font-size:14px;font-weight:600;line-height:1.5;margin-bottom:8px;color:var(--txt);}
        .card-loc{font-size:11px;color:var(--accent);font-weight:700;background:var(--as);padding:4px 10px;border-radius:20px;display:inline-block;margin-bottom:10px;}
        .card-actions{display:flex;align-items:center;gap:7px;padding-top:10px;border-top:1px solid var(--border);}
        .vote-btn{display:flex;align-items:center;gap:6px;padding:6px 13px;border-radius:10px;border:1px solid var(--border-s);background:var(--surface);color:var(--txt);font-size:13px;font-weight:800;cursor:pointer;transition:all .25s cubic-bezier(.34,1.56,.64,1);font-family:'DM Sans',sans-serif;}
        .vote-btn:hover:not(.voted){border-color:#EF4444;background:var(--ds);color:#EF4444;transform:scale(1.05);}
        .vote-btn.voted{border-color:#EF4444;background:var(--ds);color:#EF4444;cursor:default;}
        .share-btn-sm{display:flex;align-items:center;gap:4px;padding:6px 11px;border-radius:10px;border:1px solid var(--border);background:transparent;color:var(--txt2);font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:.2s;}
        .share-btn-sm:hover{background:var(--surface-h);color:var(--txt);}
        .del-btn{margin-left:auto;padding:6px 10px;border-radius:10px;border:1px solid transparent;background:transparent;color:var(--txt3);font-size:12px;cursor:pointer;transition:.2s;font-family:'DM Sans',sans-serif;}
        .del-btn:hover{border-color:var(--danger);background:var(--ds);color:var(--danger);}
        .owner-tag{font-size:9px;font-weight:800;padding:2px 8px;border-radius:20px;background:rgba(124,58,237,.12);color:#A78BFA;border:1px solid rgba(124,58,237,.2);}

        /* STEPPER */
        .stepper{display:flex;align-items:center;margin:12px 0 10px;}
        .step{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;}
        .step-dot{width:9px;height:9px;border-radius:50%;}
        .step-dot.done{background:var(--green);box-shadow:0 0 7px rgba(16,185,129,.5);}
        .step-dot.active{background:var(--accent);box-shadow:0 0 7px var(--ag);animation:glowPulse 1.5s ease infinite;}
        .step-dot.pending{background:var(--border-s);}
        .step-lbl{font-size:8px;font-weight:700;color:var(--txt3);text-align:center;white-space:nowrap;line-height:1.3;}
        .step.done .step-lbl{color:var(--green);}
        .step.active .step-lbl{color:var(--accent);}
        .step-line{flex:1;height:2px;margin:0 4px;margin-bottom:14px;}
        .step-line.done{background:var(--green);}
        .step-line.pending{background:var(--border);}

        .approve-btn{width:100%;padding:12px;border-radius:12px;border:none;cursor:pointer;background:var(--green);color:#fff;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:7px;box-shadow:0 8px 22px rgba(16,185,129,.3);transition:all .25s cubic-bezier(.34,1.56,.64,1);}
        .approve-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 28px rgba(16,185,129,.4);}
        .approve-btn:disabled{opacity:.6;cursor:not-allowed;}
        .btn-spin{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:spin .7s linear infinite;flex-shrink:0;}
        .waiting-chip{display:flex;align-items:center;gap:7px;padding:9px 13px;border-radius:11px;border:1px dashed var(--border-s);background:var(--surface);font-size:12px;font-weight:600;color:var(--txt3);}

        /* SIDEBAR PANELS */
        .side-panel{background:var(--surface);border:1px solid var(--border-s);border-radius:18px;padding:16px;}
        .panel-hdr{display:flex;align-items:center;gap:9px;margin-bottom:0;}
        .panel-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:var(--txt);}
        .panel-sub{font-size:10px;color:var(--txt3);font-weight:600;margin-top:1px;}
        .toggle-btn{margin-left:auto;font-size:10px;font-weight:800;color:var(--accent);background:var(--as);border:1px solid rgba(79,142,247,.2);border-radius:20px;padding:3px 9px;cursor:pointer;font-family:'DM Sans',sans-serif;}
        .lb-row{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:11px;background:var(--surface);border:1px solid var(--border);transition:.2s;}
        .lb-row:hover{border-color:var(--border-s);}
        .lb-me{border-color:var(--accent) !important;background:var(--as) !important;}
        .lb-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#8B5CF6);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;flex-shrink:0;}

        /* ACHIEVEMENTS */
        .achievements-panel{background:var(--surface);border:1px solid var(--border-s);border-radius:18px;padding:16px;}
        .achievements-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px;margin-bottom:14px;}
        .achievement-item{position:relative;border-radius:13px;padding:10px 6px;text-align:center;border:1px solid var(--border);background:var(--bg2);cursor:default;transition:.2s;}
        .achievement-item.unlocked{border-color:rgba(250,204,21,.3);background:rgba(250,204,21,.06);animation:unlockPop .5s cubic-bezier(.34,1.56,.64,1) both;}
        .achievement-item.locked{opacity:.4;filter:grayscale(1);}
        .ach-icon{font-size:20px;margin-bottom:4px;}
        .ach-label{font-size:9px;font-weight:800;color:var(--txt2);line-height:1.2;}
        .ach-glow{position:absolute;inset:0;border-radius:13px;background:radial-gradient(circle at 50% 50%,rgba(250,204,21,.12),transparent 70%);pointer-events:none;animation:glowPulse 3s ease infinite;}
        .xp-bar-wrap{padding-top:4px;}
        .xp-track{width:100%;height:6px;background:var(--border);border-radius:3px;overflow:hidden;}
        .xp-fill{height:100%;background:linear-gradient(90deg,var(--accent),#8B5CF6);border-radius:3px;transition:width .6s cubic-bezier(.16,1,.3,1);}

        /* HEATMAP PANEL */
        .heatmap-panel{background:var(--surface);border:1px solid var(--border-s);border-radius:18px;overflow:hidden;}
        .heatmap-hdr{padding:14px 16px 12px;display:flex;align-items:center;gap:9px;}
        .leaflet-container{font-family:'DM Sans',sans-serif !important;}
        .leaflet-control-attribution{display:none !important;}
        .leaflet-popup-content-wrapper{border-radius:12px !important;font-family:'DM Sans',sans-serif !important;font-size:12px !important;font-weight:600;}
        .leaflet-popup-tip{display:none;}

        /* MY RANK CHIP */
        .my-rank-chip{background:var(--as);border:1px solid rgba(79,142,247,.25);border-radius:14px;padding:10px 14px;display:flex;align-items:center;gap:10px;}
        .rank-num{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:var(--accent);}

        /* SKELETON */
        .skeleton{background:linear-gradient(90deg,var(--surface) 25%,var(--surface-h) 50%,var(--surface) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:10px;}

        /* FAB */
        .cp-fab{position:fixed;bottom:28px;right:24px;width:58px;height:58px;border-radius:18px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;box-shadow:0 12px 34px var(--ag),0 4px 12px rgba(0,0,0,.3);z-index:400;border:none;transition:all .35s cubic-bezier(.34,1.56,.64,1);}
        .cp-fab:hover{transform:scale(1.1) rotate(8deg);}

        /* UPLOAD MODAL */
        .modal-overlay{position:fixed;inset:0;background:var(--mbg);display:flex;align-items:flex-end;justify-content:center;z-index:1000;backdrop-filter:blur(18px);animation:fadeIn .25s ease;}
        .upload-card{width:100%;max-width:520px;background:var(--mcard);border:1px solid var(--border-s);border-radius:32px 32px 0 0;padding:20px 20px 36px;animation:sheetUp .38s cubic-bezier(.16,1,.3,1) both;max-height:94vh;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--scroll) transparent;}
        .sheet-handle{width:36px;height:4px;background:var(--border-s);border-radius:2px;margin:0 auto 18px;}
        .modal-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}
        .modal-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;letter-spacing:-.4px;}
        .modal-close{width:30px;height:30px;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--txt2);font-size:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s;}
        .modal-close:hover{background:var(--ds);border-color:var(--danger);color:var(--danger);}
        .preview-img{width:100%;height:180px;object-fit:cover;border-radius:16px;border:1px solid var(--border);margin-bottom:12px;}
        .modal-textarea{width:100%;height:82px;background:var(--surface);border:1px solid var(--border-s);border-radius:13px;padding:12px 14px;color:var(--txt);font-size:14px;font-weight:500;font-family:'DM Sans',sans-serif;outline:none;resize:none;transition:.2s;margin-bottom:10px;}
        .modal-textarea::placeholder{color:var(--txt3);}
        .modal-textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--as);}
        .map-btn{width:100%;padding:11px;border-radius:12px;border:1.5px solid var(--accent);background:var(--as);color:var(--accent);font-weight:700;font-size:13px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:.2s;margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:7px;}
        .map-btn:hover,.map-btn.active{background:var(--accent);color:#fff;}
        .map-wrapper{margin-bottom:10px;border-radius:16px;overflow:hidden;border:1px solid var(--border-s);}
        .loc-badge{display:flex;align-items:flex-start;gap:7px;font-size:12px;color:var(--accent);font-weight:600;background:var(--as);border:1px solid rgba(79,142,247,.2);padding:9px 12px;border-radius:11px;margin-bottom:10px;line-height:1.4;}
        .publish-btn{width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:14px;font-weight:800;font-size:14px;font-family:'DM Sans',sans-serif;cursor:pointer;box-shadow:0 10px 26px var(--ag);transition:all .25s cubic-bezier(.34,1.56,.64,1);display:flex;align-items:center;justify-content:center;gap:9px;}
        .publish-btn:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 16px 34px var(--ag);}
        .publish-btn:disabled{opacity:.45;cursor:not-allowed;}

        /* RESPONSIVE */
        @media(max-width:768px){
          .cp-sidebar{display:none;}
          .cp-layout{padding:16px 10px 90px;}
        }

        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:var(--scroll);border-radius:2px;}
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} />}
      {deleteTarget && <DeleteDialog onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}

      {/* NAV */}
      <nav className="cp-nav">
        <div className="cp-logo">
          <div className="cp-logo-badge">🏙️</div>
          <span className="cp-logo-txt">CivicPulse</span>
        </div>
        <div className="cp-nav-r">
          <ThemeToggle theme={theme} toggleTheme={() => setTheme(t => t === "dark" ? "light" : "dark")} />
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </div>
      </nav>

      <div className="cp-layout">

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
        <aside className="cp-sidebar">

          {/* My Stats */}
          <div className="side-panel">
            <div className="panel-hdr" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>👤</span>
              <div><div className="panel-title">My Stats</div><div className="panel-sub">Your impact</div></div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, textAlign: "center", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 6px" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "var(--txt)" }}>{myReports.length}</div>
                <div style={{ fontSize: 9, color: "var(--txt3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px" }}>Reports</div>
              </div>
              <div style={{ flex: 1, textAlign: "center", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 6px" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "var(--green)" }}>{mySolved.length}</div>
                <div style={{ fontSize: 9, color: "var(--txt3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px" }}>Solved</div>
              </div>
              <div style={{ flex: 1, textAlign: "center", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 6px" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "#F59E0B" }}>{myRank >= 0 ? `#${myRank + 1}` : "—"}</div>
                <div style={{ fontSize: 9, color: "var(--txt3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px" }}>Rank</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <AchievementsPanel reportCount={myReports.length} solvedCount={mySolved.length} />

          {/* Leaderboard */}
          <Leaderboard data={leaderboard} expanded={lbExpanded} onToggle={() => setLbExpanded(v => !v)} currentUserId={user?.id} />

        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
        <main className="cp-main">

          {/* Page header */}
          <div style={{ marginBottom: 20, paddingLeft: 2 }}>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.1, color: "var(--txt)" }}>Community<br />Reports</h1>
            <p style={{ fontSize: 13, color: "var(--txt2)", marginTop: 6, fontWeight: 500 }}>
              <span style={{ color: "var(--accent)", fontWeight: 700 }}>{feedPosts.length} active</span> · <span style={{ color: "var(--green)", fontWeight: 700 }}>{posts.filter(p => p.status === "solved").length} resolved</span> · {verifiedPosts.length > 0 && <span style={{ color: "#3B82F6", fontWeight: 700 }}>{verifiedPosts.length} awaiting confirmation</span>}
            </p>
          </div>

          {/* Community Heatmap */}
          <div className="heatmap-panel" style={{ marginBottom: 20 }}>
            <div className="heatmap-hdr">
              <span style={{ fontSize: 18 }}>🌡️</span>
              <div>
                <div className="panel-title">Community Heatmap</div>
                <div className="panel-sub">All issues across the city — red = active, green = solved</div>
              </div>
            </div>
            <CommunityHeatmap posts={posts} userLocation={userLocation} />
          </div>

          {/* ══ SECTION 1: VERIFIED — needs citizen confirmation ══ */}
          {verifiedPosts.length > 0 && (
            <VerifiedSection
              posts={posts}
              currentUserId={user?.id}
              onApprove={handleCitizenApprove}
              approvingId={approvingId}
            />
          )}

          {/* ══ SECTION 2: ACTIVE PENDING REPORTS ══ */}
          <PendingSection
            posts={feedPosts}
            votedIds={votedIds}
            onVote={handleVote}
            onDelete={setDeleteTarget}
            userId={user?.id}
            loading={feedLoading}
          />

        </main>
      </div>

      {/* FAB */}
      <button className="cp-fab" onClick={() => fileInputRef.current.click()} title="Report an issue">📸</button>
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />

      {/* UPLOAD SHEET */}
      {step === "upload" && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setStep("feed")}>
          <div className="upload-card">
            <div className="sheet-handle" />
            <div className="modal-hdr">
              <h3 className="modal-title">Report Issue</h3>
              <button className="modal-close" onClick={() => setStep("feed")}>✕</button>
            </div>
            <img src={selectedImg} alt="preview" className="preview-img" />
            <textarea className="modal-textarea" placeholder="Describe the problem clearly…" value={description} onChange={e => setDescription(e.target.value)} />
            <button className={`map-btn ${showMap ? "active" : ""}`} onClick={() => setShowMap(v => !v)}>
              🗺️ {showMap ? "Hide Map" : "Pin Location on Map"}
            </button>
            {showMap && <div className="map-wrapper"><MapPicker setLocation={setLocation} /></div>}
            {location.address && (
              <div className="loc-badge">
                <span style={{ flexShrink: 0 }}>📍</span>
                <div>
                  <div style={{ fontWeight: 700 }}>{location.address.split(",").slice(0, 2).join(",")}</div>
                  <div style={{ fontSize: 10, color: "var(--txt2)", marginTop: 2 }}>{location.address.split(",").slice(2, 5).join(",").trim()}</div>
                </div>
              </div>
            )}
            <button className="publish-btn" onClick={handlePost} disabled={!canPublish}>
              {publishing ? <><Spinner size={15} />Publishing…</> : !description.trim() ? "✏️ Add a description first" : !location.address ? "📍 Pin a location" : "Publish Report →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}