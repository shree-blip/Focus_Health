import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Privacy from "@/legacy-pages/Privacy";

export const metadata: Metadata = generateSEOMetadata({
  title: "Privacy Policy",
  description:
    "Review Focus Health privacy policy and how personal information is handled.",
  canonicalUrl: "/privacy",
  noIndex: true
});

export default function PrivacyPage() {
  return <Privacy />;
}
