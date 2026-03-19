import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import ERofIrving from "@/legacy-pages/facilities/ERofIrving";

export const metadata: Metadata = generateSEOMetadata({
  title: "ER of Irving",
  description:
    "Explore ER of Irving performance, patient services, and community impact delivered by Focus Health.",
  canonicalUrl: "/facilities/er-of-irving"
});

export default function ERofIrvingPage() {
  return <ERofIrving />;
}
