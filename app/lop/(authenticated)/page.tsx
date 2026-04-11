"use client";

import { useEffect, useState } from "react";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopDb } from "@/lib/lop/db";
import { hasPermission } from "@/lib/lop/permissions";
import { CASE_STATUS_LABELS, CASE_STATUS_COLORS, getMissingDocuments, REQUIRED_DOCUMENTS } from "@/lib/lop/types";
import type { LopCaseStatus } from "@/lib/lop/types";
import {
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  FileText,
  Clock,
  TrendingUp,
  Activity,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useAiChat } from "@/hooks/lop/useAiChat";

interface DashboardStats {
  totalPatients: number;
  todayArrivals: number;
  totalBilled: number;
  totalCollected: number;
  openFollowUps: number;
  missingLopLetters: number;
  patientsWithMissingDocs: number;
  statusBreakdown: Record<LopCaseStatus, number>;
}

export default function LopDashboardPage() {
  const { lopUser, activeFacilityId, facilities } = useLopAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPatients, setRecentPatients] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        // Patients query
        const filters = activeFacilityId
          ? [{ column: "facility_id", op: "eq" as const, value: activeFacilityId }]
          : [];
        const { data: patients } = await lopDb.select("lop_patients", {
          select: "*, lop_patient_documents(document_type, status)",
          filters,
        });
        const all = patients ?? [];

        // Today's arrivals
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayArrivals = all.filter((p) => {
          if (!p.expected_arrival) return false;
          const arrival = new Date(p.expected_arrival as string);
          return arrival >= todayStart && arrival <= todayEnd;
        }).length;

        // Financial
        const totalBilled = all.reduce(
          (sum, p) => sum + (Number(p.bill_charges) || 0),
          0
        );
        const totalCollected = all.reduce(
          (sum, p) => sum + (Number(p.amount_collected) || 0),
          0
        );

        // Status counts
        const statusBreakdown = {} as Record<LopCaseStatus, number>;
        for (const p of all) {
          const s = p.case_status as LopCaseStatus;
          statusBreakdown[s] = (statusBreakdown[s] || 0) + 1;
        }

        const openFollowUps = statusBreakdown["follow_up_needed"] || 0;
        const missingLopLetters = all.filter(
          (p) => p.lop_letter_status === "requested" || p.lop_letter_status === "missing"
        ).length;

        // Count patients that have at least one required doc not yet received
        const patientsWithMissingDocs = all.filter((p) => {
          const docs = Array.isArray(p.lop_patient_documents)
            ? (p.lop_patient_documents as { document_type: string; status: string }[])
            : [];
          const checklist = getMissingDocuments(docs);
          return checklist.some((c) => c.required && c.status !== "received");
        }).length;

        setStats({
          totalPatients: all.length,
          todayArrivals,
          totalBilled,
          totalCollected,
          openFollowUps,
          missingLopLetters,
          patientsWithMissingDocs,
          statusBreakdown,
        });

        // Recent patients
        const recentFilters = activeFacilityId
          ? [{ column: "facility_id", op: "eq" as const, value: activeFacilityId }]
          : [];
        const { data: recent } = await lopDb.select("lop_patients", {
          select: "*, lop_facilities(name), lop_law_firms(name)",
          order: { column: "created_at", ascending: false },
          limit: 10,
          filters: recentFilters,
        });
        setRecentPatients((recent as Record<string, unknown>[]) ?? []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeFacilityId]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const canViewFinancial = hasPermission(lopUser, "financial:view");
  const canUseAi = hasPermission(lopUser, "ai:use");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {lopUser?.full_name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {activeFacilityId
            ? facilities.find((f) => f.id === activeFacilityId)?.name
            : "All Facilities"}{" "}
          — {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* AI Briefing Card */}
      {canUseAi && <AiBriefingCard facilityId={activeFacilityId} />}

      {/* KPI Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${canViewFinancial ? "lg:grid-cols-4" : "lg:grid-cols-2"} gap-4`}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total LOP Patients</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats?.totalPatients ?? 0}
                </p>
              </div>
              <Users className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Today&apos;s Arrivals</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats?.todayArrivals ?? 0}
                </p>
              </div>
              <Calendar className="h-10 w-10 text-cyan-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {canViewFinancial && (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Billed</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {formatCurrency(stats?.totalBilled ?? 0)}
                    </p>
                  </div>
                  <DollarSign className="h-10 w-10 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Collected</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {formatCurrency(stats?.totalCollected ?? 0)}
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-emerald-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Alert row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Open Follow-Ups
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {stats?.openFollowUps ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Missing LOP Letters
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {stats?.missingLopLetters ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Link href="/lop/patients">
          <Card className="border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Patients w/ Missing Docs
                  </p>
                  <p className="text-2xl font-bold text-red-900">
                    {stats?.patientsWithMissingDocs ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Case Status Breakdown */}
      {stats?.statusBreakdown && Object.keys(stats.statusBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-slate-500" />
              Case Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(stats.statusBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg"
                  >
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        CASE_STATUS_COLORS[status as LopCaseStatus] ??
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {count}
                    </span>
                    <span className="text-xs text-slate-600">
                      {CASE_STATUS_LABELS[status as LopCaseStatus] ?? status}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Patients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Patients</CardTitle>
          <Link
            href="/lop/patients"
            className="text-sm text-blue-600 hover:underline"
          >
            View all →
          </Link>
        </CardHeader>
        <CardContent>
          {recentPatients.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">
              No patients yet. Create the first LOP patient record.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="pb-2 font-medium text-slate-500">Patient</th>
                    <th className="pb-2 font-medium text-slate-500">Facility</th>
                    <th className="pb-2 font-medium text-slate-500">Law Firm</th>
                    <th className="pb-2 font-medium text-slate-500">Status</th>
                    <th className="pb-2 font-medium text-slate-500">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPatients.map((p) => {
                    const status = p.case_status as LopCaseStatus;
                    return (
                      <tr key={p.id as string} className="hover:bg-slate-50">
                        <td className="py-3">
                          <Link
                            href={`/lop/patients/${p.id}`}
                            className="font-medium text-slate-900 hover:text-blue-600"
                          >
                            {p.first_name as string} {p.last_name as string}
                          </Link>
                        </td>
                        <td className="py-3 text-slate-600">
                          {(p.lop_facilities as Record<string, unknown>)?.name as string ?? "—"}
                        </td>
                        <td className="py-3 text-slate-600">
                          {(p.lop_law_firms as Record<string, unknown>)?.name as string ?? "—"}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              CASE_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {CASE_STATUS_LABELS[status] ?? status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">
                          {new Date(p.created_at as string).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** AI Briefing sub-component — auto-generates a daily summary */
function AiBriefingCard({ facilityId }: { facilityId: string | null }) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lop-ai-briefing-collapsed") === "true";
    }
    return false;
  });
  const [triggered, setTriggered] = useState(false);

  const { messages, isLoading, append, setMessages } = useAiChat({
    contextType: "dashboard_briefing",
  });

  // Auto-trigger briefing on first render (if not collapsed)
  useEffect(() => {
    if (!collapsed && !triggered && messages.length === 0) {
      setTriggered(true);
      append({ role: "user", content: "Generate today's operational briefing." });
    }
  }, [collapsed, triggered, messages.length, append]);

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("lop-ai-briefing-collapsed", String(next));
    // Trigger on expand if never triggered
    if (!next && !triggered && messages.length === 0) {
      setTriggered(true);
      append({ role: "user", content: "Generate today's operational briefing." });
    }
  };

  const handleRefresh = () => {
    setMessages([]);
    setTriggered(false);
    setTimeout(() => {
      setTriggered(true);
      append({ role: "user", content: "Generate today's operational briefing." });
    }, 100);
  };

  const aiResponse = messages.find((m) => m.role === "assistant")?.content;

  return (
    <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50/50 to-blue-50/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-indigo-900">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            AI Daily Briefing
            <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-normal">
              GPT-4o
            </span>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Regenerate briefing"
            >
              <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100"
              onClick={handleToggle}
            >
              {collapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent>
          {isLoading && !aiResponse ? (
            <div className="flex items-center gap-2 text-indigo-600 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Analyzing your data…</span>
            </div>
          ) : aiResponse ? (
            <div className="prose prose-sm prose-slate max-w-none text-sm [&>*:first-child]:mt-0">
              <AiBriefingMarkdown content={aiResponse} />
            </div>
          ) : (
            <p className="text-sm text-indigo-500">Click refresh to generate a briefing.</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

/** Simple markdown renderer for the briefing card */
function AiBriefingMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      elements.push(<h4 key={i} className="font-semibold text-sm mt-3 mb-1 text-indigo-900">{boldInline(line.slice(4))}</h4>);
    } else if (line.startsWith("## ")) {
      elements.push(<h3 key={i} className="font-bold text-sm mt-3 mb-1 text-indigo-900">{boldInline(line.slice(3))}</h3>);
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <div key={i} className="flex gap-2 ml-1 my-0.5 text-slate-700">
          <span className="text-indigo-400 flex-shrink-0">{line.match(/^\d+/)?.[0]}.</span>
          <span>{boldInline(line.replace(/^\d+\.\s/, ""))}</span>
        </div>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={i} className="flex gap-2 ml-1 my-0.5 text-slate-700">
          <span className="text-indigo-400 flex-shrink-0">•</span>
          <span>{boldInline(line.slice(2))}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(<p key={i} className="my-0.5 text-slate-700">{boldInline(line)}</p>);
    }
  }
  return <>{elements}</>;
}

function boldInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(<strong key={match.index}>{match[0].slice(2, -2)}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : text;
}