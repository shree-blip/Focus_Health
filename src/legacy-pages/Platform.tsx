"use client";

import { motion } from 'framer-motion';
import { BuildFundOperateLoop } from '@/components/ui/BuildFundOperateLoop';
import { RefreshCw, Building, Zap, Users, LineChart, FileText, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { PageHero } from '@/components/ui/PageHero';
import { Button } from '@/components/ui/button';
const platformBackground = "/platform-background.mp4";
const heroPlatform = "/hero-platform.jpg";

const whyFocus = [
  { icon: Zap, title: 'Turnkey Delivery', description: 'Complete end-to-end solution from site selection to operational excellence.' },
  { icon: RefreshCw, title: 'Speed to Launch', description: 'Proven playbook for efficient facility activation and market entry.' },
  { icon: Building, title: 'Operational Rigor', description: 'Standardized processes refined across 24+ managed locations.' },
  { icon: Users, title: 'Community-First Approach', description: 'Deep partnerships with local stakeholders and healthcare ecosystems.' },
  { icon: LineChart, title: 'Scalable Platform', description: 'Infrastructure designed to grow with your investment portfolio.' },
  { icon: FileText, title: 'Transparent Reporting', description: 'Clear metrics, regular updates, and full operational visibility.' },
];

const PlatformPage = () => {
  return (
    <>
      {/* Hero */}
      <PageHero
        title="Build + Fund + Operate"
        description="Our integrated platform delivers the complete lifecycle of freestanding ER and micro-hospital development—from initial market analysis to ongoing operational optimization."
        backgroundImage={heroPlatform}
        primaryCta={{ text: "Partner With Us", link: "/partners" }}
        secondaryCta={{ text: "Learn More", link: "/track-record" }}
      />

      {/* Platform Diagram */}
      <section className="section-padding bg-card relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            className="w-full h-full object-cover"
          >
            <source src={platformBackground} type="video/mp4" />
          </video>
          {/* Overlay for better contrast */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px]" />
          
          {/* Floating dots */}
          <motion.div
            className="absolute top-20 left-20 w-3 h-3 rounded-full bg-primary/20"
            animate={{ y: [0, -10, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-32 right-32 w-2 h-2 rounded-full bg-accent/30"
            animate={{ y: [0, -8, 0], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div
            className="absolute bottom-24 left-1/3 w-4 h-4 rounded-full bg-primary/15"
            animate={{ y: [0, -12, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          />
          <motion.div
            className="absolute bottom-32 right-1/4 w-2 h-2 rounded-full bg-accent/25"
            animate={{ y: [0, -6, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
          />
        </div>

        <div className="container-focus relative z-[2]">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center py-16">
                <BuildFundOperateLoop />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why Focus */}
      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Why Focus Healthcare
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Six pillars that define our operational excellence
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyFocus.map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Deep Dive */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
                  How the Platform Works
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    The Focus Health platform integrates three core disciplines — <strong className="text-foreground">facility development</strong>, <strong className="text-foreground">capital structuring</strong>, and <strong className="text-foreground">24/7 clinical operations</strong> — into a single repeatable system. Rather than cobbling together separate contractors, consultants, and management companies, we control every stage from site selection to ongoing optimisation.
                  </p>
                  <p>
                    This approach eliminates the coordination failures that plague fragmented healthcare development. Our standardised build specs keep construction timelines predictable, our in-house credentialing pipeline ensures facilities are fully staffed before day one, and our operating playbook means every new location benefits from the lessons of the previous 24+.
                  </p>
                  <p>
                    <Link href="/insights/focus-health-build-fund-operate-platform" className="text-primary hover:underline font-medium">Learn more about the build-fund-operate model</Link> or <Link href="/our-process" className="text-primary hover:underline font-medium">view the full development process</Link>.
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="space-y-4">
                {[
                  { step: 'Build', desc: 'Site selection, facility design, construction management, and regulatory compliance — all handled in-house with standardised specs.' },
                  { step: 'Fund', desc: 'Transparent underwriting, milestone-based capital deployment, and investor reporting from pre-construction through stabilisation.' },
                  { step: 'Operate', desc: '24/7 staffing, clinical quality assurance, revenue cycle management, and continuous performance optimisation.' },
                ].map((phase, i) => (
                  <div key={phase.step} className="flex gap-4 p-5 rounded-xl bg-background border border-border">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold mb-1">{phase.step}</h3>
                      <p className="text-muted-foreground text-sm">{phase.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Related Insights */}
      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">Platform Insights</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Explore our insights library for deeper analysis on healthcare infrastructure
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { title: 'How Focus Health Builds, Funds, and Operates', href: '/insights/focus-health-build-fund-operate-platform', desc: 'A detailed look at how our integrated model eliminates fragmented execution and accelerates facility launches.' },
              { title: 'Operational Readiness: 90 Days Before Opening', href: '/insights/operational-readiness-90-days-before-facility-opening', desc: 'From staffing and training to systems testing — what happens in the critical final months before launch.' },
            ].map((article, index) => (
              <ScrollReveal key={article.href} delay={index * 0.1}>
                <Link href={article.href} className="block p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group h-full">
                  <BookOpen size={20} className="text-primary mb-3" />
                  <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{article.desc}</p>
                  <span className="inline-flex items-center gap-1 mt-3 text-sm text-primary font-medium">Read Article <ArrowRight size={14} /></span>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/insights" className="gap-2">
                Explore our insights library <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* See Our Results CTA */}
      <section className="section-padding bg-primary/5 border-t border-b border-border">
        <div className="container-focus">
          <ScrollReveal>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
                  See Our Platform in Action
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Review our operational track record across 24+ healthcare locations in Texas. From facility development to ongoing optimization, see the results our integrated platform delivers.
                </p>
                <Button variant="hero" size="lg" asChild className="group">
                  <Link href="/track-record" className="flex items-center">
                    View Our Track Record
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-4">
                <div className="p-6 rounded-lg bg-card border border-border">
                  <div className="text-3xl font-bold text-primary mb-2">24+</div>
                  <p className="text-muted-foreground">Healthcare locations successfully managed</p>
                </div>
                <div className="p-6 rounded-lg bg-card border border-border">
                  <div className="text-3xl font-bold text-primary mb-2">$100M+</div>
                  <p className="text-muted-foreground">Annual revenue scaled across portfolio</p>
                </div>
                <div className="p-6 rounded-lg bg-card border border-border">
                  <div className="text-3xl font-bold text-primary mb-2">Proven</div>
                  <p className="text-muted-foreground">Operational excellence and financial performance</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
);
};

export default PlatformPage;
