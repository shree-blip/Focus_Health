"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const redirect = searchParams.get("redirect") || "/lop";

        if (!code) {
          setError("No authorization code received.");
          return;
        }

        // Exchange code for session using browser client (has PKCE verifier in localStorage)
        const { data, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError || !data.session) {
          console.error("Code exchange failed:", exchangeError);
          setError(exchangeError?.message || "Failed to complete sign-in.");
          return;
        }

        const user = data.session.user;

        // Provision user server-side (bypasses RLS)
        const res = await fetch("/api/lop/provision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auth_user_id: user.id,
            email: user.email,
            full_name:
              user.user_metadata?.full_name ??
              user.user_metadata?.name ??
              user.email?.split("@")[0] ??
              "Unknown",
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.error("Provision failed:", body);
          setError(body.error || "Account provisioning failed.");
          return;
        }

        // Success — redirect to dashboard
        router.replace(redirect);
      } catch (err) {
        console.error("Callback error:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Sign-in Failed</h2>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <a
            href="/lop/login"
            className="text-sm text-blue-600 hover:underline"
          >
            Try again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Completing sign-in…</p>
      </div>
    </div>
  );
}

export default function LopAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
