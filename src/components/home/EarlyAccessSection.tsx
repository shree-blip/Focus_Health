"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const roles = ['Investor', 'Community', 'Operator', 'Other'];

export const EarlyAccessSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <section className="section-padding bg-background">
      <div className="container-focus">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-6 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3 sm:mb-4">
                Get Early Access
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg">
                Be the first to know when we launch. Join our exclusive waiting list.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-2xl p-8 border border-border text-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">You're on the list!</h3>
                <p className="text-muted-foreground">
                  We'll be in touch soon with updates on our Q4 2025 launch.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-border shadow-lg">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 sm:mb-3">
                      I am a(n)...
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      {roles.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setFormData({ ...formData, role })}
                          className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
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

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting || !formData.name || !formData.email || !formData.role}
                  >
                    {isSubmitting ? (
                      'Joining...'
                    ) : (
                      <>
                        Join Waiting List
                        <Send size={18} className="ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Questions? Reach out to us directly.
                  </p>
                  <a
                    href="mailto:info@getfocushealth.com"
                    className="text-primary hover:underline font-medium"
                  >
                    info@getfocushealth.com
                  </a>
                </div>
              </form>
            )}
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="text-center mt-6 sm:mt-8">
              <span className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-accent/10 text-accent text-xs sm:text-sm font-medium">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent animate-pulse" />
                Limited Partnership Spots Available
              </span>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
