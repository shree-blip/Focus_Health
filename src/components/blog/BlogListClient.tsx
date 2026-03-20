'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getPublishedAdminPosts, type AdminBlogPost } from '@/lib/admin-blog-store';

export default function BlogListClient() {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPosts(getPublishedAdminPosts());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-background overflow-hidden animate-pulse">
            <div className="aspect-[16/10] bg-muted" />
            <div className="p-6 space-y-3">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-5 w-full bg-muted rounded" />
              <div className="h-3 w-3/4 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No blog posts published yet.</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
      {posts.map((post) => (
        <article key={post.id} className="rounded-xl border border-border bg-background overflow-hidden">
          <div className="relative aspect-[16/10]">
            <Image
              src={post.coverImage || '/hero-market.jpg'}
              alt={post.coverImageAlt || post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <p className="text-xs text-muted-foreground mb-2">
              {new Date(post.createdAt).toLocaleDateString()} &bull; {post.author}
            </p>
            <h2 className="text-xl font-heading font-semibold mb-3">{post.title}</h2>
            <p className="text-sm text-muted-foreground mb-5 line-clamp-3">{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-primary font-medium hover:underline">
              Read article
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
