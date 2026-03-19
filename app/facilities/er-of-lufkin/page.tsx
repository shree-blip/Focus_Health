import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import ERofLufkin from "@/legacy-pages/facilities/ERofLufkin";

export const metadata: Metadata = generateSEOMetadata({
  title: "ER of Lufkin",
  description:
    "Explore ER of Lufkin services, operations, and healthcare delivery outcomes.",
  canonicalUrl: "/facilities/er-of-lufkin"
});

export default function ERofLufkinPage() {
  return <ERofLufkin />;
}
