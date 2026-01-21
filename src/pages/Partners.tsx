import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Users, CheckCircle, Send, ArrowRight, Phone } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const investorBenefits = [
  'Disciplined operations with standardized playbook',
  'Transparent reporting and regular updates',
  'Scalable platform with proven processes',
  'Experienced operator with 24+ locations managed',
  'Focus on high-growth Texas markets',
];

const communityBenefits = [
  'Partnership-first approach to site development',
  'Strategic site planning for optimal community access',
  'Comprehensive operational management',
  '24/7 emergency services for your community',
  'Long-term commitment to local healthcare needs',
];

const PartnersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'investors' | 'communities'>('investors');
  const [investorForm, setInvestorForm] = useState({ name: '', firm: '', email: '', phone: '' });
  const [communityForm, setCommunityForm] = useState({ name: '', organization: '', email: '', message: '' });
  const [investorSubmitted, setInvestorSubmitted] = useState(false);
  const [communitySubmitted, setCommunitySubmitted] = useState(false);
  const [isSubmittingInvestor, setIsSubmittingInvestor] = useState(false);
  const [isSubmittingCommunity, setIsSubmittingCommunity] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'communities') {
      setActiveTab('communities');
    } else {
      setActiveTab('investors');
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'investors' | 'communities') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleInvestorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInvestor(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-investor-request', {
        body: investorForm,
      });

      if (error) {
        throw error;
      }

      console.log('Investor request sent:', data);
      setInvestorSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "We'll send the investor deck to your email shortly.",
      });
    } catch (error: any) {
      console.error('Error submitting investor request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingInvestor(false);
    }
  };

  const handleCommunitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCommunity(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-community-request', {
        body: communityForm,
      });

      if (error) {
        throw error;
      }

      console.log('Community request sent:', data);
      setCommunitySubmitted(true);
      toast({
        title: "Message Sent",
        description: "We'll be in touch soon to discuss partnership opportunities.",
      });
    } catch (error: any) {
      console.error('Error submitting community request:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingCommunity(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="section-padding bg-hero-pattern">
        <div className="container-focus">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              Partnership Opportunities
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6"
            >
              Partner With <span className="text-gradient-blue">Focus</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              Whether you're an investor seeking healthcare infrastructure opportunities or a community looking for emergency care solutions, we're here to partner.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="section-padding bg-card">
        <div className="container-focus">
          {/* Tab Headers */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-muted rounded-xl p-1.5">
              {[
                { id: 'investors', label: 'For Investors', icon: Building2 },
                { id: 'communities', label: 'For Communities', icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as 'investors' | 'communities')}
                  className={`relative flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-card text-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-5xl mx-auto">
            {activeTab === 'investors' ? (
              <motion.div
                key="investors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-12"
              >
                {/* Benefits */}
                <ScrollReveal>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-6">
                      Investment Opportunity
                    </h2>
                    <p className="text-muted-foreground mb-8 leading-relaxed">
                      Partner with an experienced operator to access high-growth Texas healthcare infrastructure opportunities. We bring disciplined operations and transparent reporting to every project.
                    </p>
                    <ul className="space-y-4">
                      {investorBenefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3">
                          <CheckCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>

                {/* Form */}
                <ScrollReveal direction="left">
                  {investorSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-background rounded-2xl p-8 border border-border text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-600" />
                      </div>
                      <h3 className="font-heading font-semibold text-xl mb-2">Request Received</h3>
                      <p className="text-muted-foreground">
                        We'll send the investor deck to your email shortly.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleInvestorSubmit} className="bg-background rounded-2xl p-8 border border-border">
                      <h3 className="font-heading font-semibold text-xl mb-6">Request Investor Deck</h3>
                      <div className="space-y-5">
                        <div>
                          <label htmlFor="inv-name" className="block text-sm font-medium mb-2">Full Name</label>
                          <Input
                            id="inv-name"
                            type="text"
                            placeholder="John Smith"
                            value={investorForm.name}
                            onChange={(e) => setInvestorForm({ ...investorForm, name: e.target.value })}
                            required
                            className="h-12"
                          />
                        </div>
                        <div>
                          <label htmlFor="inv-firm" className="block text-sm font-medium mb-2">Firm / Organization</label>
                          <Input
                            id="inv-firm"
                            type="text"
                            placeholder="Capital Partners LLC"
                            value={investorForm.firm}
                            onChange={(e) => setInvestorForm({ ...investorForm, firm: e.target.value })}
                            required
                            className="h-12"
                          />
                        </div>
                        <div>
                          <label htmlFor="inv-email" className="block text-sm font-medium mb-2">Email Address</label>
                          <Input
                            id="inv-email"
                            type="email"
                            placeholder="john@capitalpartners.com"
                            value={investorForm.email}
                            onChange={(e) => setInvestorForm({ ...investorForm, email: e.target.value })}
                            required
                            className="h-12"
                          />
                        </div>
                        <div>
                          <label htmlFor="inv-phone" className="block text-sm font-medium mb-2">Phone Number</label>
                          <Input
                            id="inv-phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={investorForm.phone}
                            onChange={(e) => setInvestorForm({ ...investorForm, phone: e.target.value })}
                            required
                            className="h-12"
                          />
                        </div>
                        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmittingInvestor}>
                          {isSubmittingInvestor ? 'Submitting...' : 'Request Deck'}
                          <Send size={18} className="ml-2" />
                        </Button>
                      </div>
                    </form>
                  )}
                </ScrollReveal>
              </motion.div>
            ) : (
              <motion.div
                key="communities"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-12"
              >
                {/* Benefits */}
                <ScrollReveal>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-6">
                      Community Partnership
                    </h2>
                    <p className="text-muted-foreground mb-8 leading-relaxed">
                      Bring high-quality emergency care to your community. We partner with local stakeholders to develop and operate freestanding ERs that serve community needs.
                    </p>
                    <ul className="space-y-4">
                      {communityBenefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3">
                          <CheckCircle size={20} className="text-accent flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>

                {/* Form */}
                <ScrollReveal direction="left">
                  {communitySubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-background rounded-2xl p-8 border border-border text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-600" />
                      </div>
                      <h3 className="font-heading font-semibold text-xl mb-2">Message Sent</h3>
                      <p className="text-muted-foreground">
                        We'll be in touch soon to discuss partnership opportunities.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleCommunitySubmit} className="bg-background rounded-2xl p-8 border border-border">
                      <h3 className="font-heading font-semibold text-xl mb-6">Start a Conversation</h3>
                      <div className="space-y-5">
                        <div>
                          <label htmlFor="com-name" className="block text-sm font-medium mb-2">Full Name</label>
                          <Input
                            id="com-name"
                            type="text"
                            placeholder="Jane Doe"
                            value={communityForm.name}
                            onChange={(e) => setCommunityForm({ ...communityForm, name: e.target.value })}
                            required
                            className="h-12"
                          />
                        </div>
                        <div>
                          <label htmlFor="com-org" className="block text-sm font-medium mb-2">Organization</label>
                          <Input
                            id="com-org"
                            type="text"
                            placeholder="City of Anytown"
                            value={communityForm.organization}
                            onChange={(e) => setCommunityForm({ ...communityForm, organization: e.target.value })}
                            required
                            className="h-12"
                          />
                        </div>
                        <div>
                          <label htmlFor="com-email" className="block text-sm font-medium mb-2">Email Address</label>
                          <Input
                            id="com-email"
                            type="email"
                            placeholder="jane@anytown.gov"
                            value={communityForm.email}
                            onChange={(e) => setCommunityForm({ ...communityForm, email: e.target.value })}
                            required
                            className="h-12"
                          />
                        </div>
                        <div>
                          <label htmlFor="com-message" className="block text-sm font-medium mb-2">Message (Optional)</label>
                          <Textarea
                            id="com-message"
                            placeholder="Tell us about your community's healthcare needs..."
                            value={communityForm.message}
                            onChange={(e) => setCommunityForm({ ...communityForm, message: e.target.value })}
                            rows={4}
                          />
                        </div>
                        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isSubmittingCommunity}>
                          {isSubmittingCommunity ? 'Sending...' : 'Send Message'}
                          <ArrowRight size={18} className="ml-2" />
                        </Button>
                      </div>
                    </form>
                  )}
                </ScrollReveal>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PartnersPage;
