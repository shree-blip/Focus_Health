"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";

// Google Client ID is a public value — safe to hardcode
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "540299638751-0ghd0f3n4m5lefmr28mree3flcuem5m3.apps.googleusercontent.com";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [creatingPassword, setCreatingPassword] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect") || "/lop";

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
  const handleSubmit = async (e: React.FormEvent) => {
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

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/lop/auth/create-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password: newPassword }),
      });

      if (!res.ok) {
        const { error: msg } = await res.json();
        setError(msg || "Failed to create password.");
        return;
      }

      setPassword(newPassword);
      setNewPassword("");
      setSuccess("Password created. You can now sign in with email and password.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setCreatingPassword(false);
    }
  };

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

      setSuccess("OTP sent to your email. Enter the 6-digit code below.");
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
          <p className="text-sm text-center text-slate-500 mb-8">Sign in to your account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg p-3 mb-4">{success}</div>
          )}

          {/* Google Sign-In */}
          <div className="flex justify-center mb-4">
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
              <span className="bg-white px-3">or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@getfocushealth.com"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs text-slate-400 uppercase">
              <span className="bg-white px-3">or login with otp</span>
            </div>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <Label htmlFor="otp-code">OTP Code</Label>
              <Input
                id="otp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button type="button" onClick={handleSendOtp} disabled={sendingOtp || !email.trim()} variant="outline" className="h-11">
                {sendingOtp ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send OTP"}
              </Button>
              <Button type="submit" disabled={verifyingOtp || !otpCode.trim()} className="h-11">
                {verifyingOtp ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify OTP"}
              </Button>
            </div>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs text-slate-400 uppercase">
              <span className="bg-white px-3">create password</span>
            </div>
          </div>

          <form onSubmit={handleCreatePassword} className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">Only admin-approved active users can create a password.</p>
            </div>

            <Button type="submit" disabled={creatingPassword || !email.trim()} variant="outline" className="w-full h-11 text-base">
              {creatingPassword ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Password"}
            </Button>
          </form>

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
