import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import NapervilleWellnessClinic from "@/legacy-pages/facilities/NapervilleWellnessClinic";

export const metadata: Metadata = generateSEOMetadata({
  title: "Naperville Wellness Clinic",
  description:
    "View services and operations for Naperville Wellness Clinic under Focus Health management.",
  canonicalUrl: "/facilities/naperville-wellness-clinic"
});

export default function NapervilleWellnessClinicPage() {
  return <NapervilleWellnessClinic />;
}
