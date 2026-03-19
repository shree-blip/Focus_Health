import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/metadata";
import Newsletter from '@/pages/admin/Newsletter';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Newsletter - Admin',
  canonicalUrl: '/admin/newsletter',
  noIndex: true,
});

export default function NewsletterPage() {
  return <Newsletter />;
}
