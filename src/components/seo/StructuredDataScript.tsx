import { getOrganizationSchema, getWebsiteSchema, jsonLdScriptProps } from "@/lib/structuredData";
import Script from "next/script";

export function StructuredDataScript() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [getOrganizationSchema(), getWebsiteSchema()],
  };

  return <Script id="structured-data-global" strategy="afterInteractive" {...jsonLdScriptProps(graph)} />;
}
