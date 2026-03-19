import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion } from 'framer-motion';
import { Building2, Clock, Shield, TrendingUp, ExternalLink, Stethoscope, Heart, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { PageHero } from '@/components/ui/PageHero';
import heroTrackRecord from '@/assets/hero-track-record.jpg';
import facilityErIrving from '@/assets/facility-er-irving-real.webp';
import facilityErLufkin from '@/assets/facility-er-lufkin-real.png';
import facilityErWhiterock from '@/assets/facility-er-whiterock.png';
import irvingWellness1 from '@/assets/irving-wellness-1.jpg';
import irvingWellness2 from '@/assets/irving-wellness-2.jpg';
import irvingWellness3 from '@/assets/irving-wellness-3.jpg';
import napervilleWellness1 from '@/assets/naperville-wellness-1.jpg';
import napervilleWellness2 from '@/assets/naperville-wellness-2.jpg';
import napervilleWellness3 from '@/assets/naperville-wellness-3.jpg';
import napervilleWellness4 from '@/assets/naperville-wellness-4.jpg';

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
            onClick={(e) => { e.preventDefault(); setCurrent(i); }}
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
    description: 'ER of Irving is a 24/7 freestanding emergency room in Irving, Texas providing board-certified emergency physicians, on-site CT scan, X-ray, ultrasound, and full laboratory services. Offering pediatric and adult emergency care with minimal wait times near Las Colinas, Valley Ranch, and greater Dallas-Fort Worth.',
    url: '/facilities/er-of-irving',
    image: facilityErIrving,
    address: '7600 N MacArthur Blvd, Irving, TX 75063',
    internal: true,
  },
  {
    name: 'ER of Lufkin',
    type: 'Freestanding Emergency Room',
    location: 'Lufkin, TX',
    description: 'ER of Lufkin is a 24/7 freestanding emergency room in Lufkin, Texas staffed by board-certified ER physicians with on-site imaging, in-house pharmacy, and comprehensive lab testing. Serving Angelina County, Nacogdoches, and East Texas with full-service emergency care for all ages.',
    url: '/facilities/er-of-lufkin',
    image: facilityErLufkin,
    address: '4633 S Medford Dr, Lufkin, TX 75901',
    internal: true,
  },
  {
    name: 'ER of White Rock',
    type: 'Freestanding Emergency Room',
    location: 'Dallas, TX',
    description: 'ER of White Rock is a 24/7 freestanding emergency room in Dallas, Texas with board-certified emergency physicians and trauma-trained nurses. Advanced on-site CT, X-ray, and lab services with minimal wait times near White Rock Lake, Lakewood, and East Dallas.',
    url: '/facilities/er-of-white-rock',
    image: facilityErWhiterock,
    address: '9150 Garland Rd, Dallas, TX 75218',
    internal: true,
  },
  {
    name: 'Irving Health & Wellness Clinic',
    type: 'Health & Wellness Clinic',
    location: 'Irving, TX',
    description: 'Irving Health & Wellness Clinic is a premier wellness center in Irving, Texas offering physician-supervised medical weight loss, hormone replacement therapy, aesthetic services, IV hydration therapy, and advanced body contouring. Serving Las Colinas, Valley Ranch, and DFW metroplex.',
    url: '/facilities/irving-wellness-clinic',
    images: [irvingWellness1, irvingWellness2, irvingWellness3],
    address: 'Irving, TX',
    internal: true,
  },
  {
    name: 'Naperville Health & Wellness Clinic',
    type: 'Health & Wellness Clinic',
    location: 'Naperville, IL',
    description: 'Naperville Health & Wellness Clinic is a comprehensive wellness clinic in Naperville, Illinois offering personalized medical weight loss programs, IV hydration therapy, aesthetic treatments, and holistic care solutions. Serving Naperville, Aurora, Wheaton, and the greater Chicago suburbs.',
    url: '/facilities/naperville-wellness-clinic',
    images: [napervilleWellness1, napervilleWellness2, napervilleWellness3, napervilleWellness4],
    address: 'Naperville, IL',
    internal: true,
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
  const trackRecordSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Healthcare Management Portfolio – Focus Health Track Record",
    "description": "Focus Health's proven track record managing 24+ healthcare locations including freestanding emergency rooms in Irving, Lufkin, and Dallas TX, and wellness clinics in Irving TX and Naperville IL.",
    "url": "https://getfocushealth.com/track-record",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Focus Health",
      "url": "https://getfocushealth.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Focus Health",
      "url": "https://getfocushealth.com"
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": healthcarePortfolio.map((facility, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "MedicalClinic",
          "name": facility.name,
          "description": facility.description,
          "url": facility.url,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": facility.location.split(', ')[0],
            "addressRegion": facility.location.split(', ')[1],
            "addressCountry": "US"
          },
          "medicalSpecialty": facility.type.includes('Emergency') ? "Emergency Medicine" : "Preventive Medicine",
          "availableService": {
            "@type": "MedicalProcedure",
            "name": facility.type
          }
        }
      }))
    }
  };

  return (
    <Layout>
      <SEOHead
        title="Track Record | Focus Health – 24+ Healthcare Locations Managed"
        description="Focus Health's proven track record: 24+ healthcare facilities managed including freestanding emergency rooms in Irving, Lufkin & Dallas TX, and wellness clinics in Irving TX & Naperville IL."
        canonicalUrl="/track-record"
        keywords="freestanding emergency room Texas, ER of Irving, ER of Lufkin, ER of White Rock Dallas, Irving Health Wellness Clinic, Naperville Health Wellness Clinic, 24/7 emergency room near me, healthcare management company Texas, emergency room Irving TX, urgent care Lufkin TX, wellness clinic Naperville IL, Focus Health track record"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(trackRecordSchema)}
        </script>
      </Helmet>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" itemScope itemType="https://schema.org/ItemList">
            {healthcarePortfolio.map((facility, index) => {
              const isInternal = 'internal' in facility && facility.internal;
              const CardWrapper = ({ children }: { children: React.ReactNode }) =>
                isInternal ? (
                  <Link
                    to={facility.url}
                    className="group block rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all h-full"
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
                    className="group block rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all h-full"
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

                      {/* Image or Icon Header */}
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
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-heading font-bold text-lg" itemProp="name">{facility.name}</h3>
                          {isInternal ? (
                            <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                          ) : (
                            <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-primary/70 font-medium mb-2">{facility.location}</p>
                        <p className="text-muted-foreground text-sm leading-relaxed" itemProp="description">{facility.description}</p>
                        <span className="inline-block mt-4 text-sm font-medium text-primary group-hover:underline">
                          {isInternal ? `Learn More About ${facility.name}` : `Visit ${facility.name}`} →
                        </span>
                      </div>
                    </CardWrapper>
                  </motion.div>
                </ScrollReveal>
              );
            })}
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
