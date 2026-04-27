"use client";

import type { ReactNode } from "react";
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
  Bot,
  Menu,
  ChevronsUpDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const renderAssistantButton = () => (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
      className="w-full rounded-2xl bg-gradient-to-br from-[#D72638] via-[#ef4444] to-[#ff6b6b] p-4 text-left text-white shadow-[0_18px_40px_rgba(215,38,56,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(215,38,56,0.28)]"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em]">AI Assistant</p>
          <p className="text-[11px] text-white/80">Document insights</p>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-white/90">
        Analyze LOP letters, missing docs, and patient readiness in one place.
      </p>
    </button>
  );

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

                {hasPermission(lopUser, "ai:use") && (
                  <div className="mt-6">{renderAssistantButton()}</div>
                )}

                <div className="mt-auto space-y-3 border-t border-slate-200 pt-4">
                  {lopUser && (
                    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B3B91] text-sm font-bold text-white">
                        {lopUser.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">{lopUser.full_name}</p>
                        <p className="truncate text-xs text-slate-500">{lopUser.email}</p>
                      </div>
                    </div>
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

        {/* AI Section */}
        {hasPermission(lopUser, "ai:use") && (
          <div className="mt-auto mb-6">
            {renderAssistantButton()}
          </div>
        )}

        {/* User info + Logout */}
        <div className="space-y-2 border-t border-slate-200 pt-4">
          {lopUser && (
            <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0B3B91] text-sm font-bold text-white">
                <span>
                  {lopUser.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-grow">
                <p className="truncate text-sm font-bold text-slate-900">{lopUser.full_name}</p>
                <p className="truncate text-[11px] text-slate-400">{lopUser.email}</p>
              </div>
            </div>
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
    </div>
  );
}
