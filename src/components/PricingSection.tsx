import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Chrome, MessageCircle, Cloud, ExternalLink, Server } from 'lucide-react';

const plans = [
  {
    name: 'AIS Portal: Chrome Extension',
    price: '$15',
    period: 'USD',
    description: 'Works For AIS Portal Countries',
    features: [
      'Book Early Appointments Automatically',
      'Checks New Dates At Your Set Interval',
      'Works On Your PC/Laptop',
      'Most Advanced Extension Compared to Competitors',
      'Install Now To Get Free Credits!'
    ],
    popular: true,
    icon: Chrome,
    actionText: 'Get it on Chrome',
    actionUrl: 'https://chromewebstore.google.com/detail/us-visa-slots-auto-check/fpafhfnhpbifhgjjfgaffgoccjmglnbg'
  },
  {
    name: 'CGI Portal: Chrome Extension',
    price: '$15',
    period: 'USD',
    description: 'Works For CGI Portal Countries',
    features: [
      'Book Early Appointments Automatically',
      'Checks New Dates At Your Set Interval',
      'Works On Your PC/Laptop',
      'Most Advanced Extension Compared to Competitors',
      'Install Now To Get Free Credits!'
    ],
    popular: false,
    icon: Chrome,
    actionText: 'Get it on Chrome',
    actionUrl: 'https://chromewebstore.google.com/detail/cgi-auto-rescheduler/dcedfkcknhdkikfapchmecfcaabfgnlb'
  },
  {
    name: 'Most Advanced : AIS/CGI Cloud Plan',
    price: '$100',
    period: 'USD',
    description: 'Works For Both Portals',
    features: [
      'Runs 24/7 On My Server - No Need To Keep Your Laptop ON',
      'Smartly Check Date At Exact Moment When New Dates Are Released (for AIS only)',
      'Be Stress Free From Constantly Running Extension or Checking Early Dates Manually',
      'We Need Password to Book Appointment'
    ],
    popular: false,
    icon: Server,
    actionText: 'Buy Now',
    actionUrl: 'https://buy.stripe.com/aEU7v6fQN1xB9La5ko'
  }
];

export default function PricingSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 mb-4">
            Premium Services
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Choose Your Booking Solution
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced automation tools for securing your visa appointments faster than ever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.name} 
                className={`relative p-8 bg-gradient-card shadow-card border-border hover:shadow-glow transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-primary/50 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-primary-foreground border-0 px-4 py-1"
                  >
                    Most Popular
                  </Badge>
                )}

                <div className="text-center mb-8">
                  <Icon className={`w-12 h-12 mx-auto mb-4 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">/ {plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  size="lg" 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-primary hover:shadow-glow text-white' 
                      : 'bg-primary hover:bg-primary/90 text-white'
                  } transition-all duration-300`}
                  onClick={() => window.open(plan.actionUrl, '_blank')}
                >
                  <span className="flex items-center gap-2">
                    {plan.actionText}
                    <ExternalLink className="w-4 h-4" />
                  </span>
                </Button>

                {plan.popular && (
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    ⚡ Instant booking • 🔒 Advanced features • 💯 Free credits included
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12 p-6 bg-card/50 rounded-lg border border-border/50 max-w-4xl mx-auto">
          <p className="text-lg text-foreground mb-2">
            <span className="font-semibold text-success">21,015+ appointments</span> booked successfully across all services
          </p>
          <p className="text-muted-foreground">
            Join thousands of users who trust our proven booking solutions
          </p>
        </div>
      </div>
    </section>
  );
}