'use client';

import React, { useMemo } from 'react';
import { ReportFilter } from '@/types/report';

interface FilterPanelProps {
  filters: ReportFilter;
  onFiltersChange: (filters: ReportFilter) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const priorityOptions = ['HIGH', 'MEDIUM', 'LOW'];
  const statusOptions = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  const handlePriorityChange = (priority: string) => {
    onFiltersChange({
      ...filters,
      priority: filters.priority === priority ? undefined : priority,
    });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: filters.status === status ? undefined : status,
    });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h3 className="font-bold mb-4 text-gray-800">Filter</h3>

      {/* Priority Filter */}
      <div className="mb-4">
        <p className="font-semibold text-sm text-gray-700 mb-2">Mức độ ưu tiên</p>
        <div className="space-y-2">
          {priorityOptions.map((priority) => (
            <label key={priority} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.priority === priority}
                onChange={() => handlePriorityChange(priority)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">{priority}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-4">
        <p className="font-semibold text-sm text-gray-700 mb-2">Trạng thái</p>
        <div className="space-y-2">
          {statusOptions.map((status) => (
            <label key={status} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.status === status}
                onChange={() => handleStatusChange(status)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">{status}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
      >
        Reset
      </button>
    </div>
  );
};
