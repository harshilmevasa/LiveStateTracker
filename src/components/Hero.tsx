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
    <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-light overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success/20 rounded-full blur-3xl opacity-30"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Live stats badge */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 mt-6">
            <Badge variant="secondary" className="bg-success/20 text-success border-success/30 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <Users className="w-4 h-4" />
                <span className="font-medium text-sm">{liveCount.toLocaleString()} Total Users</span>
              </div>
            </Badge>
            
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 px-3 py-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium text-sm">{todayBookings} Booked Today</span>
              </div>
            </Badge>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary-glow to-success-glow bg-clip-text text-transparent leading-tight">
            Need an early
            <br />
            <span className="text-4xl md:text-6xl">US Visa appointment?</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">
            <span className="text-primary font-semibold">Skip the endless checking</span> for US Visa appointments! 
            We monitor slots <span className="text-success font-semibold">24/7</span> and alert you the moment appointments become available.
          </p>

          {/* Highlighted User Count */}
          <div className="mb-8 p-6 bg-gradient-to-r from-success/10 via-primary/10 to-success/10 rounded-2xl border border-success/20 shadow-lg max-w-md mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-success mb-2">
                {liveCount.toLocaleString()}+
              </div>
              <div className="text-lg font-semibold text-foreground mb-1">
                Users Trust Alert Me ASAP
              </div>
              <div className="text-sm text-muted-foreground">
                Join thousands who secured their appointments
              </div>
            </div>
          </div>

          {/* Key benefits */}
          <div className="mb-10 max-w-3xl mx-auto">
            {/* Mobile: 2x1 grid, Desktop: single row */}
            <div className="grid grid-cols-2 gap-3 mb-3 md:grid-cols-3 md:gap-4 md:mb-0">
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-card/50 border border-border/50 text-center">
                <Zap className="w-4 h-4 text-warning flex-shrink-0" />
                <span className="text-foreground font-medium text-xs md:text-sm">Instant Notifications</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-card/50 border border-border/50 text-center">
                <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-foreground font-medium text-xs md:text-sm">24/7 Monitoring</span>
              </div>
              {/* Third item - spans 2 columns on mobile, 1 on desktop */}
              <div className="col-span-2 md:col-span-1 flex items-center justify-center">
                <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-card/50 border border-border/50 max-w-[200px] md:max-w-none md:w-full">
                  <Users className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="text-foreground font-medium text-xs md:text-sm">Global Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-4 text-lg font-semibold"
              onClick={() => {
                const pricingSection = document.querySelector('[data-section="pricing"]');
                if (pricingSection) {
                  pricingSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Get Extension Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-border hover:bg-secondary/50 px-8 py-4 text-lg"
              onClick={() => {
                const liveDataSection = document.querySelector('[data-section="live-feed"]');
                if (liveDataSection) {
                  liveDataSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              View Live Data
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-12 pt-8 border-t border-border/30">
            <p className="text-sm text-muted-foreground mb-4">Trusted by thousands across the world</p>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <span> Canada • Dubai • Abu Dhabi • Turkey • India • Pakistan • Bangladesh • Algeria and more</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}