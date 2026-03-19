import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Index from "@/legacy-pages/Index";
import { WebPageStructuredData } from "@/components/seo/WebPageStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Focus Health | Build + Fund + Operate Healthcare Infrastructure",
  description:
    "Institutional-grade healthcare infrastructure made simple. Focus Health builds and operates high-performance freestanding emergency rooms across Texas.",
  canonicalUrl: "/",
  keywords: [
    "freestanding emergency room",
    "healthcare investment",
    "Texas ER",
    "healthcare infrastructure",
    "Focus Health"
  ]
});

export default function HomePage() {
  return (
    <>
      <WebPageStructuredData
        path="/"
        title="Focus Health | Build + Fund + Operate Healthcare Infrastructure"
        description="Institutional-grade healthcare infrastructure made simple. Focus Health builds and operates high-performance freestanding emergency rooms across Texas."
      />
      <Index />
    </>
  );
}
