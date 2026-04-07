import { siteConfig } from "@/lib/metadata";

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "MedicalBusiness"],
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.ogImage}`,
    description: siteConfig.description,
    email: siteConfig.contact.email,
    areaServed: {
      "@type": "State",
      name: "Texas",
    },
  };
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
  };
}

export function getWebPageSchema({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationSchema(),
      getWebsiteSchema(),
      {
        "@type": "WebPage",
        "@id": `${siteConfig.url}${path}#webpage`,
        url: `${siteConfig.url}${path}`,
        name: title,
        description,
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        about: { "@id": `${siteConfig.url}/#organization` },
      },
    ],
  };
}

export function getArticleSchema({
  path,
  title,
  description,
  datePublished,
  dateModified,
  image,
  authorName = siteConfig.name,
}: {
  path: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  image?: string;
  authorName?: string;
}) {
  const articleUrl = `${siteConfig.url}${path}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${articleUrl}#article`,
    headline: title,
    description,
    image: image ? `${siteConfig.url}${image}` : `${siteConfig.url}${siteConfig.ogImage}`,
    datePublished,
    dateModified,
    author: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: authorName,
    },
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${articleUrl}#webpage`,
    },
  };
}

// Medical facility schema for ER / clinic pages (local SEO)
export function getMedicalFacilitySchema({
  path,
  name,
  description,
  facilityType,
  streetAddress,
  city,
  state,
  zip,
  phone,
  latitude,
  longitude,
  openingHours,
  serviceArea,
  image,
}: {
  path: string;
  name: string;
  description: string;
  facilityType: "EmergencyService" | "MedicalClinic";
  streetAddress?: string;
  city: string;
  state: string;
  zip?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  serviceArea?: string[];
  image?: string;
}) {
  const facilityUrl = `${siteConfig.url}${path}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationSchema(),
      getWebsiteSchema(),
      {
        "@type": "WebPage",
        "@id": `${facilityUrl}#webpage`,
        url: facilityUrl,
        name,
        description,
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        about: { "@id": `${facilityUrl}#facility` },
      },
      {
        "@type": facilityType,
        "@id": `${facilityUrl}#facility`,
        name,
        description,
        url: facilityUrl,
        image: image || `${siteConfig.url}${siteConfig.ogImage}`,
        ...(phone ? { telephone: phone } : {}),
        ...(openingHours ? { openingHours } : {}),
        address: {
          "@type": "PostalAddress",
          ...(streetAddress ? { streetAddress } : {}),
          addressLocality: city,
          addressRegion: state,
          ...(zip ? { postalCode: zip } : {}),
          addressCountry: "US",
        },
        ...(latitude && longitude
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude,
                longitude,
              },
            }
          : {}),
        ...(serviceArea && serviceArea.length > 0
          ? {
              areaServed: serviceArea.map((area) => ({
                "@type": "City",
                name: area,
              })),
            }
          : {}),
        parentOrganization: {
          "@id": `${siteConfig.url}/#organization`,
        },
        isAcceptingNewPatients: true,
        medicalSpecialty: facilityType === "EmergencyService" ? "Emergency Medicine" : "Primary Care",
      },
    ],
  };
}

export function jsonLdScriptProps(data: unknown) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data),
    },
  };
}

export function getFAQPageSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function getHowToSchema({
  name,
  description,
  totalTime,
  steps,
}: {
  name: string;
  description: string;
  totalTime?: string; // ISO 8601 duration e.g. "P120D"
  steps: { name: string; text: string; url?: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    ...(totalTime ? { totalTime } : {}),
    step: steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
      ...(step.url ? { url: step.url } : {}),
    })),
  };
}

export function getBreadcrumbSchema(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}

export function getContactPageSchema({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationSchema(),
      getWebsiteSchema(),
      {
        "@type": "ContactPage",
        "@id": `${siteConfig.url}${path}#webpage`,
        url: `${siteConfig.url}${path}`,
        name: title,
        description,
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        about: { "@id": `${siteConfig.url}/#organization` },
        mainEntity: {
          "@type": "Organization",
          "@id": `${siteConfig.url}/#organization`,
          contactPoint: {
            "@type": "ContactPoint",
            email: siteConfig.contact.email,
            contactType: "customer service",
            areaServed: "US",
            availableLanguage: "English",
          },
        },
      },
    ],
  };
}
