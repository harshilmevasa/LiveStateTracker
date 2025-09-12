import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useApi = <T>(endpoint: string): ApiResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(`API Error (${endpoint}):`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};

// Specific hooks for different API endpoints
export const useBookingHeatmap = () => {
  return useApi<{ date: string; bookings: number; isHotDay: boolean }[]>('/api/bookings/heatmap');
};

export const useBookingTrends = (months: number = 12) => {
  return useApi<any[]>(`/api/bookings/trends?months=${months}`);
};

export const useDailyStats = (days: number = 30) => {
  return useApi<any[]>(`/api/bookings/daily?days=${days}`);
};

export const useRecentBookings = (limit: number = 10) => {
  return useApi<any[]>(`/api/bookings/recent?limit=${limit}`);
};

export const useCityStats = () => {
  return useApi<any[]>('/api/bookings/cities');
};

export const useOverallStats = () => {
  return useApi<any>('/api/bookings/stats');
};
