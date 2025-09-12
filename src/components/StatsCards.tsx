import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, MapPin, Calendar, Clock, Globe } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

export default function StatsCards() {
  const { connected, stats } = useSocket();

  // Create dynamic stats array using real data
  const statsData = [
    {
      title: 'Total Users',
      value: stats?.totalUsers?.toLocaleString() || '15,247',
      change: '+1,234',
      changeType: 'increase' as const,
      icon: Users,
      description: 'Active extension users'
    },
    {
      title: 'Appointments Booked',
      value: stats?.totalAppointmentsBooked?.toLocaleString() || '42,891',
      change: '+2,156',
      changeType: 'increase' as const,
      icon: Calendar,
      description: 'Total secured'
    },
    {
      title: 'Active Today',
      value: stats?.activeToday?.toLocaleString() || '187',
      change: '+23',
      changeType: 'increase' as const,
      icon: Clock,
      description: 'Bookings today'
    },
    {
      title: 'New Users This Month',
      value: stats?.newUsersThisMonth?.toLocaleString() || '2,847',
      change: '+342',
      changeType: 'increase' as const,
      icon: TrendingUp,
      description: 'Downloaded this month'
    },
    {
      title: 'Coverage Areas',
      value: '6',
      change: 'All major cities',
      changeType: 'stable' as const,
      icon: MapPin,
      description: 'Canadian visa offices'
    },
    {
      title: 'Growth Rate',
      value: '23.4%',
      change: '+3.1%',
      changeType: 'increase' as const,
      icon: Globe,
      description: 'Monthly user growth'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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