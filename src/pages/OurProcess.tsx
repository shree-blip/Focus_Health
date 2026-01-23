import { motion } from 'framer-motion';
import { MapPin, Building, Users2, Rocket, LineChart, Clock, Shield, TrendingUp, Building2, ExternalLink, Play } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { PageHero } from '@/components/ui/PageHero';
import { Button } from '@/components/ui/button';
import heroProcess from '@/assets/hero-process.jpg';
import facilityIrving from '@/assets/facility-er-irving-real.webp';
import facilityLufkin from '@/assets/facility-er-lufkin-real.png';
import facilityWellness from '@/assets/facility-wellness-clinic.jpg';
import grandOpeningVideo from '@/assets/ERofIrving-GrandOpening.mp4';

const processSteps = [
  {
    id: 1,
    icon: MapPin,
    title: 'Market & Site Selection',
    shortDesc: 'Strategic location analysis',
    fullDesc: 'Rigorous market analysis identifies high-growth Texas markets with underserved populations. We evaluate demographics, competition, accessibility, and long-term growth potential to select optimal sites.',
  },
  {
    id: 2,
    icon: Building,
    title: 'Facility Build & Compliance',
    shortDesc: 'Turn-key construction',
    fullDesc: 'From ground-up builds to retrofits, we manage the entire construction process. Our standardized facility design ensures regulatory compliance, operational efficiency, and exceptional patient experience.',
  },
  {
    id: 3,
    icon: Users2,
    title: 'Clinical + Ops Staffing',
    shortDesc: 'Expert team assembly',
    fullDesc: 'We recruit and train high-caliber clinical and operational staff. Our proven staffing model ensures 24/7 coverage with the right mix of experience and credentials for each location.',
  },
  {
    id: 4,
    icon: Rocket,
    title: 'Launch & 24/7 Operations',
    shortDesc: 'Seamless activation',
    fullDesc: 'Our launch playbook ensures a smooth opening with immediate operational excellence. We handle credentialing, payer contracting, community outreach, and day-one readiness.',
  },
  {
    id: 5,
    icon: LineChart,
    title: 'Performance Optimization',
    shortDesc: 'Continuous improvement',
    fullDesc: 'Ongoing operational refinement drives efficiency and quality. We monitor key metrics, implement best practices, and continuously optimize staffing, throughput, and patient satisfaction.',
  },
];

const facilities = [
  {
    name: 'ER of Irving',
    location: 'Irving, TX',
    type: 'Freestanding Emergency Room',
    image: facilityIrving,
    website: 'https://erofirving.com/',
    status: 'Operational',
    services: ['24/7 Emergency Care', 'On-site Lab', 'CT & X-Ray', 'Pediatric Care'],
  },
  {
    name: 'ER of Lufkin',
    location: 'Lufkin, TX',
    type: 'Freestanding Emergency Room',
    image: facilityLufkin,
    website: 'http://eroflufkin.com/',
    status: 'Operational',
    services: ['24/7 Emergency Care', 'On-site Lab', 'Imaging Services', 'Adult & Pediatric'],
  },
  {
    name: 'Irving Wellness Clinic',
    location: 'Irving, TX',
    type: 'Wellness Clinic',
    image: facilityWellness,
    website: 'https://irvingwellnessclinic.com/',
    status: 'Operational',
    services: ['Primary Care', 'Preventive Medicine', 'Health Screenings', 'Chronic Care'],
  },
  {
    name: 'Naperville Health & Wellness',
    location: 'Naperville, IL',
    type: 'Health & Wellness Center',
    image: facilityWellness,
    website: 'https://www.napervillehwclinic.com/',
    status: 'Operational',
    services: ['Integrative Medicine', 'Wellness Programs', 'Preventive Care', 'Health Coaching'],
  },
];

const operatingSystem = [
  { icon: Clock, title: '24/7 Operations', description: 'Round-the-clock emergency services with consistent staffing models.' },
  { icon: Shield, title: 'Quality Assurance', description: 'Rigorous clinical protocols and continuous quality improvement.' },
  { icon: TrendingUp, title: 'Performance Metrics', description: 'Data-driven operations with transparent KPI tracking.' },
  { icon: Building2, title: 'Facility Standards', description: 'Modern, well-maintained facilities that exceed patient expectations.' },
];

const OurProcessPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <PageHero
        title="Our Process"
        description="From site selection to operational excellence — see how we build and operate world-class healthcare facilities."
        backgroundImage={heroProcess}
        primaryCta={{ text: "View Our Facilities", link: "#facilities" }}
        secondaryCta={{ text: "Meet Our Team", link: "/leadership" }}
      />

      {/* Stats Grid */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 24, suffix: '+', label: 'Locations Managed' },
              { value: 4, suffix: '', label: 'Active Facilities' },
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

      {/* Process Steps */}
      <section id="process" className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Our Turnkey Process
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                A proven methodology refined through years of operational experience
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {processSteps.map((step, index) => (
              <ScrollReveal key={step.id} delay={index * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="h-full p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <step.icon size={24} className="text-primary" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      {step.id}
                    </div>
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{step.shortDesc}</p>
                  <p className="text-muted-foreground/80 text-sm">{step.fullDesc}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Our Facilities */}
      <section id="facilities" className="section-padding bg-card">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Our Healthcare Facilities
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Explore our network of operational healthcare facilities delivering exceptional patient care
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            {facilities.map((facility, index) => (
              <ScrollReveal key={facility.name} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-background rounded-2xl overflow-hidden border border-border shadow-lg"
                >
                  {/* Facility Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={facility.image} 
                      alt={facility.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full bg-accent/90 text-accent-foreground text-xs font-medium">
                        {facility.status}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/60 to-transparent p-4">
                      <p className="text-white/80 text-sm">{facility.type}</p>
                    </div>
                  </div>

                  {/* Facility Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-heading font-bold text-xl mb-1">{facility.name}</h3>
                        <p className="text-muted-foreground text-sm flex items-center gap-1">
                          <MapPin size={14} />
                          {facility.location}
                        </p>
                      </div>
                      <a 
                        href={facility.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>

                    {/* Services */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {facility.services.map((service) => (
                        <span 
                          key={service}
                          className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs"
                        >
                          {service}
                        </span>
                      ))}
                    </div>

                    <Button asChild variant="outline" className="w-full">
                      <a href={facility.website} target="_blank" rel="noopener noreferrer">
                        Visit Website
                        <ExternalLink size={16} className="ml-2" />
                      </a>
                    </Button>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Grand Opening Video */}
      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Grand Opening Moments
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Witness the launch of our latest healthcare facilities
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* ER of Irving Grand Opening */}
            <ScrollReveal>
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full aspect-video object-cover"
                >
                  <source src={grandOpeningVideo} type="video/mp4" />
                </video>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Play size={18} className="text-accent" />
                    <span className="text-accent text-sm font-medium">Grand Opening</span>
                  </div>
                  <h3 className="text-white font-heading font-bold text-xl">ER of Irving</h3>
                  <p className="text-white/70 text-sm">Ribbon cutting ceremony and facility tour</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Facility Highlights Card */}
            <ScrollReveal delay={0.1}>
              <div className="bg-card rounded-2xl border border-border p-8 h-full flex flex-col justify-center">
                <h3 className="font-heading font-bold text-2xl mb-6">Facility Launch Highlights</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Community Ribbon Cutting', desc: 'Official grand opening ceremony with local officials' },
                    { label: 'Facility Tours', desc: 'Guided walkthroughs showcasing state-of-the-art equipment' },
                    { label: 'Staff Introduction', desc: 'Meet the clinical and operational teams' },
                    { label: 'Community Outreach', desc: 'Educational sessions on available services' },
                  ].map((item, index) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-accent text-xs font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-muted-foreground text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
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

      {/* CTA Section */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-focus text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              Ready to Partner With Us?
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
              Learn how our proven process can help you build and operate successful healthcare facilities.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <a href="/investors">Investment Opportunities</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <a href="/contact">Contact Us</a>
              </Button>
            </div>
          </ScrollReveal>
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

export default OurProcessPage;
