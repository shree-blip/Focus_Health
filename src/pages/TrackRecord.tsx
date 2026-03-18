import { motion } from 'framer-motion';
import { Building2, Clock, Shield, TrendingUp, ExternalLink, Stethoscope, Heart } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { PageHero } from '@/components/ui/PageHero';
import heroTrackRecord from '@/assets/hero-track-record.jpg';
import facilityErIrving from '@/assets/facility-er-irving-real.webp';
import facilityErLufkin from '@/assets/facility-er-lufkin-real.png';

const healthcarePortfolio = [
  {
    name: 'ER of Irving',
    type: 'Freestanding Emergency Room',
    description: '24/7 freestanding emergency room in Irving, TX with board-certified physicians, on-site CT, X-ray, and lab services. Pediatric and adult emergency care with minimal wait times.',
    url: 'https://erofirving.com',
    image: facilityErIrving,
  },
  {
    name: 'ER of Lufkin',
    type: 'Freestanding Emergency Room',
    description: '24/7 emergency room in Lufkin, TX with board-certified ER physicians, on-site imaging, pharmacy, and lab testing. Comprehensive emergency care for all ages.',
    url: 'https://eroflufkin.com',
    image: facilityErLufkin,
  },
  {
    name: 'ER of White Rock',
    type: 'Freestanding Emergency Room',
    description: '24/7 emergency room in Dallas, TX with board-certified physicians and trauma-trained nurses. Advanced on-site imaging and lab services with minimal wait times.',
    url: 'https://erofwhiterock.com',
    image: null,
  },
  {
    name: 'Irving Health & Wellness Clinic',
    type: 'Health & Wellness Clinic',
    description: 'Premier wellness center in Irving offering physician-supervised medical weight loss, hormone therapy, aesthetic services, IV hydration therapy, and advanced body contouring.',
    url: 'https://irvingwellnessclinic.com',
    image: null,
  },
  {
    name: 'Naperville Health & Wellness Clinic',
    type: 'Health & Wellness Clinic',
    description: 'Comprehensive wellness clinic in Naperville offering personalized medical weight loss, IV hydration therapy, aesthetic treatments, and holistic care solutions.',
    url: 'https://napervillehwclinic.com',
    image: null,
  },
];

const processSteps = [
  {
    title: 'Market Analysis',
    description: 'Comprehensive demographic and competitive analysis to identify optimal sites.',
  },
  {
    title: 'Site Acquisition',
    description: 'Strategic real estate sourcing and negotiation for ideal locations.',
  },
  {
    title: 'Facility Development',
    description: 'Turnkey construction management with standardized, efficient designs.',
  },
  {
    title: 'Regulatory Compliance',
    description: 'Navigate licensing, credentialing, and regulatory requirements.',
  },
  {
    title: 'Staffing & Training',
    description: 'Recruit, credential, and train clinical and operational teams.',
  },
  {
    title: 'Launch & Operations',
    description: 'Execute proven launch playbook and ongoing operational management.',
  },
];

const operatingSystem = [
  { icon: Clock, title: '24/7 Operations', description: 'Round-the-clock emergency services with consistent staffing models.' },
  { icon: Shield, title: 'Quality Assurance', description: 'Rigorous clinical protocols and continuous quality improvement.' },
  { icon: TrendingUp, title: 'Performance Metrics', description: 'Data-driven operations with transparent KPI tracking.' },
  { icon: Building2, title: 'Facility Standards', description: 'Modern, well-maintained facilities that exceed patient expectations.' },
];

const TrackRecordPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <PageHero
        title="Proven Track Record"
        description="Our leadership team brings deep operational experience from managing freestanding emergency rooms across Texas."
        backgroundImage={heroTrackRecord}
        primaryCta={{ text: "View Our Process", link: "/our-process" }}
        secondaryCta={{ text: "Meet Our Team", link: "/leadership" }}
      />

      {/* Stats Grid */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 24, suffix: '+', label: 'Locations Managed' },
              { value: 5, suffix: '+', label: 'Years Experience' },
              { value: 24, suffix: '/7', label: 'Operating Model' },
              { value: 3, suffix: '+', label: 'Acquisitions in Focus' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-background border border-border"
              >
                <div className="text-3xl sm:text-4xl font-heading font-bold text-primary mb-2">
                  <AnimatedCounter end={stat.value} />
                  {stat.suffix}
                </div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Our Process
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                A proven methodology refined through years of operational experience
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processSteps.map((step, index) => (
              <ScrollReveal key={step.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold mb-1">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Operating System */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Our Operating System
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Standardized excellence across every location
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {operatingSystem.map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 0.1}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={24} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Healthcare Portfolio */}
      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Healthcare Management Portfolio
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Our full track record of healthcare facilities under active management and development
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthcarePortfolio.map((facility, index) => (
              <ScrollReveal key={facility.name} delay={index * 0.1}>
                <motion.a
                  href={facility.url}
                  target="_blank"
                  rel="dofollow"
                  whileHover={{ y: -6 }}
                  className="group block rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all h-full"
                >
                  {/* Image or Icon Header */}
                  <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                    {facility.image ? (
                      <img
                        src={facility.image}
                        alt={facility.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {facility.type.includes('Emergency') ? (
                          <Stethoscope size={48} className="text-primary/30" />
                        ) : (
                          <Heart size={48} className="text-accent/30" />
                        )}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground">
                      {facility.type}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-heading font-bold text-lg">{facility.name}</h3>
                      <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{facility.description}</p>
                    <span className="inline-block mt-4 text-sm font-medium text-primary group-hover:underline">
                      Visit Website →
                    </span>
                  </div>
                </motion.a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-muted">
        <div className="container-focus">
          <p className="text-center text-muted-foreground text-sm">
            Operational figures are directional; specific details shared during partner discussions.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default TrackRecordPage;
