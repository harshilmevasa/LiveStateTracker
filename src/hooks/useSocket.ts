import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface BookingEvent {
  _id?: string;
  email: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  groupSize: string;
  visaClass: string;
  originalAppointmentString: string;
  createdAt: string;
  telegramNotified: boolean;
}

interface UserStats {
  totalUsers: number;
  activeToday: number;
  appointmentsThisWeek: number;
  appointmentsThisMonth: number;
  newUsersThisMonth: number;
  downloadsToday: number;
  downloadsThisWeek: number;
  totalAppointmentsBooked: number;
  lastUpdated: Date;
}

interface CityStats {
  city: string;
  bookings: number;
  activeUsers: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  popular: boolean;
  lastUpdated: Date;
}

interface SocketData {
  recentBookings: BookingEvent[];
  stats: UserStats | null;
  cityStats: CityStats[];
}

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [recentBookings, setRecentBookings] = useState<BookingEvent[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [newBookingCount, setNewBookingCount] = useState(0);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    const connectSocket = () => {
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      newSocket.on('connect', () => {
        console.log('🔌 Connected to WebSocket server');
        setConnected(true);
        setSocket(newSocket);
        reconnectAttempts.current = 0;
        
        // Request initial data
        newSocket.emit('request:initial-data');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from WebSocket server:', reason);
        setConnected(false);
        
        // Auto-reconnect logic
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`🔄 Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          setTimeout(connectSocket, 2000 * reconnectAttempts.current);
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('🔌 Connection error:', error);
        setConnected(false);
      });

      // Handle initial data
      newSocket.on('data:initial', (data: SocketData) => {
        console.log('📊 Received initial data:', data);
        setRecentBookings(data.recentBookings || []);
        setStats(data.stats);
        setCityStats(data.cityStats || []);
      });

      // Handle new booking events
      newSocket.on('booking:new', (booking: BookingEvent) => {
        console.log('🎯 New booking received:', booking);
        
        setRecentBookings(prev => {
          const updated = [booking, ...prev.slice(0, 9)];
          return updated;
        });
        
        setNewBookingCount(prev => prev + 1);
        
        // Update stats immediately for any new appointment booking
        setStats(prev => prev ? {
          ...prev,
          totalAppointmentsBooked: prev.totalAppointmentsBooked + 1
        } : null);
      });

      // Handle stats updates
      newSocket.on('data:stats', (newStats: UserStats) => {
        setStats(newStats);
      });

      // Handle city stats updates
      newSocket.on('data:city-stats', (newCityStats: CityStats[]) => {
        setCityStats(newCityStats);
      });

      // Handle errors
      newSocket.on('error', (error: { message: string }) => {
        console.error('🔌 Socket error:', error.message);
      });

      return newSocket;
    };

    const socketInstance = connectSocket();

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  // Method to manually request fresh data
  const refreshData = () => {
    if (socket && connected) {
      socket.emit('request:initial-data');
    }
  };

  return {
    connected,
    recentBookings,
    stats,
    cityStats,
    newBookingCount,
    refreshData,
    resetNewBookingCount: () => setNewBookingCount(0)
  };
};
