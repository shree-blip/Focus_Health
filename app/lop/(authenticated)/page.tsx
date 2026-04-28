"use client";

import { useCallback, useEffect, useState } from "react";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopDb } from "@/lib/lop/db";
import { useLopDbChange } from "@/hooks/lop/useLopDbChange";
import { hasPermission } from "@/lib/lop/permissions";
import { patientBilled, patientCollected } from "@/lib/lop/finance";
import { CASE_STATUS_LABELS, CASE_STATUS_COLORS, getMissingDocuments } from "@/lib/lop/types";
import type { LopCaseStatus } from "@/lib/lop/types";
import {
  Calendar,
  AlertTriangle,
  Loader2,
  Building2,
  PlusCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

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
  const { lopUser, activeFacilityId } = useLopAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPatients, setRecentPatients] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) setLoading(true);

      try {
        // Patients query
        const filters = activeFacilityId
          ? [{ column: "facility_id", op: "eq" as const, value: activeFacilityId }]
          : [];
        const { data: patients } = await lopDb.select("lop_patients", {
          select: "*, lop_patient_documents(document_type, status)",
          filters,
        });
        const all = (patients ?? []) as Record<string, unknown>[];

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

        // Financial — MTD (current calendar month)
        const now2 = new Date();
        const mtdStart = new Date(now2.getFullYear(), now2.getMonth(), 1);
        const mtdPatients = all.filter((p) => {
          const ds = p.date_of_service || p.billing_date || p.created_at;
          if (!ds) return true; // include if no date
          return new Date(ds as string) >= mtdStart;
        });
        const totalBilled = mtdPatients.reduce(
          (sum: number, p) => sum + patientBilled(p),
          0
        );
        const totalCollected = mtdPatients.reduce(
          (sum: number, p) => sum + patientCollected(p),
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
        if (!silent) setLoading(false);
      }
    },
    [activeFacilityId],
  );

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: refetch silently whenever patient/document/firm/facility data
  // changes anywhere in the app, or when this tab regains focus.
  useLopDbChange(
    ["lop_patients", "lop_patient_documents", "lop_law_firms", "lop_facilities"],
    () => load({ silent: true }),
  );

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
          <Loader2 className="h-8 w-8 animate-spin text-[#0B3B91] mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const canViewFinancial = hasPermission(lopUser, "financial:view");
  const collectionRate =
    stats && stats.totalBilled > 0
      ? Math.round((stats.totalCollected / stats.totalBilled) * 100)
      : 0;

  // Find top law firm
  const lawFirmCounts: Record<string, { name: string; count: number }> = {};
  for (const p of recentPatients) {
    const firmName = (p.lop_law_firms as Record<string, unknown>)?.name as string;
    if (!firmName) continue;
    if (!lawFirmCounts[firmName]) lawFirmCounts[firmName] = { name: firmName, count: 0 };
    lawFirmCounts[firmName].count++;
  }
  const topFirm = Object.values(lawFirmCounts).sort((a, b) => b.count - a.count)[0];

  return (
    <div className="py-8">
      {/* ── Top Bar ── */}
      <header className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-[#002668] tracking-tight font-heading">
            Welcome back, {lopUser?.full_name?.split(" ")[0]}
          </h2>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </header>

      {/* ── Metrics Bento Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {/* Primary Metric */}
        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#002668] hover:shadow-md transition-all">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total LOP Patients</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-extrabold text-[#002668]">{stats?.totalPatients ?? 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Today&apos;s Arrivals</p>
          <h3 className="text-2xl font-bold text-slate-900">{stats?.todayArrivals ?? 0}</h3>
          <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#316bf3] rounded-full transition-all"
              style={{ width: stats ? `${Math.min(100, ((stats.todayArrivals) / Math.max(1, stats.totalPatients)) * 100)}%` : "0%" }}
            />
          </div>
        </div>

        {canViewFinancial && (
          <>
            <div className="bg-white p-5 rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Total Billed</p>
              <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(stats?.totalBilled ?? 0)}</h3>
              <p className="text-[10px] text-slate-500 mt-1">MTD Performance</p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Total Collected</p>
              <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(stats?.totalCollected ?? 0)}</h3>
              <p className={`text-[10px] mt-1 font-semibold ${collectionRate >= 50 ? "text-green-600" : "text-orange-600"}`}>{collectionRate}% Ratio</p>
            </div>
          </>
        )}

        <div className="bg-white p-5 rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Open Follow-Ups</p>
          <h3 className={`text-2xl font-bold ${(stats?.openFollowUps ?? 0) === 0 ? "text-slate-300" : "text-orange-600"}`}>
            {stats?.openFollowUps ?? 0}
          </h3>
          {(stats?.openFollowUps ?? 0) === 0 && <CheckCircle className="h-5 w-5 text-green-400 mt-2" />}
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Missing Letters</p>
          <h3 className={`text-2xl font-bold ${(stats?.missingLopLetters ?? 0) === 0 ? "text-slate-300" : "text-red-600"}`}>
            {stats?.missingLopLetters ?? 0}
          </h3>
          {(stats?.missingLopLetters ?? 0) === 0 && <CheckCircle className="h-5 w-5 text-green-400 mt-2" />}
        </div>

        {/* Danger Alert */}
        {(stats?.patientsWithMissingDocs ?? 0) > 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-7 mt-2 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <span className="text-sm font-bold text-red-700">Missing Documentation Alert</span>
                <p className="text-xs text-red-600/70">{stats?.patientsWithMissingDocs} patients currently have incomplete legal or medical documentation files.</p>
              </div>
            </div>
            <Link href="/lop/patients">
              <button className="px-4 py-2 bg-gradient-to-r from-[#D72638] to-[#FF3D57] text-white text-xs font-bold rounded-lg shadow-lg hover:scale-105 transition-transform active:scale-95">
                Action Required
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* ── Content Layout ── */}
      <div className="grid grid-cols-12 gap-8 mb-12">
        {/* Recent Patients Table */}
        <section className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h4 className="font-heading font-bold text-[#002668]">Recent Patients</h4>
            <Link href="/lop/patients" className="text-xs text-[#0051d5] font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Patient</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Facility</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Law Firm</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                      No patients yet. Create the first LOP patient record.
                    </td>
                  </tr>
                ) : (
                  recentPatients.map((p) => {
                    const status = p.case_status as LopCaseStatus;
                    const initials = `${(p.first_name as string)?.[0] ?? ""}${(p.last_name as string)?.[0] ?? ""}`.toUpperCase();
                    return (
                      <tr key={p.id as string} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <Link href={`/lop/patients/${p.id}`} className="flex items-center gap-3 group/link">
                            <div className="w-8 h-8 rounded-full bg-[#0B3B91]/10 text-[#0B3B91] flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 group-hover/link:text-[#0051d5] transition-colors">
                                {p.first_name as string} {p.last_name as string}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {(p.lop_facilities as Record<string, unknown>)?.name as string ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {(p.lop_law_firms as Record<string, unknown>)?.name as string ?? "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                              CASE_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {CASE_STATUS_LABELS[status] ?? status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(p.created_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {recentPatients.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
              <p className="text-xs text-slate-400 font-medium">
                Showing {recentPatients.length} of {stats?.totalPatients ?? 0} patients
              </p>
              <Link href="/lop/patients" className="text-xs text-[#0051d5] font-semibold hover:underline">
                View all →
              </Link>
            </div>
          )}
        </section>

        {/* Right Column */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          {/* Case Status Breakdown */}
          {stats?.statusBreakdown && Object.keys(stats.statusBreakdown).length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="font-heading font-bold text-[#002668] mb-6">Case Status Breakdown</h4>
              <div className="space-y-6">
                {/* Donut chart */}
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      className="text-slate-100"
                      cx="18" cy="18" r="15.9155"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    {(() => {
                      const entries = Object.entries(stats.statusBreakdown).sort(([,a],[,b]) => b - a);
                      const total = stats.totalPatients || 1;
                      const colors = ["#316bf3", "#0B3B91", "#D72638", "#f59e0b", "#10b981", "#8b5cf6", "#64748b", "#ec4899", "#06b6d4"];
                      let offset = 0;
                      return entries.map(([, count], i) => {
                        const pct = (count / total) * 100;
                        const el = (
                          <circle
                            key={i}
                            cx="18" cy="18" r="15.9155"
                            fill="none"
                            stroke={colors[i % colors.length]}
                            strokeWidth="3"
                            strokeDasharray={`${pct} ${100 - pct}`}
                            strokeDashoffset={`${-offset}`}
                          />
                        );
                        offset += pct;
                        return el;
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-slate-900">{stats.totalPatients}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-tighter">Total cases</span>
                  </div>
                </div>

                {/* Status grid */}
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(stats.statusBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 6)
                    .map(([status, count]) => (
                      <div key={status} className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full inline-block ${
                            CASE_STATUS_COLORS[status as LopCaseStatus]?.split(" ")[0] ?? "bg-gray-200"
                          }`} />
                          <span className="text-xs font-semibold text-slate-500">
                            {CASE_STATUS_LABELS[status as LopCaseStatus] ?? status}
                          </span>
                        </div>
                        <p className="text-xl font-extrabold text-slate-900">{count}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Top Law Firm Spotlight */}
          {topFirm && (
            <div className="bg-gradient-to-br from-[#0B3B91] to-[#2563EB] p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-4">Top Referrer</h4>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg leading-tight">{topFirm.name}</h5>
                    <p className="text-xs opacity-80">{topFirm.count} Active Patients</p>
                  </div>
                </div>
                <Link href="/lop/law-firms">
                  <button className="w-full py-2 bg-white text-[#0B3B91] text-xs font-bold rounded-lg hover:bg-opacity-90 transition-all">
                    View Details
                  </button>
                </Link>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            </div>
          )}

          {/* Quick Action */}
          <div className="p-6 bg-slate-100/40 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <PlusCircle className="h-6 w-6 text-[#0B3B91]" />
            </div>
            <h5 className="text-sm font-bold text-slate-900">New LOP Case</h5>
            <p className="text-[11px] text-slate-500 mt-1 mb-4">Directly upload a letter or medical record to start a new patient case.</p>
            <Link href="/lop/patients/new" className="text-xs font-bold text-[#0B3B91] hover:underline">
              Start Enrollment
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

