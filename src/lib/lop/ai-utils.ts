/**
 * AI utility functions — date expression parsing & data completeness analysis.
 */

// ——— Date Expression Parser ———

export interface DateRange {
  from: string; // ISO date string YYYY-MM-DD
  to: string;   // ISO date string YYYY-MM-DD
  label: string; // Human-readable description
}

/**
 * Parse natural-language date expressions from a user message.
 * Returns a DateRange if a recognisable pattern is found, else null.
 *
 * Supported patterns:
 *   "today", "yesterday", "this week", "last week",
 *   "this month", "last month", "last N days",
 *   "april 1 to 10", "april 1 - april 10",
 *   "march 1 to march 15", "from jan 5 to jan 20",
 *   "2026-03-01 to 2026-03-15"
 */
export function parseDateExpression(text: string, now: Date = new Date()): DateRange | null {
  const lower = text.toLowerCase();

  // "today"
  if (/\btoday\b/.test(lower)) {
    const d = isoDate(now);
    return { from: d, to: d, label: "today" };
  }

  // "yesterday"
  if (/\byesterday\b/.test(lower)) {
    const d = addDays(now, -1);
    return { from: isoDate(d), to: isoDate(d), label: "yesterday" };
  }

  // "this week" (Mon–Sun)
  if (/\bthis\s+week\b/.test(lower)) {
    const mon = startOfWeek(now);
    const sun = addDays(mon, 6);
    return { from: isoDate(mon), to: isoDate(sun), label: "this week" };
  }

  // "last week"
  if (/\blast\s+week\b/.test(lower)) {
    const mon = addDays(startOfWeek(now), -7);
    const sun = addDays(mon, 6);
    return { from: isoDate(mon), to: isoDate(sun), label: "last week" };
  }

  // "this month"
  if (/\bthis\s+month\b/.test(lower)) {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: isoDate(first), to: isoDate(last), label: "this month" };
  }

  // "last month"
  if (/\blast\s+month\b/.test(lower)) {
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: isoDate(first), to: isoDate(last), label: "last month" };
  }

  // "last N days"
  const lastNDays = lower.match(/\blast\s+(\d+)\s+days?\b/);
  if (lastNDays) {
    const n = parseInt(lastNDays[1], 10);
    const from = addDays(now, -n);
    return { from: isoDate(from), to: isoDate(now), label: `last ${n} days` };
  }

  // ISO range: "2026-03-01 to 2026-03-15"
  const isoRange = lower.match(/(\d{4}-\d{2}-\d{2})\s*(?:to|-|through)\s*(\d{4}-\d{2}-\d{2})/);
  if (isoRange) {
    return { from: isoRange[1], to: isoRange[2], label: `${isoRange[1]} to ${isoRange[2]}` };
  }

  // Named month range: "april 1 to 10", "april 1 to april 10",
  // "march 1 - march 15", "from jan 5 to jan 20"
  const MONTHS: Record<string, number> = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
    apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
    aug: 7, august: 7, sep: 8, september: 8, oct: 9, october: 9,
    nov: 10, november: 10, dec: 11, december: 11,
  };

  // Pattern: "april 1 to 10" or "april 1 - 10"
  const sameMonth = lower.match(
    /(?:from\s+)?(\w+)\s+(\d{1,2})\s*(?:to|-|through)\s*(\d{1,2})\b/
  );
  if (sameMonth && MONTHS[sameMonth[1]] !== undefined) {
    const month = MONTHS[sameMonth[1]];
    const year = guessYear(month, now);
    const from = new Date(year, month, parseInt(sameMonth[2], 10));
    const to = new Date(year, month, parseInt(sameMonth[3], 10));
    return { from: isoDate(from), to: isoDate(to), label: `${sameMonth[1]} ${sameMonth[2]} to ${sameMonth[3]}` };
  }

  // Pattern: "april 1 to may 10", "jan 5 to feb 20"
  const crossMonth = lower.match(
    /(?:from\s+)?(\w+)\s+(\d{1,2})\s*(?:to|-|through)\s*(\w+)\s+(\d{1,2})\b/
  );
  if (
    crossMonth &&
    MONTHS[crossMonth[1]] !== undefined &&
    MONTHS[crossMonth[3]] !== undefined
  ) {
    const m1 = MONTHS[crossMonth[1]];
    const m2 = MONTHS[crossMonth[3]];
    const y1 = guessYear(m1, now);
    const y2 = guessYear(m2, now);
    const from = new Date(y1, m1, parseInt(crossMonth[2], 10));
    const to = new Date(y2, m2, parseInt(crossMonth[4], 10));
    return { from: isoDate(from), to: isoDate(to), label: `${crossMonth[1]} ${crossMonth[2]} to ${crossMonth[3]} ${crossMonth[4]}` };
  }

  return null;
}

// ——— Date helpers ———

function isoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function startOfWeek(d: Date): Date {
  const r = new Date(d);
  const day = r.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  r.setDate(r.getDate() + diff);
  return r;
}

function guessYear(month: number, now: Date): number {
  // Use current year; if month is far in the future, assume last year
  return now.getFullYear();
}

// ——— Data Completeness ———

export interface TrackableField {
  field: string;
  label: string;
  category: "Demographics" | "Contact" | "Address" | "Case" | "Financial" | "Scheduling" | "Notes";
  critical: boolean;
}

export const TRACKABLE_FIELDS: TrackableField[] = [
  // Demographics
  { field: "date_of_birth", label: "Date of Birth", category: "Demographics", critical: true },
  // Contact
  { field: "phone", label: "Phone", category: "Contact", critical: true },
  { field: "email", label: "Email", category: "Contact", critical: true },
  // Address
  { field: "address_line1", label: "Street Address", category: "Address", critical: false },
  { field: "city", label: "City", category: "Address", critical: false },
  { field: "state", label: "State", category: "Address", critical: false },
  { field: "zip", label: "ZIP Code", category: "Address", critical: false },
  // Case
  { field: "law_firm_id", label: "Law Firm", category: "Case", critical: true },
  { field: "date_of_accident", label: "Accident Date", category: "Case", critical: true },
  // Financial
  { field: "bill_charges", label: "Bill Charges", category: "Financial", critical: true },
  { field: "amount_collected", label: "Amount Collected", category: "Financial", critical: false },
  { field: "date_paid", label: "Date Paid", category: "Financial", critical: false },
  // Scheduling
  { field: "expected_arrival", label: "Expected Arrival", category: "Scheduling", critical: false },
  // Notes
  { field: "intake_notes", label: "Intake Notes", category: "Notes", critical: false },
  { field: "follow_up_note", label: "Follow-Up Note", category: "Notes", critical: false },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rec = Record<string, any>;

/**
 * Check a patient record for missing fields.
 * Returns { missing, filled, total, score, missingByCategory, criticalMissing }
 */
export function analyzePatientCompleteness(patient: Rec) {
  const missingByCategory: Record<string, { field: string; label: string; critical: boolean }[]> = {};
  const criticalMissing: string[] = [];
  let filled = 0;
  let missing = 0;

  for (const f of TRACKABLE_FIELDS) {
    const val = patient[f.field];
    const isEmpty =
      val === null ||
      val === undefined ||
      val === "" ||
      (Array.isArray(val) && val.length === 0);

    if (isEmpty) {
      missing++;
      if (!missingByCategory[f.category]) missingByCategory[f.category] = [];
      missingByCategory[f.category].push({ field: f.field, label: f.label, critical: f.critical });
      if (f.critical) criticalMissing.push(f.label);
    } else {
      filled++;
    }
  }

  const total = TRACKABLE_FIELDS.length;
  const score = total > 0 ? Math.round((filled / total) * 100) : 100;

  return { missing, filled, total, score, missingByCategory, criticalMissing };
}

/**
 * Format a patient's missing-field analysis as a text block.
 */
export function formatMissingFields(patient: Rec): string {
  const { missing, total, score, missingByCategory, criticalMissing } =
    analyzePatientCompleteness(patient);

  if (missing === 0) {
    return `DATA COMPLETENESS SCORE: 100% — All tracked fields are filled.`;
  }

  const lines: string[] = [];
  lines.push(`MISSING PATIENT DATA (${missing} of ${total} tracked fields empty):`);

  for (const [category, fields] of Object.entries(missingByCategory)) {
    const fieldStrs = fields.map((f) => f.critical ? `${f.label} ⚠️ CRITICAL` : f.label);
    lines.push(`  ${category}: ${fieldStrs.join(", ")}`);
  }

  if (criticalMissing.length > 0) {
    lines.push(`CRITICAL MISSING (${criticalMissing.length}): ${criticalMissing.join(", ")}`);
  }

  lines.push(`DATA COMPLETENESS SCORE: ${score}%`);

  return lines.join("\n");
}
