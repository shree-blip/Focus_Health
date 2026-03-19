import { getWebPageSchema, jsonLdScriptProps } from "@/lib/structuredData";
import Script from "next/script";

interface WebPageStructuredDataProps {
  path: string;
  title: string;
  description: string;
}

export function WebPageStructuredData({
  path,
  title,
  description,
}: WebPageStructuredDataProps) {
  const data = getWebPageSchema({ path, title, description });
  const scriptId = `structured-data-webpage-${path === "/" ? "home" : path.replace(/\//g, "-").replace(/^-/, "")}`;

  return <Script id={scriptId} strategy="beforeInteractive" {...jsonLdScriptProps(data)} />;
}
