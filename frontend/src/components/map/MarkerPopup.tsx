'use client';

import React from 'react';
import { Report } from '@/types/report';

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: '🔴 Khẩn cấp',
  MEDIUM: '🟡 Cần tiếp tế',
  RESOLVED: '🟢 Đã xử lý',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  IN_PROGRESS: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

interface MarkerPopupProps {
  report: Report;
  onNavigate: (reportId: number) => void;
}

export const MarkerPopup: React.FC<MarkerPopupProps> = ({ report, onNavigate }) => {
  const createdAt = report.createdAt
    ? new Date(report.createdAt).toLocaleString('vi-VN')
    : '';

  return (
    <div className="min-w-[220px] font-sans text-sm leading-relaxed">
      <div className="bg-blue-800 text-white -mx-5 -mt-3 mb-2 px-3 py-2 font-bold text-xs rounded-t">
        📍 CASE: {report.caseCode}
      </div>
      <p className="font-bold text-base text-gray-900 mb-1">{report.fullName}</p>
      <p className="text-gray-600 text-xs mb-0.5">📞 {report.phone}</p>
      <p className="text-gray-600 text-xs mb-0.5">📍 {report.address}</p>
      <p className="text-gray-600 text-xs mb-0.5">
        🏙️ {report.province}
        {report.district ? ` – ${report.district}` : ''}
      </p>
      <p className="text-xs mb-0.5">🏷️ {report.category || 'Chưa phân loại'}</p>
      <p className="text-xs mb-1">
        {PRIORITY_LABELS[report.priority] || report.priority} ·{' '}
        {STATUS_LABELS[report.status] || report.status}
      </p>
      <p className="text-xs text-gray-500 border-t pt-2 mb-2">{report.description}</p>
      {createdAt && (
        <p className="text-[10px] text-gray-400 mb-2">Gửi lúc: {createdAt}</p>
      )}
      <button
        type="button"
        onClick={() => onNavigate(report.id)}
        className="w-full bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold py-2 rounded-md"
      >
        Xem chi tiết →
      </button>
    </div>
  );
};
