"use client";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Professional pulsing blue icon for volunteer
const volIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
          <div class="relative w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
         </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Red marker for incident
const incidentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapAutoCenter({ volunteers, incidents }: { volunteers: any[], incidents: any[] }) {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngExpression[] = [];

    volunteers.forEach(v => {
      if (v.location) {
        const coords = v.location.split(',').map(Number);
        if (coords.length === 2 && !coords.some(isNaN)) {
          points.push([coords[0], coords[1]]);
        }
      }
    });

    incidents.forEach(inc => {
      if (inc.location) {
        const coords = inc.location.split(',').map(Number);
        if (coords.length === 2 && !coords.some(isNaN)) {
          points.push([coords[0], coords[1]]);
        }
      }
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [volunteers, incidents, map]);

  return null;
}

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
  
  const polylinePoints = useMemo(() => {
    if (volunteers.length === 0 || incidents.length === 0) return [];
    
    const volLoc = volunteers[0].location;
    const incLoc = incidents[0].location;
    
    if (!volLoc || !incLoc) return [];
    
    const v = volLoc.split(',').map((n: string) => Number(n.trim()));
    const i = incLoc.split(',').map((n: string) => Number(n.trim()));
    
    if (v.length === 2 && i.length === 2 && !v.concat(i).some(isNaN)) {
      return [[v[0], v[1]], [i[0], i[1]]] as [number, number][];
    }
    return [];
  }, [volunteers, incidents]);

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%", zIndex: 0 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {volunteers.map((v: any, idx: number) => {
        if (!v.location) return null;
        const coords = v.location.split(',').map(Number);
        if (coords.length !== 2 || coords.some(isNaN)) return null;
        return (
          <Marker key={`vol-${idx}`} position={[coords[0], coords[1]]} icon={volIcon}>
            <Popup>
              <div className="text-center font-sans">
                <p className="font-bold">{v.name || "Vị trí của bạn"}</p>
                <p className="text-xs text-blue-500">Đang hoạt động</p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {incidents.map((inc: any, idx: number) => {
        if (!inc.location) return null;
        const coords = inc.location.split(',').map(Number);
        if (coords.length !== 2 || coords.some(isNaN)) return null;
        return (
          <Marker key={`inc-${idx}`} position={[coords[0], coords[1]]} icon={incidentIcon}>
            <Popup>
              <div className="font-sans min-w-[120px]">
                <p className="font-bold text-red-600 mb-1 flex items-center gap-1">
                   Sự cố khẩn cấp
                </p>
                <p className="text-sm">{inc.address || "Chưa có địa chỉ"}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {polylinePoints.length === 2 && (
        <Polyline
          positions={polylinePoints}
          color="#2563EB"
          weight={4}
          dashArray="8, 12"
          opacity={0.8}
        />
      )}

      <MapAutoCenter volunteers={volunteers} incidents={incidents} />
    </MapContainer>
  );
}
