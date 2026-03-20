import { getMedicalFacilitySchema, jsonLdScriptProps } from "@/lib/structuredData";
import Script from "next/script";

interface FacilityStructuredDataProps {
  path: string;
  name: string;
  description: string;
  facilityType: "EmergencyService" | "MedicalClinic";
  streetAddress?: string;
  city: string;
  state: string;
  zip?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  serviceArea?: string[];
  image?: string;
}

export function FacilityStructuredData(props: FacilityStructuredDataProps) {
  const data = getMedicalFacilitySchema(props);
  const scriptId = `structured-data-facility-${props.path.replace(/\//g, "-").replace(/^-/, "")}`;

  return <Script id={scriptId} strategy="beforeInteractive" {...jsonLdScriptProps(data)} />;
}
