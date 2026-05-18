'use client';

import React, { useState } from 'react';
import { Report } from '@/types/report';
import { reportService } from '@/services/reportService';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  IN_PROGRESS: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: '🔴 Khẩn cấp',
  MEDIUM: '🟡 Cần tiếp tế',
  RESOLVED: '🟢 Đã xử lý',
};

export const CaseTracker: React.FC = () => {
  const [caseCode, setCaseCode] = useState('');
  const [result, setResult] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async () => {
    if (!caseCode.trim()) {
      setError('Vui lòng nhập mã case');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await reportService.trackCase(caseCode.trim());
      if (data) {
        setResult(data);
      } else {
        setError(`Không tìm thấy case "${caseCode}"`);
      }
    } catch {
      setError('Lỗi khi tra cứu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        🔍 Tra cứu trạng thái
      </h3>

      <div className="flex gap-2 mb-3">
        <input
          id="case-tracker-input"
          type="text"
          value={caseCode}
          onChange={(e) => setCaseCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
          placeholder="Nhập mã case (VD: DN001)"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          id="case-tracker-btn"
          type="button"
          onClick={handleTrack}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-sm font-semibold px-3 py-2 rounded-md transition"
        >
          {loading ? '...' : 'Tìm'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      {result && (
        <div className="border border-gray-200 rounded-md p-3 space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-800">{result.caseCode}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                STATUS_COLORS[result.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {STATUS_LABELS[result.status] || result.status}
            </span>
          </div>

          <div className="text-gray-700 space-y-1">
            <p><span className="font-semibold">Họ tên:</span> {result.fullName}</p>
            <p><span className="font-semibold">Địa chỉ:</span> {result.address}</p>
            <p><span className="font-semibold">Tỉnh/TP:</span> {result.province}</p>
            <p><span className="font-semibold">Loại:</span> {result.category}</p>
            <p>
              <span className="font-semibold">Mức độ:</span>{' '}
              {PRIORITY_LABELS[result.priority] || result.priority}
            </p>
            <p>
              <span className="font-semibold">Đơn vị phụ trách:</span>{' '}
              {result.assignedUnit || 'Chưa phân công'}
            </p>
            <p>
              <span className="font-semibold">Tình nguyện viên:</span>{' '}
              {result.assignedVolunteer || 'Chưa phân công'}
            </p>
          </div>

          <div className="border-t pt-2 text-xs text-gray-500">
            <p>
              Cập nhật lần cuối:{' '}
              {new Date(result.updatedAt || result.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
