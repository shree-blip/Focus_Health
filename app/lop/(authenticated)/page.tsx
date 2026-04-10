"use client";

import { useEffect, useState } from "react";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopClient } from "@/lib/lop/client";
import { CASE_STATUS_LABELS, CASE_STATUS_COLORS } from "@/lib/lop/types";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface DashboardStats {
  totalPatients: number;
  todayArrivals: number;
  totalBilled: number;
  totalCollected: number;
  openFollowUps: number;
  missingLopLetters: number;
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
        let query = lopClient.from("lop_patients").select("*");
        if (activeFacilityId) {
          query = query.eq("facility_id", activeFacilityId);
        }
        const { data: patients } = await query;
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

        setStats({
          totalPatients: all.length,
          todayArrivals,
          totalBilled,
          totalCollected,
          openFollowUps,
          missingLopLetters,
          statusBreakdown,
        });

        // Recent patients
        let recentQuery = lopClient
          .from("lop_patients")
          .select("*, lop_facilities(name), lop_law_firms(name)")
          .order("created_at", { ascending: false })
          .limit(10);
        if (activeFacilityId) {
          recentQuery = recentQuery.eq("facility_id", activeFacilityId);
        }
        const { data: recent } = await recentQuery;
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
        <div className="animate-pulse text-slate-400">Loading dashboard…</div>
      </div>
    );
  }

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* Alert row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
