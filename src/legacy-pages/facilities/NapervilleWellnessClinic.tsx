"use client";

import { PageHero } from '@/components/ui/PageHero';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MapPin, ArrowRight, CheckCircle2, Building2,
  HeartPulse, Sparkles, Droplets, Scale, Leaf, Syringe,
  Dumbbell, Sun, Smile, FlaskConical, Pill, Activity
} from 'lucide-react';
const facilityImage = "/naperville-wellness-1.jpg";

const BASE_URL = 'https://getfocushealth.com';

const wellnessServices = [
  {
    icon: Scale,
    title: 'Medical Weight Loss',
    description: 'Medical expert supervised weight management programs featuring FDA-approved medications including Semaglutide (Ozempic/Wegovy) and Tirzepatide (Mounjaro), personalized nutrition planning, and ongoing metabolic monitoring in Naperville, IL.',
    keywords: ['medical weight loss Naperville IL', 'Semaglutide Naperville', 'Wegovy Chicago suburbs', 'weight loss clinic DuPage County'],
  },
  {
    icon: HeartPulse,
    title: 'Hormone Replacement Therapy',
    description: 'Comprehensive hormone optimization for men and women including testosterone replacement therapy (TRT), estrogen and progesterone balancing, thyroid optimization, and bioidentical hormone therapy in Naperville.',
    keywords: ['hormone replacement therapy Naperville IL', 'TRT Naperville', 'bioidentical hormones Chicago suburbs', 'HRT DuPage County'],
  },
  {
    icon: Sparkles,
    title: 'Aesthetic Services',
    description: 'Advanced aesthetic treatments including Botox, dermal fillers, PRP facial rejuvenation, microneedling, chemical peels, and skin tightening procedures performed by licensed medical professionals.',
    keywords: ['Botox Naperville IL', 'dermal fillers Aurora', 'aesthetic clinic Chicago suburbs', 'PRP facial Naperville'],
  },
  {
    icon: Droplets,
    title: 'IV Hydration Therapy',
    description: 'Custom IV vitamin infusions for energy boost, immune support, athletic recovery, hangover relief, and anti-aging. Myers cocktail, NAD+, glutathione, and vitamin C drips available.',
    keywords: ['IV hydration Naperville IL', 'vitamin IV therapy Aurora', 'NAD IV drip Chicago suburbs', 'Myers cocktail Naperville'],
  },
  {
    icon: Dumbbell,
    title: 'Body Contouring',
    description: 'Non-invasive body sculpting treatments including CoolSculpting, radiofrequency skin tightening, and targeted fat reduction. Personalized treatment plans for visible, lasting results.',
    keywords: ['body contouring Naperville IL', 'CoolSculpting Aurora', 'fat reduction DuPage County', 'body sculpting Naperville'],
  },
  {
    icon: Leaf,
    title: 'Preventive Wellness',
    description: 'Comprehensive health screenings, metabolic panels, vitamin deficiency testing, annual wellness exams, and personalized preventive care plans designed to optimize your long-term health.',
    keywords: ['preventive wellness Naperville IL', 'health screening Aurora', 'wellness exam DuPage County', 'annual physical Naperville'],
  },
];

const additionalServices = [
  {
    icon: FlaskConical,
    title: 'Comprehensive Lab Testing',
    description: 'Full metabolic panels, hormone levels, thyroid function, vitamin deficiencies, food sensitivity testing, and advanced biomarker analysis.',
  },
  {
    icon: Syringe,
    title: 'Vitamin B12 & Lipotropic Injections',
    description: 'Energy-boosting B12 injections and lipotropic fat-burning injections to complement weight loss and wellness programs.',
  },
  {
    icon: Sun,
    title: 'Skin Rejuvenation',
    description: 'Medical-grade skincare treatments including chemical peels, laser therapy, IPL photofacials, and customized skincare regimens.',
  },
  {
    icon: Smile,
    title: 'Sexual Health & Wellness',
    description: 'Confidential consultations and treatments for sexual health concerns including ED treatment, libido optimization, and hormonal balancing.',
  },
  {
    icon: Activity,
    title: 'Stress & Fatigue Management',
    description: 'Adrenal fatigue assessment, cortisol management, adaptogenic therapies, and lifestyle modification programs for chronic stress.',
  },
  {
    icon: Pill,
    title: 'Peptide Therapy',
    description: 'Cutting-edge peptide treatments for anti-aging, muscle recovery, immune function, cognitive enhancement, and overall vitality optimization.',
  },
];

const communityBenefits = [
  {
    title: 'Bridging the Wellness Gap in Chicago Suburbs',
    description: 'Many residents in Naperville, Aurora, and DuPage County lack access to medical expert supervised wellness services. Naperville Health & Wellness Clinic brings medical-grade aesthetic, weight loss, and preventive care to the western suburbs.',
  },
  {
    title: 'Medical Expert Supervised Care You Can Trust',
    description: 'Unlike med spas and non-medical clinics, every treatment at Naperville Health & Wellness Clinic is supervised by licensed physicians ensuring safety, proper dosing, and personalized protocols.',
  },
  {
    title: 'Holistic Approach to Health',
    description: 'We treat the whole person — not just symptoms. Our integrated approach combines medical weight management, hormone optimization, aesthetics, and preventive wellness for comprehensive health transformation.',
  },
  {
    title: 'Serving the Greater Chicago Suburbs',
    description: 'Naperville Health & Wellness Clinic serves residents of Naperville, Aurora, Wheaton, Lisle, Bolingbrook, Plainfield, and the greater Chicago suburban area with premium medical expert supervised wellness services.',
  },
];

const nearbyAreas = [
  'Aurora', 'Wheaton', 'Lisle', 'Bolingbrook', 'Plainfield',
  'Oswego', 'Warrenville', 'Downers Grove', 'Woodridge', 'Romeoville',
  'Glen Ellyn', 'Lombard', 'DuPage County', 'Will County',
];

const faqs = [
  {
    q: 'What is a health and wellness clinic?',
    a: 'A health and wellness clinic provides medical expert supervised services focused on preventive care, aesthetic treatments, weight management, and hormone optimization. Naperville Health & Wellness Clinic combines medical expertise with cutting-edge wellness treatments for a comprehensive approach to health.',
  },
  {
    q: 'Does Naperville Health & Wellness Clinic accept insurance?',
    a: 'Some services may be covered by insurance, while aesthetic and elective wellness treatments are typically self-pay. We offer transparent pricing and financing options. Contact us for details about your specific treatment.',
  },
  {
    q: 'How does medical weight loss work?',
    a: 'Our medical expert supervised medical weight loss program includes FDA-approved medications (Semaglutide/Tirzepatide), personalized nutrition planning, metabolic monitoring, and ongoing support. Programs are customized based on your health history, goals, and metabolic profile.',
  },
  {
    q: 'Is hormone replacement therapy safe?',
    a: 'When prescribed and monitored by qualified physicians, hormone replacement therapy is safe and effective. We conduct thorough lab work, health assessments, and ongoing monitoring to ensure optimal results with minimal risks.',
  },
  {
    q: 'Where is Naperville Health & Wellness Clinic located?',
    a: 'Naperville Health & Wellness Clinic is located in Naperville, Illinois — conveniently accessible from Aurora, Wheaton, Lisle, Bolingbrook, and the greater Chicago suburban area.',
  },
];

const napervilleWellnessSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  "name": "Naperville Health & Wellness Clinic",
  "alternateName": "Naperville Health & Wellness Clinic – Focus Health",
  "description": "Naperville Health & Wellness Clinic is a medical expert supervised wellness center in Naperville, Illinois offering medical weight loss with Semaglutide & Tirzepatide, hormone replacement therapy, Botox, dermal fillers, IV hydration, body contouring, and preventive wellness. Serving Aurora, Wheaton & Chicago suburbs.",
  "url": `${BASE_URL}/facilities/naperville-wellness-clinic`,
  "image": `${BASE_URL}/assets/naperville-wellness-1.jpg`,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Naperville",
    "addressRegion": "IL",
    "addressCountry": "US"
  },
  "medicalSpecialty": ["Preventive Medicine", "Dermatology", "Endocrinology"],
  "availableService": [
    { "@type": "MedicalProcedure", "name": "Medical Weight Loss" },
    { "@type": "MedicalProcedure", "name": "Hormone Replacement Therapy" },
    { "@type": "MedicalProcedure", "name": "Botox & Dermal Fillers" },
    { "@type": "MedicalProcedure", "name": "IV Hydration Therapy" },
    { "@type": "MedicalProcedure", "name": "Body Contouring" },
    { "@type": "MedicalProcedure", "name": "PRP Facial Rejuvenation" },
    { "@type": "MedicalProcedure", "name": "Peptide Therapy" },
    { "@type": "MedicalProcedure", "name": "Preventive Wellness Screening" },
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

const NapervilleWellnessClinic = () => {
  return (
    <>
{/* Hero */}
      <PageHero
        title="Naperville Health & Wellness Clinic"
        description="Medical expert supervised wellness services in Naperville, Illinois — medical weight loss, hormone therapy, aesthetics, IV hydration & preventive care serving Aurora, Wheaton & Chicago suburbs."
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
                  Premium Wellness Care in <span className="text-primary">Naperville, Illinois</span>
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong>Naperville Health & Wellness Clinic</strong> is a comprehensive <strong>medical expert supervised wellness center</strong> in <strong>Naperville, Illinois</strong>. We provide a full range of medical wellness services including <strong>medical weight loss, hormone replacement therapy, aesthetic treatments, IV hydration therapy, body contouring, and preventive wellness care</strong>.
                  </p>
                  <p>
                    Our team of <strong>licensed physicians and medical professionals</strong> delivers personalized treatment plans tailored to each patient's unique health goals. From <strong>FDA-approved weight loss medications like Semaglutide and Tirzepatide</strong> to <strong>bioidentical hormone therapy and advanced aesthetics</strong>, we combine medical expertise with the latest wellness innovations.
                  </p>
                  <p>
                    Proudly serving <strong>Naperville, Aurora, Wheaton, Lisle, Bolingbrook</strong>, and the greater <strong>Chicago suburban area</strong>, Naperville Health & Wellness Clinic is operated by <Link href="/" className="text-primary hover:underline font-medium">Focus Health</Link> — a healthcare infrastructure company committed to building and managing high-quality healthcare facilities.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-6">
                  <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">Medical Expert Supervised</span>
                  <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">FDA-Approved Treatments</span>
                  <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">Personalized Plans</span>
                  <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">Medical-Grade Results</span>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
                <img
                  src={facilityImage}
                  alt="Naperville Health & Wellness Clinic – Wellness Center in Naperville, Illinois"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                <div className="p-4 bg-background flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin size={16} className="text-primary flex-shrink-0" />
                  <span>Naperville, IL – Serving Aurora, Wheaton & Chicago Suburbs</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Wellness Services */}
      <section className="section-padding bg-background" id="services">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Wellness Services</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Comprehensive Wellness & Aesthetic Services
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Naperville Health & Wellness Clinic offers a full spectrum of medical expert supervised wellness treatments designed to help you look and feel your best.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wellnessServices.map((service, index) => (
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

      {/* Additional Services */}
      <section className="section-padding bg-card" id="additional-services">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Additional Services</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Specialized Wellness Treatments
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Beyond our core services, we offer specialized treatments to address specific health and wellness needs.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalServices.map((service, index) => (
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
                Elevating Wellness in Naperville & Chicago Suburbs
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Naperville Health & Wellness Clinic is committed to making medical expert supervised wellness accessible to the Naperville and greater Chicago suburban community.
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
                Serving Naperville & the Greater Chicago Suburbs
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Naperville Health & Wellness Clinic proudly serves residents throughout Naperville, Aurora, Wheaton, and the western Chicago suburbs.
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
                Naperville Health & Wellness Clinic is part of the Focus Health portfolio of healthcare facilities across Texas and Illinois.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { name: 'ER of Irving', path: '/facilities/er-of-irving', location: 'Irving, TX' },
              { name: 'ER of Lufkin', path: '/facilities/er-of-lufkin', location: 'Lufkin, TX' },
              { name: 'ER of White Rock', path: '/facilities/er-of-white-rock', location: 'Dallas, TX' },
              { name: 'Irving Wellness Clinic', path: '/facilities/irving-wellness-clinic', location: 'Irving, TX' },
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
            <a href="https://napervillehealthandwellness.com" target="_blank" rel="dofollow" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-primary/30 text-primary font-medium hover:bg-primary/5 transition-colors">
              Visit Naperville Wellness Website <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </>
);
};

export default NapervilleWellnessClinic;
