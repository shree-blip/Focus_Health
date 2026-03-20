export type SubmissionType = "partner" | "contact";

export type Submission = {
  id: string;
  type: SubmissionType;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  message?: string;
  marketInterest?: string;
  cashToInvest?: string;
  partnerType?: string;
  additionalInfo?: string;
  createdAt: string;
};

const SUBMISSIONS_STORE_KEY = "focus_admin_submissions";

function safeParseSubmissions(value: string | null): Submission[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as Submission[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function loadSubmissions(): Submission[] {
  if (typeof window === "undefined") return [];
  return safeParseSubmissions(window.localStorage.getItem(SUBMISSIONS_STORE_KEY));
}

export function saveSubmission(submission: Submission): void {
  if (typeof window === "undefined") return;
  const existing = loadSubmissions();
  existing.unshift(submission);
  window.localStorage.setItem(SUBMISSIONS_STORE_KEY, JSON.stringify(existing));
}

export function deleteSubmission(id: string): void {
  if (typeof window === "undefined") return;
  const existing = loadSubmissions();
  const filtered = existing.filter((s) => s.id !== id);
  window.localStorage.setItem(SUBMISSIONS_STORE_KEY, JSON.stringify(filtered));
}
