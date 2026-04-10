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
    loadFirms();
  }, []);

  useEffect(() => {
    if (activeFacilityId && !form.facility_id) {
      setForm((f) => ({ ...f, facility_id: activeFacilityId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFacilityId]);

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.facility_id) {
      toast.error("Patient name and facility are required.");
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

      toast.success("Patient record created.");
      router.push(`/lop/patients/${data.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create patient record.");
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
              <Label>Facility *</Label>
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
              <Label>Law Firm</Label>
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
              <Label>First Name *</Label>
              <Input
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={form.date_of_birth}
                onChange={(e) => update("date_of_birth", e.target.value)}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Email</Label>
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
              <Label>Address Line 1</Label>
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
              <Label>Date of Accident</Label>
              <Input
                type="date"
                value={form.date_of_accident}
                onChange={(e) => update("date_of_accident", e.target.value)}
              />
            </div>
            <div>
              <Label>Expected Arrival</Label>
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
