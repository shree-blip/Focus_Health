import { motion } from 'framer-motion';
import { TrendingUp, MapPin, Building, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/ui/PageHero';
import heroMarket from '@/assets/hero-market.jpg';

const marketDrivers = [
  {
    icon: TrendingUp,
    title: 'Population Growth',
    description: 'Texas continues to lead the nation in population growth, with major metros expanding rapidly into suburban and exurban areas.',
  },
  {
    icon: MapPin,
    title: 'Geographic Gaps',
    description: 'New developments often lack convenient access to emergency services, creating natural demand for strategically located FSERs.',
  },
  {
    icon: Building,
    title: 'Modern Facilities',
    description: 'Purpose-built emergency rooms offer patients faster access and more personalized care compared to crowded hospital ERs.',
  },
  {
    icon: Users,
    title: 'Community Need',
    description: 'Growing communities value having emergency medical services closer to home, reducing critical response times.',
  },
];

const MarketPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <PageHero
        title="Why Texas FSERs"
        description="Texas's unique regulatory environment and explosive population growth create compelling opportunities for freestanding emergency room development."
        backgroundImage={heroMarket}
        primaryCta={{ text: "Explore Opportunities", link: "/partners" }}
        secondaryCta={{ text: "Our Platform", link: "/platform" }}
      />

      {/* Market Drivers */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Market Drivers
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Key factors fueling FSER demand in Texas
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            {marketDrivers.map((driver, index) => (
              <ScrollReveal key={driver.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex gap-6 p-8 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <driver.icon size={28} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-xl mb-2">{driver.title}</h3>
                    <p className="text-muted-foreground">{driver.description}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Texas Map Visualization */}
      <section className="section-padding bg-background">
        <div className="container-focus">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <div>
                <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
                  Strategic Texas Markets
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  We focus on high-growth corridors in the DFW metroplex, Houston suburbs, Austin-San Antonio corridor, and other emerging Texas markets with demonstrated population influx and healthcare access gaps.
                </p>
                <div className="space-y-4">
                  {['Dallas-Fort Worth Metro', 'Houston Suburbs', 'Austin-San Antonio Corridor'].map((market, i) => (
                    <motion.div
                      key={market}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 text-foreground"
                    >
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <span className="font-medium">{market}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/5 p-8 flex items-center justify-center relative">
                {/* Simplified Texas Shape */}
                <svg viewBox="0 0 300 280" className="w-full h-full max-w-md">
                  <motion.path
                    d="M100 20 L200 20 L250 60 L260 120 L240 160 L200 200 L180 260 L140 240 L100 260 L80 200 L40 160 L60 100 L100 20"
                    fill="hsl(var(--primary) / 0.1)"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2 }}
                  />
                  
                  {/* Market Points */}
                  {[
                    { x: 170, y: 60, label: 'DFW' },
                    { x: 200, y: 130, label: 'Houston' },
                    { x: 130, y: 130, label: 'Austin' },
                  ].map((point, i) => (
                    <g key={point.label}>
                      <motion.circle
                        cx={point.x}
                        cy={point.y}
                        r="12"
                        fill="hsl(var(--accent))"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1 + i * 0.2 }}
                      />
                      <motion.circle
                        cx={point.x}
                        cy={point.y}
                        r="20"
                        fill="none"
                        stroke="hsl(var(--accent))"
                        strokeWidth="2"
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.5 + i * 0.2, duration: 2, repeat: Infinity }}
                      />
                    </g>
                  ))}
                </svg>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-foreground text-primary-foreground">
        <div className="container-focus text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              Explore Partnership Opportunities
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8 max-w-2xl mx-auto">
              Learn how Focus Healthcare can help you capitalize on Texas's growing healthcare infrastructure needs.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link to="/partners">
                Partner With Us
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default MarketPage;
