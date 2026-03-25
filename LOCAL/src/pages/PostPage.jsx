import React, { useState, useRef, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "../supabaseClient";

// ─── Leaflet icon fix ─────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const pulseIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
    <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:rgba(59,130,246,0.25);animation:mapPulse 1.8s ease-out infinite;"></div>
    <div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid #fff;box-shadow:0 2px 10px rgba(59,130,246,0.6);position:relative;z-index:1;"></div>
  </div>`,
  iconSize: [32, 32], iconAnchor: [16, 16],
});

const userIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
    <div style="position:absolute;width:24px;height:24px;border-radius:50%;background:rgba(16,185,129,0.3);animation:mapPulse 2s ease-out infinite;"></div>
    <div style="width:12px;height:12px;border-radius:50%;background:#10B981;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(16,185,129,0.7);position:relative;z-index:1;"></div>
  </div>`,
  iconSize: [24, 24], iconAnchor: [12, 12],
});

const issueIcon = L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#EF4444;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(239,68,68,0.5);display:flex;align-items:center;justify-content:center;font-size:10px;">⚠</div>`,
  iconSize: [22, 22], iconAnchor: [11, 11],
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
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      onLocationPicked({ lat, lng, address: data.display_name || "Unknown location" });
    } catch {
      onLocationPicked({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
    }
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
  const [locating,  setLocating]  = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [gpsError,  setGpsError]  = useState(false);
  const reverseGeocode = async (lat, lng) => {
    setGeocoding(true);
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
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
      { timeout: 8000, enableHighAccuracy: true }
    );
  };
  useEffect(() => { locateUser(); }, []);
  const handleLocationPicked = useCallback(({ lat, lng, address }) => { setLocation({ lat, lng, address }); }, [setLocation]);
  return (
    <div style={{ position:"relative", borderRadius:"18px", overflow:"hidden" }}>
      <style>{`@keyframes mapPulse{0%{transform:scale(.8);opacity:.8}70%{transform:scale(2.2);opacity:0}100%{transform:scale(.8);opacity:0}}.leaflet-container{font-family:'DM Sans',sans-serif !important;}.leaflet-control-attribution{display:none !important;}.leaflet-control-zoom{border:none !important;}.leaflet-control-zoom a{border-radius:8px !important;background:rgba(10,10,20,.85) !important;color:#fff !important;border-color:rgba(255,255,255,.1) !important;margin-bottom:4px !important;}.leaflet-popup-content-wrapper{border-radius:12px !important;font-family:'DM Sans',sans-serif !important;font-size:12px !important;font-weight:600;}`}</style>
      {locating && (
        <div style={{ position:"absolute",inset:0,zIndex:1000,background:"rgba(8,8,15,.8)",backdropFilter:"blur(6px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,borderRadius:"18px" }}>
          <div style={{ width:26,height:26,borderRadius:"50%",border:"3px solid rgba(255,255,255,.1)",borderTopColor:"#3B82F6",animation:"spin .8s linear infinite" }} />
          <span style={{ fontSize:12,color:"rgba(255,255,255,.65)",fontWeight:600 }}>Getting your location…</span>
        </div>
      )}
      <MapContainer center={DEFAULT} zoom={13} style={{ height:"260px",width:"100%" }} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {flyCoords && <FlyTo coords={flyCoords} />}
        <DraggableMarker position={markerPos} setPosition={setMarkerPos} onLocationPicked={handleLocationPicked} />
      </MapContainer>
      <div style={{ position:"absolute",bottom:10,left:"50%",transform:"translateX(-50%)",zIndex:999,background:"rgba(0,0,0,.72)",backdropFilter:"blur(8px)",color:"#fff",padding:"5px 14px",borderRadius:"20px",fontSize:11,fontWeight:700,whiteSpace:"nowrap",border:"1px solid rgba(255,255,255,.1)",pointerEvents:"none" }}>
        {geocoding ? "⟳ Fetching address…" : gpsError ? "📍 Tap map to set location" : "📍 Tap map or drag pin to adjust"}
      </div>
      <button onClick={locateUser} disabled={locating} style={{ position:"absolute",top:10,right:10,zIndex:999,width:36,height:36,borderRadius:"10px",background:"#3B82F6",border:"none",cursor:"pointer",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(59,130,246,.5)" }}>
        {locating ? "⟳" : "⌖"}
      </button>
    </div>
  );
}

function NearbyMap({ posts, userLocation }) {
  const DEFAULT = [22.5726, 88.3639];
  const center  = userLocation || DEFAULT;
  const nearbyPosts = posts.filter(p => p.latitude && p.longitude);
  return (
    <div style={{ position:"relative", borderRadius:"20px", overflow:"hidden" }}>
      <MapContainer center={center} zoom={13} style={{ height:"200px", width:"100%" }} scrollWheelZoom={false} zoomControl={false} dragging={false} doubleClickZoom={false} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {userLocation && <Marker position={userLocation} icon={userIcon}><Popup>You are here</Popup></Marker>}
        {nearbyPosts.map(p => (
          <Marker key={p.id} position={[p.latitude, p.longitude]} icon={issueIcon}>
            <Popup><div style={{ maxWidth:160 }}><strong>{p.description?.slice(0, 60)}{p.description?.length > 60 ? "…" : ""}</strong><div style={{ color:"#888", marginTop:4, fontSize:11 }}>{p.address?.split(",")[0]}</div></div></Popup>
          </Marker>
        ))}
      </MapContainer>
      <div style={{ position:"absolute",top:10,left:10,zIndex:999,background:"rgba(0,0,0,.7)",backdropFilter:"blur(8px)",color:"#fff",padding:"4px 10px",borderRadius:"10px",fontSize:11,fontWeight:700,border:"1px solid rgba(255,255,255,.1)",pointerEvents:"none" }}>
        {nearbyPosts.length > 0 ? `${nearbyPosts.length} issue${nearbyPosts.length>1?"s":""} on map` : "No issues mapped yet"}
      </div>
      <div style={{ position:"absolute",bottom:10,right:10,zIndex:999,display:"flex",flexDirection:"column",gap:4,pointerEvents:"none" }}>
        <div style={{ display:"flex",alignItems:"center",gap:5,background:"rgba(0,0,0,.65)",backdropFilter:"blur(6px)",padding:"3px 8px",borderRadius:8,fontSize:10,fontWeight:700,color:"#fff" }}><div style={{ width:8,height:8,borderRadius:"50%",background:"#10B981" }} /> You</div>
        <div style={{ display:"flex",alignItems:"center",gap:5,background:"rgba(0,0,0,.65)",backdropFilter:"blur(6px)",padding:"3px 8px",borderRadius:8,fontSize:10,fontWeight:700,color:"#fff" }}><div style={{ width:8,height:8,borderRadius:"50%",background:"#EF4444" }} /> Issues</div>
      </div>
    </div>
  );
}

const MEDALS = ["🥇","🥈","🥉"];
const BADGES = [{ min:10, icon:"🔥", label:"Fire Reporter" },{ min:5, icon:"⭐", label:"Star Contributor" },{ min:1, icon:"🌱", label:"New Voice" }];
const getBadge = (count) => BADGES.find(b => count >= b.min) || null;

function Leaderboard({ data, expanded, onToggle, currentUserId }) {
  const visible = expanded ? data : data.slice(0, 3);
  return (
    <div className="widget-card">
      <div className="widget-hdr">
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:20 }}>🏆</span>
          <div><div className="widget-title">Top Contributors</div><div className="widget-sub">Most reports this month</div></div>
        </div>
        {data.length > 3 && <button className="widget-toggle" onClick={onToggle}>{expanded ? "Show less ↑" : `+${data.length - 3} more ↓`}</button>}
      </div>
      {data.length === 0 ? (
        <div style={{ textAlign:"center",padding:"20px 0",color:"var(--txt3)",fontSize:13,fontWeight:600 }}>No reports yet — be the first! 🌟</div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:8,marginTop:14 }}>
          {visible.map((entry, i) => {
            const badge = getBadge(entry.count);
            const isMe  = entry.user_id === currentUserId;
            return (
              <div key={entry.user_id} className={`lb-row ${isMe ? "lb-me" : ""}`} style={{ animationDelay:`${i * 60}ms` }}>
                <span className="lb-rank">{i < 3 ? MEDALS[i] : `${i+1}.`}</span>
                <div className="lb-avatar">{(entry.name || "?")[0].toUpperCase()}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontWeight:700,fontSize:14,color:"var(--txt)",display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{entry.name || "Anonymous"}</span>
                    {isMe && <span style={{ fontSize:10,fontWeight:800,color:"var(--accent)",background:"var(--as)",padding:"2px 7px",borderRadius:10,flexShrink:0 }}>You</span>}
                  </div>
                  {badge && <div style={{ fontSize:10,color:"var(--txt3)",fontWeight:600,marginTop:1 }}>{badge.icon} {badge.label}</div>}
                </div>
                <div className="lb-count">
                  <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15 }}>{entry.count}</span>
                  <span style={{ fontSize:10,color:"var(--txt3)",fontWeight:600 }}>reports</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const TIPS = [
  { icon:"📸", text:"Take a clear, well-lit photo of the issue" },
  { icon:"📍", text:"Pin the exact location on the map" },
  { icon:"🏢", text:"Include nearby landmarks in your description" },
  { icon:"✏️", text:"Write a short but specific description" },
  { icon:"🔄", text:"Check if the issue is already reported" },
];
function TipsCard({ expanded, onToggle }) {
  return (
    <div className="widget-card">
      <div className="widget-hdr" style={{ cursor:"pointer" }} onClick={onToggle}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:20 }}>💡</span>
          <div><div className="widget-title">Tips for Better Reports</div><div className="widget-sub">Help authorities respond faster</div></div>
        </div>
        <button className="widget-toggle">{expanded ? "▲" : "▼"}</button>
      </div>
      {expanded && (
        <div style={{ marginTop:14,display:"flex",flexDirection:"column",gap:9 }}>
          {TIPS.map((tip, i) => (
            <div key={i} className="tip-row" style={{ animationDelay:`${i * 50}ms` }}>
              <span style={{ fontSize:18,flexShrink:0 }}>{tip.icon}</span>
              <span style={{ fontSize:13,fontWeight:600,color:"var(--txt2)",lineHeight:1.4 }}>{tip.text}</span>
            </div>
          ))}
          <div style={{ marginTop:4,padding:"10px 12px",background:"var(--as)",borderRadius:12,border:"1px solid rgba(59,130,246,.2)" }}>
            <p style={{ fontSize:12,color:"var(--accent)",fontWeight:700,lineHeight:1.5 }}>✨ Good reports get resolved 3× faster!</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── VERIFIED REPORTS SECTION (the new prominent component) ──────────────────
function VerifiedReportsSection({ posts, currentUserId, onApprove, approvingId }) {
  // Only show posts that are "verified" status
  const verifiedPosts = posts.filter(p => p.status === "verified");
  if (verifiedPosts.length === 0) return null;

  return (
    <div className="verified-section">
      {/* Section Header */}
      <div className="verified-section-hdr">
        <div className="verified-badge-glow" />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
            <div className="verified-icon-wrap">
              <span style={{ fontSize:18 }}>✅</span>
            </div>
            <div>
              <div className="verified-section-title">Authority Verified</div>
              <div className="verified-section-sub">{verifiedPosts.length} issue{verifiedPosts.length > 1 ? "s" : ""} confirmed resolved by department</div>
            </div>
          </div>
          <div className="verified-section-info">
            If you reported one of these issues, confirm the fix is done to mark it solved permanently.
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {verifiedPosts.map((post, i) => {
          const isOwner = post.user_id === currentUserId;
          const isApproving = approvingId === post.id;
          return (
            <div key={post.id} className="verified-card" style={{ animationDelay:`${i * 80}ms` }}>
              {/* Top: image + info side by side */}
              <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                {post.image && (
                  <div style={{ width:80, height:80, borderRadius:14, overflow:"hidden", flexShrink:0, border:"1px solid rgba(16,185,129,0.2)" }}>
                    <img src={post.image} alt="issue" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  </div>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
                    <span className="verified-pill">✓ Verified</span>
                    {isOwner && <span className="owner-pill">Your Report</span>}
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, color:"var(--txt)", lineHeight:1.4, marginBottom:4 }}>
                    {post.description?.slice(0, 80)}{post.description?.length > 80 ? "…" : ""}
                  </div>
                  <div style={{ fontSize:11, color:"var(--txt3)", fontWeight:600 }}>
                    📍 {post.address?.split(",").slice(0,2).join(",")}
                  </div>
                  {post.proof_image_url && (
                    <div style={{ marginTop:6, fontSize:11, color:"#10B981", fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
                      📎 Proof of resolution attached
                    </div>
                  )}
                </div>
              </div>

              {/* Proof image */}
              {post.proof_image_url && (
                <div style={{ marginTop:10 }}>
                  <div style={{ fontSize:10, fontWeight:800, color:"rgba(16,185,129,0.7)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>Authority Proof</div>
                  <img src={post.proof_image_url} alt="proof" style={{ width:"100%", height:120, objectFit:"cover", borderRadius:12, border:"1px solid rgba(16,185,129,0.25)" }} />
                </div>
              )}

              {/* Stepper */}
              <div className="verified-stepper">
                <div className="vstep done">
                  <div className="vstep-dot done" />
                  <div className="vstep-label">Reported</div>
                </div>
                <div className="vstep-line done" />
                <div className="vstep done">
                  <div className="vstep-dot done" />
                  <div className="vstep-label">Authority Verified</div>
                </div>
                <div className="vstep-line pending" />
                <div className={`vstep ${isOwner ? "active" : "pending"}`}>
                  <div className={`vstep-dot ${isOwner ? "active" : "pending"}`} />
                  <div className="vstep-label">Citizen Confirms</div>
                </div>
              </div>

              {/* Action: only owner can approve */}
              {isOwner ? (
                <button
                  className="approve-btn"
                  onClick={() => onApprove(post)}
                  disabled={isApproving}
                >
                  {isApproving ? (
                    <><div className="btn-spinner" /> Confirming fix…</>
                  ) : (
                    <><span style={{ fontSize:18 }}>✅</span> Yes, the issue is fixed!</>
                  )}
                </button>
              ) : (
                <div className="waiting-chip">
                  <span style={{ fontSize:14 }}>⏳</span>
                  Waiting for the original reporter to confirm
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Spinner({ size = 18 }) {
  return <div style={{ width:size,height:size,borderRadius:"50%",border:`2.5px solid rgba(255,255,255,.25)`,borderTopColor:"#fff",animation:"spin .7s linear infinite",flexShrink:0 }} />;
}

function Toast({ message, type }) {
  return (
    <div style={{ position:"fixed",bottom:110,left:"50%",transform:"translateX(-50%)",background:type==="error"?"#EF4444":"#10B981",color:"#fff",padding:"10px 20px",borderRadius:"14px",fontSize:13,fontWeight:700,zIndex:9999,boxShadow:"0 8px 24px rgba(0,0,0,.3)",animation:"toastIn .3s cubic-bezier(.34,1.56,.64,1)",whiteSpace:"nowrap" }}>
      {message}
    </div>
  );
}

function DeleteDialog({ onConfirm, onCancel, loading }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(14px)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div style={{ background:"var(--mcard)",border:"1px solid var(--border-s)",borderRadius:24,padding:"28px 24px",maxWidth:320,width:"100%",textAlign:"center" }}>
        <div style={{ fontSize:38,marginBottom:12 }}>🗑️</div>
        <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,marginBottom:8,color:"var(--txt)" }}>Delete Report?</h3>
        <p style={{ fontSize:13,color:"var(--txt2)",marginBottom:24,lineHeight:1.5 }}>This will permanently remove your report and its image.</p>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onCancel} style={{ flex:1,padding:12,borderRadius:13,border:"1px solid var(--border-s)",background:"var(--surface)",color:"var(--txt)",fontWeight:700,fontSize:14,fontFamily:"'DM Sans',sans-serif",cursor:"pointer" }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{ flex:1,padding:12,borderRadius:13,border:"none",background:"#EF4444",color:"#fff",fontWeight:800,fontSize:14,fontFamily:"'DM Sans',sans-serif",cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:loading?.6:1 }}>
            {loading && <Spinner size={15} />}{loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
      <span className="toggle-track"><span className="toggle-thumb">{theme === "dark" ? "🌙" : "☀️"}</span></span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PostPage
// ═══════════════════════════════════════════════════════════════════════════════
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
  const [showTips, setShowTips]         = useState(false);
  const [lbExpanded, setLbExpanded]     = useState(false);

  const fileInputRef = useRef(null);
  const toggleTheme  = () => setTheme(t => t === "dark" ? "light" : "dark");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const formatTime = (ts) => {
    if (!ts) return "Just now";
    const diff = (Date.now() - new Date(ts)) / 1000;
    if (diff < 60)    return "Just now";
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const fetchPosts = async () => {
    setFeedLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPosts(data.map(p => ({
        // Normalize status so DB edits like "Verified"/"verified " still work in UI
        status: (p.status || "pending").toString().trim().toLowerCase(),
        id: p.id, description: p.description, address: p.address,
        image: p.image_url, proof_image_url: p.proof_image_url,
        solved_by: p.solved_by, solved_at: p.solved_at,
        votes: p.votes || 0, time: formatTime(p.created_at),
        user_id: p.user_id,
        latitude: p.latitude, longitude: p.longitude,
      })));
      if (user?.id) {
        const { data: voteData } = await supabase.from("votes").select("post_id").eq("user_id", user.id);
        if (voteData) setVotedIds(new Set(voteData.map(v => v.post_id)));
      }
    } catch (err) {
      console.error("fetchPosts:", err);
      showToast("Failed to load posts", "error");
    } finally { setFeedLoading(false); }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase.from("posts").select("user_id, citizens(name)").not("user_id", "is", null);
      if (error) throw error;
      const counts = {};
      data.forEach(row => {
        const uid = row.user_id, name = row.citizens?.name || "Anonymous";
        if (!counts[uid]) counts[uid] = { user_id: uid, name, count: 0 };
        counts[uid].count++;
      });
      setLeaderboard(Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 10));
    } catch (err) { console.error("leaderboard:", err); }
  };

  const detectUserLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => setUserLocation([coords.latitude, coords.longitude]), () => {});
  };

  useEffect(() => { fetchPosts(); fetchLeaderboard(); detectUserLocation(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file); setSelectedImg(URL.createObjectURL(file));
    setStep("upload"); setShowMap(false);
    setLocation({ lat: null, lng: null, address: "" }); setDescription("");
    e.target.value = "";
  };

  const BUCKET = "post-images";
  const uploadImage = async (file) => {
    const ext  = file.name.split(".").pop().toLowerCase();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET).upload(path, file, { cacheControl:"3600", upsert:false, contentType: file.type || "image/jpeg" });
    if (uploadErr) throw new Error(`Storage: ${uploadErr.message}`);
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handlePost = async () => {
    if (!description.trim()) return showToast("Please add a description", "error");
    if (!location.address)   return showToast("Please pin a location on the map", "error");
    if (!user?.id)           return showToast("You must be logged in", "error");
    if (!selectedFile)       return showToast("No image selected", "error");
    setPublishing(true);
    try {
      let imageUrl;
      try { imageUrl = await uploadImage(selectedFile); }
      catch (storageErr) { showToast(storageErr.message || "Image upload failed", "error"); setPublishing(false); return; }
      const { data, error } = await supabase.from("posts")
        .insert({ user_id:user.id, description, image_url:imageUrl, address:location.address, latitude:location.lat??null, longitude:location.lng??null, status:"pending", votes:0 })
        .select().single();
      if (error) throw new Error(`DB: ${error.message}`);
      setPosts(prev => [{ id:data.id, description:data.description, address:data.address, image:data.image_url, votes:0, time:"Just now", status:data.status, user_id:data.user_id, latitude:data.latitude, longitude:data.longitude }, ...prev]);
      setStep("feed"); setSelectedImg(null); setSelectedFile(null); setDescription(""); setLocation({ lat:null, lng:null, address:"" }); setShowMap(false);
      showToast("Report published! ✅");
      fetchLeaderboard();
    } catch (err) { showToast(err.message || "Failed to publish.", "error"); }
    finally { setPublishing(false); }
  };

  const handleVote = async (postId) => {
    if (!user?.id) return showToast("Log in to vote", "error");
    if (votedIds.has(postId)) return;
    try {
      const { error: insertErr } = await supabase.from("votes").insert({ post_id: postId, user_id: user.id });
      if (insertErr && !insertErr.message?.toLowerCase().includes("duplicate")) throw insertErr;
      const { count, error: countErr } = await supabase.from("votes").select("*", { count:"exact", head:true }).eq("post_id", postId);
      if (countErr) throw countErr;
      if (typeof count === "number") {
        await supabase.from("posts").update({ votes: count }).eq("id", postId);
        setVotedIds(prev => new Set([...prev, postId]));
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, votes: count } : p));
      } else {
        setVotedIds(prev => new Set([...prev, postId]));
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, votes: (p.votes || 0) + 1 } : p));
      }
    } catch { showToast("Vote failed.", "error"); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const pathMatch = (deleteTarget.image||"").match(/post-images\/(.+)$/);
      if (pathMatch) await supabase.storage.from("post-images").remove([pathMatch[1]]);
      await supabase.from("votes").delete().eq("post_id", deleteTarget.id);
      const { error } = await supabase.from("posts").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== deleteTarget.id));
      showToast("Report deleted"); fetchLeaderboard();
    } catch { showToast("Delete failed.", "error"); }
    finally { setDeleteLoading(false); setDeleteTarget(null); }
  };

  // ── Citizen approves a verified fix → marks solved, hides from feed ──────────
const handleCitizenApprove = async (post) => {
  if (!user?.id) return showToast("Log in required", "error");
  if (post.user_id !== user.id) return showToast("Only the original reporter can confirm", "error");
  if (post.status !== "verified") return showToast("Report must be authority-verified first", "error");

  setApprovingId(post.id);
  try {
    const ts = new Date().toISOString();

    // ── DEBUG: log exactly what we're sending ──
    console.log("=== APPROVE DEBUG ===");
    console.log("post.id:", post.id);
    console.log("post.user_id:", post.user_id);
    console.log("post.status (local):", post.status);
    console.log("auth user.id:", user.id);
    console.log("match?", post.user_id === user.id);

    // ── Step 1: fetch the LIVE row from DB first ──
    const { data: liveRow, error: fetchErr } = await supabase
      .from("posts")
      .select("id, status, user_id")
      .eq("id", post.id)
      .single();

    console.log("Live DB row:", liveRow, "fetchErr:", fetchErr);

    if (fetchErr) throw new Error("Could not fetch live post: " + fetchErr.message);
    if (!liveRow) throw new Error("Post not found in DB");
    console.log("Live status in DB:", liveRow.status);
    console.log("Live user_id in DB:", liveRow.user_id);

    // ── Step 2: attempt update ──
    const { data: updatedRows, error: updateErr } = await supabase
      .from("posts")
      .update({ status: "solved", solved_at: ts })
      .eq("id", post.id)
      .select("id, status");

    console.log("updatedRows:", updatedRows, "updateErr:", updateErr);

    if (updateErr) throw new Error("Update error: " + updateErr.message);
    if (!updatedRows || updatedRows.length === 0) {
      throw new Error(
        `RLS blocked the update. DB status="${liveRow.status}", DB user_id="${liveRow.user_id}", auth.uid="${user.id}"`
      );
    }

    setPosts(prev =>
      prev.map(p =>
        p.id === post.id ? { ...p, status: "solved", solved_at: ts } : p
      )
    );
    showToast("🎉 Issue confirmed solved! Thank you for reporting.");
  } catch (err) {
    console.error("APPROVE FAILED:", err);
    showToast(err.message || "Approval failed", "error");
  } finally {
    setApprovingId(null);
  }
};

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.hash = "#/"; };

  const canPublish  = description.trim() && location.address && !publishing;
  const statusColors = { pending:"#F59E0B", verified:"#3B82F6", solved:"#10B981", rejected:"#EF4444" };

  // Only show pending posts in the main feed (hide verified + solved)
  const feedPosts = posts.filter(p => p.status === "pending");
// verified → shows in VerifiedReportsSection only
// solved   → hidden from everything (archived)

  return (
    <div className={`cp-root ${theme}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .cp-root.dark{--bg:#060608;--bg2:#0f0f14;--surface:rgba(255,255,255,.035);--surface-h:rgba(255,255,255,.06);--border:rgba(255,255,255,.07);--border-s:rgba(255,255,255,.13);--txt:#f0f0f5;--txt2:rgba(240,240,245,.5);--txt3:rgba(240,240,245,.25);--accent:#3B82F6;--ag:rgba(59,130,246,.28);--as:rgba(59,130,246,.1);--danger:#EF4444;--ds:rgba(239,68,68,.13);--nav:rgba(6,6,8,.86);--shadow:0 20px 50px rgba(0,0,0,.55);--mbg:rgba(0,0,0,.88);--mcard:#0f0f14;--tag:rgba(255,255,255,.06);--scroll:rgba(255,255,255,.06);--widget-bg:rgba(255,255,255,.025);--green:#10B981;--green-bg:rgba(16,185,129,.1);--green-border:rgba(16,185,129,.25);}
        .cp-root.light{--bg:#f0f2f7;--bg2:#fff;--surface:rgba(255,255,255,.9);--surface-h:#fff;--border:rgba(0,0,0,.07);--border-s:rgba(0,0,0,.13);--txt:#0f0f18;--txt2:rgba(15,15,24,.55);--txt3:rgba(15,15,24,.3);--accent:#2563EB;--ag:rgba(37,99,235,.18);--as:rgba(37,99,235,.08);--danger:#DC2626;--ds:rgba(220,38,38,.1);--nav:rgba(240,242,247,.9);--shadow:0 8px 30px rgba(0,0,0,.08);--mbg:rgba(0,0,0,.55);--mcard:#fff;--tag:rgba(0,0,0,.05);--scroll:rgba(0,0,0,.1);--widget-bg:rgba(255,255,255,.8);--green:#059669;--green-bg:rgba(5,150,105,.08);--green-border:rgba(5,150,105,.2);}

        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes cardIn{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes sheetUp{from{transform:translateY(100%);opacity:.5}to{transform:none;opacity:1}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes heartPop{0%,100%{transform:scale(1)}50%{transform:scale(1.7)}}
        @keyframes mapPulse{0%{transform:scale(.8);opacity:.8}70%{transform:scale(2.2);opacity:0}100%{transform:scale(.8);opacity:0}}
        @keyframes rowIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
        @keyframes tipIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes glowPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.9;transform:scale(1.05)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

        .cp-root{background:var(--bg);min-height:100vh;color:var(--txt);font-family:'DM Sans',sans-serif;overflow-x:hidden;transition:background .35s,color .35s;}

        .cp-nav{display:flex;justify-content:space-between;align-items:center;padding:13px 22px;background:var(--nav);backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:500;transition:background .35s;}
        .cp-logo{display:flex;align-items:center;gap:10px;}
        .cp-logo-badge{width:32px;height:32px;border-radius:10px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 4px 14px var(--ag);}
        .cp-logo-txt{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;letter-spacing:-.5px;}
        .cp-nav-r{display:flex;align-items:center;gap:10px;}
        .logout-btn{padding:7px 14px;background:var(--surface);border:1px solid var(--border-s);border-radius:10px;color:var(--txt2);font-size:12px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:.2s;}
        .logout-btn:hover{border-color:var(--danger);color:var(--danger);background:var(--ds);}
        .theme-toggle{background:var(--surface);border:1px solid var(--border-s);border-radius:50px;padding:3px;cursor:pointer;display:flex;transition:.3s;}
        .toggle-track{width:48px;height:26px;background:var(--tag);border-radius:50px;display:flex;align-items:center;padding:0 3px;}
        .toggle-thumb{width:22px;height:22px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 2px 8px var(--ag);transition:transform .35s cubic-bezier(.34,1.56,.64,1);}
        .dark .toggle-thumb{transform:translateX(22px);}
        .light .toggle-thumb{transform:translateX(0);}

        .cp-feed{max-width:520px;margin:0 auto;padding:28px 14px 110px;}
        .cp-feed-hdr{margin-bottom:20px;padding:0 4px;}
        .cp-feed-title{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;letter-spacing:-1px;line-height:1.1;}
        .cp-feed-sub{font-size:13px;color:var(--txt2);margin-top:6px;font-weight:500;}
        .cp-feed-sub span{color:var(--accent);font-weight:700;}

        .widget-card{background:var(--widget-bg);border:1px solid var(--border-s);border-radius:22px;padding:18px;margin-bottom:16px;backdrop-filter:blur(8px);animation:cardIn .4s ease both;}
        .widget-hdr{display:flex;align-items:center;justify-content:space-between;}
        .widget-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;letter-spacing:-.3px;color:var(--txt);}
        .widget-sub{font-size:11px;color:var(--txt3);font-weight:600;margin-top:1px;}
        .widget-toggle{font-size:11px;font-weight:800;color:var(--accent);background:var(--as);border:1px solid rgba(59,130,246,.2);border-radius:20px;padding:4px 10px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:.2s;white-space:nowrap;}
        .widget-toggle:hover{background:var(--accent);color:#fff;}

        .lb-row{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:14px;background:var(--surface);border:1px solid var(--border);transition:.2s;animation:rowIn .35s ease both;}
        .lb-row:hover{border-color:var(--border-s);background:var(--surface-h);}
        .lb-me{border-color:var(--accent) !important;background:var(--as) !important;}
        .lb-rank{font-size:18px;width:28px;text-align:center;flex-shrink:0;}
        .lb-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#8B5CF6);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;flex-shrink:0;}
        .lb-count{display:flex;flex-direction:column;align-items:flex-end;gap:1px;flex-shrink:0;}

        .tip-row{display:flex;align-items:flex-start;gap:10px;padding:8px 10px;border-radius:12px;background:var(--surface);border:1px solid var(--border);animation:tipIn .3s ease both;}

        .map-widget{background:var(--widget-bg);border:1px solid var(--border-s);border-radius:22px;overflow:hidden;margin-bottom:16px;animation:cardIn .4s ease both;}
        .map-widget-hdr{display:flex;align-items:center;justify-content:space-between;padding:16px 18px 12px;}
        .leaflet-container{font-family:'DM Sans',sans-serif !important;}
        .leaflet-control-attribution{display:none !important;}
        .leaflet-popup-content-wrapper{border-radius:12px !important;font-family:'DM Sans',sans-serif !important;font-size:12px !important;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.2) !important;}
        .leaflet-popup-tip{display:none;}

        /* ─── VERIFIED SECTION ─── */
        .verified-section{margin-bottom:24px;animation:slideIn .5s ease both;}
        .verified-section-hdr{
          position:relative;overflow:hidden;
          background:var(--green-bg);
          border:1.5px solid var(--green-border);
          border-radius:20px;padding:18px;margin-bottom:14px;
        }
        .verified-badge-glow{
          position:absolute;top:-30px;right:-30px;
          width:120px;height:120px;border-radius:50%;
          background:radial-gradient(circle,rgba(16,185,129,0.2),transparent 70%);
          animation:glowPulse 3s ease infinite;pointer-events:none;
        }
        .verified-icon-wrap{
          width:38px;height:38px;border-radius:12px;flex-shrink:0;
          background:var(--green-bg);border:1px solid var(--green-border);
          display:flex;align-items:center;justify-content:center;
        }
        .verified-section-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:var(--green);}
        .verified-section-sub{font-size:11px;color:var(--txt3);font-weight:600;margin-top:2px;}
        .verified-section-info{
          font-size:12px;color:var(--txt2);font-weight:500;line-height:1.5;
          margin-top:10px;padding:10px 12px;background:var(--surface);
          border-radius:12px;border:1px solid var(--border);
        }

        .verified-card{
          background:var(--surface);border:1.5px solid var(--green-border);
          border-radius:20px;padding:16px;
          animation:slideIn .4s ease both;
          transition:border-color .2s;
        }
        .verified-card:hover{border-color:var(--green);}

        .verified-pill{
          font-size:10px;font-weight:800;padding:3px 9px;border-radius:20px;
          background:var(--green-bg);color:var(--green);
          border:1px solid var(--green-border);letter-spacing:.5px;
        }
        .owner-pill{
          font-size:10px;font-weight:800;padding:3px 9px;border-radius:20px;
          background:rgba(124,58,237,.12);color:#A78BFA;
          border:1px solid rgba(124,58,237,.2);
        }

        /* Stepper */
        .verified-stepper{display:flex;align-items:center;margin:14px 0 12px;gap:0;}
        .vstep{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;}
        .vstep-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
        .vstep-dot.done{background:var(--green);box-shadow:0 0 8px rgba(16,185,129,.5);}
        .vstep-dot.active{background:var(--accent);box-shadow:0 0 8px var(--ag);animation:glowPulse 1.5s ease infinite;}
        .vstep-dot.pending{background:var(--border-s);}
        .vstep-label{font-size:9px;font-weight:700;color:var(--txt3);text-align:center;white-space:nowrap;letter-spacing:.3px;}
        .vstep.done .vstep-label{color:var(--green);}
        .vstep.active .vstep-label{color:var(--accent);}
        .vstep-line{flex:1;height:2px;margin:0 4px;margin-bottom:12px;}
        .vstep-line.done{background:var(--green);}
        .vstep-line.pending{background:var(--border);}

        /* Approve button */
        .approve-btn{
          width:100%;padding:13px;border-radius:14px;border:none;cursor:pointer;
          background:var(--green);color:#fff;
          font-family:'Syne',sans-serif;font-size:14px;font-weight:800;
          display:flex;align-items:center;justify-content:center;gap:8px;
          box-shadow:0 8px 24px rgba(16,185,129,.3);
          transition:all .25s cubic-bezier(.34,1.56,.64,1);
        }
        .approve-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 30px rgba(16,185,129,.4);}
        .approve-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
        .btn-spinner{width:15px;height:15px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:spin .7s linear infinite;flex-shrink:0;}

        .waiting-chip{
          display:flex;align-items:center;gap:8px;padding:10px 14px;
          border-radius:12px;border:1px dashed var(--border-s);
          background:var(--surface);font-size:12px;font-weight:600;color:var(--txt3);
        }

        .skel-card{background:var(--surface);border-radius:26px;margin-bottom:20px;border:1px solid var(--border);padding:18px;}
        .skeleton{background:linear-gradient(90deg,var(--surface) 25%,var(--surface-h) 50%,var(--surface) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:10px;}

        .social-card{background:var(--surface);border-radius:26px;margin-bottom:20px;border:1px solid var(--border);box-shadow:var(--shadow);overflow:hidden;transition:transform .3s,box-shadow .3s;animation:cardIn .45s cubic-bezier(.16,1,.3,1) both;}
        .social-card:hover{transform:translateY(-2px);box-shadow:var(--shadow),0 0 0 1px var(--border-s);}
        .card-body{padding:18px 18px 0;}
        .card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px;gap:8px;}
        .card-tags{display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
        .card-cat{font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;padding:4px 10px;border-radius:20px;background:var(--tag);border:1px solid var(--border-s);}
        .card-status{font-size:10px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;padding:4px 9px;border-radius:20px;}
        .card-time{font-size:11px;color:var(--txt3);font-weight:600;white-space:nowrap;flex-shrink:0;}
        .post-desc{font-size:15px;font-weight:600;line-height:1.5;margin-bottom:9px;}
        .post-loc{display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--accent);font-weight:700;background:var(--as);padding:4px 10px;border-radius:20px;margin-bottom:15px;}
        .img-wrap{position:relative;overflow:hidden;border-radius:18px;margin:0 18px;}
        .post-img{width:100%;height:290px;object-fit:cover;display:block;transition:transform .5s;}
        .social-card:hover .post-img{transform:scale(1.025);}
        .img-overlay{position:absolute;bottom:0;left:0;right:0;height:70px;background:linear-gradient(to top,rgba(0,0,0,.4),transparent);pointer-events:none;}
        .card-footer{display:flex;align-items:center;padding:12px 18px 16px;border-top:1px solid var(--border);margin-top:15px;gap:8px;}
        .upvote-btn{display:flex;align-items:center;gap:7px;padding:7px 14px;border-radius:12px;border:1px solid var(--border-s);background:var(--surface);color:var(--txt);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:800;cursor:pointer;transition:all .25s cubic-bezier(.34,1.56,.64,1);}
        .upvote-btn:hover:not(.voted){border-color:#EF4444;background:var(--ds);color:#EF4444;transform:scale(1.05);}
        .upvote-btn.voted{border-color:#EF4444;background:var(--ds);color:#EF4444;cursor:default;}
        .upvote-btn.voted .heart{animation:heartPop .4s cubic-bezier(.34,1.56,.64,1);}
        .share-btn{display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:12px;border:1px solid var(--border);background:transparent;color:var(--txt2);font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:.2s;}
        .share-btn:hover{background:var(--surface-h);border-color:var(--border-s);color:var(--txt);}
        .delete-btn{margin-left:auto;display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:12px;border:1px solid transparent;background:transparent;color:var(--txt3);font-size:12px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:.2s;}
        .delete-btn:hover{border-color:var(--danger);background:var(--ds);color:var(--danger);}

        .cp-fab{position:fixed;bottom:34px;left:50%;transform:translateX(-50%);width:62px;height:62px;border-radius:22px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;box-shadow:0 12px 36px var(--ag),0 4px 12px rgba(0,0,0,.3);z-index:400;border:none;transition:all .35s cubic-bezier(.34,1.56,.64,1);}
        .cp-fab:hover{transform:translateX(-50%) scale(1.1) rotate(8deg);}

        .modal-overlay{position:fixed;inset:0;background:var(--mbg);display:flex;align-items:flex-end;justify-content:center;z-index:1000;backdrop-filter:blur(18px);animation:fadeIn .25s ease;}
        .upload-card{width:100%;max-width:520px;background:var(--mcard);border:1px solid var(--border-s);border-radius:34px 34px 0 0;padding:22px 20px 38px;animation:sheetUp .38s cubic-bezier(.16,1,.3,1) both;max-height:94vh;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--scroll) transparent;}
        .sheet-handle{width:38px;height:4px;background:var(--border-s);border-radius:2px;margin:0 auto 20px;}
        .modal-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
        .modal-title{font-family:'Syne',sans-serif;font-size:19px;font-weight:800;letter-spacing:-.4px;}
        .modal-close{width:32px;height:32px;border-radius:9px;background:var(--surface);border:1px solid var(--border);color:var(--txt2);font-size:15px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s;}
        .modal-close:hover{background:var(--ds);border-color:var(--danger);color:var(--danger);}
        .preview-img{width:100%;height:185px;object-fit:cover;border-radius:18px;border:1px solid var(--border);margin-bottom:14px;}
        .modal-textarea{width:100%;height:86px;background:var(--surface);border:1px solid var(--border-s);border-radius:14px;padding:13px 15px;color:var(--txt);font-size:14px;font-weight:500;font-family:'DM Sans',sans-serif;outline:none;resize:none;transition:.2s;margin-bottom:12px;}
        .modal-textarea::placeholder{color:var(--txt3);}
        .modal-textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--as);background:var(--surface-h);}
        .map-btn{width:100%;padding:12px;border-radius:13px;border:1.5px solid var(--accent);background:var(--as);color:var(--accent);font-weight:700;font-size:14px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:.2s;margin-bottom:12px;display:flex;align-items:center;justify-content:center;gap:8px;}
        .map-btn:hover,.map-btn.active{background:var(--accent);color:#fff;box-shadow:0 8px 22px var(--ag);}
        .map-wrapper{margin-bottom:12px;border-radius:18px;overflow:hidden;border:1px solid var(--border-s);animation:fadeIn .3s ease;}
        .loc-badge{display:flex;align-items:flex-start;gap:7px;font-size:12px;color:var(--accent);font-weight:600;background:var(--as);border:1px solid rgba(59,130,246,.2);padding:9px 13px;border-radius:12px;margin-bottom:12px;line-height:1.4;}
        .publish-btn{width:100%;padding:15px;background:var(--accent);color:#fff;border:none;border-radius:15px;font-weight:800;font-size:15px;font-family:'DM Sans',sans-serif;cursor:pointer;box-shadow:0 10px 26px var(--ag);transition:all .25s cubic-bezier(.34,1.56,.64,1);letter-spacing:-.3px;display:flex;align-items:center;justify-content:center;gap:10px;}
        .publish-btn:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 16px 34px var(--ag);}
        .publish-btn:disabled{opacity:.45;cursor:not-allowed;}

        .section-divider{display:flex;align-items:center;gap:10px;margin:8px 0 16px;padding:0 4px;}
        .section-divider-line{flex:1;height:1px;background:var(--border);}
        .section-divider-label{font-size:11px;font-weight:800;color:var(--txt3);letter-spacing:.5px;text-transform:uppercase;white-space:nowrap;}

        .empty-state{text-align:center;padding:60px 20px;color:var(--txt3);}
        .empty-state .icon{font-size:46px;margin-bottom:14px;opacity:.5;}
        .empty-state p{font-size:14px;font-weight:600;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
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
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </div>
      </nav>

      <button className="cp-fab" onClick={() => fileInputRef.current.click()} title="Report an issue">📸</button>
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display:"none" }} onChange={handleFileChange} />

      <main className="cp-feed">
        <div className="cp-feed-hdr">
          <h1 className="cp-feed-title">Community<br />Reports</h1>
          <p className="cp-feed-sub"><span>{feedLoading ? "…" : feedPosts.length} active issues</span> near you</p>
        </div>

        {/* LEADERBOARD */}
        <Leaderboard data={leaderboard} expanded={lbExpanded} onToggle={() => setLbExpanded(v => !v)} currentUserId={user?.id} />

        {/* NEARBY MAP */}
        <div className="map-widget" style={{ animationDelay:"80ms" }}>
          <div className="map-widget-hdr">
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontSize:20 }}>🗺️</span>
              <div>
                <div className="widget-title">Issues Near You</div>
                <div className="widget-sub">{feedPosts.filter(p => p.latitude && p.longitude).length > 0 ? `${feedPosts.filter(p => p.latitude && p.longitude).length} mapped issues` : "Be the first to pin one!"}</div>
              </div>
            </div>
            <div style={{ fontSize:10,fontWeight:700,color:"var(--txt3)",background:"var(--tag)",padding:"4px 10px",borderRadius:20,border:"1px solid var(--border-s)" }}>🟢 You &nbsp;🔴 Issues</div>
          </div>
          <NearbyMap posts={feedPosts} userLocation={userLocation} />
        </div>

        {/* TIPS */}
        <TipsCard expanded={showTips} onToggle={() => setShowTips(v => !v)} />

        {/* ══ VERIFIED REPORTS SECTION ══ */}
        <VerifiedReportsSection
          posts={posts}
          currentUserId={user?.id}
          onApprove={handleCitizenApprove}
          approvingId={approvingId}
        />

        {/* FEED DIVIDER */}
        <div className="section-divider">
          <div className="section-divider-line" />
          <span className="section-divider-label">Latest Reports</span>
          <div className="section-divider-line" />
        </div>

        {/* SKELETONS */}
        {feedLoading && [1,2].map(i => (
          <div key={i} className="skel-card">
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:12 }}>
              <div className="skeleton" style={{ width:70,height:20 }} />
              <div className="skeleton" style={{ width:40,height:16 }} />
            </div>
            <div className="skeleton" style={{ width:"80%",height:16,marginBottom:8 }} />
            <div className="skeleton" style={{ width:"50%",height:14,marginBottom:16 }} />
            <div className="skeleton" style={{ width:"100%",height:200 }} />
          </div>
        ))}

        {!feedLoading && feedPosts.length === 0 && (
          <div className="empty-state">
            <div className="icon">📭</div>
            <p>No pending reports. Tap 📸 to be the first!</p>
          </div>
        )}

        {/* FEED CARDS — only pending posts */}
        {!feedLoading && feedPosts.map((post, i) => (
          <div key={post.id} className="social-card" style={{ animationDelay:`${i * 65}ms` }}>
            <div className="card-body">
              <div className="card-top">
                <div className="card-tags">
                  <span className="card-cat" style={{ color:"#3B82F6" }}>Report</span>
                  {post.status && (
                    <span className="card-status" style={{ color:statusColors[post.status]||"#888", background:`${statusColors[post.status]||"#888"}18`, border:`1px solid ${statusColors[post.status]||"#888"}30` }}>
                      {post.status}
                    </span>
                  )}
                </div>
                <span className="card-time">{post.time}</span>
              </div>
              <p className="post-desc">{post.description}</p>
              <span className="post-loc">📍 {post.address}</span>
            </div>
            <div className="img-wrap">
              <img src={post.image} className="post-img" alt="Issue" loading="lazy" />
              <div className="img-overlay" />
            </div>
            <div className="card-footer">
              <button type="button" className={`upvote-btn ${votedIds.has(post.id) ? "voted" : ""}`} onClick={() => handleVote(post.id)} aria-pressed={votedIds.has(post.id)}>
                <span className="heart">❤️</span>
                <span>{post.votes}</span>
              </button>
              <button className="share-btn">↗ Share</button>
              {user?.id && post.user_id === user.id && (
                <button className="delete-btn" onClick={() => setDeleteTarget(post)}>🗑️ Delete</button>
              )}
            </div>
          </div>
        ))}
      </main>

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
                <span style={{ flexShrink:0 }}>📍</span>
                <div>
                  <div style={{ fontWeight:700 }}>{location.address.split(",").slice(0,2).join(",")}</div>
                  <div style={{ fontSize:10,color:"var(--txt2)",marginTop:2 }}>{location.address.split(",").slice(2,5).join(",").trim()}</div>
                </div>
              </div>
            )}
            <button className="publish-btn" onClick={handlePost} disabled={!canPublish}>
              {publishing ? <><Spinner size={16} /> Publishing…</> : !description.trim() ? "✏️ Add a description first" : !location.address ? "📍 Pin a location on the map" : "Publish Report →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
