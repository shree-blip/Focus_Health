"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Building2, Users, CheckCircle, Send, TrendingUp, Shield, Stethoscope, MapPin, DollarSign, Briefcase, ArrowRight } from 'lucide-react';
import { SubmissionSuccessModal } from '@/components/ui/SubmissionSuccessModal';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHero } from '@/components/ui/PageHero';
import { useToast } from '@/hooks/use-toast';
const heroPartners = "/hero-partners.jpg";
const investmentHighlights = [{
  icon: Building2,
  title: 'Tangible Assets',
  description: 'Invest in real healthcare real estate with proven cash flow potential.'
}, {
  icon: Users,
  title: 'Experienced Operators',
  description: 'Partner with a team that has successfully managed 24+ ER locations.'
}, {
  icon: TrendingUp,
  title: 'Proven Strategy',
  description: 'Benefit from our standardized playbook and disciplined operations.'
}, {
  icon: Shield,
  title: 'Turnkey Solutions',
  description: 'End-to-end development and operational support for your investment.'
}];
const investmentOptions = [{
  title: 'Turn-Key ER Ownership',
  description: 'Purchase a fully operational emergency room location with established patient flow and staff.',
  features: ['Fully operational facility', 'Trained staff in place', 'Established patient base', 'Immediate revenue generation']
}, {
  title: 'Management Support Model',
  description: 'Own your ER location with comprehensive management and operational support from Focus Health.',
  features: ['Full operational management', 'Staff recruitment & training', 'Compliance & licensing', 'Revenue cycle management']
}];
const cashToInvestOptions = ['$250,000 - $300,000', '$300,000 - $500,000', '$500,000 - $1,000,000', '$1,000,000 - $2,000,000', '$2,000,000 - $3,000,000', '$3,000,000 - $5,000,000', '$5,000,000+'];
const PartnersPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    marketInterest: '',
    cashToInvest: '',
    partnerType: [] as string[],
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const {
    toast
  } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const shouldScroll = tab === 'investors' || tab === 'communities' || window.location.hash === '#opportunity-form';

    if (!shouldScroll) {
      return;
    }

    requestAnimationFrame(() => {
      const element = document.getElementById('opportunity-form');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, []);
  const handlePartnerTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        partnerType: [...formData.partnerType, type]
      });
    } else {
      setFormData({
        ...formData,
        partnerType: formData.partnerType.filter(t => t !== type)
      });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submissions/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          marketInterest: formData.marketInterest,
          cashToInvest: formData.cashToInvest,
          partnerType: formData.partnerType.join(', '),
          additionalInfo: formData.additionalInfo
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Submission failed');
      }

      // Save to localStorage for admin panel
      if (payload.submission && typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('focus_admin_submissions') || '[]');
        existing.unshift(payload.submission);
        localStorage.setItem('focus_admin_submissions', JSON.stringify(existing));
      }

      console.log('Business opportunity request sent:', payload);
      setIsSubmitted(true);
      setShowModal(true);
      toast({
        title: "Request Submitted",
        description: "We'll be in touch shortly to discuss investment opportunities."
      });
    } catch (error: unknown) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <>
      <SubmissionSuccessModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Request Received!"
        message="Thank you for your interest. Our team will review your information and reach out shortly to discuss investment opportunities."
        email={formData.email}
      />

      {/* Hero */}
      <PageHero title="Business Opportunities" description="Investing in Freestanding Emergency Room Clinics — End to End Turnkey Healthcare Solutions. Buy and own a turn-key ER location or partner with Focus Health for comprehensive management support." backgroundImage={heroPartners} primaryCta={{
      text: "Request More Info",
      link: "/our-process"
    }} />

      {/* Value Proposition */}
      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center max-w-4xl mx-auto mb-16">
              <p className="text-accent font-medium uppercase tracking-wider mb-4">Participate in the Growth of Healthcare</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6">
                Healthcare Real Estate Investment
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Focus Health is a leading operator in the healthcare infrastructure space. We develop and manage freestanding emergency rooms that deliver comprehensive, fast ER care to Texas communities. <Link href="/investors" className="text-primary hover:underline font-medium">View detailed investor information</Link> or <Link href="/market" className="text-primary hover:underline font-medium">explore the Texas market opportunity</Link>.
              </p>
              <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20">
                <p className="text-xl sm:text-2xl font-heading font-semibold text-foreground">
                  Invest in <span className="text-primary">TANGIBLE ASSETS</span> with a{' '}
                  <span className="text-primary">TEAM of EXPERIENCED OPERATORS</span> and a{' '}
                  <span className="text-primary">PROVEN STRATEGY</span>.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Highlights Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {investmentHighlights.map((highlight, index) => <ScrollReveal key={highlight.title} delay={index * 0.1}>
                <motion.div whileHover={{
              y: -5,
              scale: 1.02
            }} className="bg-card rounded-2xl p-6 border border-border h-full">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <highlight.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{highlight.title}</h3>
                  <p className="text-muted-foreground text-sm">{highlight.description}</p>
                </motion.div>
              </ScrollReveal>)}
          </div>
        </div>
      </section>

      {/* Investment Options */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
                Partnership Models
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Choose the ownership model that fits your investment goals and involvement preferences.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {investmentOptions.map((option, index) => <ScrollReveal key={option.title} delay={index * 0.15} direction={index === 0 ? 'right' : 'left'}>
                <motion.div whileHover={{
              scale: 1.02
            }} className="bg-background rounded-2xl p-8 border border-border h-full">
                  <div className="flex items-center gap-3 mb-4">
                    {index === 0 ? <Building2 className="w-8 h-8 text-accent" /> : <Briefcase className="w-8 h-8 text-primary" />}
                    <h3 className="font-heading font-bold text-xl">{option.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">{option.description}</p>
                  <ul className="space-y-3">
                    {option.features.map(feature => <li key={feature} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>)}
                  </ul>
                </motion.div>
              </ScrollReveal>)}
          </div>

          <ScrollReveal delay={0.3}>
            <div className="text-center mt-12">
              <p className="text-lg font-medium text-foreground mb-2">
                Financing Available • Physician Partnership Opportunities
              </p>
              <p className="text-muted-foreground">
                Are you a physician interested in becoming a partner? Contact us today.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Form */}
      <section id="opportunity-form" className="section-padding bg-background scroll-mt-28">
        <div className="container-focus">
          <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
            {/* Left Content */}
            <ScrollReveal>
              <div>
                <p className="text-accent font-medium uppercase tracking-wider mb-4">Get Started</p>
                <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
                  Request Investment Information
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Fill out the form to receive detailed information on owning one of our Emergency Room clinics. Our team will reach out to discuss opportunities that match your investment goals.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Prime Texas Markets</h4>
                      <p className="text-muted-foreground text-sm">Strategic locations in high-growth DFW, Dalls, Lufkin, Irving, Houston, Austin, and San Antonio metros.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Flexible Investment Levels</h4>
                      <p className="text-muted-foreground text-sm">Various partnership structures to match your capital allocation and risk profile.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Physician Opportunities</h4>
                      <p className="text-muted-foreground text-sm">Special partnership tracks for physicians looking to own and operate.</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Form */}
            <ScrollReveal direction="left">
              {isSubmitted ? <motion.div initial={{
              opacity: 0,
              scale: 0.95
            }} animate={{
              opacity: 1,
              scale: 1
            }} className="bg-card rounded-2xl p-8 border border-border text-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="font-heading font-bold text-2xl mb-3">Request Received!</h3>
                  <p className="text-muted-foreground text-lg">
                    Thank you for your interest. Our team will review your information and reach out shortly to discuss investment opportunities.
                  </p>
                </motion.div> : <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 border border-border">
                  <h3 className="font-heading font-bold text-xl mb-6">Investment Inquiry Form</h3>
                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium mb-2">First Name *</label>
                        <Input id="firstName" type="text" placeholder="John" value={formData.firstName} onChange={e => setFormData({
                      ...formData,
                      firstName: e.target.value
                    })} required className="h-12" />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium mb-2">Last Name *</label>
                        <Input id="lastName" type="text" placeholder="Smith" value={formData.lastName} onChange={e => setFormData({
                      ...formData,
                      lastName: e.target.value
                    })} required className="h-12" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address *</label>
                      <Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({
                    ...formData,
                    email: e.target.value
                  })} required className="h-12" />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone Number *</label>
                      <Input id="phone" type="tel" placeholder="(555) 123-4567" value={formData.phone} onChange={e => setFormData({
                    ...formData,
                    phone: e.target.value
                  })} required className="h-12" />
                    </div>

                    <div>
                      <label htmlFor="marketInterest" className="block text-sm font-medium mb-2">Market/Area of Interest</label>
                      <Input id="marketInterest" type="text" placeholder="e.g., Dallas-Fort Worth, Houston" value={formData.marketInterest} onChange={e => setFormData({
                    ...formData,
                    marketInterest: e.target.value
                  })} className="h-12" />
                    </div>

                    <div>
                      <label htmlFor="cashToInvest" className="block text-sm font-medium mb-2">Cash Available to Invest *</label>
                      <Select value={formData.cashToInvest} onValueChange={value => setFormData({
                    ...formData,
                    cashToInvest: value
                  })} required>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select investment range" />
                        </SelectTrigger>
                        <SelectContent>
                          {cashToInvestOptions.map(option => <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">Are you a Physician or Investor? *</label>
                      <div className="flex flex-wrap gap-4">
                        {['Physician/Doctor', 'Investor', 'Other'].map(type => <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox checked={formData.partnerType.includes(type)} onCheckedChange={checked => handlePartnerTypeChange(type, checked as boolean)} />
                            <span className="text-sm">{type}</span>
                          </label>)}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="additionalInfo" className="block text-sm font-medium mb-2">Additional Information</label>
                      <Textarea id="additionalInfo" placeholder="Tell us about your investment goals, experience, or any questions..." value={formData.additionalInfo} onChange={e => setFormData({
                    ...formData,
                    additionalInfo: e.target.value
                  })} rows={4} />
                    </div>

                    <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                      <Send className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </form>}
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Due Diligence Resources */}
      <section className="section-padding bg-card border-t border-border">

      {/* FAQ Section */}
      </section>
      <section className="section-padding bg-background" id="faq">
        <div className="container-focus max-w-4xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">FAQ</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Common questions from physicians, investors, and partners considering freestanding ER ownership
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-6">
            {[
              { q: 'How much capital is required to own a freestanding ER?', a: 'Investment levels vary based on the partnership model. Turn-key ownership typically requires $250,000–$5,000,000+ in cash available to invest, depending on the market and facility scope. Financing options are available.' },
              { q: 'Do I need to be a physician to partner with Focus Health?', a: 'No. Focus Health works with both physician-partners and non-physician investors. We offer distinct partnership tracks for each, with dedicated operational and clinical support.' },
              { q: 'What partnership models does Focus Health offer?', a: 'We offer two primary models: Turn-Key ER Ownership, where you purchase a fully operational facility, and Management Support, where you own the location with comprehensive management and operational backing from Focus Health.' },
              { q: 'How long does it take to open a new freestanding ER?', a: 'From site selection to grand opening, our proven process typically takes 90–120 days for facility build-out and launch. Exact timelines depend on permitting, construction scope, and local regulations.' },
              { q: 'What markets does Focus Health operate in?', a: 'We currently operate facilities in Irving TX, Lufkin TX, and Dallas TX, with a wellness clinic in Naperville IL. Our expansion pipeline targets the DFW metroplex, Houston suburbs, and the Austin–San Antonio corridor.' },
              { q: 'What support does Focus Health provide after opening?', a: 'Our management support model includes 24/7 clinical operations, staff recruitment and training, compliance and licensing, revenue cycle management, and continuous performance optimisation.' },
              { q: 'How do I get started?', a: 'Fill out the investment enquiry form on this page, or contact us directly at info@getfocushealth.com. Our team will reach out to discuss opportunities that match your investment goals and involvement preferences.' },
            ].map((faq, index) => (
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

      {/* Due Diligence & Learn More */}
      <section className="section-padding bg-card border-t border-border">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
                Learn More About Focus Health
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Explore our platform, review our operational track record, or connect with our experienced leadership team
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal delay={0}>
              <motion.div 
                whileHover={{ y: -4 }}
                className="p-8 rounded-lg bg-background border border-border hover:border-primary/30 transition-all"
              >
                <Building2 className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-heading font-bold text-lg mb-3">Our Platform</h3>
                <p className="text-muted-foreground mb-6">
                  Discover how our integrated build, fund, and operate platform delivers end-to-end healthcare infrastructure solutions.
                </p>
                <Button variant="ghost" size="sm" asChild className="group">
                  <Link href="/platform" className="flex items-center">
                    Learn More
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <motion.div 
                whileHover={{ y: -4 }}
                className="p-8 rounded-lg bg-background border border-border hover:border-primary/30 transition-all"
              >
                <TrendingUp className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-heading font-bold text-lg mb-3">Track Record</h3>
                <p className="text-muted-foreground mb-6">
                  <Link href="/track-record" className="text-primary hover:underline font-medium">See our portfolio of 24+ facilities</Link> and review operational outcomes with proven financial performance.
                </p>
                <Button variant="ghost" size="sm" asChild className="group">
                  <Link href="/track-record" className="flex items-center">
                    View Results
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <motion.div 
                whileHover={{ y: -4 }}
                className="p-8 rounded-lg bg-background border border-border hover:border-primary/30 transition-all"
              >
                <Users className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-heading font-bold text-lg mb-3">Investor Checklist</h3>
                <p className="text-muted-foreground mb-6">
                  Read <Link href="/insights/investor-checklist-healthcare-infrastructure-operators" className="text-primary hover:underline font-medium">what to look for in a healthcare operator</Link> — a practical checklist for evaluating infrastructure partners.
                </p>
                <Button variant="ghost" size="sm" asChild className="group">
                  <Link href="/insights/investor-checklist-healthcare-infrastructure-operators" className="flex items-center">
                    Read Checklist
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>
  </>;
};
export default PartnersPage;