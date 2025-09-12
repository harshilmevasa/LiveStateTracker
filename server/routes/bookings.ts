import express from 'express';
import { BookingService } from '../services/bookingService.js';

const router = express.Router();
const bookingService = new BookingService();

// GET /api/bookings/recent - Get recent booking events for live feed
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const bookings = await bookingService.getRecentBookings(limit);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({ error: 'Failed to fetch recent bookings' });
  }
});

// GET /api/bookings/stats - Get overall statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await bookingService.getOverallStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/bookings/cities - Get city performance data
router.get('/cities', async (req, res) => {
  try {
    const cityStats = await bookingService.getCityStats();
    res.json(cityStats);
  } catch (error) {
    console.error('Error fetching city stats:', error);
    res.status(500).json({ error: 'Failed to fetch city statistics' });
  }
});

// GET /api/bookings/daily - Get daily statistics for charts
router.get('/daily', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const dailyStats = await bookingService.getDailyStats(days);
    res.json(dailyStats);
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({ error: 'Failed to fetch daily statistics' });
  }
});

// GET /api/bookings/heatmap - Get heatmap data for the past year
router.get('/heatmap', async (req, res) => {
  try {
    const heatmapData = await bookingService.getBookingHeatmapData();
    res.json(heatmapData);
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

// GET /api/bookings/trends - Get booking trends for charts
router.get('/trends', async (req, res) => {
  try {
    const months = parseInt(req.query.months as string) || 12;
    const trends = await bookingService.getBookingTrends(months);
    res.json(trends);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch booking trends' });
  }
});

// GET /api/bookings/top-cities - Get top cities performance for last 6 months
router.get('/top-cities', async (req, res) => {
  try {
    const topCities = await bookingService.getTopCitiesPerformance();
    res.json(topCities);
  } catch (error) {
    console.error('Error fetching top cities performance:', error);
    res.status(500).json({ error: 'Failed to fetch top cities performance' });
  }
});

// GET /api/bookings/locations - Get location map data with real coordinates and booking counts
router.get('/locations', async (req, res) => {
  try {
    const locationData = await bookingService.getLocationMapData();
    res.json(locationData);
  } catch (error) {
    console.error('Error fetching location map data:', error);
    res.status(500).json({ error: 'Failed to fetch location map data' });
  }
});

// GET /api/bookings/city/:cityName/monthly - Get 6-month monthly breakdown for a specific city
router.get('/city/:cityName/monthly', async (req, res) => {
  try {
    const { cityName } = req.params;
    const monthlyBreakdown = await bookingService.getCityMonthlyBreakdown(cityName);
    res.json(monthlyBreakdown);
  } catch (error) {
    console.error('Error fetching city monthly breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch city monthly breakdown' });
  }
});

// GET /api/bookings/upcoming-by-city - Get earliest 10 upcoming appointments for each city
router.get('/upcoming-by-city', async (req, res) => {
  try {
    const upcomingAppointments = await bookingService.getUpcomingAppointmentsByCity();
    res.json(upcomingAppointments);
  } catch (error) {
    console.error('Error fetching upcoming appointments by city:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming appointments by city' });
  }
});

export default router;
