"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  ClipboardList,
  Bot,
  ChevronDown,
} from "lucide-react";
import { useLopAuth } from "./LopAuthProvider";
import { hasPermission } from "@/lib/lop/permissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { lopUser, facilities, activeFacilityId, setActiveFacilityId, signOut } = useLopAuth();

  const visibleItems = navItems.filter(
    (item) => !item.permission || hasPermission(lopUser, item.permission)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="p-5 border-b border-slate-200">
          <Link href="/lop" className="flex items-center gap-2">
            <Image
              src="/favicon.png"
              alt="Focus Health"
              width={32}
              height={32}
              className="rounded"
            />
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                LOP Dashboard
              </h1>
              <p className="text-[11px] text-slate-500">Focus Health</p>
            </div>
          </Link>
        </div>

        {/* Facility Selector */}
        {facilities.length > 1 && (
          <div className="px-4 py-3 border-b border-slate-200">
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
              Facility
            </label>
            <Select
              value={activeFacilityId ?? "all"}
              onValueChange={(v) =>
                setActiveFacilityId(v === "all" ? null : v)
              }
            >
              <SelectTrigger className="w-full h-9 text-sm">
                <SelectValue placeholder="All Facilities" />
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

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/lop"
                ? pathname === "/lop"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* AI indicator (admin only) */}
          {hasPermission(lopUser, "ai:use") && (
            <div className="pt-3 mt-3 border-t border-slate-200">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border border-indigo-100">
                <Bot className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs">AI</span>
                <span className="ml-auto relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
              </div>
            </div>
          )}
        </nav>

        {/* User info + Logout */}
        <div className="p-4 border-t border-slate-200">
          {lopUser && (
            <div className="mb-3">
              <p className="text-sm font-medium text-slate-900 truncate">
                {lopUser.full_name}
              </p>
              <p className="text-xs text-slate-500 truncate">{lopUser.email}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {lopUser.role.replace("_", " ")}
              </span>
            </div>
          )}
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-6 min-h-screen">{children}</main>
    </div>
  );
}
