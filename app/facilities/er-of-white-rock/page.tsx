import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import ERofWhiteRock from "@/legacy-pages/facilities/ERofWhiteRock";
import { FacilityStructuredData } from "@/components/seo/FacilityStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "ER of White Rock | 24/7 Emergency Room in Dallas, TX",
  description:
    "24/7 freestanding emergency room at 10705 Northwest Hwy, Dallas, TX 75238. Board-certified emergency physicians, advanced CT scan, X-ray & lab. Minimal wait times serving White Rock Lake, Lakewood, Casa Linda & East Dallas.",
  canonicalUrl: "/facilities/er-of-white-rock",
  ogImage: "/facility-er-whiterock.png",
  keywords: [
    "ER of White Rock", "White Rock emergency room", "24/7 ER Dallas TX",
    "freestanding ER East Dallas", "emergency room White Rock Lake",
    "ER near Lakewood Dallas", "10705 Northwest Hwy Dallas",
    "urgent care Dallas TX 75238", "ER open 24 hours Dallas",
    "Casa Linda emergency room", "Lake Highlands ER",
  ],
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
