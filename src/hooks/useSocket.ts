import { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { socket as socketInstance } from '../lib/socket';

interface BookingEvent {
  _id?: string;
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
  recentBookings: BookingEvent[]; // BookingEvent already excludes email
  stats: UserStats | null;
  cityStats: CityStats[];
}

// Auto-detect the correct socket URL based on environment
const getSocketUrl = () => {
  // If we have a specific API URL set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production (deployed), use the same domain as the frontend
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  
  // In development, use localhost
  return 'http://localhost:3001';
};

const SOCKET_URL = getSocketUrl();

const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(socketInstance);
  const [connected, setConnected] = useState(socketInstance.connected);
  const [recentBookings, setRecentBookings] = useState<BookingEvent[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [newBookingCount, setNewBookingCount] = useState(0);

  useEffect(() => {
    if (socketInstance.connected) {
      // If already connected, request initial data
      socketInstance.emit('request:initial-data');
    } else {
      // Otherwise, connect
      socketInstance.connect();
    }

    const onConnect = () => {
      // console.log('🔌 Connected to WebSocket server');
      setConnected(true);
      setSocket(socketInstance);
      // Request initial data on connect
      socketInstance.emit('request:initial-data');
    };

    const onDisconnect = (reason: Socket.DisconnectReason) => {
      // console.log('🔌 Disconnected from WebSocket server:', reason);
      setConnected(false);
    };

    const onConnectError = (error: Error) => {
      console.error('🔌 Connection error:', error);
      setConnected(false);
    };

    const onInitialData = (data: SocketData) => {
      // console.log('📊 Received initial data:', data);
      setRecentBookings(data.recentBookings || []);
      setStats(data.stats);
      setCityStats(data.cityStats || []);
    };

    const onNewBooking = (booking: BookingEvent) => {
      // console.log(`🎯 New booking received: ${booking.location} on ${booking.appointmentDate} at ${booking.appointmentTime}`);
      setRecentBookings(prev => [booking, ...prev.slice(0, 9)]);
      setNewBookingCount(prev => prev + 1);
      setStats(prev => prev ? {
        ...prev,
        totalAppointmentsBooked: prev.totalAppointmentsBooked + 1
      } : null);
    };

    const onStatsUpdate = (newStats: UserStats) => {
      setStats(newStats);
    };

    const onCityStatsUpdate = (newCityStats: CityStats[]) => {
      setCityStats(newCityStats);
    };

    const onError = (error: { message: string }) => {
      console.error('🔌 Socket error:', error.message);
    };

    // Register event listeners
    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('connect_error', onConnectError);
    socketInstance.on('data:initial', onInitialData);
    socketInstance.on('booking:new', onNewBooking);
    socketInstance.on('data:stats', onStatsUpdate);
    socketInstance.on('data:city-stats', onCityStatsUpdate);
    socketInstance.on('error', onError);

    return () => {
      // Cleanup: remove event listeners
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.off('connect_error', onConnectError);
      socketInstance.off('data:initial', onInitialData);
      socketInstance.off('booking:new', onNewBooking);
      socketInstance.off('data:stats', onStatsUpdate);
      socketInstance.off('data:city-stats', onCityStatsUpdate);
      socketInstance.off('error', onError);
    };
  }, []);

  // Method to manually request fresh data
  const refreshData = () => {
    if (socketInstance && socketInstance.connected) {
      socketInstance.emit('request:initial-data');
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

export { useSocket, getSocketUrl };
