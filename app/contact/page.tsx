import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Contact from "@/legacy-pages/Contact";
import { WebPageStructuredData } from "@/components/seo/WebPageStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Contact",
  description:
    "Connect with Focus Health about partnership opportunities, market expansion, and healthcare infrastructure development.",
  canonicalUrl: "/contact"
});

export default function ContactPage() {
  return (
    <>
      <WebPageStructuredData
        path="/contact"
        title="Contact | Focus Health"
        description="Connect with Focus Health about partnership opportunities, market expansion, and healthcare infrastructure development."
      />
      <Contact />
    </>
  );
}
