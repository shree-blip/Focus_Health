import type { Metadata } from "next";

const BASE_URL = "https://getfocushealth.com";

interface SEOMetadataOptions {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  keywords?: string[];
  noIndex?: boolean;
}

export function generateSEOMetadata({
  title,
  description = "Institutional-grade healthcare infrastructure made simple. Focus Health builds and operates high-performance freestanding emergency rooms across Texas.",
  canonicalUrl,
  ogImage = "/favicon.png",
  ogType = "website",
  keywords,
  noIndex = false,
}: SEOMetadataOptions = {}): Metadata {
  const fullCanonicalUrl = canonicalUrl
    ? `${BASE_URL}${canonicalUrl}`
    : BASE_URL;
  const fullOgImage = ogImage.startsWith("http")
    ? ogImage
    : `${BASE_URL}${ogImage}`;

  return {
    ...(title ? { title } : {}),
    description,
    ...(keywords ? { keywords } : {}),
    alternates: {
      canonical: fullCanonicalUrl,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          "max-image-preview": "large" as const,
          "max-snippet": -1,
          "max-video-preview": -1,
        },
    openGraph: {
      type: ogType,
      url: fullCanonicalUrl,
      ...(title ? { title } : {}),
      description,
      images: [{ url: fullOgImage }],
      siteName: "Focus Health",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      description,
      images: [fullOgImage],
    },
    other: {
      author: "Focus Health",
      publisher: "Focus Healthcare LLC",
      "geo.region": "US-TX",
      "geo.placename": "Texas",
      "ai-content-declaration": "human-created",
      generator: "Focus Health Platform",
    },
  };
}
