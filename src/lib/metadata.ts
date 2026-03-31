import type { Metadata } from "next";

export const siteConfig = {
  name: "Focus Health",
  legalName: "Focus Healthcare LLC",
  description:
    "Institutional-grade healthcare infrastructure made simple. Focus Health builds and operates high-performance freestanding emergency rooms across Texas.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://getfocushealth.com",
  ogImage: "/recent-event-hero.webp",
  contact: {
    email: "info@getfocushealth.com",
  },
};

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
  description = siteConfig.description,
  canonicalUrl,
  ogImage = siteConfig.ogImage,
  ogType = "website",
  keywords,
  noIndex = false,
}: SEOMetadataOptions = {}): Metadata {
  const fullCanonicalUrl = canonicalUrl
    ? `${siteConfig.url}${canonicalUrl}`
    : siteConfig.url;
  const fullOgImage = ogImage.startsWith("http")
    ? ogImage
    : `${siteConfig.url}${ogImage}`;

  return {
    ...(title ? { title } : {}),
    description,
    keywords: [
      "freestanding emergency room",
      "healthcare investment",
      "Texas ER",
      "healthcare infrastructure",
      "emergency room development",
      "healthcare operations",
      "Focus Health",
      ...(keywords || []),
    ],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.legalName,
    publisher: siteConfig.legalName,
    metadataBase: new URL(siteConfig.url),
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },
    alternates: {
      canonical: fullCanonicalUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large" as const,
            "max-snippet": -1,
          },
          "max-image-preview": "large" as const,
          "max-snippet": -1,
          "max-video-preview": -1,
        },
    openGraph: {
      type: ogType,
      url: fullCanonicalUrl,
      ...(title ? { title } : {}),
      description,
      images: [
        {
          url: fullOgImage,
          width: 1200,
          height: 630,
          alt: title || siteConfig.name,
        },
      ],
      siteName: siteConfig.name,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      description,
      images: [fullOgImage],
    },
    other: {
      author: siteConfig.name,
      publisher: siteConfig.legalName,
      "geo.region": "US-TX",
      "geo.placename": "Texas",
      "ai-content-declaration": "human-created",
      generator: "Focus Health Platform",
    },
  };
}

export function createMetadata({
  title,
  description,
  path,
  keywords,
  type,
  images,
  noIndex,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  type?: "website" | "article";
  images?: string[];
  noIndex?: boolean;
}): Metadata {
  return generateSEOMetadata({
    title,
    description,
    canonicalUrl: path,
    ogType: type,
    ogImage: images?.[0],
    keywords,
    noIndex,
  });
}
