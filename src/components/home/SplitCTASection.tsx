"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const paths = [
  {
    icon: Building2,
    title: 'For Investors',
    description: 'Disciplined operations, standardized build + launch playbook, and transparent reporting cadence.',
    cta: 'Explore Partnership',
    href: '/partners#opportunity-form',
    gradient: 'from-primary/10 to-secondary/10',
  },
  {
    icon: Users,
    title: 'For Communities',
    description: 'Partnership-first approach, strategic site planning, and comprehensive operational management.',
    cta: 'Start Conversation',
    href: '/partners#opportunity-form',
    gradient: 'from-accent/10 to-accent/5',
  },
];

export const SplitCTASection = () => {
  return (
    <section className="section-padding bg-card">
      <div className="container-focus">
        <ScrollReveal>
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3 sm:mb-4">
              Partner With Focus
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Two pathways to building the future of community healthcare
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
          {paths.map((path, index) => (
            <ScrollReveal key={path.title} delay={index * 0.15}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative h-full p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br ${path.gradient} border border-border hover:border-primary/30 transition-all duration-300 group`}
              >
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-card shadow-sm flex items-center justify-center mb-4 sm:mb-6 group-hover:shadow-md transition-shadow">
                    <path.icon size={24} className="text-primary sm:hidden" />
                    <path.icon size={28} className="text-primary hidden sm:block" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-heading font-semibold mb-2 sm:mb-3">
                    {path.title}
                  </h3>

                  <p className="text-muted-foreground mb-6 sm:mb-8 flex-1 text-sm sm:text-base">
                    {path.description}
                  </p>

                  <Button variant="outline" className="w-full group/btn" asChild>
                    <Link href={path.href}>
                      {path.cta}
                      <ArrowRight
                        size={16}
                        className="ml-2 transition-transform group-hover/btn:translate-x-1"
                      />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
