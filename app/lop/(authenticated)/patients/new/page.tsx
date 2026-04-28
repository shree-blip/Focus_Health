"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopDb } from "@/lib/lop/db";
import type { LopLawFirm } from "@/lib/lop/types";
import { Input } from "@/components/ui/input";
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
  FileText,
  Loader2,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewPatientPage() {
  const router = useRouter();
  const { lopUser, facilities, activeFacilityId } = useLopAuth();
  const [lawFirms, setLawFirms] = useState<LopLawFirm[]>([]);
  const [lawFirmSearch, setLawFirmSearch] = useState("");
  const lawFirmSearchRef = useRef<HTMLInputElement>(null);
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

    if (!form.facility_id?.toString().trim()) {
      toast.error("Facility is required.");
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
      {/* ── Page Intro ── */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/lop/patients">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-[#0B3B91]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#002668]">
            New Patient Intake
          </h1>
          <p className="mt-0.5 text-sm font-medium text-slate-500">
            Create a new LOP patient record to initiate the clinical workflow.
          </p>
        </div>
      </div>

      {/* ── Bento Form Grid ── */}
      <form id="intake-form" onSubmit={handleSubmit} className="grid max-w-5xl grid-cols-12 gap-6 lg:gap-8">
        {/* ── Left Column: Assignment + Case Details ── */}
        <div className="col-span-12 space-y-6 lg:col-span-4 lg:space-y-8">
          {/* Assignment Card */}
          <div className="relative overflow-hidden rounded-2xl bg-white p-7 shadow-[0_24px_48px_rgba(9,20,40,0.04)] lg:p-8">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#0B3B91] to-[#2563EB]" />
            <div className="mb-6 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-[#0B3B91]" />
              <h3 className="font-heading text-sm font-bold tracking-tight text-[#002668]">
                Assignment
              </h3>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Facility{isRequired("facility_id") ? " *" : ""}
                </label>
                <Select
                  value={form.facility_id}
                  onValueChange={(v) => update("facility_id", v)}
                >
                  <SelectTrigger className="h-12 rounded-xl border-none bg-[#e6e8eb] px-4 text-sm shadow-none focus:ring-2 focus:ring-[#0B3B91]">
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Law Firm{isRequired("law_firm_id") ? " *" : ""}
                </label>
                <Select
                  value={form.law_firm_id}
                  onValueChange={(v) => { update("law_firm_id", v); setLawFirmSearch(""); }}
                  onOpenChange={(open) => { if (open) setTimeout(() => lawFirmSearchRef.current?.focus(), 50); else setLawFirmSearch(""); }}
                >
                  <SelectTrigger className="h-12 rounded-xl border-none bg-[#e6e8eb] px-4 text-sm shadow-none focus:ring-2 focus:ring-[#0B3B91]">
                    <SelectValue placeholder="Select law firm" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="flex items-center gap-2 border-b border-slate-100 px-3 pb-2 pt-1">
                      <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <input
                        ref={lawFirmSearchRef}
                        value={lawFirmSearch}
                        onChange={(e) => setLawFirmSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        placeholder="Search law firm…"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      />
                    </div>
                    {lawFirms
                      .filter((f) => f.name.toLowerCase().includes(lawFirmSearch.toLowerCase()))
                      .map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    {lawFirms.filter((f) => f.name.toLowerCase().includes(lawFirmSearch.toLowerCase())).length === 0 && (
                      <div className="py-3 text-center text-xs text-slate-400">No law firms found</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Case Details Card */}
          <div className="relative overflow-hidden rounded-2xl bg-white p-7 shadow-[0_24px_48px_rgba(9,20,40,0.04)] lg:p-8">
            <div className="absolute left-0 top-0 h-full w-1 bg-slate-200" />
            <div className="mb-6 flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#0B3B91]" />
              <h3 className="font-heading text-sm font-bold tracking-tight text-[#002668]">
                Case Details
              </h3>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Date of Accident{isRequired("date_of_accident") ? " *" : ""}
                </label>
                <Input
                  type="date"
                  className="h-12 rounded-xl border-none bg-[#e6e8eb] px-4 text-sm shadow-none focus:ring-2 focus:ring-[#0B3B91]"
                  value={form.date_of_accident}
                  onChange={(e) => update("date_of_accident", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Expected Arrival{isRequired("expected_arrival") ? " *" : ""}
                </label>
                <Input
                  type="datetime-local"
                  className="h-12 rounded-xl border-none bg-[#e6e8eb] px-4 text-sm shadow-none focus:ring-2 focus:ring-[#0B3B91]"
                  value={form.expected_arrival}
                  onChange={(e) => update("expected_arrival", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Intake Notes
                </label>
                <Textarea
                  rows={4}
                  className="rounded-xl border-none bg-[#e6e8eb] px-4 py-3 text-sm shadow-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#0B3B91]"
                  value={form.intake_notes}
                  onChange={(e) => update("intake_notes", e.target.value)}
                  placeholder="Enter patient clinical background or special requirements..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Patient Information ── */}
        <div className="col-span-12 lg:col-span-8">
          <div className="relative flex h-full flex-col rounded-2xl bg-white p-7 shadow-[0_24px_48px_rgba(9,20,40,0.04)] lg:p-10">
            {/* Header with badge */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-[#0B3B91]" />
                <h3 className="font-heading text-lg font-bold tracking-tight text-[#002668]">
                  Patient Information
                </h3>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[#dae2ff] px-3 py-1">
                <div className="h-2 w-2 animate-pulse rounded-full bg-[#0B3B91]" />
                <span className="text-[10px] font-bold uppercase tracking-tight text-[#001848]">
                  Drafting Profile
                </span>
              </div>
            </div>

            {/* Core fields */}
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  First Name{isRequired("first_name") ? " *" : ""}
                </label>
                <Input
                  className="h-[52px] rounded-xl border-none bg-[#e6e8eb] px-5 text-sm shadow-none focus:ring-2 focus:ring-[#0B3B91]"
                  placeholder="John"
                  value={form.first_name}
                  onChange={(e) => update("first_name", e.target.value)}
                  required={isRequired("first_name")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Last Name{isRequired("last_name") ? " *" : ""}
                </label>
                <Input
                  className="h-[52px] rounded-xl border-none bg-[#e6e8eb] px-5 text-sm shadow-none focus:ring-2 focus:ring-[#0B3B91]"
                  placeholder="Doe"
                  value={form.last_name}
                  onChange={(e) => update("last_name", e.target.value)}
                  required={isRequired("last_name")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Date of Birth{isRequired("date_of_birth") ? " *" : ""}
                </label>
                <Input
                  type="date"
                  className="h-[52px] rounded-xl border-none bg-[#e6e8eb] px-5 text-sm shadow-none focus:ring-2 focus:ring-[#0B3B91]"
                  value={form.date_of_birth}
                  onChange={(e) => update("date_of_birth", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Phone Number{isRequired("phone") ? " *" : ""}
                </label>
                <Input
                  type="tel"
                  className="h-[52px] rounded-xl border-none bg-[#e6e8eb] px-5 text-sm shadow-none focus:ring-2 focus:ring-[#0B3B91]"
                  placeholder="(555) 000-0000"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
              <div className="col-span-1 space-y-2 sm:col-span-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Email Address{isRequired("email") ? " *" : ""}
                </label>
                <Input
                  type="email"
                  className="h-[52px] rounded-xl border-none bg-[#e6e8eb] px-5 text-sm shadow-none focus:ring-2 focus:ring-[#0B3B91]"
                  placeholder="patient.name@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
            </div>

            {/* Address section */}
            <div className="border-t border-slate-100 pt-8">
              <h4 className="mb-6 flex items-center gap-2 font-heading text-sm font-bold text-slate-800">
                <MapPin className="h-4 w-4 text-slate-400" />
                Residential Address
              </h4>
              <div className="grid grid-cols-6 gap-5 lg:gap-6">
                <div className="col-span-6 space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Address Line 1{isRequired("address_line1") ? " *" : ""}
                  </label>
                  <Input
                    className="h-[52px] rounded-xl border-none bg-[#e6e8eb] px-5 text-sm shadow-none focus:ring-2 focus:ring-[#0B3B91]"
                    placeholder="Street name and number"
                    value={form.address_line1}
                    onChange={(e) => update("address_line1", e.target.value)}
                  />
                </div>
                <div className="col-span-6 space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Address Line 2 (Optional)
                  </label>
                  <Input
                    className="h-[52px] rounded-xl border-none bg-[#e6e8eb] px-5 text-sm shadow-none focus:ring-2 focus:ring-[#0B3B91]"
                    placeholder="Apartment, suite, unit, etc."
                    value={form.address_line2}
                    onChange={(e) => update("address_line2", e.target.value)}
                  />
                </div>
                <div className="col-span-6 space-y-2 sm:col-span-3">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    City
                  </label>
                  <Input
                    className="h-[52px] rounded-xl border-none bg-[#e6e8eb] px-5 text-sm shadow-none focus:ring-2 focus:ring-[#0B3B91]"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                </div>
                <div className="col-span-3 space-y-2 sm:col-span-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    State
                  </label>
                  <Input
                    className="h-[52px] rounded-xl border-none bg-[#e6e8eb] px-5 text-sm shadow-none focus:ring-2 focus:ring-[#0B3B91]"
                    placeholder="TX"
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                  />
                </div>
                <div className="col-span-3 space-y-2 sm:col-span-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    ZIP Code
                  </label>
                  <Input
                    className="h-[52px] rounded-xl border-none bg-[#e6e8eb] px-5 text-sm shadow-none focus:ring-2 focus:ring-[#0B3B91]"
                    placeholder="75000"
                    value={form.zip}
                    onChange={(e) => update("zip", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* CTA Area */}
            <div className="mt-12 flex items-center justify-end gap-4">
              <Link href="/lop/patients">
                <button
                  type="button"
                  className="rounded-xl px-8 py-3 font-bold text-[#002668] transition-colors hover:bg-[#dae2ff]"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gradient-to-br from-[#D72638] to-[#FF3D57] px-8 py-4 font-heading font-bold text-white shadow-[0_8px_24px_rgba(215,38,56,0.3)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </span>
                ) : (
                  "Create Patient Record"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ── Quick Guide (Glassmorphic) ── */}
      <div className="pointer-events-none fixed bottom-8 right-8 hidden w-64 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-2xl backdrop-blur-xl xl:block">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            Quick Guide
          </span>
        </div>
        <p className="text-xs font-medium leading-relaxed text-slate-700">
          Ensure the{" "}
          <span className="font-bold text-[#002668]">Case Details</span> match
          the official police report for seamless billing and intake
          verification.
        </p>
      </div>
    </div>
  );
}
