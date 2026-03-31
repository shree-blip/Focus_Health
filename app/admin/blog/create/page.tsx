import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import CreateBlogPost from '@/pages/admin/CreateBlogPost';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Create Insight - Admin',
  canonicalUrl: '/admin/blog/create',
  noIndex: true,
});

export default function CreateBlogPage() {
  return <CreateBlogPost />;
}
