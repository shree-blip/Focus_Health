import type { Metadata } from 'next';
import Script from 'next/script';
import { generateSEOMetadata } from '@/lib/metadata';
import { BLOG_POSTS, getBlogPostBySlug } from '@/lib/blog-posts';
import { WebPageStructuredData } from '@/components/seo/WebPageStructuredData';
import { getArticleSchema, jsonLdScriptProps } from '@/lib/structuredData';
import BlogArticleContent from '@/components/blog/BlogArticleContent';

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return generateSEOMetadata({
      title: 'Blog',
      description: 'Read the latest insights from Focus Health.',
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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  // Structured data for statically-known posts
  const articleSchema = post
    ? getArticleSchema({
        path: `/blog/${post.slug}`,
        title: post.title,
        description: post.excerpt,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        image: post.coverImage,
        authorName: post.author,
      })
    : null;

  return (
    <>
      {post && (
        <>
          <WebPageStructuredData path={`/blog/${post.slug}`} title={`${post.title} | Focus Health`} description={post.excerpt} />
          <Script id={`structured-data-article-${post.slug}`} strategy="beforeInteractive" {...jsonLdScriptProps(articleSchema!)} />
        </>
      )}

      <BlogArticleContent slug={slug} serverPost={post ?? null} />
    </>
  );
}
