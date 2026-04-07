"use client";

import { useState } from 'react';
import { Send, Mail, MapPin, Calendar, CheckCircle, Clock, ArrowRight, Building2, Users, TrendingUp, BookOpen } from 'lucide-react';
import { SubmissionSuccessModal } from '@/components/ui/SubmissionSuccessModal';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHero } from '@/components/ui/PageHero';
import { useToast } from '@/hooks/use-toast';
import { saveSubmission } from '@/lib/submissions-store';
const heroContact = "/hero-contact.jpg";

const roles = ['Investor', 'Community', 'Operator', 'Media', 'Other'];

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submissions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Submission failed');
      }

      if (payload.submission) {
        saveSubmission(payload.submission);
      }

      setIsSubmitted(true);
      setShowModal(true);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SubmissionSuccessModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Message Sent!"
        message="Thank you for reaching out. Our team will review your message and get back to you within 1–2 business days."
        email={formData.email}
      />

      {/* Hero */}
      <PageHero
        title="Contact Us"
        description="Ready to explore partnership opportunities? We'd love to hear from you."
        backgroundImage={heroContact}
      />

      {/* Contact Section */}
      <section id="contact-form" className="section-padding bg-card">
        <div className="container-focus">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 max-w-5xl mx-auto">
            {/* Contact Info */}
            <ScrollReveal>
              <div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-6">
                  Let's Start a Conversation
                </h2>
                <p className="text-muted-foreground mb-10 leading-relaxed">
                  Whether you're an investor, community leader, or healthcare professional, we're interested in exploring how we can work together to build better healthcare infrastructure.
                </p>

                <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-10">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail size={18} className="text-primary sm:hidden" />
                      <Mail size={22} className="text-primary hidden sm:block" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
                      <a href="mailto:info@getfocushealth.com" className="font-medium text-sm sm:text-base hover:text-primary transition-colors break-all sm:break-normal">
                        info@getfocushealth.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin size={18} className="text-primary sm:hidden" />
                      <MapPin size={22} className="text-primary hidden sm:block" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Headquarters</p>
                      <p className="font-medium text-sm sm:text-base">3001 Skyway Cir N</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Irving, TX 75038</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock size={18} className="text-primary sm:hidden" />
                      <Clock size={22} className="text-primary hidden sm:block" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Office Hours</p>
                      <p className="font-medium text-sm sm:text-base">Mon–Fri 9:00 AM – 5:00 PM CT</p>
                      <p className="text-xs text-muted-foreground">ER facilities open 24/7/365</p>
                    </div>
                  </div>

                </div>

                {/* Google Calendar Scheduling */}
                <div className="mt-6 sm:mt-8">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Calendar size={16} className="text-accent sm:hidden" />
                      <Calendar size={20} className="text-accent hidden sm:block" />
                    </div>
                    <h3 className="font-heading font-semibold text-base sm:text-lg">Schedule a Call</h3>
                  </div>
                  <div className="rounded-lg sm:rounded-xl overflow-hidden border border-border">
                    <iframe 
                      src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XACH-PNq5Nr3upP1QMqeWgEBihqud5N2lESMAMo8UCUxCP7wKAOxpBagtmKR8o3pERE3RwsTO?gv=true" 
                      style={{ border: 0 }} 
                      width="100%" 
                      height="400" 
                      frameBorder="0"
                      title="Schedule a meeting"
                      className="sm:h-[500px]"
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Form */}
            <ScrollReveal direction="left">
              {isSubmitted ? (
                <div className="bg-background rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-border text-center h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <CheckCircle size={32} className="text-green-600 sm:hidden" />
                    <CheckCircle size={40} className="text-green-600 hidden sm:block" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl sm:text-2xl mb-2 sm:mb-3">Message Sent!</h3>
                  <p className="text-muted-foreground max-w-sm text-sm sm:text-base">
                    Thank you for reaching out. We'll review your message and get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-background rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-border shadow-lg">
                  <h3 className="font-heading font-semibold text-lg sm:text-xl mb-4 sm:mb-6">Send a Message</h3>
                  <div className="space-y-4 sm:space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name</label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">I am a(n)...</label>
                      <div className="flex flex-wrap gap-2">
                        {roles.map(role => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setFormData({ ...formData, role })}
                            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                              formData.role === role
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                      <Textarea
                        id="message"
                        placeholder="How can we help you?"
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={5}
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting || !formData.name || !formData.email || !formData.role || !formData.message}
                    >
                      {isSubmitting ? 'Sending...' : (
                        <>
                          Send Message
                          <Send size={18} className="ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="section-padding bg-background">
        <div className="container-focus">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-3">Looking for Something Specific?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Browse the links below to find the information you need, or use the form above to get in touch directly.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <ScrollReveal delay={0}>
              <Link href="/partners" className="block p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group">
                <Building2 size={24} className="text-primary mb-3" />
                <h3 className="font-heading font-semibold mb-1 group-hover:text-primary transition-colors">Interested in partnering with us?</h3>
                <p className="text-muted-foreground text-sm">Explore ownership and management support models for freestanding ERs.</p>
                <span className="inline-flex items-center gap-1 mt-3 text-sm text-primary font-medium">
                  Business Opportunities <ArrowRight size={14} />
                </span>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <Link href="/investors" className="block p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group">
                <TrendingUp size={24} className="text-primary mb-3" />
                <h3 className="font-heading font-semibold mb-1 group-hover:text-primary transition-colors">Looking for investor information?</h3>
                <p className="text-muted-foreground text-sm">Request the investor deck and learn about our current capital raise.</p>
                <span className="inline-flex items-center gap-1 mt-3 text-sm text-primary font-medium">
                  Investor Relations <ArrowRight size={14} />
                </span>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <Link href="/insights" className="block p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group">
                <BookOpen size={24} className="text-primary mb-3" />
                <h3 className="font-heading font-semibold mb-1 group-hover:text-primary transition-colors">Read our latest insights</h3>
                <p className="text-muted-foreground text-sm">Market analysis, operational updates, and healthcare infrastructure trends.</p>
                <span className="inline-flex items-center gap-1 mt-3 text-sm text-primary font-medium">
                  View Insights <ArrowRight size={14} />
                </span>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <Link href="/leadership" className="block p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group">
                <Users size={24} className="text-primary mb-3" />
                <h3 className="font-heading font-semibold mb-1 group-hover:text-primary transition-colors">Meet our leadership team</h3>
                <p className="text-muted-foreground text-sm">The experienced operators and healthcare professionals behind Focus Health.</p>
                <span className="inline-flex items-center gap-1 mt-3 text-sm text-primary font-medium">
                  Leadership <ArrowRight size={14} />
                </span>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
);
};

export default ContactPage;
