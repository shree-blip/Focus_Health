"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// MFA has been removed — redirect to /lop
export default function MfaSetupPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/lop"); }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
}
