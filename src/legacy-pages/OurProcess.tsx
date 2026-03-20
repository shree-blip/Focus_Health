"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Building, Users2, Rocket, LineChart, Clock, Shield, TrendingUp, Building2, ExternalLink, Play } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { PageHero } from '@/components/ui/PageHero';
import { Button } from '@/components/ui/button';
const heroProcess = "/hero-process.jpg";
const facilityIrving = "/facility-er-irving-real.webp";
const facilityLufkin = "/facility-er-lufkin-real.png";
const facilityWellness = "/facility-wellness-clinic.jpg";
const grandOpeningVideo = "/ERofIrving-GrandOpening.mp4";
const facilityErWhiterock = "/facility-er-whiterock.png";
const irvingWellness1 = "/irving-wellness-1.jpg";
const irvingWellness2 = "/irving-wellness-2.jpg";
const irvingWellness3 = "/irving-wellness-3.jpg";
const napervilleWellness1 = "/naperville-wellness-1.jpg";
const napervilleWellness2 = "/naperville-wellness-2.jpg";
const napervilleWellness3 = "/naperville-wellness-3.jpg";
const napervilleWellness4 = "/naperville-wellness-4.jpg";

const AutoCarousel = ({ images, alt }: { images: string[]; alt: string }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-full">
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`${alt} ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.preventDefault();
              setCurrent(i);
            }}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === current ? 'bg-white w-3' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const healthcarePortfolio = [
  {
    name: 'ER of Irving',
    type: 'Freestanding Emergency Room',
    location: 'Irving, TX',
    description:
      'ER of Irving is a 24/7 freestanding emergency room in Irving, Texas providing board-certified emergency physicians, on-site CT scan, X-ray, ultrasound, and full laboratory services. Offering pediatric and adult emergency care with minimal wait times near Las Colinas, Valley Ranch, and greater Dallas-Fort Worth.',
    url: '/facilities/er-of-irving',
    image: facilityIrving,
    address: '8200 N MacArthur Blvd Suite 110, Irving, TX 75063',
    internal: true,
  },
  {
    name: 'ER of Lufkin',
    type: 'Freestanding Emergency Room',
    location: 'Lufkin, TX',
    description:
      'ER of Lufkin is a 24/7 freestanding emergency room in Lufkin, Texas staffed by board-certified ER physicians with on-site imaging, in-house pharmacy, and comprehensive lab testing. Serving Angelina County, Nacogdoches, and East Texas with full-service emergency care for all ages.',
    url: '/facilities/er-of-lufkin',
    image: facilityLufkin,
    address: '501 N Brentwood Dr, Lufkin, TX 75904',
    internal: true,
  },
  {
    name: 'ER of White Rock',
    type: 'Freestanding Emergency Room',
    location: 'Dallas, TX',
    description:
      'ER of White Rock is a 24/7 freestanding emergency room in Dallas, Texas with board-certified emergency physicians and trauma-trained nurses. Advanced on-site CT, X-ray, and lab services with minimal wait times near White Rock Lake, Lakewood, and East Dallas.',
    url: '/facilities/er-of-white-rock',
    image: facilityErWhiterock,
    address: '10705 Northwest Hwy, Dallas, TX 75238',
    internal: true,
  },
  {
    name: 'Irving Health & Wellness Clinic',
    type: 'Health & Wellness Clinic',
    location: 'Irving, TX',
    description:
      'Irving Health & Wellness Clinic is a premier wellness center in Irving, Texas offering medical expert supervised medical weight loss, hormone replacement therapy, aesthetic services, IV hydration therapy, and advanced body contouring. Serving Las Colinas, Valley Ranch, and DFW metroplex.',
    url: '/facilities/irving-wellness-clinic',
    images: [irvingWellness1, irvingWellness2, irvingWellness3],
    address: 'Irving, TX',
    internal: true,
  },
  {
    name: 'Naperville Health & Wellness Clinic',
    type: 'Health & Wellness Clinic',
    location: 'Naperville, IL',
    description:
      'Naperville Health & Wellness Clinic is a comprehensive wellness clinic in Naperville, Illinois offering personalized medical weight loss programs, IV hydration therapy, aesthetic treatments, and holistic care solutions. Serving Naperville, Aurora, Wheaton, and the greater Chicago suburbs.',
    url: '/facilities/naperville-wellness-clinic',
    images: [napervilleWellness1, napervilleWellness2, napervilleWellness3, napervilleWellness4],
    address: 'Naperville, IL',
    internal: true,
  },
];

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

const operatingSystem = [
  { icon: Clock, title: '24/7 Operations', description: 'Round-the-clock emergency services with consistent staffing models.' },
  { icon: Shield, title: 'Quality Assurance', description: 'Rigorous clinical protocols and continuous quality improvement.' },
  { icon: TrendingUp, title: 'Performance Metrics', description: 'Data-driven operations with transparent KPI tracking.' },
  { icon: Building2, title: 'Facility Standards', description: 'Modern, well-maintained facilities that exceed patient expectations.' },
];

const OurProcessPage = () => {
  return (
    <>
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
                Our full track record of healthcare facilities under active management and development
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" itemScope itemType="https://schema.org/ItemList">
            {healthcarePortfolio.map((facility, index) => {
              const isInternal = 'internal' in facility && facility.internal;
              const CardWrapper = ({ children }: { children: React.ReactNode }) =>
                isInternal ? (
                  <Link
                    href={facility.url}
                    className="group block rounded-2xl overflow-hidden bg-background border border-border hover:border-primary/30 transition-all h-full"
                    itemScope
                    itemType="https://schema.org/MedicalClinic"
                    itemProp="itemListElement"
                    title={`${facility.name} – ${facility.type} in ${facility.location}`}
                  >
                    {children}
                  </Link>
                ) : (
                  <a
                    href={facility.url}
                    target="_blank"
                    rel="dofollow"
                    className="group block rounded-2xl overflow-hidden bg-background border border-border hover:border-primary/30 transition-all h-full"
                    itemScope
                    itemType="https://schema.org/MedicalClinic"
                    itemProp="itemListElement"
                    title={`${facility.name} – ${facility.type} in ${facility.location}`}
                  >
                    {children}
                  </a>
                );

              return (
                <ScrollReveal key={facility.name} delay={index * 0.1}>
                  <motion.div whileHover={{ y: -6 }}>
                    <CardWrapper>
                      <meta itemProp="url" content={facility.url.startsWith('/') ? `https://getfocushealth.com${facility.url}` : facility.url} />
                      <meta itemProp="name" content={facility.name} />
                      {facility.address && (
                        <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress" className="hidden">
                          <meta itemProp="streetAddress" content={facility.address} />
                        </span>
                      )}

                      <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                        {'images' in facility && facility.images ? (
                          <AutoCarousel images={facility.images} alt={`${facility.name} – ${facility.type} in ${facility.location}`} />
                        ) : 'image' in facility && facility.image ? (
                          <img
                            src={facility.image}
                            alt={`${facility.name} – ${facility.type} in ${facility.location}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            itemProp="image"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building size={48} className="text-primary/30" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground">
                          {facility.type}
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-heading font-bold text-lg" itemProp="name">{facility.name}</h3>
                          {isInternal ? (
                            <span className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
                              <ExternalLink size={16} />
                            </span>
                          ) : (
                            <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-primary/70 font-medium mb-2">{facility.location}</p>
                        <p className="text-muted-foreground text-sm leading-relaxed" itemProp="description">{facility.description}</p>
                      </div>
                    </CardWrapper>
                  </motion.div>
                </ScrollReveal>
              );
            })}
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
    </>
);
};

export default OurProcessPage;
