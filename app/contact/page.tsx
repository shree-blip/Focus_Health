import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Contact from "@/legacy-pages/Contact";

export const metadata: Metadata = generateSEOMetadata({
  title: "Contact",
  description:
    "Connect with Focus Health about partnership opportunities, market expansion, and healthcare infrastructure development.",
  canonicalUrl: "/contact"
});

export default function ContactPage() {
  return <Contact />;
}
