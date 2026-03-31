export type InsightCategory =
  | "Market Analysis"
  | "Clinical Operations"
  | "Regulatory Compliance"
  | "Company News";

export const INSIGHT_CATEGORIES: InsightCategory[] = [
  "Market Analysis",
  "Clinical Operations",
  "Regulatory Compliance",
  "Company News",
];

export const INSIGHT_FILTERS = ["All Updates", ...INSIGHT_CATEGORIES] as const;

export const INSIGHT_AUTHORS = [
  "Focus Health Team",
  "Jay Dahal",
  "Rick Leonard",
  "Jamie Alcantar",
  "Dr. Steven H. Thompson, MD",
] as const;

export type InsightAuthor = (typeof INSIGHT_AUTHORS)[number] | string;

export const INSIGHT_AUTHOR_IMAGES: Record<string, string> = {
  "Focus Health Team": "/focus-health-icon.png",
  "Jay Dahal": "/jay-dahal-headshot.png",
  "Rick Leonard": "/rick-leonard-headshot.png",
  "Jamie Alcantar": "/jamie-alcantar-headshot.png",
  "Dr. Steven H. Thompson, MD": "/Dr-Thompson.png",
};

export function getInsightAuthorImage(author: string) {
  return INSIGHT_AUTHOR_IMAGES[author] || null;
}

export function inferInsightCategory({
  title,
  excerpt,
  content,
}: {
  title: string;
  excerpt?: string;
  content?: string;
}): InsightCategory {
  const haystack = `${title} ${excerpt ?? ""} ${content ?? ""}`.toLowerCase();

  if (/(regulatory|compliance|policy|mandate|interoperab|cms|licensing)/.test(haystack)) {
    return "Regulatory Compliance";
  }

  if (/(patient|clinical|triage|operate|operations|workflow|staffing|care model|care delivery)/.test(haystack)) {
    return "Clinical Operations";
  }

  if (/(market|investor|capital|growth|demand|expansion|real estate|infrastructure)/.test(haystack)) {
    return "Market Analysis";
  }

  return "Company News";
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function estimateReadTime(value: string) {
  const words = stripHtml(value).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
