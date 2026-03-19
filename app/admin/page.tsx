import type { Metadata } from "next";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { generateSEOMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateSEOMetadata({
  title: "Admin Dashboard",
  canonicalUrl: "/admin",
  noIndex: true,
});

export default function AdminPage() {
  return <AdminDashboard />;
}
