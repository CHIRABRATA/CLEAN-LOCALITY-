import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

/* ═══════════════════════════════════════════════════════
   GLOBAL CSS — Premium Profile Theme
═══════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');

    .profile-page {
      min-height: 100vh; background: #02000d; color: #fff;
      font-family: 'DM Sans', sans-serif; display: flex;
      align-items: center; justify-content: center; padding: 40px 20px;
      position: relative; overflow: hidden;
    }

    /* Animated Background */
    .bg-grid {
      position: absolute; inset: -100%;
      background-image: linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px), 
                        linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px);
      background-size: 50px 50px; transform: rotateX(60deg);
      animation: gridMove 30s linear infinite; z-index: 0;
    }
    @keyframes gridMove { from { background-position: 0 0; } to { background-position: 0 50px; } }

    /* Profile Card */
    .profile-card {
      position: relative; z-index: 10; width: 100%; max-width: 500px;
      background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(35px);
      border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 35px;
      padding: 40px; box-shadow: 0 40px 100px rgba(0,0,0,0.6);
      animation: profileSlide 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    @keyframes profileSlide { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

    /* Avatar Logic */
    .avatar-circle {
      width: 90px; height: 90px; border-radius: 30px;
      background: linear-gradient(135deg, #7C3AED, #3B82F6);
      display: flex; align-items: center; justify-content: center;
      font-size: 32px; font-weight: 800; font-family: 'Syne';
      margin: 0 auto 25px; box-shadow: 0 15px 30px rgba(124, 58, 237, 0.4);
    }

    /* Fields & Editing */
    .field-group { margin-bottom: 25px; }
    .label { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
    .value { font-size: 17px; font-weight: 600; color: #fff; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    
    .edit-input {
      width: 100%; background: rgba(255,255,255,0.05); border: 1px solid #7C3AED;
      border-radius: 12px; padding: 12px 15px; color: #fff; font-size: 16px;
      outline: none; transition: 0.3s;
    }

    /* Buttons */
    .btn-row { display: flex; gap: 12px; margin-top: 30px; }
    .btn-main {
      flex: 1; padding: 14px; border-radius: 16px; border: none;
      font-weight: 700; cursor: pointer; transition: 0.3s;
    }
    .btn-primary { background: linear-gradient(135deg, #7C3AED, #3B82F6); color: #fff; }
    .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; }
    .btn-logout { background: rgba(239, 68, 68, 0.1); color: #FCA5A5; border: 1px solid rgba(239, 68, 68, 0.2); margin-top: 15px; width: 100%; }

    .btn-main:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
  `}</style>
);

export default function CitizenProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.hash = "#/login";
      return;
    }

    const { data, error } = await supabase
      .from("citizens")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error) {
      setProfile(data);
      setEditForm({ name: data.name, phone: data.phone, address: data.address });
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("citizens")
      .update({
        name: editForm.name,
        phone: editForm.phone,
        address: editForm.address
      })
      .eq("id", profile.id);

    if (error) {
      alert("Update failed: " + error.message);
    } else {
      setIsEditing(false);
      fetchProfile();
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="profile-page">
      <h2 style={{ fontFamily: 'Syne' }}>Syncing Identity...</h2>
    </div>
  );

  return (
    <div className="profile-page">
      <GlobalStyles />
      <div className="bg-grid" />

      {profile && (
        <div className="profile-card">
          {/* Avatar Area */}
          <div className="avatar-area">
            <div className="avatar-circle">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
              <h1 style={{ fontFamily: 'Syne', fontSize: '24px', letterSpacing: '-1px' }}>
                Citizen Profile
              </h1>
              <span style={{ fontSize: '12px', opacity: 0.4 }}>Verified Account</span>
            </div>
          </div>

          {/* User ID - Permanent */}
          <div className="field-group">
            <div className="label">Unique Identity (ID)</div>
            <div className="value" style={{ opacity: 0.5, fontSize: '13px' }}>{profile.id}</div>
          </div>

          {/* Editable Fields */}
          <div className="field-group">
            <div className="label">Full Name</div>
            {isEditing ? (
              <input 
                className="edit-input" 
                value={editForm.name} 
                onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
              />
            ) : (
              <div className="value">{profile.name}</div>
            )}
          </div>

          <div className="field-group">
            <div className="label">Contact Phone</div>
            {isEditing ? (
              <input 
                className="edit-input" 
                value={editForm.phone} 
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
              />
            ) : (
              <div className="value">{profile.phone}</div>
            )}
          </div>

          <div className="field-group">
            <div className="label">Primary Address / Ward</div>
            {isEditing ? (
              <textarea 
                className="edit-input" 
                style={{ height: '80px', resize: 'none' }}
                value={editForm.address} 
                onChange={(e) => setEditForm({...editForm, address: e.target.value})} 
              />
            ) : (
              <div className="value">{profile.address}</div>
            )}
          </div>

          <div className="field-group">
            <div className="label">Citizen Since</div>
            <div className="value">{new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
          </div>

          {/* Action Buttons */}
          <div className="btn-row">
            {isEditing ? (
              <>
                <button className="btn-main btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="btn-main btn-primary" onClick={handleUpdate}>Save Changes</button>
              </>
            ) : (
              <button className="btn-main btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>

          {!isEditing && (
            <button 
              className="btn-main btn-logout" 
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.hash = "#/login";
              }}
            >
              Secure Logout
            </button>
          )}
        </div>
      )}
    </div>
  );
}