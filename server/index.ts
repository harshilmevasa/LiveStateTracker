import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import bookingRoutes from './routes/bookings.js';
import { setupSocketHandlers } from './sockets/bookingSocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  
  // Multiple possible locations for static files
  const possiblePaths = [
    '/app/dist',           // Railway root
    path.join(__dirname, '../dist'),     // Local relative
    path.join(__dirname, '../../dist'),  // Parent directory
    '/app/build',          // Alternative build directory
  ];
  
  let distPath = null;
  
  // Find the first existing path
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      distPath = testPath;
      break;
    }
  }
  
  if (distPath) {
    console.log('✅ Static files found at:', distPath);
    console.log('📁 Directory contents:', fs.readdirSync(distPath).slice(0, 10));
    app.use(express.static(distPath));
  } else {
    console.log('❌ No static files found. Checked paths:', possiblePaths);
    // List current working directory contents for debugging
    console.log('📁 Current working directory:', process.cwd());
    console.log('📁 Current directory contents:', fs.readdirSync(process.cwd()).slice(0, 20));
  }
}

// Routes
console.log('🛣️  Setting up API routes');
app.use('/api/bookings', bookingRoutes);

// Add a test API route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch all handler: send back React's index.html file in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    
    // Multiple possible locations for index.html
    const possibleIndexPaths = [
      '/app/dist/index.html',
      path.join(__dirname, '../dist/index.html'),
      path.join(__dirname, '../../dist/index.html'),
      '/app/build/index.html'
    ];
    
    let indexPath = null;
    
    // Find the first existing index.html
    for (const testPath of possibleIndexPaths) {
      if (fs.existsSync(testPath)) {
        indexPath = testPath;
        break;
      }
    }
    
    if (indexPath) {
      console.log('📄 Serving index.html from:', indexPath);
      res.sendFile(indexPath);
    } else {
      console.log('❌ index.html not found. Checked:', possibleIndexPaths);
      res.status(404).send(`
        <h1>LiveStateTracker</h1>
        <p>Frontend files not found. API is running at <a href="/health">/health</a></p>
        <p>API endpoints available at <a href="/api/bookings">/api/bookings</a></p>
      `);
    }
  });
}

// Database connection and server startup
const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Setup Socket.IO handlers AFTER database connection
    setupSocketHandlers(io);
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
      console.log(`🔌 WebSocket server ready for connections`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
