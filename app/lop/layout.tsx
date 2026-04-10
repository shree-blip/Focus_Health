import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LOP Dashboard | Focus Health",
  robots: { index: false, follow: false },
};

export default function LopRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
