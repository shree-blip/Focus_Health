import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Investors from "@/legacy-pages/Investors";
import { WebPageStructuredData } from "@/components/seo/WebPageStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Investors",
  description:
    "Discover Focus Health investor opportunities in scalable healthcare infrastructure assets.",
  canonicalUrl: "/investors"
});

export default function InvestorsPage() {
  return (
    <>
      <WebPageStructuredData
        path="/investors"
        title="Investors | Focus Health"
        description="Discover Focus Health investor opportunities in scalable healthcare infrastructure assets."
      />
      <Investors />
    </>
  );
}
