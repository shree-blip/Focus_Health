import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Market from "@/legacy-pages/Market";
import { WebPageStructuredData } from "@/components/seo/WebPageStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Texas Healthcare Market Opportunity | Freestanding ER Expansion | Focus Health",
  description:
    "Explore the $38B Texas freestanding ER market. Focus Health targets high-growth corridors in DFW, Houston, and Austin\u2013San Antonio.",
  canonicalUrl: "/market",
  keywords: [
    "Texas freestanding ER market",
    "healthcare market opportunity Texas",
    "freestanding emergency room expansion",
    "DFW healthcare market",
  ],
});

export default function MarketPage() {
  return (
    <>
      <WebPageStructuredData
        path="/market"
        title="Texas Healthcare Market Opportunity | Freestanding ER Expansion | Focus Health"
        description="Explore the $38B Texas freestanding ER market. Focus Health targets high-growth corridors in DFW, Houston, and Austin\u2013San Antonio."
      />
      <Market />
    </>
  );
}
