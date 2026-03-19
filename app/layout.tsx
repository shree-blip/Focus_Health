import type { Metadata } from "next";
import "@/index.css";
import AppProviders from "@/components/providers/AppProviders";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { ScrollToTop } from "@/components/ScrollToTop";

export const metadata: Metadata = {
  metadataBase: new URL("https://getfocushealth.com"),
  title: {
    default: "Focus Health | Build + Fund + Operate Healthcare Infrastructure",
    template: "%s | Focus Health",
  },
  description:
    "Institutional-grade healthcare infrastructure made simple. Focus Health builds and operates high-performance freestanding emergency rooms across Texas.",
  keywords: [
    "freestanding emergency room",
    "healthcare investment",
    "Texas ER",
    "healthcare infrastructure",
    "emergency room development",
    "healthcare operations",
    "Focus Health",
  ],
  authors: [{ name: "Focus Health" }],
  creator: "Focus Healthcare LLC",
  publisher: "Focus Healthcare LLC",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://getfocushealth.com",
    siteName: "Focus Health",
    title: "Focus Health | Build + Fund + Operate Healthcare Infrastructure",
    description:
      "Institutional-grade healthcare infrastructure made simple. Focus Health builds and operates high-performance freestanding emergency rooms across Texas.",
    images: [{ url: "/favicon.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Focus Health | Build + Fund + Operate Healthcare Infrastructure",
    description:
      "Institutional-grade healthcare infrastructure made simple. Focus Health builds and operates high-performance freestanding emergency rooms across Texas.",
    images: ["/favicon.png"],
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-20">{children}</main>
            <Footer />
          </div>
        </AppProviders>
        <JsonLd />
      </body>
    </html>
  );
}
