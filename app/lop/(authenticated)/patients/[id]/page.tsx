"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopClient } from "@/lib/lop/client";
import { hasPermission } from "@/lib/lop/permissions";
import {
  CASE_STATUS_LABELS,
  CASE_STATUS_COLORS,
  DOC_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
} from "@/lib/lop/types";
import type {
  LopPatient,
  LopCaseStatus,
  LopDocumentStatus,
  LopPatientDocument,
  LopLawFirm,
  LopReminderEmail,
} from "@/lib/lop/types";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Loader2,
  Save,
  Upload,
  Mail,
  Clock,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { lopUser } = useLopAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [patient, setPatient] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [documents, setDocuments] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reminders, setReminders] = useState<any[]>([]);
  const [lawFirms, setLawFirms] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    const load = async () => {
      const [patientRes, docsRes, remindersRes, firmsRes] = await Promise.all([
        lopClient
          .from("lop_patients")
          .select("*, lop_facilities(name), lop_law_firms(name)")
          .eq("id", id)
          .single(),
        lopClient
          .from("lop_patient_documents")
          .select("*")
          .eq("patient_id", id)
          .order("created_at", { ascending: false }),
        lopClient
          .from("lop_reminder_emails")
          .select("*")
          .eq("patient_id", id)
          .order("sent_at", { ascending: false }),
        lopClient
          .from("lop_law_firms")
          .select("id, name")
          .eq("is_active", true)
          .order("name"),
      ]);

      if (patientRes.data) {
        setPatient(patientRes.data);
        setForm(patientRes.data);
      }
      setDocuments(docsRes.data ?? []);
      setReminders(remindersRes.data ?? []);
      setLawFirms((firmsRes.data as { id: string; name: string }[]) ?? []);
      setLoading(false);
    };
    load();
  }, [id]);

  const updateForm = (field: string, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await lopClient
        .from("lop_patients")
        .update({
          case_status: form.case_status,
          lop_letter_status: form.lop_letter_status,
          medical_records_status: form.medical_records_status,
          bill_charges: form.bill_charges || null,
          amount_collected: form.amount_collected || null,
          date_paid: form.date_paid || null,
          follow_up_note: form.follow_up_note || null,
          law_firm_id: form.law_firm_id || null,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone || null,
          email: form.email || null,
          date_of_accident: form.date_of_accident || null,
          updated_by: lopUser?.id,
        })
        .eq("id", id);

      if (error) throw error;

      // Audit log
      await lopClient.from("lop_audit_log").insert({
        user_id: lopUser?.id,
        action: "patient_updated",
        entity_type: "patient",
        entity_id: id,
        facility_id: form.facility_id as string,
      });

      toast.success("Patient record updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendReminder = async () => {
    if (!patient) return;
    const lawFirmId = patient.law_firm_id as string;
    if (!lawFirmId) {
      toast.error("No law firm assigned to this patient.");
      return;
    }

    try {
      const { data: firm } = await lopClient
        .from("lop_law_firms")
        .select("intake_email, name")
        .eq("id", lawFirmId)
        .single();

      if (!firm?.intake_email) {
        toast.error("Law firm has no intake email configured.");
        return;
      }

      // Log the reminder (actual email sending via API route)
      await lopClient.from("lop_reminder_emails").insert({
        patient_id: id,
        law_firm_id: lawFirmId,
        recipient_email: firm.intake_email,
        email_type: "lop_letter_request",
        subject: `LOP Letter Request – ${patient.first_name} ${patient.last_name}`,
        sent_by: lopUser?.id,
        status: "sent",
      });

      // Also call the API to actually send
      await fetch("/api/lop/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: id,
          lawFirmId: lawFirmId,
        }),
      });

      toast.success(`Reminder sent to ${firm.name}`);

      // Refresh reminders
      const { data: newReminders } = await lopClient
        .from("lop_reminder_emails")
        .select("*")
        .eq("patient_id", id)
        .order("sent_at", { ascending: false });
      setReminders(newReminders ?? []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send reminder.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Patient not found.</p>
        <Link href="/lop/patients" className="text-blue-600 hover:underline mt-2 inline-block">
          ← Back to patients
        </Link>
      </div>
    );
  }

  const canEdit = hasPermission(lopUser, "patient:update");
  const canEditBilling = hasPermission(lopUser, "billing:update");
  const canSendEmail = hasPermission(lopUser, "email:send");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/lop/patients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {form.first_name as string} {form.last_name as string}
            </h1>
            <p className="text-sm text-slate-500">
              {patient.lop_facilities?.name ?? ""} ·{" "}
              Created {new Date(patient.created_at as string).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canSendEmail && (
            <Button variant="outline" onClick={handleSendReminder} className="gap-2">
              <Mail className="h-4 w-4" />
              Send Reminder
            </Button>
          )}
          {canEdit && (
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing & Status</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="reminders">Reminders ({reminders.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={(form.first_name as string) ?? ""}
                  onChange={(e) => updateForm("first_name", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={(form.last_name as string) ?? ""}
                  onChange={(e) => updateForm("last_name", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={(form.phone as string) ?? ""}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={(form.email as string) ?? ""}
                  onChange={(e) => updateForm("email", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label>Date of Accident</Label>
                <Input
                  type="date"
                  value={(form.date_of_accident as string) ?? ""}
                  onChange={(e) => updateForm("date_of_accident", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label>Law Firm</Label>
                <Select
                  value={(form.law_firm_id as string) ?? ""}
                  onValueChange={(v) => updateForm("law_firm_id", v)}
                  disabled={!canEdit}
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                value={(form.follow_up_note as string) ?? ""}
                onChange={(e) => updateForm("follow_up_note", e.target.value)}
                disabled={!canEdit}
                placeholder="Follow-up notes…"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Case Status</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Case Status</Label>
                <Select
                  value={(form.case_status as string) ?? "scheduled"}
                  onValueChange={(v) => updateForm("case_status", v)}
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CASE_STATUS_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>LOP Letter Status</Label>
                <Select
                  value={(form.lop_letter_status as string) ?? "not_requested"}
                  onValueChange={(v) => updateForm("lop_letter_status", v)}
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOC_STATUS_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Medical Records Status</Label>
                <Select
                  value={(form.medical_records_status as string) ?? "not_requested"}
                  onValueChange={(v) => updateForm("medical_records_status", v)}
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOC_STATUS_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Billing</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Bill Charges ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={(form.bill_charges as string) ?? ""}
                  onChange={(e) => updateForm("bill_charges", e.target.value)}
                  disabled={!canEditBilling}
                />
              </div>
              <div>
                <Label>Amount Collected ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={(form.amount_collected as string) ?? ""}
                  onChange={(e) => updateForm("amount_collected", e.target.value)}
                  disabled={!canEditBilling}
                />
              </div>
              <div>
                <Label>Date Paid</Label>
                <Input
                  type="date"
                  value={(form.date_paid as string) ?? ""}
                  onChange={(e) => updateForm("date_paid", e.target.value)}
                  disabled={!canEditBilling}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Documents</CardTitle>
              {hasPermission(lopUser, "documents:upload") && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">
                  No documents uploaded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id as string}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {String(DOCUMENT_TYPE_LABELS[doc.document_type as keyof typeof DOCUMENT_TYPE_LABELS] ??
                              doc.document_type)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {doc.file_name ?? "No file"} ·{" "}
                            {new Date(doc.created_at as string).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          doc.status === "received"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {DOC_STATUS_LABELS[doc.status as LopDocumentStatus] ?? doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              {reminders.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">
                  No reminders sent yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {reminders.map((r) => (
                    <div
                      key={r.id as string}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {r.subject as string}
                          </p>
                          <p className="text-xs text-slate-500">
                            To: {r.recipient_email as string} ·{" "}
                            {new Date(r.sent_at as string).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          r.status === "sent"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.status as string}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
