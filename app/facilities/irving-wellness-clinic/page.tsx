import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import IrvingWellnessClinic from "@/legacy-pages/facilities/IrvingWellnessClinic";
import { FacilityStructuredData } from "@/components/seo/FacilityStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Irving Health & Wellness Clinic | Irving, TX",
  description:
    "Premier wellness clinic at 8200 N MacArthur Blvd Suite 100, Irving, TX 75063. Medical weight loss, hormone replacement therapy, IV hydration, aesthetic services & advanced body contouring. Serving Las Colinas, Valley Ranch & DFW.",
  canonicalUrl: "/facilities/irving-wellness-clinic",
  ogImage: "/irving-wellness-1.jpg",
  keywords: [
    "Irving Health Wellness Clinic", "wellness clinic Irving TX",
    "medical weight loss Irving", "hormone therapy Irving TX",
    "IV hydration Irving", "aesthetic clinic Las Colinas",
    "8200 N MacArthur Blvd Suite 100 Irving",
    "body contouring Irving TX", "wellness clinic Las Colinas",
    "Focus Health wellness Irving",
  ],
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
