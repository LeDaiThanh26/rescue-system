'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Report, ReportFilter } from '@/types/report';
import { reportService } from '@/services/reportService';
import { applyClientFilters } from '@/utils/mapFilters';
import { FilterPanel } from '@/components/map/FilterPanel';
import { CaseTracker } from '@/components/map/CaseTracker';
import { useRouter } from 'next/navigation';

const MapView = dynamic(
  () => import('@/components/map/MapView').then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
        Đang tải bản đồ...
      </div>
    ),
  }
);

// Debounce helper
function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function MapPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [pendingFilters, setPendingFilters] = useState<ReportFilter>({});
  const filters = useDebounce(pendingFilters, 300); // 300ms debounce
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setSelectedReport] = useState<Report | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchReports = useCallback(async (activeFilters: ReportFilter) => {
    setLoading(true);
    setError(null);
    try {
      const hasFilters = Object.values(activeFilters).some(Boolean);
      const data = hasFilters
        ? await reportService.filterReports(activeFilters)
        : await reportService.getAllReports();
      setReports(data);
    } catch {
      setError('Không tải được dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  // UC01 + auto-refresh 60s (doc §5.1) - increased interval for performance
  useEffect(() => {
    fetchReports(filters);

    refreshIntervalRef.current = setInterval(() => {
      fetchReports(filters);
    }, 60000);

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [filters, fetchReports]);

  const displayed = useMemo(() => applyClientFilters(reports, filters), [reports, filters]);

  const stats = useMemo(() => ({
    total: displayed.length,
    highCount: displayed.filter((r) => r.priority === 'HIGH').length,
    mediumCount: displayed.filter((r) => r.priority === 'MEDIUM').length,
    resolvedCount: displayed.filter((r) => r.priority === 'RESOLVED').length,
    pendingCount: displayed.filter((r) => r.status === 'PENDING').length,
  }), [displayed]);

  const handleFilterChange = useCallback((newFilters: ReportFilter) => {
    setPendingFilters(newFilters);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="w-72 flex-shrink-0 bg-gray-50 flex flex-col border-r border-gray-300 shadow-md overflow-y-auto">
        <div className="bg-blue-700 text-white p-4">
          <h1 className="text-xl font-bold leading-tight">🗺️ Bản Đồ Cứu Trợ</h1>
          <p className="text-blue-200 text-xs mt-1">Toàn quốc Việt Nam</p>
        </div>

        <div className="p-4 space-y-4 flex-1">
          <FilterPanel filters={pendingFilters} onFiltersChange={handleFilterChange} />
          <CaseTracker />

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
              {error}
            </p>
          )}

          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">📊 Tổng quan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng yêu cầu</span>
                <span className="font-bold text-gray-800">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">🔴 Khẩn cấp</span>
                <span className="font-bold text-red-600">{stats.highCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">🟡 Cần tiếp tế</span>
                <span className="font-bold text-yellow-600">{stats.mediumCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">🟢 Đã xử lý</span>
                <span className="font-bold text-green-600">{stats.resolvedCount}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-gray-600">⏳ Chờ xử lý</span>
                <span className="font-bold text-orange-600">{stats.pendingCount}</span>
              </div>
            </div>
          </div>

          <button
            id="refresh-btn"
            type="button"
            onClick={() => fetchReports(filters)}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
          >
            {loading ? '⏳ Đang tải...' : '🔄 Làm mới'}
          </button>
        </div>
      </div>

      <div className="flex-1 relative min-h-0">
        <MapView
          reports={reports}
          filters={filters}
          loading={loading}
          onMarkerClick={setSelectedReport}
          onNavigate={(id) => router.push(`/report/${id}`)}
        />
      </div>
    </div>
  );
};
