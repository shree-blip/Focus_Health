"use client";

import { PageHero } from '@/components/ui/PageHero';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Clock, Shield, Stethoscope, Heart, Activity, Baby,
  Bone, Brain, Droplets, Thermometer, Syringe, Scan,
  Users, MapPin, Phone, ArrowRight, CheckCircle2, Building2,
  HeartPulse, Pill, Microscope, Zap, ExternalLink
} from 'lucide-react';
const facilityImage = "/facility-er-lufkin-real.webp";
const lufkinGrandOpeningEmbedUrl = "https://player.vimeo.com/video/1178939041?h=47ffc8be30";

const BASE_URL = 'https://getfocushealth.com';

const emergencyServices = [
  {
    icon: HeartPulse,
    title: 'Cardiac Emergency Care',
    description: 'Immediate evaluation and stabilization of chest pain, heart attacks, arrhythmias, and other cardiovascular emergencies with on-site EKG monitoring and cardiac enzyme testing.',
    keywords: ['chest pain treatment Lufkin', 'heart attack emergency East Texas', 'cardiac care Angelina County'],
  },
  {
    icon: Brain,
    title: 'Neurological Emergencies',
    description: 'Rapid assessment of stroke symptoms, seizures, severe headaches, and traumatic brain injuries. Time-critical stroke protocols with advanced CT imaging for fast diagnosis.',
    keywords: ['stroke treatment Lufkin TX', 'neurological emergency care', 'seizure treatment East Texas'],
  },
  {
    icon: Bone,
    title: 'Orthopedic & Trauma Care',
    description: 'Treatment for fractures, dislocations, sprains, and musculoskeletal injuries. On-site X-ray and splinting with referral coordination for surgical cases.',
    keywords: ['broken bone treatment Lufkin', 'fracture care East Texas', 'orthopedic emergency Angelina County'],
  },
  {
    icon: Baby,
    title: 'Pediatric Emergency Care',
    description: 'Child-friendly emergency treatment for infants, children, and adolescents. Board-certified physicians experienced in pediatric emergencies including fevers, respiratory distress, and injuries.',
    keywords: ['pediatric ER Lufkin', 'children emergency room East Texas', 'kids urgent care Angelina County'],
  },
  {
    icon: Droplets,
    title: 'Wound Care & Laceration Repair',
    description: 'Expert wound management including deep lacerations, animal bites, burns, and abscess drainage. Suturing, wound closure, and infection prevention with follow-up guidance.',
    keywords: ['laceration repair Lufkin TX', 'wound care East Texas', 'stitches emergency room'],
  },
  {
    icon: Thermometer,
    title: 'Infectious Disease & Fever Management',
    description: 'Diagnosis and treatment of acute infections, high fevers, flu, pneumonia, UTIs, and sepsis. Rapid lab testing with IV antibiotics and fluid therapy when needed.',
    keywords: ['fever treatment Lufkin', 'infection emergency care East Texas', 'flu treatment Angelina County'],
  },
];

const diagnosticServices = [
  {
    icon: Scan,
    title: 'On-Site CT Scan',
    description: 'High-resolution computed tomography for rapid diagnosis of internal injuries, stroke, pulmonary embolism, appendicitis, and other critical conditions.',
  },
  {
    icon: Activity,
    title: 'Digital X-Ray',
    description: 'Immediate digital radiography for fractures, chest conditions, foreign bodies, and skeletal imaging with results available in minutes.',
  },
  {
    icon: Microscope,
    title: 'In-House Laboratory',
    description: 'Comprehensive on-site lab testing including CBC, metabolic panels, troponin, D-dimer, urinalysis, blood cultures, and rapid flu/COVID/strep testing.',
  },
  {
    icon: Syringe,
    title: 'IV Therapy & Medication',
    description: 'In-house pharmacy capabilities for IV fluid resuscitation, pain management, antibiotics, anti-nausea medications, and emergency drug administration.',
  },
  {
    icon: HeartPulse,
    title: 'Cardiac Monitoring',
    description: 'Continuous EKG monitoring, cardiac enzyme testing, and rhythm analysis for chest pain evaluation and cardiac emergency management.',
  },
  {
    icon: Zap,
    title: 'Ultrasound Imaging',
    description: 'Point-of-care ultrasound for abdominal pain evaluation, gallbladder assessment, pregnancy-related concerns, and vascular emergencies.',
  },
];

const communityBenefits = [
  {
    title: 'Reducing ER Wait Times in East Texas',
    description: 'Traditional hospital emergency departments in rural East Texas often have wait times exceeding 2–4 hours. ER of Lufkin provides a dedicated freestanding alternative where patients are seen by a board-certified physician within minutes, not hours.',
  },
  {
    title: 'Serving Underserved Rural Communities',
    description: 'Angelina County and surrounding areas like Nacogdoches, Livingston, Jasper, and Crockett face significant healthcare access gaps. ER of Lufkin bridges this gap by providing hospital-level emergency care closer to home for thousands of East Texas residents.',
  },
  {
    title: 'Economic Contribution to Lufkin',
    description: 'ER of Lufkin creates local healthcare jobs for physicians, nurses, technicians, and administrative staff. The facility contributes to the local economy while raising the standard of accessible emergency medicine in the region.',
  },
  {
    title: '24/7 Availability for All Ages',
    description: "Whether it's a child's high fever at 2 AM or a senior's chest pain on a holiday, ER of Lufkin is open 24 hours a day, 7 days a week, 365 days a year — including weekends and holidays — ensuring the community always has a place to turn.",
  },
];

const nearbyAreas = [
  'Nacogdoches', 'Livingston', 'Jasper', 'Crockett', 'Center',
  'San Augustine', 'Diboll', 'Hudson', 'Huntington', 'Zavalla',
  'Corrigan', 'Woodville', 'Angelina County', 'Nacogdoches County',
];

const faqs = [
  {
    q: 'What is a freestanding emergency room?',
    a: 'A freestanding emergency room (FSER) is a fully licensed emergency department that operates independently from a hospital. ER of Lufkin offers the same level of care as a hospital ER — including board-certified emergency physicians, CT scans, X-rays, labs, and IV medications — but with significantly shorter wait times and a more comfortable patient experience.',
  },
  {
    q: 'Does ER of Lufkin accept insurance?',
    a: 'Yes, ER of Lufkin accepts most major insurance plans including Medicare, Medicaid, Blue Cross Blue Shield, Aetna, Cigna, UnitedHealthcare, and many others. Self-pay options are also available with transparent pricing.',
  },
  {
    q: 'What are the wait times at ER of Lufkin?',
    a: 'Patients at ER of Lufkin are typically seen by a board-certified emergency physician within minutes of arrival. Unlike crowded hospital ERs, our freestanding model is designed for rapid triage and treatment.',
  },
  {
    q: 'Can ER of Lufkin treat children?',
    a: 'Yes, ER of Lufkin provides emergency care for patients of all ages, including infants, children, and adolescents. Our physicians are experienced in pediatric emergency medicine and equipped to handle childhood emergencies.',
  },
  {
    q: 'What should I do in a life-threatening emergency?',
    a: 'Call 911 immediately for life-threatening emergencies such as difficulty breathing, chest pain, severe bleeding, or loss of consciousness. For emergencies that require urgent but non-life-threatening care, you can come directly to ER of Lufkin at 501 N Brentwood Dr, Lufkin, TX 75904.',
  },
];

const erOfLufkinSchema = {
  "@context": "https://schema.org",
  "@type": "EmergencyService",
  "name": "ER of Lufkin",
  "alternateName": "ER of Lufkin – Freestanding Emergency Room",
  "description": "ER of Lufkin is a 24/7 freestanding emergency room in Lufkin, Texas providing board-certified emergency physicians, on-site CT scan, X-ray, ultrasound, in-house laboratory, and comprehensive emergency care for all ages. Serving Angelina County, Nacogdoches, and East Texas.",
  "url": "https://getfocushealth.com/facilities/er-of-lufkin",
  "telephone": "+1-936-000-0000",
  "image": `${BASE_URL}/assets/facility-er-lufkin-real.webp`,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "501 N Brentwood Dr",
    "addressLocality": "Lufkin",
    "addressRegion": "TX",
    "postalCode": "75904",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "31.3368",
    "longitude": "-94.7218"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "00:00",
    "closes": "23:59"
  },
  "medicalSpecialty": "Emergency Medicine",
  "availableService": [
    { "@type": "MedicalProcedure", "name": "Cardiac Emergency Care" },
    { "@type": "MedicalProcedure", "name": "Neurological Emergency Care" },
    { "@type": "MedicalProcedure", "name": "Pediatric Emergency Care" },
    { "@type": "MedicalProcedure", "name": "Orthopedic & Trauma Care" },
    { "@type": "MedicalProcedure", "name": "Wound Care & Laceration Repair" },
    { "@type": "MedicalProcedure", "name": "CT Scan" },
    { "@type": "MedicalProcedure", "name": "X-Ray" },
    { "@type": "MedicalProcedure", "name": "Ultrasound" },
    { "@type": "MedicalProcedure", "name": "Laboratory Testing" },
    { "@type": "MedicalProcedure", "name": "IV Therapy" },
  ],
  "areaServed": nearbyAreas.map(area => ({ "@type": "City", "name": area })),
  "parentOrganization": {
    "@type": "Organization",
    "name": "Focus Health",
    "url": "https://getfocushealth.com"
  },
  "isPartOf": {
    "@type": "WebSite",
    "name": "Focus Health",
    "url": "https://getfocushealth.com"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a
    }
  }))
};

const GrandOpeningEmbedCard = ({
  src,
  title,
}: {
  src: string;
  title: string;
}) => {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-semibold text-center text-foreground/80 tracking-wide">{title}</h3>
      <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg aspect-video bg-muted">
        <iframe
          title={title}
          src={src}
          loading="lazy"
          frameBorder={0}
          referrerPolicy="strict-origin-when-cross-origin"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </div>
  );
};

const GrandOpeningSection = () => (
  <section className="w-full bg-background py-10 md:py-14">
    <div className="container-focus">
      <div className="text-center mb-8">
        <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest mb-3">
          Now Open
        </span>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
          Grand Opening
        </h2>
      </div>

      <div className="max-w-4xl mx-auto">
        <GrandOpeningEmbedCard
          src={lufkinGrandOpeningEmbedUrl}
          title="ER of Lufkin — Grand Opening"
        />
      </div>
    </div>
  </section>
);

const ERofLufkin = () => {
  return (
    <>
{/* Hero */}
      <PageHero
        title="ER of Lufkin"
        description="24/7 freestanding emergency room in Lufkin, Texas — board-certified physicians, on-site imaging, and minimal wait times serving Angelina County and East Texas."
        backgroundImage={facilityImage}
        primaryCta={{ text: "View All Facilities", link: "/track-record" }}
        secondaryCta={{ text: "Contact Us", link: "/contact" }}
      />

      <GrandOpeningSection />

      {/* Intro / Overview */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Focus Health Facility</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6">
                  Full-Service Emergency Care in <span className="text-primary">Lufkin, Texas</span>
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong>ER of Lufkin</strong> is a state-of-the-art <strong>freestanding emergency room</strong> located at <strong>501 N Brentwood Dr, Lufkin, TX 75904</strong>. Open <strong>24 hours a day, 7 days a week</strong>, we provide hospital-level emergency care with the speed and personal attention of a dedicated facility.
                  </p>
                  <p>
                    Our team of <strong>board-certified emergency physicians</strong> and trauma-trained nursing staff delivers comprehensive emergency medical services for patients of all ages — from infants to seniors. With <strong>on-site CT scan, digital X-ray, ultrasound, in-house laboratory, and pharmacy capabilities</strong>, we diagnose and treat emergencies without the long wait times of traditional hospital ERs.
                  </p>
                  <p>
                    Proudly serving <strong>Lufkin, Angelina County, Nacogdoches, Livingston, Jasper, Crockett</strong>, and communities throughout <strong>East Texas</strong>, ER of Lufkin is operated by <Link href="/" className="text-primary hover:underline font-medium">Focus Health</Link> — a healthcare infrastructure company with a proven track record of building and managing high-performance emergency facilities.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-6">
                  <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">24/7 Open</span>
                  <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">Board-Certified Physicians</span>
                  <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">All Ages Welcome</span>
                  <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">On-Site Imaging</span>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
                <img
                  src={facilityImage}
                  alt="ER of Lufkin – Freestanding Emergency Room in Lufkin, Texas"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                <div className="p-4 bg-background flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span>501 N Brentwood Dr, Lufkin, TX 75904</span>
                    <a
                      href="https://maps.app.goo.gl/FZBc8KhuMQmekbWYA"
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

      {/* Emergency Services */}
      <section className="section-padding bg-background" id="services">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Emergency Services</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Comprehensive Emergency Medical Services
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                ER of Lufkin treats a wide range of medical emergencies with the same capabilities as a hospital emergency department — faster, closer, and with personalized attention.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergencyServices.map((service, index) => (
              <ScrollReveal key={service.title} delay={index * 0.08}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all h-full"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <service.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Diagnostic & Support Services */}
      <section className="section-padding bg-card" id="diagnostics">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">On-Site Capabilities</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Advanced Diagnostic & Imaging Services
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Every diagnostic tool you'd find in a hospital ER — available on-site at ER of Lufkin for rapid, accurate diagnosis and treatment.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagnosticServices.map((service, index) => (
              <ScrollReveal key={service.title} delay={index * 0.08}>
                <div className="flex gap-4 p-6 rounded-2xl bg-background border border-border">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <service.icon size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold mb-1">{service.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Community Impact */}
      <section className="section-padding bg-background" id="community">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Community Impact</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Why Lufkin Needs ER of Lufkin
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                East Texas communities deserve fast, high-quality emergency care without driving hours to reach a hospital. ER of Lufkin fills a critical healthcare gap.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {communityBenefits.map((benefit, index) => (
              <ScrollReveal key={benefit.title} delay={index * 0.1}>
                <div className="flex gap-4">
                  <CheckCircle2 size={24} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Areas Served */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Service Area</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Serving Lufkin & Surrounding East Texas Communities
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                ER of Lufkin proudly provides 24/7 emergency care to residents throughout Angelina County and the greater East Texas region.
              </p>
            </div>
          </ScrollReveal>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {nearbyAreas.map((area, index) => (
              <ScrollReveal key={area} delay={index * 0.03}>
                <span className="px-4 py-2 rounded-full bg-background border border-border text-sm font-medium text-foreground hover:border-primary/30 transition-colors">
                  <MapPin size={14} className="inline mr-1.5 text-primary" />
                  {area}
                </span>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-background" id="faq">
        <div className="container-focus max-w-4xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">FAQ</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Frequently Asked Questions
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <ScrollReveal key={index} delay={index * 0.08}>
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <h3 className="font-heading font-bold text-lg mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Linking / CTA */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
                Explore More Focus Health Facilities
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                ER of Lufkin is part of the Focus Health portfolio of healthcare facilities across Texas and Illinois.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { name: 'ER of Irving', path: '/facilities/er-of-irving', location: 'Irving, TX' },
              { name: 'ER of White Rock', path: '/facilities/er-of-white-rock', location: 'Dallas, TX' },
              { name: 'Irving Wellness Clinic', path: '/facilities/irving-wellness-clinic', location: 'Irving, TX' },
              { name: 'Naperville Wellness', path: '/facilities/naperville-wellness-clinic', location: 'Naperville, IL' },
            ].map((facility, index) => (
              <ScrollReveal key={facility.name} delay={index * 0.1}>
                <Link
                  href={facility.path}
                  className="block p-5 rounded-xl bg-background border border-border hover:border-primary/30 transition-all group"
                >
                  <Building2 size={20} className="text-primary mb-2" />
                  <h3 className="font-heading font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{facility.name}</h3>
                  <p className="text-muted-foreground text-xs">{facility.location}</p>
                  <span className="inline-flex items-center gap-1 mt-2 text-xs text-primary font-medium">
                    Learn More <ArrowRight size={12} />
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-12">
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
              Focus Health Home <ArrowRight size={16} />
            </Link>
            <Link href="/platform" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors">
              Our Platform
            </Link>
            <Link href="/investors" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors">
              Investment Opportunities
            </Link>
            <Link href="/track-record" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors">
              View Full Portfolio
            </Link>
            <Link href="/our-process" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors">
              Our Process
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors">
              Contact Us
            </Link>
            <a href="https://eroflufkin.com" target="_blank" rel="dofollow" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-primary/30 text-primary font-medium hover:bg-primary/5 transition-colors">
              Visit ER of Lufkin Website <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </>
);
};

export default ERofLufkin;
