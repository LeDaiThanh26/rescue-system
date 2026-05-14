'use client';

import React, { useState, useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import type L from 'leaflet';
import { Report } from '@/types/report';
import { MarkerPopup } from './MarkerPopup';

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
  const [isOpen, setIsOpen] = useState(false);

  const markerIcon = useMemo(() => {
    if (typeof window === 'undefined') return null;
    
    const getMarkerColor = (priority: string) => {
      switch (priority) {
        case 'HIGH':
          return '#EF4444'; // Red
        case 'MEDIUM':
          return '#F97316'; // Orange
        case 'LOW':
          return '#22C55E'; // Green
        default:
          return '#6B7280'; // Gray
      }
    };

    const color = getMarkerColor(report.priority);
    const { Icon } = require('leaflet');
    const icon = new Icon({
      iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${encodeURIComponent(color)}'%3E%3Cpath d='M12 0C7.58 0 4 3.58 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z'/%3E%3C/svg%3E`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
      shadowSize: [41, 41],
      shadowAnchor: [13, 41],
    });
    return icon;
  }, [report.priority]);

  const handleClose = () => setIsOpen(false);

  if (!markerIcon || !report.latitude || !report.longitude) {
    return null;
  }

  return (
    <Marker
      position={[report.latitude, report.longitude]}
      icon={markerIcon}
      eventHandlers={{
        click: () => {
          setIsOpen(true);
          onMarkerClick?.(report);
        },
      }}
    >
      {isOpen && (
        <Popup onClose={handleClose}>
          <MarkerPopup
            report={report}
            onClose={handleClose}
            onNavigate={onNavigate}
          />
        </Popup>
      )}
    </Marker>
  );
};
