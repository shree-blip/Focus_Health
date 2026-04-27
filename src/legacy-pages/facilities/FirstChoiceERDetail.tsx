"use client";

import Link from 'next/link';
import {
  ArrowRight,
  Baby,
  Clock,
  MapPin,
  Phone,
  Scan,
  HeartPulse,
  Stethoscope,
  Shield,
  Activity,
  ExternalLink,
  Users,
} from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Button } from '@/components/ui/button';

const facilityImage = '/IMG_9540.jpg';

const services = [
  {
    title: '24/7 Emergency Care',
    description: 'Immediate emergency evaluation for chest pain, breathing concerns, severe abdominal pain, high fever, infections, and acute illness for adults and children.',
    icon: Stethoscope,
  },
  {
    title: 'Trauma & Injury Response',
    description: 'Rapid stabilization and treatment for falls, fractures, lacerations, sprains, and accident-related injuries requiring urgent intervention.',
    icon: Activity,
  },
  {
    title: 'Imaging & Diagnostics',
    description: 'On-site imaging and clinical diagnostics support fast emergency decisions and timely care plans for high-acuity presentations.',
    icon: Scan,
  },
  {
    title: 'Pediatric Emergency Care',
    description: 'Emergency support for infants, children, and adolescents with fever, dehydration, respiratory symptoms, and injury-related needs.',
    icon: Baby,
  },
];

const highlights = [
  {
    title: 'Houston Energy Corridor Access',
    description: 'Convenient emergency-room location at 1717 Eldridge Pkwy serving West Houston residents, families, and nearby business communities.',
    icon: MapPin,
  },
  {
    title: 'Under Construction',
    description: 'This facility is currently under construction as part of the Focus Health track record in a high-demand Houston submarket.',
    icon: Clock,
  },
  {
    title: 'Minimal Wait-Time Goal',
    description: 'Built to reduce traditional hospital ER delays with a streamlined triage model focused on minimal and near-zero wait-time targets when clinically possible.',
    icon: Clock,
  },
  {
    title: 'Freestanding ER Model',
    description: 'Designed for immediate triage, fast treatment workflow, and complete emergency-room readiness with modern diagnostic support.',
    icon: Shield,
  },
];

const problemWeSolve = [
  {
    title: 'Long ER Wait Times',
    description: 'Many hospital emergency departments in major metros can involve extended waiting before physician evaluation, especially during peak hours.',
    icon: Clock,
  },
  {
    title: 'Access Gap In High-Growth Areas',
    description: 'Rapidly growing neighborhoods often need closer emergency access without long travel times or large-hospital congestion.',
    icon: MapPin,
  },
  {
    title: 'Need For Faster Triage',
    description: 'The First Choice ER model is structured around immediate intake and fast clinical decisioning to help move patients from arrival to care quickly.',
    icon: HeartPulse,
  },
];

const communityContribution = [
  {
    title: 'Reduced Wait-Time Burden',
    description: 'By targeting minimal and near-zero wait-time operations, this location helps reduce pressure on overloaded hospital ER systems.',
  },
  {
    title: 'Local Healthcare Access',
    description: 'The Eldridge Parkway location improves emergency-care access for residents, families, and workers across West Houston and the Energy Corridor.',
  },
  {
    title: 'Job Creation & Local Impact',
    description: 'Facility development supports local employment for clinicians, nursing professionals, technicians, and support teams as operations scale.',
  },
  {
    title: '24/7 Community Safety Net',
    description: 'Round-the-clock emergency availability strengthens community resilience for nights, weekends, holidays, and urgent after-hours events.',
  },
];

const newsImages = [
  '/IMG_9540.jpg',
  '/IMG_9541.jpg',
  '/IMG_9542.jpg',
  '/IMG_9543.jpg',
  '/IMG_9544.jpg',
  '/IMG_9545.jpg',
  '/IMG_9546.jpg',
];

const mapUrl =
  'https://www.google.com/maps?q=1717+Eldridge+Pkwy,+Houston,+TX+77077,+USA&output=embed';
const directionsUrl =
  'https://www.google.com/maps/search/?api=1&query=1717+Eldridge+Pkwy,+Houston,+TX+77077,+USA';

export default function FirstChoiceERDetail() {
  return (
    <>
      <PageHero
        eyebrow="Under Construction"
        title="First Choice Emergency Room"
        description="Freestanding emergency-room profile in Houston, Texas at 1717 Eldridge Pkwy focused on rapid emergency response, 24/7 access, and high-acuity patient care."
        backgroundImage={facilityImage}
        primaryCta={{ text: 'View All Facilities', link: '/track-record' }}
        secondaryCta={{ text: 'View Track Record', link: '/track-record' }}
      />

      <section className="section-padding bg-card">
        <div className="container-focus">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Focus Health Facility</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6">
                  First Choice Emergency Room in <span className="text-primary">Houston, Texas</span>
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong>First Choice Emergency Room</strong> is a freestanding emergency care facility located at <strong>1717 Eldridge Pkwy, Houston, TX 77077, USA</strong>. The location is positioned for rapid access from the Energy Corridor and surrounding West Houston neighborhoods.
                  </p>
                  <p>
                    This facility profile reflects a <strong>24/7 emergency-care operating model</strong> designed around immediate triage, urgent diagnostics, and high-acuity treatment support.
                  </p>
                  <p>
                    Within the Focus Health portfolio, First Choice Emergency Room is currently <strong>under construction</strong> in a high-demand Houston submarket.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-6">
                  <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">Under Construction</span>
                  <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">24/7 Emergency Access</span>
                  <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">Houston, TX</span>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
                <img
                  src={facilityImage}
                  alt="First Choice Emergency Room at 1717 Eldridge Pkwy, Houston, TX 77077"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                <div className="p-4 bg-background flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span>1717 Eldridge Pkwy, Houston, TX 77077, USA</span>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
                    >
                      Get Directions <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Emergency Services</p>
              <h2 className="text-3xl font-heading font-bold text-foreground sm:text-4xl">Core Emergency-Care Capabilities</h2>
              <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
                Service focus for this Houston emergency-room profile at 1717 Eldridge Pkwy.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service, index) => (
              <ScrollReveal key={service.title} delay={index * 0.08}>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <service.icon size={22} />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-foreground">{service.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">{service.description}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-card">
        <div className="container-focus">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-heading font-bold text-foreground sm:text-4xl">Key Highlights</h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Operational strengths associated with the facility profile.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((highlight, index) => (
              <ScrollReveal key={highlight.title} delay={index * 0.08}>
                <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <highlight.icon size={22} />
                  </div>
                  <h3 className="mt-5 font-heading text-xl font-bold text-foreground">{highlight.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">{highlight.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">The Problem We Solve</p>
              <h2 className="text-3xl font-heading font-bold text-foreground sm:text-4xl">From Long Waits To Faster Emergency Access</h2>
              <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
                This facility model is designed to address one of healthcare&apos;s biggest pain points: long emergency-room wait times.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {problemWeSolve.map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 0.08}>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon size={22} />
                  </div>
                  <h3 className="mt-5 font-heading text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">{item.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-card">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Community Contribution</p>
              <h2 className="text-3xl font-heading font-bold text-foreground sm:text-4xl">How This ER Supports Society</h2>
              <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
                Beyond emergency care delivery, this location contributes to local healthcare access, jobs, and system-wide relief.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-2">
            {communityContribution.map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 0.08}>
                <div className="rounded-2xl border border-border bg-background p-6 shadow-sm h-full">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                      <Users size={18} />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">{item.description}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Facility Progress</p>
              <h2 className="text-3xl font-heading font-bold text-foreground sm:text-4xl">First Choice Emergency Room Construction Images</h2>
              <p className="mt-3 text-lg text-muted-foreground">Current facility photos from the under-construction location at 1717 Eldridge Pkwy, Houston, TX 77077.</p>
            </div>
          </ScrollReveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newsImages.map((image, index) => (
              <ScrollReveal key={image} delay={index * 0.05}>
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <img
                    src={image}
                    alt={`First Choice Emergency Room construction image ${index + 1}`}
                    className="h-64 w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-card">
        <div className="container-focus">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h3 className="font-heading text-xl font-bold text-foreground">Location Map</h3>
              <p className="mt-1 text-sm text-muted-foreground">1717 Eldridge Pkwy, Houston, TX 77077, USA</p>
            </div>
            <div className="aspect-[16/9] w-full bg-muted">
              <iframe
                title="First Choice Emergency Room map"
                src={mapUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding border-t border-primary/10 bg-primary/5">
        <div className="container-focus">
          <ScrollReveal>
            <div className="rounded-3xl border border-primary/10 bg-card p-8 shadow-sm sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <h2 className="text-3xl font-heading font-bold text-foreground sm:text-4xl">Visit This Location</h2>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
                    Get directions to First Choice Emergency Room at 1717 Eldridge Pkwy, Houston, TX 77077, USA and explore this emergency facility within our track record.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                  <Button variant="hero" size="lg" asChild>
                    <Link href={directionsUrl} target="_blank" rel="noreferrer">
                      Get Directions
                      <ArrowRight size={18} />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/contact">
                      <Phone size={18} />
                      Contact Us
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}