import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import IrvingWellnessClinic from "@/legacy-pages/facilities/IrvingWellnessClinic";
import { FacilityStructuredData } from "@/components/seo/FacilityStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Irving Wellness Clinic",
  description:
    "View services and operations for Irving Wellness Clinic under Focus Health management.",
  canonicalUrl: "/facilities/irving-wellness-clinic",
  keywords: ["Irving Wellness Clinic", "wellness clinic Irving TX", "primary care Irving", "Focus Health clinic"],
});

export default function IrvingWellnessClinicPage() {
  return (
    <>
      <FacilityStructuredData
        path="/facilities/irving-wellness-clinic"
        name="Irving Health & Wellness Clinic"
        description="Primary care and wellness clinic in Irving, TX operated by Focus Health, serving Las Colinas, Valley Ranch, Coppell, and surrounding communities."
        facilityType="MedicalClinic"
        city="Irving"
        state="TX"
        serviceArea={["Irving", "Las Colinas", "Valley Ranch", "Coppell", "Grapevine", "Euless", "Bedford", "Grand Prairie", "Arlington", "Dallas"]}
      />
      <IrvingWellnessClinic />
    </>
  );
}
