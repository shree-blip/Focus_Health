import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  keywords?: string;
  noIndex?: boolean;
}

export const SEOHead = ({
  title = 'Focus Health | Build + Fund + Operate Healthcare Infrastructure',
  description = 'Institutional-grade healthcare infrastructure made simple. Focus Health builds and operates high-performance freestanding emergency rooms across Texas.',
  canonicalUrl,
  ogImage = '/favicon.png',
  ogType = 'website',
  keywords = 'freestanding emergency room, healthcare investment, Texas ER, healthcare infrastructure, emergency room development, healthcare operations, Focus Health',
  noIndex = false
}: SEOHeadProps) => {
  const baseUrl = 'https://focus-elevate-build.lovable.app';
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : baseUrl;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content="Focus Health" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Additional Meta */}
      <meta name="author" content="Focus Health" />
      <meta name="publisher" content="Focus Healthcare LLC" />
      <meta name="geo.region" content="US-TX" />
      <meta name="geo.placename" content="Texas" />
      
      {/* AI/LLM Specific Meta */}
      <meta name="ai-content-declaration" content="human-created" />
      <meta name="generator" content="Focus Health Platform" />
    </Helmet>
  );
};

export default SEOHead;
