"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, KeyRound, Mail } from "lucide-react";

// Google Client ID is a public value — safe to hardcode
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1075627982134-d0d7rc5lervhic878otmcunl9l5skb5a.apps.googleusercontent.com";

type Method = "password" | "otp";

function LoginForm() {
  const [method, setMethod] = useState<Method>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect") || "/lop";

  const switchMethod = (next: Method) => {
    if (next === method) return;
    setMethod(next);
    setError(null);
    setSuccess(null);
  };

  // ── Google login ──────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Google sign-in failed. Please try again.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/lop/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      if (res.ok) {
        router.push(redirect);
      } else {
        const { error: msg } = await res.json();
        setError(msg || "Google sign-in failed. Your account may not have LOP access.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in was cancelled or failed. Please try again.");
  };

  // ── Email/password login ──────────────────────────────────────────────────
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/lop/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push(redirect);
      } else {
        const { error: msg } = await res.json();
        setError(msg || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP login ─────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }

    setSendingOtp(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/lop/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const { error: msg } = await res.json();
        setError(msg || "Failed to send OTP.");
        return;
      }

      setOtpSent(true);
      setSuccess("Code sent. Check your email for the 6-digit code.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    setVerifyingOtp(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/lop/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, code: otpCode }),
      });

      if (!res.ok) {
        const { error: msg } = await res.json();
        setError(msg || "Invalid or expired OTP code.");
        return;
      }

      router.push(redirect);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex justify-center mb-6">
            <Image src="/favicon.png" alt="Focus Health" width={56} height={56} className="rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-1">LOP Dashboard</h1>
          <p className="text-sm text-center text-slate-500 mb-6">Sign in to your account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg p-3 mb-4">{success}</div>
          )}

          {/* Google Sign-In */}
          <div className="flex justify-center mb-5">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              size="large"
              width="368"
              text="signin_with"
            />
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs text-slate-400 uppercase">
              <span className="bg-white px-3">or use email</span>
            </div>
          </div>

          {/* Email (shared between password + OTP) */}
          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@getfocushealth.com"
              autoComplete="email"
              required
              className="mt-1"
            />
          </div>

          {/* Method toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg mb-4">
            <button
              type="button"
              onClick={() => switchMethod("password")}
              className={`flex items-center justify-center gap-1.5 h-9 text-sm font-medium rounded-md transition ${
                method === "password"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              Password
            </button>
            <button
              type="button"
              onClick={() => switchMethod("otp")}
              className={`flex items-center justify-center gap-1.5 h-9 text-sm font-medium rounded-md transition ${
                method === "otp"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Email Code
            </button>
          </div>

          {method === "password" ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 text-base">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {!otpSent ? (
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !email.trim()}
                  className="w-full h-11 text-base"
                >
                  {sendingOtp ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Code"}
                </Button>
              ) : (
                <>
                  <div>
                    <Label htmlFor="otp-code">6-digit code</Label>
                    <Input
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      autoComplete="one-time-code"
                      autoFocus
                      className="mt-1 tracking-[0.4em] text-center text-lg font-semibold"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={verifyingOtp || otpCode.length !== 6} className="w-full h-11 text-base">
                    {verifyingOtp ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Sign In"}
                  </Button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="w-full text-xs text-slate-500 hover:text-slate-700 disabled:opacity-50"
                  >
                    {sendingOtp ? "Sending…" : "Resend code"}
                  </button>
                </>
              )}
            </form>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">
            Contact your administrator if you need access.
          </p>
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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </GoogleOAuthProvider>
  );
}
