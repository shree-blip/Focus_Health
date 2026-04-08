import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import TrackRecord from "@/legacy-pages/TrackRecord";
import { WebPageStructuredData } from "@/components/seo/WebPageStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Healthcare Facility Portfolio | 24+ Emergency Rooms & Clinics | Focus Health",
  description:
    "View Focus Health's portfolio of 24+ freestanding emergency rooms and wellness clinics across Texas, Illinois, and Colorado.",
  canonicalUrl: "/track-record",
  keywords: [
    "healthcare facility portfolio",
    "freestanding emergency room portfolio",
    "ER track record",
    "healthcare operations track record",
  ],
});

export default function TrackRecordPage() {
  return (
    <>
      <WebPageStructuredData
        path="/track-record"
        title="Healthcare Facility Portfolio | 24+ Emergency Rooms & Clinics | Focus Health"
        description="View Focus Health's portfolio of 24+ freestanding emergency rooms and wellness clinics across Texas, Illinois, and Colorado."
      />
      <TrackRecord />
    </>
  );
}
