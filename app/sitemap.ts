import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";
import { BLOG_POSTS } from "@/lib/blog-posts";
import pool from "@/lib/db";

// Force dynamic so this is never pre-rendered at build time
export const dynamic = "force-dynamic";

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

  try {
    const res = await pool.query(
      `SELECT slug, updated_at, published_at FROM blog_posts WHERE status = 'published' AND published = TRUE ORDER BY published_at DESC`
    );
    const posts = res.rows;

    if (!posts.length) {
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
