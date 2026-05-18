'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Report, ReportFilter } from '@/types/report';
import { applyClientFilters } from '@/utils/mapFilters';
import { ReportMarker } from './ReportMarker';

interface MapViewProps {
  reports: Report[];
  filters: ReportFilter;
  loading: boolean;
  onMarkerClick?: (report: Report) => void;
  onNavigate?: (reportId: number) => void;
}

// Doc §3.1 – tâm & zoom mặc định
const DEFAULT_CENTER: [number, number] = [16.0, 108.0];
const DEFAULT_ZOOM = 6;

// Doc §3.2 – giới hạn phạm vi Việt Nam
const VIETNAM_BOUNDS: L.LatLngBoundsExpression = [
  [8.0, 102.0],
  [23.5, 110.0],
];

function FitBounds({ reports }: { reports: Report[] }) {
  const map = useMap();

  useEffect(() => {
    if (reports.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }
    const bounds = L.latLngBounds(
      reports.map((r) => [r.latitude, r.longitude] as [number, number])
    );
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
  }, [reports, map]);

  return null;
}

export const MapView: React.FC<MapViewProps> = ({
  reports,
  filters,
  loading,
  onMarkerClick,
  onNavigate,
}) => {
  const filtered = useMemo(
    () => applyClientFilters(reports, filters),
    [reports, filters]
  );

  return (
    <div className="absolute inset-0 z-0">
      {loading && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium"
        >
          ⏳ Đang tải dữ liệu...
        </div>
      )}

      {/* Chú giải – doc §5.2 */}
      <div className="absolute bottom-6 left-3 z-[1000] bg-white rounded-lg shadow-md p-3 text-xs min-w-[130px] pointer-events-none">
        <p className="font-bold mb-2">Chú giải</p>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
          <span>Khẩn cấp</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
          <span>Cần tiếp tế</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
          <span>Đã xử lý</span>
        </div>
      </div>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        maxBounds={VIETNAM_BOUNDS}
        maxBoundsViscosity={0.8}
        minZoom={5}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Doc §5.1 – marker clustering */}
        <MarkerClusterGroup chunkedLoading>
          {filtered.map((report) => (
            <ReportMarker
              key={report.id}
              report={report}
              onMarkerClick={onMarkerClick}
              onNavigate={onNavigate}
            />
          ))}
        </MarkerClusterGroup>

        <FitBounds reports={filtered} />
      </MapContainer>
    </div>
  );
};
