import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Partners from "@/legacy-pages/Partners";
import { WebPageStructuredData } from "@/components/seo/WebPageStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Partners",
  description:
    "Partner with Focus Health for healthcare infrastructure investment: investor opportunities, operator partnerships, and turnkey freestanding emergency room solutions backed by proven track record.",
  canonicalUrl: "/partners"
});

export default function PartnersPage() {
  return (
    <>
      <WebPageStructuredData
        path="/partners"
        title="Partners | Focus Health"
        description="Partner with Focus Health for healthcare infrastructure investment: investor opportunities, operator partnerships, and turnkey freestanding emergency room solutions backed by proven track record."
      />
      <Partners />
    </>
  );
}
