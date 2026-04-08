import type { Metadata } from "next";
import Script from "next/script";
import { generateSEOMetadata } from "@/lib/metadata";
import NapervilleWellnessClinic from "@/legacy-pages/facilities/NapervilleWellnessClinic";
import { FacilityStructuredData } from "@/components/seo/FacilityStructuredData";
import { getBreadcrumbSchema, jsonLdScriptProps } from "@/lib/structuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Naperville Health & Wellness Clinic | Naperville, IL",
  description:
    "Premier wellness clinic at 2272 95th St STE 100, Naperville, IL 60564. Medical weight loss, hormone replacement therapy, IV hydration, aesthetic services & advanced body contouring. Serving Aurora, Wheaton & Chicago suburbs.",
  canonicalUrl: "/facilities/naperville-wellness-clinic",
  ogImage: "/naperville-wellness-1.jpg",
  keywords: [
    "Naperville Health Wellness Clinic", "wellness clinic Naperville IL",
    "medical weight loss Naperville", "hormone therapy Naperville IL",
    "IV hydration Naperville", "aesthetic clinic Naperville",
    "2272 95th St Naperville", "body contouring Naperville IL",
    "wellness clinic DuPage County", "Focus Health wellness Naperville",
  ],
});

export default function NapervilleWellnessClinicPage() {
  return (
    <>
      <FacilityStructuredData
        path="/facilities/naperville-wellness-clinic"
        name="Naperville Health & Wellness Clinic"
        description="Primary care and wellness clinic in Naperville, IL operated by Focus Health, serving Aurora, Wheaton, Lisle, Bolingbrook, and DuPage County."
        facilityType="MedicalClinic"
        streetAddress="2272 95th St STE 100"
        city="Naperville"
        state="IL"
        zip="60564"
        latitude={41.7431}
        longitude={-88.2038}
        openingHours="Mo-Fr 08:00-17:00"
        serviceArea={["Naperville", "Aurora", "Wheaton", "Lisle", "Bolingbrook", "Plainfield", "Oswego", "Downers Grove", "Woodridge", "DuPage County"]}
      />
      <Script id="structured-data-breadcrumb-naperville-wellness" strategy="beforeInteractive" {...jsonLdScriptProps(getBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Facilities', path: '/track-record' }, { name: 'Naperville Wellness Clinic', path: '/facilities/naperville-wellness-clinic' }]))} />
      <NapervilleWellnessClinic />
    </>
  );
}
