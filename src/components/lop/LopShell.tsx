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
} from "lucide-react";
import { useLopAuth } from "./LopAuthProvider";
import { hasPermission } from "@/lib/lop/permissions";

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
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-[calc(100vh-2rem)] w-64 m-4 rounded-xl bg-slate-50 shadow-xl shadow-slate-200/50 flex flex-col py-8 px-4 z-30">
        {/* Brand */}
        <div className="mb-10 px-4">
          <Link href="/lop" className="block">
            <h1 className="text-xl font-bold tracking-tighter text-[#0B3B91]">Focus Health</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">LOP Dashboard</p>
          </Link>
        </div>

        {/* Main Nav */}
        <nav className="flex-grow space-y-1">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/lop"
                ? pathname === "/lop"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "text-[#0B3B91] font-bold border-r-4 border-[#D72638] bg-white/50"
                    : "text-slate-500 hover:bg-white/80"
                }`}
              >
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* AI Section */}
        {hasPermission(lopUser, "ai:use") && (
          <div className="mt-auto mb-6">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
              className="w-full p-4 rounded-xl bg-gradient-to-br from-[#0B3B91] to-[#2563EB] text-white shadow-lg hover:shadow-xl transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Assistant</span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                Analyze LOP letters or patient docs with one click.
              </p>
            </button>
          </div>
        )}

        {/* User info + Logout */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          {lopUser && (
            <div className="flex items-center gap-3 px-3 py-3 bg-white rounded-lg shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#0B3B91]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-[#0B3B91]">
                  {lopUser.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-xs font-bold truncate">{lopUser.full_name}</p>
                <p className="text-[10px] text-slate-400 truncate leading-none">{lopUser.email}</p>
              </div>
              <button
                onClick={signOut}
                title="Sign out"
                className="text-slate-400 hover:text-red-600 transition-colors flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-[17.5rem] mr-8 min-h-screen">{children}</main>
    </div>
  );
}
