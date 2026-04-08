import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Investors from "@/legacy-pages/Investors";
import { WebPageStructuredData } from "@/components/seo/WebPageStructuredData";
import Script from "next/script";
import { getFAQPageSchema, jsonLdScriptProps } from "@/lib/structuredData";

const investorFaqs = [
  { q: 'Who qualifies as an accredited investor?', a: 'Under SEC regulations, accredited investors include individuals with a net worth exceeding $1 million (excluding primary residence) or annual income exceeding $200,000 ($300,000 with a spouse) for the last two years. Qualified institutional buyers and entities with $5 million+ in assets also qualify.' },
  { q: 'What is the minimum investment to participate?', a: 'Minimum investment amounts vary by opportunity and deal structure. Typical minimums range from $250,000 to $500,000 per facility investment. We work with investors to find the right fit for their portfolio.' },
  { q: 'How is investor capital deployed?', a: 'Capital is deployed towards facility acquisition, build-out, equipment, licensing, and initial operating costs. Focus Health manages the end-to-end process—from site selection through grand opening—so investors benefit from a fully managed deployment timeline.' },
  { q: 'What returns can investors expect?', a: 'Historical returns vary by market and facility type. Freestanding ERs typically generate strong cash-on-cash returns driven by 24/7 patient volume and favourable reimbursement rates. Specific projections are shared under NDA during the due-diligence process.' },
  { q: 'How does Focus Health report to investors?', a: 'Investors receive quarterly financial reports, monthly operational dashboards, and annual performance summaries. Our investor relations team is available for ad-hoc questions and provides transparent, auditable documentation.' },
  { q: 'What is the typical holding period?', a: 'Most investments are structured with a 5–7 year holding horizon, though liquidity events can occur earlier depending on market conditions and portfolio strategy. Exit mechanisms include facility sale, recapitalisation, or portfolio roll-up.' },
  { q: 'How does Focus Health mitigate investment risk?', a: 'Our Build-Fund-Operate model reduces risk through proven site-selection analytics, conservative underwriting, diversified market positioning, and full operational control. Each facility is backed by licensed clinical teams and 24/7 management infrastructure.' },
  { q: 'How do I start the due-diligence process?', a: 'Join the waitlist above to request our investor deck. Our team will schedule an introductory call, share detailed financials under NDA, and guide you through the full due-diligence process.' },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Healthcare Infrastructure Investment | Invest in Texas ER Facilities",
  description:
    "Invest in freestanding emergency rooms with Focus Health. Explore our healthcare infrastructure investment platform, returns, and partnership structure.",
  canonicalUrl: "/investors",
  keywords: [
    "healthcare infrastructure investment",
    "invest in emergency rooms",
    "healthcare real estate investment",
    "ER investment returns",
    "freestanding ER investment Texas",
  ],
});

export default function InvestorsPage() {
  return (
    <>
      <WebPageStructuredData
        path="/investors"
        title="Healthcare Infrastructure Investment | Invest in Texas ER Facilities"
        description="Invest in freestanding emergency rooms with Focus Health. Explore our healthcare infrastructure investment platform, returns, and partnership structure."
      />
      <Script
        id="structured-data-faq-investors"
        strategy="beforeInteractive"
        {...jsonLdScriptProps(getFAQPageSchema(investorFaqs))}
      />
      <Investors />
    </>
  );
}
