import type { Metadata } from "next";
import Script from "next/script";
import { generateSEOMetadata } from "@/lib/metadata";
import OurProcess from "@/legacy-pages/OurProcess";
import { WebPageStructuredData } from "@/components/seo/WebPageStructuredData";
import { getHowToSchema, jsonLdScriptProps } from "@/lib/structuredData";

const howToSteps = [
  {
    name: "Market Research & Site Selection",
    text: "Focus Health analyses population growth, healthcare access gaps, payer-mix dynamics, and competitive landscape to identify high-potential corridors for freestanding ER development.",
  },
  {
    name: "Financial Structuring & Capital Deployment",
    text: "Detailed pro-formas are developed, partnership structures are defined, and capital is deployed against verified development milestones with full investor transparency.",
  },
  {
    name: "Facility Design & Construction",
    text: "Purpose-built facility designs are executed with efficient floor plans, on-site CT, X-ray, ultrasound, in-house lab, and pharmacy capabilities — typically completed within 90\u2013120 days.",
  },
  {
    name: "Licensing, Staffing & Operational Readiness",
    text: "State FSER licensing, CLIA lab certification, DEA registration, clinical staff recruitment, credentialling, training, and simulation-based readiness testing are completed before opening.",
  },
  {
    name: "Grand Opening & Ongoing Operations",
    text: "The facility launches with 24/7 clinical operations, revenue cycle management, quality assurance, and continuous performance monitoring under Focus Health\u2019s management infrastructure.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Our Process | From Site Selection to Grand Opening | Focus Health",
  description:
    "Learn how Focus Health takes a freestanding ER from site selection through construction, staffing, and operational launch in 90\u2013120 days.",
  canonicalUrl: "/our-process",
  keywords: [
    "freestanding ER development process",
    "healthcare facility build process",
    "ER site selection to opening",
  ],
});

export default function OurProcessPage() {
  return (
    <>
      <WebPageStructuredData
        path="/our-process"
        title="Our Process | From Site Selection to Grand Opening | Focus Health"
        description="Learn how Focus Health takes a freestanding ER from site selection through construction, staffing, and operational launch in 90\u2013120 days."
      />
      <Script
        id="structured-data-howto-process"
        strategy="beforeInteractive"
        {...jsonLdScriptProps(
          getHowToSchema({
            name: "How to Build and Launch a Freestanding Emergency Room",
            description: "Focus Health\u2019s proven five-step process takes a freestanding ER from market research through grand opening and ongoing 24/7 clinical operations.",
            totalTime: "P120D",
            steps: howToSteps,
          })
        )}
      />
      <OurProcess />
    </>
  );
}
