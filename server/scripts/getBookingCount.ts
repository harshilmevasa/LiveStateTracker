import { connectDB, closeDB } from '../config/database.js';
import { BookingService } from '../services/bookingService.js';

async function getBookingCount(city: string, createdDate: string, appointmentDate: string) {
  if (!city || !createdDate || !appointmentDate) {
    console.error('Usage: tsx server/scripts/getBookingCount.ts <city> <createdDate> <appointmentDate>');
    console.error('Please provide a city, a created date (YYYY-MM-DD), and an appointment date (DD/MM/YYYY).');
    process.exit(1);
  }

  try {
    console.log(`Connecting to the database...`);
    await connectDB();
    console.log('Database connected.');

    const bookingService = new BookingService();

    console.log(`Fetching booking count for ${city} created on ${createdDate} for appointments on ${appointmentDate}...`);
    const count = await bookingService.countBookingsCreatedOnDateForAppointmentDate(city, createdDate, appointmentDate);

    console.log('--- Booking Count Report ---');
    console.log(`City: ${city}`);
    console.log(`Bookings Created On: ${createdDate}`);
    console.log(`For Appointment Date: ${appointmentDate}`);
    console.log(`Total Bookings: ${count}`);
    console.log('---------------------------');

  } catch (error) {
    console.error('An error occurred while fetching the booking count:', error);
    process.exit(1);
  } finally {
    await closeDB();
    console.log('Database connection closed.');
  }
}

// Get arguments from command line
const city = process.argv[2];
const createdDate = process.argv[3];
const appointmentDate = process.argv[4];

getBookingCount(city, createdDate, appointmentDate);
