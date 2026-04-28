// ============================================================
// LOP financial helpers — keep bill / collected / aging math
// in one place so reports, law-firms, and patient views agree.
// ============================================================

const num = (value: unknown): number => Number(value) || 0;

/**
 * Total billed for a patient. Prefers itemized LLC + PLLC charges; falls back to
 * the legacy bill_charges field when no LLC/PLLC values are recorded.
 */
export function patientBilled(patient: Record<string, unknown>): number {
  const llc = num(patient.llc_billed_charges);
  const pllc = num(patient.pllc_billed_charges);
  if (llc + pllc > 0) return llc + pllc;
  return num(patient.bill_charges);
}

/**
 * Total collected for a patient. Prefers itemized LLC + PLLC receipts; falls
 * back to the legacy amount_collected field when no LLC/PLLC values exist.
 */
export function patientCollected(patient: Record<string, unknown>): number {
  const llc = num(patient.total_received_llc);
  const pllc = num(patient.total_received_pllc);
  if (llc + pllc > 0) return llc + pllc;
  return num(patient.amount_collected);
}

export type AgingBucket = '0-30' | '31-60' | '61-90' | '91-180' | '180+';

export const AGING_BUCKETS: AgingBucket[] = ['0-30', '31-60', '61-90', '91-180', '180+'];

export function bucketForDays(days: number): AgingBucket {
  if (days <= 30) return '0-30';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  if (days <= 180) return '91-180';
  return '180+';
}

/**
 * Days outstanding for a patient. Returns null when there's nothing to age
 * (no billing_date) or the case is paid (date_paid is set).
 */
export function outstandingDays(patient: Record<string, unknown>, now: Date = new Date()): number | null {
  if (patient.date_paid) return null;
  const billingDate = patient.billing_date as string | null | undefined;
  if (!billingDate) return null;
  const billingMs = new Date(billingDate).getTime();
  if (!Number.isFinite(billingMs)) return null;
  const ms = now.getTime() - billingMs;
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Days from billing to payment for a paid patient. Returns null when the
 * patient isn't paid or is missing the dates needed to compute it.
 */
export function daysToPayment(patient: Record<string, unknown>): number | null {
  const billingDate = patient.billing_date as string | null | undefined;
  const datePaid = patient.date_paid as string | null | undefined;
  if (!billingDate || !datePaid) return null;
  const paidMs = new Date(datePaid).getTime();
  const billedMs = new Date(billingDate).getTime();
  if (!Number.isFinite(paidMs) || !Number.isFinite(billedMs)) return null;
  const ms = paidMs - billedMs;
  if (ms < 0) return null;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0);
const avg = (values: number[]) => (values.length === 0 ? 0 : sum(values) / values.length);

/**
 * Reduction stats across a set of patients.
 *
 * - avgAmount: mean of reduction_amount (dollars) over patients with a recorded reduction
 * - avgPct: mean of (reduction_amount / billed) over patients where both are > 0
 */
export function reductionStats(patients: Record<string, unknown>[]): { avgAmount: number; avgPct: number } {
  const amounts: number[] = [];
  const pcts: number[] = [];
  for (const p of patients) {
    const reduction = num(p.reduction_amount);
    if (reduction <= 0) continue;
    amounts.push(reduction);
    const billed = patientBilled(p);
    if (billed > 0) pcts.push(reduction / billed);
  }
  return { avgAmount: avg(amounts), avgPct: avg(pcts) };
}

/** Average days-to-payment across paid patients with both billing_date and date_paid. */
export function avgDaysToPayment(patients: Record<string, unknown>[]): number {
  const days: number[] = [];
  for (const p of patients) {
    const d = daysToPayment(p);
    if (d !== null) days.push(d);
  }
  return avg(days);
}

export interface AgingBreakdown {
  buckets: Record<AgingBucket, { count: number; outstanding: number }>;
  unpaidCount: number;
  totalOutstanding: number;
}

/**
 * Aging breakdown across a set of patients. Each bucket holds the count of
 * unpaid patients in that range plus their outstanding (billed minus collected).
 */
export function agingBreakdown(patients: Record<string, unknown>[], now: Date = new Date()): AgingBreakdown {
  const buckets = AGING_BUCKETS.reduce(
    (acc, key) => ({ ...acc, [key]: { count: 0, outstanding: 0 } }),
    {} as Record<AgingBucket, { count: number; outstanding: number }>,
  );

  let unpaidCount = 0;
  let totalOutstanding = 0;

  for (const p of patients) {
    const days = outstandingDays(p, now);
    if (days === null) continue;
    const outstanding = Math.max(0, patientBilled(p) - patientCollected(p));
    const bucket = bucketForDays(days);
    buckets[bucket].count += 1;
    buckets[bucket].outstanding += outstanding;
    unpaidCount += 1;
    totalOutstanding += outstanding;
  }

  return { buckets, unpaidCount, totalOutstanding };
}
