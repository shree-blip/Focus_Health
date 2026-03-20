import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import ERofLufkin from "@/legacy-pages/facilities/ERofLufkin";
import { FacilityStructuredData } from "@/components/seo/FacilityStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "ER of Lufkin",
  description:
    "Explore ER of Lufkin services, operations, and healthcare delivery outcomes.",
  canonicalUrl: "/facilities/er-of-lufkin",
  keywords: ["ER of Lufkin", "Lufkin emergency room", "24/7 ER Lufkin TX", "freestanding ER East Texas"],
});

export default function ERofLufkinPage() {
  return (
    <>
      <FacilityStructuredData
        path="/facilities/er-of-lufkin"
        name="ER of Lufkin"
        description="24/7 freestanding emergency room in Lufkin, TX serving Nacogdoches, Livingston, Jasper, and surrounding East Texas communities."
        facilityType="EmergencyService"
        streetAddress="4633 S Medford Dr"
        city="Lufkin"
        state="TX"
        zip="75901"
        latitude={31.3168}
        longitude={-94.7291}
        openingHours="Mo-Su 00:00-23:59"
        serviceArea={["Lufkin", "Nacogdoches", "Livingston", "Jasper", "Crockett", "Center", "Diboll", "Hudson", "Huntington", "Angelina County"]}
      />
      <ERofLufkin />
    </>
  );
}
