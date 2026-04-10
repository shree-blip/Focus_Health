"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [exchanging, setExchanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect") || "/lop";
  const code = searchParams.get("code");
  const exchangeRan = useRef(false);

  // ———— Handle OAuth callback (code in URL) ————
  useEffect(() => {
    if (!code || exchangeRan.current) return;
    exchangeRan.current = true;
    setExchanging(true);

    (async () => {
      try {
        // Exchange the OAuth code for a session.
        // This uses the SAME browser client that stored the PKCE verifier,
        // so the verifier is guaranteed to be in the same cookie jar.
        const { data, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError || !data.session) {
          console.error("Code exchange failed:", exchangeError);
          setError(
            exchangeError?.message || "Failed to complete sign-in. Please try again."
          );
          setExchanging(false);
          return;
        }

        // Provision user server-side (service-role bypasses RLS)
        const user = data.session.user;
        await fetch("/api/lop/provision", {
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

        // Redirect to dashboard
        window.location.href = redirect;
      } catch (err) {
        console.error("Callback error:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
        setExchanging(false);
      }
    })();
  }, [code, redirect]);

  // ———— If already signed in, redirect ————
  useEffect(() => {
    if (code) return; // Don't check session if we're handling a callback
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        window.location.href = redirect;
      }
    });
  }, [redirect, code]);

  // ———— Start Google OAuth ————
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Redirect back to THIS page so the same client handles the callback
          redirectTo: `${window.location.origin}/lop/login?redirect=${encodeURIComponent(redirect)}`,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start sign-in. Please try again."
      );
      setLoading(false);
    }
  };

  // ———— Exchanging code state ————
  if (exchanging) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Completing sign-in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/favicon.png"
              alt="Focus Health"
              width={56}
              height={56}
              className="rounded-xl"
            />
          </div>

          <h1 className="text-2xl font-bold text-center text-slate-900 mb-1">
            LOP Dashboard
          </h1>
          <p className="text-sm text-center text-slate-500 mb-8">
            Sign in with your Focus Health or ER work email
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 text-base gap-3"
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Sign in with Google
          </Button>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Sign in with your organization email
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} Focus Health. Internal use only.
        </p>
      </div>
    </div>
  );
}

export default function LopLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
