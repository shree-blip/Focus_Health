import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import ERofWhiteRock from "@/legacy-pages/facilities/ERofWhiteRock";

export const metadata: Metadata = generateSEOMetadata({
  title: "ER of White Rock",
  description:
    "Explore ER of White Rock emergency services and local care delivery metrics.",
  canonicalUrl: "/facilities/er-of-white-rock"
});

export default function ERofWhiteRockPage() {
  return <ERofWhiteRock />;
}
