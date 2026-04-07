import type { Metadata } from "next";
import Script from "next/script";
import { generateSEOMetadata } from "@/lib/metadata";
import Contact from "@/legacy-pages/Contact";
import { getContactPageSchema, jsonLdScriptProps } from "@/lib/structuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Contact Focus Health | Headquarters in Irving, Texas",
  description:
    "Reach Focus Health at our Irving, Texas headquarters. Contact us for healthcare partnership, investment, or general enquiries.",
  canonicalUrl: "/contact",
  keywords: [
    "contact Focus Health",
    "Focus Health headquarters",
    "healthcare company contact Irving Texas",
  ],
});

export default function ContactPage() {
  return (
    <>
      <Script
        id="structured-data-contact"
        strategy="beforeInteractive"
        {...jsonLdScriptProps(
          getContactPageSchema({
            path: "/contact",
            title: "Contact Focus Health | Headquarters in Irving, Texas",
            description: "Reach Focus Health at our Irving, Texas headquarters. Contact us for healthcare partnership, investment, or general enquiries.",
          })
        )}
      />
      <Contact />
    </>
  );
}
