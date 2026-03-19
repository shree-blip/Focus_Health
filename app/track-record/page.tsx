import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import TrackRecord from "@/legacy-pages/TrackRecord";
import { WebPageStructuredData } from "@/components/seo/WebPageStructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "Track Record",
  description:
    "See Focus Health's operational excellence: 24+ successfully managed emergency rooms and wellness clinics in Texas with transparent metrics, proven outcomes, and strong financial performance.",
  canonicalUrl: "/track-record"
});

export default function TrackRecordPage() {
  return (
    <>
      <WebPageStructuredData
        path="/track-record"
        title="Track Record | Focus Health"
        description="See Focus Health's operational excellence: 24+ successfully managed emergency rooms and wellness clinics in Texas with transparent metrics, proven outcomes, and strong financial performance."
      />
      <TrackRecord />
    </>
  );
}
