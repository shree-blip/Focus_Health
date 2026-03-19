import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Investors from "@/legacy-pages/Investors";

export const metadata: Metadata = generateSEOMetadata({
  title: "Investors",
  description:
    "Discover Focus Health investor opportunities in scalable healthcare infrastructure assets.",
  canonicalUrl: "/investors"
});

export default function InvestorsPage() {
  return <Investors />;
}
