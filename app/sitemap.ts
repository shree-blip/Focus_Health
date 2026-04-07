import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { siteConfig } from "@/lib/metadata";
import { BLOG_POSTS } from "@/lib/blog-posts";

const routes = [
  "",
  "/contact",
  "/investors",
  "/leadership",
  "/market",
  "/our-process",
  "/partners",
  "/platform",
  "/privacy",
  "/terms",
  "/track-record",
  "/insights",
  "/facilities/er-of-irving",
  "/facilities/er-of-lufkin",
  "/facilities/er-of-white-rock",
  "/facilities/irving-wellness-clinic",
  "/facilities/naperville-wellness-clinic",
  "/track-record/first-choice-emergency-room",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/insights" ? 0.85 : 0.8,
  }));

  const fallbackInsightEntries: MetadataRoute.Sitemap = BLOG_POSTS.filter((post) => post.status === "published").map(
    (post) => ({
      url: `${siteConfig.url}/insights/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly",
      priority: 0.75,
    }),
  );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [...staticEntries, ...fallbackInsightEntries];
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, published_at, status, published")
      .eq("status", "published")
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (error || !posts) {
      return [...staticEntries, ...fallbackInsightEntries];
    }

    const dynamicInsightEntries: MetadataRoute.Sitemap = posts
      .filter((post) => post.slug)
      .map((post) => ({
        url: `${siteConfig.url}/insights/${post.slug}`,
        lastModified: new Date(post.updated_at || post.published_at || now),
        changeFrequency: "monthly",
        priority: 0.75,
      }));

    return [...staticEntries, ...dynamicInsightEntries];
  } catch {
    return [...staticEntries, ...fallbackInsightEntries];
  }
}
