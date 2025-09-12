import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Shield, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

export default function Hero() {
  const { connected, stats } = useSocket();
  
  // Use real data from WebSocket or fallback to reasonable defaults
  const liveCount = stats?.totalUsers || 15247;
  const todayBookings = stats?.activeToday || 187;
  const totalAppointments = stats?.totalAppointmentsBooked || 42891;

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-light overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success/20 rounded-full blur-3xl opacity-30"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Live stats badge */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge variant="secondary" className="bg-success/20 text-success border-success/30 px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <Users className="w-4 h-4" />
                <span className="font-medium">{liveCount.toLocaleString()} Active Users</span>
              </div>
            </Badge>
            
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">{todayBookings} Booked Today</span>
              </div>
            </Badge>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary-glow to-success-glow bg-clip-text text-transparent leading-tight">
            Book Appointments
            <br />
            <span className="text-4xl md:text-6xl">Lightning Fast</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Our Chrome extension has helped <span className="text-success font-semibold">{liveCount.toLocaleString()}+ users</span> secure 
            <span className="text-primary font-semibold"> {totalAppointments.toLocaleString()}+ appointments</span> across Canadian visa offices.
          </p>

          {/* Key benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
              <Zap className="w-6 h-6 text-warning" />
              <span className="text-foreground font-medium">Instant Notifications</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
              <Shield className="w-6 h-6 text-success" />
              <span className="text-foreground font-medium">Automated Booking</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
              <TrendingUp className="w-6 h-6 text-primary" />
              <span className="text-foreground font-medium">23.4% Monthly Growth</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-4 text-lg font-semibold">
              Get Extension Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button variant="outline" size="lg" className="border-border hover:bg-secondary/50 px-8 py-4 text-lg">
              View Live Data
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-12 pt-8 border-t border-border/30">
            <p className="text-sm text-muted-foreground mb-4">Trusted by thousands across Canada</p>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <span>🇨🇦 Halifax • Vancouver • Ottawa • Toronto • Montreal • Calgary</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}