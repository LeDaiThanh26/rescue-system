'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Report, ReportFilter } from '@/types/report';
import { ReportMarker } from './ReportMarker';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  reports: Report[];
  filters: ReportFilter;
  selectedReport: Report | null;
  loading: boolean;
  onMarkerClick?: (report: Report) => void;
  onNavigate?: (reportId: number) => void;
}

// Fix Leaflet icon issue in Next.js
if (typeof window !== 'undefined' && L.Icon.Default.prototype) {
  const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
  const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
  const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';
  
  (L.Icon.Default.prototype as any)._getIconUrl = () => iconUrl;
  L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
}

export const MapView: React.FC<MapViewProps> = ({
  reports,
  filters,
  selectedReport,
  loading,
  onMarkerClick,
  onNavigate,
}) => {
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);

  useEffect(() => {
    // Apply filters
    let filtered = reports;

    if (filters.priority) {
      filtered = filtered.filter((r) => r.priority === filters.priority);
    }

    if (filters.status) {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    setFilteredReports(filtered);
  }, [reports, filters]);

  // Calculate center and zoom based on markers
  const getMapCenter = () => {
    if (filteredReports.length === 0) {
      return { center: [16.0544, 108.2022], zoom: 12 }; // Default: Da Nang
    }

    const latitudes = filteredReports.map((r) => r.latitude);
    const longitudes = filteredReports.map((r) => r.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    return { center: [centerLat, centerLng], zoom: 13 };
  };

  const { center, zoom } = getMapCenter();

  return (
    <div className="relative w-full h-full bg-gray-100">
      {loading && (
        <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Đang tải dữ liệu...
        </div>
      )}

      {filteredReports.length === 0 && !loading && (
        <div className="absolute top-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Không có dữ liệu cầu cứu
        </div>
      )}

      <MapContainer
        center={[center[0], center[1]]}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />

        {/* Render markers */}
        {filteredReports.map((report) => (
          <ReportMarker
            key={report.id}
            report={report}
            onMarkerClick={onMarkerClick}
            onNavigate={onNavigate}
          />
        ))}
      </MapContainer>
    </div>
  );
};
