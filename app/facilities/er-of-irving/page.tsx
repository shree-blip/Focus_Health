import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import ERofIrving from "@/legacy-pages/facilities/ERofIrving";
import { FacilityStructuredData } from "@/components/seo/FacilityStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "ER of Irving",
  description:
    "Explore ER of Irving performance, patient services, and community impact delivered by Focus Health.",
  canonicalUrl: "/facilities/er-of-irving",
  keywords: ["ER of Irving", "Irving emergency room", "24/7 ER Irving TX", "freestanding ER Las Colinas"],
});

export default function ERofIrvingPage() {
  return (
    <>
      <FacilityStructuredData
        path="/facilities/er-of-irving"
        name="ER of Irving"
        description="24/7 freestanding emergency room in Irving, TX serving Las Colinas, Valley Ranch, Coppell, and surrounding communities."
        facilityType="EmergencyService"
        streetAddress="7600 N MacArthur Blvd"
        city="Irving"
        state="TX"
        zip="75063"
        latitude={32.9137}
        longitude={-96.9584}
        openingHours="Mo-Su 00:00-23:59"
        serviceArea={["Irving", "Las Colinas", "Valley Ranch", "Coppell", "Grapevine", "Euless", "Bedford", "Grand Prairie", "Arlington", "Dallas"]}
      />
      <ERofIrving />
    </>
  );
}
