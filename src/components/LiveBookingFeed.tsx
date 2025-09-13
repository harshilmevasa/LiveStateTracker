import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users, RefreshCw } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';

export default function LiveBookingFeed() {
  const { connected, recentBookings, newBookingCount, refreshData, resetNewBookingCount } = useSocket();

  const formatTimeAgo = (timestamp: string) => {
    try {
      const time = new Date(timestamp);
      
      // Check if the date is valid
      if (isNaN(time.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return 'Unknown time';
      }
      
      const seconds = Math.floor((Date.now() - time.getTime()) / 1000);
      
      // Handle negative seconds (future dates or invalid data)
      if (seconds < 0) {
        return 'Just now';
      }
      
      if (seconds < 60) return `${seconds}s ago`;
      
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      
      const weeks = Math.floor(days / 7);
      if (weeks < 4) return `${weeks}w ago`;
      
      const months = Math.floor(days / 30);
      return `${months}mo ago`;
    } catch (error) {
      console.error('Error formatting timestamp:', timestamp, error);
      return 'Unknown time';
    }
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`}></div>
          Live Appointment Booked Feed
          {!connected && (
            <span className="text-xs text-muted-foreground">(Offline)</span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-success/20 text-success-glow border-success/30">
            <Users className="w-3 h-3 mr-1" />
            {newBookingCount} new events
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              refreshData();
              resetNewBookingCount();
            }}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="md:flex md:gap-4 md:overflow-x-auto md:pb-2 space-y-3 md:space-y-0 h-full overflow-y-auto md:overflow-y-visible scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {recentBookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground md:w-full">
            {connected ? 'No recent bookings' : 'Connecting to live feed...'}
          </div>
        ) : (
          recentBookings.map((event) => (
            <div
              key={event._id || event.email + event.createdAt}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50 transition-all duration-300 hover:bg-secondary/70 md:min-w-[320px] md:flex-shrink-0"
            >
              <div className="mt-1">
                <Calendar className="w-5 h-5 text-success" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant="default"
                    className="bg-success/20 text-success border-success/30"
                  >
                    📅 Appointment Secured
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(event.createdAt)}
                  </span>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm">
                  <div className="flex items-center gap-1 text-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-foreground">
                    <Clock className="w-3 h-3" />
                    <span className="truncate">{event.appointmentDate}, {event.appointmentTime}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span className="truncate">{event.groupSize}</span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  {event.visaClass}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}