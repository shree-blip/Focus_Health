import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import EditBlogPost from "@/pages/admin/EditBlogPost";

export const metadata: Metadata = generateSEOMetadata({
  title: "Edit Blog Post - Admin",
  canonicalUrl: "/admin/blog/edit",
  noIndex: true,
});

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditBlogPost postId={id} />;
}
