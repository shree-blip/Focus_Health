import Login from "@/pages/Login";
import { generateSEOMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Admin Login",
  description: "Admin login for Focus Health blog and content management",
  noIndex: true,
});

export default function LoginPage() {
  return <Login />;
}
