import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import NotFound from "@/legacy-pages/NotFound";

export const metadata: Metadata = generateSEOMetadata({
  title: "Page Not Found",
  description: "The page you are looking for does not exist. Return to Focus Health homepage.",
  noIndex: true,
});

export default function NotFoundPage() {
  return <NotFound />;
}
