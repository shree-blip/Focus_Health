import { Link } from 'react-router-dom';
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
    href: '/partners?tab=investors',
    gradient: 'from-primary/10 to-secondary/10',
  },
  {
    icon: Users,
    title: 'For Communities',
    description: 'Partnership-first approach, strategic site planning, and comprehensive operational management.',
    cta: 'Start Conversation',
    href: '/partners?tab=communities',
    gradient: 'from-accent/10 to-accent/5',
  },
];

export const SplitCTASection = () => {
  return (
    <section className="section-padding bg-card">
      <div className="container-focus">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
              Partner With Focus
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Two pathways to building the future of community healthcare
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {paths.map((path, index) => (
            <ScrollReveal key={path.title} delay={index * 0.15}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative h-full p-8 rounded-2xl bg-gradient-to-br ${path.gradient} border border-border hover:border-primary/30 transition-all duration-300 group`}
              >
                <div className="flex flex-col h-full">
                  <div className="w-14 h-14 rounded-xl bg-card shadow-sm flex items-center justify-center mb-6 group-hover:shadow-md transition-shadow">
                    <path.icon size={28} className="text-primary" />
                  </div>

                  <h3 className="text-2xl font-heading font-semibold mb-3">
                    {path.title}
                  </h3>

                  <p className="text-muted-foreground mb-8 flex-1">
                    {path.description}
                  </p>

                  <Button variant="outline" className="w-full group/btn" asChild>
                    <Link to={path.href}>
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
