import { motion } from 'framer-motion';
import { Building2, Users, TrendingUp } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const pillars = [
  {
    icon: Building2,
    title: 'Modern Facilities',
    description: 'State-of-the-art emergency rooms and micro-hospitals',
  },
  {
    icon: Users,
    title: 'Community Focus',
    description: 'Partnering with local communities for better healthcare',
  },
  {
    icon: TrendingUp,
    title: 'High Performance',
    description: 'Optimized operations for maximum patient care efficiency',
  },
];

export const PillarsSection = () => {
  return (
    <section className="section-padding bg-card">
      <div className="container-focus">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
              The Three Pillars
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our foundation for delivering exceptional healthcare infrastructure
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <ScrollReveal key={pillar.title} delay={index * 0.15}>
              <motion.div
                whileHover={{ y: -8 }}
                className="group relative p-8 rounded-2xl bg-background border border-border transition-all duration-300 hover:border-primary/30 hover:shadow-xl"
              >
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Red Accent Line on Hover */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-accent rounded-full transition-all duration-300 group-hover:w-16" />

                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <pillar.icon size={28} className="text-primary" />
                  </div>

                  <h3 className="text-xl font-heading font-semibold mb-3">
                    {pillar.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
