export interface Volunteer {
  id: number;
  fullName: string;
  phone: string;
  latitude: number;
  longitude: number;
  status: 'AVAILABLE' | 'ON_DUTY' | 'OFFLINE';
  assignedReports?: number[];
  createdAt?: string;
  updatedAt?: string;
}
