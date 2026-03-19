import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Market from "@/legacy-pages/Market";

export const metadata: Metadata = generateSEOMetadata({
  title: "Market",
  description:
    "See the Texas emergency care market opportunity and Focus Health expansion thesis.",
  canonicalUrl: "/market"
});

export default function MarketPage() {
  return <Market />;
}
