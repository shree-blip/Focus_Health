import type { Metadata } from "next";
import Script from "next/script";
import { generateSEOMetadata } from "@/lib/metadata";
import ERofIrving from "@/legacy-pages/facilities/ERofIrving";
import { FacilityStructuredData } from "@/components/seo/FacilityStructuredData";
import { getBreadcrumbSchema, jsonLdScriptProps } from "@/lib/structuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "ER of Irving | 24/7 Emergency Room in Irving, TX",
  description:
    "24/7 freestanding emergency room at 8200 N MacArthur Blvd Suite 110, Irving, TX 75063. Board-certified emergency physicians, on-site CT scan, X-ray, ultrasound & in-house lab. Minimal wait times serving Las Colinas, Valley Ranch, Coppell & DFW.",
  canonicalUrl: "/facilities/er-of-irving",
  ogImage: "/facility-er-irving-real.webp",
  keywords: [
    "ER of Irving", "Irving emergency room", "24/7 ER Irving TX",
    "freestanding ER Las Colinas", "emergency room Irving Texas",
    "ER near Las Colinas", "ER near Valley Ranch", "Irving TX ER",
    "8200 N MacArthur Blvd Irving", "urgent care Irving TX",
    "freestanding emergency room DFW", "ER open 24 hours Irving",
  ],
});

export default function ERofIrvingPage() {
  return (
    <>
      <FacilityStructuredData
        path="/facilities/er-of-irving"
        name="ER of Irving"
        description="24/7 freestanding emergency room in Irving, TX serving Las Colinas, Valley Ranch, Coppell, and surrounding communities."
        facilityType="EmergencyService"
        streetAddress="8200 N MacArthur Blvd Suite 110"
        city="Irving"
        state="TX"
        zip="75063"
        latitude={32.9025}
        longitude={-96.9790}
        openingHours="Mo-Su 00:00-23:59"
        serviceArea={["Irving", "Las Colinas", "Valley Ranch", "Coppell", "Grapevine", "Euless", "Bedford", "Grand Prairie", "Arlington", "Dallas"]}
      />
      <Script id="structured-data-breadcrumb-er-irving" strategy="beforeInteractive" {...jsonLdScriptProps(getBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Facilities', path: '/track-record' }, { name: 'ER of Irving', path: '/facilities/er-of-irving' }]))} />
      <ERofIrving />
    </>
  );
}
