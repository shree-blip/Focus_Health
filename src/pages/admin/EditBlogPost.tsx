'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { INSIGHT_AUTHORS, INSIGHT_CATEGORIES, type InsightAuthor, type InsightCategory } from '@/lib/insights';

function toSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

export default function EditBlogPostPage({ postId }: { postId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<InsightCategory>('Company News');
  const [author, setAuthor] = useState<InsightAuthor>('Focus Health Team');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverImageAlt, setCoverImageAlt] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`/api/blog/${postId}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error('Failed');
        const post = await res.json();
        setTitle(post.title);
        setSlug(post.slug);
        setCategory(post.category);
        setAuthor(post.author || 'Focus Health Team');
        setContent(post.content);
        setExcerpt(post.excerpt);
        setCoverImage(post.cover_image || '');
        setCoverImageAlt('');
        setMetaTitle('');
        setMetaDescription('');
        setStatus(post.published ? 'published' : 'draft');
        setReady(true);
      } catch {
        setNotFound(true);
      }
    }
    loadPost();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!title || !slug || !content) {
        toast.error('Please fill in Title, Slug, and Content');
        return;
      }

      const res = await fetch(`/api/blog/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          category,
          excerpt: excerpt.trim(),
          content,
          cover_image: coverImage.trim() || '/hero-market.jpg',
          author: author.trim() || 'Focus Health Team',
          published: status === 'published',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed');
      }

      toast.success('Insight updated!');
      router.push('/admin/blog');
    } catch (error) {
      toast.error('Failed to update insight');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (notFound) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="text-primary hover:underline">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">Insight Not Found</h1>
        </div>
        <p className="text-muted-foreground">This insight doesn&apos;t exist or has been deleted.</p>
        <Button asChild variant="outline"><Link href="/admin/blog">Back to insights</Link></Button>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blog" className="text-primary hover:underline">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold">Edit Insight</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" placeholder="Enter insight title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="post-slug"
                  value={slug}
                  onChange={(e) => setSlug(toSlug(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value as InsightCategory)} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                {INSIGHT_CATEGORIES.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <select id="author" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                {INSIGHT_AUTHORS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" placeholder="Brief summary of the insight" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input id="coverImage" placeholder="/hero-market.jpg" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
                {coverImage && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border mt-2">
                    <Image src={coverImage} alt={coverImageAlt || 'Preview'} fill sizes="400px" className="object-cover" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverImageAlt">Cover Image Alt Text</Label>
                <Input id="coverImageAlt" placeholder="Descriptive alt text for the image" value={coverImageAlt} onChange={(e) => setCoverImageAlt(e.target.value)} />
              </div>
            </div>

            <details className="border border-border rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-sm">SEO / Meta Fields</summary>
              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input id="metaTitle" placeholder={title || 'Defaults to post title'} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea id="metaDescription" placeholder={excerpt || 'Defaults to excerpt'} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} />
                </div>
              </div>
            </details>

            <div className="space-y-2">
              <Label>Content *</Label>
              <RichTextEditor value={content} onChange={setContent} placeholder="Write your insight content here..." />
              <p className="text-xs text-muted-foreground">Use H1–H4, Bold, Italic, Links, Images from the toolbar.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Insight'}</Button>
              <Button type="button" variant="outline" asChild><Link href="/admin/blog">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
