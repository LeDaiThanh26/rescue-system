export interface Report {
  id: number;
  fullName: string;
  phone: string;
  latitude: number;
  longitude: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportFilter {
  priority?: string;
  status?: string;
  category?: string;
}

export interface MapState {
  reports: Report[];
  selectedReport: Report | null;
  filters: ReportFilter;
  loading: boolean;
  error: string | null;
}
