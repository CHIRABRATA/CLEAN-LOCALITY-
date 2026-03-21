import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";

function LocationMarker({ setLocation }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLocation({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    }
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ setLocation }) {
  return (
    <MapContainer
      center={[22.5726, 88.3639]}
      zoom={13}
      style={{ height: "250px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
      <LocationMarker setLocation={setLocation}/>
    </MapContainer>
  );
}