const BASE_URL = "https://getfocushealth.com";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Focus Health",
  alternateName: "Focus Healthcare LLC",
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.png`,
  description:
    "Institutional-grade healthcare infrastructure company specializing in building and operating high-performance freestanding emergency rooms across Texas.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Dexperts",
    addressLocality: "Texas",
    addressRegion: "TX",
    addressCountry: "US",
  },
  email: "info@getfocushealth.com",
  sameAs: [],
  areaServed: {
    "@type": "State",
    name: "Texas",
  },
  knowsAbout: [
    "Freestanding Emergency Rooms",
    "Healthcare Infrastructure",
    "Healthcare Investment",
    "Emergency Medical Services",
    "Healthcare Operations",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Focus Health",
  url: BASE_URL,
  description:
    "Build + Fund + Operate: Institutional-grade healthcare infrastructure made simple.",
  publisher: {
    "@type": "Organization",
    name: "Focus Health",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Freestanding Emergency Room Development",
  provider: {
    "@type": "Organization",
    name: "Focus Health",
  },
  description:
    "End-to-end turnkey healthcare solutions including site selection, construction, staffing, and operations management for freestanding emergency rooms.",
  areaServed: {
    "@type": "State",
    name: "Texas",
  },
  serviceType: [
    "Healthcare Facility Development",
    "Emergency Room Operations",
    "Healthcare Investment Management",
    "Medical Facility Construction",
  ],
  offers: {
    "@type": "Offer",
    description: "Partnership opportunities for investors and communities",
  },
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([organizationSchema, websiteSchema, serviceSchema]),
      }}
    />
  );
}

export default JsonLd;
