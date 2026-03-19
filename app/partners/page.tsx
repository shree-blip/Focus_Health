import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Partners from "@/legacy-pages/Partners";

export const metadata: Metadata = generateSEOMetadata({
  title: "Partners",
  description:
    "Partner with Focus Health as an investor, physician, or community stakeholder.",
  canonicalUrl: "/partners"
});

export default function PartnersPage() {
  return <Partners />;
}
