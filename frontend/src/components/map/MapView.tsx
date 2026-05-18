'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Report, ReportFilter } from '@/types/report';

interface MapViewProps {
  reports: Report[];
  filters: ReportFilter;
  selectedReport: Report | null;
  loading: boolean;
  onMarkerClick?: (report: Report) => void;
  onNavigate?: (reportId: number) => void;
}

// Priority → colour mapping
const PRIORITY_COLORS: Record<string, string> = {
  HIGH: '#EF4444',
  MEDIUM: '#F97316',
  LOW: '#22C55E',
};

function makeIcon(priority: string) {
  const color = PRIORITY_COLORS[priority] ?? '#6B7280';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z"
            fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

export const MapView: React.FC<MapViewProps> = ({
  reports,
  filters,
  loading,
  onMarkerClick,
  onNavigate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Store the Leaflet map instance so we can remove it on cleanup
  const mapRef = useRef<L.Map | null>(null);
  // Store marker layer so we can clear/re-add without re-creating the map
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  // ── 1. Initialize map once ──────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    // Guard: destroy any previous instance (handles Strict-Mode double-invoke)
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: [16.0544, 108.2022],
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layer = L.layerGroup().addTo(map);

    mapRef.current = map;
    markerLayerRef.current = layer;

    // Cleanup: always destroy the map when the component unmounts
    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []); // run only once

  // ── 2. Sync markers whenever reports or filters change ──────────────────
  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;

    // Apply filters
    let filtered = reports;
    if (filters.priority) filtered = filtered.filter((r) => r.priority === filters.priority);
    if (filters.status)   filtered = filtered.filter((r) => r.status   === filters.status);

    // Clear old markers
    layer.clearLayers();

    if (filtered.length === 0) {
      map.setView([16.0544, 108.2022], 12);
      return;
    }

    // Add new markers
    const latLngs: L.LatLng[] = [];
    filtered.forEach((report) => {
      const latlng = L.latLng(report.latitude, report.longitude);
      latLngs.push(latlng);

      const marker = L.marker(latlng, { icon: makeIcon(report.priority) });

      const priorityLabel =
        report.priority === 'HIGH' ? '🔴 Khẩn cấp'
        : report.priority === 'MEDIUM' ? '🟠 Thường'
        : '🟢 Thấp';

      const statusLabel =
        report.status === 'PENDING' ? 'Chờ xử lý'
        : report.status === 'IN_PROGRESS' ? 'Đang xử lý'
        : report.status === 'COMPLETED' ? 'Hoàn thành'
        : report.status;

      marker.bindPopup(`
        <div style="min-width:200px;font-family:sans-serif">
          <div style="font-weight:700;font-size:14px;margin-bottom:6px">${report.fullName}</div>
          <div style="font-size:12px;color:#555;margin-bottom:4px">📞 ${report.phone}</div>
          <div style="font-size:12px;color:#555;margin-bottom:4px">📍 ${report.address}</div>
          <div style="font-size:12px;margin-bottom:4px">${priorityLabel} · ${statusLabel}</div>
          <div style="font-size:12px;color:#666;margin-bottom:8px">${report.description}</div>
          <button
            onclick="window.__mapNavigate(${report.id})"
            style="background:#3B82F6;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;width:100%"
          >Xem chi tiết</button>
        </div>
      `);

      marker.on('click', () => onMarkerClick?.(report));
      marker.addTo(layer);
    });

    // Expose navigate callback so the popup button can call it
    (window as any).__mapNavigate = (id: number) => onNavigate?.(id);

    // Fly to fit all markers
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [reports, filters, onMarkerClick, onNavigate]);

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div
          style={{ position: 'absolute', top: 16, left: 16, zIndex: 1000 }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
        >
          Đang tải dữ liệu...
        </div>
      )}

      {/* The div that Leaflet will own — never unmount this */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
