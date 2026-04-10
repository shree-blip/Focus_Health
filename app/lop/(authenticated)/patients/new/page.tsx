"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopDb } from "@/lib/lop/db";
import type { LopFacility, LopLawFirm } from "@/lib/lop/types";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/lop/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Patient Intake</h1>
          <p className="text-sm text-slate-500">Create a new LOP patient record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Facility & Law Firm */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assignment</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Facility{isRequired("facility_id") ? " *" : ""}</Label>
              <Select
                value={form.facility_id}
                onValueChange={(v) => update("facility_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Law Firm{isRequired("law_firm_id") ? " *" : ""}</Label>
              <Select
                value={form.law_firm_id}
                onValueChange={(v) => update("law_firm_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select law firm" />
                </SelectTrigger>
                <SelectContent>
                  {lawFirms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>First Name{isRequired("first_name") ? " *" : ""}</Label>
              <Input
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                required={isRequired("first_name")}
              />
            </div>
            <div>
              <Label>Last Name{isRequired("last_name") ? " *" : ""}</Label>
              <Input
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                required={isRequired("last_name")}
              />
            </div>
            <div>
              <Label>Date of Birth{isRequired("date_of_birth") ? " *" : ""}</Label>
              <Input
                type="date"
                value={form.date_of_birth}
                onChange={(e) => update("date_of_birth", e.target.value)}
              />
            </div>
            <div>
              <Label>Phone{isRequired("phone") ? " *" : ""}</Label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Email{isRequired("email") ? " *" : ""}</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Address</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Address Line 1{isRequired("address_line1") ? " *" : ""}</Label>
              <Input
                value={form.address_line1}
                onChange={(e) => update("address_line1", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Address Line 2</Label>
              <Input
                value={form.address_line2}
                onChange={(e) => update("address_line2", e.target.value)}
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
              />
            </div>
            <div>
              <Label>ZIP Code</Label>
              <Input
                value={form.zip}
                onChange={(e) => update("zip", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Accident & Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Case Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Date of Accident{isRequired("date_of_accident") ? " *" : ""}</Label>
              <Input
                type="date"
                value={form.date_of_accident}
                onChange={(e) => update("date_of_accident", e.target.value)}
              />
            </div>
            <div>
              <Label>Expected Arrival{isRequired("expected_arrival") ? " *" : ""}</Label>
              <Input
                type="datetime-local"
                value={form.expected_arrival}
                onChange={(e) => update("expected_arrival", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Intake Notes</Label>
              <Textarea
                rows={3}
                value={form.intake_notes}
                onChange={(e) => update("intake_notes", e.target.value)}
                placeholder="Any notes about this patient..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/lop/patients">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create Patient Record
          </Button>
        </div>
      </form>
    </div>
  );
}
