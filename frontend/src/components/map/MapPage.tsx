'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Report, ReportFilter } from '@/types/report';
import { reportService } from '@/services/reportService';
import { FilterPanel } from '@/components/map/FilterPanel';
import { useRouter } from 'next/navigation';

// Dynamic import for MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/map/MapView').then((mod) => mod.MapView), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-200">Đang tải bản đồ...</div>,
});

export default function MapPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [filters, setFilters] = useState<ReportFilter>({});
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportService.getAllReports();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    fetchReports();

    // Auto-refresh every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      fetchReports();
    }, 30000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const handleFilterChange = (newFilters: ReportFilter) => {
    setFilters(newFilters);
  };

  const handleMarkerClick = (report: Report) => {
    setSelectedReport(report);
  };

  const handleNavigate = (reportId: number) => {
    router.push(`/report/${reportId}`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Filter Panel */}
      <div className="w-64 bg-gray-50 p-4 overflow-y-auto border-r border-gray-300 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Bản Đồ Cứu Trợ</h1>
        <FilterPanel filters={filters} onFiltersChange={handleFilterChange} />

        {/* Report Summary */}
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-gray-800 mb-2">Tóm tắt</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>Tổng yêu cầu: <span className="font-bold">{reports.length}</span></p>
            <p>Khẩn cấp: <span className="font-bold text-red-600">{reports.filter((r) => r.priority === 'HIGH').length}</span></p>
            <p>Thường: <span className="font-bold text-orange-600">{reports.filter((r) => r.priority === 'MEDIUM').length}</span></p>
            <p>Thấp: <span className="font-bold text-green-600">{reports.filter((r) => r.priority === 'LOW').length}</span></p>
            <p>Chưa xử lý: <span className="font-bold text-yellow-600">{reports.filter((r) => r.status === 'PENDING').length}</span></p>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchReports}
          disabled={loading}
          className="w-full mt-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition"
        >
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1">
        <MapView
          reports={reports}
          filters={filters}
          selectedReport={selectedReport}
          loading={loading}
          onMarkerClick={handleMarkerClick}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
}
