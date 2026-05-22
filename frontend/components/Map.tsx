"use client";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const volIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center">
          <div class="absolute w-6 h-6 bg-blue-500 rounded-full opacity-40 animate-ping"></div>
          <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>
         </div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

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
        const [lat, lng] = v.location.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) points.push([lat, lng]);
      }
    });

    incidents.forEach(inc => {
      if (inc.location) {
        const [lat, lng] = inc.location.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) points.push([lat, lng]);
      }
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
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
  const polylinePoints: [number, number][] = [];

  if (volunteers.length > 0 && incidents.length > 0) {
    const volLoc = volunteers[0]?.location;
    const incLoc = incidents[0]?.location;

    if (volLoc && incLoc) {
      const [vLat, vLng] = volLoc.split(',').map((n: string) => Number(n.trim()));
      const [iLat, iLng] = incLoc.split(',').map((n: string) => Number(n.trim()));
      if (!isNaN(vLat) && !isNaN(vLng) && !isNaN(iLat) && !isNaN(iLng)) {
        polylinePoints.push([vLat, vLng], [iLat, iLng]);
      }
    }
  }

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%", zIndex: 0 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {volunteers.map((v: any, i: number) => {
        if (!v.location) return null;
        const [lat, lng] = v.location.split(',').map(Number);
        if (isNaN(lat) || isNaN(lng)) return null;
        return (
          <Marker key={`vol-${i}-${lat}-${lng}`} position={[lat, lng]} icon={volIcon}>
            <Popup><strong>{v.name || "Vị trí của bạn"}</strong></Popup>
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

      {polylinePoints.length === 2 && (
        <Polyline
          positions={polylinePoints}
          color="#3B82F6"
          weight={4}
          dashArray="10, 10"
          opacity={0.7}
        />
      )}

      <MapAutoCenter volunteers={volunteers} incidents={incidents} />
    </MapContainer>
  );
}
