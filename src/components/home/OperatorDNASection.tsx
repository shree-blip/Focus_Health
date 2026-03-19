"use client";

import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const metrics = [
  {
    value: 24,
    suffix: '+',
    label: 'Operational Locations Managed',
    highlight: false,
  },
  {
    value: 24,
    suffix: '/7',
    label: 'Operating Model',
    highlight: false,
  },
  {
    value: 3,
    suffix: '+',
    label: 'FSER Acquisitions in Focus',
    highlight: true,
  },
  {
    value: 10,
    suffix: '+',
    prefix: '',
    label: 'FSER Target in 3+ Years',
    highlight: false,
  },
];

export const OperatorDNASection = () => {
  return (
    <section className="section-padding bg-foreground text-primary-foreground overflow-hidden">
      <div className="container-focus">
        <ScrollReveal>
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3 sm:mb-4">
              Proven Operator DNA
            </h2>
            <p className="text-primary-foreground/70 text-base sm:text-lg max-w-2xl mx-auto">
              Built from real operations: 24+ locations managed.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 lg:gap-12">
          {metrics.map((metric, index) => (
            <ScrollReveal key={metric.label} delay={index * 0.1}>
              <div className="text-center">
                <div
                  className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-2 sm:mb-3 ${
                    metric.highlight ? 'text-accent' : ''
                  }`}
                >
                  {metric.prefix && <span>{metric.prefix}</span>}
                  <AnimatedCounter end={metric.value} />
                  <span>{metric.suffix}</span>
                </div>
                <p className="text-primary-foreground/60 text-xs sm:text-sm md:text-base leading-snug">
                  {metric.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Disclaimer */}
        <ScrollReveal delay={0.4}>
          <p className="text-center text-primary-foreground/40 text-[10px] sm:text-xs mt-8 sm:mt-12 max-w-2xl mx-auto px-4">
            Operational figures are directional; details shared during partner discussions.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
