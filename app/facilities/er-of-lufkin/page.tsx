import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import ERofLufkin from "@/legacy-pages/facilities/ERofLufkin";
import { FacilityStructuredData } from "@/components/seo/FacilityStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "ER of Lufkin | 24/7 Emergency Room in Lufkin, TX",
  description:
    "24/7 freestanding emergency room at 501 N Brentwood Dr, Lufkin, TX 75904. Board-certified ER physicians, on-site CT scan, X-ray, lab & pharmacy. Minimal wait times serving Angelina County, Nacogdoches & East Texas.",
  canonicalUrl: "/facilities/er-of-lufkin",
  ogImage: "/facility-er-lufkin-real.png",
  keywords: [
    "ER of Lufkin", "Lufkin emergency room", "24/7 ER Lufkin TX",
    "freestanding ER East Texas", "emergency room Lufkin Texas",
    "ER Angelina County", "501 N Brentwood Dr Lufkin",
    "urgent care Lufkin TX", "ER open 24 hours Lufkin",
    "Nacogdoches emergency room", "East Texas ER",
  ],
});

export default function ERofLufkinPage() {
  return (
    <>
      <FacilityStructuredData
        path="/facilities/er-of-lufkin"
        name="ER of Lufkin"
        description="24/7 freestanding emergency room in Lufkin, TX serving Nacogdoches, Livingston, Jasper, and surrounding East Texas communities."
        facilityType="EmergencyService"
        streetAddress="501 N Brentwood Dr"
        city="Lufkin"
        state="TX"
        zip="75904"
        latitude={31.3368}
        longitude={-94.7218}
        openingHours="Mo-Su 00:00-23:59"
        serviceArea={["Lufkin", "Nacogdoches", "Livingston", "Jasper", "Crockett", "Center", "Diboll", "Hudson", "Huntington", "Angelina County"]}
      />
      <ERofLufkin />
    </>
  );
}
