import Login from "@/pages/Login";
import { generateSEOMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Admin Login",
  description: "Admin login for Focus Health insights and content management.",
  canonicalUrl: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return <Login />;
}
