import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import NapervilleWellnessClinic from "@/legacy-pages/facilities/NapervilleWellnessClinic";
import { FacilityStructuredData } from "@/components/seo/FacilityStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Naperville Wellness Clinic",
  description:
    "View services and operations for Naperville Wellness Clinic under Focus Health management.",
  canonicalUrl: "/facilities/naperville-wellness-clinic",
  keywords: ["Naperville Wellness Clinic", "wellness clinic Naperville IL", "primary care Naperville", "Focus Health clinic"],
});

export default function NapervilleWellnessClinicPage() {
  return (
    <>
      <FacilityStructuredData
        path="/facilities/naperville-wellness-clinic"
        name="Naperville Health & Wellness Clinic"
        description="Primary care and wellness clinic in Naperville, IL operated by Focus Health, serving Aurora, Wheaton, Lisle, Bolingbrook, and DuPage County."
        facilityType="MedicalClinic"
        city="Naperville"
        state="IL"
        serviceArea={["Naperville", "Aurora", "Wheaton", "Lisle", "Bolingbrook", "Plainfield", "Oswego", "Downers Grove", "Woodridge", "DuPage County"]}
      />
      <NapervilleWellnessClinic />
    </>
  );
}
