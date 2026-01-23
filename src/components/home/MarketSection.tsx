import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

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
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <ScrollReveal>
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                Market Opportunity
              </span>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6">
                Expanding FSER Market
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                Texas's population growth creates compelling opportunities for strategically located freestanding emergency rooms and micro-hospitals.
              </p>
            </ScrollReveal>

            <div className="space-y-6 mb-10">
              {points.map((point, index) => (
                <ScrollReveal key={point.title} delay={0.3 + index * 0.1}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-card transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <point.icon size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold mb-1">{point.title}</h3>
                      <p className="text-muted-foreground text-sm">{point.description}</p>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.6}>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="lg" onClick={onOpenOpportunities}>
                  <MapPin size={18} className="mr-2" />
                  View Texas Markets
                </Button>
                <Button variant="outline" size="lg">
                  Download Overview (Coming Soon)
                </Button>
              </div>
            </ScrollReveal>
          </div>

          {/* Visual */}
          <ScrollReveal direction="left">
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 flex items-center justify-center">
                {/* Abstract Growth Chart */}
                <svg viewBox="0 0 300 300" className="w-full h-full">
                  {/* Grid Lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.line
                      key={`h-${i}`}
                      x1="50"
                      y1={50 + i * 50}
                      x2="280"
                      y2={50 + i * 50}
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    />
                  ))}

                  {/* Upward Trend Line */}
                  <motion.path
                    d="M60 230 Q 100 200 140 180 T 200 120 T 260 60"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />

                  {/* Data Points */}
                  {[
                    { cx: 60, cy: 230 },
                    { cx: 120, cy: 190 },
                    { cx: 180, cy: 140 },
                    { cx: 240, cy: 80 },
                  ].map((point, i) => (
                    <motion.circle
                      key={i}
                      cx={point.cx}
                      cy={point.cy}
                      r="8"
                      fill="hsl(var(--primary))"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.15 }}
                    />
                  ))}

                  {/* Accent Highlight */}
                  <motion.circle
                    cx="240"
                    cy="80"
                    r="16"
                    fill="none"
                    stroke="hsl(var(--accent))"
                    strokeWidth="3"
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 }}
                  />
                </svg>
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
