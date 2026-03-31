'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronDown, Sparkles, UserRound } from 'lucide-react';
import { getPublishedAdminPosts, type AdminBlogPost } from '@/lib/admin-blog-store';
import { estimateReadTime, getInsightAuthorImage, INSIGHT_FILTERS, type InsightCategory } from '@/lib/insights';

type InsightFilter = (typeof INSIGHT_FILTERS)[number];

function formatLongDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getCategoryTone(category: InsightCategory) {
  switch (category) {
    case 'Market Analysis':
      return 'bg-primary/10 text-primary';
    case 'Clinical Operations':
      return 'bg-secondary/15 text-secondary';
    case 'Regulatory Compliance':
      return 'bg-accent/15 text-accent';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function AuthorBadge({ author }: { author: string }) {
  const imageSrc = getInsightAuthorImage(author);

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
      <span className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-white text-primary shadow-sm ring-1 ring-slate-200">
        {imageSrc ? (
          <Image src={imageSrc} alt={author} width={24} height={24} className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-3.5 w-3.5" />
        )}
      </span>
      {author}
    </span>
  );
}

export default function BlogListClient() {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [ready, setReady] = useState(false);
  const [activeFilter, setActiveFilter] = useState<InsightFilter>('All Updates');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    setPosts(getPublishedAdminPosts());
    setReady(true);
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeFilter === 'All Updates') return posts;
    return posts.filter((post) => post.category === activeFilter);
  }, [activeFilter, posts]);

  const featuredPost = filteredPosts[0] ?? null;
  const gridPosts = filteredPosts.slice(featuredPost ? 1 : 0, visibleCount + (featuredPost ? 1 : 0));
  const hasMore = filteredPosts.length > (featuredPost ? gridPosts.length + 1 : gridPosts.length);

  if (!ready) {
    return (
      <div className="space-y-10">
        <div className="min-h-[36rem] rounded-[2rem] bg-muted/60 animate-pulse" />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="overflow-hidden rounded-[1.5rem] border border-border bg-background animate-pulse">
              <div className="h-64 bg-muted" />
              <div className="space-y-3 p-8">
                <div className="h-4 w-28 rounded bg-muted" />
                <div className="h-7 w-full rounded bg-muted" />
                <div className="h-4 w-4/5 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="relative -mt-[100px] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary/5 pt-28">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-[-8rem] top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-[-5rem] bottom-10 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="container-focus relative z-10 py-16 md:py-24">
          {featuredPost ? (
            <div className="grid items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
                  <Sparkles className="h-4 w-4" />
                  Featured Insight
                </div>

                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.05]">
                  {featuredPost.title}
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                  {featuredPost.excerpt}
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href={`/insights/${featuredPost.slug}`}
                    className="inline-flex items-center justify-center gap-3 rounded-2xl bg-primary px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <AuthorBadge author={featuredPost.author} />
                    <div className="text-sm font-medium text-slate-500">
                      {estimateReadTime(featuredPost.content)} Min Read • {formatLongDate(featuredPost.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:col-span-5 lg:block">
                <div className="rotate-2 overflow-hidden rounded-[2rem] border border-white/80 bg-white p-4 shadow-[0_32px_80px_rgba(15,23,42,0.10)]">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
                    <Image
                      src={featuredPost.coverImage || '/hero-market.jpg'}
                      alt={featuredPost.coverImageAlt || featuredPost.title}
                      fill
                      priority
                      sizes="(max-width: 1200px) 100vw, 34vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 px-8 py-20 text-center shadow-sm backdrop-blur">
              <h1 className="text-4xl font-black tracking-tight text-slate-950">Focus Health Insights</h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                News, strategy updates, and operator perspectives will appear here as new insights are published.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-100/80 py-20 md:py-24">
        <div className="container-focus">
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Insights</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Latest Updates</h2>
              <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
                Focus Health publishes company news, market commentary, and operating insights for partners following healthcare infrastructure trends.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 rounded-[1.25rem] bg-white p-2 shadow-sm ring-1 ring-slate-200/80">
              {INSIGHT_FILTERS.map((filter) => {
                const active = filter === activeFilter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => {
                      setActiveFilter(filter);
                      setVisibleCount(6);
                    }}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      active
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-8 py-20 text-center shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900">No insights published yet</h3>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">
                Switch filters or publish the first update from the admin panel to start building your insights library.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((post) => (
                  <article
                    key={post.id}
                    className="group overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_40px_90px_rgba(15,23,42,0.10)]"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={post.coverImage || '/hero-market.jpg'}
                        alt={post.coverImageAlt || post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${getCategoryTone(post.category)}`}>
                        {post.category}
                      </div>
                    </div>

                    <div className="p-8">
                      <time className="mb-3 block text-sm font-medium text-slate-400">{formatShortDate(post.createdAt)}</time>
                      <h3 className="text-2xl font-black leading-snug text-slate-950 transition group-hover:text-primary">
                        {post.title}
                      </h3>
                      <div className="mt-4">
                        <AuthorBadge author={post.author} />
                      </div>
                      <p className="mt-4 line-clamp-3 text-base leading-7 text-slate-600">{post.excerpt}</p>

                      <div className="mt-8 flex items-center justify-between gap-4">
                        <Link
                          href={`/insights/${post.slug}`}
                          className="inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:gap-3"
                        >
                          Read Article
                          <ArrowRight className="h-4 w-4" />
                        </Link>

                        <span className="text-sm text-slate-400">{estimateReadTime(post.content)} min read</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {hasMore ? (
                <div className="mt-16 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + 6)}
                    className="group inline-flex items-center gap-3 text-lg font-bold text-primary transition hover:gap-4"
                  >
                    Load More Insights
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-20 md:py-24">
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />

        <div className="container-focus relative z-10">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-slate-950 px-8 py-14 text-center text-white shadow-[0_32px_90px_rgba(15,23,42,0.22)] sm:px-12 md:px-16 md:py-20">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-white/80">
              Executive Network
            </span>
            <h2 className="mt-8 text-4xl font-black tracking-tight sm:text-5xl">Stay Informed</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/70">
              Follow Focus Health for monthly updates on healthcare infrastructure, expansion opportunities, and company news across our operating markets.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                Contact Us
              </Link>
              <Link
                href="/partners#opportunity-form"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-8 py-4 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Explore Opportunities
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
