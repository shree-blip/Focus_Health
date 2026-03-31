import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import { BlogPostManager } from "@/components/admin/BlogPostManager";

export const metadata: Metadata = generateSEOMetadata({
  title: "Insights - Admin",
  canonicalUrl: "/admin/blog",
  noIndex: true,
});

export default function AdminBlogPage() {
  return <BlogPostManager />;
}
