import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Leadership from "@/legacy-pages/Leadership";
import { WebPageStructuredData } from "@/components/seo/WebPageStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Leadership Team | Healthcare Infrastructure Experts | Focus Health",
  description:
    "Meet the Focus Health leadership team with 65+ years of combined experience in healthcare infrastructure, operations, and investment.",
  canonicalUrl: "/leadership",
  keywords: [
    "Focus Health leadership",
    "healthcare infrastructure team",
    "ER operations leadership",
    "healthcare management team",
  ],
});

export default function LeadershipPage() {
  return (
    <>
      <WebPageStructuredData
        path="/leadership"
        title="Leadership Team | Healthcare Infrastructure Experts | Focus Health"
        description="Meet the Focus Health leadership team with 65+ years of combined experience in healthcare infrastructure, operations, and investment."
      />
      <Leadership />
    </>
  );
}
