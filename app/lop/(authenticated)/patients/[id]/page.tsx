"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
// lopClient removed — file upload now uses /api/lop/upload
import { lopDb } from "@/lib/lop/db";
import { hasPermission } from "@/lib/lop/permissions";
import {
  CASE_STATUS_LABELS,
  CASE_STATUS_COLORS,
  DOC_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  ALL_DOCUMENT_TYPES,
  getMissingDocuments,
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
  CheckCircle2,
  AlertCircle,
  Circle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useAiChat } from "@/hooks/lop/useAiChat";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
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
  const [sendingReminder, setSendingReminder] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [patientRes, docsRes, remindersRes, firmsRes, auditRes] = await Promise.all([
        lopDb.select("lop_patients", {
          select: "*, lop_facilities(name), lop_law_firms(name)",
          filters: [{ column: "id", op: "eq", value: id }],
          single: true,
        }),
        lopDb.select("lop_patient_documents", {
          filters: [{ column: "patient_id", op: "eq", value: id }],
          order: { column: "created_at", ascending: false },
        }),
        lopDb.select("lop_reminder_emails", {
          filters: [{ column: "patient_id", op: "eq", value: id }],
          order: { column: "sent_at", ascending: false },
        }),
        lopDb.select("lop_law_firms", {
          select: "id, name",
          filters: [{ column: "is_active", op: "eq", value: true }],
          order: { column: "name" },
        }),
        lopDb.select("lop_audit_log", {
          select: "*, lop_users(full_name)",
          filters: [{ column: "entity_id", op: "eq", value: id }],
          order: { column: "created_at", ascending: false },
          limit: 50,
        }),
      ]);

      if (patientRes.data) {
        setPatient(patientRes.data);
        setForm({
          ...patientRes.data,
          billing_tags: patientRes.data.billing_tags ?? [],
          medical_record_tags: patientRes.data.medical_record_tags ?? [],
        });
      }
      setDocuments((docsRes.data as unknown[]) ?? []);
      setReminders((remindersRes.data as unknown[]) ?? []);
      setAuditLogs((auditRes.data as unknown[]) ?? []);
      setLawFirms((firmsRes.data as { id: string; name: string }[]) ?? []);
    } catch (err) {
      console.error("Failed to load patient data:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load patient data");
    } finally {
      setLoading(false);
    }
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
      const { error } = await lopDb.update(
        "lop_patients",
        {
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
          reduction_amount: form.reduction_amount || null,
          billing_date: form.billing_date || null,
          date_paid: form.date_paid || null,
          billing_tags: form.billing_tags ?? [],
          medical_record_tags: form.medical_record_tags ?? [],
          follow_up_note: form.follow_up_note || null,
          intake_notes: form.intake_notes || null,
          law_firm_id: form.law_firm_id || null,
          updated_by: lopUser?.id,
        },
        { id },
      );

      if (error) throw error;

      // Build change map for audit
      const changes: Record<string, unknown> = {};
      if (oldStatus !== form.case_status)
        changes.case_status = { from: oldStatus, to: form.case_status };
      if (patient.bill_charges !== form.bill_charges)
        changes.bill_charges = form.bill_charges;
      if (patient.amount_collected !== form.amount_collected)
        changes.amount_collected = form.amount_collected;
      if (patient.reduction_amount !== form.reduction_amount)
        changes.reduction_amount = form.reduction_amount;
      if (patient.billing_date !== form.billing_date)
        changes.billing_date = form.billing_date;

      await lopDb.insert("lop_audit_log", {
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
      console.error("Save error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save changes.");
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
    setSendingReminder(true);
    try {
      const { data: firm } = await lopDb.select("lop_law_firms", {
        select: "intake_email, name",
        filters: [{ column: "id", op: "eq", value: lawFirmId }],
        single: true,
      });

      if (!firm?.intake_email) {
        toast.error("Law firm has no intake email configured.");
        return;
      }

      await lopDb.insert("lop_reminder_emails", {
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

      await lopDb.insert("lop_audit_log", {
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
    } finally {
      setSendingReminder(false);
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
        const uploadForm = new FormData();
        uploadForm.append("file", docFile);
        uploadForm.append("path", storagePath);
        const uploadRes = await fetch("/api/lop/upload", {
          method: "POST",
          credentials: "same-origin",
          body: uploadForm,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error ?? "Upload failed");
        }
        const uploadData = await uploadRes.json();
        filePath = uploadData.storage_path;
        fileName = docFile.name;
        fileUrl = uploadData.url;
      }

      const { error } = await lopDb.insert("lop_patient_documents", {
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

      await lopDb.insert("lop_audit_log", {
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
    setDeletingDocId(docId);
    try {
      if (storagePath) {
        await fetch("/api/lop/upload", {
          method: "DELETE",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storage_path: storagePath }),
        }).catch(console.warn); // non-fatal if file already gone
      }
      await lopDb.remove("lop_patient_documents", { id: docId });
      toast.success("Document deleted.");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete document.");
    } finally {
      setDeletingDocId(null);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0B3B91] mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading patient record…</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-3">Patient not found.</p>
        <Link
          href="/lop/patients"
          className="text-[#0B3B91] font-semibold hover:underline"
        >
          ← Back to patients
        </Link>
      </div>
    );
  }

  const canEdit = hasPermission(lopUser, "patient:update");
  const canEditBilling = hasPermission(lopUser, "billing:update");
  const canViewFinancial = hasPermission(lopUser, "financial:view");
  const canUploadDocs = hasPermission(lopUser, "documents:upload");
  const canSendEmail = hasPermission(lopUser, "email:send");
  const canUseAi = hasPermission(lopUser, "ai:use");

  return (
    <div className="pb-8 lg:pb-12">
      {/* ── Sticky Glassmorphism Header ── */}
      <header className="mb-6 rounded-[30px] border border-white/70 bg-white/70 px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:sticky lg:top-0 lg:z-20 lg:mb-8 lg:px-8 lg:py-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <Link href="/lop/patients">
              <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-slate-100 mt-0.5">
                <ArrowLeft className="h-5 w-5 text-slate-500" />
              </Button>
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                    CASE_STATUS_COLORS[form.case_status as LopCaseStatus] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {CASE_STATUS_LABELS[form.case_status as LopCaseStatus] ?? form.case_status}
                </span>
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  LOP: {DOC_STATUS_LABELS[form.lop_letter_status as LopDocumentStatus] ?? "N/A"}
                </span>
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  Records: {DOC_STATUS_LABELS[form.medical_records_status as LopDocumentStatus] ?? "N/A"}
                </span>
                {(() => {
                  const missingCount = getMissingDocuments(
                    documents.map((d) => ({
                      document_type: d.document_type as string,
                      status: d.status as string,
                    }))
                  ).filter((c) => c.required && c.status !== "received").length;
                  return missingCount > 0 ? (
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      {missingCount} Doc{missingCount > 1 ? "s" : ""} Missing
                    </span>
                  ) : (
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      Docs Complete
                    </span>
                  );
                })()}
              </div>
              <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#0B3B91]">
                {form.first_name as string} {form.last_name as string}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {patient.lop_facilities?.name ?? ""} &middot; Created{" "}
                {new Date(patient.created_at as string).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {canSendEmail && (
              <Button
                variant="outline"
                onClick={handleSendReminder}
                disabled={sendingReminder}
                className="h-10 rounded-2xl border-slate-200 gap-2 font-semibold"
              >
                {sendingReminder ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {sendingReminder ? "Sending…" : "Send Reminder"}
              </Button>
            )}
            {canEdit && (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-10 rounded-2xl bg-gradient-to-r from-[#D72638] to-[#ff4d5e] px-5 text-white shadow-[0_16px_35px_rgba(215,38,56,0.2)] transition-transform hover:scale-[1.01] hover:from-[#c91f31] hover:to-[#ff4355] gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        {/* ── Pill Tab List ── */}
        <div className="mb-6 rounded-[28px] border border-white/70 bg-white/85 p-2 shadow-[0_20px_45px_rgba(15,23,42,0.05)]">
          <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#0B3B91] data-[state=active]:shadow-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#0B3B91] data-[state=active]:shadow-sm"
            >
              Billing &amp; Status
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#0B3B91] data-[state=active]:shadow-sm"
            >
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger
              value="reminders"
              className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#0B3B91] data-[state=active]:shadow-sm"
            >
              Reminders ({reminders.length})
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#0B3B91] data-[state=active]:shadow-sm"
            >
              Activity ({auditLogs.length})
            </TabsTrigger>
            {canUseAi && (
              <TabsTrigger
                value="ai-summary"
                className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#0B3B91] data-[state=active]:shadow-sm gap-1"
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI Summary
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* ==================== Overview Tab ==================== */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Patient Info */}
          <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] lg:p-8">
            <h3 className="mb-5 text-sm font-bold text-[#0B3B91]">Patient Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
          </section>

          {/* Address */}
          <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] lg:p-8">
            <h3 className="mb-5 text-sm font-bold text-[#0B3B91]">Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
          </section>

          {/* Case & Scheduling */}
          <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] lg:p-8">
            <h3 className="mb-5 text-sm font-bold text-[#0B3B91]">Case &amp; Scheduling</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
          </section>

          {/* Notes */}
          <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] lg:p-8">
            <h3 className="mb-5 text-sm font-bold text-[#0B3B91]">Notes</h3>
            <div className="space-y-4">
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
            </div>
          </section>
        </TabsContent>

        {/* ==================== Billing & Status Tab ==================== */}
        <TabsContent value="billing" className="space-y-4 mt-4">
          <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] lg:p-8">
            <h3 className="mb-5 text-sm font-bold text-[#0B3B91]">Case Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            </div>
          </section>

          <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] lg:p-8">
            <h3 className="mb-5 text-sm font-bold text-[#0B3B91]">Billing</h3>
            {canViewFinancial ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <Label>Reduction Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Must match reduction letter"
                      value={(form.reduction_amount as string) ?? ""}
                      onChange={(e) => updateForm("reduction_amount", e.target.value)}
                      disabled={!canEditBilling}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Billing Date</Label>
                    <Input
                      type="date"
                      value={(form.billing_date as string) ?? ""}
                      onChange={(e) => updateForm("billing_date", e.target.value)}
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
                  <div>
                    <Label>Outstanding Days</Label>
                    <div className="mt-1">
                      {(() => {
                        if (form.date_paid) return <span className="text-sm text-green-700 font-medium bg-green-50 px-2.5 py-1.5 rounded-md inline-block">Paid</span>;
                        if (!form.billing_date) return <span className="text-sm text-slate-400 italic">Set billing date to calculate</span>;
                        const days = Math.floor((Date.now() - new Date(form.billing_date as string).getTime()) / (1000 * 60 * 60 * 24));
                        const category = days <= 30 ? '0–30' : days <= 60 ? '31–60' : days <= 90 ? '61–90' : days <= 180 ? '91–180' : '180+';
                        const color = days <= 30 ? 'text-green-700 bg-green-50' : days <= 60 ? 'text-blue-700 bg-blue-50' : days <= 90 ? 'text-yellow-700 bg-yellow-50' : days <= 180 ? 'text-orange-700 bg-orange-50' : 'text-red-700 bg-red-50';
                        return (
                          <span className={`text-sm font-medium px-2.5 py-1.5 rounded-md inline-flex items-center gap-1.5 ${color}`}>
                            {days} days <span className="text-xs opacity-75">({category})</span>
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">
                Financial details are restricted to Medical Records, Accounting, and Admin roles.
              </p>
            )}
          </section>

          <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] lg:p-8">
            <h3 className="mb-5 text-sm font-bold text-[#0B3B91]">Tags</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            </div>
          </section>

          <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] lg:p-8">
            <h3 className="mb-5 text-sm font-bold text-[#0B3B91]">Follow-Up</h3>
            <Textarea
              rows={4}
              value={(form.follow_up_note as string) ?? ""}
              onChange={(e) => updateForm("follow_up_note", e.target.value)}
              disabled={!canEdit}
              placeholder="Follow-up notes and communication log..."
            />
          </section>
        </TabsContent>

        {/* ==================== Documents Tab ==================== */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          {/* ---- Document Checklist ---- */}
          <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] lg:p-8">
            <h3 className="mb-5 text-sm font-bold text-[#0B3B91]">Document Checklist</h3>
              {(() => {
                const checklist = getMissingDocuments(
                  documents.map((d) => ({
                    document_type: d.document_type as string,
                    status: d.status as string,
                  }))
                );
                const missingRequired = checklist.filter(
                  (c) => c.required && c.status !== "received"
                );
                return (
                  <div className="space-y-3">
                    {missingRequired.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-red-700">
                          <AlertCircle className="h-4 w-4 inline mr-1 -mt-0.5" />
                          {missingRequired.length} required document
                          {missingRequired.length > 1 ? "s" : ""} not yet
                          received
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {checklist.map((item) => (
                        <div
                          key={item.type}
                          className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                            item.status === "received"
                              ? "bg-green-50 text-green-700"
                              : item.status === "missing"
                              ? "bg-red-50 text-red-700"
                              : item.required
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-50 text-slate-500"
                          }`}
                        >
                          {item.status === "received" ? (
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                          ) : item.status === "missing" ? (
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span className="flex-1">{item.label}</span>
                          {item.required && (
                            <span className="text-[10px] uppercase tracking-wide font-semibold opacity-70">
                              Required
                            </span>
                          )}
                          <span className="text-xs font-medium">
                            {item.status === "received"
                              ? "Received"
                              : item.status === "missing"
                              ? "Missing"
                              : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
          </section>

          {/* ---- Uploaded Documents ---- */}
          <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] lg:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0B3B91]">Documents</h3>
              {canUploadDocs && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-2xl gap-2 border-slate-200 font-semibold"
                  onClick={() => setDocDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" /> Add Document
                </Button>
              )}
            </div>
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
                            disabled={deletingDocId === (doc.id as string)}
                            onClick={() =>
                              handleDeleteDoc(
                                doc.id as string,
                                (doc.storage_path as string) ?? null
                              )
                            }
                          >
                            {deletingDocId === (doc.id as string) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </section>
        </TabsContent>

        {/* ==================== Reminders Tab ==================== */}
        <TabsContent value="reminders" className="space-y-4 mt-4">
          <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] lg:p-8">
            <h3 className="mb-5 text-sm font-bold text-[#0B3B91]">Email Reminders</h3>
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
          </section>
        </TabsContent>

        {/* ==================== Activity Tab ==================== */}
        <TabsContent value="activity" className="space-y-4 mt-4">
          <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] lg:p-8">
            <h3 className="mb-5 text-sm font-bold text-[#0B3B91]">Activity History</h3>
              {auditLogs.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">
                  No activity recorded yet.
                </p>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200" />
                  <div className="space-y-4">
                    {auditLogs.map((log) => {
                      const action = log.action as string;
                      const isStatus = action === "status_changed";
                      const isCreate = action === "patient_created";
                      const isDoc = action === "document_uploaded";
                      const isReminder = action === "reminder_sent";
                      return (
                        <div
                          key={log.id as string}
                          className="flex gap-3 pl-1 relative"
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 z-10 ${
                              isStatus
                                ? "bg-blue-100 text-blue-600"
                                : isCreate
                                ? "bg-green-100 text-green-600"
                                : isDoc
                                ? "bg-purple-100 text-purple-600"
                                : isReminder
                                ? "bg-orange-100 text-orange-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <Circle className="h-2.5 w-2.5 fill-current" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-slate-800">
                                {action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(log.created_at as string).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              by {(log.lop_users as Record<string, unknown>)?.full_name as string ?? "System"}
                            </p>
                            {isStatus && log.old_values && log.new_values && (
                              <div className="mt-1 text-xs">
                                <span className="text-red-500">
                                  {CASE_STATUS_LABELS[(log.old_values as Record<string, string>)?.case_status as LopCaseStatus] ??
                                    (log.old_values as Record<string, string>)?.case_status}
                                </span>
                                {" → "}
                                <span className="text-green-600">
                                  {CASE_STATUS_LABELS[(log.new_values as Record<string, string>)?.case_status as LopCaseStatus] ??
                                    (log.new_values as Record<string, string>)?.case_status}
                                </span>
                              </div>
                            )}
                            {!isStatus && log.new_values && (
                              <div className="mt-1 text-xs text-slate-400 max-w-md truncate">
                                {JSON.stringify(log.new_values)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </section>
        </TabsContent>

        {/* ==================== AI Summary Tab ==================== */}
        {canUseAi && (
          <TabsContent value="ai-summary" className="mt-4">
            <PatientAiSummary patientId={id} />
          </TabsContent>
        )}
      </Tabs>

      {/* ==================== Add Document Dialog ==================== */}
      <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2 px-1">
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
                <span>Cancel</span>
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

/* ------------------------------------------------------------------ */
/*  Patient AI Summary Sub-component                                   */
/* ------------------------------------------------------------------ */
function PatientAiSummary({ patientId }: { patientId: string }) {
  const [triggered, setTriggered] = useState(false);
  const { messages, isLoading, append, setMessages } = useAiChat({
    contextType: "patient_summary",
    contextId: patientId,
  });

  useEffect(() => {
    if (!triggered && messages.length === 0) {
      setTriggered(true);
      append({
        role: "user",
        content: "Generate a comprehensive case summary for this patient.",
      });
    }
  }, [triggered, messages.length, append]);

  const handleRegenerate = () => {
    setMessages([]);
    setTriggered(false);
    setTimeout(() => {
      setTriggered(true);
      append({
        role: "user",
        content: "Generate a comprehensive case summary for this patient.",
      });
    }, 100);
  };

  const aiResponse = messages.find((m) => m.role === "assistant")?.content;

  return (
    <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50/50 to-blue-50/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-indigo-900">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            AI Case Summary
            <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-normal">
              GPT-4o
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 gap-1"
            onClick={handleRegenerate}
            disabled={isLoading}
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && !aiResponse ? (
          <div className="flex items-center gap-2 py-4 text-indigo-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Analyzing patient case data…</span>
          </div>
        ) : aiResponse ? (
          <div className="prose prose-sm prose-slate max-w-none text-sm [&>*:first-child]:mt-0">
            <PatientAiMarkdown content={aiResponse} />
          </div>
        ) : (
          <p className="text-sm text-indigo-500 py-2">Failed to load. Click Regenerate.</p>
        )}
      </CardContent>
    </Card>
  );
}

function PatientAiMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      elements.push(<h4 key={i} className="font-semibold text-sm mt-3 mb-1 text-indigo-900">{inlineBold(line.slice(4))}</h4>);
    } else if (line.startsWith("## ")) {
      elements.push(<h3 key={i} className="font-bold text-sm mt-3 mb-1 text-indigo-900">{inlineBold(line.slice(3))}</h3>);
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <div key={i} className="flex gap-2 ml-1 my-0.5 text-slate-700">
          <span className="text-indigo-400 flex-shrink-0">{line.match(/^\d+/)?.[0]}.</span>
          <span>{inlineBold(line.replace(/^\d+\.\s/, ""))}</span>
        </div>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={i} className="flex gap-2 ml-1 my-0.5 text-slate-700">
          <span className="text-indigo-400 flex-shrink-0">•</span>
          <span>{inlineBold(line.slice(2))}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(<p key={i} className="my-0.5 text-slate-700">{inlineBold(line)}</p>);
    }
  }
  return <>{elements}</>;
}

function inlineBold(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(<strong key={match.index}>{match[0].slice(2, -2)}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : text;
}
