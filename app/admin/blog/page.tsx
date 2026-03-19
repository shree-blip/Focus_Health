import type { Metadata } from "next";
import BlogManagement from "@/pages/admin/BlogManagement";
import { generateSEOMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateSEOMetadata({
  title: "Blog Posts - Admin",
  canonicalUrl: "/admin/blog",
  noIndex: true,
});

export default function AdminBlogPage() {
  return <BlogManagement />;
}
