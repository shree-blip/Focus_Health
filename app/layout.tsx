import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "@/index.css";
import AppProviders from "@/components/providers/AppProviders";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StructuredDataScript } from "@/components/seo/StructuredDataScript";
import { ScrollToTop } from "@/components/ScrollToTop";
import { siteConfig } from "@/lib/metadata";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Focus Health | Build + Fund + Operate Healthcare Infrastructure",
    template: "%s | Focus Health",
  },
  description: siteConfig.description,
  keywords: [
    "freestanding emergency room",
    "healthcare investment",
    "Texas ER",
    "healthcare infrastructure",
    "emergency room development",
    "healthcare operations",
    "Focus Health",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Focus Health | Build + Fund + Operate Healthcare Infrastructure",
    description:
      "Institutional-grade healthcare infrastructure made simple. Focus Health builds and operates high-performance freestanding emergency rooms across Texas.",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Focus Health",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Focus Health | Build + Fund + Operate Healthcare Infrastructure",
    description:
      "Institutional-grade healthcare infrastructure made simple. Focus Health builds and operates high-performance freestanding emergency rooms across Texas.",
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  other: {
    "geo.region": "US-TX",
    "geo.placename": "Texas",
    "ai-content-declaration": "human-created",
    generator: "Focus Health Platform",
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sora.variable}`}>
        <AppProviders>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-20">{children}</main>
            <Footer />
          </div>
        </AppProviders>
        <StructuredDataScript />
      </body>
    </html>
  );
}
