'use client';

import React from 'react';
import { ReportFilter } from '@/types/report';
import { ProvinceSelector } from './ProvinceSelector';

const PRIORITY_OPTIONS = [
  { value: 'HIGH', label: '🔴 Khẩn cấp' },
  { value: 'MEDIUM', label: '🟡 Cần tiếp tế' },
  { value: 'RESOLVED', label: '🟢 Đã xử lý' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: '⏳ Chờ xử lý' },
  { value: 'IN_PROGRESS', label: '🔄 Đang xử lý' },
  { value: 'COMPLETED', label: '✅ Hoàn thành' },
  { value: 'CANCELLED', label: '❌ Đã hủy' },
];

const CATEGORY_OPTIONS = ['Y tế', 'Lương thực', 'Nhà ở', 'Cơ sở hạ tầng', 'Khác'];

export const FilterPanel: React.FC<{
  filters: ReportFilter;
  onFiltersChange: (filters: ReportFilter) => void;
}> = ({ filters, onFiltersChange }) => {
  const toggleField = (field: keyof ReportFilter, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: filters[field] === value ? undefined : value,
    });
  };

  const hasActiveFilters =
    !!filters.province ||
    !!filters.priority ||
    !!filters.status ||
    !!filters.category ||
    !!filters.keyword;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-800">🔧 Bộ lọc</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onFiltersChange({})}
            className="text-xs text-red-500 hover:text-red-700 underline"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      <div>
        <label className="block font-semibold text-sm text-gray-700 mb-1">Tìm kiếm</label>
        <input
          id="filter-keyword"
          type="text"
          value={filters.keyword || ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, keyword: e.target.value || undefined })
          }
          placeholder="Mã case, tên, địa chỉ..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <ProvinceSelector
        value={filters.province}
        onChange={(province) =>
          onFiltersChange({ ...filters, province: province || undefined })
        }
      />

      <div>
        <p className="font-semibold text-sm text-gray-700 mb-2">Mức độ ưu tiên</p>
        <div className="space-y-1">
          {PRIORITY_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id={`priority-${value}`}
                checked={filters.priority === value}
                onChange={() => toggleField('priority', value)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="font-semibold text-sm text-gray-700 mb-2">Trạng thái</p>
        <div className="space-y-1">
          {STATUS_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id={`status-${value}`}
                checked={filters.status === value}
                onChange={() => toggleField('status', value)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="font-semibold text-sm text-gray-700 mb-2">Loại nhu cầu</p>
        <div className="space-y-1">
          {CATEGORY_OPTIONS.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id={`category-${cat}`}
                checked={filters.category === cat}
                onChange={() => toggleField('category', cat)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-gray-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        id="filter-reset-btn"
        type="button"
        onClick={() => onFiltersChange({})}
        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md transition text-sm"
      >
        Reset bộ lọc
      </button>
    </div>
  );
};
