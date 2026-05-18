"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// @ts-expect-error: _getIconUrl is internal but we need to delete it
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 16, { duration: 0.8 });
  }, [lat, lng, map]);
  return null;
}

const rescueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LeafletMapClientProps {
  address: string;
  lat: string | number | null;
  lng: string | number | null;
  height?: number;
}

export default function LeafletMapClient({
  address,
  lat,
  lng,
  height = 280,
}: LeafletMapClientProps) {
  const latNum = parseFloat(String(lat ?? ""));
  const lngNum = parseFloat(String(lng ?? ""));
  const hasCoords = !isNaN(latNum) && !isNaN(lngNum) && lat !== "" && lng !== "";

  const defaultCenter: [number, number] = [16.047, 108.206];
  const center: [number, number] = hasCoords ? [latNum, lngNum] : defaultCenter;
  const zoom = hasCoords ? 16 : 5;

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-slate-300 shadow-sm"
      style={{ height, zIndex: 0 }}
    >
      <div className="absolute top-2 left-2 z-[1000] flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full px-2.5 py-1 shadow-sm pointer-events-none">
        <span className={`w-2 h-2 rounded-full ${hasCoords ? "bg-green-500 animate-pulse" : "bg-amber-400"}`} />
        <span className="text-[10px] font-bold text-slate-600">
          {hasCoords ? "📍 Đã xác định vị trí" : "🔍 Chưa có tọa độ — nhấn Tìm tọa độ"}
        </span>
      </div>

      <div className="absolute bottom-1 right-1 z-[1000] bg-white/80 backdrop-blur-sm rounded px-1.5 py-0.5 pointer-events-none">
        <span className="text-[9px] text-slate-500">© OpenStreetMap</span>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {hasCoords && (
          <>
            <MapFlyTo lat={latNum} lng={lngNum} />
            <Marker position={[latNum, lngNum]} icon={rescueIcon}>
              <Popup maxWidth={240}>
                <div className="text-xs">
                  <p className="font-bold text-red-600 mb-1">🆘 Điểm kêu cứu</p>
                  <p className="text-slate-700 leading-relaxed">{address || "Vị trí cứu hộ"}</p>
                  <p className="font-mono text-slate-500 mt-1 text-[10px]">
                    {latNum.toFixed(6)}°N · {lngNum.toFixed(6)}°E
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
}
