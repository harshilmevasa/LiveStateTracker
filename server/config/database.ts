import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = "mongodb+srv://Replyai:6LEMHdXQ1hIzquu4@cluster0.3d7niti.mongodb.net/ReplyAI";
const DB_NAME = 'USVisa';

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
