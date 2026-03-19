import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { generateSEOMetadata } from '@/lib/metadata';
import { getPublishedBlogPosts } from '@/lib/blog-posts';
import { WebPageStructuredData } from '@/components/seo/WebPageStructuredData';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Blog',
  description:
    'Insights from Focus Health on freestanding emergency room development, healthcare infrastructure, and operator-driven execution in Texas.',
  canonicalUrl: '/blog',
});

export default function BlogPage() {
  const posts = getPublishedBlogPosts();

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

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="rounded-xl border border-border bg-background overflow-hidden">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs text-muted-foreground mb-2">
                    {new Date(post.publishedAt).toLocaleDateString()} • {post.author}
                  </p>
                  <h2 className="text-xl font-heading font-semibold mb-3">{post.title}</h2>
                  <p className="text-sm text-muted-foreground mb-5">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-primary font-medium hover:underline">
                    Read article
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
