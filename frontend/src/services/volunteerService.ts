import axios from 'axios';
import { Volunteer } from '@/types/volunteer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const volunteerService = {

  getAllVolunteers: async (): Promise<Volunteer[]> => {
    try {
      const response = await apiClient.get('/volunteers');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      return [];
    }
  },


  getVolunteerById: async (id: number): Promise<Volunteer | null> => {
    try {
      const response = await apiClient.get(`/volunteers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching volunteer ${id}:`, error);
      return null;
    }
  },


  getAvailableVolunteers: async (): Promise<Volunteer[]> => {
    try {
      const response = await apiClient.get('/volunteers', {
        params: { status: 'AVAILABLE' },
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching available volunteers:', error);
      return [];
    }
  },
};
