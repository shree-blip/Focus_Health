import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  ArrowRight, 
  Building2, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Users, 
  CheckCircle2,
  Target,
  Handshake,
  BarChart3,
  Shield,
  Zap,
  Heart,
  DollarSign,
  FileText,
  Quote,
  Sparkles
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import heroInvestors from '@/assets/hero-investors.jpg';
import ribbonCutting from '@/assets/ERofIrving-GrandOpening.mp4';

const valueProps = [
  {
    icon: Building2,
    title: 'End-to-End Delivery',
    description: 'From site selection to staffing to grand opening—we handle every detail.',
  },
  {
    icon: Clock,
    title: '24/7 Operations',
    description: 'Around-the-clock emergency care with proven staffing models.',
  },
  {
    icon: TrendingUp,
    title: 'High-Growth Markets',
    description: 'Strategic Texas locations with strong demographic tailwinds.',
  },
];

const processSteps = [
  { step: 1, title: 'Market & Site Selection', description: 'Data-driven analysis identifies optimal Texas communities.' },
  { step: 2, title: 'Facility Design & Build', description: 'Standardized construction for speed and cost efficiency.' },
  { step: 3, title: 'Clinical Recruitment', description: 'Attract and credential top emergency medicine talent.' },
  { step: 4, title: 'Operations Launch', description: 'Proven playbook ensures a smooth grand opening.' },
  { step: 5, title: 'Continuous Improvement', description: 'Ongoing optimization drives patient and financial outcomes.' },
];

const investmentHighlights = [
  { icon: Target, text: 'High-growth Texas markets with strong demographics' },
  { icon: Users, text: 'Experienced operator with 24+ facilities managed' },
  { icon: FileText, text: 'Clear development timeline with milestone reporting' },
  { icon: BarChart3, text: 'Transparent financial updates and performance metrics' },
];

const investorBenefits = [
  'Disciplined operations with standardized protocols',
  'Proven build and launch process',
  'Regular performance reporting',
  'Experienced management team',
  'Attractive return potential',
];

const communityBenefits = [
  'Improved access to emergency care',
  'Reduced wait times for patients',
  'Local job creation',
  'Economic growth catalyst',
  'Community health partnership',
];

const testimonials = [
  {
    quote: "Focus Health delivered exactly what they promised—a world-class emergency facility that our community desperately needed.",
    author: 'Community Leader',
    location: 'Irving, TX',
  },
  {
    quote: "The team's operational expertise and transparent communication made this investment straightforward and rewarding.",
    author: 'Private Investor',
    location: 'Dallas, TX',
  },
];

const facilityLocations = ['Irving', 'Lufkin', 'Coming Soon: New Markets'];

const Investors = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Welcome to the waitlist! Check your inbox for the investor deck.');
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroInvestors})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/80" />
        
        <div className="container-focus relative z-10 text-center py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full px-4 py-2 mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white">Now Raising $3.4M for New Facilities</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 max-w-5xl mx-auto leading-tight"
          >
            Invest in Texas
            <span className="block text-accent">Emergency Care</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Focus Health partners with investors and communities to build and operate 
            freestanding emergency rooms—complete facilities with 24/7 care, 
            delivered turnkey by an experienced operator.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Button asChild size="lg" variant="accent" className="gap-2 px-8 text-base">
              <a href="#waitlist">
                Partner With Us
                <ArrowRight size={18} />
              </a>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="gap-2 px-8 bg-white/10 backdrop-blur-sm border-white/40 text-white hover:bg-white/20 hover:text-white hover:border-white/60"
            >
              <a href="#investment">
                View Investment Overview
              </a>
            </Button>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Value Proposition Section */}
      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6">
                The Problem & Our Solution
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Texas faces a growing gap between emergency care demand and capacity. 
                Hospital ERs are overcrowded, wait times are climbing, and underserved 
                communities lack access to timely care. <strong className="text-foreground">Focus Health bridges this gap</strong>—delivering 
                fully-equipped freestanding emergency rooms that serve patients and 
                generate returns for investors.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {valueProps.map((prop, index) => (
              <ScrollReveal key={prop.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="card-premium p-8 text-center h-full"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <prop.icon size={32} className="text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-3">{prop.title}</h3>
                  <p className="text-muted-foreground">{prop.description}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                A proven five-step process refined over 24+ facility launches
              </p>
            </div>
          </ScrollReveal>

          {/* Desktop horizontal timeline */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-border rounded-full" />
              <motion.div 
                className="absolute top-8 left-0 h-1 bg-primary rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
              
              <div className="grid grid-cols-5 gap-4">
                {processSteps.map((step, index) => (
                  <ScrollReveal key={step.step} delay={index * 0.15}>
                    <div className="relative pt-16 text-center">
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm z-10">
                        {step.step}
                      </div>
                      <h3 className="font-heading font-semibold text-lg mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile stacked view */}
          <div className="lg:hidden space-y-4">
            {processSteps.map((step, index) => (
              <ScrollReveal key={step.step} delay={index * 0.1}>
                <div className="flex gap-4 p-4 rounded-xl bg-background border border-border">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold mb-1">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Track Record Section */}
      <section className="section-padding bg-background overflow-hidden">
        <div className="container-focus">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6">
                  Proven Track Record
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Our leadership team has managed <strong className="text-foreground">24+ medical locations</strong> across Texas. 
                  We bring deep operational expertise in emergency medicine, facility development, 
                  and healthcare finance—experience that translates to disciplined execution and 
                  strong outcomes.
                </p>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[
                    { value: 24, suffix: '+', label: 'Facilities Managed' },
                    { value: 5, suffix: '+', label: 'Years Experience' },
                    { value: 24, suffix: '/7', label: 'Operating Model' },
                    { value: 3, suffix: '+', label: 'Facilities in Focus' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-4 rounded-xl bg-card border border-border">
                      <div className="text-2xl sm:text-3xl font-heading font-bold text-primary">
                        <AnimatedCounter end={stat.value} />
                        {stat.suffix}
                      </div>
                      <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
                
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/leadership">
                    Meet Our Team
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-auto"
                >
                  <source src={ribbonCutting} type="video/mp4" />
                </video>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-6">
                  <p className="text-white font-medium">ER of Irving Grand Opening</p>
                  <p className="text-white/70 text-sm">Focus Health's latest facility</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Market Opportunity Section */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Market Opportunity
              </h2>
              <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
                Texas leads the nation in freestanding ER growth—and demand continues to accelerate
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { 
                value: '700+', 
                label: 'Freestanding ERs in Texas', 
                description: "The nation's largest market",
                icon: Building2
              },
              { 
                value: '8%', 
                label: 'Annual Growth Rate', 
                description: 'Outpacing traditional hospitals',
                icon: TrendingUp
              },
              { 
                value: '$3.4M', 
                label: 'Current Raise', 
                description: 'For new Texas facilities',
                icon: DollarSign
              },
            ].map((stat, index) => (
              <ScrollReveal key={stat.label} delay={index * 0.1}>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center"
                >
                  <stat.icon className="w-10 h-10 mx-auto mb-4 text-accent" />
                  <div className="text-4xl sm:text-5xl font-heading font-bold mb-2">{stat.value}</div>
                  <p className="font-semibold mb-1">{stat.label}</p>
                  <p className="text-primary-foreground/70 text-sm">{stat.description}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
              <h3 className="font-heading font-semibold text-xl mb-4 text-center">Why Texas?</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  'Fastest-growing state population',
                  'Business-friendly regulatory environment',
                  'Strong employer-based insurance coverage',
                  'Established freestanding ER infrastructure',
                ].map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Investment Overview Section */}
      <section id="investment" className="section-padding bg-background">
        <div className="container-focus">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6">
                  Investment Overview
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Focus Health offers accredited investors a compelling opportunity to participate 
                  in Texas's growing freestanding emergency room market—backed by experienced 
                  operators and a proven development model.
                </p>
                
                <div className="space-y-4 mb-8">
                  {investmentHighlights.map((highlight, index) => (
                    <motion.div 
                      key={highlight.text}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <highlight.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-foreground">{highlight.text}</span>
                    </motion.div>
                  ))}
                </div>
                
                <Button asChild size="lg" variant="accent" className="gap-2">
                  <a href="#waitlist">
                    Request Investor Deck
                    <ArrowRight size={18} />
                  </a>
                </Button>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                  <h3 className="font-heading font-semibold text-xl">Investor Protections</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    'Standardized facility development reduces execution risk',
                    'Experienced management with proven track record',
                    'Regular financial and operational reporting',
                    'Clear milestone-based development timeline',
                    'Professional governance and compliance oversight',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Partnership Options Section */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Partnership Options
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Two paths to partner with Focus Health—each creating lasting value
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <ScrollReveal>
              <motion.div 
                whileHover={{ y: -4 }}
                className="card-premium p-8 h-full"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-2xl">For Investors</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Join a disciplined capital deployment in Texas's high-growth emergency care market.
                </p>
                <ul className="space-y-3">
                  {investorBenefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.15}>
              <motion.div 
                whileHover={{ y: -4 }}
                className="card-premium p-8 h-full border-accent/30"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Heart className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="font-heading font-bold text-2xl">For Communities</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Bring high-quality emergency care to your community—backed by a trusted operator.
                </p>
                <ul className="space-y-3">
                  {communityBenefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                What Partners Say
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Trusted by investors and communities across Texas
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={testimonial.author} delay={index * 0.15}>
                <div className="bg-card rounded-2xl p-8 border border-border relative">
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
                  <p className="text-lg mb-6 italic text-muted-foreground">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Facility Locations */}
          <ScrollReveal>
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Facilities in Texas</p>
              <div className="flex flex-wrap justify-center gap-4">
                {facilityLocations.map((location) => (
                  <div 
                    key={location}
                    className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2"
                  >
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">{location}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA & Form Section */}
      <section id="waitlist" className="section-padding bg-gradient-to-b from-primary to-primary/90 text-primary-foreground">
        <div className="container-focus">
          <div className="max-w-2xl mx-auto text-center">
            <ScrollReveal>
              <Handshake className="w-16 h-16 mx-auto mb-6 text-accent" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Join the Waitlist
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-10">
                Request our investor deck and receive updates on new opportunities. 
                Limited partnership spots available for accredited investors.
              </p>
            </ScrollReveal>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
              >
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-accent" />
                <h3 className="text-2xl font-heading font-bold mb-2">You're on the List!</h3>
                <p className="text-primary-foreground/80">
                  Check your inbox for the investor deck. We'll be in touch soon with exclusive updates.
                </p>
              </motion.div>
            ) : (
              <ScrollReveal>
                <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <Input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/60 h-12"
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/60 h-12"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    variant="accent" 
                    className="w-full gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Zap className="w-5 h-5 animate-pulse" />
                        Joining...
                      </>
                    ) : (
                      <>
                        Join the Waitlist
                        <ArrowRight size={18} />
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-primary-foreground/60 mt-4">
                    For accredited investors only. By subscribing, you agree to receive updates from Focus Health.
                  </p>
                </form>
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>

      {/* Final Disclaimer */}
      <section className="py-8 bg-muted">
        <div className="container-focus">
          <p className="text-center text-muted-foreground text-sm max-w-3xl mx-auto">
            This page is for informational purposes only and does not constitute an offer to sell 
            or a solicitation of an offer to buy any securities. Any such offer will be made only 
            by means of a confidential private placement memorandum.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Investors;
