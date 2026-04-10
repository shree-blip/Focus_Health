"use client";

import { useEffect, useState, useMemo } from "react";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopDb } from "@/lib/lop/db";
import { CASE_STATUS_LABELS } from "@/lib/lop/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const { activeFacilityId, facilities } = useLopAuth();
  const [patients, setPatients] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState("ytd");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
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
      setLoading(true);
      const range =
        datePreset === "custom"
          ? { from: customFrom, to: customTo }
          : getDateRange(datePreset);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">
            Financial analytics across all facilities
          </p>
        </div>
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
    </div>
  );
}
