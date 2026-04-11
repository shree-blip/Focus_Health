"use client";

import { useEffect, useState, useMemo } from "react";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopDb } from "@/lib/lop/db";
import { hasPermission } from "@/lib/lop/permissions";
import { CASE_STATUS_LABELS } from "@/lib/lop/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAiChat } from "@/hooks/lop/useAiChat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  Download,
  Filter,
  Loader2,
  Sparkles,
  RotateCcw,
  X,
} from "lucide-react";

// Date range presets
function getDateRange(preset: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0];
  let from = "";

  switch (preset) {
    case "wtd": {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay()); // Sunday start
      from = d.toISOString().split("T")[0];
      break;
    }
    case "mtd": {
      from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      break;
    }
    case "qtd": {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      from = `${now.getFullYear()}-${String(qMonth + 1).padStart(2, "0")}-01`;
      break;
    }
    case "ytd": {
      from = `${now.getFullYear()}-01-01`;
      break;
    }
    case "all":
    default:
      from = "2020-01-01";
  }
  return { from, to };
}

interface LawFirmMetric {
  firmId: string;
  firmName: string;
  patientCount: number;
  totalBilled: number;
  totalCollected: number;
  avgBilled: number;
  avgCollected: number;
  belowThreshold: boolean;
}

export default function ReportsPage() {
  const { lopUser, activeFacilityId, facilities } = useLopAuth();
  const [patients, setPatients] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState("ytd");
  const [customFrom, setCustomFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [customTo, setCustomTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [facilityFilter, setFacilityFilter] = useState<string>("all");
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lowThreshold, setLowThreshold] = useState(3000);

  // Load config threshold on mount
  useEffect(() => {
    lopDb
      .select("lop_config", {
        select: "value",
        filters: [{ column: "key", op: "eq", value: "low_collection_threshold" }],
        single: true,
      })
      .then(({ data }) => {
        if (data?.value) setLowThreshold(Number(data.value) || 3000);
      });
  }, []);

  useEffect(() => {
    const load = async () => {
      const range =
        datePreset === "custom"
          ? { from: customFrom, to: customTo }
          : getDateRange(datePreset);

      // Don't fetch if custom range has empty dates
      if (datePreset === "custom" && (!range.from || !range.to)) return;

      setLoading(true);
      const filters: { column: string; op: "eq" | "gte" | "lte"; value: unknown }[] = [
        { column: "created_at", op: "gte", value: range.from },
        { column: "created_at", op: "lte", value: range.to + "T23:59:59" },
      ];

      const effectiveFacility = activeFacilityId || (facilityFilter !== "all" ? facilityFilter : null);
      if (effectiveFacility) {
        filters.push({ column: "facility_id", op: "eq", value: effectiveFacility });
      }

      const { data } = await lopDb.select("lop_patients", {
        select: "*, lop_facilities(name), lop_law_firms(id, name)",
        filters,
      });
      setPatients((data as Record<string, unknown>[]) ?? []);
      setLoading(false);
    };
    load();
  }, [datePreset, customFrom, customTo, activeFacilityId, facilityFilter]);

  // Compute metrics
  const filteredPatients = useMemo(() => {
    let result = patients;
    if (nameFilter.trim()) {
      const q = nameFilter.toLowerCase();
      result = result.filter(
        (p) =>
          ((p.first_name as string) ?? "").toLowerCase().includes(q) ||
          ((p.last_name as string) ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((p) => p.case_status === statusFilter);
    }
    return result;
  }, [patients, nameFilter, statusFilter]);

  const metrics = useMemo(() => {
    const totalPatients = filteredPatients.length;
    const totalBilled = filteredPatients.reduce((s, p) => s + (Number(p.bill_charges) || 0), 0);
    const totalCollected = filteredPatients.reduce((s, p) => s + (Number(p.amount_collected) || 0), 0);
    const avgBilled = totalPatients > 0 ? totalBilled / totalPatients : 0;
    const avgCollected = totalPatients > 0 ? totalCollected / totalPatients : 0;

    const openFollowUps = filteredPatients.filter((p) => p.case_status === "follow_up_needed").length;
    const droppedCases = filteredPatients.filter(
      (p) => p.case_status === "case_dropped" || p.case_status === "closed_no_recovery"
    ).length;
    const missingLop = filteredPatients.filter(
      (p) => p.lop_letter_status === "requested" || p.lop_letter_status === "missing"
    ).length;

    // By law firm
    const firmMap: Record<string, LawFirmMetric> = {};
    for (const p of filteredPatients) {
      const firm = p.lop_law_firms as Record<string, unknown> | null;
      if (!firm?.id) continue;
      const fid = firm.id as string;
      if (!firmMap[fid]) {
        firmMap[fid] = {
          firmId: fid,
          firmName: firm.name as string,
          patientCount: 0,
          totalBilled: 0,
          totalCollected: 0,
          avgBilled: 0,
          avgCollected: 0,
          belowThreshold: false,
        };
      }
      firmMap[fid].patientCount++;
      firmMap[fid].totalBilled += Number(p.bill_charges) || 0;
      firmMap[fid].totalCollected += Number(p.amount_collected) || 0;
    }

    const firmMetrics = Object.values(firmMap).map((m) => ({
      ...m,
      avgBilled: m.patientCount > 0 ? m.totalBilled / m.patientCount : 0,
      avgCollected: m.patientCount > 0 ? m.totalCollected / m.patientCount : 0,
      belowThreshold:
        m.patientCount > 0 &&
        m.totalCollected / m.patientCount < lowThreshold,
    }));

    firmMetrics.sort((a, b) => b.totalCollected - a.totalCollected);

    // By facility
    const facMap: Record<string, { name: string; count: number; billed: number; collected: number }> = {};
    for (const p of filteredPatients) {
      const fac = p.lop_facilities as Record<string, unknown> | null;
      const fid = p.facility_id as string;
      if (!facMap[fid]) {
        facMap[fid] = {
          name: (fac?.name as string) ?? "Unknown",
          count: 0,
          billed: 0,
          collected: 0,
        };
      }
      facMap[fid].count++;
      facMap[fid].billed += Number(p.bill_charges) || 0;
      facMap[fid].collected += Number(p.amount_collected) || 0;
    }
    const facilityMetrics = Object.values(facMap);

    return {
      totalPatients,
      totalBilled,
      totalCollected,
      avgBilled,
      avgCollected,
      openFollowUps,
      droppedCases,
      missingLop,
      firmMetrics,
      facilityMetrics,
    };
  }, [filteredPatients, lowThreshold]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const alertFirms = metrics.firmMetrics.filter((f) => f.belowThreshold);
  const canUseAi = hasPermission(lopUser, "ai:use");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const handleExportCsv = () => {
    const rows = filteredPatients.map((p) => ({
      first_name: p.first_name ?? "",
      last_name: p.last_name ?? "",
      facility: (p.lop_facilities as Record<string, unknown>)?.name ?? "",
      law_firm: (p.lop_law_firms as Record<string, unknown>)?.name ?? "",
      case_status: p.case_status ?? "",
      lop_letter_status: p.lop_letter_status ?? "",
      bill_charges: p.bill_charges ?? "",
      amount_collected: p.amount_collected ?? "",
      date_of_accident: p.date_of_accident ?? "",
      created_at: p.created_at ?? "",
    }));
    const header = Object.keys(rows[0] ?? {}).join(",");
    const csv =
      header +
      "\n" +
      rows
        .map((r) =>
          Object.values(r)
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lop-report-${datePreset}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Page-level permission guard
  if (!hasPermission(lopUser, "reports:read")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-orange-500 mx-auto mb-3" />
          <p className="text-lg font-medium text-slate-700">Access Restricted</p>
          <p className="text-sm text-slate-400 mt-1">
            Reports are available to Accounting and Admin roles only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">
            Financial analytics across all facilities
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canUseAi && (
            <Button
              variant="outline"
              className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-900 hover:border-indigo-300"
              onClick={() => setAiPanelOpen(true)}
            >
              <Sparkles className="h-4 w-4" />
              AI Analysis
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportCsv}
            disabled={filteredPatients.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Date Range
              </label>
              <Select value={datePreset} onValueChange={setDatePreset}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wtd">Week to Date</SelectItem>
                  <SelectItem value="mtd">Month to Date</SelectItem>
                  <SelectItem value="qtd">Quarter to Date</SelectItem>
                  <SelectItem value="ytd">Year to Date</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {datePreset === "custom" && (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">
                    From
                  </label>
                  <Input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-auto"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">
                    To
                  </label>
                  <Input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-auto"
                  />
                </div>
              </>
            )}

            {!activeFacilityId && facilities.length > 1 && (
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Facility
                </label>
                <Select value={facilityFilter} onValueChange={setFacilityFilter}>
                  <SelectTrigger className="w-[200px]">
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

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Patient Name
              </label>
              <Input
                placeholder="Search by name..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-[180px]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Case Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(CASE_STATUS_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Active filter summary */}
          {(nameFilter || statusFilter !== "all" || facilityFilter !== "all" || datePreset !== "ytd") && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Active:</span>
              {datePreset !== "ytd" && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {datePreset === "custom"
                    ? `${customFrom} → ${customTo}`
                    : datePreset === "wtd" ? "Week to Date"
                    : datePreset === "mtd" ? "Month to Date"
                    : datePreset === "qtd" ? "Quarter to Date"
                    : datePreset === "all" ? "All Time" : datePreset}
                </span>
              )}
              {facilityFilter !== "all" && (
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  {facilities.find((f) => f.id === facilityFilter)?.name ?? "Facility"}
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                  {CASE_STATUS_LABELS[statusFilter as keyof typeof CASE_STATUS_LABELS] ?? statusFilter}
                </span>
              )}
              {nameFilter && (
                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                  &quot;{nameFilter}&quot;
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-500 hover:text-slate-700 h-6 px-2 ml-auto"
                onClick={() => {
                  setDatePreset("ytd");
                  setFacilityFilter("all");
                  setStatusFilter("all");
                  setNameFilter("");
                }}
              >
                Clear all
              </Button>
            </div>
          )}
          {/* Result count */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{filteredPatients.length}</span> patient{filteredPatients.length !== 1 ? "s" : ""}
              {patients.length !== filteredPatients.length && (
                <> of {patients.length} loaded</>
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading reports…</p>
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-slate-500">Total Patients</p>
                <p className="text-2xl font-bold">{metrics.totalPatients}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-slate-500">Total Billed</p>
                <p className="text-2xl font-bold">{fmt(metrics.totalBilled)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-slate-500">Total Collected</p>
                <p className="text-2xl font-bold text-green-700">
                  {fmt(metrics.totalCollected)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-slate-500">Avg Billed / Patient</p>
                <p className="text-2xl font-bold">{fmt(metrics.avgBilled)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-slate-500">Avg Collected / Patient</p>
                <p className="text-2xl font-bold">{fmt(metrics.avgCollected)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-5 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-xs text-slate-500">Open Follow-Ups</p>
                  <p className="text-xl font-bold">{metrics.openFollowUps}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 flex items-center gap-3">
                <Users className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-xs text-slate-500">Dropped Cases</p>
                  <p className="text-xl font-bold">{metrics.droppedCases}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xs text-slate-500">Missing LOP Letters</p>
                  <p className="text-xl font-bold">{metrics.missingLop}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Low-performing law firm alert */}
          {alertFirms.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Low-Performing Law Firms (Below {fmt(lowThreshold)} avg collected/patient)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alertFirms.map((f) => (
                    <div
                      key={f.firmId}
                      className="flex items-center justify-between p-2 bg-white rounded border border-red-100"
                    >
                      <span className="font-medium text-slate-900">{f.firmName}</span>
                      <div className="text-sm text-right">
                        <span className="text-red-700 font-semibold">
                          {fmt(f.avgCollected)}
                        </span>
                        <span className="text-slate-400 ml-2">
                          ({f.patientCount} patient{f.patientCount !== 1 ? "s" : ""})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Collections by Law Firm */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Collections by Law Firm</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.firmMetrics.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">
                  No data with assigned law firms.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 font-medium text-slate-500">Firm</th>
                        <th className="pb-2 font-medium text-slate-500 text-right">Patients</th>
                        <th className="pb-2 font-medium text-slate-500 text-right">Total Billed</th>
                        <th className="pb-2 font-medium text-slate-500 text-right">Total Collected</th>
                        <th className="pb-2 font-medium text-slate-500 text-right">Avg Billed</th>
                        <th className="pb-2 font-medium text-slate-500 text-right">Avg Collected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {metrics.firmMetrics.map((f) => (
                        <tr
                          key={f.firmId}
                          className={`${f.belowThreshold ? "bg-red-50" : "hover:bg-slate-50"}`}
                        >
                          <td className="py-2 font-medium text-slate-900">
                            {f.firmName}
                            {f.belowThreshold && (
                              <AlertTriangle className="inline h-3.5 w-3.5 text-red-500 ml-1.5" />
                            )}
                          </td>
                          <td className="py-2 text-right text-slate-600">{f.patientCount}</td>
                          <td className="py-2 text-right text-slate-600">{fmt(f.totalBilled)}</td>
                          <td className="py-2 text-right text-slate-600">{fmt(f.totalCollected)}</td>
                          <td className="py-2 text-right text-slate-600">{fmt(f.avgBilled)}</td>
                          <td className={`py-2 text-right font-medium ${f.belowThreshold ? "text-red-700" : "text-slate-900"}`}>
                            {fmt(f.avgCollected)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Facility Totals */}
          {metrics.facilityMetrics.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Facility Totals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 font-medium text-slate-500">Facility</th>
                        <th className="pb-2 font-medium text-slate-500 text-right">Patients</th>
                        <th className="pb-2 font-medium text-slate-500 text-right">Total Billed</th>
                        <th className="pb-2 font-medium text-slate-500 text-right">Total Collected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {metrics.facilityMetrics.map((f) => (
                        <tr key={f.name} className="hover:bg-slate-50">
                          <td className="py-2 font-medium text-slate-900">{f.name}</td>
                          <td className="py-2 text-right text-slate-600">{f.count}</td>
                          <td className="py-2 text-right text-slate-600">{fmt(f.billed)}</td>
                          <td className="py-2 text-right text-slate-600">{fmt(f.collected)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* AI Analysis Slide-over */}
      {canUseAi && aiPanelOpen && (
        <ReportsAiPanel
          metrics={metrics}
          datePreset={datePreset}
          onClose={() => setAiPanelOpen(false)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reports AI Analysis Panel                                          */
/* ------------------------------------------------------------------ */
function ReportsAiPanel({
  metrics,
  datePreset,
  onClose,
}: {
  metrics: {
    totalPatients: number;
    totalBilled: number;
    totalCollected: number;
    avgBilled: number;
    avgCollected: number;
    openFollowUps: number;
    droppedCases: number;
    missingLop: number;
    firmMetrics: LawFirmMetric[];
    facilityMetrics: { name: string; count: number; billed: number; collected: number }[];
  };
  datePreset: string;
  onClose: () => void;
}) {
  const [triggered, setTriggered] = useState(false);
  const reportData = useMemo(
    () =>
      JSON.stringify({
        dateRange: datePreset,
        kpis: {
          totalPatients: metrics.totalPatients,
          totalBilled: metrics.totalBilled,
          totalCollected: metrics.totalCollected,
          avgBilled: metrics.avgBilled,
          avgCollected: metrics.avgCollected,
          openFollowUps: metrics.openFollowUps,
          droppedCases: metrics.droppedCases,
          missingLop: metrics.missingLop,
        },
        lawFirmBreakdown: metrics.firmMetrics.map((f) => ({
          firm: f.firmName,
          patients: f.patientCount,
          billed: f.totalBilled,
          collected: f.totalCollected,
          avgCollected: f.avgCollected,
          belowThreshold: f.belowThreshold,
        })),
        facilityBreakdown: metrics.facilityMetrics,
      }),
    [metrics, datePreset]
  );

  const { messages, isLoading, append, setMessages } = useAiChat({
    contextType: "reports_analysis",
    reportData: reportData,
  });

  useEffect(() => {
    if (!triggered && messages.length === 0) {
      setTriggered(true);
      append({
        role: "user",
        content:
          "Analyze these report metrics and provide actionable insights, revenue optimization suggestions, and risk flags.",
      });
    }
  }, [triggered, messages.length, append]);

  const handleRegenerate = () => {
    setMessages([]);
    setTriggered(false);
    setTimeout(() => {
      setTriggered(true);
      append({
        role: "user",
        content:
          "Analyze these report metrics and provide actionable insights, revenue optimization suggestions, and risk flags.",
      });
    }, 100);
  };

  const aiResponse = messages.find((m) => m.role === "assistant")?.content;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <span className="font-semibold text-indigo-900">AI Report Analysis</span>
          <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
            GPT-4o
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-indigo-500 hover:text-indigo-700"
            onClick={handleRegenerate}
            disabled={isLoading}
          >
            <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-500 hover:text-slate-700"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <ScrollArea className="flex-1 p-4">
        {isLoading && !aiResponse ? (
          <div className="flex items-center gap-2 text-indigo-600 py-8">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Analyzing report data…</span>
          </div>
        ) : aiResponse ? (
          <div className="prose prose-sm prose-slate max-w-none text-sm [&>*:first-child]:mt-0">
            <ReportsAiMarkdown content={aiResponse} />
          </div>
        ) : (
          <p className="text-sm text-indigo-500">Click refresh to re-analyze.</p>
        )}
      </ScrollArea>
    </div>
  );
}

function ReportsAiMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      elements.push(<h4 key={i} className="font-semibold text-sm mt-3 mb-1 text-indigo-900">{rBold(line.slice(4))}</h4>);
    } else if (line.startsWith("## ")) {
      elements.push(<h3 key={i} className="font-bold text-sm mt-3 mb-1 text-indigo-900">{rBold(line.slice(3))}</h3>);
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <div key={i} className="flex gap-2 ml-1 my-0.5 text-slate-700">
          <span className="text-indigo-400 flex-shrink-0">{line.match(/^\d+/)?.[0]}.</span>
          <span>{rBold(line.replace(/^\d+\.\s/, ""))}</span>
        </div>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={i} className="flex gap-2 ml-1 my-0.5 text-slate-700">
          <span className="text-indigo-400 flex-shrink-0">•</span>
          <span>{rBold(line.slice(2))}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(<p key={i} className="my-0.5 text-slate-700">{rBold(line)}</p>);
    }
  }
  return <>{elements}</>;
}

function rBold(text: string): React.ReactNode {
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
