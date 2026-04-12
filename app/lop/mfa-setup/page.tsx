"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react";

type MfaStep = "loading" | "enroll" | "verify" | "complete";

function MfaSetupForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/lop";
  const initialStep = searchParams.get("step") as "enroll" | "verify" | null;

  const [step, setStep] = useState<MfaStep>("loading");
  const [qrUri, setQrUri] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Determine the correct step on mount
  useEffect(() => {
    const checkMfaStatus = async () => {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (!aalData) {
        setStep("enroll");
        return;
      }

      const { currentLevel, nextLevel } = aalData;

      // Already at aal2 — user is fully authenticated
      if (currentLevel === "aal2") {
        window.location.href = redirect;
        return;
      }

      // User has MFA factors but needs to verify this session
      if (nextLevel === "aal2" && currentLevel === "aal1") {
        // Find the verified TOTP factor
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors?.totp?.find((f) => f.status === "verified");
        if (totpFactor) {
          setFactorId(totpFactor.id);
          setStep("verify");
        } else {
          setStep("enroll");
        }
        return;
      }

      // No factors enrolled — or URL says enroll
      if (initialStep === "verify") {
        // Edge case: middleware said verify but no factors found
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors?.totp?.find((f) => f.status === "verified");
        if (totpFactor) {
          setFactorId(totpFactor.id);
          setStep("verify");
        } else {
          setStep("enroll");
        }
      } else {
        setStep("enroll");
      }
    };

    checkMfaStatus();
  }, [redirect, initialStep]);

  // Enroll a new TOTP factor
  const handleEnroll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Focus Health LOP",
      });

      if (enrollError) {
        setError(enrollError.message);
        setLoading(false);
        return;
      }

      if (data) {
        setFactorId(data.id);
        setQrUri(data.totp.qr_code);
        setSecret(data.totp.secret);
        setStep("enroll");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start MFA enrollment");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-start enrollment when step becomes enroll and no QR yet
  useEffect(() => {
    if (step === "enroll" && !qrUri && !loading) {
      handleEnroll();
    }
  }, [step, qrUri, loading, handleEnroll]);

  // Verify the TOTP code (for both enrollment verification and session challenge)
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || code.length < 6) return;

    setLoading(true);
    setError(null);

    try {
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError) {
        setError(challengeError.message);
        setLoading(false);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        setError("Invalid code. Please try again.");
        setCode("");
        setLoading(false);
        return;
      }

      // Success — session is now aal2
      setStep("complete");
      setTimeout(() => {
        window.location.href = redirect;
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setLoading(false);
    }
  };

  // ——————————————————————————————————————————
  // Render
  // ——————————————————————————————————————————

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Checking MFA status…</p>
        </div>
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Verified!</h2>
          <p className="text-sm text-slate-500 mt-1">Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Image
              src="/favicon.png"
              alt="Focus Health"
              width={48}
              height={48}
              className="rounded-xl"
            />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">
              {step === "enroll" && qrUri
                ? "Set Up Two-Factor Authentication"
                : "Verify Two-Factor Authentication"}
            </h1>
          </div>

          <p className="text-sm text-center text-slate-500 mb-6">
            {step === "enroll" && qrUri
              ? "HIPAA requires MFA for accessing patient data. Scan the QR code below with your authenticator app."
              : "Enter the 6-digit code from your authenticator app."}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          {/* QR Code for enrollment */}
          {step === "enroll" && qrUri && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-xl border-2 border-slate-200">
                  {/* QR code is a data URI from Supabase, not a static asset */}
                  <img
                    src={qrUri}
                    alt="Scan this QR code with your authenticator app"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
              </div>

              {/* Manual secret for copy-paste */}
              {secret && (
                <div className="bg-slate-50 rounded-lg border p-3">
                  <p className="text-xs text-slate-500 mb-1">
                    Can&apos;t scan? Enter this key manually:
                  </p>
                  <code className="text-sm font-mono text-slate-900 break-all select-all">
                    {secret}
                  </code>
                </div>
              )}

              <div className="flex items-start gap-2 bg-blue-50 rounded-lg border border-blue-100 p-3">
                <Smartphone className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  Use Google Authenticator, Authy, 1Password, or any TOTP-compatible app to scan the QR code.
                </p>
              </div>
            </div>
          )}

          {/* Verification form */}
          {(step === "verify" || (step === "enroll" && qrUri)) && (
            <form onSubmit={handleVerify} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="mfa-code"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Enter 6-digit code
                </label>
                <Input
                  id="mfa-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={code.length < 6 || loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5 mr-2" />
                    {step === "enroll" ? "Verify & Activate" : "Verify"}
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Loading state while enrolling */}
          {step === "enroll" && !qrUri && (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm text-slate-500">
                Generating your MFA key…
              </span>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Two-factor authentication is required by HIPAA for patient data access.
        </p>
      </div>
    </div>
  );
}

export default function LopMfaSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <MfaSetupForm />
    </Suspense>
  );
}
