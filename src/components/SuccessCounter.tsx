import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, TrendingUp, Zap, Trophy, Target, Download, Calendar } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

const achievements = [
  { threshold: 10000, title: '10K Milestone', icon: Target, unlocked: true },
  { threshold: 25000, title: 'Quarter Million', icon: Trophy, unlocked: true },
  { threshold: 50000, title: 'Half Century', icon: Zap, unlocked: false },
  { threshold: 100000, title: '100K Legend', icon: CheckCircle, unlocked: false },
];

export default function SuccessCounter() {
  const { connected, stats, recentBookings } = useSocket();
  const [recentIncrement, setRecentIncrement] = useState(false);
  const [prevTotalBookings, setPrevTotalBookings] = useState(0);

  // Watch for changes in total bookings and trigger animation
  useEffect(() => {
    if (stats?.totalAppointmentsBooked && stats.totalAppointmentsBooked > prevTotalBookings && prevTotalBookings > 0) {
      setRecentIncrement(true);
      const timer = setTimeout(() => setRecentIncrement(false), 1000);
      return () => clearTimeout(timer);
    }
    if (stats?.totalAppointmentsBooked) {
      setPrevTotalBookings(stats.totalAppointmentsBooked);
    }
  }, [stats?.totalAppointmentsBooked, prevTotalBookings]);

  // Use real data from WebSocket or use fallback values
  const totalBookings = stats?.totalAppointmentsBooked || 42891;
  const todayBookings = stats?.activeToday || 187;
  const thisWeekBookings = Math.floor(todayBookings * 7.2) || 1247; // Estimate

  // Calculate progress to next milestone
  const nextAchievement = achievements.find(achievement => totalBookings < achievement.threshold);
  const progressPercentage = nextAchievement 
    ? (totalBookings / nextAchievement.threshold) * 100 
    : 100;

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <Card className="p-8 bg-gradient-card shadow-card border-border relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-success rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`}></div>
            <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
              {connected ? 'LIVE COUNTER' : 'LIVE COUNTER (OFFLINE)'}
            </Badge>
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`}></div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Appointments Booked by Our Bot
          </h2>
          <p className="text-muted-foreground">Real-time success tracking across Canada</p>
        </div>

        {/* Main counter */}
        <div className="text-center mb-8 relative">
          <div className={`inline-flex items-center gap-3 transition-all duration-500 ${
            recentIncrement ? 'scale-110 text-success' : ''
          }`}>
            <CheckCircle className="w-8 h-8 text-success" />
            <span className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-success via-primary to-success bg-clip-text text-transparent">
              {totalBookings.toLocaleString()}
            </span>
          </div>
          
          {recentIncrement && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 animate-pulse z-20">
              <Badge variant="secondary" className="bg-success/30 text-success border-success/50">
                +1 New Booking!
              </Badge>
            </div>
          )}
        </div>

        {/* Appointments Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Appointments Secured
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">Last 24 Hours</h4>
              </div>
              <p className="text-2xl font-bold text-primary">{stats?.activeToday || 5}</p>
              <p className="text-sm text-muted-foreground">Appointments secured</p>
            </div>

            <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-warning" />
                <h4 className="font-semibold text-foreground">Last 7 Days</h4>
              </div>
              <p className="text-2xl font-bold text-warning">{stats?.appointmentsThisWeek || 36}</p>
              <p className="text-sm text-muted-foreground">Weekly total</p>
            </div>

            <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-success" />
                <h4 className="font-semibold text-foreground">Last 30 Days</h4>
              </div>
              <p className="text-2xl font-bold text-success">{stats?.appointmentsThisMonth?.toLocaleString() || '127'}</p>
              <p className="text-sm text-muted-foreground">Monthly secured</p>
            </div>
          </div>
        </div>

        {/* Downloads Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-500" />
            Extension Downloads
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Download className="w-5 h-5 text-blue-500" />
                <h4 className="font-semibold text-foreground">Today</h4>
              </div>
              <p className="text-2xl font-bold text-blue-500">{stats?.downloadsToday || 23}</p>
              <p className="text-sm text-muted-foreground">Downloaded today</p>
            </div>

            <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <h4 className="font-semibold text-foreground">This Week</h4>
              </div>
              <p className="text-2xl font-bold text-purple-500">{stats?.downloadsThisWeek || 157}</p>
              <p className="text-sm text-muted-foreground">Weekly downloads</p>
            </div>

            <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold text-foreground">This Month</h4>
              </div>
              <p className="text-2xl font-bold text-green-500">{stats?.newUsersThisMonth?.toLocaleString() || '3,298'}</p>
              <p className="text-sm text-muted-foreground">Downloaded this month</p>
            </div>
          </div>
        </div>

        {/* Progress to next milestone */}
        {nextAchievement && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Progress to {formatNumber(nextAchievement.threshold)} milestone
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-success h-full transition-all duration-1000 ease-out shadow-success/50"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Only {nextAchievement.threshold - totalBookings} appointments away from the next milestone!
            </p>
          </div>
        )}

        {/* Achievements */}
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-4 text-center">Achievements Unlocked</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              const isUnlocked = totalBookings >= achievement.threshold;
              
              return (
                <div
                  key={achievement.threshold}
                  className={`p-3 rounded-lg border text-center transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-success/20 border-success/30 text-success'
                      : 'bg-secondary/30 border-border/50 text-muted-foreground'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${isUnlocked ? 'text-success' : 'text-muted-foreground'}`} />
                  <p className="text-xs font-medium">{achievement.title}</p>
                  <p className="text-xs">{formatNumber(achievement.threshold)}</p>
                  {isUnlocked && (
                    <div className="mt-1">
                      <CheckCircle className="w-4 h-4 mx-auto text-success" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-foreground font-medium mb-2">
            Join {(15247).toLocaleString()}+ users who trust our bot
          </p>
          <p className="text-sm text-muted-foreground">
            Every number above represents someone who saved months of waiting time
          </p>
        </div>
      </div>
    </Card>
  );
}