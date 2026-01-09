import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp, Target, Building2 } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { Link } from 'react-router-dom';

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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6">
              $3.4M Growth Capital <span className="text-gradient-blue">Raise</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Immediate acquisition opportunity in high-growth Texas markets. Partner with an experienced operator to build the next generation of emergency care facilities.
            </p>
          </div>
        </ScrollReveal>

        {/* Investment Highlights Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
          {investmentHighlights.map((highlight, index) => (
            <ScrollReveal key={highlight.label} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative bg-background rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <highlight.icon size={24} className="text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{highlight.label}</p>
                <p className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
                  {highlight.value}
                </p>
                <p className="text-sm text-muted-foreground">{highlight.description}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>


        {/* Core Strengths */}
        <ScrollReveal>
          <div className="bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-2xl p-8 border border-border mb-12">
            <h3 className="text-xl sm:text-2xl font-heading font-bold mb-8 text-center">Why Invest With Focus Health?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {coreStrengths.map((strength, index) => (
                <motion.div
                  key={strength.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <strength.icon size={28} className="text-primary" />
                  </div>
                  <h4 className="font-heading font-semibold text-lg mb-2">{strength.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{strength.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal>
          <div className="text-center">
            <Link to="/partners?tab=investors">
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
