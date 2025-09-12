import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb+srv://Replyai:6LEMHdXQ1hIzquu4@cluster0.3d7niti.mongodb.net/ReplyAI";
const DB_NAME = 'USVisa';

interface HealthCheckResult {
  database: boolean;
  collections: boolean;
  dataCount: {
    bookings: number;
    cityStats: number;
    userStats: number;
  };
  errors: string[];
}

async function performHealthCheck(): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    database: false,
    collections: false,
    dataCount: { bookings: 0, cityStats: 0, userStats: 0 },
    errors: []
  };

  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🏥 Starting health check...');

    // Test database connection
    await client.connect();
    await client.db(DB_NAME).admin().ping();
    result.database = true;
    console.log('✅ Database connection: OK');

    const db = client.db(DB_NAME);

    // Check collections exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (collectionNames.includes('USVisaBookings') && 
        collectionNames.includes('CityStats') && 
        collectionNames.includes('UserStats')) {
      result.collections = true;
      console.log('✅ Required collections: OK');
    } else {
      result.errors.push('Missing required collections');
      console.log('❌ Required collections: MISSING');
    }

    // Check data counts
    result.dataCount.bookings = await db.collection('USVisaBookings').countDocuments();
    result.dataCount.cityStats = await db.collection('CityStats').countDocuments();
    result.dataCount.userStats = await db.collection('UserStats').countDocuments();

    console.log('📊 Data counts:');
    console.log(`   - Bookings: ${result.dataCount.bookings}`);
    console.log(`   - City Stats: ${result.dataCount.cityStats}`);
    console.log(`   - User Stats: ${result.dataCount.userStats}`);

    // Validate data integrity
    if (result.dataCount.bookings === 0) {
      result.errors.push('No booking data found');
    }
    if (result.dataCount.cityStats === 0) {
      result.errors.push('No city statistics found');
    }
    if (result.dataCount.userStats === 0) {
      result.errors.push('No user statistics found');
    }

  } catch (error) {
    result.errors.push(`Database error: ${error}`);
    console.error('❌ Database health check failed:', error);
  } finally {
    await client.close();
  }

  return result;
}

async function main() {
  const healthCheck = await performHealthCheck();
  
  console.log('\n🎯 Health Check Summary:');
  console.log('=========================');
  
  if (healthCheck.database && healthCheck.collections && healthCheck.errors.length === 0) {
    console.log('🎉 System Status: READY FOR PRODUCTION');
    console.log('✅ All checks passed');
    console.log('✅ Database connected');
    console.log('✅ Collections present');
    console.log('✅ Data populated');
  } else {
    console.log('⚠️  System Status: NEEDS ATTENTION');
    
    if (!healthCheck.database) {
      console.log('❌ Database connection failed');
    }
    if (!healthCheck.collections) {
      console.log('❌ Missing required collections');
    }
    if (healthCheck.errors.length > 0) {
      console.log('❌ Errors found:');
      healthCheck.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    console.log('\n💡 Recommendations:');
    console.log('   1. Run: npm run seed');
    console.log('   2. Check MongoDB connection string');
    console.log('   3. Verify database permissions');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('   1. Start server: npm run dev:server');
  console.log('   2. Start frontend: npm run dev');
  console.log('   3. Visit: http://localhost:5173');
  
  process.exit(healthCheck.errors.length === 0 ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { performHealthCheck };
