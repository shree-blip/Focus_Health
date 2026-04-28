// ============================================================
// LOP Dashboard TypeScript Domain Types
// ============================================================

// ————— Enums —————
export type LopUserRole = 'front_desk' | 'scheduler' | 'medical_records' | 'accounting' | 'admin';

export type LopCaseStatus =
  | 'scheduled'
  | 'no_show'
  | 'arrived'
  | 'intake_complete'
  | 'in_progress'
  | 'follow_up_needed'
  | 'paid'
  | 'partial_paid'
  | 'case_dropped'
  | 'closed_no_recovery';

export type LopDocumentStatus = 'not_requested' | 'requested' | 'received' | 'missing';

export type LopDocumentType =
  | 'lop_letter'
  | 'medical_record'
  | 'affidavit'
  | 'bill_llc'
  | 'bill_pllc'
  | 'drop_letter'
  | 'reduction_letter_unsigned'
  | 'reduction_letter_signed'
  | 'check_image';

// ————— Facility —————
export interface LopFacility {
  id: string;
  name: string;
  slug: string;
  type: string;
  address: string | null;
  phone: string | null;
  director_email: string | null;
  front_desk_email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ————— User —————
export interface LopUser {
  id: string;
  auth_user_id: string | null;
  email: string;
  full_name: string;
  role: LopUserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  facilities?: LopFacility[];
}

export interface LopUserFacility {
  id: string;
  user_id: string;
  facility_id: string;
  created_at: string;
}

// ————— Law Firm —————
export interface LopLawFirm {
  id: string;
  name: string;
  intake_email: string | null;
  escalation_email: string | null;
  primary_contact: string | null;
  primary_phone: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ————— Patient (LOP Case) —————
export interface LopPatient {
  id: string;
  facility_id: string;
  law_firm_id: string | null;

  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  date_of_accident: string | null;

  expected_arrival: string | null;
  arrival_window_min: number;

  case_status: LopCaseStatus;
  lop_letter_status: LopDocumentStatus;
  medical_records_status: LopDocumentStatus;

  bill_charges: number | null;
  amount_collected: number | null;
  reduction_amount: number | null;
  billing_date: string | null;
  date_paid: string | null;
  billing_tags: string[];
  medical_record_tags: string[];

  // White Rock CSV import fields
  mrn: string | null;
  date_of_service: string | null;
  disposition_status: string | null;
  chief_complaint: string | null;
  primary_insurance: string | null;
  is_lop_case: boolean | null;
  referral_source: string | null;
  llc_billed_charges: number | null;
  pllc_billed_charges: number | null;
  total_received_llc: number | null;
  total_received_pllc: number | null;

  follow_up_note: string | null;
  intake_notes: string | null;

  // White Rock LOP tracker fields
  last_date_of_contact: string | null;
  point_of_contact: string | null;
  mr_dept_notes: string | null;

  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations (optional)
  facility?: LopFacility;
  law_firm?: LopLawFirm;
}

export type LopPatientInsert = Omit<LopPatient, 'id' | 'created_at' | 'updated_at' | 'facility' | 'law_firm'>;
export type LopPatientUpdate = Partial<LopPatientInsert>;

// ————— Patient Document —————
export interface LopPatientDocument {
  id: string;
  patient_id: string;
  document_type: LopDocumentType;
  file_name: string | null;
  file_url: string | null;
  storage_path: string | null;
  status: LopDocumentStatus;
  notes: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

// ————— Reminder Email —————
export interface LopReminderEmail {
  id: string;
  patient_id: string;
  law_firm_id: string | null;
  recipient_email: string;
  email_type: string;
  subject: string | null;
  sent_at: string;
  sent_by: string | null;
  status: string;
  error_message: string | null;
}

// ————— Audit Log —————
export interface LopAuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  facility_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// ————— Config —————
export interface LopConfig {
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

// ————— Display helpers —————
export const CASE_STATUS_LABELS: Record<LopCaseStatus, string> = {
  scheduled: 'Scheduled',
  no_show: 'No-Show',
  arrived: 'Arrived',
  intake_complete: 'Intake Complete',
  in_progress: 'In Progress',
  follow_up_needed: 'Follow Up Needed',
  paid: 'Paid',
  partial_paid: 'Partial Paid',
  case_dropped: 'Case Dropped',
  closed_no_recovery: 'Closed – No Recovery',
};

export const CASE_STATUS_COLORS: Record<LopCaseStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  no_show: 'bg-rose-100 text-rose-800',
  arrived: 'bg-cyan-100 text-cyan-800',
  intake_complete: 'bg-indigo-100 text-indigo-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  follow_up_needed: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
  partial_paid: 'bg-lime-100 text-lime-800',
  case_dropped: 'bg-red-100 text-red-800',
  closed_no_recovery: 'bg-gray-100 text-gray-800',
};

export const DOC_STATUS_LABELS: Record<LopDocumentStatus, string> = {
  not_requested: 'Not Requested',
  requested: 'Requested',
  received: 'Received',
  missing: 'Missing',
};

export const ROLE_LABELS: Record<LopUserRole, string> = {
  front_desk: 'Front Desk',
  scheduler: 'Scheduler',
  medical_records: 'Medical Records',
  accounting: 'Accounting',
  admin: 'Admin',
};

export const DOCUMENT_TYPE_LABELS: Record<LopDocumentType, string> = {
  lop_letter: 'LOP Letter from Law Firm',
  medical_record: 'Medical Record (Chart)',
  affidavit: 'Affidavit (Notarized Form)',
  bill_llc: 'Medical Bill – LLC',
  bill_pllc: 'Medical Bill – PLLC',
  drop_letter: 'Drop Letter (Case Closed No Pay)',
  reduction_letter_unsigned: 'Reduction Letter (Unsigned)',
  reduction_letter_signed: 'Reduction Letter (Signed)',
  check_image: 'Check Image for Payment',
};

/**
 * Documents required for every patient case.
 * Used to compute the "missing documents" checklist.
 * Affidavit is optional so excluded from required list.
 */
export const REQUIRED_DOCUMENTS: LopDocumentType[] = [
  'lop_letter',
  'medical_record',
  'bill_llc',
];

/**
 * All possible documents (for the full checklist view)
 */
export const ALL_DOCUMENT_TYPES: { type: LopDocumentType; required: boolean }[] = [
  { type: 'lop_letter', required: true },
  { type: 'medical_record', required: true },
  { type: 'affidavit', required: false },
  { type: 'bill_llc', required: true },
  { type: 'bill_pllc', required: false },
  { type: 'drop_letter', required: false },
  { type: 'reduction_letter_unsigned', required: false },
  { type: 'reduction_letter_signed', required: false },
  { type: 'check_image', required: false },
];

/** Count missing required documents for a patient given their document records */
export function getMissingDocuments(
  documents: { document_type: string; status: string }[],
  allTypes = ALL_DOCUMENT_TYPES,
) {
  const received = new Set(
    documents
      .filter((d) => d.status === 'received')
      .map((d) => d.document_type),
  );
  return allTypes.map((dt) => ({
    ...dt,
    label: DOCUMENT_TYPE_LABELS[dt.type],
    status: received.has(dt.type)
      ? ('received' as const)
      : documents.some((d) => d.document_type === dt.type && d.status === 'missing')
        ? ('missing' as const)
        : ('not_received' as const),
  }));
}
