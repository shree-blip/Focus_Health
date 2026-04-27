import pool from "@/lib/db";
import {
  analyzePatientCompleteness,
  formatMissingFields,
  TRACKABLE_FIELDS,
} from "./ai-utils";

/**
 * Server-side AI context builders.
 * Fetch data from Cloud SQL (pg) and format for the LLM system prompt.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rec = Record<string, any>;

export async function buildDashboardContext(facilityId?: string | null): Promise<string> {
  const patientSql = facilityId
    ? `SELECT p.*, f.name AS facility_name, lf.name AS law_firm_name,
              json_agg(DISTINCT jsonb_build_object('document_type', pd.document_type, 'status', pd.status)) FILTER (WHERE pd.id IS NOT NULL) AS lop_patient_documents
       FROM lop_patients p
       LEFT JOIN lop_facilities f ON f.id = p.facility_id
       LEFT JOIN lop_law_firms lf ON lf.id = p.law_firm_id
       LEFT JOIN lop_patient_documents pd ON pd.patient_id = p.id
       WHERE p.facility_id = $1 GROUP BY p.id, f.name, lf.name`
    : `SELECT p.*, f.name AS facility_name, lf.name AS law_firm_name,
              json_agg(DISTINCT jsonb_build_object('document_type', pd.document_type, 'status', pd.status)) FILTER (WHERE pd.id IS NOT NULL) AS lop_patient_documents
       FROM lop_patients p
       LEFT JOIN lop_facilities f ON f.id = p.facility_id
       LEFT JOIN lop_law_firms lf ON lf.id = p.law_firm_id
       LEFT JOIN lop_patient_documents pd ON pd.patient_id = p.id
       GROUP BY p.id, f.name, lf.name`;
  const [patientRes, facilityRes, firmRes] = await Promise.all([
    pool.query(patientSql, facilityId ? [facilityId] : []),
    pool.query(`SELECT id, name, is_active FROM lop_facilities`),
    pool.query(`SELECT id, name, is_active FROM lop_law_firms`),
  ]);
  const all: Rec[] = patientRes.rows.map((p) => ({
    ...p,
    lop_facilities: { name: p.facility_name },
    lop_law_firms: { name: p.law_firm_name },
  }));
  const facilities = facilityRes.rows;
  const lawFirms = firmRes.rows;

  // Today's date
  const today = new Date().toISOString().split("T")[0];

  // Compute stats
  const totalBilled = all.reduce((s, p) => s + (Number(p.bill_charges) || 0), 0);
  const totalCollected = all.reduce((s, p) => s + (Number(p.amount_collected) || 0), 0);
  const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : "N/A";

  // Status distribution
  const statusCounts: Record<string, number> = {};
  for (const p of all) {
    const s = p.case_status ?? "unknown";
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  }

  // Today's arrivals
  const todayArrivals = all.filter((p) => {
    if (!p.expected_arrival) return false;
    return (p.expected_arrival as string).startsWith(today);
  });

  // Missing docs analysis
  const requiredTypes = ["lop_letter", "medical_record", "bill_llc"];
  const patientsWithMissingDocs = all.filter((p) => {
    const docs: Rec[] = Array.isArray(p.lop_patient_documents) ? p.lop_patient_documents : [];
    const receivedTypes = new Set(docs.filter((d) => d.status === "received").map((d) => d.document_type));
    return requiredTypes.some((t) => !receivedTypes.has(t));
  });

  // Missing LOP letters specifically
  const missingLop = all.filter(
    (p) => p.lop_letter_status === "requested" || p.lop_letter_status === "missing"
  );

  // Follow-ups
  const openFollowUps = all.filter((p) => p.case_status === "follow_up_needed");

  // Law firm performance
  const firmStats: Record<string, { name: string; patients: number; billed: number; collected: number }> = {};
  for (const p of all) {
    const firmName = (p.lop_law_firms as Rec)?.name ?? "No Firm";
    const firmId = p.law_firm_id ?? "none";
    if (!firmStats[firmId])
      firmStats[firmId] = { name: firmName, patients: 0, billed: 0, collected: 0 };
    firmStats[firmId].patients++;
    firmStats[firmId].billed += Number(p.bill_charges) || 0;
    firmStats[firmId].collected += Number(p.amount_collected) || 0;
  }

  // Data completeness analysis
  const completenessScores = all.map((p) => ({
    name: `${p.first_name} ${p.last_name}`,
    ...analyzePatientCompleteness(p),
  }));
  const avgScore =
    completenessScores.length > 0
      ? Math.round(
          completenessScores.reduce((s, c) => s + c.score, 0) /
            completenessScores.length
        )
      : 100;

  // Most commonly missing fields
  const fieldMissingCount: Record<string, number> = {};
  for (const p of all) {
    for (const f of TRACKABLE_FIELDS) {
      const val = p[f.field];
      const isEmpty = val === null || val === undefined || val === "" || (Array.isArray(val) && val.length === 0);
      if (isEmpty) fieldMissingCount[f.label] = (fieldMissingCount[f.label] || 0) + 1;
    }
  }
  const commonlyMissing = Object.entries(fieldMissingCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  // Patients with lowest completeness
  const worstCompleteness = completenessScores
    .sort((a, b) => a.score - b.score)
    .slice(0, 10);

  const nowISO = new Date().toISOString();

  return `=== DASHBOARD CONTEXT ===
CURRENT DATE/TIME: ${nowISO}
DATE (today): ${today}
FACILITY SCOPE: ${facilityId ? "Single Facility" : "All Facilities"}
ACTIVE FACILITIES: ${(facilities ?? []).filter((f: Rec) => f.is_active).map((f: Rec) => f.name).join(", ")}
ACTIVE LAW FIRMS: ${(lawFirms ?? []).filter((f: Rec) => f.is_active).map((f: Rec) => f.name).join(", ")}

HEADLINE METRICS:
- Total Patients: ${all.length}
- Total Billed: $${totalBilled.toLocaleString()}
- Total Collected: $${totalCollected.toLocaleString()}
- Collection Rate: ${collectionRate}%
- Today's Scheduled Arrivals: ${todayArrivals.length}

STATUS DISTRIBUTION:
${Object.entries(statusCounts).sort(([, a], [, b]) => b - a).map(([s, c]) => `- ${s}: ${c}`).join("\n")}

ALERTS:
- Open Follow-Ups: ${openFollowUps.length}
- Missing LOP Letters: ${missingLop.length}
- Patients with Missing Required Docs: ${patientsWithMissingDocs.length}

LAW FIRM PERFORMANCE:
${Object.values(firmStats).sort((a, b) => b.patients - a.patients).map((f) =>
    `- ${f.name}: ${f.patients} patients, $${f.billed.toLocaleString()} billed, $${f.collected.toLocaleString()} collected (${f.billed > 0 ? ((f.collected / f.billed) * 100).toFixed(1) : "0"}%)`
  ).join("\n")}

PATIENTS NEEDING FOLLOW-UP:
${openFollowUps.slice(0, 10).map((p) =>
    `- ${p.first_name} ${p.last_name} (status: ${p.case_status}, note: ${p.follow_up_note ?? "none"})`
  ).join("\n") || "None"}

MISSING LOP LETTERS (first 10):
${missingLop.slice(0, 10).map((p) =>
    `- ${p.first_name} ${p.last_name} (lop_letter_status: ${p.lop_letter_status}, firm: ${(p.lop_law_firms as Rec)?.name ?? "N/A"})`
  ).join("\n") || "None"}

DATA COMPLETENESS:
- Average Completeness Score: ${avgScore}%
- Tracked Fields per Patient: ${TRACKABLE_FIELDS.length}
- Most Commonly Missing Fields:
${commonlyMissing.map(([label, count]) => `  - ${label}: missing in ${count} of ${all.length} patients (${Math.round((count / Math.max(all.length, 1)) * 100)}%)`).join("\n") || "  None"}

PATIENTS WITH LOWEST COMPLETENESS (up to 10):
${worstCompleteness.map((c) => `- ${c.name}: ${c.score}% complete (${c.missing} fields missing${c.criticalMissing.length > 0 ? `, critical: ${c.criticalMissing.join(", ")}` : ""})`).join("\n") || "All patients fully complete"}

ALL PATIENTS SUMMARY (${all.length} total):
${all.map((p) => {
    const comp = analyzePatientCompleteness(p);
    return `- ${p.first_name} ${p.last_name} | status: ${p.case_status} | facility: ${(p.lop_facilities as Rec)?.name ?? "N/A"} | firm: ${(p.lop_law_firms as Rec)?.name ?? "N/A"} | billed: $${(Number(p.bill_charges) || 0).toLocaleString()} | collected: $${(Number(p.amount_collected) || 0).toLocaleString()} | completeness: ${comp.score}% | created: ${p.created_at?.split("T")[0] ?? "N/A"} | arrival: ${p.expected_arrival?.split("T")[0] ?? "N/A"}`;
  }).join("\n") || "No patients"}`;
}

export async function buildPatientContext(patientId: string): Promise<string> {
  const [patientRes, reminderRes, auditRes] = await Promise.all([
    pool.query(
      `SELECT p.*, f.name AS facility_name, lf.name AS law_firm_name, lf.primary_contact AS law_firm_contact, lf.intake_email AS law_firm_email,
              json_agg(DISTINCT jsonb_build_object('id', pd.id, 'document_type', pd.document_type, 'status', pd.status, 'file_name', pd.file_name)) FILTER (WHERE pd.id IS NOT NULL) AS lop_patient_documents
       FROM lop_patients p
       LEFT JOIN lop_facilities f ON f.id = p.facility_id
       LEFT JOIN lop_law_firms lf ON lf.id = p.law_firm_id
       LEFT JOIN lop_patient_documents pd ON pd.patient_id = p.id
       WHERE p.id = $1 GROUP BY p.id, f.name, lf.name, lf.primary_contact, lf.intake_email`,
      [patientId]
    ),
    pool.query(`SELECT * FROM lop_reminder_emails WHERE patient_id = $1 ORDER BY sent_at DESC LIMIT 20`, [patientId]),
    pool.query(`SELECT * FROM lop_audit_log WHERE entity_id = $1 AND entity_type = 'patient' ORDER BY created_at DESC LIMIT 30`, [patientId]),
  ]);

  if (!patientRes.rows[0]) return "Patient not found.";
  const raw = patientRes.rows[0];
  const patient: Rec = {
    ...raw,
    lop_facilities: { name: raw.facility_name },
    lop_law_firms: { name: raw.law_firm_name, primary_contact: raw.law_firm_contact, intake_email: raw.law_firm_email },
  };
  const reminders = reminderRes.rows;
  const auditLogs = auditRes.rows;

  const docs: Rec[] = Array.isArray(patient.lop_patient_documents) ? patient.lop_patient_documents : [];
  const requiredTypes = ["lop_letter", "medical_record", "bill_llc"];
  const receivedDocs = new Set(docs.filter((d) => d.status === "received").map((d) => d.document_type));
  const missingRequired = requiredTypes.filter((t) => !receivedDocs.has(t));

  const balance = (Number(patient.bill_charges) || 0) - (Number(patient.amount_collected) || 0);

  // Data completeness analysis
  const missingFieldsBlock = formatMissingFields(patient);

  const nowISO = new Date().toISOString();

  return `=== PATIENT CASE CONTEXT ===
CURRENT DATE/TIME: ${nowISO}
NAME: ${patient.first_name} ${patient.last_name}
DOB: ${patient.date_of_birth ?? "N/A"}
PHONE: ${patient.phone ?? "N/A"} | EMAIL: ${patient.email ?? "N/A"}
ADDRESS: ${[patient.address_line1, patient.city, patient.state, patient.zip].filter(Boolean).join(", ") || "N/A"}
ACCIDENT DATE: ${patient.date_of_accident ?? "N/A"}

FACILITY: ${(patient.lop_facilities as Rec)?.name ?? "N/A"}
LAW FIRM: ${(patient.lop_law_firms as Rec)?.name ?? "N/A"}
ATTORNEY CONTACT: ${(patient.lop_law_firms as Rec)?.primary_contact ?? "N/A"}
ATTORNEY EMAIL: ${(patient.lop_law_firms as Rec)?.intake_email ?? "N/A"}

CASE STATUS: ${patient.case_status}
LOP Letter Status: ${patient.lop_letter_status}
Medical Records Status: ${patient.medical_records_status}
Follow-Up Note: ${patient.follow_up_note ?? "None"}
Intake Notes: ${patient.intake_notes ?? "None"}

FINANCIAL:
- Bill Charges: $${(Number(patient.bill_charges) || 0).toLocaleString()}
- Amount Collected: $${(Number(patient.amount_collected) || 0).toLocaleString()}
- Outstanding Balance: $${balance.toLocaleString()}
- Date Paid: ${patient.date_paid ?? "Not paid"}
- Billing Tags: ${(patient.billing_tags ?? []).join(", ") || "None"}

DOCUMENTS (${docs.length} total):
${docs.map((d) => `- ${d.document_type}: status=${d.status}, file=${d.file_name ?? "none"}`).join("\n") || "No documents uploaded"}

MISSING REQUIRED DOCS: ${missingRequired.length > 0 ? missingRequired.join(", ") : "All required docs received"}

${missingFieldsBlock}

SCHEDULING:
- Expected Arrival: ${patient.expected_arrival ?? "Not scheduled"}
- Arrival Window: ${patient.arrival_window_min ?? 30} minutes

REMINDERS SENT (${(reminders ?? []).length}):
${(reminders ?? []).slice(0, 10).map((r: Rec) => `- ${r.sent_at}: ${r.email_type} to ${r.recipient_email} (${r.status})`).join("\n") || "No reminders sent"}

AUDIT TIMELINE (recent ${Math.min((auditLogs ?? []).length, 15)} events):
${(auditLogs ?? []).slice(0, 15).map((a: Rec) => `- ${a.created_at}: ${a.action}`).join("\n") || "No audit entries"}

CREATED: ${patient.created_at}
LAST UPDATED: ${patient.updated_at}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildReportsContext(reportData: any): string {
  // Accept raw JSON from client — may be a string or object
  let d: Record<string, unknown>;
  try {
    d = typeof reportData === "string" ? JSON.parse(reportData) : reportData;
  } catch {
    return `=== REPORTS ANALYSIS CONTEXT ===\nRaw report data:\n${JSON.stringify(reportData, null, 2)}`;
  }

  const kpis = (d.kpis ?? d) as Record<string, number>;
  const totalBilled = kpis.totalBilled ?? 0;
  const totalCollected = kpis.totalCollected ?? 0;
  const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : "N/A";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firmBreakdown = (d.lawFirmBreakdown ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const facilityBreakdown = (d.facilityBreakdown ?? []) as any[];

  return `=== REPORTS ANALYSIS CONTEXT ===
CURRENT DATE/TIME: ${new Date().toISOString()}
DATE RANGE: ${d.dateRange ?? "Unknown"}

SUMMARY METRICS:
- Total Patients: ${kpis.totalPatients ?? 0}
- Total Billed: $${(totalBilled).toLocaleString()}
- Total Collected: $${(totalCollected).toLocaleString()}
- Collection Rate: ${collectionRate}%
- Avg Billed per Patient: $${(kpis.avgBilled ?? 0).toLocaleString()}
- Avg Collected per Patient: $${(kpis.avgCollected ?? 0).toLocaleString()}

ALERTS:
- Open Follow-Ups: ${kpis.openFollowUps ?? 0}
- Dropped Cases: ${kpis.droppedCases ?? 0}
- Missing LOP Letters: ${kpis.missingLop ?? 0}

LAW FIRM BREAKDOWN:
${firmBreakdown.sort((a, b) => (b.patients ?? 0) - (a.patients ?? 0)).map((f) =>
    `- ${f.firm ?? f.name}: ${f.patients ?? f.patientCount} patients, $${(f.billed ?? f.totalBilled ?? 0).toLocaleString()} billed, $${(f.collected ?? f.totalCollected ?? 0).toLocaleString()} collected${f.belowThreshold ? " ⚠️ BELOW THRESHOLD" : ""}`
  ).join("\n") || "No law firm data"}

FACILITY BREAKDOWN:
${facilityBreakdown.map((f) =>
    `- ${f.name}: ${f.count} patients, $${(f.billed ?? 0).toLocaleString()} billed, $${(f.collected ?? 0).toLocaleString()} collected`
  ).join("\n") || "No facility data"}`;
}

/**
 * Build context filtered to a specific date range.
 * Fetches patients created/arriving within the range, plus audit events.
 */
export async function buildDateFilteredContext(
  facilityId: string | null | undefined,
  dateFrom: string,
  dateTo: string,
): Promise<string> {
  const nowISO = new Date().toISOString();
  const dateToEnd = `${dateTo}T23:59:59`;

  const baseJoin = `FROM lop_patients p LEFT JOIN lop_facilities f ON f.id = p.facility_id LEFT JOIN lop_law_firms lf ON lf.id = p.law_firm_id`;
  const facFilter = facilityId ? ` AND p.facility_id = '${facilityId}'` : "";

  const [createdRes, arrivalsRes, paidRes, auditRes] = await Promise.all([
    pool.query(`SELECT p.*, f.name AS facility_name, lf.name AS law_firm_name ${baseJoin} WHERE p.created_at >= $1 AND p.created_at <= $2${facFilter}`, [dateFrom, dateToEnd]),
    pool.query(`SELECT p.*, f.name AS facility_name ${baseJoin} WHERE p.expected_arrival >= $1 AND p.expected_arrival <= $2${facFilter}`, [dateFrom, dateToEnd]),
    pool.query(`SELECT p.*, f.name AS facility_name, lf.name AS law_firm_name ${baseJoin} WHERE p.date_paid >= $1 AND p.date_paid <= $2${facFilter}`, [dateFrom, dateToEnd]),
    pool.query(
      `SELECT * FROM lop_audit_log WHERE created_at >= $1 AND created_at <= $2${facilityId ? ` AND facility_id = '${facilityId}'` : ""} ORDER BY created_at DESC LIMIT 50`,
      [dateFrom, dateToEnd]
    ),
  ]);

  const mapRow = (p: Rec) => ({ ...p, lop_facilities: { name: p.facility_name }, lop_law_firms: { name: p.law_firm_name } });
  const created: Rec[] = createdRes.rows.map(mapRow);
  const arrivals: Rec[] = arrivalsRes.rows.map(mapRow);
  const paid: Rec[] = paidRes.rows.map(mapRow);
  const audits: Rec[] = auditRes.rows;

  const totalBilledCreated = created.reduce((s, p) => s + (Number(p.bill_charges) || 0), 0);
  const totalCollectedPaid = paid.reduce((s, p) => s + (Number(p.amount_collected) || 0), 0);

  // Deduplicate: a patient may appear in both created and arrivals
  const allIds = new Set<string>();
  const allUnique: Rec[] = [];
  for (const p of [...created, ...arrivals, ...paid]) {
    if (!allIds.has(p.id)) {
      allIds.add(p.id);
      allUnique.push(p);
    }
  }

  return `=== DATE-FILTERED CONTEXT ===
CURRENT DATE/TIME: ${nowISO}
QUERY RANGE: ${dateFrom} to ${dateTo}
FACILITY SCOPE: ${facilityId ? "Single Facility" : "All Facilities"}

PATIENTS CREATED IN RANGE (${created.length}):
${created.map((p) => `- ${p.first_name} ${p.last_name} | status: ${p.case_status} | facility: ${(p.lop_facilities as Rec)?.name ?? "N/A"} | firm: ${(p.lop_law_firms as Rec)?.name ?? "N/A"} | billed: $${(Number(p.bill_charges) || 0).toLocaleString()} | created: ${p.created_at?.split("T")[0]}`).join("\n") || "None"}

ARRIVALS IN RANGE (${arrivals.length}):
${arrivals.map((p) => `- ${p.first_name} ${p.last_name} | arrival: ${p.expected_arrival} | status: ${p.case_status} | facility: ${(p.lop_facilities as Rec)?.name ?? "N/A"}`).join("\n") || "None"}

PAYMENTS IN RANGE (${paid.length}):
${paid.map((p) => `- ${p.first_name} ${p.last_name} | paid: ${p.date_paid} | collected: $${(Number(p.amount_collected) || 0).toLocaleString()} | billed: $${(Number(p.bill_charges) || 0).toLocaleString()}`).join("\n") || "None"}

RANGE FINANCIAL SUMMARY:
- Total Billed (new patients): $${totalBilledCreated.toLocaleString()}
- Total Collected (payments): $${totalCollectedPaid.toLocaleString()}
- Unique Patients Involved: ${allUnique.length}

AUDIT EVENTS IN RANGE (${audits.length}):
${audits.slice(0, 30).map((a) => `- ${a.created_at}: ${a.action} (entity: ${a.entity_type}/${a.entity_id ?? "N/A"})`).join("\n") || "No audit events"}`;
}
