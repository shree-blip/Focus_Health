"use client";

import { useEffect, useMemo, useState } from "react";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopDb } from "@/lib/lop/db";
import { hasPermission } from "@/lib/lop/permissions";
import { CASE_STATUS_LABELS } from "@/lib/lop/types";
import {
  AGING_BUCKETS,
  type AgingBreakdown,
  agingBreakdown,
  avgDaysToPayment,
  patientBilled,
  patientCollected,
  reductionStats,
} from "@/lib/lop/finance";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarDays,
  Clock,
  Download,
  Loader2,
  Search,
  TrendingDown,
  Users,
} from "lucide-react";

function getDateRange(preset: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0];
  let from = "";

  switch (preset) {
    case "wtd": {
      const current = new Date(now);
      current.setDate(current.getDate() - current.getDay());
      from = current.toISOString().split("T")[0];
      break;
    }
    case "mtd": {
      from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      break;
    }
    case "qtd": {
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      from = `${now.getFullYear()}-${String(quarterMonth + 1).padStart(2, "0")}-01`;
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

function getPresetLabel(
  preset: string,
  customFrom: string,
  customTo: string
) {
  switch (preset) {
    case "wtd":
      return "Week to Date";
    case "mtd":
      return "Month to Date";
    case "qtd":
      return "Quarter to Date";
    case "ytd":
      return "Year to Date";
    case "all":
      return "All Time";
    case "custom":
      return customFrom && customTo ? `${customFrom} → ${customTo}` : "Custom Range";
    default:
      return preset;
  }
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

interface ReportsMetrics {
  totalPatients: number;
  totalBilled: number;
  totalCollected: number;
  avgBilled: number;
  avgCollected: number;
  avgReduction: number;
  avgReductionPct: number;
  avgDaysToPayment: number;
  aging: AgingBreakdown;
  openFollowUps: number;
  droppedCases: number;
  missingLop: number;
  firmMetrics: LawFirmMetric[];
  facilityMetrics: { name: string; count: number; billed: number; collected: number }[];
}

export default function ReportsPage() {
  const { lopUser, activeFacilityId, facilities } = useLopAuth();
  const [patients, setPatients] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState("ytd");
  const [customFrom, setCustomFrom] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [customTo, setCustomTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [facilityFilter, setFacilityFilter] = useState<string>("all");
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lowThreshold, setLowThreshold] = useState(3000);
  const [firmSearch, setFirmSearch] = useState("");
  const [showFirmSearch, setShowFirmSearch] = useState(false);


  useEffect(() => {
    void lopDb
      .select("lop_config", {
        select: "value",
        filters: [{ column: "key", op: "eq", value: "low_collection_threshold" }],
        single: true,
      })
      .then(({ data }) => {
        if ((data as { value?: unknown } | null)?.value) {
          setLowThreshold(Number((data as { value: unknown }).value) || 3000);
        }
      });
  }, []);

  useEffect(() => {
    const loadReports = async () => {
      const range =
        datePreset === "custom"
          ? { from: customFrom, to: customTo }
          : getDateRange(datePreset);

      if (datePreset === "custom" && (!range.from || !range.to)) return;

      setLoading(true);

      // No date filter for "all" — fetch everything
      const baseFilters: Array<{
        column: string;
        op: "eq" | "gte" | "lte";
        value: unknown;
      }> = datePreset === "all" ? [] : [
        { column: "date_of_service", op: "gte", value: range.from },
        { column: "date_of_service", op: "lte", value: `${range.to}T23:59:59` },
      ];

      const effectiveFacility =
        activeFacilityId || (facilityFilter !== "all" ? facilityFilter : null);

      if (effectiveFacility) {
        baseFilters.push({ column: "facility_id", op: "eq", value: effectiveFacility });
      }

      const { data } = await lopDb.select("lop_patients", {
        select: "id, first_name, last_name, case_status, lop_letter_status, facility_id, law_firm_id, created_at, date_of_service, bill_charges, amount_collected, reduction_amount, billing_date, date_paid, llc_billed_charges, pllc_billed_charges, total_received_llc, total_received_pllc, mrn, disposition_status, chief_complaint, primary_insurance, referral_source, is_lop_case, lop_facilities(name), lop_law_firms(id, name)",
        filters: baseFilters,
      });

      setPatients((data as Record<string, unknown>[]) ?? []);
      setLoading(false);
    };

    void loadReports();
  }, [datePreset, customFrom, customTo, activeFacilityId, facilityFilter]);

  const filteredPatients = useMemo(() => {
    let result = patients;

    if (nameFilter.trim()) {
      const query = nameFilter.toLowerCase();
      result = result.filter(
        (patient) =>
          ((patient.first_name as string) ?? "").toLowerCase().includes(query) ||
          ((patient.last_name as string) ?? "").toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((patient) => patient.case_status === statusFilter);
    }

    return result;
  }, [patients, nameFilter, statusFilter]);

  const metrics = useMemo<ReportsMetrics>(() => {
    const totalPatients = filteredPatients.length;
    const totalBilled = filteredPatients.reduce((sum, p) => sum + patientBilled(p), 0);
    const totalCollected = filteredPatients.reduce((sum, p) => sum + patientCollected(p), 0);
    const avgBilled = totalPatients > 0 ? totalBilled / totalPatients : 0;
    const avgCollected = totalPatients > 0 ? totalCollected / totalPatients : 0;

    const reduction = reductionStats(filteredPatients);
    const avgDays = avgDaysToPayment(filteredPatients);
    const aging = agingBreakdown(filteredPatients);

    const openFollowUps = filteredPatients.filter(
      (patient) => patient.case_status === "follow_up_needed"
    ).length;
    const droppedCases = filteredPatients.filter(
      (patient) =>
        patient.case_status === "case_dropped" ||
        patient.case_status === "closed_no_recovery"
    ).length;
    const missingLop = filteredPatients.filter(
      (patient) =>
        patient.lop_letter_status === "requested" ||
        patient.lop_letter_status === "missing"
    ).length;

    const firmMap: Record<string, LawFirmMetric> = {};
    for (const patient of filteredPatients) {
      const firm = patient.lop_law_firms as Record<string, unknown> | null;
      if (!firm?.id) continue;

      const firmId = firm.id as string;
      if (!firmMap[firmId]) {
        firmMap[firmId] = {
          firmId,
          firmName: firm.name as string,
          patientCount: 0,
          totalBilled: 0,
          totalCollected: 0,
          avgBilled: 0,
          avgCollected: 0,
          belowThreshold: false,
        };
      }

      firmMap[firmId].patientCount += 1;
      firmMap[firmId].totalBilled += patientBilled(patient);
      firmMap[firmId].totalCollected += patientCollected(patient);
    }

    const firmMetrics = Object.values(firmMap)
      .map((metric) => ({
        ...metric,
        avgBilled: metric.patientCount > 0 ? metric.totalBilled / metric.patientCount : 0,
        avgCollected:
          metric.patientCount > 0 ? metric.totalCollected / metric.patientCount : 0,
        belowThreshold:
          metric.patientCount > 0 &&
          metric.totalCollected / metric.patientCount < lowThreshold,
      }))
      .sort((left, right) => right.totalBilled - left.totalBilled);

    const facilityMap: Record<
      string,
      { name: string; count: number; billed: number; collected: number }
    > = {};

    for (const patient of filteredPatients) {
      const facility = patient.lop_facilities as Record<string, unknown> | null;
      const facilityId = patient.facility_id as string;

      if (!facilityMap[facilityId]) {
        facilityMap[facilityId] = {
          name: (facility?.name as string) ?? "Unknown",
          count: 0,
          billed: 0,
          collected: 0,
        };
      }

      facilityMap[facilityId].count += 1;
      facilityMap[facilityId].billed += patientBilled(patient);
      facilityMap[facilityId].collected += patientCollected(patient);
    }

    return {
      totalPatients,
      totalBilled,
      totalCollected,
      avgBilled,
      avgCollected,
      avgReduction: reduction.avgAmount,
      avgReductionPct: reduction.avgPct,
      avgDaysToPayment: avgDays,
      aging,
      openFollowUps,
      droppedCases,
      missingLop,
      firmMetrics,
      facilityMetrics: Object.values(facilityMap),
    };
  }, [filteredPatients, lowThreshold]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const alertFirms = metrics.firmMetrics.filter((firm) => firm.belowThreshold);
  const primaryAlertFirm = alertFirms[0];
  const canUseAi = hasPermission(lopUser, "ai:use");
  const scopeFacilityLabel = activeFacilityId
    ? facilities.find((facility) => facility.id === activeFacilityId)?.name ?? "Assigned Facility"
    : facilityFilter !== "all"
    ? facilities.find((facility) => facility.id === facilityFilter)?.name ?? "Selected Facility"
    : "All Facilities";

  const handleExportCsv = () => {
    const rows = filteredPatients.map((patient) => {
      const billed = patientBilled(patient);
      const collected = patientCollected(patient);
      return {
        first_name: patient.first_name ?? "",
        last_name: patient.last_name ?? "",
        facility: (patient.lop_facilities as Record<string, unknown>)?.name ?? "",
        law_firm: (patient.lop_law_firms as Record<string, unknown>)?.name ?? "",
        case_status: patient.case_status ?? "",
        lop_letter_status: patient.lop_letter_status ?? "",
        billed,
        collected,
        outstanding: Math.max(0, billed - collected),
        reduction_amount: patient.reduction_amount ?? "",
        billing_date: patient.billing_date ?? "",
        date_paid: patient.date_paid ?? "",
        date_of_accident: patient.date_of_accident ?? "",
        created_at: patient.created_at ?? "",
      };
    });

    const header = Object.keys(rows[0] ?? {}).join(",");
    const csv =
      header +
      "\n" +
      rows
        .map((row) =>
          Object.values(row)
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `lop-report-${datePreset}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExportFacilityCsv = () => {
    const rows = metrics.facilityMetrics.map((f) => ({
      facility: f.name,
      patients: f.count,
      total_billed: f.billed,
      total_collected: f.collected,
      outstanding: Math.max(0, f.billed - f.collected),
    }));
    const header = Object.keys(rows[0] ?? {}).join(",");
    const csv = header + "\n" + rows.map((r) => Object.values(r).map((v) => `"${String(v)}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facility-totals-${datePreset}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
    const dateLabel = getPresetLabel(datePreset, customFrom, customTo);
    const firmRows = metrics.firmMetrics.map((f) =>
      `<tr><td>${f.firmName}</td><td>${f.patientCount}</td><td>${fmt(f.totalBilled)}</td><td>${fmt(f.totalCollected)}</td><td>${fmt(f.avgCollected)}</td></tr>`
    ).join("");
    const facilityRows = metrics.facilityMetrics.map((f) =>
      `<tr><td>${f.name}</td><td>${f.count}</td><td>${fmt(f.billed)}</td><td>${fmt(f.collected)}</td></tr>`
    ).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>LOP Report</title><style>
      body{font-family:Arial,sans-serif;padding:32px;color:#1e293b;font-size:13px}
      h1{color:#0B3B91;margin-bottom:4px}p.sub{color:#64748b;margin:0 0 24px}
      .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
      .kpi{border:1px solid #e2e8f0;border-radius:10px;padding:14px}
      .kpi .label{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;margin-bottom:6px}
      .kpi .value{font-size:22px;font-weight:800;color:#0B3B91}
      h2{color:#0B3B91;font-size:15px;margin:24px 0 10px}
      table{width:100%;border-collapse:collapse;margin-bottom:28px}
      th{background:#f1f5f9;padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#64748b}
      td{padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:12px}
      @media print{body{padding:16px}.no-print{display:none}}
    </style></head><body>
      <h1>LOP Report — ${scopeFacilityLabel}</h1>
      <p class="sub">${dateLabel} &bull; Generated ${new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric" })}</p>
      <div class="kpis">
        <div class="kpi"><div class="label">Total Patients</div><div class="value">${metrics.totalPatients}</div></div>
        <div class="kpi"><div class="label">Total Billed</div><div class="value">${fmt(metrics.totalBilled)}</div></div>
        <div class="kpi"><div class="label">Total Collected</div><div class="value">${fmt(metrics.totalCollected)}</div></div>
        <div class="kpi"><div class="label">Avg Collected</div><div class="value">${fmt(metrics.avgCollected)}</div></div>
      </div>
      <h2>Collections by Law Firm</h2>
      <table><thead><tr><th>Firm</th><th>Patients</th><th>Total Billed</th><th>Collected</th><th>Avg Col</th></tr></thead><tbody>${firmRows || "<tr><td colspan='5'>No data</td></tr>"}</tbody></table>
      <h2>Facility Totals</h2>
      <table><thead><tr><th>Facility</th><th>Patients</th><th>Total Billed</th><th>Total Collected</th></tr></thead><tbody>${facilityRows || "<tr><td colspan='4'>No data</td></tr>"}</tbody></table>
      ${"<script>"}window.onload=()=>{window.print();window.onafterprint=()=>window.close();}${"</script>"}
    </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  };

  if (!hasPermission(lopUser, "reports:read")) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-orange-500" />
          <p className="text-lg font-medium text-slate-700">Access Restricted</p>
          <p className="mt-1 text-sm text-slate-400">
            Reports are available to Accounting and Admin roles only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8 lg:pb-12">
      <header className="mb-6 rounded-[30px] border border-white/70 bg-white/70 px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:sticky lg:top-0 lg:z-20 lg:mb-8 lg:px-8 lg:py-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="font-heading text-lg font-semibold text-[#0B3B91]">
              Reports
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#0B3B91]/5 px-3 py-1.5 text-xs font-semibold text-[#0B3B91]">
                <Building2 className="h-3.5 w-3.5" />
                {scopeFacilityLabel}
              </span>
              <span className="text-sm text-slate-500">
                {getPresetLabel(datePreset, customFrom, customTo)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              onClick={handleExportPdf}
              disabled={filteredPatients.length === 0}
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              onClick={handleExportCsv}
              disabled={filteredPatients.length === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
              <CalendarDays className="h-3.5 w-3.5 text-[#0B3B91]" />
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
        </div>
      </header>

      <section className="px-1 lg:px-0">
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#0B3B91] md:text-3xl">
              Reports
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 md:text-base">
              Financial analytics across all facilities
            </p>
          </div>
        </div>

        <section className="mb-8 rounded-[30px] border border-white/80 bg-slate-100/80 p-6">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            <div>
              <label className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Date Range
              </label>
              <Select value={datePreset} onValueChange={setDatePreset}>
                <SelectTrigger className="h-12 rounded-2xl border-white bg-white text-sm font-semibold text-[#0B3B91] shadow-none">
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

            {!activeFacilityId && facilities.length > 1 && (
              <div>
                <label className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Facility Selection
                </label>
                <Select value={facilityFilter} onValueChange={setFacilityFilter}>
                  <SelectTrigger className="h-12 rounded-2xl border-white bg-white text-sm font-semibold text-[#0B3B91] shadow-none">
                    <SelectValue placeholder="All Facilities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Facilities</SelectItem>
                    {facilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Patient Name Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Start typing name..."
                  value={nameFilter}
                  onChange={(event) => setNameFilter(event.target.value)}
                  className="h-12 rounded-2xl border-white bg-white pl-11 text-sm font-semibold shadow-none focus-visible:ring-[#0B3B91]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Case Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 rounded-2xl border-white bg-white text-sm font-semibold text-[#0B3B91] shadow-none">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(CASE_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {datePreset === "custom" && (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  From
                </label>
                <Input
                  type="date"
                  value={customFrom}
                  onChange={(event) => setCustomFrom(event.target.value)}
                  className="h-12 rounded-2xl border-white bg-white shadow-none"
                />
              </div>
              <div>
                <label className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  To
                </label>
                <Input
                  type="date"
                  value={customTo}
                  onChange={(event) => setCustomTo(event.target.value)}
                  className="h-12 rounded-2xl border-white bg-white shadow-none"
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
            <span className="text-xs font-medium text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">{filteredPatients.length}</span>{" "}
              patient{filteredPatients.length === 1 ? "" : "s"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
              {getPresetLabel(datePreset, customFrom, customTo)}
            </span>
            {statusFilter !== "all" && (
              <span className="rounded-full bg-[#0B3B91]/10 px-3 py-1 text-xs font-semibold text-[#0B3B91] ring-1 ring-[#0B3B91]/20">
                {CASE_STATUS_LABELS[statusFilter as keyof typeof CASE_STATUS_LABELS] ?? statusFilter}
              </span>
            )}
            {facilityFilter !== "all" && !activeFacilityId && (
              <span className="rounded-full bg-[#0B3B91]/10 px-3 py-1 text-xs font-semibold text-[#0B3B91] ring-1 ring-[#0B3B91]/20">
                {facilities.find((f) => f.id === facilityFilter)?.name ?? "Facility"}
              </span>
            )}
            {nameFilter.trim() && (
              <span className="rounded-full bg-[#0B3B91]/10 px-3 py-1 text-xs font-semibold text-[#0B3B91] ring-1 ring-[#0B3B91]/20">
                "{nameFilter}"
              </span>
            )}
            {(statusFilter !== "all" || (facilityFilter !== "all" && !activeFacilityId) || nameFilter.trim()) && (
              <button
                onClick={() => { setStatusFilter("all"); setFacilityFilter("all"); setNameFilter(""); }}
                className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-500 ring-1 ring-red-200 hover:bg-red-100"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-[30px] border border-white/80 bg-white shadow-sm">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-[#0B3B91]" />
              Loading reports...
            </div>
          </div>
        ) : (
          <>
            <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[26px] border-l-4 border-[#0B3B91] bg-white p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Total Capacity
                </p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-heading text-5xl font-black text-[#0B3B91]">
                    {metrics.totalPatients}
                  </span>
                  <span className="pb-2 text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
                    Patients
                  </span>
                </div>
              </div>

              <div className="rounded-[26px] bg-white p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Revenue Lifecycle
                </p>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Billed
                    </span>
                    <span className="font-heading text-3xl font-black text-slate-900">
                      {formatCurrency(metrics.totalBilled)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Collected
                    </span>
                    <span className="font-heading text-3xl font-black text-blue-700">
                      {formatCurrency(metrics.totalCollected)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] bg-white p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Patient Averages
                </p>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Avg Billed
                    </span>
                    <span className="font-heading text-2xl font-black text-[#0B3B91]">
                      {formatCurrency(metrics.avgBilled)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Avg Collected
                    </span>
                    <span className="font-heading text-2xl font-black text-blue-700">
                      {formatCurrency(metrics.avgCollected)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border-l-4 border-[#D72638] bg-white p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Action Items
                </p>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-heading text-2xl font-black text-[#D72638]">
                      {metrics.openFollowUps}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Follow-Ups
                    </p>
                  </div>
                  <div>
                    <p className="font-heading text-2xl font-black text-[#D72638]">
                      {metrics.droppedCases}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Dropped
                    </p>
                  </div>
                  <div>
                    <p className="font-heading text-2xl font-black text-[#D72638]">
                      {metrics.missingLop}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Missing LOP
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-[26px] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-[#0B3B91]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Avg Reduction
                  </p>
                </div>
                <div className="mt-4 flex items-end gap-3">
                  <span className="font-heading text-3xl font-black text-[#0B3B91]">
                    {formatCurrency(metrics.avgReduction)}
                  </span>
                  {metrics.avgReductionPct > 0 && (
                    <span className="pb-1 text-sm font-semibold text-slate-500">
                      {(metrics.avgReductionPct * 100).toFixed(1)}% of billed
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Mean across patients with a recorded reduction
                </p>
              </div>

              <div className="rounded-[26px] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#0B3B91]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Avg Days to Payment
                  </p>
                </div>
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-heading text-3xl font-black text-[#0B3B91]">
                    {metrics.avgDaysToPayment > 0 ? Math.round(metrics.avgDaysToPayment) : "—"}
                  </span>
                  {metrics.avgDaysToPayment > 0 && (
                    <span className="pb-1 text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
                      Days
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Billing date → date paid, paid cases only
                </p>
              </div>

              <div className="rounded-[26px] bg-white p-6 shadow-sm md:col-span-2 xl:col-span-1">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#0B3B91]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Outstanding (Unpaid)
                  </p>
                </div>
                <div className="mt-4 flex items-end gap-3">
                  <span className="font-heading text-3xl font-black text-[#0B3B91]">
                    {formatCurrency(metrics.aging.totalOutstanding)}
                  </span>
                  <span className="pb-1 text-xs font-semibold text-slate-500">
                    {metrics.aging.unpaidCount} case{metrics.aging.unpaidCount === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Billed minus collected, billing-dated unpaid cases
                </p>
              </div>
            </section>

            <section className="mb-8 overflow-hidden rounded-[30px] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <h2 className="font-heading text-xl font-bold text-[#0B3B91]">
                  Aging Breakdown
                </h2>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Days Outstanding
                </span>
              </div>
              {metrics.aging.unpaidCount === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  No unpaid cases with a billing date in this view.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-5">
                  {AGING_BUCKETS.map((bucket) => {
                    const stats = metrics.aging.buckets[bucket];
                    const tone =
                      bucket === "0-30"
                        ? "text-emerald-700"
                        : bucket === "31-60"
                        ? "text-blue-700"
                        : bucket === "61-90"
                        ? "text-amber-700"
                        : bucket === "91-180"
                        ? "text-orange-700"
                        : "text-rose-700";
                    return (
                      <div key={bucket} className="bg-white p-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                          {bucket} days
                        </p>
                        <p className={cn("mt-3 font-heading text-2xl font-black", tone)}>
                          {stats.count}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {formatCurrency(stats.outstanding)} outstanding
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="mb-8">
              <div className="relative overflow-hidden rounded-[28px] border border-rose-100 bg-rose-50/60 p-6">
                <div className="absolute inset-y-0 left-0 w-1.5 bg-[#D72638]" />
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-[#D72638]">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl font-bold text-slate-900">
                        {primaryAlertFirm
                          ? "Low-Performing Law Firms Detected"
                          : "Portfolio Stable"}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {primaryAlertFirm
                          ? "Review firms that are under the average collection threshold and may be dragging down portfolio efficiency."
                          : "No law firms are currently below the configured collection threshold."}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-white/60 bg-white/80 px-6 py-4 shadow-sm">
                    {primaryAlertFirm ? (
                      <div className="flex flex-wrap items-center gap-6">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                            Target Entity
                          </p>
                          <p className="text-sm font-black text-[#0B3B91]">
                            {primaryAlertFirm.firmName}
                          </p>
                        </div>
                        <div className="h-8 w-px bg-slate-200" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                            Avg Collection
                          </p>
                          <p className="text-lg font-black text-[#D72638]">
                            {formatCurrency(primaryAlertFirm.avgCollected)}
                          </p>
                        </div>
                        <div className="h-8 w-px bg-slate-200" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                            Volume
                          </p>
                          <p className="text-lg font-black text-[#0B3B91]">
                            {primaryAlertFirm.patientCount}{" "}
                            <span className="text-[10px] font-medium uppercase text-slate-400">
                              Pts
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <Users className="h-4 w-4 text-[#0B3B91]" />
                        All tracked firms are performing at or above the current threshold.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              <section className="overflow-hidden rounded-[30px] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                  <h2 className="font-heading text-xl font-bold text-[#0B3B91]">
                    Collections by Law Firm
                  </h2>
                  <button
                    type="button"
                    onClick={() => { setShowFirmSearch((v) => !v); setFirmSearch(""); }}
                    className={`rounded-xl p-2 transition-colors hover:bg-slate-50 ${
                      showFirmSearch ? "bg-[#0B3B91]/10 text-[#0B3B91]" : "text-slate-400 hover:text-[#0B3B91]"
                    }`}
                    title="Search firms"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
                {showFirmSearch && (
                  <div className="px-6 py-3 border-b border-slate-100">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        autoFocus
                        placeholder="Search by firm name..."
                        value={firmSearch}
                        onChange={(e) => setFirmSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#0B3B91]/40 focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                {metrics.firmMetrics.filter((f) => !firmSearch || f.firmName.toLowerCase().includes(firmSearch.toLowerCase())).length === 0 ? (
                  <div className="px-6 py-16 text-center text-sm text-slate-500">
                    No data with assigned law firms for this filter set.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left">
                      <thead>
                        <tr className="bg-slate-50/80">
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                            Firm
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                            Patients
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                            Total Billed
                          </th>
                          <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                            Collected
                          </th>
                          <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                            Avg Col
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {metrics.firmMetrics
                          .filter((f) => !firmSearch || f.firmName.toLowerCase().includes(firmSearch.toLowerCase()))
                          .map((firm) => (
                          <tr
                            key={firm.firmId}
                            className={cn(
                              "transition-colors hover:bg-blue-50/30",
                              firm.belowThreshold && "bg-rose-50/40"
                            )}
                          >
                            <td className="px-6 py-5">
                              <p className="text-sm font-bold text-slate-900">
                                {firm.firmName}
                              </p>
                              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                                {firm.patientCount} active cases
                              </p>
                            </td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-700">
                              {firm.patientCount}
                            </td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-700">
                              {formatCurrency(firm.totalBilled)}
                            </td>
                            <td className="px-6 py-5 text-right text-sm font-black text-blue-700">
                              {formatCurrency(firm.totalCollected)}
                            </td>
                            <td className="px-6 py-5 text-right text-sm font-black text-[#D72638]">
                              {formatCurrency(firm.avgCollected)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="overflow-hidden rounded-[30px] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                  <h2 className="font-heading text-xl font-bold text-[#0B3B91]">
                    Facility Totals
                  </h2>
                  <button
                    type="button"
                    onClick={handleExportFacilityCsv}
                    disabled={metrics.facilityMetrics.length === 0}
                    className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-[#0B3B91] disabled:opacity-40"
                    title="Export facility totals as CSV"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>

                {metrics.facilityMetrics.length === 0 ? (
                  <div className="px-6 py-16 text-center text-sm text-slate-500">
                    No facility totals available for this filter set.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left">
                      <thead>
                        <tr className="bg-slate-50/80">
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                            Facility
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                            Patients
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                            Total Billed
                          </th>
                          <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                            Total Collected
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {metrics.facilityMetrics.map((facility) => (
                          <tr key={facility.name} className="transition-colors hover:bg-blue-50/30">
                            <td className="px-6 py-5">
                              <p className="text-sm font-bold text-slate-900">
                                {facility.name}
                              </p>
                            </td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-700">
                              {facility.count}
                            </td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-700">
                              {formatCurrency(facility.billed)}
                            </td>
                            <td className="px-6 py-5 text-right text-sm font-black text-blue-700">
                              {formatCurrency(facility.collected)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            <section className="relative mt-12 overflow-hidden rounded-[34px] border border-white/80 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.18),_transparent_24%),linear-gradient(135deg,_rgba(11,59,145,0.12),_rgba(255,255,255,0.9))] p-10">
              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <h2 className="font-heading text-3xl font-bold text-[#0B3B91]">
                  Predictive Forecasting
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  Use historical LOP trends, law firm performance, and facility collection
                  patterns to project upcoming liquidity. Activate the AI Analysis engine
                  for a quick narrative on risks and opportunities.
                </p>
                {canUseAi ? (
                  <Button
                    type="button"
                    className="mt-8 rounded-full bg-white text-[#0B3B91] shadow-xl hover:bg-slate-50"
                    onClick={() => {
                      const reportData = JSON.stringify({
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
                        lawFirmBreakdown: metrics.firmMetrics.map((firm) => ({
                          firm: firm.firmName,
                          patients: firm.patientCount,
                          billed: firm.totalBilled,
                          collected: firm.totalCollected,
                          avgCollected: firm.avgCollected,
                          belowThreshold: firm.belowThreshold,
                        })),
                        facilityBreakdown: metrics.facilityMetrics,
                      }, null, 2);
                      window.dispatchEvent(
                        new CustomEvent("open-ai-chat", {
                          detail: {
                            prompt: `Analyze these report metrics and provide actionable insights, revenue optimization suggestions, and risk flags.\n\n${reportData}`,
                          },
                        })
                      );
                    }}
                  >
                    Enable Predictive Insights
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="mt-8 rounded-full bg-white/80 px-6 py-3 text-sm font-semibold text-slate-500 shadow-sm">
                    AI insights are available to admin users
                  </div>
                )}
              </div>

              <div className="absolute -bottom-16 -right-8 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
            </section>
          </>
        )}
      </section>

    </div>
  );
}

