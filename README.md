# LiveStateTracker

A real-time visa appointment booking tracker with live updates, analytics, and interactive visualizations.

## 🌟 Features

- **Real-time Booking Feed**: Live stream of visa appointment bookings with WebSocket updates
- **Interactive Analytics**: Dynamic charts showing booking trends and city performance
- **Geographic Visualization**: Interactive maps displaying booking locations
- **Success Counter**: Live counter of successful appointment bookings
- **City Performance**: Track earliest available appointment dates by city
- **Booking Heatmap**: Visual representation of booking activity over time

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- MongoDB database
- npm or yarn

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/harshilmevasa/LiveStateTracker.git
cd LiveStateTracker

# Install dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
# Frontend environment (create .env in root)
VITE_API_URL=http://localhost:3001

# Backend environment (create .env in root, or copy from env.example)
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string_here
DB_NAME=USVisa
```

### 3. Database Setup

Seed the database with initial data:

```bash
# Run the seeding script
npm run seed
```

### 4. Development

```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run dev:client    # Frontend only (port 5173)
npm run dev:server    # Backend only (port 3001)
```

### 5. Production Build

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
LiveStateTracker/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   └── lib/               # Utilities
├── server/                # Backend Node.js application
│   ├── config/            # Database and app configuration
│   ├── models/            # Data models and types
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── sockets/           # WebSocket handlers
│   └── scripts/           # Database scripts
└── public/                # Static assets
```

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Recharts** for data visualization
- **Leaflet** for interactive maps
- **Socket.IO Client** for real-time updates

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with native driver
- **Socket.IO** for WebSocket communication
- **CORS** for cross-origin requests

## 🌐 API Endpoints

### Bookings
- `GET /api/bookings/recent` - Get recent booking events
- `GET /api/bookings/stats` - Get booking statistics
- `GET /api/bookings/city-performance` - Get city performance data
- `GET /api/bookings/trends` - Get booking trend data
- `GET /api/bookings/heatmap` - Get booking heatmap data

### System
- `GET /api/test` - API health check
- `GET /health` - System health check

## 📊 Real-time Features

The application uses WebSocket connections for real-time updates:

- **Live Booking Feed**: New bookings appear instantly
- **Counter Updates**: Success counter updates in real-time
- **Statistics Refresh**: Charts and stats update automatically
- **Connection Status**: Visual indicator of connection state

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `DB_NAME` | Database name | `USVisa` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `VITE_API_URL` | API URL for frontend | `http://localhost:3001` |

### Database Collections

- **USVisaBookings**: Booking event records
- **CityStats**: City-wise statistics
- **UserStats**: Global user statistics

## 🚀 Deployment

### Railway (Recommended)

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Azure App Service

See [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md) for detailed Azure deployment instructions.

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📱 Mobile Responsive

The application is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile phones

## 🔒 Security Features

- Environment variable configuration
- CORS protection
- Input validation
- Secure MongoDB connections
- No hardcoded credentials

## 🧪 Testing

```bash
# Run health check
npm run health-check

# Test database connection
npm run seed
```

## 📈 Performance

- **Real-time Updates**: Sub-second WebSocket latency
- **Optimized Queries**: Efficient MongoDB aggregations
- **Responsive UI**: Fast React rendering with proper state management
- **Production Ready**: Optimized builds and compression

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/harshilmevasa/LiveStateTracker/issues) page
2. Run the health check: `npm run health-check`
3. Verify environment variables are set correctly
4. Check database connectivity

## 🔄 Updates

The application automatically updates statistics and booking data. For manual updates:

```bash
# Reseed the database
npm run seed

# Check system health
npm run health-check
```

---

Built with ❤️ for real-time visa appointment tracking
