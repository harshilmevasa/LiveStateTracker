import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root directory (local development only)
// In production, environment variables are set by the platform (Railway, Azure, etc.)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
}

// Get MongoDB connection details from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'USVisa';

// Validate required environment variables
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

let client: MongoClient;
let db: Db;

export const connectDB = async (): Promise<Db> => {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    
    // Test the connection
    await db.admin().ping();
    console.log(`📦 Connected to database: ${DB_NAME}`);
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export const getDB = (): Db => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

export const closeDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    console.log('🔌 Database connection closed');
  }
};
