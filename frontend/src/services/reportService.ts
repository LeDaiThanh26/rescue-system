import axios from 'axios';
import { Report, ReportFilter, ReportPayload, ReportResponse } from '@/types/report';
import { applyClientFilters } from '@/utils/mapFilters';
import MOCK_DATA from '@/data/mockReports.json';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

const MOCK_REPORTS: Report[] = MOCK_DATA as Report[];

export const reportService = {
  // UC01 – GET /api/reports
  getAllReports: async (): Promise<Report[]> => {
    try {
      const response = await apiClient.get<Report[]>('/reports');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return MOCK_REPORTS;
    } catch {
      console.warn('Backend không kết nối được, dùng mock data');
      return MOCK_REPORTS;
    }
  },

  // UC03, UC04 – GET /api/reports?province=&priority=&status=&category=&keyword=
  filterReports: async (filters: ReportFilter): Promise<Report[]> => {
    try {
      const response = await apiClient.get<Report[]>('/reports', { params: filters });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return MOCK_REPORTS;
    } catch {
      console.warn('Error filtering reports, dùng mock data');
      return applyClientFilters(MOCK_REPORTS, filters);
    }
  },


  // UC02 – GET /api/reports/{id}
  getReportById: async (id: number): Promise<Report | null> => {
    try {
      const response = await apiClient.get<Report>(`/reports/${id}`);
      return response.data;
    } catch {
      return MOCK_REPORTS.find((r) => r.id === id) || null;
    }
  },

  // UC05 – GET /api/reports/track/{caseCode}
  trackCase: async (caseCode: string): Promise<Report | null> => {
    try {
      const response = await apiClient.get<Report>(
        `/reports/track/${encodeURIComponent(caseCode)}`
      );
      return response.data;
    } catch {
      return (
        MOCK_REPORTS.find(
          (r) => r.caseCode.toLowerCase() === caseCode.toLowerCase()
        ) || null
      );
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

// ── Dùng cho /report page ───────────────────────────────────────────────────
const reportApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

export async function submitReport(payload: ReportPayload): Promise<ReportResponse> {
  const { data } = await reportApiClient.post<ReportResponse>('/api/report', payload);
  return data;
}
