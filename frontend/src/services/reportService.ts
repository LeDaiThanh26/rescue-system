import axios from 'axios';
import { Report } from '@/types/report';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Fallback mock data — tọa độ đã được xác minh theo từng quận Đà Nẵng
const MOCK_REPORTS: Report[] = [
  {
    id: 1,
    fullName: "Nguyễn Văn An",
    phone: "0901234567",
    latitude: 16.0472,   // Hải Châu
    longitude: 108.2199,
    priority: "HIGH",
    status: "PENDING",
    description: "Nhà bị ngập sâu 1m, cần hỗ trợ khẩn cấp",
    address: "45 Trần Phú, Hải Châu, Đà Nẵng"
  },
  {
    id: 2,
    fullName: "Trần Thị Bình",
    phone: "0912345678",
    latitude: 16.1160,   // Sơn Trà
    longitude: 108.2770,
    priority: "HIGH",
    status: "PENDING",
    description: "Người già bị mắc kẹt, cần cấp cứu khẩn cấp",
    address: "12 Ngô Quyền, Sơn Trà, Đà Nẵng"
  },
  {
    id: 3,
    fullName: "Lê Văn Cường",
    phone: "0923456789",
    latitude: 16.0038,   // Ngũ Hành Sơn
    longitude: 108.2644,
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    description: "Mái nhà bị tốc hoàn toàn sau bão",
    address: "78 Lê Văn Hiến, Ngũ Hành Sơn, Đà Nẵng"
  },
  {
    id: 4,
    fullName: "Phạm Thị Dung",
    phone: "0934567890",
    latitude: 16.0673,   // Thanh Khê
    longitude: 108.1846,
    priority: "MEDIUM",
    status: "PENDING",
    description: "Cây đổ chắn đường, không thoát ra được",
    address: "33 Điện Biên Phủ, Thanh Khê, Đà Nẵng"
  },
  {
    id: 5,
    fullName: "Đinh Văn Em",
    phone: "0945678901",
    latitude: 16.1148,   // Liên Chiểu
    longitude: 108.1243,
    priority: "LOW",
    status: "COMPLETED",
    description: "Dọn dẹp vệ sinh sau bão, cần nhân lực",
    address: "201 Nguyễn Lương Bằng, Liên Chiểu, Đà Nẵng"
  }
];

export const reportService = {
  // Get all reports — thử backend trước, fallback về mock nếu DB chưa có
  getAllReports: async (): Promise<Report[]> => {
    try {
      // Thử lấy từ DB thật
      const response = await apiClient.get('/reports');
      if (response.data && response.data.length > 0) {
        return response.data;
      }
      // DB rỗng → dùng mock endpoint của backend
      const mockResponse = await apiClient.get('/mock/reports');
      return mockResponse.data || MOCK_REPORTS;
    } catch (error) {
      console.warn('Backend không kết nối được, dùng mock data:', error);
      // Fallback cuối: mock data hardcode trong frontend
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

