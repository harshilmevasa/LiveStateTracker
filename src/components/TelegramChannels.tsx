import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ExternalLink, MapPin, Globe } from 'lucide-react';

const channels = [
  {
    name: 'Telegram Channel - Canada',
    description: 'Best Service To Start With',
    countries: ['Canada'],
    features: [
      'No Payment Required',
      'Get Instant Alerts',
      'Track All Consulates In One Place',
      'No Password Required'
    ],
    actionText: 'Join Canada Channel',
    actionUrl: 'https://t.me/US_Visa_Appointment_Alerts_CA',
    icon: MessageCircle,
    flagEmoji: '🇨🇦'
  },
  {
    name: 'Telegram Channel - CGI Portal',
    description: 'Global CGI Portal Coverage',
    countries: ['Dubai', 'Abu Dhabi', 'Turkey', 'Pakistan', 'India', 'Algeria', 'Bangladesh'],
    features: [
      'No Payment Required',
      'Get Instant Alerts',
      'Multiple Countries Coverage',
      'No Password Required'
    ],
    actionText: 'Join CGI Channel',
    actionUrl: 'https://t.me/alertmeasap_CGI_US',
    icon: Globe,
    flagEmoji: '🌍'
  }
];

export default function TelegramChannels() {
  return (
    <section className="py-20 bg-secondary/10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="bg-success/20 text-success border-success/30 mb-4">
            Free Telegram Alerts
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Stay Updated with Instant Notifications
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get real-time alerts when new appointment slots become available. 
            Join thousands of users who never miss an opportunity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <Card 
                key={channel.name} 
                className="relative p-6 bg-gradient-card shadow-card border-border hover:shadow-glow transition-all duration-300"
              >
                 <div className="text-center mb-6">
                   <h3 className="text-2xl font-bold text-foreground mb-2">{channel.name}</h3>
                   <p className="text-muted-foreground">{channel.description}</p>
                 </div>

                {/* Countries covered */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Countries Covered:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {channel.countries.map((country, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full bg-success hover:bg-success/90 text-white transition-all duration-300"
                  onClick={() => window.open(channel.actionUrl, '_blank')}
                >
                  <span className="flex items-center gap-2">
                    {channel.actionText}
                    <ExternalLink className="w-4 h-4" />
                  </span>
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-3">
                  ⚡ Instant alerts • 🔒 No payment required • 💯 Join thousands of users
                </p>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12 p-6 bg-card/50 rounded-lg border border-border/50 max-w-4xl mx-auto">
          <p className="text-lg text-foreground mb-2">
            <span className="font-semibold text-success">Thousands of users</span> rely on our Telegram alerts daily
          </p>
          <p className="text-muted-foreground">
            Never miss a slot again - get notified the moment new appointments become available
          </p>
        </div>
      </div>
    </section>
  );
}
