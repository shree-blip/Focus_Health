"use client";

import { useEffect, useState } from "react";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopDb } from "@/lib/lop/db";
import { hasPermission } from "@/lib/lop/permissions";
import type { LopLawFirm } from "@/lib/lop/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Building2, Edit, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LawFirmsPage() {
  const { lopUser } = useLopAuth();
  const [firms, setFirms] = useState<LopLawFirm[]>([]);
  const [firmMetrics, setFirmMetrics] = useState<
    Record<string, { count: number; avg_collected: number }>
  >({});
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

  const loadFirms = async () => {
    const [firmsRes, patientsRes] = await Promise.all([
      lopDb.select("lop_law_firms", { order: { column: "name" } }),
      lopDb.select("lop_patients", {
        select: "law_firm_id, amount_collected",
      }),
    ]);
    setFirms((firmsRes.data as unknown as LopLawFirm[]) ?? []);

    // Compute per-firm metrics
    const metrics: Record<string, { count: number; total: number }> = {};
    for (const p of (patientsRes.data ?? []) as Record<string, unknown>[]) {
      const fid = p.law_firm_id as string;
      if (!fid) continue;
      if (!metrics[fid]) metrics[fid] = { count: 0, total: 0 };
      metrics[fid].count += 1;
      metrics[fid].total += parseFloat((p.amount_collected as string) ?? "0") || 0;
    }
    const computed: Record<string, { count: number; avg_collected: number }> = {};
    for (const [fid, m] of Object.entries(metrics)) {
      computed[fid] = {
        count: m.count,
        avg_collected: m.count > 0 ? m.total / m.count : 0,
      };
    }
    setFirmMetrics(computed);
    setLoading(false);
  };

  useEffect(() => {
    loadFirms();
  }, []);

  const canManage = hasPermission(lopUser, "law_firm:update");

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
        const { error } = await lopDb.update(
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
          { id: editingFirm.id },
        );

        if (error) throw error;

        // Audit log for update
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
        const { data: newFirm, error } = await lopDb.insert(
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
          { select: "id", single: true },
        );

        if (error) throw error;

        // Audit log for create
        await lopDb.insert("lop_audit_log", {
          user_id: lopUser?.id,
          action: "law_firm_created",
          entity_type: "law_firm",
          entity_id: newFirm?.id,
          new_values: { name: form.name.trim() },
        });
        toast.success("Law firm added.");
      }

      setDialogOpen(false);
      loadFirms();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save law firm.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = firms.filter((f) =>
    search
      ? f.name.toLowerCase().includes(search.toLowerCase()) ||
        (f.primary_contact ?? "").toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Law Firms</h1>
          <p className="text-sm text-slate-500">
            {firms.length} firm{firms.length !== 1 ? "s" : ""} in system
          </p>
        </div>
        {canManage && (
          <Button onClick={() => openDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Law Firm
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search law firms…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Firms grid */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading law firms…</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {firms.length === 0
                ? "No law firms added yet."
                : "No law firms match your search."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((firm) => (
            <Card
              key={firm.id}
              className={`transition-colors ${
                !firm.is_active ? "opacity-60" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{firm.name}</CardTitle>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDialog(firm)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {!firm.is_active && (
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full w-fit">
                    Inactive
                  </span>
                )}
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                {/* Metrics */}
                <div className="flex gap-4 pb-2 mb-2 border-b border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400">Patients</p>
                    <p className="font-semibold text-slate-900">
                      {firmMetrics[firm.id]?.count ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Avg Collected</p>
                    <p className="font-semibold text-slate-900">
                      ${(firmMetrics[firm.id]?.avg_collected ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
                {firm.primary_contact && (
                  <p className="text-slate-600">
                    <span className="text-slate-400">Contact:</span>{" "}
                    {firm.primary_contact}
                  </p>
                )}
                {firm.intake_email && (
                  <p className="text-slate-600">
                    <span className="text-slate-400">Email:</span>{" "}
                    {firm.intake_email}
                  </p>
                )}
                {firm.primary_phone && (
                  <p className="text-slate-600">
                    <span className="text-slate-400">Phone:</span>{" "}
                    {firm.primary_phone}
                  </p>
                )}
                {firm.notes && (
                  <p className="text-xs text-slate-400 line-clamp-2 mt-2">
                    {firm.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingFirm ? "Edit Law Firm" : "Add Law Firm"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Firm Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Intake Email</Label>
                <Input
                  type="email"
                  value={form.intake_email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, intake_email: e.target.value }))
                  }
                  placeholder="For LOP reminders"
                />
              </div>
              <div>
                <Label>Escalation Email</Label>
                <Input
                  type="email"
                  value={form.escalation_email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, escalation_email: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Primary Contact</Label>
                <Input
                  value={form.primary_contact}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, primary_contact: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={form.primary_phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, primary_phone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                rows={3}
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, is_active: checked }))
                }
              />
              <Label>Active</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingFirm ? "Update" : "Add"} Firm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
