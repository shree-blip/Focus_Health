import { BLOG_POSTS } from "./blog-posts";
import { type InsightCategory, inferInsightCategory } from "./insights";

export type AdminBlogPostStatus = "draft" | "published";

export type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  category: InsightCategory;
  excerpt: string;
  content: string;
  coverImage: string;
  coverImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  author: string;
  status: AdminBlogPostStatus;
  updatedAt: string;
  createdAt: string;
};

const BLOG_STORE_KEY = "focus_admin_blog_posts";
const BLOG_STORE_VERSION_KEY = "focus_admin_blog_version";
const CURRENT_VERSION = "3";

function getSeedPosts(): AdminBlogPost[] {
  return BLOG_POSTS.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    excerpt: p.excerpt,
    content: p.content,
    coverImage: p.coverImage,
    coverImageAlt: p.title,
    metaTitle: p.title,
    metaDescription: p.excerpt,
    author: p.author,
    status: p.status,
    updatedAt: p.publishedAt,
    createdAt: p.publishedAt,
  }));
}

function safeParsePosts(value: string | null): AdminBlogPost[] {
  if (!value) return getSeedPosts();
  try {
    const parsed = JSON.parse(value) as AdminBlogPost[];
    if (!Array.isArray(parsed) || parsed.length === 0) return getSeedPosts();
    // Migrate old posts missing new fields
    return parsed.map((p) => ({
      ...p,
      category: p.category || inferInsightCategory({ title: p.title, excerpt: p.excerpt, content: p.content }),
      coverImage: p.coverImage || "/hero-market.jpg",
      coverImageAlt: p.coverImageAlt || p.title,
      metaTitle: p.metaTitle || p.title,
      metaDescription: p.metaDescription || p.excerpt,
      author: p.author || "Focus Health Team",
    }));
  } catch {
    return getSeedPosts();
  }
}

export function loadAdminBlogPosts(): AdminBlogPost[] {
  if (typeof window === "undefined") return getSeedPosts();
  // Re-seed if store version is outdated
  const version = window.localStorage.getItem(BLOG_STORE_VERSION_KEY);
  if (version !== CURRENT_VERSION) {
    const seeds = getSeedPosts();
    window.localStorage.setItem(BLOG_STORE_KEY, JSON.stringify(seeds));
    window.localStorage.setItem(BLOG_STORE_VERSION_KEY, CURRENT_VERSION);
    return seeds;
  }
  return safeParsePosts(window.localStorage.getItem(BLOG_STORE_KEY));
}

export function saveAdminBlogPosts(posts: AdminBlogPost[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BLOG_STORE_KEY, JSON.stringify(posts));
  window.localStorage.setItem(BLOG_STORE_VERSION_KEY, CURRENT_VERSION);
}

export function getAdminPostById(id: string): AdminBlogPost | undefined {
  return loadAdminBlogPosts().find((p) => p.id === id);
}

export function getAdminPostBySlug(slug: string): AdminBlogPost | undefined {
  return loadAdminBlogPosts().find((p) => p.slug === slug);
}

export function getPublishedAdminPosts(): AdminBlogPost[] {
  return loadAdminBlogPosts()
    .filter((p) => p.status === "published")
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
