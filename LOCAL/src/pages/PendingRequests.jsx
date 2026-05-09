import React from 'react';
import { supabase } from '../supabaseClient';

const PendingRequests = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.hash = "#/login";
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={iconStyle}>⏳</div>
        <h1 style={titleStyle}>Registration Pending</h1>
        <p style={textStyle}>
          Your request to register as an Authority is currently under review. 
          An administrator will verify your credentials shortly.
        </p>
        <div style={infoBoxStyle}>
          <p style={infoTextStyle}>
            Once approved, you will be able to access the Authority Console and manage reports in your jurisdiction.
          </p>
        </div>
        <button onClick={handleLogout} style={buttonStyle}>
          Sign Out
        </button>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const containerStyle = {
  height: '100vh',
  background: '#050609',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  fontFamily: "'DM Sans', sans-serif",
  color: '#f5f5fb',
};

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '24px',
  padding: '40px',
  maxWidth: '450px',
  width: '100%',
  textAlign: 'center',
  animation: 'fadeIn 0.6s ease-out forwards',
};

const iconStyle = {
  fontSize: '64px',
  marginBottom: '24px',
};

const titleStyle = {
  fontSize: '28px',
  fontWeight: '800',
  marginBottom: '16px',
  background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const textStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: 'rgba(245, 245, 251, 0.6)',
  marginBottom: '24px',
};

const infoBoxStyle = {
  background: 'rgba(124, 58, 237, 0.1)',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  borderRadius: '16px',
  padding: '16px',
  marginBottom: '32px',
};

const infoTextStyle = {
  fontSize: '14px',
  color: '#C4B5FD',
  margin: 0,
};

const buttonStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#f5f5fb',
  padding: '12px 32px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

export default PendingRequests;
