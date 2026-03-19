export type AdminBlogPostStatus = "draft" | "published";

export type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: AdminBlogPostStatus;
  updatedAt: string;
  createdAt: string;
};

const BLOG_STORE_KEY = "focus_admin_blog_posts";

const seedPosts: AdminBlogPost[] = [
  {
    id: "focus-health-market-expansion",
    title: "How Focus Health Expands Access to Emergency Care",
    slug: "focus-health-emergency-care-expansion",
    excerpt: "A quick overview of our Build + Fund + Operate model and how it improves local access.",
    content: "Use this admin panel to create and manage your blog content.",
    status: "draft",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

function safeParsePosts(value: string | null): AdminBlogPost[] {
  if (!value) return seedPosts;

  try {
    const parsed = JSON.parse(value) as AdminBlogPost[];
    if (!Array.isArray(parsed)) return seedPosts;
    return parsed;
  } catch {
    return seedPosts;
  }
}

export function loadAdminBlogPosts() {
  if (typeof window === "undefined") return seedPosts;
  return safeParsePosts(window.localStorage.getItem(BLOG_STORE_KEY));
}

export function saveAdminBlogPosts(posts: AdminBlogPost[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BLOG_STORE_KEY, JSON.stringify(posts));
}
