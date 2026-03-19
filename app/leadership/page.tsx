import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Leadership from "@/legacy-pages/Leadership";

export const metadata: Metadata = generateSEOMetadata({
  title: "Leadership",
  description:
    "Meet the Focus Health leadership team guiding growth in emergency care infrastructure.",
  canonicalUrl: "/leadership"
});

export default function LeadershipPage() {
  return <Leadership />;
}
