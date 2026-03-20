'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { getAdminPostBySlug, type AdminBlogPost } from '@/lib/admin-blog-store';
import type { BlogPost } from '@/lib/blog-posts';

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

export default function BlogArticleContent({
  slug,
  serverPost,
}: {
  slug: string;
  serverPost: ServerPost;
}) {
  const [adminPost, setAdminPost] = useState<AdminBlogPost | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const found = getAdminPostBySlug(slug);
    if (found && found.status === 'published') setAdminPost(found);
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
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">This blog post doesn&apos;t exist or is no longer published.</p>
          <Link href="/blog" className="text-primary hover:underline">Back to blog</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-card">
      <div className="container-focus max-w-5xl">
        <Link href="/blog" className="inline-flex items-center text-primary hover:underline mb-8">
          <ArrowLeft size={16} className="mr-2" />
          Back to blog
        </Link>

        <header className="mb-8">
          <p className="text-sm text-muted-foreground mb-3">
            {new Date(post.publishedAt).toLocaleDateString()} &bull; {post.author}
          </p>
          <h1 className="text-3xl sm:text-5xl font-heading font-bold mb-4">{post.title}</h1>
          <p className="text-lg text-muted-foreground">{post.excerpt}</p>
        </header>

        {post.coverImage && (
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-border mb-10">
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 960px"
              className="object-cover"
            />
          </div>
        )}

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
  );
}
