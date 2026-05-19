"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const volIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const incidentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  volunteers?: any[];
  incidents?: any[];
  center?: [number, number];
  zoom?: number;
}

export default function Map({
  volunteers = [],
  incidents = [],
  center = [10.762622, 106.660172] as [number, number],
  zoom = 13
}: MapProps) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%", zIndex: 0 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {volunteers.map((v: any, i: number) => {
        if (!v.location) return null;
        const [lat, lng] = v.location.split(',').map(Number);
        if (isNaN(lat) || isNaN(lng)) return null;
        return (
          <Marker key={`vol-${i}-${lat}-${lng}`} position={[lat, lng]} icon={volIcon}>
            <Popup><strong>{v.name || "Bạn (TNV)"}</strong></Popup>
          </Marker>
        );
      })}

      {incidents.map((inc: any, i: number) => {
        if (!inc.location) return null;
        const [lat, lng] = inc.location.split(',').map(Number);
        if (isNaN(lat) || isNaN(lng)) return null;
        return (
          <Marker key={`inc-${i}-${lat}-${lng}`} position={[lat, lng]} icon={incidentIcon}>
            <Popup><strong>Sự cố</strong><br />{inc.address}</Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
