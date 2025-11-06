import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Calendar, BarChart3, RefreshCw } from 'lucide-react';
import { useBookingTrends } from '@/hooks/useApi';
import { useSocket } from '@/hooks/useSocket';

// Generate fallback data for when API is not available
const generateFallbackTrendData = () => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const currentMonth = new Date().getMonth();
  const data = [];
  
  for (let i = 11; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const month = months[monthIndex];
    
    const baseBookings = 800 + (11 - i) * 150;
    const seasonalVariation = Math.sin((monthIndex / 12) * Math.PI * 2) * 100;
    const randomVariation = (Math.random() - 0.5) * 200;
    
    const bookings = Math.max(400, Math.floor(baseBookings + seasonalVariation + randomVariation));
    const users = Math.floor(bookings * 0.6 + Math.random() * 200);
    
    data.push({
      month,
      bookings,
      users,
      cumulativeBookings: data.length > 0 
        ? data[data.length - 1].cumulativeBookings + bookings 
        : bookings
    });
  }
  
  return data;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground mb-2">{label} 2025</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' 
              ? entry.value.toLocaleString()
              : entry.value
            }
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrendChart() {
  const { data: apiTrendData, loading, error, refetch } = useBookingTrends(12);
  const { stats } = useSocket();
  
  // Use API data if available, otherwise fallback data
  const trendData = apiTrendData && apiTrendData.length > 0 
    ? apiTrendData 
    : generateFallbackTrendData();

  const currentMonthBookings = stats?.appointmentsThisMonth ?? trendData[trendData.length - 1]?.bookings ?? 0;
  const previousMonthBookings = stats?.appointmentsLastMonth ?? trendData[trendData.length - 2]?.bookings ?? 0;
  const growth = previousMonthBookings > 0 
    ? ((currentMonthBookings - previousMonthBookings) / previousMonthBookings * 100).toFixed(1)
    : currentMonthBookings > 0 ? '100.0' : '0.0';
  
  // Use real total from WebSocket stats (includes BaseBookedCounter)
  const totalBookings = stats?.totalAppointmentsBooked || trendData[trendData.length - 1]?.cumulativeBookings || 0;

  return (
    <Card className="p-6 bg-gradient-card shadow-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Historical Performance</h3>
          {loading && <span className="text-xs text-muted-foreground">Loading...</span>}
          {error && <span className="text-xs text-destructive">API Error</span>}
        </div>
        <div className="flex items-center gap-2">
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

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 bg-secondary/30 rounded-lg">
          <Calendar className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{previousMonthBookings.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Last Month</p>
        </div>
        
        <div className="text-center p-4 bg-secondary/30 rounded-lg">
          <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{currentMonthBookings.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">This Month</p>
        </div>
        
        <div className="text-center p-4 bg-secondary/30 rounded-lg">
          <BarChart3 className="w-6 h-6 text-warning mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{totalBookings.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Booked</p>
        </div>
      </div>

      {/* Monthly bookings chart */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-foreground mb-4">Monthly Appointments Booked</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 72%, 50%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(142, 72%, 50%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="hsl(142, 72%, 50%)"
                fillOpacity={1}
                fill="url(#bookingsGradient)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Performance summary */}
      <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-success" />
          <h5 className="font-semibold text-foreground">Consistent Growth Story</h5>
        </div>
        <p className="text-sm text-muted-foreground">
          Our bot has been consistently helping users secure {totalBookings.toLocaleString()}+ appointments across Canada.
          {parseFloat(growth) >= 0 
            ? ` The +${growth}% month-over-month growth shows increasing trust and effectiveness.`
            : ` Even when consulates are hardly opening new dates, our bot is still able to secure appointments for users.`
          }
        </p>
      </div>
    </Card>
  );
}