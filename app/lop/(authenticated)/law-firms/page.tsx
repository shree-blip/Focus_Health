"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopDb } from "@/lib/lop/db";
import { hasPermission } from "@/lib/lop/permissions";
import type { LopLawFirm } from "@/lib/lop/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Building2,
  Edit3,
  Gavel,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface FirmMetric {
  count: number;
  avgCollected: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getEngagementLabel(count: number) {
  if (count >= 10) return "High";
  if (count >= 4) return "Medium";
  if (count >= 1) return "Growing";
  return "Dormant";
}

export default function LawFirmsPage() {
  const { lopUser } = useLopAuth();
  const [firms, setFirms] = useState<LopLawFirm[]>([]);
  const [firmMetrics, setFirmMetrics] = useState<Record<string, FirmMetric>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFirm, setEditingFirm] = useState<LopLawFirm | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    intake_email: "",
    escalation_email: "",
    primary_contact: "",
    primary_phone: "",
    notes: "",
    is_active: true,
  });

  const canManage =
    hasPermission(lopUser, "law_firm:create") ||
    hasPermission(lopUser, "law_firm:update");

  const loadFirms = useCallback(async () => {
    setLoading(true);

    try {
      const [firmsResponse, patientsResponse] = await Promise.all([
        lopDb.select("lop_law_firms", { order: { column: "name" } }),
        lopDb.select("lop_patients", {
          select: "law_firm_id, amount_collected",
        }),
      ]);

      const loadedFirms = (firmsResponse.data as LopLawFirm[]) ?? [];
      const metricSeed: Record<string, { count: number; total: number }> = {};

      for (const patient of (patientsResponse.data ?? []) as Record<string, unknown>[]) {
        const firmId = patient.law_firm_id as string | undefined;
        if (!firmId) continue;

        if (!metricSeed[firmId]) {
          metricSeed[firmId] = { count: 0, total: 0 };
        }

        metricSeed[firmId].count += 1;
        metricSeed[firmId].total += Number(patient.amount_collected) || 0;
      }

      const computedMetrics: Record<string, FirmMetric> = {};
      for (const [firmId, metric] of Object.entries(metricSeed)) {
        computedMetrics[firmId] = {
          count: metric.count,
          avgCollected: metric.count > 0 ? metric.total / metric.count : 0,
        };
      }

      setFirms(loadedFirms);
      setFirmMetrics(computedMetrics);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFirms();
  }, [loadFirms]);

  const openDialog = (firm?: LopLawFirm) => {
    if (firm) {
      setEditingFirm(firm);
      setForm({
        name: firm.name,
        intake_email: firm.intake_email ?? "",
        escalation_email: firm.escalation_email ?? "",
        primary_contact: firm.primary_contact ?? "",
        primary_phone: firm.primary_phone ?? "",
        notes: firm.notes ?? "",
        is_active: firm.is_active,
      });
    } else {
      setEditingFirm(null);
      setForm({
        name: "",
        intake_email: "",
        escalation_email: "",
        primary_contact: "",
        primary_phone: "",
        notes: "",
        is_active: true,
      });
    }

    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Law firm name is required.");
      return;
    }

    setSaving(true);

    try {
      if (editingFirm) {
        await lopDb.update(
          "lop_law_firms",
          {
            name: form.name.trim(),
            intake_email: form.intake_email || null,
            escalation_email: form.escalation_email || null,
            primary_contact: form.primary_contact || null,
            primary_phone: form.primary_phone || null,
            notes: form.notes || null,
            is_active: form.is_active,
          },
          { id: editingFirm.id }
        );

        await lopDb.insert("lop_audit_log", {
          user_id: lopUser?.id,
          action: "law_firm_updated",
          entity_type: "law_firm",
          entity_id: editingFirm.id,
          old_values: {
            name: editingFirm.name,
            intake_email: editingFirm.intake_email,
            is_active: editingFirm.is_active,
          },
          new_values: {
            name: form.name.trim(),
            intake_email: form.intake_email || null,
            is_active: form.is_active,
          },
        });

        toast.success("Law firm updated.");
      } else {
        const { data } = await lopDb.insert(
          "lop_law_firms",
          {
            name: form.name.trim(),
            intake_email: form.intake_email || null,
            escalation_email: form.escalation_email || null,
            primary_contact: form.primary_contact || null,
            primary_phone: form.primary_phone || null,
            notes: form.notes || null,
            is_active: form.is_active,
          },
          { select: "id", single: true }
        );

        await lopDb.insert("lop_audit_log", {
          user_id: lopUser?.id,
          action: "law_firm_created",
          entity_type: "law_firm",
          entity_id: (data as { id?: string } | null)?.id,
          new_values: { name: form.name.trim() },
        });

        toast.success("Law firm added.");
      }

      setDialogOpen(false);
      await loadFirms();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save law firm.");
    } finally {
      setSaving(false);
    }
  };

  const filteredFirms = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return firms;

    return firms.filter((firm) => {
      return (
        firm.name.toLowerCase().includes(query) ||
        (firm.primary_contact ?? "").toLowerCase().includes(query) ||
        (firm.intake_email ?? "").toLowerCase().includes(query)
      );
    });
  }, [firms, search]);

  const summary = useMemo(() => {
    const activeCount = filteredFirms.filter((firm) => firm.is_active).length;
    const totalPatients = filteredFirms.reduce(
      (sum, firm) => sum + (firmMetrics[firm.id]?.count ?? 0),
      0
    );
    const avgCollectedAcrossActive = filteredFirms
      .filter((firm) => firm.is_active)
      .reduce((sum, firm) => sum + (firmMetrics[firm.id]?.avgCollected ?? 0), 0);

    return {
      activeCount,
      totalPatients,
      averageCollected:
        activeCount > 0 ? avgCollectedAcrossActive / activeCount : 0,
    };
  }, [filteredFirms, firmMetrics]);

  const comparisonFirms = useMemo(() => {
    const totalPatients = filteredFirms.reduce(
      (sum, firm) => sum + (firmMetrics[firm.id]?.count ?? 0),
      0
    );

    return [...filteredFirms]
      .map((firm) => {
        const patientCount = firmMetrics[firm.id]?.count ?? 0;
        return {
          firm,
          patientCount,
          avgCollected: firmMetrics[firm.id]?.avgCollected ?? 0,
          share: totalPatients > 0 ? Math.round((patientCount / totalPatients) * 100) : 0,
        };
      })
      .sort((left, right) => right.patientCount - left.patientCount);
  }, [filteredFirms, firmMetrics]);

  const topFirm = comparisonFirms[0];

  return (
    <div className="pb-8 lg:pb-12">
      <header className="mb-6 rounded-[30px] border border-white/70 bg-white/70 px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:sticky lg:top-0 lg:z-20 lg:mb-8 lg:px-8 lg:py-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="font-heading text-lg font-semibold text-[#0B3B91]">
              MediLegal Central
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#0B3B91]/5 px-3 py-1.5 text-xs font-semibold text-[#0B3B91]">
                <Gavel className="h-3.5 w-3.5" />
                Law Firm Management
              </span>
              <span className="text-sm text-slate-500">
                Referral network performance and partner health
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1 sm:w-80">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search law firms or contacts..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 rounded-full border-white/80 bg-slate-100/90 pl-11 pr-4 text-sm shadow-none focus-visible:ring-[#0B3B91]/20"
              />
            </div>

            {canManage && (
              <Button
                type="button"
                onClick={() => openDialog()}
                className="h-11 rounded-full bg-gradient-to-r from-[#D72638] to-[#ff4d5e] px-5 text-white shadow-[0_16px_35px_rgba(215,38,56,0.2)] hover:scale-[1.01] hover:from-[#c91f31] hover:to-[#ff4355]"
              >
                <Plus className="h-4 w-4" />
                Add Law Firm
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="px-1 lg:px-0">
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-[#0B3B91] md:text-5xl">
              Law Firms
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 md:text-base">
              {filteredFirms.length} firm{filteredFirms.length === 1 ? "" : "s"} currently in view
            </p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[26px] border border-white/80 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Firms In View
            </p>
            <p className="mt-3 font-heading text-3xl font-black text-[#0B3B91]">
              {filteredFirms.length}
            </p>
          </div>
          <div className="rounded-[26px] border border-white/80 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Active Partners
            </p>
            <p className="mt-3 font-heading text-3xl font-black text-[#0B3B91]">
              {summary.activeCount}
            </p>
          </div>
          <div className="rounded-[26px] border border-white/80 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Avg Collected
            </p>
            <p className="mt-3 font-heading text-3xl font-black text-[#0B3B91]">
              {formatCurrency(summary.averageCollected)}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Across active firms in the current view
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-[30px] border border-white/80 bg-white shadow-sm">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-[#0B3B91]" />
              Loading law firms...
            </div>
          </div>
        ) : filteredFirms.length === 0 ? (
          <div className="rounded-[30px] border border-white/80 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-heading text-2xl font-bold text-slate-900">
              {firms.length === 0 ? "No law firms yet" : "No firms match this search"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
              {firms.length === 0
                ? "Create your first referral partner to start tracking patient volume and collections."
                : "Try a broader search term or open the add/edit dialog to update partner details."}
            </p>
            {canManage && firms.length === 0 && (
              <Button
                type="button"
                className="mt-6 rounded-2xl bg-gradient-to-r from-[#D72638] to-[#ff4d5e] text-white hover:from-[#c91f31] hover:to-[#ff4355]"
                onClick={() => openDialog()}
              >
                <Plus className="h-4 w-4" />
                Add Law Firm
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              {filteredFirms.map((firm) => {
                const metric = firmMetrics[firm.id] ?? { count: 0, avgCollected: 0 };
                const active = firm.is_active;

                return (
                  <div
                    key={firm.id}
                    className={cn(
                      "overflow-hidden rounded-[30px] shadow-[0_24px_48px_rgba(9,20,40,0.06)] transition-all duration-300 hover:-translate-y-1",
                      active
                        ? "border border-white/70 bg-white/80 backdrop-blur-xl"
                        : "border border-slate-200 bg-slate-100/85"
                    )}
                  >
                    <div
                      className={cn(
                        "h-2",
                        active ? "bg-gradient-to-r from-[#0B3B91] to-[#2563EB]" : "bg-slate-300"
                      )}
                    />
                    <div className="p-8">
                      <div className="mb-8 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "flex h-16 w-16 items-center justify-center rounded-[22px]",
                              active
                                ? "bg-slate-100 text-[#0B3B91]"
                                : "bg-slate-200 text-slate-400"
                            )}
                          >
                            <Building2 className="h-8 w-8" />
                          </div>
                          <div>
                            <h3
                              className={cn(
                                "font-heading text-3xl font-bold",
                                active ? "text-slate-900" : "text-slate-500"
                              )}
                            >
                              {firm.name}
                            </h3>
                            <div className="mt-2 flex items-center gap-2">
                              <span
                                className={cn(
                                  "h-2.5 w-2.5 rounded-full",
                                  active ? "bg-emerald-500" : "bg-slate-400"
                                )}
                              />
                              <span
                                className={cn(
                                  "text-xs font-bold uppercase tracking-[0.22em]",
                                  active ? "text-emerald-600" : "text-slate-400"
                                )}
                              >
                                {active ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="text-right">
                            <p
                              className={cn(
                                "font-heading text-4xl font-black",
                                active ? "text-[#0B3B91]" : "text-slate-400"
                              )}
                            >
                              {formatCurrency(metric.avgCollected)}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                              Avg Collected
                            </p>
                          </div>
                          {canManage && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-2xl text-slate-500 hover:bg-white"
                              onClick={() => openDialog(firm)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="mb-8 grid grid-cols-2 gap-6">
                        <div className="rounded-2xl bg-slate-100/90 p-4">
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                            Total Patients
                          </span>
                          <span className="font-heading text-3xl font-bold text-slate-900">
                            {metric.count}
                          </span>
                        </div>
                        <div className="rounded-2xl bg-slate-100/90 p-4">
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                            Engagement
                          </span>
                          <span className="font-heading text-3xl font-bold text-slate-900">
                            {getEngagementLabel(metric.count)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 border-t border-slate-100 pt-6">
                        <div className="flex items-center gap-4">
                          <UserRound className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-600">
                            Contact:{" "}
                            <span className="text-slate-900">
                              {firm.primary_contact || "No contact person assigned"}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-600">
                            {firm.intake_email || firm.escalation_email || "No email on file"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-600">
                            {firm.primary_phone || "No phone on file"}
                          </span>
                        </div>
                        {firm.notes && (
                          <p className="rounded-2xl bg-white/70 px-4 py-3 text-sm leading-6 text-slate-500">
                            {firm.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="rounded-[30px] border border-white/70 bg-white/80 p-8 shadow-[0_24px_48px_rgba(9,20,40,0.06)] backdrop-blur-xl lg:col-span-2">
                <h2 className="font-heading text-2xl font-bold text-slate-900">
                  Firm Performance Comparison
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Volume and collection posture across the firms currently in view.
                </p>

                <div className="mt-8 space-y-6">
                  {comparisonFirms.map(({ firm, patientCount, avgCollected, share }) => (
                    <div key={firm.id}>
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <div>
                          <span
                            className={cn(
                              "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                              firm.is_active
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-500"
                            )}
                          >
                            {firm.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-500">
                            {share}% volume share
                          </p>
                          <p className="text-sm font-bold text-slate-900">
                            {patientCount} patients • {formatCurrency(avgCollected)} avg
                          </p>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            firm.is_active
                              ? "bg-gradient-to-r from-[#0B3B91] to-[#2563EB]"
                              : "bg-slate-300"
                          )}
                          style={{ width: `${patientCount === 0 ? 0 : Math.max(6, share)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#D72638] to-[#ff4d5e] p-8 text-white shadow-[0_24px_48px_rgba(215,38,56,0.18)]">
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div>
                    <h2 className="font-heading text-3xl font-bold leading-tight">
                      Expansion Ready?
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-white/85">
                      {topFirm
                        ? `${topFirm.firm.name} leads the network right now. Use the onboarding tools to add the next referral partner and balance volume.`
                        : "Scale your firm network with a cleaner onboarding flow and better visibility into partner health."}
                    </p>
                  </div>

                  <div className="mt-8 space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {summary.totalPatients} referred patients tracked
                    </div>
                    {canManage && (
                      <Button
                        type="button"
                        className="rounded-2xl bg-white text-[#D72638] hover:bg-slate-50"
                        onClick={() => openDialog()}
                      >
                        Add Next Firm
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
              </div>
            </div>
          </>
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[28px] border-white/80 bg-white/95 p-0">
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="font-heading text-2xl font-bold text-[#0B3B91]">
              {editingFirm ? "Edit Law Firm" : "Add Law Firm"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 px-6 py-6">
            <div>
              <Label>Firm Name *</Label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className="mt-2 rounded-2xl"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Intake Email</Label>
                <Input
                  type="email"
                  value={form.intake_email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      intake_email: event.target.value,
                    }))
                  }
                  placeholder="For LOP reminders"
                  className="mt-2 rounded-2xl"
                />
              </div>
              <div>
                <Label>Escalation Email</Label>
                <Input
                  type="email"
                  value={form.escalation_email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      escalation_email: event.target.value,
                    }))
                  }
                  className="mt-2 rounded-2xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Primary Contact</Label>
                <Input
                  value={form.primary_contact}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      primary_contact: event.target.value,
                    }))
                  }
                  className="mt-2 rounded-2xl"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={form.primary_phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      primary_phone: event.target.value,
                    }))
                  }
                  className="mt-2 rounded-2xl"
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                className="mt-2 rounded-2xl"
              />
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, is_active: checked }))
                }
              />
              <Label>Active firm</Label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-2xl bg-gradient-to-r from-[#0B3B91] to-[#2563EB] text-white hover:from-[#09337c] hover:to-[#1f57d6]"
                onClick={handleSave}
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingFirm ? "Update" : "Add"} Firm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
