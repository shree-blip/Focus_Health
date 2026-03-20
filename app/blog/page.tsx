import type { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/metadata';
import { WebPageStructuredData } from '@/components/seo/WebPageStructuredData';
import BlogListClient from '@/components/blog/BlogListClient';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Blog',
  description:
    'Insights from Focus Health on freestanding emergency room development, healthcare infrastructure, and operator-driven execution in Texas.',
  canonicalUrl: '/blog',
});

export default function BlogPage() {
  return (
    <>
      <WebPageStructuredData
        path="/blog"
        title="Blog | Focus Health"
        description="Insights from Focus Health on freestanding emergency room development, healthcare infrastructure, and operator-driven execution in Texas."
      />

      <section className="section-padding bg-card">
        <div className="container-focus">
          <div className="max-w-3xl mb-12">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">Focus Health Blog</h1>
            <p className="text-lg text-muted-foreground">
              Strategy, market insights, and operator perspectives on building and scaling emergency care
              infrastructure.
            </p>
          </div>

          <BlogListClient />
        </div>
      </section>
    </>
  );
}
