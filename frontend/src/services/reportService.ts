import axios from 'axios';
import { Report } from '@/types/report';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Mock data for fallback
const MOCK_REPORTS: Report[] = [
  {
    id: 1,
    fullName: "Nguyễn Văn A",
    phone: "0901234567",
    latitude: 16.0544,
    longitude: 108.2022,
    priority: "HIGH",
    status: "PENDING",
    description: "Nhà bị ngập sâu 1m",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM"
  },
  {
    id: 2,
    fullName: "Trần Thị B",
    phone: "0912345678",
    latitude: 16.0600,
    longitude: 108.2100,
    priority: "HIGH",
    status: "PENDING",
    description: "Cần cấp cứu khẩn cấp",
    address: "456 Lê Lợi, Quận 1, TP.HCM"
  },
  {
    id: 3,
    fullName: "Lê Văn C",
    phone: "0923456789",
    latitude: 16.0480,
    longitude: 108.1950,
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    description: "Mái nhà bị hư hỏng",
    address: "789 Trần Hưng Đạo, Quận 1, TP.HCM"
  },
  {
    id: 4,
    fullName: "Phạm Thị D",
    phone: "0934567890",
    latitude: 16.0650,
    longitude: 108.2150,
    priority: "MEDIUM",
    status: "PENDING",
    description: "Cây đã đổ chắn đường",
    address: "321 Ngô Quyền, Quận 1, TP.HCM"
  },
  {
    id: 5,
    fullName: "Đinh Văn E",
    phone: "0945678901",
    latitude: 16.0500,
    longitude: 108.2000,
    priority: "LOW",
    status: "COMPLETED",
    description: "Dọn vệ sinh sau bão",
    address: "654 Hai Bà Trưng, Quận 1, TP.HCM"
  }
];

export const reportService = {
  // Get all reports
  getAllReports: async (): Promise<Report[]> => {
    try {
      const response = await apiClient.get('/reports');
      return response.data || MOCK_REPORTS;
    } catch (error) {
      console.warn('Error fetching reports, using mock data:', error);
      return MOCK_REPORTS;
    }
  },

  // Get report by ID
  getReportById: async (id: number): Promise<Report | null> => {
    try {
      const response = await apiClient.get(`/reports/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Error fetching report ${id}:`, error);
      return MOCK_REPORTS.find(r => r.id === id) || null;
    }
  },

  // Update report status
  updateReportStatus: async (id: number, status: string): Promise<Report | null> => {
    try {
      const response = await apiClient.patch(`/reports/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating report ${id}:`, error);
      return null;
    }
  },

  // Filter reports
  filterReports: async (filters: any): Promise<Report[]> => {
    try {
      const response = await apiClient.get('/reports', { params: filters });
      return response.data || MOCK_REPORTS;
    } catch (error) {
      console.warn('Error filtering reports, using mock data:', error);
      return MOCK_REPORTS;
    }
  },
};
