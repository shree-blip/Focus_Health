import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import OurProcess from "@/legacy-pages/OurProcess";
import { WebPageStructuredData } from "@/components/seo/WebPageStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Our Process",
  description:
    "Learn how Focus Health executes site selection, development, launch, and ongoing operations.",
  canonicalUrl: "/our-process"
});

export default function OurProcessPage() {
  return (
    <>
      <WebPageStructuredData
        path="/our-process"
        title="Our Process | Focus Health"
        description="Learn how Focus Health executes site selection, development, launch, and ongoing operations."
      />
      <OurProcess />
    </>
  );
}
