import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import TrackRecord from "@/legacy-pages/TrackRecord";

export const metadata: Metadata = generateSEOMetadata({
  title: "Track Record",
  description:
    "Review Focus Health's operational outcomes across emergency rooms and clinic facilities.",
  canonicalUrl: "/track-record"
});

export default function TrackRecordPage() {
  return <TrackRecord />;
}
