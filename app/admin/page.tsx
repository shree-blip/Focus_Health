import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const metadata: Metadata = generateSEOMetadata({
  title: "Admin Dashboard",
  description: "Focus Health admin dashboard for insights and content management.",
  canonicalUrl: "/admin",
  noIndex: true,
});

export default function AdminPage() {
  return <AdminDashboardClient />;
}
