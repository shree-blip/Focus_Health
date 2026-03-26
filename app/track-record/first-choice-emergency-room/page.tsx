import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import { FacilityStructuredData } from "@/components/seo/FacilityStructuredData";
import FirstChoiceERDetail from "@/legacy-pages/facilities/FirstChoiceERDetail";

export const metadata: Metadata = generateSEOMetadata({
  title: "First Choice Emergency Room | Houston, TX",
  description:
    "Explore the First Choice Emergency Room facility profile in Houston, Texas at 1717 Eldridge Pkwy. View services, location details, emergency-care capabilities, and portfolio highlights.",
  canonicalUrl: "/track-record/first-choice-emergency-room",
  keywords: [
    "First Choice Emergency Room",
    "1717 Eldridge Pkwy Houston TX 77077",
    "Houston emergency room",
    "freestanding emergency room Houston",
    "emergency care Eldridge Parkway",
    "track record facility profile",
  ],
});

export default function FirstChoiceEmergencyRoomPage() {
  return (
    <>
      <FacilityStructuredData
        path="/track-record/first-choice-emergency-room"
        name="First Choice Emergency Room"
        description="Emergency-care facility profile in Houston, TX located at 1717 Eldridge Pkwy with freestanding ER-style service positioning and 24/7 emergency-care capabilities."
        facilityType="EmergencyService"
        streetAddress="1717 Eldridge Pkwy"
        city="Houston"
        state="TX"
        zip="77077"
        phone="+18326724010"
        openingHours="Mo-Su 00:00-23:59"
        serviceArea={["Houston", "West Houston", "Energy Corridor", "Briar Forest", "Eldridge Parkway"]}
      />
      <FirstChoiceERDetail />
    </>
  );
}