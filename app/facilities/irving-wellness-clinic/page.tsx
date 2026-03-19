import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import IrvingWellnessClinic from "@/legacy-pages/facilities/IrvingWellnessClinic";

export const metadata: Metadata = generateSEOMetadata({
  title: "Irving Wellness Clinic",
  description:
    "View services and operations for Irving Wellness Clinic under Focus Health management.",
  canonicalUrl: "/facilities/irving-wellness-clinic"
});

export default function IrvingWellnessClinicPage() {
  return <IrvingWellnessClinic />;
}
