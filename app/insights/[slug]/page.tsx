import type { Metadata } from 'next';
import Script from 'next/script';
import { generateSEOMetadata } from '@/lib/metadata';
import { BLOG_POSTS, getBlogPostBySlug } from '@/lib/blog-posts';
import { WebPageStructuredData } from '@/components/seo/WebPageStructuredData';
import { getArticleSchema, getBreadcrumbSchema, jsonLdScriptProps } from '@/lib/structuredData';
import BlogArticleContent from '@/components/blog/BlogArticleContent';

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return generateSEOMetadata({
      title: 'Insights',
      description: 'Read the latest insights from Focus Health.',
      canonicalUrl: '/insights',
    });
  }

  return generateSEOMetadata({
    title: post.title,
    description: post.excerpt,
    canonicalUrl: `/insights/${post.slug}`,
    ogType: 'article',
    ogImage: post.coverImage,
  });
}

export default async function InsightPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  const articleSchema = post
    ? getArticleSchema({
        path: `/insights/${post.slug}`,
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
          <WebPageStructuredData
            path={`/insights/${post.slug}`}
            title={`${post.title} | Focus Health`}
            description={post.excerpt}
          />
          <Script id={`structured-data-insight-${post.slug}`} strategy="beforeInteractive" {...jsonLdScriptProps(articleSchema!)} />
          <Script
            id={`structured-data-breadcrumb-${post.slug}`}
            strategy="beforeInteractive"
            {...jsonLdScriptProps(
              getBreadcrumbSchema([
                { name: 'Home', path: '/' },
                { name: 'Insights', path: '/insights' },
                { name: post.title, path: `/insights/${post.slug}` },
              ])
            )}
          />
        </>
      )}

      <BlogArticleContent slug={slug} serverPost={post ?? null} />
    </>
  );
}
