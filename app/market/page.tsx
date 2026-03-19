import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Market from "@/legacy-pages/Market";
import { WebPageStructuredData } from "@/components/seo/WebPageStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Market",
  description:
    "Explore Texas's freestanding emergency room market opportunity: rapid population growth, geographic gaps, and proven demand for accessible emergency care infrastructure investment.",
  canonicalUrl: "/market"
});

export default function MarketPage() {
  return (
    <>
      <WebPageStructuredData
        path="/market"
        title="Market | Focus Health"
        description="Explore Texas's freestanding emergency room market opportunity: rapid population growth, geographic gaps, and proven demand for accessible emergency care infrastructure investment."
      />
      <Market />
    </>
  );
}
