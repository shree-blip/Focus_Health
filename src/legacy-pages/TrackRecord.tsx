"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Clock, Shield, TrendingUp, Stethoscope, Heart, ArrowRight, Users, MapPin } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { PageHero } from '@/components/ui/PageHero';
import { Button } from '@/components/ui/button';
const heroTrackRecord = "/hero-track-record.jpg";
const facilityErIrving = "/facility-er-irving-real.webp";
const facilityErLufkin = "/facility-er-lufkin-real.webp";
const facilityErWhiterock = "/facility-er-whiterock.webp";
const facilityFirstChoiceEr = "/IMG_9540.jpg";
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
    address: '8200 N MacArthur Blvd Suite 110, Irving, TX 75063',
    internal: true,
  },
  {
    name: 'ER of Lufkin',
    type: 'Freestanding Emergency Room',
    location: 'Lufkin, TX',
    description: 'ER of Lufkin is a 24/7 freestanding emergency room in Lufkin, Texas staffed by board-certified ER physicians with on-site imaging, in-house pharmacy, and comprehensive lab testing. Serving Angelina County, Nacogdoches, and East Texas with full-service emergency care for all ages.',
    url: '/facilities/er-of-lufkin',
    image: facilityErLufkin,
    address: '501 N Brentwood Dr, Lufkin, TX 75904',
    internal: true,
  },
  {
    name: 'ER of White Rock',
    type: 'Freestanding Emergency Room',
    location: 'Dallas, TX',
    description: 'ER of White Rock is a 24/7 freestanding emergency room in Dallas, Texas with board-certified emergency physicians and trauma-trained nurses. Advanced on-site CT, X-ray, and lab services with minimal wait times near White Rock Lake, Lakewood, and East Dallas.',
    url: '/facilities/er-of-white-rock',
    image: facilityErWhiterock,
    address: '10705 Northwest Hwy, Dallas, TX 75238',
    internal: true,
  },
  {
    name: 'First Choice Emergency Room',
    type: 'Freestanding Emergency Room',
    location: 'Houston, TX',
    description: 'First Choice Emergency Room is a Houston emergency facility profile located at 1717 Eldridge Pkwy, Houston, TX 77077, USA. This location is highlighted as open for investment within the Focus Health track record.',
    badge: 'Open For Investment',
    url: '/track-record/first-choice-emergency-room',
    image: facilityFirstChoiceEr,
    address: '1717 Eldridge Pkwy, Houston, TX 77077, USA',
    internal: true,
  },
  {
    name: 'Irving Health & Wellness Clinic',
    type: 'Health & Wellness Clinic',
    location: 'Irving, TX',
    description: 'Irving Health & Wellness Clinic is a premier wellness center in Irving, Texas offering medical expert supervised medical weight loss, hormone replacement therapy, aesthetic services, IV hydration therapy, and advanced body contouring. Serving Las Colinas, Valley Ranch, and DFW metroplex.',
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
    <>
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
                    href={facility.url}
                    className="group flex h-full flex-col rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all hover:shadow-xl"
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
                    className="group flex h-full flex-col rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all hover:shadow-xl"
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
                  <motion.div whileHover={{ y: -6, scale: 1.02 }} className="h-full">
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
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/hero-track-record.jpg';
                            }}
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
                        {'badge' in facility && facility.badge && (
                          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wide">
                            {facility.badge}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <h3 className="font-heading font-bold text-lg" itemProp="name">{facility.name}</h3>
                          <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </div>
                        <div className="flex items-start gap-2 text-xs text-primary/80 font-medium mb-2">
                          <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                          <span>{facility.location}</span>
                        </div>
                        <p className="flex-1 text-muted-foreground text-sm leading-relaxed" itemProp="description">{facility.description}</p>
                        <span className="inline-block mt-4 text-sm font-medium text-primary group-hover:underline">
                          View Details →
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

      {/* Next Steps / Partnership CTA */}
      <section className="section-padding bg-primary/5 border-t border-primary/10">
        <div className="container-focus">
          <ScrollReveal>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Proven Development</h3>
                      <p className="text-sm text-muted-foreground">Learn how we build, fund, and operate facilities</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Investment Opportunities</h3>
                      <p className="text-sm text-muted-foreground">Explore partnership and ownership options</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Meet Our Team</h3>
                      <p className="text-sm text-muted-foreground">Learn about the operators behind our success</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
                  Ready to Partner?
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Our track record speaks for itself. Partner with us to build healthcare infrastructure and generate strong returns through our proven platform and experienced team.
                </p>
                <div className="flex gap-4 flex-wrap">
                  <Button variant="hero" size="lg" asChild>
                    <Link href="/partners" className="flex items-center">
                      Explore Partnership
                      <ArrowRight size={18} className="ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/leadership">
                      Meet Our Team
                    </Link>
                  </Button>
                </div>
              </div>
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

export default TrackRecordPage;
