import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Partners from "@/legacy-pages/Partners";
import { WebPageStructuredData } from "@/components/seo/WebPageStructuredData";
import Script from "next/script";
import { getFAQPageSchema, jsonLdScriptProps } from "@/lib/structuredData";

const partnerFaqs = [
  { q: 'How much capital is required to own a freestanding ER?', a: 'Investment levels vary based on the partnership model. Turn-key ownership typically requires $250,000–$5,000,000+ in cash available to invest, depending on the market and facility scope. Financing options are available.' },
  { q: 'Do I need to be a physician to partner with Focus Health?', a: 'No. Focus Health works with both physician-partners and non-physician investors. We offer distinct partnership tracks for each, with dedicated operational and clinical support.' },
  { q: 'What partnership models does Focus Health offer?', a: 'We offer two primary models: Turn-Key ER Ownership, where you purchase a fully operational facility, and Management Support, where you own the location with comprehensive management and operational backing from Focus Health.' },
  { q: 'How long does it take to open a new freestanding ER?', a: 'From site selection to grand opening, our proven process typically takes 90–120 days for facility build-out and launch. Exact timelines depend on permitting, construction scope, and local regulations.' },
  { q: 'What markets does Focus Health operate in?', a: 'We currently operate facilities in Irving TX, Lufkin TX, and Dallas TX, with a wellness clinic in Naperville IL. Our expansion pipeline targets the DFW metroplex, Houston suburbs, and the Austin–San Antonio corridor.' },
  { q: 'What support does Focus Health provide after opening?', a: 'Our management support model includes 24/7 clinical operations, staff recruitment and training, compliance and licensing, revenue cycle management, and continuous performance optimisation.' },
  { q: 'How do I get started?', a: 'Fill out the investment enquiry form on this page, or contact us directly at info@getfocushealth.com. Our team will reach out to discuss opportunities that match your investment goals and involvement preferences.' },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Healthcare Investment Opportunities | Partner With Focus Health",
  description:
    "Partner with Focus Health to build, fund, or operate freestanding emergency rooms in Texas. Turn-key ER ownership and management support models available.",
  canonicalUrl: "/partners",
  keywords: [
    "healthcare investment opportunity",
    "freestanding ER franchise",
    "ER ownership opportunity",
    "healthcare partnership",
  ],
});

export default function PartnersPage() {
  return (
    <>
      <WebPageStructuredData
        path="/partners"
        title="Healthcare Investment Opportunities | Partner With Focus Health"
        description="Partner with Focus Health to build, fund, or operate freestanding emergency rooms in Texas. Turn-key ER ownership and management support models available."
      />
      <Script
        id="structured-data-faq-partners"
        strategy="beforeInteractive"
        {...jsonLdScriptProps(getFAQPageSchema(partnerFaqs))}
      />
      <Partners />
    </>
  );
}
