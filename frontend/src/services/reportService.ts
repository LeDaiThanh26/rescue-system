import axios from 'axios';
import { Report, ReportFilter, ReportPayload, ReportResponse } from '@/types/report';
import { applyClientFilters } from '@/utils/mapFilters';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const reportService = {

  getAllReports: async (): Promise<Report[]> => {
    try {
      const response = await apiClient.get<Report[]>('/reports');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch {
      console.warn('Backend không kết nối được, trả về mảng rỗng');
      return [];
    }
  },


  filterReports: async (filters: ReportFilter): Promise<Report[]> => {
    try {
      const response = await apiClient.get<Report[]>('/reports', { params: filters });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch {
      console.warn('Error filtering reports, trả về mảng rỗng');
      return [];
    }
  },



  getReportById: async (id: number): Promise<Report | null> => {
    try {
      const response = await apiClient.get<Report>(`/reports/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },


  trackCase: async (caseCode: string): Promise<Report | null> => {
    try {
      const response = await apiClient.get<Report>(
        `/reports/track/${encodeURIComponent(caseCode)}`
      );
      return response.data;
    } catch {
      return null;
    }
  },

  updateReportStatus: async (id: number, status: string): Promise<Report | null> => {
    try {
      const response = await apiClient.patch<{ data: Report }>(`/reports/${id}/status`, {
        status,
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating report ${id}:`, error);
      return null;
    }
  },
};


const reportApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

export async function submitReport(payload: ReportPayload): Promise<ReportResponse> {
  const { data } = await reportApiClient.post<ReportResponse>('/api/report', payload);
  return data;
}
