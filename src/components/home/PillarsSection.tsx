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
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3 sm:mb-4">
              The Three Pillars
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Our foundation for delivering exceptional healthcare infrastructure
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {pillars.map((pillar, index) => (
            <ScrollReveal key={pillar.title} delay={index * 0.15}>
              <motion.div
                whileHover={{ y: -8 }}
                className="group relative p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-background border border-border transition-all duration-300 hover:border-primary/30 hover:shadow-xl"
              >
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Red Accent Line on Hover */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-accent rounded-full transition-all duration-300 group-hover:w-16" />

                <div className="relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary/20 transition-colors">
                    <pillar.icon size={24} className="text-primary sm:hidden" />
                    <pillar.icon size={28} className="text-primary hidden sm:block" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-heading font-semibold mb-2 sm:mb-3">
                    {pillar.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
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
