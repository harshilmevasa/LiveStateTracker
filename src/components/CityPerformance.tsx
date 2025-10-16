import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, RefreshCw } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

// Hook for fetching earliest booked appointments by city
export const useEarliestBookedAppointments = () => {
  return useApi<any[]>('/api/bookings/upcoming-by-city');
};

export default function CityPerformance() {
  const { data: earliestData, loading, error, refetch } = useEarliestBookedAppointments();

  const formatDate = (dateString: string) => {
    // Parse DD/MM/YYYY format properly
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript Date
    const year = parseInt(parts[2], 10);
    
    const date = new Date(year, month, day);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatBookingDate = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid createdAt date:', createdAt);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting createdAt date:', createdAt, error);
      return 'Invalid Date';
    }
  };

  if (error) {
    return (
      <Card className="p-6 bg-gradient-card shadow-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Earliest Booked Dates by City
          </h3>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load earliest appointments</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card shadow-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Earliest Booked Dates by City in Last 30 Days
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            See the earliest booked appointment by our bot in each city with when it was booked
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          title="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-secondary/30 rounded-lg p-4 h-40"></div>
            </div>
          ))}
        </div>
      ) : earliestData && earliestData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {earliestData.map((cityData, index) => (
            <div key={index} className="bg-secondary/30 rounded-lg border border-border/50 p-3 hover:bg-secondary/40 transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-foreground">{cityData.city}</h4>
              </div>
              
              {/* Header row */}
              <div className="flex items-center justify-between py-2 px-2 bg-secondary/50 rounded border border-border/50 mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Appointment Date</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Booked On</span>
              </div>
              
              <div className="space-y-1">
                {(() => {
                  // Group appointments by date and count duplicates
                  const groupedAppointments = cityData.appointments.reduce((acc: any, appointment: any) => {
                    const dateKey = appointment.appointmentDate;
                    if (!acc[dateKey]) {
                      acc[dateKey] = {
                        appointmentDate: appointment.appointmentDate,
                        createdAt: appointment.createdAt,
                        count: 1
                      };
                    } else {
                      acc[dateKey].count++;
                    }
                    return acc;
                  }, {});
                  
                  // Convert to array and sort by appointment date
                  const uniqueAppointments = Object.values(groupedAppointments)
                    .sort((a: any, b: any) => new Date(a.appointmentDate.split('/').reverse().join('-')).getTime() - new Date(b.appointmentDate.split('/').reverse().join('-')).getTime())
                    .slice(0, 10);
                  
                  return uniqueAppointments.map((appointment: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-2 px-2 bg-background/50 rounded border border-border/30 hover:bg-background/70 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {formatDate(appointment.appointmentDate)}
                        </span>
                        {appointment.count > 1 && (
                          <span className="px-1.5 py-0.5 text-xs font-bold bg-warning/20 text-warning border border-warning/30 rounded-full whitespace-nowrap">
                            <span className="hidden sm:inline">Bulk </span>x{appointment.count}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatBookingDate(appointment.createdAt)}
                      </span>
                    </div>
                  ));
                })()}
                
                {cityData.appointments.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No appointments found
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h4 className="text-lg font-semibold text-foreground mb-2">No Appointment Data</h4>
          <p className="text-muted-foreground">
            No appointments found in the last 30 days.
          </p>
        </div>
      )}
    </Card>
  );
}