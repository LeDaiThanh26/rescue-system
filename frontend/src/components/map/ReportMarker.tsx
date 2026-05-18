'use client';

import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Report } from '@/types/report';
import { MarkerPopup } from './MarkerPopup';

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: '#EF4444',
  MEDIUM: '#F59E0B',
  RESOLVED: '#22C55E',
};

function makeDivIcon(priority: string) {
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

interface ReportMarkerProps {
  report: Report;
  onMarkerClick?: (report: Report) => void;
  onNavigate?: (reportId: number) => void;
}

export const ReportMarker: React.FC<ReportMarkerProps> = ({
  report,
  onMarkerClick,
  onNavigate = () => {},
}) => {
  const icon = useMemo(() => makeDivIcon(report.priority), [report.priority]);

  if (!report.latitude || !report.longitude) return null;

  return (
    <Marker
      position={[report.latitude, report.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onMarkerClick?.(report),
      }}
    >
      <Popup>
        <MarkerPopup report={report} onNavigate={onNavigate} />
      </Popup>
    </Marker>
  );
};
