import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Platform from "@/legacy-pages/Platform";
import { WebPageStructuredData } from "@/components/seo/WebPageStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Platform",
  description:
    "Discover Focus Health's build, fund, and operate platform—an integrated solution for freestanding emergency room development with proven track record of success across 24+ healthcare locations.",
  canonicalUrl: "/platform"
});

export default function PlatformPage() {
  return (
    <>
      <WebPageStructuredData
        path="/platform"
        title="Platform | Focus Health"
        description="Discover Focus Health's build, fund, and operate platform—an integrated solution for freestanding emergency room development with proven track record of success across 24+ healthcare locations."
      />
      <Platform />
    </>
  );
}
