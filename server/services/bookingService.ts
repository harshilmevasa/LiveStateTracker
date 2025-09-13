import { getDB } from '../config/database.js';
import { BookingEvent, CityStats, DailyStats, UserStats, DashboardStats, CityLocation, COLLECTIONS } from '../models/Booking.js';

export class BookingService {
  private getDatabase() {
    return getDB();
  }

  // Helper function to safely parse createdAt dates with hour 24 fix
  private getCreatedAtDateStage() {
    return {
      $addFields: {
        createdAtDate: {
          $cond: [
            { $eq: [{ $type: "$createdAt" }, "date"] },
            // If already a date, use it directly
            "$createdAt",
            // If it's a string, parse it with hour 24 fix
            {
              $dateFromString: {
                dateString: {
                  $let: {
                    vars: {
                      fixedDateString: {
                        $cond: [
                          { $regexMatch: { input: "$createdAt", regex: "T24:" } },
                          {
                            $concat: [
                              { $substr: ["$createdAt", 0, 11] }, // Date part + "T"
                              "00:", // Replace hour 24 with 00
                              { $substr: ["$createdAt", 14, -1] } // Rest of the time string
                            ]
                          },
                          "$createdAt"
                        ]
                      }
                    },
                    in: "$$fixedDateString"
                  }
                }
              }
            }
          ]
        }
      }
    };
  }

  // Get recent booking events for live feed
  async getRecentBookings(limit: number = 10): Promise<BookingEvent[]> {
    try {
      const db = this.getDatabase();
      
      // Use aggregation to properly handle invalid dates
      const bookings = await db
        .collection<BookingEvent>(COLLECTIONS.BOOKINGS)
        .aggregate([
          this.getCreatedAtDateStage(),
          { $sort: { createdAtDate: -1 } },
          { $limit: limit },
          {
            $addFields: {
              // Replace the original createdAt with the fixed date as string
              createdAt: {
                $dateToString: {
                  date: "$createdAtDate",
                  format: "%Y-%m-%dT%H:%M:%S.%LZ"
                }
              }
            }
          },
          {
            $project: {
              createdAtDate: 0 // Remove the helper field
            }
          }
        ])
        .toArray();
      
      return bookings as BookingEvent[];
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
      throw error;
    }
  }

  // Create a new booking event
  async createBookingEvent(booking: Omit<BookingEvent, '_id'>): Promise<BookingEvent> {
    try {
      const db = this.getDatabase();
      const result = await db
        .collection<BookingEvent>(COLLECTIONS.BOOKINGS)
        .insertOne(booking);
      
      return { ...booking, _id: result.insertedId.toString() };
    } catch (error) {
      console.error('Error creating booking event:', error);
      throw error;
    }
  }

  // Get city performance statistics
  async getCityStats(): Promise<CityStats[]> {
    try {
      const db = this.getDatabase();
      const stats = await db
        .collection<CityStats>(COLLECTIONS.CITY_STATS)
        .find({})
        .sort({ bookings: -1 })
        .toArray();
      
      return stats;
    } catch (error) {
      console.error('Error fetching city stats:', error);
      throw error;
    }
  }

  // Get overall statistics - now calculated in real-time from data
  async getOverallStats(): Promise<UserStats | null> {
    try {
      // Get real-time counts
      const currentTotalBookings = await this.getTotalBookings();
      const currentTotalUsers = await this.getTotalUsersFromDashboard();
      const currentNewUsersThisMonth = await this.getNewUsersThisMonthFromDashboard();
      const currentDownloadsToday = await this.getDownloadsTodayFromDashboard();
      const currentDownloadsThisWeek = await this.getDownloadsThisWeekFromDashboard();
      const { activeToday } = await this.calculateDailyStats();
      const { appointmentsThisWeek } = await this.calculateWeeklyStats();
      const { appointmentsThisMonth } = await this.calculateMonthlyStats();
      
      // Return dynamically calculated stats
      const stats: UserStats = {
        totalUsers: currentTotalUsers,
        activeToday: activeToday,
        appointmentsThisWeek: appointmentsThisWeek,
        appointmentsThisMonth: appointmentsThisMonth,
        newUsersThisMonth: currentNewUsersThisMonth,
        downloadsToday: currentDownloadsToday,
        downloadsThisWeek: currentDownloadsThisWeek,
        totalAppointmentsBooked: currentTotalBookings,
        lastUpdated: new Date()
      };
      
      return stats;
    } catch (error) {
      console.error('Error calculating overall stats:', error);
      throw error;
    }
  }

  // Get daily statistics for charts
  async getDailyStats(days: number = 30): Promise<DailyStats[]> {
    try {
      const db = this.getDatabase();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const pipeline = [
        {
          $match: {
            createdAt: { $gte: cutoffDate.toISOString() }
          }
        },
        this.getCreatedAtDateStage(),
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAtDate"
              }
            },
            appointments: { $sum: 1 },
            uniqueUsers: { $addToSet: "$email" },
            locations: { $addToSet: "$location" },
            visaClasses: { $push: "$visaClass" },
            groupSizes: { 
              $push: {
                $cond: [{ $eq: ["$groupSize", "single"] }, "single", "group"]
              }
            }
          }
        },
        {
          $project: {
            date: "$_id",
            appointments: 1,
            users: { $size: "$uniqueUsers" },
            cities: { $size: "$locations" },
            popularVisaClasses: {
              $slice: [
                { $setUnion: "$visaClasses" },
                3
              ]
            },
            groupSizes: {
              single: {
                $size: {
                  $filter: {
                    input: "$groupSizes",
                    cond: { $eq: ["$$this", "single"] }
                  }
                }
              },
              group: {
                $size: {
                  $filter: {
                    input: "$groupSizes", 
                    cond: { $eq: ["$$this", "group"] }
                  }
                }
              }
            },
            _id: 0
          }
        },
        { $sort: { date: 1 } }
      ];
      
      const stats = await db
        .collection<BookingEvent>(COLLECTIONS.BOOKINGS)
        .aggregate(pipeline)
        .toArray();
      
      return stats as DailyStats[];
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      throw error;
    }
  }

  // Get booking activity for heatmap (last 365 days)
  async getBookingHeatmapData(): Promise<{ date: string; bookings: number; isHotDay: boolean }[]> {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const pipeline = [
        {
          $match: {
            createdAt: { $gte: oneYearAgo.toISOString() }
          }
        },
        this.getCreatedAtDateStage(),
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAtDate"
              }
            },
            bookings: { $sum: 1 }
          }
        },
        {
          $project: {
            date: "$_id",
            bookings: 1,
            isHotDay: { $gte: ["$bookings", 50] },
            _id: 0
          }
        },
        { $sort: { date: 1 } }
      ];
      
      const db = this.getDatabase();
      const data = await db
        .collection<BookingEvent>(COLLECTIONS.BOOKINGS)
        .aggregate(pipeline)
        .toArray();
      
      return data as { date: string; bookings: number; isHotDay: boolean }[];
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      throw error;
    }
  }

  // Get booking trend data for charts
  async getBookingTrends(months: number = 12): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const pipeline = [
        {
          $match: {
            createdAt: { $gte: startDate.toISOString() }
          }
        },
        this.getCreatedAtDateStage(),
        {
          $group: {
            _id: {
              year: { $year: "$createdAtDate" },
              month: { $month: "$createdAtDate" }
            },
            bookings: { $sum: 1 },
            uniqueUsers: { $addToSet: "$email" }
          }
        },
        {
          $project: {
            month: {
              $arrayElemAt: [
                ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                { $subtract: ["$_id.month", 1] }
              ]
            },
            bookings: 1,
            users: { $size: "$uniqueUsers" },
            successRate: 100, // All bookings are successful appointments
            cumulativeBookings: "$bookings",
            _id: 1
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ];
      
      const db = this.getDatabase();
      const trends = await db
        .collection<BookingEvent>(COLLECTIONS.BOOKINGS)
        .aggregate(pipeline)
        .toArray();
      
      // Calculate cumulative bookings
      let cumulative = 0;
      const trendsWithCumulative = trends.map(trend => {
        cumulative += trend.bookings;
        return {
          ...trend,
          cumulativeBookings: cumulative
        };
      });
      
      return trendsWithCumulative;
    } catch (error) {
      console.error('Error fetching booking trends:', error);
      throw error;
    }
  }

  // Update city statistics
  async updateCityStats(city: string, bookingType: 'success' | 'attempt'): Promise<void> {
    try {
      const increment = bookingType === 'success' ? 1 : 0;
      
      const db = this.getDatabase();
      await db.collection<CityStats>(COLLECTIONS.CITY_STATS).updateOne(
        { city },
        {
          $inc: { 
            bookings: 1,
            successfulBookings: increment 
          },
          $set: { lastUpdated: new Date() }
        },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error updating city stats:', error);
      throw error;
    }
  }

  // Get total count of all appointment bookings including base counter
  async getTotalBookings(): Promise<number> {
    try {
      const db = this.getDatabase();
      const count = await db.collection<BookingEvent>(COLLECTIONS.BOOKINGS).countDocuments();
      
      // Get base booked counter from dashboard stats
      const dashboardDoc = await db
        .collection<DashboardStats>(COLLECTIONS.DASHBOARD_STATS)
        .findOne({ Key: 'dashboard' });
      
      let baseCounter = 0;
      if (dashboardDoc && dashboardDoc.BaseBookedCounter) {
        baseCounter = parseInt(dashboardDoc.BaseBookedCounter, 10) || 0;
      }
      
      return count + baseCounter;
    } catch (error) {
      console.error('Error getting total bookings:', error);
      throw error;
    }
  }

  // Get booking statistics by group size
  async getBookingStatsByGroupSize(): Promise<{total: number, single: number, group: number}> {
    try {
      const db = this.getDatabase();
      const pipeline = [
        {
          $group: {
            _id: '$groupSize',
            count: { $sum: 1 }
          }
        }
      ];
      
      const results = await db.collection<BookingEvent>(COLLECTIONS.BOOKINGS).aggregate(pipeline).toArray();
      
      const stats = { total: 0, single: 0, group: 0 };
      
      for (const result of results) {
        if (result._id === 'single') {
          stats.single = result.count;
        } else if (result._id === 'group') {
          stats.group = result.count;
        }
        stats.total += result.count;
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting booking stats by group size:', error);
      throw error;
    }
  }

  // Watch for new booking documents using MongoDB Change Streams
  async watchForNewBookings() {
    try {
      const db = this.getDatabase();
      const collection = db.collection<BookingEvent>(COLLECTIONS.BOOKINGS);
      
      // Create change stream to watch for inserts only
      const changeStream = collection.watch([
        { $match: { operationType: 'insert' } }
      ], {
        fullDocument: 'updateLookup'
      });
      
      return changeStream;
    } catch (error) {
      console.error('Error setting up change stream:', error);
      throw error;
    }
  }

  // Get total users from dashboard document
  async getTotalUsersFromDashboard(): Promise<number> {
    try {
      const db = this.getDatabase();
      const dashboardDoc = await db
        .collection<DashboardStats>(COLLECTIONS.DASHBOARD_STATS)
        .findOne({ Key: 'dashboard' });
      
      if (dashboardDoc && dashboardDoc.TotalUsers) {
        return parseInt(dashboardDoc.TotalUsers, 10);
      }
      
      return 15247; // Fallback value
    } catch (error) {
      console.error('Error fetching total users from dashboard:', error);
      return 15247; // Fallback value
    }
  }

  // Get new users this month from dashboard document
  async getNewUsersThisMonthFromDashboard(): Promise<number> {
    try {
      const db = this.getDatabase();
      const dashboardDoc = await db
        .collection<DashboardStats>(COLLECTIONS.DASHBOARD_STATS)
        .findOne({ Key: 'dashboard' });
      
      if (dashboardDoc && dashboardDoc.NewUsersThisMonth) {
        return parseInt(dashboardDoc.NewUsersThisMonth, 10);
      }
      
      return 2847; // Fallback value (higher monthly number)
    } catch (error) {
      console.error('Error fetching new users this month from dashboard:', error);
      return 2847; // Fallback value
    }
  }

  // Get downloads today from dashboard document
  async getDownloadsTodayFromDashboard(): Promise<number> {
    try {
      const db = this.getDatabase();
      const dashboardDoc = await db
        .collection<DashboardStats>(COLLECTIONS.DASHBOARD_STATS)
        .findOne({ Key: 'dashboard' });
      
      if (dashboardDoc && dashboardDoc.DownloadsToday) {
        return parseInt(dashboardDoc.DownloadsToday, 10);
      }
      
      return 23; // Fallback value
    } catch (error) {
      console.error('Error fetching downloads today from dashboard:', error);
      return 23; // Fallback value
    }
  }

  // Get downloads this week from dashboard document
  async getDownloadsThisWeekFromDashboard(): Promise<number> {
    try {
      const db = this.getDatabase();
      const dashboardDoc = await db
        .collection<DashboardStats>(COLLECTIONS.DASHBOARD_STATS)
        .findOne({ Key: 'dashboard' });
      
      if (dashboardDoc && dashboardDoc.DownloadsThisWeek) {
        return parseInt(dashboardDoc.DownloadsThisWeek, 10);
      }
      
      return 157; // Fallback value
    } catch (error) {
      console.error('Error fetching downloads this week from dashboard:', error);
      return 157; // Fallback value
    }
  }

  // Watch for changes in dashboard stats
  async watchDashboardStats() {
    try {
      const db = this.getDatabase();
      const collection = db.collection<DashboardStats>(COLLECTIONS.DASHBOARD_STATS);
      
      // Create change stream to watch for updates to the dashboard document
      const changeStream = collection.watch([
        { 
          $match: { 
            operationType: { $in: ['update', 'replace'] },
            'fullDocument.Key': 'dashboard'
          } 
        }
      ], {
        fullDocument: 'updateLookup'
      });
      
      return changeStream;
    } catch (error) {
      console.error('Error setting up dashboard change stream:', error);
      throw error;
    }
  }

  // Calculate statistics for last 24 hours
  async calculateDailyStats(): Promise<{ activeToday: number }> {
    try {
      const db = this.getDatabase();
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      // Count appointments booked in last 24 hours
      const activeToday = await db.collection<BookingEvent>(COLLECTIONS.BOOKINGS).countDocuments({
        createdAt: {
          $gte: last24Hours.toISOString(),
          $lte: now.toISOString()
        }
      });
      
      return { activeToday };
    } catch (error) {
      console.error('Error calculating daily stats:', error);
      // Return fallback values if calculation fails
      return { activeToday: 187 };
    }
  }

  // Calculate statistics for last 7 days
  async calculateWeeklyStats(): Promise<{ appointmentsThisWeek: number }> {
    try {
      const db = this.getDatabase();
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Count appointments booked in last 7 days
      const appointmentsThisWeek = await db.collection<BookingEvent>(COLLECTIONS.BOOKINGS).countDocuments({
        createdAt: {
          $gte: last7Days.toISOString(),
          $lte: now.toISOString()
        }
      });

      return { appointmentsThisWeek };
    } catch (error) {
      console.error('Error calculating weekly stats:', error);
      return { appointmentsThisWeek: 0 };
    }
  }

  // Calculate statistics for last 30 days
  async calculateMonthlyStats(): Promise<{ appointmentsThisMonth: number }> {
    try {
      const db = this.getDatabase();
      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Count appointments booked in last 30 days
      const appointmentsThisMonth = await db.collection<BookingEvent>(COLLECTIONS.BOOKINGS).countDocuments({
        createdAt: {
          $gte: last30Days.toISOString(),
          $lte: now.toISOString()
        }
      });

      return { appointmentsThisMonth };
    } catch (error) {
      console.error('Error calculating monthly stats:', error);
      return { appointmentsThisMonth: 0 };
    }
  }

  // Get top cities performance for last 6 months with monthly breakdown
  async getTopCitiesPerformance(): Promise<any[]> {
    try {
      const db = this.getDatabase();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const pipeline = [
        this.getCreatedAtDateStage(),
        {
          $match: {
            createdAtDate: { $gte: sixMonthsAgo },
            location: { $exists: true, $ne: null },
            $expr: { $ne: ["$location", ""] }
          }
        },
        {
          $group: {
            _id: {
              city: "$location",
              year: { $year: "$createdAtDate" },
              month: { $month: "$createdAtDate" }
            },
            bookings: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.city",
            totalBookings: { $sum: "$bookings" },
            monthlyData: {
              $push: {
                year: "$_id.year",
                month: "$_id.month",
                bookings: "$bookings"
              }
            }
          }
        },
        {
          $sort: { totalBookings: -1 }
        },
        {
          $limit: 10
        },
        {
          $project: {
            city: "$_id",
            totalBookings: 1,
            monthlyData: 1,
            _id: 0
          }
        }
      ];

      const topCities = await db.collection<BookingEvent>(COLLECTIONS.BOOKINGS).aggregate(pipeline).toArray();
      
      // Fill in missing months with 0 bookings for consistent chart display
      const result = topCities.map(cityData => {
        const monthlyBreakdown: { [key: string]: number } = {};
        
        // Initialize last 6 months with 0
        for (let i = 0; i < 6; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyBreakdown[monthKey] = 0;
        }
        
        // Fill in actual data
        cityData.monthlyData.forEach((month: any) => {
          const monthKey = `${month.year}-${String(month.month).padStart(2, '0')}`;
          monthlyBreakdown[monthKey] = month.bookings;
        });
        
        return {
          city: cityData.city,
          totalBookings: cityData.totalBookings,
          monthlyBreakdown
        };
      });

      return result;
    } catch (error) {
      console.error('Error fetching top cities performance:', error);
      return [];
    }
  }

  // Initialize city locations in the database if they don't exist
  async initializeCityLocations(): Promise<void> {
    try {
      const db = this.getDatabase();
      const collection = db.collection<CityLocation>(COLLECTIONS.CITY_LOCATIONS);
      
      // Check if city locations collection exists and has data
      const existingCount = await collection.countDocuments();
      
      if (existingCount === 0) {
        console.log('🌍 Initializing city locations...');
        
        // Default Canadian city locations
        const defaultCities: CityLocation[] = [
          {
            city: 'Halifax',
            country: 'Canada',
            lat: 44.6488,
            lng: -63.5752,
            timezone: 'America/Halifax',
            region: 'Atlantic',
            isActive: true,
            lastUpdated: new Date()
          },
          {
            city: 'Vancouver',
            country: 'Canada',
            lat: 49.2827,
            lng: -123.1207,
            timezone: 'America/Vancouver',
            region: 'Pacific',
            isActive: true,
            lastUpdated: new Date()
          },
          {
            city: 'Ottawa',
            country: 'Canada',
            lat: 45.4215,
            lng: -75.6972,
            timezone: 'America/Toronto',
            region: 'Central',
            isActive: true,
            lastUpdated: new Date()
          },
          {
            city: 'Toronto',
            country: 'Canada',
            lat: 43.6532,
            lng: -79.3832,
            timezone: 'America/Toronto',
            region: 'Central',
            isActive: true,
            lastUpdated: new Date()
          },
          {
            city: 'Montreal',
            country: 'Canada',
            lat: 45.5017,
            lng: -73.5673,
            timezone: 'America/Toronto',
            region: 'Central',
            isActive: true,
            lastUpdated: new Date()
          },
          {
            city: 'Calgary',
            country: 'Canada',
            lat: 51.0447,
            lng: -114.0719,
            timezone: 'America/Edmonton',
            region: 'Mountain',
            isActive: true,
            lastUpdated: new Date()
          },
          {
            city: 'Winnipeg',
            country: 'Canada',
            lat: 49.8951,
            lng: -97.1384,
            timezone: 'America/Winnipeg',
            region: 'Central',
            isActive: true,
            lastUpdated: new Date()
          },
          {
            city: 'Quebec City',
            country: 'Canada',
            lat: 46.8139,
            lng: -71.2080,
            timezone: 'America/Toronto',
            region: 'Central',
            isActive: true,
            lastUpdated: new Date()
          },
          {
            city: 'Edmonton',
            country: 'Canada',
            lat: 53.5461,
            lng: -113.4938,
            timezone: 'America/Edmonton',
            region: 'Mountain',
            isActive: true,
            lastUpdated: new Date()
          },
          {
            city: 'Saskatoon',
            country: 'Canada',
            lat: 52.1332,
            lng: -106.6700,
            timezone: 'America/Regina',
            region: 'Central',
            isActive: true,
            lastUpdated: new Date()
          }
        ];
        
        await collection.insertMany(defaultCities);
        console.log(`✅ Initialized ${defaultCities.length} city locations`);
      }
    } catch (error) {
      console.error('Error initializing city locations:', error);
    }
  }

  // Get city coordinates from the database
  async getCityCoordinates(cityName: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const db = this.getDatabase();
      const cityLocation = await db.collection<CityLocation>(COLLECTIONS.CITY_LOCATIONS)
        .findOne({ city: cityName, isActive: true });
      
      if (cityLocation) {
        return { lat: cityLocation.lat, lng: cityLocation.lng };
      }
      return null;
    } catch (error) {
      console.error(`Error getting coordinates for ${cityName}:`, error);
      return null;
    }
  }

  // Add a new city location (for dynamic expansion)
  async addCityLocation(cityData: Omit<CityLocation, '_id' | 'lastUpdated'>): Promise<void> {
    try {
      const db = this.getDatabase();
      const collection = db.collection<CityLocation>(COLLECTIONS.CITY_LOCATIONS);
      
      // Check if city already exists
      const existing = await collection.findOne({ city: cityData.city });
      if (!existing) {
        await collection.insertOne({
          ...cityData,
          lastUpdated: new Date()
        });
        console.log(`✅ Added new city location: ${cityData.city}`);
      }
    } catch (error) {
      console.error(`Error adding city location for ${cityData.city}:`, error);
    }
  }

  // Get location/map data for all cities with coordinates and real booking counts
  async getLocationMapData(): Promise<any[]> {
    try {
      const db = this.getDatabase();
      
      // Ensure city locations are initialized
      await this.initializeCityLocations();

      // Get real booking data from last 30 days for growth calculation
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const pipeline = [
        this.getCreatedAtDateStage(),
        {
          $match: {
            location: { $exists: true, $ne: null },
            $expr: { $ne: ["$location", ""] }
          }
        },
        {
          $group: {
            _id: "$location",
            totalBookings: { $sum: 1 },
            recentBookings: {
              $sum: {
                $cond: {
                  if: { $gte: ["$createdAtDate", thirtyDaysAgo] },
                  then: 1,
                  else: 0
                }
              }
            },
            previousPeriodBookings: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      { $gte: ["$createdAtDate", sixtyDaysAgo] },
                      { $lt: ["$createdAtDate", thirtyDaysAgo] }
                    ]
                  },
                  then: 1,
                  else: 0
                }
              }
            },
            uniqueEmails: { $addToSet: "$email" }
          }
        },
        {
          $project: {
            city: "$_id",
            totalBookings: 1,
            recentBookings: 1,
            previousPeriodBookings: 1,
            users: { $size: "$uniqueEmails" },
            _id: 0
          }
        },
        {
          $sort: { totalBookings: -1 }
        }
      ];

      const cityStats = await db.collection<BookingEvent>(COLLECTIONS.BOOKINGS).aggregate(pipeline).toArray();

      // Combine with coordinates and calculate growth
      const locationData = await Promise.all(
        cityStats.map(async (stat) => {
          const coordinates = await this.getCityCoordinates(stat.city);
          
          // Skip cities without coordinates
          if (!coordinates) {
            console.warn(`⚠️  No coordinates found for city: ${stat.city}`);
            return null;
          }
          
          // Calculate growth percentage
          let growth = '+0%';
          if (stat.previousPeriodBookings > 0) {
            const growthPercent = ((stat.recentBookings - stat.previousPeriodBookings) / stat.previousPeriodBookings * 100);
            growth = growthPercent >= 0 ? `+${growthPercent.toFixed(0)}%` : `${growthPercent.toFixed(0)}%`;
          } else if (stat.recentBookings > 0) {
            growth = '+100%';
          }

          return {
            city: stat.city,
            lat: coordinates.lat,
            lng: coordinates.lng,
            bookings: stat.totalBookings,
            users: stat.users,
            growth,
            recentBookings: stat.recentBookings
          };
        })
      );

      // Filter out null values (cities without coordinates)
      return locationData.filter(city => city !== null);
    } catch (error) {
      console.error('Error fetching location map data:', error);
      return [];
    }
  }

  // Get 6-month detailed breakdown for a specific city
  async getCityMonthlyBreakdown(cityName: string): Promise<any[]> {
    try {
      const db = this.getDatabase();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const pipeline = [
        this.getCreatedAtDateStage(),
        {
          $match: {
            createdAtDate: { $gte: sixMonthsAgo },
            location: cityName
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAtDate" },
              month: { $month: "$createdAtDate" }
            },
            bookings: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 }
        }
      ];

      const monthlyData = await db.collection<BookingEvent>(COLLECTIONS.BOOKINGS).aggregate(pipeline).toArray();

      // Fill in missing months with 0 bookings
      const result: any[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        const existingData = monthlyData.find(d => d._id.year === year && d._id.month === month);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        result.push({
          month: monthNames[month - 1],
          year: year,
          bookings: existingData ? existingData.bookings : 0,
          monthYear: `${monthNames[month - 1]} ${year}`
        });
      }

      return result;
    } catch (error) {
      console.error('Error fetching city monthly breakdown:', error);
      return [];
    }
  }

  // Get earliest 10 upcoming appointments for each city in the last month
  async getUpcomingAppointmentsByCity(): Promise<any[]> {
    try {
      const db = this.getDatabase();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const pipeline = [
        {
          $addFields: {
            ...this.getCreatedAtDateStage().$addFields,
            appointmentDateTime: {
              $dateFromString: {
                dateString: {
                  $concat: [
                    {
                      $cond: [
                        { $eq: ["$appointmentTime", "24:00"] },
                        {
                          $dateToString: {
                            format: "%Y-%m-%d",
                            date: { 
                              $dateAdd: {
                                startDate: { $dateFromString: { dateString: "$appointmentDate", format: "%d/%m/%Y" } },
                                unit: "day",
                                amount: 1
                              }
                            }
                          }
                        },
                        {
                          $dateToString: {
                            format: "%Y-%m-%d",
                            date: { $dateFromString: { dateString: "$appointmentDate", format: "%d/%m/%Y" } }
                          }
                        }
                      ]
                    },
                    "T",
                    {
                      $cond: [
                        { $eq: ["$appointmentTime", "24:00"] },
                        "00:00",
                        "$appointmentTime"
                      ]
                    },
                    ":00"
                  ]
                }
              }
            }
          }
        },
        {
          $match: {
            createdAtDate: { $gte: oneMonthAgo },
            location: { $exists: true, $ne: null },
            $expr: { $ne: ["$location", ""] },
            appointmentDate: { $exists: true, $ne: null },
            appointmentTime: { $exists: true, $ne: null }
          }
        },
        {
          $sort: { appointmentDateTime: 1 }
        },
        {
          $group: {
            _id: "$location",
            appointments: {
              $push: {
                appointmentDate: "$appointmentDate",
                appointmentTime: "$appointmentTime",
                appointmentDateTime: "$appointmentDateTime",
                visaClass: "$visaClass",
                groupSize: "$groupSize",
                createdAt: {
                  $dateToString: {
                    date: "$createdAtDate",
                    format: "%Y-%m-%dT%H:%M:%S.%LZ"
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            city: "$_id",
            appointments: { $slice: ["$appointments", 150] }, // Fetch more appointments to ensure 10 unique dates
            totalUpcoming: { $size: "$appointments" },
            _id: 0
          }
        },
        {
          $sort: { totalUpcoming: -1 }
        }
      ];

      const upcomingData = await db.collection<BookingEvent>(COLLECTIONS.BOOKINGS).aggregate(pipeline).toArray();
      return upcomingData;
    } catch (error) {
      console.error('Error fetching upcoming appointments by city:', error);
      return [];
    }
  }
}
