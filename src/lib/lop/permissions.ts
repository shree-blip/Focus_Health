import type { LopUser, LopUserRole } from "./types";

/**
 * Permission matrix: which roles can perform which actions
 */
const PERMISSIONS: Record<string, LopUserRole[]> = {
  // Patient operations
  "patient:create": ["front_desk", "scheduler", "medical_records", "admin"],
  "patient:read": ["front_desk", "scheduler", "medical_records", "accounting", "admin"],
  "patient:update": ["front_desk", "medical_records", "admin"],
  "patient:delete": ["admin"],

  // Scheduling
  "schedule:create": ["scheduler", "admin"],
  "schedule:read": ["front_desk", "scheduler", "medical_records", "admin"],
  "schedule:update": ["scheduler", "admin"],

  // Medical records & billing
  "medical_records:update": ["medical_records", "admin"],
  "billing:update": ["medical_records", "admin"],
  "documents:upload": ["medical_records", "admin"],
  "documents:read": ["front_desk", "medical_records", "accounting", "admin"],

  // Law firms
  "law_firm:create": ["medical_records", "admin"],
  "law_firm:read": ["front_desk", "scheduler", "medical_records", "accounting", "admin"],
  "law_firm:update": ["medical_records", "admin"],

  // Reporting
  "reports:read": ["accounting", "admin"],
  "reports:export": ["accounting", "admin"],

  // Email
  "email:send": ["medical_records", "admin"],

  // Admin
  "users:manage": ["admin"],
  "config:manage": ["admin"],
  "facilities:manage": ["admin"],
  "audit:read": ["admin"],
};

export function hasPermission(user: LopUser | null, action: string): boolean {
  if (!user || !user.is_active) return false;
  const allowed = PERMISSIONS[action];
  if (!allowed) return false;
  return allowed.includes(user.role);
}

/**
 * Roles that can see ALL facilities (not scoped)
 */
const GLOBAL_ROLES: LopUserRole[] = ["admin", "accounting"];

export function hasGlobalAccess(role: LopUserRole): boolean {
  return GLOBAL_ROLES.includes(role);
}

/**
 * Check if email domain is allowed for LOP login
 */
const ALLOWED_DOMAINS = [
  "getfocushealth.com",
  "focusyourfinance.com",
  "erofwhiterock.com",
  "erofirving.com",
  "eroflufkin.com",
];

export function isAllowedDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? ALLOWED_DOMAINS.includes(domain) : false;
}
