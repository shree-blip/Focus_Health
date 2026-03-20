"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, MapPin, Building, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/ui/PageHero';
const heroMarket = "/hero-market.jpg";

const strategicMarkets = [
  {
    id: 'dfw',
    title: 'Dallas-Fort Worth Metro',
    popup: 'DFW Metro: Irving, Dallas, Fort Worth, and surrounding high-growth suburbs.',
    x: 210,
    y: 70,
    shortLabel: 'DFW',
  },
  {
    id: 'houston',
    title: 'Houston Suburbs',
    popup: 'Houston Suburbs: Rapid expansion areas with increasing emergency care demand.',
    x: 255,
    y: 172,
    shortLabel: 'HOU',
  },
  {
    id: 'austin-sa',
    title: 'Austin-San Antonio Corridor',
    popup: 'Austin-San Antonio Corridor: Strong migration and healthcare infrastructure needs.',
    x: 165,
    y: 170,
    shortLabel: 'ATX-SA',
  },
];

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
  const [activeMarket, setActiveMarket] = useState<string | null>(null);
  const toggleActiveMarket = (id: string) => {
    setActiveMarket((current) => (current === id ? null : id));
  };

  return (
    <>
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
                  {strategicMarkets.map((market, i) => (
                    <motion.div
                      key={market.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 text-foreground cursor-pointer"
                      onMouseEnter={() => setActiveMarket(market.id)}
                      onMouseLeave={() => setActiveMarket((current) => (current === market.id ? null : current))}
                      onClick={() => toggleActiveMarket(market.id)}
                    >
                      <div className={`w-2 h-2 rounded-full ${activeMarket === market.id ? 'bg-primary' : 'bg-accent'}`} />
                      <span className="font-medium">{market.title}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/5 p-8 flex items-center justify-center relative">
                {/* Texas Shape Map (detailed SVG) */}
                <svg viewBox="0 0 320 280" className="w-full h-full max-w-md" style={{ minHeight: 200 }}>
                  <path
                    d="M105 28 L135 33 L170 24 L198 32 L222 32 L243 47 L247 70 L273 93 L286 126 L267 143 L243 143 L238 160 L229 173 L221 194 L205 208 L200 234 L178 226 L154 248 L138 237 L126 245 L110 236 L96 215 L92 192 L73 191 L53 174 L49 149 L30 131 L40 102 L63 86 L61 64 L76 54 L90 59 L97 43 Z"
                    fill="hsl(var(--primary) / 0.1)"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                  />

                  {/* Market Points */}
                  {strategicMarkets.map((point, i) => {
                    const isActive = activeMarket === point.id;
                    return (
                      <g
                        key={point.id}
                        onMouseEnter={() => setActiveMarket(point.id)}
                        onMouseLeave={() => setActiveMarket((current) => (current === point.id ? null : current))}
                        onClick={() => toggleActiveMarket(point.id)}
                        style={{ cursor: 'pointer' }}
                      >
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={isActive ? 12 : 10}
                        fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}
                        style={{ transition: 'all 0.2s ease' }}
                      />
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={isActive ? 24 : 20}
                        fill="none"
                        stroke={isActive ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}
                        strokeWidth="2"
                        opacity="0.4"
                        className="animate-ping"
                        style={{ transformOrigin: `${point.x}px ${point.y}px`, animationDelay: `${i * 0.3}s` }}
                      />
                      <text
                        x={point.x}
                        y={point.y - 22}
                        textAnchor="middle"
                        fill="hsl(var(--foreground))"
                        fontSize="12"
                        fontWeight="600"
                      >
                        {point.shortLabel}
                      </text>
                    </g>
                    );
                  })}
                </svg>

                {activeMarket && (
                  <div className="absolute left-1/2 bottom-4 -translate-x-1/2 w-[88%] rounded-lg border border-border bg-background/95 backdrop-blur px-4 py-3 shadow-lg">
                    <p className="text-sm font-semibold text-foreground">
                      {strategicMarkets.find((market) => market.id === activeMarket)?.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {strategicMarkets.find((market) => market.id === activeMarket)?.popup}
                    </p>
                  </div>
                )}
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
              <Link href="/partners">
                Partner With Us
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>
    </>
);
};

export default MarketPage;
