import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Platform from "@/legacy-pages/Platform";

export const metadata: Metadata = generateSEOMetadata({
  title: "Platform",
  description:
    "Explore the Focus Health platform for build, fund, and operate healthcare infrastructure execution.",
  canonicalUrl: "/platform"
});

export default function PlatformPage() {
  return <Platform />;
}
