import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Leadership from "@/legacy-pages/Leadership";
import { WebPageStructuredData } from "@/components/seo/WebPageStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Leadership",
  description:
    "Meet Focus Health's experienced leadership team managing $100M+ in healthcare revenue: proven operators of 24+ facilities with expertise in emergency care infrastructure development and operations.",
  canonicalUrl: "/leadership"
});

export default function LeadershipPage() {
  return (
    <>
      <WebPageStructuredData
        path="/leadership"
        title="Leadership | Focus Health"
        description="Meet Focus Health's experienced leadership team managing $100M+ in healthcare revenue: proven operators of 24+ facilities with expertise in emergency care infrastructure development and operations."
      />
      <Leadership />
    </>
  );
}
