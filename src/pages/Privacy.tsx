import { Layout } from '@/components/layout/Layout';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const Privacy = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="section-padding bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container-focus">
            <ScrollReveal>
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="heading-1 mb-6">Privacy Policy</h1>
                <p className="text-muted-foreground">Effective Date: January 1, 2026</p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Content */}
        <section className="section-padding">
          <div className="container-focus">
            <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
              <ScrollReveal>
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">1. Introduction</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      This Privacy Policy explains how Focus Health ("we," "us," or "our") collects, uses, discloses, and protects the personal information you provide on https://getfocushealth.com/ (the "Site"). Your use of the Site constitutes acceptance of this Privacy Policy.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">2. Information We Collect</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">We may collect:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li><strong className="text-foreground">Personal Information:</strong> name, email address, phone number, mailing address, and other contact information when you sign up for newsletters or join the waitlist.</li>
                      <li><strong className="text-foreground">Technical Data:</strong> IP address, browser type, device information, and usage statistics collected automatically via cookies or similar technologies.</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">3. How We Use Your Information</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">We may use your information to:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Operate, maintain, and improve the Site;</li>
                      <li>Respond to your requests or inquiries;</li>
                      <li>Communicate about our services, updates, and marketing (with your consent where required by law);</li>
                      <li>Comply with legal obligations.</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">4. Cookies & Tracking</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We may use cookies and similar tracking technologies to enhance user experience and analyze Site usage. You can manage cookie settings through your browser controls.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">5. Information Sharing</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We do not sell your personal information. We may share information with:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Service providers who assist with Site operations;</li>
                      <li>Legal authorities if required by law;</li>
                      <li>Affiliates in connection with a merger or sale of assets.</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">6. Security</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We implement reasonable safeguards to protect your information, but no system is 100% secure.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">7. Your Rights</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Depending on your location, you may have rights to access, correct, delete, or restrict the use of your personal information (e.g., under CCPA or GDPR).
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">8. Children's Privacy</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      The Site is not intended for users under the age of 13.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">9. Changes to This Policy</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We may update this Privacy Policy at any time. The updated version will be posted with a revised effective date.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">10. Contact Information</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      If you have questions about this Privacy Policy, contact us at:
                    </p>
                    <p className="text-foreground font-medium mt-2">
                      Email: <a href="mailto:info@getfocushealth.com" className="text-primary hover:underline">info@getfocushealth.com</a>
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Privacy;
