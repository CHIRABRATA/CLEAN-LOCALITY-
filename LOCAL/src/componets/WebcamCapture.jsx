import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

export default function WebcamCapture({ onCapture, onClose }) {
  const webcamRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [facingMode, setFacingMode] = useState("user");

  const handleUserMediaError = () => {
    setCameraError(true);
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Convert base64 to Blob and then to File
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], `webcam-${Date.now()}.jpg`, { type: "image/jpeg" });
            onCapture(file, imageSrc);
          });
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  if (cameraError) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
        color: "var(--txt2)"
      }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>📷</div>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>Camera access denied or not available</p>
        <p style={{ fontSize: 12, color: "var(--txt3)", lineHeight: 1.5 }}>
          Please check your browser permissions and ensure your device has a camera. You can still upload photos using the file selector above.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        background: "var(--bg2)",
        border: "1px solid var(--border-s)",
        aspectRatio: "4/3"
      }}>
        <Webcam
          ref={webcamRef}
          onUserMediaError={handleUserMediaError}
          onLoadingTimeout={() => setCameraError(true)}
          onUserMedia={() => setIsCameraReady(true)}
          facingMode={facingMode}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.95}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
        
        {!isCameraReady && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 10
          }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid rgba(255,255,255,.2)", borderTopColor: "#fff", animation: "spin .8s linear infinite" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.7)", fontWeight: 600 }}>Initializing camera…</span>
          </div>
        )}

        {/* Capture indicator circle */}
        <div style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "#EF4444",
          boxShadow: "0 0 12px rgba(239,68,68,.8)",
          animation: "pulse 2s ease-in-out infinite"
        }} />
      </div>

      <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
        <button
          onClick={capturePhoto}
          disabled={!isCameraReady}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, #4F8EF7, #FF6B9D)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 800,
            cursor: isCameraReady ? "pointer" : "not-allowed",
            opacity: isCameraReady ? 1 : 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all .25s cubic-bezier(.34,1.56,.64,1)",
            fontFamily: "'DM Sans',sans-serif",
            boxShadow: "0 8px 20px rgba(79,142,247,.3)"
          }}
          onMouseEnter={(e) => !isCameraReady ? null : e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
        >
          📸 Click Photo
        </button>

        <button
          onClick={toggleCamera}
          disabled={!isCameraReady}
          style={{
            width: "100%",
            padding: "10px 16px",
            borderRadius: "11px",
            border: "1.5px solid var(--border-s)",
            background: "var(--surface)",
            color: "var(--txt2)",
            fontSize: 13,
            fontWeight: 700,
            cursor: isCameraReady ? "pointer" : "not-allowed",
            opacity: isCameraReady ? 1 : 0.5,
            transition: "all .2s",
            fontFamily: "'DM Sans',sans-serif"
          }}
          onMouseEnter={(e) => !isCameraReady ? null : (e.target.style.background = "var(--surface-h)", e.target.style.color = "var(--txt)")}
          onMouseLeave={(e) => (e.target.style.background = "var(--surface)", e.target.style.color = "var(--txt2)")}
        >
          🔄 {facingMode === "user" ? "Use Back Camera" : "Use Front Camera"}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
