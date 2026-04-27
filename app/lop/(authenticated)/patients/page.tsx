"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { lopDb } from "@/lib/lop/db";
import type { Filter as DbFilter } from "@/lib/lop/db";
import { hasPermission } from "@/lib/lop/permissions";
import {
  CASE_STATUS_LABELS,
  DOC_STATUS_LABELS,
  getMissingDocuments,
} from "@/lib/lop/types";
import type {
  LopCaseStatus,
  LopDocumentStatus,
  LopPatient,
} from "@/lib/lop/types";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  Filter,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  TriangleAlert,
  Wallet,
} from "lucide-react";

type PatientListRow = Pick<
  LopPatient,
  | "id"
  | "facility_id"
  | "first_name"
  | "last_name"
  | "phone"
  | "case_status"
  | "lop_letter_status"
  | "date_of_accident"
  | "bill_charges"
  | "amount_collected"
  | "created_at"
  | "mrn"
  | "date_of_service"
  | "disposition_status"
  | "chief_complaint"
  | "primary_insurance"
  | "is_lop_case"
  | "referral_source"
  | "llc_billed_charges"
  | "pllc_billed_charges"
  | "total_received_llc"
  | "total_received_pllc"
> & {
  lop_facilities?: { name?: string | null; slug?: string | null } | null;
  lop_law_firms?: { name?: string | null } | null;
  lop_patient_documents?:
    | { document_type: string; status: string }[]
    | null;
};

const quickStatusFilters: Array<{ label: string; value: "all" | LopCaseStatus }> = [
  { label: "All Statuses", value: "all" },
  { label: "Arrived", value: "arrived" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Follow Up", value: "follow_up_needed" },
];

const avatarTones = [
  "bg-[#0B3B91] text-white",
  "bg-indigo-100 text-indigo-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
];

const caseStatusStyles: Record<LopCaseStatus, string> = {
  scheduled: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  no_show: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  arrived: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  intake_complete: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100",
  in_progress: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  follow_up_needed: "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
  paid: "bg-green-50 text-green-700 ring-1 ring-green-100",
  partial_paid: "bg-lime-50 text-lime-700 ring-1 ring-lime-100",
  case_dropped: "bg-red-50 text-red-700 ring-1 ring-red-100",
  closed_no_recovery: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

const lopStatusStyles: Record<LopDocumentStatus, string> = {
  not_requested: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  requested: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  received: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  missing: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
};

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "PT";
}

function getAvatarTone(patientId: string) {
  const seed = patientId
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return avatarTones[seed % avatarTones.length];
}

function getPatientReference(patientId: string) {
  return patientId.replace(/-/g, "").slice(0, 6).toUpperCase();
}

function getMissingRequiredDocumentCount(patient: PatientListRow) {
  const checklist = getMissingDocuments(patient.lop_patient_documents ?? []);
  return checklist.filter((item) => item.required && item.status !== "received").length;
}

export default function PatientsListPage() {
  const { lopUser, activeFacilityId, facilities } = useLopAuth();
  const [patients, setPatients] = useState<PatientListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [facilityFilter, setFacilityFilter] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const baseSelect = "*, lop_facilities(name, slug), lop_law_firms(name), lop_patient_documents(document_type, status)";

        const lopFilter: DbFilter = { column: "is_lop_case", op: "eq" as const, value: true };

        if (!activeFacilityId) {
          const { data } = await lopDb.select("lop_patients", {
            select: baseSelect,
            order: { column: "created_at", ascending: false },
            filters: [lopFilter],
          });
          setPatients((data as PatientListRow[]) ?? []);
          return;
        }

        const [{ data: scopedPatients }, { data: unassignedPatients }] = await Promise.all([
          lopDb.select("lop_patients", {
            select: baseSelect,
            order: { column: "created_at", ascending: false },
            filters: [lopFilter, { column: "facility_id", op: "eq" as const, value: activeFacilityId }],
          }),
          lopDb.select("lop_patients", {
            select: baseSelect,
            order: { column: "created_at", ascending: false },
            filters: [lopFilter, { column: "facility_id", op: "is" as const, value: null }],
          }),
        ]);

        const merged = [...((scopedPatients as PatientListRow[]) ?? []), ...((unassignedPatients as PatientListRow[]) ?? [])];
        const deduped = Array.from(new Map(merged.map((patient) => [patient.id, patient])).values());
        deduped.sort((a, b) => {
          const left = a.created_at ? new Date(a.created_at).getTime() : 0;
          const right = b.created_at ? new Date(b.created_at).getTime() : 0;
          return right - left;
        });

        setPatients(deduped);
      } catch (err) {
        console.error("Failed to load patients:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeFacilityId]);

  useEffect(() => {
    if (activeFacilityId) {
      setFacilityFilter("all");
    }
  }, [activeFacilityId]);

  const searchScopedPatients = useMemo(() => {
    return patients.filter((patient) => {
      if (facilityFilter !== "all" && patient.facility_id !== facilityFilter) {
        return false;
      }

      if (!search.trim()) return true;

      const term = search.toLowerCase();
      const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
      const firmName = (patient.lop_law_firms?.name ?? "").toLowerCase();
      const facilityName = (patient.lop_facilities?.name ?? "").toLowerCase();
      const phone = (patient.phone ?? "").toLowerCase();
      const reference = getPatientReference(patient.id).toLowerCase();
      const mrn = (patient.mrn ?? "").toLowerCase();
      const chiefComplaint = (patient.chief_complaint ?? "").toLowerCase();

      return [fullName, firmName, facilityName, phone, reference, mrn, chiefComplaint].some((value) =>
        value.includes(term)
      );
    });
  }, [patients, search, facilityFilter]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return searchScopedPatients;

    return searchScopedPatients.filter((patient) => patient.case_status === statusFilter);
  }, [searchScopedPatients, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: searchScopedPatients.length };

    for (const patient of searchScopedPatients) {
      const key = patient.case_status;
      counts[key] = (counts[key] ?? 0) + 1;
    }

    return counts;
  }, [searchScopedPatients]);

  const metrics = useMemo(() => {
    const totalBilled = filtered.reduce(
      (sum, patient) => {
        const llc = Number(patient.llc_billed_charges) || 0;
        const pllc = Number(patient.pllc_billed_charges) || 0;
        const legacy = Number(patient.bill_charges) || 0;
        return sum + (llc + pllc > 0 ? llc + pllc : legacy);
      },
      0
    );
    const totalCollected = filtered.reduce(
      (sum, patient) => {
        const llc = Number(patient.total_received_llc) || 0;
        const pllc = Number(patient.total_received_pllc) || 0;
        const legacy = Number(patient.amount_collected) || 0;
        return sum + (llc + pllc > 0 ? llc + pllc : legacy);
      },
      0
    );
    const arrivedCount = filtered.filter((patient) => patient.case_status === "arrived").length;
    const scheduledCount = filtered.filter((patient) => patient.case_status === "scheduled").length;
    const missingDocsCount = filtered.filter(
      (patient) => getMissingRequiredDocumentCount(patient) > 0
    ).length;
    const documentationHealth = filtered.length
      ? Math.round(((filtered.length - missingDocsCount) / filtered.length) * 100)
      : 100;
    const collectionRate = totalBilled > 0
      ? Math.round((totalCollected / totalBilled) * 100)
      : 0;

    const facilityBreakdown = filtered.reduce<Record<string, number>>((acc, patient) => {
      const facilityName = patient.lop_facilities?.name ?? "Unassigned Facility";
      acc[facilityName] = (acc[facilityName] ?? 0) + 1;
      return acc;
    }, {});

    const topFacilityEntry = Object.entries(facilityBreakdown).sort((a, b) => b[1] - a[1])[0];
    const topFacilityName = topFacilityEntry?.[0] ?? "No facility selected";
    const topFacilityShare = filtered.length && topFacilityEntry
      ? Math.round((topFacilityEntry[1] / filtered.length) * 100)
      : 0;

    const firmBreakdown = filtered.reduce<Record<string, number>>((acc, patient) => {
      const lawFirmName = patient.lop_law_firms?.name ?? "No Law Firm";
      acc[lawFirmName] = (acc[lawFirmName] ?? 0) + 1;
      return acc;
    }, {});

    const topFirmEntry = Object.entries(firmBreakdown).sort((a, b) => b[1] - a[1])[0];
    const topLawFirmName = topFirmEntry?.[0] ?? "No referrals yet";
    const topLawFirmCount = topFirmEntry?.[1] ?? 0;

    return {
      totalBilled,
      totalCollected,
      arrivedCount,
      scheduledCount,
      missingDocsCount,
      documentationHealth,
      collectionRate,
      topFacilityName,
      topFacilityShare,
      topLawFirmName,
      topLawFirmCount,
    };
  }, [filtered]);

  const canCreate = hasPermission(lopUser, "patient:create");
  const canViewFinancial = hasPermission(lopUser, "financial:view");
  const canUseAi = hasPermission(lopUser, "ai:use");

  const scopeFacilityId = activeFacilityId || (facilityFilter !== "all" ? facilityFilter : null);
  const scopeFacilityLabel = scopeFacilityId
    ? facilities.find((facility) => facility.id === scopeFacilityId)?.name ?? "Assigned Facility"
    : "All Facilities";

  const resultsSummary =
    patients.length === filtered.length && statusFilter === "all" && !search.trim() && facilityFilter === "all"
      ? `${filtered.length} records found in the system`
      : `${filtered.length} matching patients out of ${patients.length} loaded`;

  const openAiAssistant = () => {
    window.dispatchEvent(new CustomEvent("open-ai-chat"));
  };

  return (
    <div className="pb-8 lg:pb-12">
      <header className="mb-6 rounded-[30px] border border-white/70 bg-white/70 px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:sticky lg:top-0 lg:z-20 lg:mb-8 lg:px-8 lg:py-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <div>
              <p className="font-heading text-lg font-semibold text-[#0B3B91]">LOP Dashboard</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#0B3B91]/5 px-3 py-1.5 text-xs font-semibold text-[#0B3B91]">
                  <Building2 className="h-3.5 w-3.5" />
                  Facility Selection
                </span>
                <span className="text-sm text-slate-500">{scopeFacilityLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1 sm:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Search records..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 rounded-full border-white/80 bg-slate-100/90 pl-11 pr-4 text-sm shadow-none focus-visible:ring-[#0B3B91]/20"
              />
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
              <ArrowRight className="h-3.5 w-3.5 text-[#0B3B91]" />
              {patients.length} records
            </span>
          </div>
        </div>
      </header>

      <section className="px-1 lg:px-0">
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#0B3B91] md:text-3xl">
              Patients
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 md:text-base">
              {resultsSummary}
            </p>
          </div>

          {canCreate && (
            <Link href="/lop/patients/new">
              <Button className="h-12 rounded-2xl bg-gradient-to-r from-[#D72638] to-[#ff4d5e] px-6 text-white shadow-[0_18px_38px_rgba(215,38,56,0.22)] transition-transform hover:scale-[1.02] hover:from-[#c91f31] hover:to-[#ff4355]">
                <Plus className="h-4 w-4" />
                New Patient
              </Button>
            </Link>
          )}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <div className="rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_20px_45px_rgba(15,23,42,0.05)]">
              <div className="flex flex-wrap gap-2">
                {quickStatusFilters.map((item) => {
                  const isActive = statusFilter === item.value;
                  const count = statusCounts[item.value] ?? 0;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setStatusFilter(item.value)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all",
                        isActive
                          ? "bg-white text-[#0B3B91] shadow-sm ring-1 ring-slate-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200/70 hover:text-slate-700"
                      )}
                    >
                      <span>{item.label}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs",
                          isActive ? "bg-[#0B3B91]/10 text-[#0B3B91]" : "bg-white text-slate-500"
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-100/80 p-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#0B3B91] shadow-sm">
                    <Filter className="h-4 w-4" />
                  </div>
                  <div className="grid flex-1 gap-3 md:grid-cols-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-11 rounded-2xl border-white bg-white text-sm font-semibold text-[#0B3B91] shadow-none">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {(Object.entries(CASE_STATUS_LABELS) as [LopCaseStatus, string][]).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>

                    {!activeFacilityId && facilities.length > 1 && (
                      <Select value={facilityFilter} onValueChange={setFacilityFilter}>
                        <SelectTrigger className="h-11 rounded-2xl border-white bg-white text-sm font-semibold text-[#0B3B91] shadow-none">
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
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border-l-4 border-[#0B3B91] bg-white p-5 shadow-sm lg:min-w-[290px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
                    {canViewFinancial ? "Total Billed" : "Documentation Health"}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-heading text-2xl font-bold text-[#0B3B91]">
                        {canViewFinancial
                          ? formatCurrency(metrics.totalBilled)
                          : `${metrics.documentationHealth}%`}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {canViewFinancial
                          ? `${metrics.collectionRate}% collected • ${metrics.arrivedCount} arrived`
                          : `${metrics.missingDocsCount} patients still need required documents`}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0B3B91]">
                      {canViewFinancial ? (
                        <Wallet className="h-5 w-5" />
                      ) : (
                        <ShieldCheck className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-[0_30px_70px_rgba(15,23,42,0.06)]">
          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#0B3B91]" />
              <p className="text-sm font-medium text-slate-500">Loading patients...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-heading text-2xl font-bold text-slate-900">
                {patients.length === 0 ? "No patients yet" : "No patients match these filters"}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                {patients.length === 0
                  ? "Create your first LOP patient record to start tracking scheduling, documents, and billing."
                  : "Try widening your search, selecting a different status, or switching facilities."}
              </p>
              {canCreate && patients.length === 0 && (
                <Link href="/lop/patients/new" className="mt-6 inline-flex">
                  <Button className="rounded-2xl bg-gradient-to-r from-[#D72638] to-[#ff4d5e] text-white hover:from-[#c91f31] hover:to-[#ff4355]">
                    <Plus className="h-4 w-4" />
                    Add First Patient
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="lg:hidden">
                <div className="space-y-3 p-4">
                  {filtered.map((patient) => {
                    const missingDocs = getMissingRequiredDocumentCount(patient);
                    const collectedAmount = Number(patient.amount_collected) || 0;

                    return (
                      <div
                        key={patient.id}
                        className="rounded-[26px] border border-slate-200/70 bg-slate-50/70 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold",
                                getAvatarTone(patient.id)
                              )}
                            >
                              {getInitials(patient.first_name, patient.last_name)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {patient.first_name} {patient.last_name}
                              </p>
                              <p className="text-xs text-slate-500">
                                ID: {getPatientReference(patient.id)}{" "}
                                  {patient.mrn ? `• MRN: ${patient.mrn}` : ""}
                                  {patient.phone ? ` • ${patient.phone}` : ""}
                              </p>
                            </div>
                          </div>

                          <span
                            className={cn(
                              "inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
                              caseStatusStyles[patient.case_status]
                            )}
                          >
                            {CASE_STATUS_LABELS[patient.case_status]}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                              Facility
                            </p>
                            <p className="mt-1 font-medium text-slate-700">
                              {patient.lop_facilities?.name ?? "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                              Law Firm
                            </p>
                            <p className="mt-1 font-medium text-slate-700">
                              {patient.lop_law_firms?.name ?? "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                              {patient.date_of_service ? "Date of Service" : "Accident Date"}
                            </p>
                            <p className="mt-1 text-slate-600">
                              {formatDate(patient.date_of_service ?? patient.date_of_accident)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                              LOP Letter
                            </p>
                            <span
                              className={cn(
                                "mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                                lopStatusStyles[patient.lop_letter_status]
                              )}
                            >
                              {DOC_STATUS_LABELS[patient.lop_letter_status]}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                              Missing Docs
                            </p>
                            {missingDocs > 0 ? (
                              <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-red-500">
                                <TriangleAlert className="h-3.5 w-3.5" />
                                {missingDocs} missing
                              </div>
                            ) : (
                              <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Complete
                              </div>
                            )}
                          </div>

                          {canViewFinancial && (
                            <div className="text-right">
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                Billed
                              </p>
                              <p className="mt-1 font-heading text-lg font-bold text-[#0B3B91]">
                                {formatCurrency(
                                  (Number(patient.llc_billed_charges) || 0) + (Number(patient.pllc_billed_charges) || 0) ||
                                  patient.bill_charges
                                )}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Rcvd {formatCurrency(
                                  (Number(patient.total_received_llc) || 0) + (Number(patient.total_received_pllc) || 0) ||
                                  collectedAmount
                                )}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <Link
                            href={`/lop/patients/${patient.id}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B3B91]"
                          >
                            View Case
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1200px] border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        Patient
                      </th>
                      <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        MRN
                      </th>
                      <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        DOS
                      </th>
                      <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        Facility
                      </th>
                      <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        Law Firm
                      </th>
                      <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        Chief Complaint
                      </th>
                      <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        Status
                      </th>
                      <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        LOP Letter
                      </th>
                      <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        Missing Docs
                      </th>
                      {canViewFinancial && (
                        <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          Billed
                        </th>
                      )}
                      <th className="px-6 py-5 text-right text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((patient) => {
                      const missingDocs = getMissingRequiredDocumentCount(patient);

                      return (
                        <tr
                          key={patient.id}
                          className="group transition-colors hover:bg-slate-50/80"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold",
                                  getAvatarTone(patient.id)
                                )}
                              >
                                {getInitials(patient.first_name, patient.last_name)}
                              </div>
                              <div>
                                <Link
                                  href={`/lop/patients/${patient.id}`}
                                  className="text-sm font-bold text-slate-900 transition-colors hover:text-[#0B3B91]"
                                >
                                  {patient.first_name} {patient.last_name}
                                </Link>
                                <p className="text-xs text-slate-500">
                                  {patient.phone ? patient.phone : "No phone"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-slate-600">
                            {patient.mrn ?? "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {formatDate(patient.date_of_service ?? patient.date_of_accident)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">
                            {patient.lop_facilities?.name ?? "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {patient.lop_law_firms?.name ?? "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 max-w-[160px] truncate" title={patient.chief_complaint ?? undefined}>
                            {patient.chief_complaint ?? "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
                                caseStatusStyles[patient.case_status]
                              )}
                            >
                              {CASE_STATUS_LABELS[patient.case_status]}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                                lopStatusStyles[patient.lop_letter_status]
                              )}
                            >
                              {DOC_STATUS_LABELS[patient.lop_letter_status]}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {missingDocs > 0 ? (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                                <TriangleAlert className="h-4 w-4" />
                                {missingDocs} missing
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                                Complete
                              </div>
                            )}
                          </td>
                          {canViewFinancial && (
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-[#0B3B91]">
                                {formatCurrency(
                                  (Number(patient.llc_billed_charges) || 0) + (Number(patient.pllc_billed_charges) || 0) ||
                                  patient.bill_charges
                                )}
                              </p>
                              <p className="text-xs text-slate-400">
                                Rcvd {formatCurrency(
                                  (Number(patient.total_received_llc) || 0) + (Number(patient.total_received_pllc) || 0) ||
                                  patient.amount_collected
                                )}
                              </p>
                            </td>
                          )}
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/lop/patients/${patient.id}`}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition-colors group-hover:bg-white group-hover:text-[#0B3B91]"
                              aria-label={`Open patient ${patient.first_name} ${patient.last_name}`}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Showing{" "}
                  <span className="font-bold text-[#0B3B91]">{filtered.length}</span> of{" "}
                  <span className="font-bold text-slate-700">{patients.length}</span> patients
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                    {statusFilter === "all"
                      ? "All statuses"
                      : CASE_STATUS_LABELS[statusFilter as LopCaseStatus]}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                    {scopeFacilityLabel}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-[26px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-[#0B3B91]">
                    Documentation Health
                  </h3>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-indigo-400">
                    Required paperwork
                  </p>
                </div>
              </div>
              <p className="text-sm leading-7 text-indigo-950/80">
                {metrics.documentationHealth}% of the current patient list is complete.
                {" "}
                {metrics.missingDocsCount > 0
                  ? `${metrics.missingDocsCount} patient${metrics.missingDocsCount === 1 ? "" : "s"} still need required documents.`
                  : "Every patient in the current view has required documents on file."}
              </p>
            </div>

            <div className="rounded-[26px] border border-white/80 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0B3B91]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-slate-900">
                    Facility Load
                  </h3>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
                    Current distribution
                  </p>
                </div>
              </div>
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#0B3B91]"
                  style={{ width: `${Math.max(metrics.topFacilityShare, 6)}%` }}
                />
              </div>
              <p className="text-sm leading-7 text-slate-600">
                <span className="font-semibold text-slate-900">{metrics.topFacilityName}</span>
                {" "}
                accounts for {metrics.topFacilityShare}% of the filtered patient volume, with{" "}
                {metrics.arrivedCount} arrived and {metrics.scheduledCount} scheduled.
              </p>
            </div>

            <div className="rounded-[26px] border border-white/80 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-[#D72638]">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-slate-900">
                    Referral Snapshot
                  </h3>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
                    Law firm activity
                  </p>
                </div>
              </div>
              <p className="text-sm leading-7 text-slate-600">
                <span className="font-semibold text-slate-900">{metrics.topLawFirmName}</span>
                {" "}
                currently leads this view with {metrics.topLawFirmCount} patient
                {metrics.topLawFirmCount === 1 ? "" : "s"}.
              </p>
              {canUseAi && (
                <button
                  type="button"
                  onClick={openAiAssistant}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#D72638] transition-colors hover:text-[#b71d2d]"
                >
                  Ask AI to review missing items
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
