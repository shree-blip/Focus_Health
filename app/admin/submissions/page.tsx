import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import { SubmissionsPageClient } from "@/components/admin/SubmissionsPageClient";

export const metadata: Metadata = generateSEOMetadata({
  title: "Submissions - Admin",
  canonicalUrl: "/admin/submissions",
  noIndex: true,
});

export default function SubmissionsPage() {
  return <SubmissionsPageClient />;
}
