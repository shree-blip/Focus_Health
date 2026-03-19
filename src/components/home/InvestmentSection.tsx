"use client";

import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp, Target, Building2 } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import Link from 'next/link';

const investmentHighlights = [
  {
    icon: DollarSign,
    label: 'Capital Raise',
    value: '$3.4M',
    description: 'Growth capital for immediate Texas acquisition',
  },
  {
    icon: Users,
    label: 'Investor Spots',
    value: '10',
    description: '$250K minimum check size',
  },
  {
    icon: TrendingUp,
    label: 'Target ROI',
    value: '15-20%',
    description: 'Average annual return',
  },
];


const coreStrengths = [
  {
    icon: Target,
    title: 'Proven Turnkey ER Model',
    description: 'Demonstrated success with operational framework, staffing structure, and technology integration',
  },
  {
    icon: Users,
    title: 'Experienced Management',
    description: 'Led by Jay Dahal with 24+ locations managed and $100M+ annual revenue experience',
  },
  {
    icon: Building2,
    title: 'Strategic Locations',
    description: 'Data-driven approach targeting high-growth Texas markets with immediate revenue potential',
  },
];

export const InvestmentSection = () => {
  return (
    <section className="section-padding bg-card relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      <div className="container-focus relative">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6"
            >
              Investment Opportunity
            </motion.span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 sm:mb-6">
              $3.4M Growth Capital <span className="text-gradient-blue">Raise</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Immediate acquisition opportunity in high-growth Texas markets. Partner with an experienced operator to build the next generation of emergency care facilities.
            </p>
          </div>
        </ScrollReveal>

        {/* Investment Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16 max-w-4xl mx-auto">
          {investmentHighlights.map((highlight, index) => (
            <ScrollReveal key={highlight.label} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative bg-background rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <highlight.icon size={20} className="text-primary sm:hidden" />
                  <highlight.icon size={24} className="text-primary hidden sm:block" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">{highlight.label}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-foreground mb-1 sm:mb-2">
                  {highlight.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">{highlight.description}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>


        {/* Core Strengths */}
        <ScrollReveal>
          <div className="bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-border mb-8 sm:mb-12">
            <h3 className="text-lg sm:text-xl md:text-2xl font-heading font-bold mb-6 sm:mb-8 text-center">Why Invest With Focus Health?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {coreStrengths.map((strength, index) => (
                <motion.div
                  key={strength.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <strength.icon size={24} className="text-primary sm:hidden" />
                    <strength.icon size={28} className="text-primary hidden sm:block" />
                  </div>
                  <h4 className="font-heading font-semibold text-base sm:text-lg mb-2">{strength.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{strength.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal>
          <div className="text-center">
            <Link href="/partners?tab=investors">
              <Button variant="hero" size="lg" className="group">
                Request Investor Deck
                <motion.span
                  className="ml-2"
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                >
                  →
                </motion.span>
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Limited partnership spots available • January 2026 timeline
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
