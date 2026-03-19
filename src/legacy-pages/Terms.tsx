"use client";

import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { PageHero } from '@/components/ui/PageHero';
const heroLegal = "/hero-legal.jpg";

const Terms = () => {
  return (
    <>
      {/* Hero */}
      <PageHero
        title="Terms of Service"
        description="Please read these terms carefully before using our website and services."
        backgroundImage={heroLegal}
      />

      {/* Content */}
      <section className="section-padding">
        <div className="container-focus">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <ScrollReveal>
              <div className="space-y-8">
                <p className="text-muted-foreground text-sm">Effective Date: January 1, 2026</p>

                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing or using the Site, you agree to these Terms of Service ("Terms") and acknowledge our Privacy Policy.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">2. Use of the Site</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You may use the Site only for lawful purposes and in accordance with these Terms.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">3. User Obligations</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Violate any applicable laws;</li>
                    <li>Upload malicious code;</li>
                    <li>Misrepresent your identity;</li>
                    <li>Harvest data from the Site.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">4. Intellectual Property</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All Site content is the property of Focus Health or its licensors and is protected by copyright and other intellectual property laws.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">5. Disclaimers</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The Site and content are provided "as is" without warranties of any kind. Focus Health does not provide medical advice through the Site.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">6. Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To the maximum extent permitted by law, Focus Health and its partners are not liable for any damages arising out of your use of the Site.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">7. Indemnification</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You agree to indemnify and hold harmless Focus Health from claims arising out of your use of the Site.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">8. Governing Law</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms are governed by the laws of the State of Texas, USA.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">9. Changes to Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may modify these Terms at any time, and continued use constitutes acceptance.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">10. Contact Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For questions about these Terms, contact us at:
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
    </>
);
};

export default Terms;
