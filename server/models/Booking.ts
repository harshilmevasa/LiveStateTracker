export interface BookingEvent {
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

export interface CityStats {
  _id?: string;
  city: string;
  bookings: number;
  activeUsers: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  popular: boolean;
  lastUpdated: Date;
}

export interface DailyStats {
  _id?: string;
  date: string;
  totalBookings: number;
  cities: string[];
  popularVisaClasses: string[];
  groupSizes: { single: number; group: number };
}

export interface UserStats {
  _id?: string;
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

export interface DashboardStats {
  _id?: string;
  Key: string;
  TotalUsers: string;
  NewUsersThisMonth: string;
  DownloadsToday: string;
  DownloadsThisWeek: string;
  BaseBookedCounter?: string;
}

// Collection names
export const COLLECTIONS = {
  BOOKINGS: 'USVisaBookings',
  CITY_STATS: 'CityStats',
  DAILY_STATS: 'DailyStats', 
  USER_STATS: 'UserStats',
  DASHBOARD_STATS: 'DashboardStats'
} as const;
