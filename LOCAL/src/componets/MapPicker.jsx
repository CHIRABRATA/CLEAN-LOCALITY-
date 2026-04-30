import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L from "leaflet";

// ─── FIX FOR MISSING MARKER ICON ───
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ setLocation }) {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      setLoading(true);

      try {
        // ─── REVERSE GEOCODING CALL ───
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const displayName = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

        setLocation({
          lat: lat,
          lng: lng,
          address: displayName
        });
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn("⏱️ Geocoding timeout — using coordinates");
          setLocation({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
        } else {
          console.error("❌ Geocoding failed:", error.message);
          setLocation({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
        }
      } finally {
        setLoading(false);
      }
    }
  });

  return position ? (
    <Marker position={position}>
      {loading && <div style={{ background: 'white', color: 'black', padding: '2px' }}>Locating...</div>}
    </Marker>
  ) : null;
}

export default function MapPicker({ setLocation }) {
  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        center={[22.5726, 88.3639]}
        zoom={13}
        style={{ height: "280px", width: "100%", borderRadius: "16px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker setLocation={setLocation} />
      </MapContainer>
      
      <div style={hintStyle}>
        Click on the map to set location
      </div>
    </div>
  );
}

const hintStyle = {
  position: "absolute", bottom: "10px", left: "10px", zIndex: 1000,
  background: "rgba(0,0,0,0.7)", color: "white", padding: "4px 10px",
  borderRadius: "8px", fontSize: "10px", pointerEvents: "none"
};