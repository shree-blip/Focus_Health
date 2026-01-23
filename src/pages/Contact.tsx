import { useState } from 'react';
import { Send, Mail, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHero } from '@/components/ui/PageHero';
import heroContact from '@/assets/hero-contact.jpg';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <Layout>
      {/* Hero */}
      <PageHero
        title="Contact Us"
        description="Ready to explore partnership opportunities? We'd love to hear from you."
        backgroundImage={heroContact}
      />

      {/* Contact Section */}
      <section id="contact-form" className="section-padding bg-card">
        <div className="container-focus">
          <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
            {/* Contact Info */}
            <ScrollReveal>
              <div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-6">
                  Let's Start a Conversation
                </h2>
                <p className="text-muted-foreground mb-10 leading-relaxed">
                  Whether you're an investor, community leader, or healthcare professional, we're interested in exploring how we can work together to build better healthcare infrastructure.
                </p>

                <div className="space-y-6 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail size={22} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a href="mailto:info@getfocushealth.com" className="font-medium hover:text-primary transition-colors">
                        info@getfocushealth.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin size={22} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">Texas, USA</p>
                    </div>
                  </div>

                </div>

                {/* Google Calendar Scheduling */}
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Calendar size={20} className="text-accent" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg">Schedule a Call</h3>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-border">
                    <iframe 
                      src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XACH-PNq5Nr3upP1QMqeWgEBihqud5N2lESMAMo8UCUxCP7wKAOxpBagtmKR8o3pERE3RwsTO?gv=true" 
                      style={{ border: 0 }} 
                      width="100%" 
                      height="500" 
                      frameBorder="0"
                      title="Schedule a meeting"
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Form */}
            <ScrollReveal direction="left">
              {isSubmitted ? (
                <div className="bg-background rounded-2xl p-8 border border-border text-center h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-green-600" />
                  </div>
                  <h3 className="font-heading font-semibold text-2xl mb-3">Message Sent!</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Thank you for reaching out. We'll review your message and get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-background rounded-2xl p-8 border border-border shadow-lg">
                  <h3 className="font-heading font-semibold text-xl mb-6">Send a Message</h3>
                  <div className="space-y-5">
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
    </Layout>
  );
};

export default ContactPage;
