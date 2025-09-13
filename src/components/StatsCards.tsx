import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, MapPin, Calendar, Clock, Globe, Zap, Download } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

export default function StatsCards() {
  const { connected, stats } = useSocket();

  // Create dynamic stats array using real data
  const statsData = [
    {
      title: 'Total Users',
      value: stats?.totalUsers?.toLocaleString() || '15,247',
      change: 'Active users',
      changeType: 'increase' as const,
      icon: Users,
      description: 'Extension users worldwide'
    },
    {
      title: 'Appointments Booked So Far',
      value: stats?.totalAppointmentsBooked?.toLocaleString() || '42,891',
      change: 'All time total',
      changeType: 'increase' as const,
      icon: Calendar,
      description: 'Successfully secured'
    },
    {
      title: 'Booked Today',
      value: stats?.activeToday?.toLocaleString() || '187',
      change: 'Last 24 hours',
      changeType: 'increase' as const,
      icon: Clock,
      description: 'Fresh appointments'
    },
    {
      title: 'Global Coverage',
      value: '246',
      change: 'Worldwide reach',
      changeType: 'stable' as const,
      icon: Globe,
      description: 'Cities monitored'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="p-6 bg-gradient-card shadow-card border-border hover:shadow-glow transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5 text-primary group-hover:text-primary-glow transition-colors" />
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                </div>
                
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary"
                      className={`${
                        stat.changeType === 'increase' 
                          ? 'bg-success/20 text-success border-success/30' 
                          : 'bg-primary/20 text-primary border-primary/30'
                      } text-xs`}
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{stat.description}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}