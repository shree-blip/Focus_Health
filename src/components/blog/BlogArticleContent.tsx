'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, UserRound } from 'lucide-react';
import { getAdminPostBySlug, getPublishedAdminPosts, type AdminBlogPost } from '@/lib/admin-blog-store';
import type { BlogPost } from '@/lib/blog-posts';
import { estimateReadTime, getInsightAuthorImage } from '@/lib/insights';

type TocItem = { id: string; text: string; level: number };

function processContent(html: string): { processedHtml: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  let counter = 0;

  let processed = html.replace(
    /<(h[1-4])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_match, tag: string, attrs: string, inner: string) => {
      const plainText = inner.replace(/<[^>]+>/g, '').trim();
      const id = plainText
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-') || `heading-${counter}`;
      counter++;
      const level = parseInt(tag[1]);
      toc.push({ id, text: plainText, level });
      // Preserve existing attributes but add/replace id
      const cleanAttrs = attrs.replace(/\s*id="[^"]*"/g, '');
      return `<${tag}${cleanAttrs} id="${id}">${inner}</${tag}>`;
    }
  );

  // Wrap standalone img tags in <figure> with figcaption from alt text
  processed = processed.replace(
    /<img([^>]*?)alt="([^"]*)"([^>]*?)\/?\s*>/gi,
    (_match, before: string, alt: string, after: string) => {
      if (alt) {
        return `<figure class="blog-figure"><img${before}alt="${alt}"${after}><figcaption>${alt}</figcaption></figure>`;
      }
      return _match;
    }
  );

  return { processedHtml: processed, toc };
}

type ServerPost = BlogPost | null;

function formatPublishedDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BlogArticleContent({
  slug,
  serverPost,
}: {
  slug: string;
  serverPost: ServerPost;
}) {
  const [adminPost, setAdminPost] = useState<AdminBlogPost | null>(null);
  const [publishedPosts, setPublishedPosts] = useState<AdminBlogPost[]>([]);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const found = getAdminPostBySlug(slug);
    if (found && found.status === 'published') setAdminPost(found);
    setPublishedPosts(getPublishedAdminPosts());
    setChecked(true);
  }, [slug]);

  // Prefer admin post (may have edits) over server post
  const post = useMemo(() => {
    if (adminPost) {
      return {
        title: adminPost.title,
        excerpt: adminPost.excerpt,
        content: adminPost.content,
        coverImage: adminPost.coverImage,
        coverImageAlt: adminPost.coverImageAlt || adminPost.title,
        author: adminPost.author,
        publishedAt: adminPost.createdAt,
      };
    }
    if (serverPost) {
      return {
        title: serverPost.title,
        excerpt: serverPost.excerpt,
        content: serverPost.content,
        coverImage: serverPost.coverImage,
        coverImageAlt: serverPost.title,
        author: serverPost.author,
        publishedAt: serverPost.publishedAt,
      };
    }
    return null;
  }, [adminPost, serverPost]);

  const { processedHtml, toc } = useMemo(
    () => (post ? processContent(post.content) : { processedHtml: '', toc: [] }),
    [post]
  );

  const authorImage = post ? getInsightAuthorImage(post.author) : null;
  const relatedPosts = useMemo(
    () => publishedPosts.filter((item) => item.slug !== slug).slice(0, 3),
    [publishedPosts, slug]
  );

  if (!checked) {
    return (
      <section className="section-padding bg-card">
        <div className="container-focus max-w-4xl flex justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="section-padding bg-card">
        <div className="container-focus max-w-4xl text-center py-24">
          <h1 className="text-3xl font-bold mb-4">Insight Not Found</h1>
          <p className="text-muted-foreground mb-6">This insight doesn&apos;t exist or is no longer published.</p>
          <Link href="/insights" className="text-primary hover:underline">Back to insights</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative mt-[-100px] min-h-[calc(65vh+160px)] flex items-center overflow-hidden bg-background">
        {post.coverImage ? (
          <div className="absolute inset-0">
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/65 to-background/85" />

        <div className="container-focus relative z-10 pt-28 pb-16 sm:pt-36 sm:pb-20">
          <div className="max-w-4xl">
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/15 to-accent/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-8 text-sm font-medium text-foreground hover:border-primary/30 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to insights
            </Link>

            <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full bg-card/70 backdrop-blur-sm px-3 py-1.5 text-foreground border border-border/60">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Author</span>
                <span className="text-muted-foreground">|</span>
                <span className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-background text-primary border border-border">
                  {authorImage ? (
                    <Image src={authorImage} alt={post.author} width={24} height={24} className="h-full w-full object-cover" />
                  ) : (
                    <UserRound className="h-3.5 w-3.5" />
                  )}
                </span>
                {post.author}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="text-sm font-medium">{formatPublishedDate(post.publishedAt)}</span>
              <Link
                href="/insights"
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:border-primary/35 hover:bg-primary/15"
              >
                Read more insights
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-heading font-bold text-foreground mb-4 sm:mb-6 max-w-4xl leading-[1.05]">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed px-0">
              {post.excerpt}
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-card">
        <div className="container-focus max-w-5xl">
          {/* TOC inline (shown on mobile) */}
          {toc.length > 2 && (
            <nav className="lg:hidden mb-10 p-4 rounded-lg border border-border bg-muted/50">
              <p className="font-semibold text-sm mb-3">Table of Contents</p>
              <ul className="space-y-1.5">
                {toc.map((item) => (
                  <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
                    <a href={`#${item.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="flex gap-10">
            {/* TOC sidebar (desktop) */}
            {toc.length > 2 && (
              <aside className="hidden lg:block w-56 flex-shrink-0">
                <nav className="sticky top-24 space-y-1.5">
                  <p className="font-semibold text-sm mb-3">Table of Contents</p>
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                      style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </aside>
            )}

            <article
              className="blog-article flex-1 min-w-0"
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />
          </div>
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="section-padding bg-background border-t border-border/60">
          <div className="container-focus max-w-6xl">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Read More Insights</p>
                <h2 className="mt-3 text-3xl font-heading font-bold text-foreground">Newest insights</h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  Explore the latest Focus Health updates, strategy insights, and market commentary.
                </p>
              </div>

              <Link href="/insights" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">
                View all insights
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedPosts.map((item) => {
                const relatedAuthorImage = getInsightAuthorImage(item.author);

                return (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-[1.75rem] border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link href={`/insights/${item.slug}`} className="block">
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={item.coverImage || '/hero-market.jpg'}
                          alt={item.coverImageAlt || item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </Link>

                    <div className="p-6">
                      <p className="text-sm font-medium text-muted-foreground">{formatPublishedDate(item.createdAt)}</p>

                      <Link href={`/insights/${item.slug}`} className="mt-3 block">
                        <h3 className="text-2xl font-heading font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                          {item.title}
                        </h3>
                      </Link>

                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">{item.excerpt}</p>

                      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-foreground">
                          <span className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-background text-primary border border-border">
                            {relatedAuthorImage ? (
                              <Image
                                src={relatedAuthorImage}
                                alt={item.author}
                                width={24}
                                height={24}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserRound className="h-3.5 w-3.5" />
                            )}
                          </span>
                          {item.author}
                        </span>
                        <span>{estimateReadTime(item.content)} min read</span>
                      </div>

                      <Link
                        href={`/insights/${item.slug}`}
                        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3"
                      >
                        Read article
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
