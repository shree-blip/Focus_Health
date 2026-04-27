"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  ClipboardList,
  Menu,
  ChevronsUpDown,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLopAuth } from "./LopAuthProvider";
import { hasPermission } from "@/lib/lop/permissions";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

const navItems: NavItem[] = [
  { href: "/lop", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lop/scheduling", label: "Scheduling", icon: Calendar, permission: "schedule:read" },
  { href: "/lop/patients", label: "Patients", icon: ClipboardList, permission: "patient:read" },
  { href: "/lop/law-firms", label: "Law Firms", icon: Building2, permission: "law_firm:read" },
  { href: "/lop/reports", label: "Reports", icon: BarChart3, permission: "reports:read" },
  { href: "/lop/settings", label: "Settings", icon: Settings, permission: "users:manage" },
];

export function LopShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { lopUser, signOut, facilities, activeFacilityId, setActiveFacilityId } = useLopAuth();

  // Profile / password-change dialog state
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  const initials = lopUser?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  function openProfile() {
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setPwdError("");
    setPwdSuccess("");
    setProfileOpen(true);
  }

  async function handleSavePassword() {
    setPwdError("");
    setPwdSuccess("");
    if (newPwd.length < 8) {
      setPwdError("New password must be at least 8 characters.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("Passwords do not match.");
      return;
    }
    setPwdSaving(true);
    try {
      const res = await fetch("/api/lop/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPwd || undefined, newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwdError(data.error ?? "Failed to update password.");
      } else {
        setPwdSuccess("Password updated successfully!");
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
      }
    } catch {
      setPwdError("Network error. Please try again.");
    } finally {
      setPwdSaving(false);
    }
  }

  const visibleItems = navItems.filter(
    (item) => !item.permission || hasPermission(lopUser, item.permission)
  );

  const renderNavLink = (item: NavItem, closeOnClick = false) => {
    const isActive =
      item.href === "/lop"
        ? pathname === "/lop"
        : pathname.startsWith(item.href);

    const link = (
      <Link
        href={item.href}
        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
          isActive
            ? "bg-white text-[#0B3B91] shadow-sm ring-1 ring-white/80"
            : "text-slate-500 hover:bg-white/80 hover:text-slate-700"
        }`}
      >
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
            isActive
              ? "bg-[#0B3B91] text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <span className="truncate">{item.label}</span>
          {isActive && (
            <span className="h-2.5 w-2.5 rounded-full bg-[#D72638]" />
          )}
        </div>
      </Link>
    );

    if (!closeOnClick) return link;

    return (
      <SheetClose asChild key={item.href}>
        {link}
      </SheetClose>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.09),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)]">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-[#f7f9fc]/90 px-4 py-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <Link href="/lop" className="min-w-0">
            <p className="font-heading text-lg font-extrabold tracking-tight text-[#0B3B91]">
              Focus Health
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
              LOP Dashboard
            </p>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-[#0B3B91] shadow-sm transition-colors hover:bg-white"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[88vw] max-w-sm border-r-0 bg-[#f7f9fc] p-0"
            >
              <div className="flex h-full flex-col p-4">
                <SheetHeader className="border-b border-slate-200 px-2 pb-6 pt-2 text-left">
                  <SheetTitle className="font-heading text-xl font-extrabold tracking-tight text-[#0B3B91]">
                    Focus Health
                  </SheetTitle>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
                    LOP Dashboard
                  </p>
                </SheetHeader>

                <nav className="mt-6 space-y-2">
                  {visibleItems.map((item) => renderNavLink(item, true))}
                </nav>

                <div className="mt-auto space-y-3 border-t border-slate-200 pt-4">
                  {lopUser && (
                    <button
                      type="button"
                      onClick={openProfile}
                      className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 shadow-sm transition-colors hover:bg-slate-50 text-left"
                    >
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0B3B91] text-sm font-bold text-white">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">{lopUser.full_name}</p>
                        <p className="truncate text-xs text-slate-500">{lopUser.email}</p>
                      </div>
                      <KeyRound className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    </button>
                  )}

                  <SheetClose asChild>
                    <button
                      onClick={signOut}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <aside className="fixed left-0 top-0 hidden h-[calc(100vh-2rem)] w-72 flex-col rounded-[28px] border border-white/70 bg-slate-50/95 px-4 py-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:m-4 lg:flex">
        {/* Brand */}
        <div className="mb-6 px-3">
          <Link href="/lop" className="block">
            <h1 className="font-heading text-xl font-extrabold tracking-tight text-[#0B3B91]">
              Focus Health
            </h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
              LOP Dashboard
            </p>
          </Link>
        </div>

        {/* Facility Selector */}
        {facilities.length > 1 && (
          <div className="mb-6 px-2">
            <label className="mb-1.5 ml-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Facility
            </label>
            <Select
              value={activeFacilityId ?? "all"}
              onValueChange={(v) => setActiveFacilityId(v === "all" ? null : v)}
            >
              <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white px-3 text-sm font-semibold shadow-sm">
                <Building2 className="h-3.5 w-3.5 text-[#0B3B91]" />
                <SelectValue placeholder="All Facilities" />
                <ChevronsUpDown className="ml-auto h-3.5 w-3.5 text-slate-400" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Facilities</SelectItem>
                {facilities.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Main Nav */}
        <nav className="flex-grow space-y-2">
          {visibleItems.map((item) => renderNavLink(item))}
        </nav>

        {/* User info + Logout */}
        <div className="mt-auto space-y-2 border-t border-slate-200 pt-4">
          {lopUser && (
            <button
              type="button"
              onClick={openProfile}
              className="flex w-full items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm transition-colors hover:bg-slate-50 text-left"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0B3B91] text-sm font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-grow">
                <p className="truncate text-sm font-bold text-slate-900">{lopUser.full_name}</p>
                <p className="truncate text-[11px] text-slate-400">{lopUser.email}</p>
              </div>
              <KeyRound className="h-4 w-4 flex-shrink-0 text-slate-400" />
            </button>
          )}
          <button
            onClick={signOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen px-4 pb-8 pt-4 lg:ml-80 lg:mr-8 lg:px-0 lg:pb-10 lg:pt-0">
        {children}
      </main>

      {/* Profile / Password Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#0B3B91]">My Profile</DialogTitle>
          </DialogHeader>

          {/* Avatar + info */}
          <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0B3B91] text-lg font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-900">{lopUser?.full_name}</p>
              <p className="truncate text-sm text-slate-500">{lopUser?.email}</p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-[#0B3B91]/70">
                {lopUser?.role}
              </p>
            </div>
          </div>

          {/* Password change */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Change Password</p>

            <div className="space-y-1">
              <Label htmlFor="current-pwd" className="text-sm font-medium text-slate-700">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="current-pwd"
                  type={showCurrent ? "text" : "password"}
                  placeholder="Leave blank if not set"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="new-pwd" className="text-sm font-medium text-slate-700">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-pwd"
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirm-pwd" className="text-sm font-medium text-slate-700">
                Confirm New Password
              </Label>
              <Input
                id="confirm-pwd"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
              />
            </div>

            {pwdError && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{pwdError}</p>
            )}
            {pwdSuccess && (
              <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-600">{pwdSuccess}</p>
            )}

            <Button
              onClick={handleSavePassword}
              disabled={pwdSaving || !newPwd}
              className="w-full bg-[#0B3B91] hover:bg-[#0a3280] text-white rounded-xl"
            >
              {pwdSaving ? "Saving…" : "Save Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
