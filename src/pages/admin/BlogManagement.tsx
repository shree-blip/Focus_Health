'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  type AdminBlogPost,
  loadAdminBlogPosts,
  saveAdminBlogPosts,
} from '@/lib/admin-blog-store';

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPosts(loadAdminBlogPosts());
    setLoading(false);
  }, []);

  const persist = (next: AdminBlogPost[]) => {
    setPosts(next);
    saveAdminBlogPosts(next);
  };

  const toggleStatus = (id: string) => {
    const next = posts.map((p) =>
      p.id === id
        ? {
            ...p,
            status: (p.status === 'draft' ? 'published' : 'draft') as AdminBlogPost['status'],
            updatedAt: new Date().toISOString(),
          }
        : p
    );
    persist(next);
  };

  const deletePost = (id: string) => {
    if (!confirm('Delete this post permanently?')) return;
    persist(posts.filter((p) => p.id !== id));
  };

  const sorted = [...posts].sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-primary hover:underline">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Blog Posts</h1>
            <p className="text-muted-foreground mt-1">
              Manage your blog content ({posts.length} posts)
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/blog/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : sorted.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No blog posts yet</p>
            <Button asChild variant="outline">
              <Link href="/admin/blog/create">Create your first post</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sorted.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {post.coverImage && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border flex-shrink-0">
                      <Image
                        src={post.coverImage}
                        alt={post.coverImageAlt || post.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg truncate">{post.title}</h3>
                        <p className="text-sm text-muted-foreground">/{post.slug}</p>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{post.author || 'Focus Health Team'}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/blog/edit/${post.id}`}>
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toggleStatus(post.id)}>
                        {post.status === 'published' ? (
                          <><EyeOff className="h-3.5 w-3.5 mr-1.5" />Unpublish</>
                        ) : (
                          <><Eye className="h-3.5 w-3.5 mr-1.5" />Publish</>
                        )}
                      </Button>
                      {post.status === 'published' && (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/blog/${post.slug}`} target="_blank">View</Link>
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => deletePost(post.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
