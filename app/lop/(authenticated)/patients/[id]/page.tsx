"use client";

import { useEffect, useState, useCallback, use } from "react";
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
  LopCaseStatus,
  LopDocumentStatus,
  LopDocumentType,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Loader2,
  Save,
  Upload,
  Mail,
  FileText,
  Plus,
  X,
  Download,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Tag Input                                                          */
/* ------------------------------------------------------------------ */
function TagInput({
  tags,
  onChange,
  disabled,
  placeholder,
}: {
  tags: string[];
  onChange: (t: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInput("");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
      </div>
      {!disabled && (
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder={placeholder ?? "Add tag\u2026"}
            className="h-8 text-sm"
          />
          <Button type="button" variant="outline" size="sm" onClick={add}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { lopUser } = useLopAuth();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [patient, setPatient] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [documents, setDocuments] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reminders, setReminders] = useState<any[]>([]);
  const [lawFirms, setLawFirms] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form, setForm] = useState<any>({});

  // Document upload dialog
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const [docForm, setDocForm] = useState({
    document_type: "lop_letter" as string,
    notes: "",
    status: "requested" as string,
  });
  const [docFile, setDocFile] = useState<File | null>(null);

  // Load data
  const loadData = useCallback(async () => {
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
      setForm({
        ...patientRes.data,
        billing_tags: patientRes.data.billing_tags ?? [],
        medical_record_tags: patientRes.data.medical_record_tags ?? [],
      });
    }
    setDocuments(docsRes.data ?? []);
    setReminders(remindersRes.data ?? []);
    setLawFirms((firmsRes.data as { id: string; name: string }[]) ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateForm = (field: string, value: unknown) =>
    setForm((f: Record<string, unknown>) => ({ ...f, [field]: value }));

  /* ---- Save all patient fields ---- */
  const handleSave = async () => {
    setSaving(true);
    try {
      const oldStatus = patient.case_status;
      const { error } = await lopClient
        .from("lop_patients")
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          date_of_birth: form.date_of_birth || null,
          phone: form.phone || null,
          email: form.email || null,
          address_line1: form.address_line1 || null,
          address_line2: form.address_line2 || null,
          city: form.city || null,
          state: form.state || null,
          zip: form.zip || null,
          date_of_accident: form.date_of_accident || null,
          expected_arrival: form.expected_arrival || null,
          arrival_window_min: form.arrival_window_min ?? 60,
          case_status: form.case_status,
          lop_letter_status: form.lop_letter_status,
          medical_records_status: form.medical_records_status,
          bill_charges: form.bill_charges || null,
          amount_collected: form.amount_collected || null,
          date_paid: form.date_paid || null,
          billing_tags: form.billing_tags ?? [],
          medical_record_tags: form.medical_record_tags ?? [],
          follow_up_note: form.follow_up_note || null,
          intake_notes: form.intake_notes || null,
          law_firm_id: form.law_firm_id || null,
          updated_by: lopUser?.id,
        })
        .eq("id", id);

      if (error) throw error;

      // Build change map for audit
      const changes: Record<string, unknown> = {};
      if (oldStatus !== form.case_status)
        changes.case_status = { from: oldStatus, to: form.case_status };
      if (patient.bill_charges !== form.bill_charges)
        changes.bill_charges = form.bill_charges;
      if (patient.amount_collected !== form.amount_collected)
        changes.amount_collected = form.amount_collected;

      await lopClient.from("lop_audit_log").insert({
        user_id: lopUser?.id,
        action:
          oldStatus !== form.case_status ? "status_changed" : "patient_updated",
        entity_type: "patient",
        entity_id: id,
        facility_id: form.facility_id as string,
        old_values:
          oldStatus !== form.case_status ? { case_status: oldStatus } : null,
        new_values: Object.keys(changes).length > 0 ? changes : null,
      });

      setPatient({ ...patient, ...form });
      toast.success("Patient record updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  /* ---- Send LOP reminder email ---- */
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

      await lopClient.from("lop_reminder_emails").insert({
        patient_id: id,
        law_firm_id: lawFirmId,
        recipient_email: firm.intake_email,
        email_type: "lop_letter_request",
        subject: `LOP Letter Request - ${patient.first_name} ${patient.last_name}`,
        sent_by: lopUser?.id,
        status: "sent",
      });

      await fetch("/api/lop/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: id, lawFirmId }),
      });

      await lopClient.from("lop_audit_log").insert({
        user_id: lopUser?.id,
        action: "reminder_sent",
        entity_type: "patient",
        entity_id: id,
        facility_id: form.facility_id as string,
        new_values: { law_firm: firm.name, email: firm.intake_email },
      });

      toast.success(`Reminder sent to ${firm.name}`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send reminder.");
    }
  };

  /* ---- Upload / add document record ---- */
  const handleDocUpload = async () => {
    setDocUploading(true);
    try {
      let filePath: string | null = null;
      let fileName: string | null = null;
      let fileUrl: string | null = null;

      if (docFile) {
        const ext = docFile.name.split(".").pop();
        const storagePath = `${id}/${Date.now()}-${docForm.document_type}.${ext}`;
        const { error: uploadErr } = await lopClient.storage
          .from("lop-documents")
          .upload(storagePath, docFile);
        if (uploadErr) throw uploadErr;

        filePath = storagePath;
        fileName = docFile.name;
        const { data: urlData } = lopClient.storage
          .from("lop-documents")
          .getPublicUrl(storagePath);
        fileUrl = urlData?.publicUrl ?? null;
      }

      const { error } = await lopClient.from("lop_patient_documents").insert({
        patient_id: id,
        document_type: docForm.document_type,
        status: docFile ? "received" : (docForm.status as LopDocumentStatus),
        notes: docForm.notes || null,
        file_name: fileName,
        file_url: fileUrl,
        storage_path: filePath,
        uploaded_by: lopUser?.id,
      });
      if (error) throw error;

      await lopClient.from("lop_audit_log").insert({
        user_id: lopUser?.id,
        action: "document_uploaded",
        entity_type: "document",
        entity_id: id,
        facility_id: form.facility_id as string,
        new_values: {
          document_type: docForm.document_type,
          file_name: fileName,
        },
      });

      toast.success("Document added.");
      setDocDialogOpen(false);
      setDocFile(null);
      setDocForm({ document_type: "lop_letter", notes: "", status: "requested" });
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload document.");
    } finally {
      setDocUploading(false);
    }
  };

  /* ---- Delete document ---- */
  const handleDeleteDoc = async (
    docId: string,
    storagePath: string | null
  ) => {
    if (!confirm("Delete this document?")) return;
    try {
      if (storagePath) {
        await lopClient.storage.from("lop-documents").remove([storagePath]);
      }
      await lopClient.from("lop_patient_documents").delete().eq("id", docId);
      toast.success("Document deleted.");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete document.");
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
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
        <Link
          href="/lop/patients"
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Back to patients
        </Link>
      </div>
    );
  }

  const canEdit = hasPermission(lopUser, "patient:update");
  const canEditBilling = hasPermission(lopUser, "billing:update");
  const canUploadDocs = hasPermission(lopUser, "documents:upload");
  const canSendEmail = hasPermission(lopUser, "email:send");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
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
              {patient.lop_facilities?.name ?? ""} &middot; Created{" "}
              {new Date(patient.created_at as string).toLocaleDateString()}
              {patient.updated_at && (
                <>
                  {" "}
                  &middot; Updated{" "}
                  {new Date(
                    patient.updated_at as string
                  ).toLocaleDateString()}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canSendEmail && (
            <Button
              variant="outline"
              onClick={handleSendReminder}
              className="gap-2"
            >
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

      {/* Status Badge Bar */}
      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            CASE_STATUS_COLORS[form.case_status as LopCaseStatus] ??
            "bg-gray-100 text-gray-600"
          }`}
        >
          {CASE_STATUS_LABELS[form.case_status as LopCaseStatus] ??
            form.case_status}
        </span>
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
          LOP:{" "}
          {DOC_STATUS_LABELS[form.lop_letter_status as LopDocumentStatus] ??
            "N/A"}
        </span>
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
          Med Records:{" "}
          {DOC_STATUS_LABELS[
            form.medical_records_status as LopDocumentStatus
          ] ?? "N/A"}
        </span>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing &amp; Status</TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="reminders">
            Reminders ({reminders.length})
          </TabsTrigger>
        </TabsList>

        {/* ==================== Overview Tab ==================== */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Patient Info */}
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
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={(form.date_of_birth as string) ?? ""}
                  onChange={(e) => updateForm("date_of_birth", e.target.value)}
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
              <div className="sm:col-span-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={(form.email as string) ?? ""}
                  onChange={(e) => updateForm("email", e.target.value)}
                  disabled={!canEdit}
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
                  value={(form.address_line1 as string) ?? ""}
                  onChange={(e) => updateForm("address_line1", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Address Line 2</Label>
                <Input
                  value={(form.address_line2 as string) ?? ""}
                  onChange={(e) => updateForm("address_line2", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={(form.city as string) ?? ""}
                  onChange={(e) => updateForm("city", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={(form.state as string) ?? ""}
                  onChange={(e) => updateForm("state", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label>ZIP Code</Label>
                <Input
                  value={(form.zip as string) ?? ""}
                  onChange={(e) => updateForm("zip", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
            </CardContent>
          </Card>

          {/* Case & Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Case &amp; Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Date of Accident</Label>
                <Input
                  type="date"
                  value={(form.date_of_accident as string) ?? ""}
                  onChange={(e) =>
                    updateForm("date_of_accident", e.target.value)
                  }
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
              <div>
                <Label>Expected Arrival</Label>
                <Input
                  type="datetime-local"
                  value={
                    (form.expected_arrival as string)?.slice(0, 16) ?? ""
                  }
                  onChange={(e) =>
                    updateForm("expected_arrival", e.target.value)
                  }
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label>Arrival Window</Label>
                <Select
                  value={String(form.arrival_window_min ?? 60)}
                  onValueChange={(v) =>
                    updateForm("arrival_window_min", parseInt(v))
                  }
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Intake Notes</Label>
                <Textarea
                  rows={3}
                  value={(form.intake_notes as string) ?? ""}
                  onChange={(e) => updateForm("intake_notes", e.target.value)}
                  disabled={!canEdit}
                  placeholder="Initial intake observations..."
                />
              </div>
              <div>
                <Label>Follow-up Notes</Label>
                <Textarea
                  rows={3}
                  value={(form.follow_up_note as string) ?? ""}
                  onChange={(e) => updateForm("follow_up_note", e.target.value)}
                  disabled={!canEdit}
                  placeholder="Communication and next steps..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== Billing & Status Tab ==================== */}
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
                  value={
                    (form.medical_records_status as string) ?? "not_requested"
                  }
                  onValueChange={(v) =>
                    updateForm("medical_records_status", v)
                  }
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
                  onChange={(e) =>
                    updateForm("amount_collected", e.target.value)
                  }
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block">Billing Tags</Label>
                <TagInput
                  tags={(form.billing_tags as string[]) ?? []}
                  onChange={(t) => updateForm("billing_tags", t)}
                  disabled={!canEditBilling}
                  placeholder="e.g. reviewed, pending-adjustment"
                />
              </div>
              <div>
                <Label className="mb-2 block">Medical Record Tags</Label>
                <TagInput
                  tags={(form.medical_record_tags as string[]) ?? []}
                  onChange={(t) => updateForm("medical_record_tags", t)}
                  disabled={!canEdit}
                  placeholder="e.g. x-ray, blood-work"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Follow-Up</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                value={(form.follow_up_note as string) ?? ""}
                onChange={(e) => updateForm("follow_up_note", e.target.value)}
                disabled={!canEdit}
                placeholder="Follow-up notes and communication log..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== Documents Tab ==================== */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Documents</CardTitle>
              {canUploadDocs && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setDocDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" /> Add Document
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
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">
                            {String(
                              DOCUMENT_TYPE_LABELS[
                                doc.document_type as LopDocumentType
                              ] ?? doc.document_type
                            )}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {doc.file_name ?? "No file attached"} &middot;{" "}
                            {new Date(
                              doc.created_at as string
                            ).toLocaleDateString()}
                          </p>
                          {doc.notes && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {doc.notes as string}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            doc.status === "received"
                              ? "bg-green-100 text-green-700"
                              : doc.status === "missing"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {DOC_STATUS_LABELS[
                            doc.status as LopDocumentStatus
                          ] ?? doc.status}
                        </span>
                        {doc.file_url && (
                          <a
                            href={doc.file_url as string}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        {canUploadDocs && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDeleteDoc(
                                doc.id as string,
                                (doc.storage_path as string) ?? null
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== Reminders Tab ==================== */}
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
                            To: {r.recipient_email as string} &middot;{" "}
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

      {/* ==================== Add Document Dialog ==================== */}
      <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Document Type *</Label>
              <Select
                value={docForm.document_type}
                onValueChange={(v) =>
                  setDocForm((f) => ({ ...f, document_type: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={docForm.status}
                onValueChange={(v) =>
                  setDocForm((f) => ({ ...f, status: v }))
                }
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
              <Label>File (PDF, JPG, PNG - max 10 MB)</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Notes / Missing Item Description</Label>
              <Textarea
                rows={3}
                value={docForm.notes}
                onChange={(e) =>
                  setDocForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="What is missing, or notes about this document..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDocDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleDocUpload} disabled={docUploading}>
                {docUploading && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                <Upload className="h-4 w-4 mr-2" />
                {docFile ? "Upload & Save" : "Save Record"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
