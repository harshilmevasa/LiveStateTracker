import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Flame, TrendingUp, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBookingHeatmap } from '@/hooks/useApi';
import { useSocket } from '@/hooks/useSocket';

// Generate fallback data for when API is not available
const generateFallbackHeatmapData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseBookings = isWeekend ? 5 : 15;
    
    const randomMultiplier = Math.random() * 2 + 0.5;
    const isHotDay = Math.random() > 0.85;
    
    let bookings = Math.floor(baseBookings * randomMultiplier);
    if (isHotDay) {
      bookings = Math.floor(bookings * 3 + 20);
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      bookings,
      isHotDay: bookings >= 50
    });
  }
  
  return data;
};

const getIntensityClass = (bookings: number) => {
  if (bookings === 0) return 'bg-secondary/30';
  if (bookings < 10) return 'bg-success/20';
  if (bookings < 25) return 'bg-success/40';
  if (bookings < 50) return 'bg-success/70';
  return 'bg-success shadow-success/50';
};

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function BookingHeatmap() {
  const { data: apiHeatmapData, loading, error, refetch } = useBookingHeatmap();
  const { stats } = useSocket();
  const [selectedDay, setSelectedDay] = useState<any>(null);

  // Use API data if available, otherwise fallback data
  const heatmapData = apiHeatmapData && apiHeatmapData.length > 0 
    ? apiHeatmapData 
    : generateFallbackHeatmapData();

  // Calculate stats - use real total from WebSocket stats (includes BaseBookedCounter)
  const totalBookings = stats?.totalAppointmentsBooked || heatmapData.reduce((sum, day) => sum + day.bookings, 0);
  const hotDays = heatmapData.filter(day => day.isHotDay).length;
  const avgDaily = Math.round(totalBookings / 365);
  const maxDay = Math.max(...heatmapData.map(day => day.bookings));

  // Organize data by weeks for display
  const weeks = [];
  let currentWeek = [];
  const startDate = new Date(heatmapData[0].date);
  const startDay = startDate.getDay();

  // Add empty cells for the first week
  for (let i = 0; i < startDay; i++) {
    currentWeek.push(null);
  }

  heatmapData.forEach((day, index) => {
    currentWeek.push(day);
    
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  // Add remaining days to last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return (
    <Card className="p-6 bg-gradient-card shadow-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Booking Activity</h3>
          {loading && <span className="text-xs text-muted-foreground">Loading...</span>}
          {error && <span className="text-xs text-destructive">API Error</span>}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
            <Flame className="w-3 h-3 mr-1" />
            {hotDays} Hot Days (50+)
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={refetch}
            className="h-8 w-8 p-0"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{totalBookings.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Bookings</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-success">{avgDaily}</p>
          <p className="text-sm text-muted-foreground">Daily Average</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-warning">{maxDay}</p>
          <p className="text-sm text-muted-foreground">Best Day</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{hotDays}</p>
          <p className="text-sm text-muted-foreground">Hot Days</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="space-y-4">
        {/* Month labels */}
        <div className="flex justify-between text-xs text-muted-foreground px-4">
          {months.map(month => (
            <span key={month}>{month}</span>
          ))}
        </div>

        <TooltipProvider>
          <div className="flex gap-1">
            {/* Weekday labels */}
            <div className="flex flex-col gap-1 mr-2">
              <div className="h-3"></div> {/* Spacer for month row */}
              {weekdays.map((day, index) => (
                <div key={day} className="h-3 flex items-center">
                  {index % 2 === 1 && (
                    <span className="text-xs text-muted-foreground text-right w-8">{day}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-1 overflow-x-auto">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <Tooltip key={`${weekIndex}-${dayIndex}`}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110 ${
                            day ? getIntensityClass(day.bookings) : 'bg-transparent'
                          } ${day?.isHotDay ? 'ring-1 ring-warning' : ''}`}
                          onClick={() => setSelectedDay(day)}
                        />
                      </TooltipTrigger>
                      {day && (
                        <TooltipContent>
                          <div className="text-center">
                            <p className="font-semibold">{day.bookings} bookings</p>
                            <p className="text-xs text-muted-foreground">{day.date}</p>
                            {day.isHotDay && <p className="text-xs text-warning">🔥 Hot Day!</p>}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-secondary/30 rounded-sm"></div>
              <div className="w-3 h-3 bg-success/20 rounded-sm"></div>
              <div className="w-3 h-3 bg-success/40 rounded-sm"></div>
              <div className="w-3 h-3 bg-success/70 rounded-sm"></div>
              <div className="w-3 h-3 bg-success rounded-sm"></div>
            </div>
            <span>More</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-success" />
            <span>Consistent daily performance</span>
          </div>
        </div>
      </div>

      {/* Selected day info */}
      {selectedDay && (
        <div className="mt-4 p-3 bg-secondary/50 rounded-lg border border-border/50">
          <p className="text-sm">
            <span className="font-semibold text-foreground">{selectedDay.date}:</span>
            <span className="text-success ml-2">{selectedDay.bookings} appointments booked</span>
            {selectedDay.isHotDay && <span className="text-warning ml-2">🔥 Hot Day!</span>}
          </p>
        </div>
      )}
    </Card>
  );
}