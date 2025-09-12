import { Server, Socket } from 'socket.io';
import { BookingService } from '../services/bookingService.js';
import { BookingEvent } from '../models/Booking.js';

const bookingService = new BookingService();

export const setupSocketHandlers = (io: Server) => {
  let connectedClients = 0;
  
  io.on('connection', (socket: Socket) => {
    connectedClients++;
    if (connectedClients % 10 === 1) { // Log every 10th connection
      console.log(`🔌 ${connectedClients} clients connected`);
    }

    // Send initial data when client connects
    socket.on('request:initial-data', async () => {
      try {
        const [recentBookings, stats, cityStats] = await Promise.all([
          bookingService.getRecentBookings(10),
          bookingService.getOverallStats(),
          bookingService.getCityStats()
        ]);

        socket.emit('data:initial', {
          recentBookings,
          stats,
          cityStats
        });
      } catch (error) {
        console.error('Error sending initial data:', error);
        socket.emit('error', { message: 'Failed to fetch initial data' });
      }
    });

    // Removed booking creation - this is now read-only

    // Handle real-time stats requests
    socket.on('request:stats', async () => {
      try {
        const stats = await bookingService.getOverallStats();
        socket.emit('data:stats', stats);
      } catch (error) {
        console.error('Error fetching stats via socket:', error);
        socket.emit('error', { message: 'Failed to fetch statistics' });
      }
    });

    // Handle city stats requests
    socket.on('request:city-stats', async () => {
      try {
        const cityStats = await bookingService.getCityStats();
        socket.emit('data:city-stats', cityStats);
      } catch (error) {
        console.error('Error fetching city stats via socket:', error);
        socket.emit('error', { message: 'Failed to fetch city statistics' });
      }
    });

    socket.on('disconnect', () => {
      connectedClients--;
      if (connectedClients % 10 === 0) { // Log every 10th disconnection
        console.log(`🔌 ${connectedClients} clients connected`);
      }
    });
  });

  // Start polling for real database changes instead of simulation
  startDatabasePolling(io);
};

// Use MongoDB Change Streams for real-time document detection
const startDatabasePolling = (io: Server) => {
  let lastTotalCount = 0;
  let lastTotalUsers = 0;
  
  const setupChangeStreams = async () => {
    try {
      // Get initial counts
      lastTotalCount = await bookingService.getTotalBookings();
      lastTotalUsers = await bookingService.getTotalUsersFromDashboard();
      console.log(`📊 Initial counts - Appointments: ${lastTotalCount}, Users: ${lastTotalUsers}`);
      
      // Set up change stream for appointment bookings
      const bookingChangeStream = await bookingService.watchForNewBookings();
      
      bookingChangeStream.on('change', async (change) => {
        try {
          if (change.operationType === 'insert') {
            const newBooking = change.fullDocument;
            console.log(`🎯 New appointment booking detected for ${newBooking.location} on ${newBooking.appointmentDate}`);
            
            // Broadcast the new booking immediately
            io.emit('booking:new', newBooking);
            
            // Update total count
            lastTotalCount++;
            
            // Get updated stats and broadcast
            const updatedStats = await bookingService.getOverallStats();
            if (updatedStats) {
              io.emit('data:stats', updatedStats);
            }
          }
        } catch (error) {
          console.error('Error processing appointment change stream event:', error);
        }
      });
      
      bookingChangeStream.on('error', (error) => {
        console.error('Appointment change stream error:', error);
        // Attempt to reconnect after a delay
        setTimeout(setupChangeStreams, 5000);
      });
      
      // Set up change stream for dashboard stats (total users)
      const dashboardChangeStream = await bookingService.watchDashboardStats();
      
      dashboardChangeStream.on('change', async (change) => {
        try {
          if (change.operationType === 'update' || change.operationType === 'replace') {
            const updatedDoc = change.fullDocument;
            if (updatedDoc && updatedDoc.Key === 'dashboard' && updatedDoc.TotalUsers) {
              const newUserCount = parseInt(updatedDoc.TotalUsers, 10);
              console.log(`👥 Total users updated: ${lastTotalUsers} → ${newUserCount}`);
              
              lastTotalUsers = newUserCount;
              
              // Get updated stats and broadcast
              const updatedStats = await bookingService.getOverallStats();
              if (updatedStats) {
                io.emit('data:stats', updatedStats);
              }
            }
          }
        } catch (error) {
          console.error('Error processing dashboard change stream event:', error);
        }
      });
      
      dashboardChangeStream.on('error', (error) => {
        console.error('Dashboard change stream error:', error);
        // Attempt to reconnect after a delay
        setTimeout(setupChangeStreams, 5000);
      });
      
      console.log('👀 MongoDB Change Streams active - watching appointments & user stats');
      
      return { bookingChangeStream, dashboardChangeStream };
    } catch (error) {
      console.error('Error setting up change streams:', error);
      // Fallback to polling if change streams aren't available
      return startPollingFallback(io);
    }
  };
  
  // Fallback polling method if change streams fail
  const startPollingFallback = (io: Server) => {
    console.log('⚠️  Change streams not available, falling back to polling');
    
    const pollForChanges = async () => {
      try {
        const currentTotalCount = await bookingService.getTotalBookings();
        const currentTotalUsers = await bookingService.getTotalUsersFromDashboard();
        
        let hasChanges = false;
        
        if (currentTotalCount !== lastTotalCount) {
          console.log(`📊 Detected appointment change: ${lastTotalCount} → ${currentTotalCount}`);
          
          // Get recent bookings to find new ones
          const newBookingsCount = currentTotalCount - lastTotalCount;
          if (newBookingsCount > 0) {
            const recentBookings = await bookingService.getRecentBookings(Math.min(newBookingsCount, 10));
            
            // Broadcast new bookings
            recentBookings.slice(0, newBookingsCount).forEach(booking => {
              io.emit('booking:new', booking);
              console.log(`📊 Broadcasting new appointment for ${booking.location} on ${booking.appointmentDate}`);
            });
          }
          
          lastTotalCount = currentTotalCount;
          hasChanges = true;
        }
        
        if (currentTotalUsers !== lastTotalUsers) {
          console.log(`👥 Detected user count change: ${lastTotalUsers} → ${currentTotalUsers}`);
          lastTotalUsers = currentTotalUsers;
          hasChanges = true;
        }
        
        if (hasChanges) {
          // Update stats
          const updatedStats = await bookingService.getOverallStats();
          if (updatedStats) {
            io.emit('data:stats', updatedStats);
          }
        }
      } catch (error) {
        console.error('Error in polling fallback:', error);
      }
    };
    
    // Poll every 2 seconds for better responsiveness
    const pollInterval = setInterval(pollForChanges, 2000);
    
    // Initial poll
    pollForChanges();
    
    return () => clearInterval(pollInterval);
  };
  
  // Start with change streams
  setupChangeStreams();
};
