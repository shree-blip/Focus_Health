"use client";

import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const points = [
  {
    icon: TrendingUp,
    title: 'Population Growth',
    description: 'Rapidly expanding Texas markets driving increased demand for accessible emergency care.',
  },
  {
    icon: Users,
    title: 'Convenient Access',
    description: 'Modern facilities bringing emergency services closer to communities in high-growth areas.',
  },
  {
    icon: Zap,
    title: 'Operational Efficiency',
    description: 'Standardized delivery model enabling consistent, high-quality care across all locations.',
  },
];

const marketData = [
  { year: '2022', demand: 42 },
  { year: '2023', demand: 54 },
  { year: '2024', demand: 68 },
  { year: '2025', demand: 79 },
  { year: '2026', demand: 91 },
];

interface MarketSectionProps {
  onOpenOpportunities?: () => void;
}

export const MarketSection = ({ onOpenOpportunities }: MarketSectionProps) => {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container-focus relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <ScrollReveal>
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                Market Opportunity
              </span>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 sm:mb-6">
                Expanding FSER Market
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="text-muted-foreground text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed">
                Texas's population growth creates compelling opportunities for strategically located freestanding emergency rooms and micro-hospitals.
              </p>
            </ScrollReveal>

            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
              {points.map((point, index) => (
                <ScrollReveal key={point.title} delay={0.3 + index * 0.1}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-card transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <point.icon size={16} className="text-primary sm:hidden" />
                      <point.icon size={20} className="text-primary hidden sm:block" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base">{point.title}</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">{point.description}</p>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.6}>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <Button variant="hero" size="lg" onClick={onOpenOpportunities} className="w-full sm:w-auto">
                  <MapPin size={18} className="mr-2" />
                  View Texas Markets
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Download Overview (Coming Soon)
                </Button>
              </div>
            </ScrollReveal>
          </div>

          {/* Visual */}
          <ScrollReveal direction="left">
            <div className="relative">
              <div className="aspect-[4/3] lg:aspect-square rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-6">
                <div className="w-full h-full rounded-xl bg-card/80 border border-border p-3 sm:p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marketData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="demand"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                        activeDot={{ r: 6, fill: 'hsl(var(--accent))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-4 -right-4 bg-card shadow-xl rounded-xl p-4 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <TrendingUp size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Texas Markets</p>
                    <p className="font-heading font-semibold">High Growth</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
