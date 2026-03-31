"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type AdminBlogPost, loadAdminBlogPosts, saveAdminBlogPosts } from "@/lib/admin-blog-store";
import { INSIGHT_AUTHORS, INSIGHT_CATEGORIES, type InsightAuthor, type InsightCategory } from "@/lib/insights";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function BlogPostManager() {
  const [posts, setPosts] = useState<AdminBlogPost[]>(() => loadAdminBlogPosts());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<InsightCategory>("Company News");
  const [author, setAuthor] = useState<InsightAuthor>("Focus Health Team");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [posts]
  );

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setCategory("Company News");
    setAuthor("Focus Health Team");
    setExcerpt("");
    setContent("");
    setStatus("draft");
  };

  const persistPosts = (nextPosts: AdminBlogPost[]) => {
    setPosts(nextPosts);
    saveAdminBlogPosts(nextPosts);
  };

  const submitPost = () => {
    const now = new Date().toISOString();
    const normalizedSlug = toSlug(slug || title);

    if (!title.trim() || !normalizedSlug) return;

    if (editingId) {
      const nextPosts = posts.map((post) =>
        post.id === editingId
          ? {
              ...post,
              title: title.trim(),
              slug: normalizedSlug,
              category,
              author: author.trim() || "Focus Health Team",
              excerpt: excerpt.trim(),
              content: content.trim(),
              status,
              updatedAt: now,
            }
          : post
      );

      persistPosts(nextPosts);
      resetForm();
      return;
    }

    const newPost: AdminBlogPost = {
      id: crypto.randomUUID(),
      title: title.trim(),
      slug: normalizedSlug,
      category,
      author: author.trim() || "Focus Health Team",
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage: '/hero-market.jpg',
      coverImageAlt: title.trim(),
      metaTitle: title.trim(),
      metaDescription: excerpt.trim(),
      status,
      createdAt: now,
      updatedAt: now,
    };

    persistPosts([newPost, ...posts]);
    resetForm();
  };

  const editPost = (post: AdminBlogPost) => {
    setEditingId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setCategory(post.category);
    setAuthor(post.author);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setStatus(post.status);
  };

  const deletePost = (id: string) => {
    const nextPosts = posts.filter((post) => post.id !== id);
    persistPosts(nextPosts);
    if (editingId === id) resetForm();
  };

  const toggleStatus = (id: string) => {
    const nextPosts: AdminBlogPost[] = posts.map((post) =>
      post.id === id
        ? {
            ...post,
            status: (post.status === "draft" ? "published" : "draft") as AdminBlogPost["status"],
            updatedAt: new Date().toISOString(),
          }
        : post
    );
    persistPosts(nextPosts);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Insights</h1>
        <p className="text-muted-foreground mt-2">Create, edit, and publish insights from the admin panel</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Insight" : "Create New Insight"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="post-title">Title</Label>
              <Input
                id="post-title"
                value={title}
                onChange={(event) => {
                  const nextTitle = event.target.value;
                  setTitle(nextTitle);
                  if (!slug) setSlug(toSlug(nextTitle));
                }}
                placeholder="Insight title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-slug">Slug</Label>
              <Input
                id="post-slug"
                value={slug}
                onChange={(event) => setSlug(toSlug(event.target.value))}
                placeholder="post-slug"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="post-category">Category</Label>
              <select
                id="post-category"
                value={category}
                onChange={(event) => setCategory(event.target.value as InsightCategory)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                {INSIGHT_CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="post-author">Author</Label>
              <select
                id="post-author"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                {INSIGHT_AUTHORS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
              <Label htmlFor="post-excerpt">Excerpt</Label>
            <Textarea
              id="post-excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="Short summary of the update"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-content">Content</Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write your insight content"
              className="min-h-32"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant={status === "draft" ? "default" : "outline"}
              onClick={() => setStatus("draft")}
            >
              Draft
            </Button>
            <Button
              type="button"
              variant={status === "published" ? "default" : "outline"}
              onClick={() => setStatus("published")}
            >
              Published
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" onClick={submitPost}>
              <Plus className="h-4 w-4 mr-2" />
              {editingId ? "Update Insight" : "Add Insight"}
            </Button>
            {editingId ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel Edit
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedPosts.map((post) => (
              <div key={post.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">/{post.slug}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mt-2">{post.category}</p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.excerpt || "No excerpt"}</p>
                  </div>
                  <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button type="button" variant="outline" size="sm" onClick={() => editPost(post)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleStatus(post.id)}>
                    Toggle Status
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => deletePost(post.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {sortedPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No insights yet. Create your first one above.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
