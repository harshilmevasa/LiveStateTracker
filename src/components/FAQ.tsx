import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const faqs = [
  {
    question: "Do you collect password for US Visa Appointments?",
    answer: "We don't collect password. If you're using chrome extension then the password is saved in your chrome browser only."
  },
  {
    question: "How does alert work?",
    answer: "Telegram channel is available for AIS portal and specifically for Canada. It gathers open dates from multiple accounts and send alerts in real time to the telegram channel."
  },
  {
    question: "What if I want to transfer credits to another email?",
    answer: "We cannot transfer credits to a different email. Credits are tied to the email you provided at the time of payment. If there's a spelling mistake in that email, we can fix it—but transferring to a completely new email is not possible."
  },
  {
    question: "What's the policy on refunds?",
    answer: "We currently do not offer refunds at the moment, We will be rolling out refund policy in near future."
  },
  {
    question: "What should I do if I have more questions?",
    answer: "If you have any inquiries or need assistance, feel free to reach out to us at blsappointments.ca@gmail.com We're committed to ensuring the best experience."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 mb-4">
            Got Questions?
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about our services and how they work.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card 
              key={index} 
              className="bg-gradient-card shadow-card border-border hover:shadow-glow transition-all duration-300"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="flex w-full items-center justify-between gap-4 p-6 text-left font-medium transition-colors hover:bg-secondary/30"
                aria-expanded={openIndex === index}
              >
                <span className="text-lg font-semibold text-foreground">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`h-6 w-6 shrink-0 text-muted-foreground transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 p-6 bg-card/50 rounded-lg border border-border/50 max-w-4xl mx-auto">
          <p className="text-lg text-foreground mb-2">
            Still have questions?
          </p>
          <p className="text-muted-foreground">
            Contact us at{' '}
            <a 
              href="mailto:blsappointments.ca@gmail.com" 
              className="text-primary hover:underline font-semibold"
            >
              blsappointments.ca@gmail.com
            </a>{' '}
            for personalized assistance.
          </p>
        </div>
      </div>
    </section>
  );
}
