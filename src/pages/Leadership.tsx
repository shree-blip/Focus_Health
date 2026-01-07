import { motion } from 'framer-motion';
import { Shield, Target, Users, TrendingUp, Heart } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const principles = [
  {
    icon: Shield,
    title: 'Integrity',
    description: 'Transparent dealings, honest communication, and ethical operations in all that we do.',
  },
  {
    icon: Target,
    title: 'Operational Excellence',
    description: 'Relentless focus on efficiency, quality, and continuous improvement across every location.',
  },
  {
    icon: Users,
    title: 'Community Partnership',
    description: 'Deep commitment to the communities we serve, building lasting relationships beyond transactions.',
  },
  {
    icon: TrendingUp,
    title: 'Long-Term Value',
    description: 'Building sustainable healthcare infrastructure that creates value for decades, not quarters.',
  },
  {
    icon: Heart,
    title: 'Patient-Centered Care',
    description: 'Every decision starts with the patient—their safety, experience, and outcomes come first.',
  },
];

const LeadershipPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="section-padding bg-hero-pattern">
        <div className="container-focus">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              Our Team
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6"
            >
              Leadership
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              Experienced operators building the next generation of healthcare infrastructure.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Founder Profile */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/5 flex items-center justify-center relative overflow-hidden">
                {/* Placeholder Frame */}
                <div className="absolute inset-8 border-2 border-dashed border-primary/20 rounded-xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                      <span className="text-4xl font-heading font-bold text-primary">JD</span>
                    </div>
                    <p className="text-muted-foreground text-sm">Profile Photo</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left">
              <div>
                <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-2">Jay Dahal</h2>
                <p className="text-primary font-medium text-lg mb-6">Founder & CEO</p>
                
                <div className="prose prose-lg">
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    With over five years of hands-on experience in healthcare operations, Jay has been instrumental in managing 24+ freestanding emergency room locations across Texas. His deep understanding of the FSER model—from site selection to operational optimization—forms the foundation of Focus Healthcare.
                  </p>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Jay founded Focus Healthcare with a clear vision: to bring institutional-grade discipline to healthcare infrastructure development while maintaining a community-first approach. He believes that operational excellence and community partnership are not mutually exclusive—they're essential complements.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Focus Healthcare represents the culmination of years of learning, adapting, and refining what works in FSER operations. Now, Jay is channeling that experience into building a platform that can scale while maintaining the quality and care that communities deserve.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Our Principles
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                The values that guide every decision we make
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {principles.map((principle, index) => (
              <ScrollReveal key={principle.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 text-center"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <principle.icon size={28} className="text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-3">{principle.title}</h3>
                  <p className="text-muted-foreground">{principle.description}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LeadershipPage;
