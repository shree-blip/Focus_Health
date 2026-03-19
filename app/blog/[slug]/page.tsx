import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { generateSEOMetadata } from '@/lib/metadata';
import { BLOG_POSTS, getBlogPostBySlug, getPublishedBlogPosts } from '@/lib/blog-posts';
import { WebPageStructuredData } from '@/components/seo/WebPageStructuredData';
import { getArticleSchema, jsonLdScriptProps } from '@/lib/structuredData';

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return generateSEOMetadata({
      title: 'Blog',
      canonicalUrl: '/blog',
    });
  }

  return generateSEOMetadata({
    title: post.title,
    description: post.excerpt,
    canonicalUrl: `/blog/${post.slug}`,
    ogType: 'article',
    ogImage: post.coverImage,
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);

  if (!post || post.status !== 'published') {
    notFound();
  }

  const relatedPosts = getPublishedBlogPosts().filter((item) => item.slug !== post.slug).slice(0, 2);
  const articleSchema = getArticleSchema({
    path: `/blog/${post.slug}`,
    title: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    image: post.coverImage,
    authorName: post.author,
  });

  return (
    <>
      <WebPageStructuredData path={`/blog/${post.slug}`} title={`${post.title} | Focus Health`} description={post.excerpt} />
      <Script id={`structured-data-article-${post.slug}`} strategy="beforeInteractive" {...jsonLdScriptProps(articleSchema)} />

      <section className="section-padding bg-card">
        <div className="container-focus max-w-4xl">
          <Link href="/blog" className="inline-flex items-center text-primary hover:underline mb-8">
            <ArrowLeft size={16} className="mr-2" />
            Back to blog
          </Link>

          <header className="mb-8">
            <p className="text-sm text-muted-foreground mb-3">
              {new Date(post.publishedAt).toLocaleDateString()} • {post.author}
            </p>
            <h1 className="text-3xl sm:text-5xl font-heading font-bold mb-4">{post.title}</h1>
            <p className="text-lg text-muted-foreground">{post.excerpt}</p>
          </header>

          <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-border mb-10">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 960px"
              className="object-cover"
            />
          </div>

          <article
            className="text-foreground space-y-4 [&_h1]:text-3xl [&_h1]:font-heading [&_h1]:font-bold [&_h1]:mt-8 [&_h2]:text-2xl [&_h2]:font-heading [&_h2]:font-semibold [&_h2]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_p]:text-base [&_p]:leading-7 [&_a]:text-primary [&_a]:underline [&_img]:rounded-lg [&_img]:border [&_img]:border-border"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {relatedPosts.length > 0 && (
            <div className="mt-14 pt-8 border-t border-border">
              <h2 className="text-2xl font-heading font-bold mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((item) => (
                  <Link key={item.id} href={`/blog/${item.slug}`} className="block rounded-lg border border-border p-5 hover:border-primary/40 transition-colors">
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
