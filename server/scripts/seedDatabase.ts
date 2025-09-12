import { MongoClient } from 'mongodb';
import { BookingEvent, CityStats, UserStats, COLLECTIONS } from '../models/Booking.js';

const MONGODB_URI = "mongodb+srv://Replyai:6LEMHdXQ1hIzquu4@cluster0.3d7niti.mongodb.net/ReplyAI";
const DB_NAME = 'USVisa';

const cities = ['Halifax', 'Vancouver', 'Ottawa', 'Toronto', 'Montreal', 'Calgary'];
const visaTypes = [
  'B1/B2 Business & Tourism',
  'F1 Student Visa',
  'H1B Work Visa',
  'O1 Extraordinary Ability',
  'L1 Intracompany Transfer'
];

const generateRandomBookings = (count: number): BookingEvent[] => {
  const bookings: BookingEvent[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const visaType = visaTypes[Math.floor(Math.random() * visaTypes.length)];
    
    // Generate timestamps from the past 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    // Generate future appointment date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 90) + 1);
    
    // Generate appointment time
    const hours = Math.floor(Math.random() * 12) + 8; // 8-19
    const minutes = ['00', '15', '30', '45'][Math.floor(Math.random() * 4)];
    const appointmentTime = `${hours}:${minutes}`;
    
    const booking: BookingEvent = {
      email: `user${i}@example.com`,
      appointmentDate: futureDate.toLocaleDateString('en-GB'), // DD/MM/YYYY format
      appointmentTime: appointmentTime,
      location: city as string,
      groupSize: Math.random() > 0.7 ? 'group' : 'single',
      visaClass: visaType as string,
      originalAppointmentString: `${futureDate.toLocaleDateString('en-GB')} at ${appointmentTime} - ${city}`,
      createdAt: createdAt.toISOString(),
      telegramNotified: Math.random() > 0.3
    };

    bookings.push(booking);
  }

  return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const generateCityStats = (bookings: BookingEvent[]): CityStats[] => {
  const cityStatsMap = new Map<string, CityStats>();

  // Initialize city stats
  cities.forEach(city => {
    cityStatsMap.set(city, {
      city,
      bookings: 0,
      activeUsers: Math.floor(Math.random() * 5000) + 1000,
      trend: Math.random() > 0.7 ? 'down' : Math.random() > 0.3 ? 'up' : 'stable',
      trendValue: `+${(Math.random() * 25 + 5).toFixed(1)}%`,
      popular: Math.random() > 0.5,
      lastUpdated: new Date()
    });
  });

  // Calculate actual stats from bookings
  bookings.forEach(booking => {
    const cityStats = cityStatsMap.get(booking.location);
    if (cityStats) {
      cityStats.bookings++;
    }
  });

  return Array.from(cityStatsMap.values()).sort((a, b) => b.bookings - a.bookings);
};

const generateUserStats = (bookings: BookingEvent[]): UserStats => {
  const totalBookings = bookings.length;
  
  return {
    totalUsers: 15247,
    activeToday: Math.floor(Math.random() * 200) + 150,
    appointmentsThisWeek: Math.floor(Math.random() * 500) + 200,
    appointmentsThisMonth: Math.floor(Math.random() * 2000) + 800,
    newUsersThisMonth: Math.floor(Math.random() * 500) + 200,
    downloadsToday: Math.floor(Math.random() * 50) + 20,
    downloadsThisWeek: Math.floor(Math.random() * 300) + 100,
    totalAppointmentsBooked: totalBookings,
    lastUpdated: new Date()
  };
};

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔌 Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.collection(COLLECTIONS.BOOKINGS).deleteMany({});
    await db.collection(COLLECTIONS.CITY_STATS).deleteMany({});
    await db.collection(COLLECTIONS.USER_STATS).deleteMany({});
    
    // Generate and insert booking events
    console.log('📊 Generating booking events...');
    const bookings = generateRandomBookings(1000); // Generate 1000 random bookings
    await db.collection(COLLECTIONS.BOOKINGS).insertMany(bookings as any[]);
    console.log(`✅ Inserted ${bookings.length} booking events`);
    
    // Generate and insert city stats
    console.log('🌍 Generating city statistics...');
    const cityStats = generateCityStats(bookings);
    await db.collection(COLLECTIONS.CITY_STATS).insertMany(cityStats as any[]);
    console.log(`✅ Inserted ${cityStats.length} city statistics`);
    
    // Generate and insert user stats
    console.log('👥 Generating user statistics...');
    const userStats = generateUserStats(bookings);
    await db.collection(COLLECTIONS.USER_STATS).insertOne(userStats as any);
    console.log('✅ Inserted user statistics');
    
    console.log('🎉 Database seeding completed successfully!');
    
    // Print summary
    console.log('\n📈 Summary:');
    console.log(`Total bookings: ${bookings.length}`);
    console.log(`Cities: ${cityStats.length}`);
    console.log(`Total users: ${userStats.totalUsers}`);
    console.log(`Appointments this month: ${userStats.appointmentsThisMonth}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding script
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };
