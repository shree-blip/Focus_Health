import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Platform from "@/legacy-pages/Platform";
import { WebPageStructuredData } from "@/components/seo/WebPageStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Healthcare Infrastructure Platform | Build, Fund, Operate Model | Focus Health",
  description:
    "Discover how Focus Health's build-fund-operate platform delivers turn-key freestanding emergency rooms from site selection to operations.",
  canonicalUrl: "/platform",
  keywords: [
    "healthcare infrastructure platform",
    "build fund operate healthcare",
    "freestanding ER development platform",
    "turn-key emergency room",
  ],
});

export default function PlatformPage() {
  return (
    <>
      <WebPageStructuredData
        path="/platform"
        title="Healthcare Infrastructure Platform | Build, Fund, Operate Model | Focus Health"
        description="Discover how Focus Health's build-fund-operate platform delivers turn-key freestanding emergency rooms from site selection to operations."
      />
      <Platform />
    </>
  );
}
