import type { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/metadata';
import { WebPageStructuredData } from '@/components/seo/WebPageStructuredData';
import BlogListClient from '@/components/blog/BlogListClient';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Healthcare Infrastructure Insights | Focus Health Research & Analysis',
  description:
    'Expert insights on freestanding emergency rooms, healthcare investment, and facility operations from the Focus Health platform team.',
  canonicalUrl: '/insights',
  keywords: [
    'healthcare infrastructure insights',
    'freestanding ER industry trends',
    'healthcare investment research',
    'emergency room market analysis',
  ],
});

export default function InsightsPage() {
  return (
    <>
      <WebPageStructuredData
        path="/insights"
        title="Healthcare Infrastructure Insights | Focus Health Research & Analysis"
        description="Expert insights on freestanding emergency rooms, healthcare investment, and facility operations from the Focus Health platform team."
      />

      <BlogListClient />
    </>
  );
}
