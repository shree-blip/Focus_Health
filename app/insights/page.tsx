import type { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/metadata';
import { WebPageStructuredData } from '@/components/seo/WebPageStructuredData';
import BlogListClient from '@/components/blog/BlogListClient';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Insights',
  description:
    'Focus Health insights, news, and market commentary on freestanding emergency room development, healthcare infrastructure, and operator-led execution.',
  canonicalUrl: '/insights',
});

export default function InsightsPage() {
  return (
    <>
      <WebPageStructuredData
        path="/insights"
        title="Insights | Focus Health"
        description="Focus Health insights, news, and market commentary on freestanding emergency room development, healthcare infrastructure, and operator-led execution."
      />

      <BlogListClient />
    </>
  );
}
