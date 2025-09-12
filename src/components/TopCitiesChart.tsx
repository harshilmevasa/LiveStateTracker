import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RefreshCcw, MapPin, TrendingUp, BarChart3 } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useSocket } from '@/hooks/useSocket';

// Hook for fetching top cities data
export const useTopCitiesData = () => {
  return useApi<any[]>('/api/bookings/top-cities', {
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

interface TopCitiesChartProps {
  className?: string;
}

const TopCitiesChart: React.FC<TopCitiesChartProps> = ({ className }) => {
  const { data: topCitiesData, isLoading, error, refetch } = useTopCitiesData();
  const { stats } = useSocket();

  // Generate modern gradient colors for the months (last 6 months)
  const getMonthColors = () => {
    const colors = [
      'hsl(217, 91%, 60%)', // Modern blue
      'hsl(262, 83%, 58%)', // Modern violet  
      'hsl(142, 72%, 50%)', // Modern emerald
      'hsl(32, 95%, 44%)',  // Modern amber
      'hsl(0, 84%, 60%)',   // Modern red
      'hsl(188, 94%, 43%)', // Modern cyan
    ];
    return colors;
  };

  // Format data for the chart
  const formatChartData = () => {
    if (!topCitiesData || topCitiesData.length === 0) return [];

    const colors = getMonthColors();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get last 6 months in reverse chronological order for the chart
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
      months.push({ key: monthKey, label: monthLabel, color: colors[5 - i] });
    }

    return topCitiesData.map(cityData => {
      const chartEntry: any = {
        city: cityData.city,
        total: cityData.totalBookings,
      };

      // Add monthly data
      months.forEach(month => {
        chartEntry[month.key] = cityData.monthlyBreakdown[month.key] || 0;
      });

      return chartEntry;
    });
  };

  const chartData = formatChartData();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
    months.push({ key: monthKey, label: monthLabel });
  }

  const colors = getMonthColors();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
      
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <p className="font-semibold text-foreground">{label}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Total: <span className="text-primary">{total} appointments</span>
            </p>
            <div className="border-t border-border pt-1 mt-2">
              {payload.map((entry: any, index: number) => (
                <p key={index} className="text-xs" style={{ color: entry.color }}>
                  {entry.dataKey.includes('-') ? 
                    months.find(m => m.key === entry.dataKey)?.label || entry.dataKey : 
                    entry.dataKey
                  }: {entry.value}
                </p>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Top Cities Performance</h3>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCcw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load top cities data</p>
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
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Top Cities Performance</h3>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          title="Refresh data"
        >
          <RefreshCcw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Last 6 months appointment bookings by city. Showing top {chartData.length} performing cities.
        </p>
      </div>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading cities data...</span>
          </div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No city data available</p>
            <p className="text-sm text-muted-foreground mt-1">Check back later for updates</p>
          </div>
        </div>
      ) : (
        <>
          <div className="h-96 mb-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    {/* Modern gradients for each month */}
                    {months.map((month, index) => (
                      <linearGradient key={`gradient-${month.key}`} id={`gradient-${month.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors[index]} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={colors[index]} stopOpacity={0.3}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="city"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => {
                      const month = months.find(m => m.key === value);
                      return month ? month.label : value;
                    }}
                  />
                  
                  {/* Render modern gradient bars for each month */}
                  {months.map((month, index) => (
                    <Bar
                      key={month.key}
                      dataKey={month.key}
                      stackId="months"
                      fill={`url(#gradient-${month.key})`}
                      name={month.key}
                      radius={index === months.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                      stroke={colors[index]}
                      strokeWidth={0.5}
                    />
                  ))}
                </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">Cities Tracked</h4>
              </div>
              <p className="text-2xl font-bold text-primary">{chartData.length}</p>
              <p className="text-sm text-muted-foreground">Active locations</p>
            </div>
            
            <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <h4 className="font-semibold text-foreground">Top Performer</h4>
              </div>
              <p className="text-2xl font-bold text-success">
                {chartData.length > 0 ? chartData[0].city : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">
                {chartData.length > 0 ? `${chartData[0].total} appointments` : 'No data'}
              </p>
            </div>
            
            <div className="text-center p-4 bg-warning/10 rounded-lg border border-warning/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-warning" />
                <h4 className="font-semibold text-foreground">Total Appointments</h4>
              </div>
              <p className="text-2xl font-bold text-warning">
                {chartData.reduce((sum, city) => sum + city.total, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Last 6 months</p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default TopCitiesChart;
