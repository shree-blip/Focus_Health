import { Helmet } from 'react-helmet-async';

interface SchemaMarkupProps {
  type?: 'organization' | 'website' | 'service' | 'article';
  pageTitle?: string;
  pageDescription?: string;
  pageUrl?: string;
}

export const SchemaMarkup = ({ 
  type = 'organization',
  pageTitle,
  pageDescription,
  pageUrl 
}: SchemaMarkupProps) => {
  const baseUrl = 'https://getfocushealth.com';
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Focus Health",
    "alternateName": "Focus Healthcare LLC",
    "url": baseUrl,
    "logo": `${baseUrl}/favicon.png`,
    "description": "Institutional-grade healthcare infrastructure company specializing in building and operating high-performance freestanding emergency rooms across Texas.",
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "Texas",
      "addressCountry": "US"
    },
    "email": "info@getfocushealth.com",
    "sameAs": [],
    "areaServed": {
      "@type": "State",
      "name": "Texas"
    },
    "knowsAbout": [
      "Freestanding Emergency Rooms",
      "Healthcare Infrastructure",
      "Healthcare Investment",
      "Emergency Medical Services",
      "Healthcare Operations"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Focus Health",
    "url": baseUrl,
    "description": "Build + Fund + Operate: Institutional-grade healthcare infrastructure made simple.",
    "publisher": {
      "@type": "Organization",
      "name": "Focus Health"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Freestanding Emergency Room Development",
    "provider": {
      "@type": "Organization",
      "name": "Focus Health"
    },
    "description": "End-to-end turnkey healthcare solutions including site selection, construction, staffing, and operations management for freestanding emergency rooms.",
    "areaServed": {
      "@type": "State",
      "name": "Texas"
    },
    "serviceType": [
      "Healthcare Facility Development",
      "Emergency Room Operations",
      "Healthcare Investment Management",
      "Medical Facility Construction"
    ],
    "offers": {
      "@type": "Offer",
      "description": "Partnership opportunities for investors and communities"
    }
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageTitle || "Focus Health",
    "description": pageDescription || "Institutional-grade healthcare infrastructure made simple.",
    "url": pageUrl || baseUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Focus Health",
      "url": baseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "Focus Health"
    }
  };

  const getSchema = () => {
    switch (type) {
      case 'website':
        return [organizationSchema, websiteSchema];
      case 'service':
        return [organizationSchema, serviceSchema];
      case 'article':
        return [organizationSchema, webPageSchema];
      default:
        return [organizationSchema, websiteSchema, serviceSchema];
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(getSchema())}
      </script>
    </Helmet>
  );
};

export default SchemaMarkup;
