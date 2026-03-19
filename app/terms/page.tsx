import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Terms from "@/legacy-pages/Terms";

export const metadata: Metadata = generateSEOMetadata({
  title: "Terms of Service",
  description:
    "Read the terms of service for using Focus Health website and services.",
  canonicalUrl: "/terms",
  noIndex: true
});

export default function TermsPage() {
  return <Terms />;
}
