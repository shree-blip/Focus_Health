"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopDb } from "@/lib/lop/db";
import type { LopLawFirm } from "@/lib/lop/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  FileText,
  Loader2,
  MapPin,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewPatientPage() {
  const router = useRouter();
  const { lopUser, facilities, activeFacilityId } = useLopAuth();
  const [lawFirms, setLawFirms] = useState<LopLawFirm[]>([]);
  const [saving, setSaving] = useState(false);
  const [mandatoryFields, setMandatoryFields] = useState<string[]>([
    "first_name",
    "last_name",
    "facility_id",
  ]);

  const [form, setForm] = useState({
    facility_id: activeFacilityId ?? "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone: "",
    email: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip: "",
    date_of_accident: "",
    law_firm_id: "",
    expected_arrival: "",
    intake_notes: "",
  });

  useEffect(() => {
    const loadFirms = async () => {
      const { data } = await lopDb.select("lop_law_firms", {
        filters: [{ column: "is_active", op: "eq", value: true }],
        order: { column: "name" },
      });
      setLawFirms((data as unknown as LopLawFirm[]) ?? []);
    };

    const loadMandatoryFields = async () => {
      try {
        const { data } = await lopDb.select("lop_config", {
          filters: [{ column: "key", op: "eq", value: "mandatory_intake_fields" }],
          single: true,
        });
        if (data && (data as Record<string, unknown>).value) {
          const val = (data as Record<string, unknown>).value;
          const fields = typeof val === "string" ? JSON.parse(val) : val;
          if (Array.isArray(fields) && fields.length > 0) {
            setMandatoryFields(fields);
          }
        }
      } catch {
        // Fallback to defaults if config not available
      }
    };

    loadFirms();
    loadMandatoryFields();
  }, []);

  useEffect(() => {
    if (activeFacilityId && !form.facility_id) {
      setForm((f) => ({ ...f, facility_id: activeFacilityId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFacilityId]);

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const isRequired = (field: string) => mandatoryFields.includes(field);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate mandatory fields dynamically
    const fieldLabels: Record<string, string> = {
      first_name: "First Name",
      last_name: "Last Name",
      facility_id: "Facility",
      law_firm_id: "Law Firm",
      date_of_accident: "Date of Accident",
      phone: "Phone",
      email: "Email",
      date_of_birth: "Date of Birth",
      expected_arrival: "Expected Arrival",
      address_line1: "Address",
    };
    const missing = mandatoryFields.filter(
      (f) => !form[f as keyof typeof form]?.toString().trim(),
    );
    if (missing.length > 0) {
      toast.error(
        `Required: ${missing.map((f) => fieldLabels[f] || f).join(", ")}`,
      );
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await lopDb.insert(
        "lop_patients",
        {
          facility_id: form.facility_id,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          date_of_birth: form.date_of_birth || null,
          phone: form.phone || null,
          email: form.email || null,
          address_line1: form.address_line1 || null,
          address_line2: form.address_line2 || null,
          city: form.city || null,
          state: form.state || null,
          zip: form.zip || null,
          date_of_accident: form.date_of_accident || null,
          law_firm_id: form.law_firm_id || null,
          expected_arrival: form.expected_arrival || null,
          intake_notes: form.intake_notes || null,
          case_status: form.expected_arrival ? "scheduled" : "arrived",
          created_by: lopUser?.id ?? null,
          updated_by: lopUser?.id ?? null,
        },
        { select: "id", single: true },
      );

      if (error) throw error;

      // Audit log
      await lopDb.insert("lop_audit_log", {
        user_id: lopUser?.id,
        action: "patient_created",
        entity_type: "patient",
        entity_id: data.id,
        facility_id: form.facility_id,
        new_values: { first_name: form.first_name, last_name: form.last_name },
      });

      // Send scheduling notifications if patient has expected arrival
      if (form.expected_arrival) {
        try {
          await fetch("/api/lop/schedule-notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientId: data.id }),
          });
        } catch {
          // Non-blocking: notification failure shouldn't block patient creation
          console.warn("Failed to send scheduling notification");
        }
      }

      toast.success("Patient record created.");
      router.push(`/lop/patients/${data.id}`);
    } catch (err) {
      console.error("Create patient error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to create patient record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-8 lg:pb-12">
      {/* ── Page Header ── */}
      <header className="mb-6 rounded-[30px] border border-white/70 bg-white/70 px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:mb-8 lg:px-8 lg:py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/lop/patients">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-2xl hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5 text-slate-500" />
              </Button>
            </Link>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Patients
              </p>
              <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#0B3B91]">
                New Patient Intake
              </h1>
            </div>
          </div>
          <Button
            type="submit"
            form="intake-form"
            disabled={saving}
            className="h-11 rounded-2xl bg-gradient-to-r from-[#D72638] to-[#ff4d5e] px-6 text-white shadow-[0_18px_38px_rgba(215,38,56,0.22)] transition-transform hover:scale-[1.02] hover:from-[#c91f31] hover:to-[#ff4355]"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Creating…" : "Create Patient"}
          </Button>
        </div>
      </header>

      <form id="intake-form" onSubmit={handleSubmit} className="space-y-5">
        {/* ── Step 1: Assignment ── */}
        <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#0B3B91]/10">
              <Building2 className="h-4 w-4 text-[#0B3B91]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Step 1</p>
              <h2 className="text-sm font-bold text-[#0B3B91]">Assignment</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Facility{isRequired("facility_id") ? " *" : ""}
              </Label>
              <Select
                value={form.facility_id}
                onValueChange={(v) => update("facility_id", v)}
              >
                <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm">
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Law Firm{isRequired("law_firm_id") ? " *" : ""}
              </Label>
              <Select
                value={form.law_firm_id}
                onValueChange={(v) => update("law_firm_id", v)}
              >
                <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm">
                  <SelectValue placeholder="Select law firm" />
                </SelectTrigger>
                <SelectContent>
                  {lawFirms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* ── Step 2: Patient Information ── */}
        <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50">
              <UserRound className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Step 2</p>
              <h2 className="text-sm font-bold text-slate-900">Patient Information</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-slate-600">
                First Name{isRequired("first_name") ? " *" : ""}
              </Label>
              <Input
                className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                required={isRequired("first_name")}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Last Name{isRequired("last_name") ? " *" : ""}
              </Label>
              <Input
                className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                required={isRequired("last_name")}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Date of Birth{isRequired("date_of_birth") ? " *" : ""}
              </Label>
              <Input
                type="date"
                className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                value={form.date_of_birth}
                onChange={(e) => update("date_of_birth", e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Phone{isRequired("phone") ? " *" : ""}
              </Label>
              <Input
                type="tel"
                className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Email{isRequired("email") ? " *" : ""}
              </Label>
              <Input
                type="email"
                className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ── Step 3: Address ── */}
        <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50">
              <MapPin className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Step 3</p>
              <h2 className="text-sm font-bold text-slate-900">Address</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Address Line 1{isRequired("address_line1") ? " *" : ""}
              </Label>
              <Input
                className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                value={form.address_line1}
                onChange={(e) => update("address_line1", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block text-xs font-semibold text-slate-600">Address Line 2</Label>
              <Input
                className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                value={form.address_line2}
                onChange={(e) => update("address_line2", e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-slate-600">City</Label>
              <Input
                className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-slate-600">State</Label>
              <Input
                className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-slate-600">ZIP Code</Label>
              <Input
                className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                value={form.zip}
                onChange={(e) => update("zip", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ── Step 4: Case Details ── */}
        <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50">
              <CalendarClock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Step 4</p>
              <h2 className="text-sm font-bold text-slate-900">Case Details</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Date of Accident{isRequired("date_of_accident") ? " *" : ""}
              </Label>
              <Input
                type="date"
                className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                value={form.date_of_accident}
                onChange={(e) => update("date_of_accident", e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Expected Arrival{isRequired("expected_arrival") ? " *" : ""}
              </Label>
              <Input
                type="datetime-local"
                className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                value={form.expected_arrival}
                onChange={(e) => update("expected_arrival", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block text-xs font-semibold text-slate-600">Intake Notes</Label>
              <Textarea
                rows={3}
                className="rounded-2xl border-slate-200 bg-white shadow-sm"
                value={form.intake_notes}
                onChange={(e) => update("intake_notes", e.target.value)}
                placeholder="Any notes about this patient..."
              />
            </div>
          </div>
        </section>

        {/* ── Footer Actions ── */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <Link href="/lop/patients">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl border-slate-200 px-6 font-semibold"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="h-11 rounded-2xl bg-gradient-to-r from-[#D72638] to-[#ff4d5e] px-6 text-white shadow-[0_18px_38px_rgba(215,38,56,0.22)] transition-transform hover:scale-[1.02] hover:from-[#c91f31] hover:to-[#ff4355]"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Creating…" : "Create Patient Record"}
          </Button>
        </div>
      </form>
    </div>
  );
}
