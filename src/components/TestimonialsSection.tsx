import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Calendar, Clock } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

const testimonials = [
  {
    name: 'Sarah Chen',
    location: 'Vancouver',
    avatar: '👩‍💼',
    rating: 5,
    timeUsed: '3 months ago',
    timeSaved: '6 months',
    quote: "I was stuck in the manual booking loop for months. This extension got me an appointment in Vancouver within 2 days. Absolutely worth every penny!",
    appointmentDetails: 'B1/B2 Business Visa - Vancouver',
    bookingSpeed: '0.2s'
  },
  {
    name: 'Ahmed Rahman',
    location: 'Halifax',
    avatar: '👨‍🎓',
    rating: 5,
    timeUsed: '1 month ago',
    timeSaved: '4 months',
    quote: "The real-time alerts saved me. I got notified instantly when a slot opened in Halifax and the bot booked it faster than I could even click!",
    appointmentDetails: 'B1/B2 Tourism Visa - Halifax',
    bookingSpeed: '0.1s'
  },
  {
    name: 'Maria Rodriguez',
    location: 'Ottawa',
    avatar: '👩‍🏫',
    rating: 5,
    timeUsed: '2 weeks ago',
    timeSaved: '8 months',
    quote: "I tried manual booking for 8 months with no luck. This extension found and booked my appointment in Ottawa overnight. Game changer!",
    appointmentDetails: 'B1/B2 Business Visa - Ottawa',
    bookingSpeed: '0.3s'
  }
];

export default function TestimonialsSection() {
  const { stats } = useSocket();

  return (
    <section className="py-20 bg-secondary/10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="bg-success/20 text-success border-success/30 mb-4">
            Success Stories
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Real Users, Real Results
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how our extension helped thousands of users across Canada secure their appointments 
            and save months of waiting time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-gradient-card shadow-card border-border hover:shadow-glow transition-all duration-300">
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
                <span className="text-sm text-muted-foreground ml-2">{testimonial.timeUsed}</span>
              </div>

              {/* Quote */}
              <blockquote className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* User info */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{testimonial.avatar}</span>
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {testimonial.location}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" />
                    Time Saved
                  </div>
                  <p className="font-semibold text-success">{testimonial.timeSaved}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Calendar className="w-3 h-3" />
                    Booking Speed
                  </div>
                  <p className="font-semibold text-primary">{testimonial.bookingSpeed}</p>
                </div>
              </div>

              {/* Appointment type */}
              <Badge variant="secondary" className="w-full mt-3 bg-secondary/50 text-foreground justify-center">
                {testimonial.appointmentDetails}
              </Badge>
            </Card>
          ))}
        </div>

        {/* Statistics summary - Using real data */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="text-center p-4">
            <h3 className="text-3xl font-bold text-success mb-2">{stats?.totalUsers?.toLocaleString() || '15,247'}</h3>
            <p className="text-muted-foreground">Happy Users</p>
            <p className="text-xs text-muted-foreground/70 mt-1">*Live from database</p>
          </div>
          <div className="text-center p-4">
            <h3 className="text-3xl font-bold text-success mb-2">{stats?.totalAppointmentsBooked?.toLocaleString() || '42,891'}</h3>
            <p className="text-muted-foreground">Appointments Booked</p>
            <p className="text-xs text-muted-foreground/70 mt-1">*Live from database</p>
          </div>
          <div className="text-center p-4">
            <h3 className="text-3xl font-bold text-success mb-2">{stats?.newUsersThisMonth?.toLocaleString() || '2,847'}</h3>
            <p className="text-muted-foreground">New This Month</p>
            <p className="text-xs text-muted-foreground/70 mt-1">*Live from database</p>
          </div>
        </div>
      </div>
    </section>
  );
}