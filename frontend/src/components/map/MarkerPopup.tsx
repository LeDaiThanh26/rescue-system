'use client';

import React from 'react';
import { Report } from '@/types/report';

interface MarkerPopupProps {
  report: Report;
  onClose: () => void;
  onNavigate: (reportId: number) => void;
}

export const MarkerPopup: React.FC<MarkerPopupProps> = ({ report, onClose, onNavigate }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600';
      case 'MEDIUM':
        return 'text-orange-600';
      case 'LOW':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500 w-64">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-800">{report.fullName}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg font-bold"
        >
          ×
        </button>
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-700">
        <div>
          <p className="font-semibold text-gray-600">Điện thoại</p>
          <p>{report.phone}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-600">Địa chỉ</p>
          <p>{report.address || `${report.latitude}, ${report.longitude}`}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-600">Mô tả</p>
          <p className="text-gray-600">{report.description}</p>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`font-semibold ${getPriorityColor(report.priority)}`}>
            {report.priority}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(report.status)}`}>
            {report.status}
          </span>
        </div>
      </div>

      <button
        onClick={() => onNavigate(report.id)}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded transition"
      >
        Xem chi tiết
      </button>
    </div>
  );
};
