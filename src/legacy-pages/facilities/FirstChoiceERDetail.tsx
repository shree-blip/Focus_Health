"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Baby,
  Building2,
  Clock,
  HeartPulse,
  MapPin,
  Phone,
  Scan,
  Shield,
  Siren,
  Stethoscope,
  TimerReset,
} from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Button } from '@/components/ui/button';

const services = [
  {
    title: 'Emergency Care',
    description: 'Full-spectrum emergency evaluation and stabilization for acute illness, injury, severe pain, chest discomfort, respiratory symptoms, and other urgent medical needs.',
    icon: Stethoscope,
  },
  {
    title: 'Trauma Services',
    description: 'Rapid assessment and treatment for trauma-related injuries, lacerations, fractures, sprains, and accident-related emergencies requiring immediate intervention.',
    icon: Siren,
  },
  {
    title: 'Imaging & Diagnostics',
    description: 'Advanced diagnostic support including imaging, laboratory workups, and clinical evaluation to support fast decision-making in time-sensitive cases.',
    icon: Scan,
  },
  {
    title: 'Pediatric Emergency Care',
    description: 'Dedicated emergency support for children with acute fevers, infections, injuries, dehydration, and other urgent pediatric conditions.',
    icon: Baby,
  },
];

const highlights = [
  {
    title: '24/7 Availability',
    description: 'Round-the-clock emergency care coverage designed to serve patients at any hour.',
    icon: Clock,
  },
  {
    title: 'Minimal Wait Time',
    description: 'A freestanding emergency-room model built to accelerate triage and reduce patient delays.',
    icon: TimerReset,
  },
  {
    title: 'Advanced Equipment',
    description: 'Modern emergency infrastructure with on-site diagnostics and clinical support capabilities.',
    icon: Shield,
  },
];

const mapUrl =
  'https://www.google.com/maps?q=1717+Eldridge+Pkwy,+Houston,+TX+77077,+USA&output=embed';
const directionsUrl =
  'https://www.google.com/maps/search/?api=1&query=1717+Eldridge+Pkwy,+Houston,+TX+77077,+USA';

export default function FirstChoiceERDetail() {
  return (
    <>
      <PageHero
        title="First Choice Emergency Room"
        description="A Houston emergency-care facility profile within the Focus Health track record, located in the Eldridge Parkway corridor and designed around fast-response, high-acuity emergency service delivery."
        backgroundImage="/hero-track-record.jpg"
        primaryCta={{ text: 'Get Directions', link: directionsUrl }}
        secondaryCta={{ text: 'View Track Record', link: '/track-record' }}
      />

      <section className="section-padding bg-background">
        <div className="container-focus">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <ScrollReveal>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Healthcare Management Portfolio
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <h2 className="text-3xl font-heading font-bold text-foreground sm:text-4xl">
                      First Choice Emergency Room
                    </h2>
                    <div className="mt-3 flex items-start gap-3 text-muted-foreground">
                      <MapPin size={18} className="mt-0.5 flex-shrink-0 text-primary" />
                      <p>1717 Eldridge Pkwy, Houston, TX 77077, USA</p>
                    </div>
                  </div>

                  <p className="text-base leading-8 text-muted-foreground sm:text-lg">
                    First Choice Emergency Room represents a freestanding emergency-care model built around immediate access, high-quality diagnostics, and continuous coverage for urgent patient needs. Located in Houston's Eldridge Parkway corridor, the facility profile aligns with the broader Focus Health approach to modern healthcare operations: fast intake, dependable emergency response, and a high-standard patient experience.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border/70 bg-background p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Category</p>
                      <p className="mt-2 text-base font-semibold text-foreground">Emergency Room / Healthcare Facility</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Service Model</p>
                      <p className="mt-2 text-base font-semibold text-foreground">24/7 Emergency Care Facility</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="space-y-6">
                <div className="overflow-hidden rounded-3xl border border-primary/15 bg-card shadow-sm">
                  <div className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(158,27,50,0.16),_transparent_35%),linear-gradient(135deg,_rgba(13,37,63,1),_rgba(19,60,94,0.96)_45%,_rgba(158,27,50,0.92))] p-6 text-white sm:p-8">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />

                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
                        Emergency Facility Profile
                      </div>

                      <div className="mt-6 flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                          <HeartPulse size={28} />
                        </div>
                        <div>
                          <p className="text-sm font-medium uppercase tracking-[0.16em] text-white/70">Houston Location</p>
                          <h3 className="font-heading text-2xl font-bold">First Choice Emergency Room</h3>
                        </div>
                      </div>

                      <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                          <Clock size={18} className="text-white/90" />
                          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Availability</p>
                          <p className="mt-1 text-sm font-semibold">24/7 Operations</p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                          <Activity size={18} className="text-white/90" />
                          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Care Model</p>
                          <p className="mt-1 text-sm font-semibold">Rapid Emergency Response</p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                          <Building2 size={18} className="text-white/90" />
                          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Facility</p>
                          <p className="mt-1 text-sm font-semibold">Freestanding ER Format</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                  <div className="border-b border-border px-6 py-4">
                    <h3 className="font-heading text-xl font-bold text-foreground">Location Overview</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Mapped reference for the Eldridge Parkway facility address.</p>
                  </div>
                  <div className="aspect-[4/3] w-full bg-muted">
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
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="section-padding bg-card">
        <div className="container-focus">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-heading font-bold text-foreground sm:text-4xl">About The Facility</h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                This facility profile highlights an emergency-care environment oriented around rapid triage, trauma response, diagnostic confidence, and around-the-clock patient access. The care model supports urgent adult and pediatric presentations while emphasizing modern equipment, efficient workflows, and a dependable clinical experience for the surrounding Houston community.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-heading font-bold text-foreground sm:text-4xl">Services</h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Core emergency-service capabilities reflected in this portfolio detail page.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service, index) => (
              <ScrollReveal key={service.title} delay={index * 0.08}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <service.icon size={22} />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-foreground">{service.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">{service.description}</p>
                    </div>
                  </div>
                </motion.div>
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

      <section className="section-padding border-t border-primary/10 bg-primary/5">
        <div className="container-focus">
          <ScrollReveal>
            <div className="rounded-3xl border border-primary/10 bg-card p-8 shadow-sm sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <h2 className="text-3xl font-heading font-bold text-foreground sm:text-4xl">Visit Or Reach Out</h2>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
                    Use the map to get directions to the facility address or connect with the team for questions related to the location and care access.
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
                    <Link href="tel:+18326724010">
                      <Phone size={18} />
                      Contact Now
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