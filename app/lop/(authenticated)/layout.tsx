"use client";

import { LopAuthProvider, useLopAuth } from "@/components/lop/LopAuthProvider";
import { LopShell } from "@/components/lop/LopShell";
import { Loader2 } from "lucide-react";

function LopAppContent({ children }: { children: React.ReactNode }) {
  const { isLoading, lopUser } = useLopAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading LOP Dashboard…</p>
        </div>
      </div>
    );
  }

  if (!lopUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg border p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-500 mb-4">
            Your account is not yet provisioned for the LOP Dashboard. Please
            contact your administrator to be added.
          </p>
          <a
            href="/lop/login"
            className="text-sm text-blue-600 hover:underline"
          >
            Return to login
          </a>
        </div>
      </div>
    );
  }

  return <LopShell>{children}</LopShell>;
}

export default function LopAuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LopAuthProvider>
      <LopAppContent>{children}</LopAppContent>
    </LopAuthProvider>
  );
}
