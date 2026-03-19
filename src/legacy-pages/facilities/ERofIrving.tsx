"use client";

import { PageHero } from '@/components/ui/PageHero';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Clock, Shield, Stethoscope, Heart, Activity, Baby,
  Bone, Brain, Droplets, Thermometer, Syringe, Scan,
  Users, MapPin, Phone, ArrowRight, CheckCircle2, Building2,
  HeartPulse, Pill, Microscope, Zap
} from 'lucide-react';
const facilityImage = "/facility-er-irving-real.webp";

const BASE_URL = 'https://getfocushealth.com';

const emergencyServices = [
  {
    icon: HeartPulse,
    title: 'Cardiac Emergency Care',
    description: 'Immediate evaluation and stabilization of chest pain, heart attacks, arrhythmias, and cardiovascular emergencies with on-site EKG monitoring and cardiac enzyme testing in Irving, TX.',
    keywords: ['chest pain treatment Irving', 'heart attack emergency DFW', 'cardiac care Dallas-Fort Worth'],
  },
  {
    icon: Brain,
    title: 'Neurological Emergencies',
    description: 'Rapid assessment of stroke symptoms, seizures, severe headaches, and traumatic brain injuries. Time-critical stroke protocols with advanced CT imaging for fast diagnosis near Las Colinas.',
    keywords: ['stroke treatment Irving TX', 'neurological emergency care DFW', 'seizure treatment Dallas'],
  },
  {
    icon: Bone,
    title: 'Orthopedic & Trauma Care',
    description: 'Treatment for fractures, dislocations, sprains, and musculoskeletal injuries. On-site X-ray and splinting with referral coordination for surgical cases in the Irving area.',
    keywords: ['broken bone treatment Irving', 'fracture care DFW', 'orthopedic emergency Dallas-Fort Worth'],
  },
  {
    icon: Baby,
    title: 'Pediatric Emergency Care',
    description: 'Child-friendly emergency treatment for infants, children, and adolescents. Board-certified physicians experienced in pediatric emergencies including fevers, respiratory distress, and injuries.',
    keywords: ['pediatric ER Irving', 'children emergency room DFW', 'kids urgent care Las Colinas'],
  },
  {
    icon: Droplets,
    title: 'Wound Care & Laceration Repair',
    description: 'Expert wound management including deep lacerations, animal bites, burns, and abscess drainage. Suturing, wound closure, and infection prevention with follow-up guidance.',
    keywords: ['laceration repair Irving TX', 'wound care DFW', 'stitches emergency room Irving'],
  },
  {
    icon: Thermometer,
    title: 'Infectious Disease & Fever Management',
    description: 'Diagnosis and treatment of acute infections, high fevers, flu, pneumonia, UTIs, and sepsis. Rapid lab testing with IV antibiotics and fluid therapy when needed.',
    keywords: ['fever treatment Irving', 'infection emergency care DFW', 'flu treatment Dallas-Fort Worth'],
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
    title: 'Reducing ER Wait Times in DFW',
    description: 'Traditional hospital emergency departments in the Dallas-Fort Worth metroplex often have wait times exceeding 3–5 hours. ER of Irving provides a dedicated freestanding alternative where patients are seen by a board-certified physician within minutes, not hours.',
  },
  {
    title: 'Serving Irving & Surrounding Communities',
    description: 'Irving, Las Colinas, Valley Ranch, Coppell, and the greater DFW area benefit from a conveniently located 24/7 emergency facility. ER of Irving bridges the gap between overcrowded hospital ERs and limited urgent care centers.',
  },
  {
    title: 'Economic Contribution to Irving',
    description: 'ER of Irving creates local healthcare jobs for physicians, nurses, technicians, and administrative staff. The facility contributes to the local economy while raising the standard of accessible emergency medicine in the region.',
  },
  {
    title: '24/7 Availability for All Ages',
    description: "Whether it's a child's high fever at 2 AM or a senior's chest pain on a holiday, ER of Irving is open 24 hours a day, 7 days a week, 365 days a year — including weekends and holidays — ensuring the community always has a place to turn.",
  },
];

const nearbyAreas = [
  'Las Colinas', 'Valley Ranch', 'Coppell', 'Grapevine', 'Euless',
  'Bedford', 'Hurst', 'Grand Prairie', 'Arlington', 'Farmers Branch',
  'Carrollton', 'Addison', 'Dallas', 'Fort Worth',
];

const faqs = [
  {
    q: 'What is a freestanding emergency room?',
    a: 'A freestanding emergency room (FSER) is a fully licensed emergency department that operates independently from a hospital. ER of Irving offers the same level of care as a hospital ER — including board-certified emergency physicians, CT scans, X-rays, labs, and IV medications — but with significantly shorter wait times and a more comfortable patient experience.',
  },
  {
    q: 'Does ER of Irving accept insurance?',
    a: 'Yes, ER of Irving accepts most major insurance plans including Medicare, Medicaid, Blue Cross Blue Shield, Aetna, Cigna, UnitedHealthcare, and many others. Self-pay options are also available with transparent pricing.',
  },
  {
    q: 'What are the wait times at ER of Irving?',
    a: 'Patients at ER of Irving are typically seen by a board-certified emergency physician within minutes of arrival. Unlike crowded hospital ERs, our freestanding model is designed for rapid triage and treatment.',
  },
  {
    q: 'Can ER of Irving treat children?',
    a: 'Yes, ER of Irving provides emergency care for patients of all ages, including infants, children, and adolescents. Our physicians are experienced in pediatric emergency medicine and equipped to handle childhood emergencies.',
  },
  {
    q: 'Where is ER of Irving located?',
    a: 'ER of Irving is located at 7600 N MacArthur Blvd, Irving, TX 75063 — conveniently accessible from Las Colinas, Valley Ranch, Coppell, and the greater Dallas-Fort Worth area. We are open 24/7/365.',
  },
];

const erOfIrvingSchema = {
  "@context": "https://schema.org",
  "@type": "EmergencyService",
  "name": "ER of Irving",
  "alternateName": "ER of Irving – Freestanding Emergency Room",
  "description": "ER of Irving is a 24/7 freestanding emergency room in Irving, Texas providing board-certified emergency physicians, on-site CT scan, X-ray, ultrasound, in-house laboratory, and comprehensive emergency care for all ages. Serving Las Colinas, Valley Ranch, Coppell, and greater Dallas-Fort Worth.",
  "url": `${BASE_URL}/facilities/er-of-irving`,
  "telephone": "+1-972-000-0000",
  "image": `${BASE_URL}/assets/facility-er-irving-real.webp`,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "7600 N MacArthur Blvd",
    "addressLocality": "Irving",
    "addressRegion": "TX",
    "postalCode": "75063",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "32.9137",
    "longitude": "-96.9584"
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
    "url": BASE_URL
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

const ERofIrving = () => {
  return (
    <>
{/* Hero */}
      <PageHero
        title="ER of Irving"
        description="24/7 freestanding emergency room in Irving, Texas — board-certified physicians, on-site imaging, and minimal wait times serving Las Colinas, Valley Ranch & DFW."
        backgroundImage={facilityImage}
        primaryCta={{ text: "View All Facilities", link: "/track-record" }}
        secondaryCta={{ text: "Contact Us", link: "/contact" }}
      />

      {/* Intro / Overview */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Focus Health Facility</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6">
                  Full-Service Emergency Care in <span className="text-primary">Irving, Texas</span>
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong>ER of Irving</strong> is a state-of-the-art <strong>freestanding emergency room</strong> located at <strong>7600 N MacArthur Blvd, Irving, TX 75063</strong>. Open <strong>24 hours a day, 7 days a week</strong>, we provide hospital-level emergency care with the speed and personal attention of a dedicated facility.
                  </p>
                  <p>
                    Our team of <strong>board-certified emergency physicians</strong> and trauma-trained nursing staff delivers comprehensive emergency medical services for patients of all ages — from infants to seniors. With <strong>on-site CT scan, digital X-ray, ultrasound, in-house laboratory, and pharmacy capabilities</strong>, we diagnose and treat emergencies without the long wait times of traditional hospital ERs.
                  </p>
                  <p>
                    Proudly serving <strong>Irving, Las Colinas, Valley Ranch, Coppell, Grapevine</strong>, and communities throughout the <strong>Dallas-Fort Worth metroplex</strong>, ER of Irving is operated by <Link href="/" className="text-primary hover:underline font-medium">Focus Health</Link> — a healthcare infrastructure company with a proven track record of building and managing high-performance emergency facilities.
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
                  alt="ER of Irving – Freestanding Emergency Room in Irving, Texas"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                <div className="p-4 bg-background flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin size={16} className="text-primary flex-shrink-0" />
                  <span>7600 N MacArthur Blvd, Irving, TX 75063</span>
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
                ER of Irving treats a wide range of medical emergencies with the same capabilities as a hospital emergency department — faster, closer, and with personalized attention.
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
                Every diagnostic tool you'd find in a hospital ER — available on-site at ER of Irving for rapid, accurate diagnosis and treatment.
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
                Why Irving Needs ER of Irving
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                The Dallas-Fort Worth metroplex deserves fast, high-quality emergency care without overcrowded hospital waiting rooms. ER of Irving fills a critical healthcare gap.
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
                Serving Irving & the Greater DFW Metroplex
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                ER of Irving proudly provides 24/7 emergency care to residents throughout Irving, Las Colinas, Valley Ranch, and the Dallas-Fort Worth area.
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
                ER of Irving is part of the Focus Health portfolio of healthcare facilities across Texas and Illinois.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { name: 'ER of Lufkin', path: '/facilities/er-of-lufkin', location: 'Lufkin, TX' },
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
            <a href="https://erofirving.com" target="_blank" rel="dofollow" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-primary/30 text-primary font-medium hover:bg-primary/5 transition-colors">
              Visit ER of Irving Website <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </>
);
};

export default ERofIrving;
