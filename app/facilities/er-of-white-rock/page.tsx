import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import ERofWhiteRock from "@/legacy-pages/facilities/ERofWhiteRock";
import { FacilityStructuredData } from "@/components/seo/FacilityStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "ER of White Rock",
  description:
    "Explore ER of White Rock emergency services and local care delivery metrics.",
  canonicalUrl: "/facilities/er-of-white-rock",
  keywords: ["ER of White Rock", "White Rock emergency room", "24/7 ER Dallas TX", "freestanding ER East Dallas"],
});

export default function ERofWhiteRockPage() {
  return (
    <>
      <FacilityStructuredData
        path="/facilities/er-of-white-rock"
        name="ER of White Rock"
        description="24/7 freestanding emergency room near White Rock Lake in Dallas, TX serving Lakewood, Casa Linda, Lake Highlands, and East Dallas."
        facilityType="EmergencyService"
        streetAddress="10705 Northwest Hwy"
        city="Dallas"
        state="TX"
        zip="75238"
        latitude={32.8747}
        longitude={-96.7199}
        openingHours="Mo-Su 00:00-23:59"
        serviceArea={["Dallas", "White Rock Lake", "Lakewood", "Casa Linda", "Lake Highlands", "East Dallas", "Garland", "Mesquite", "Richardson", "Rowlett"]}
      />
      <ERofWhiteRock />
    </>
  );
}
