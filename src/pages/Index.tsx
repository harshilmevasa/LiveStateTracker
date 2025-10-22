import Hero from '@/components/Hero';
import Header from '@/components/Header';
import StatsCards from '@/components/StatsCards';
import LiveBookingFeed from '@/components/LiveBookingFeed';
import CityPerformance from '@/components/CityPerformance';
import BookingHeatmap from '@/components/BookingHeatmap';
import LocationMap from '@/components/LocationMap';
import SuccessCounter from '@/components/SuccessCounter';
import TrendChart from '@/components/TrendChart';
import TopCitiesChart from '@/components/TopCitiesChart';
import TelegramChannels from '@/components/TelegramChannels';
import PricingSection from '@/components/PricingSection';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Success Counter - Prominently featured */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <SuccessCounter />
        </div>
      </section>
      
      {/* Stats Overview */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Real-Time Performance Dashboard
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See live data from our Chrome extension users across Canada. 
              These numbers update in real-time as appointments get booked.
            </p>
          </div>
          <StatsCards />
        </div>
      </section>

      {/* Live Data & City Performance Section */}
      <section className="py-20 bg-background" data-section="live-feed">
        <div className="container mx-auto px-6">
          {/* Live Appointment Booked Feed - Full Width */}
          <div className="mb-12">
            <LiveBookingFeed />
          </div>
          
          {/* City Performance - Horizontal Layout */}
          <div className="mb-12">
            <CityPerformance />
          </div>
          
          {/* Booking Activity Heatmap */}
          <div className="mb-12">
            <BookingHeatmap />
          </div>
        </div>
      </section>

      {/* Geographic Distribution */}
      <section className="py-20 bg-secondary/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Nationwide Coverage
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our extension works across all major Canadian cities. 
              See where appointments are being booked and join thousands in your area.
            </p>
          </div>
          <LocationMap />
        </div>
      </section>

      {/* Historical Performance */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Proven Track Record
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our bot has been consistently delivering results month after month.
              See the growth trend and success rate stability over time.
            </p>
          </div>
          <TrendChart />
        </div>
      </section>

      {/* Top Cities Performance */}
      <section className="py-20 bg-secondary/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              City Performance Leaders
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See which cities are booking the most appointments over the last 6 months.
              Each bar shows the monthly breakdown of successful bookings per location.
            </p>
          </div>
          <TopCitiesChart />
        </div>
      </section>

      {/* Telegram Channels */}
      <TelegramChannels />

      {/* Pricing */}
      <div data-section="pricing">
        <PricingSection />
      </div>

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <Footer />
    </main>
  );
};

export default Index;
