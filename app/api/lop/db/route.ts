import { NextResponse, type NextRequest } from "next/server";
import { requireLopAuth, getAdminClient } from "@/lib/lop/server-auth";

/**
 * General-purpose LOP database proxy.
 * Uses the service-role client to bypass RLS.
 * HIPAA: User identity is verified from the session cookie — not client body.
 *
 * POST /api/lop/db
 * Body: { table, operation, data?, match?, select?, order?, filters? }
 */

const ALLOWED_TABLES = [
  "lop_facilities",
  "lop_users",
  "lop_user_facilities",
  "lop_law_firms",
  "lop_patients",
  "lop_patient_documents",
  "lop_reminder_emails",
  "lop_audit_log",
  "lop_config",
];

/**
 * Server-side role → table/operation permission matrix.
 * "select" is relatively open; mutations are restricted.
 */
type Role = "front_desk" | "scheduler" | "medical_records" | "accounting" | "admin";

const TABLE_WRITE_RULES: Record<string, Role[]> = {
  "lop_patients:insert": ["front_desk", "scheduler", "medical_records", "admin"],
  "lop_patients:update": ["front_desk", "medical_records", "admin"],
  "lop_patients:delete": ["admin"],
  "lop_patient_documents:insert": ["medical_records", "admin"],
  "lop_patient_documents:update": ["medical_records", "admin"],
  "lop_patient_documents:delete": ["medical_records", "admin"],
  "lop_law_firms:insert": ["medical_records", "admin"],
  "lop_law_firms:update": ["medical_records", "admin"],
  "lop_law_firms:delete": ["admin"],
  "lop_reminder_emails:insert": ["medical_records", "admin"],
  "lop_audit_log:insert": ["front_desk", "scheduler", "medical_records", "accounting", "admin"],
  "lop_users:insert": ["admin"],
  "lop_users:update": ["admin"],
  "lop_user_facilities:insert": ["admin"],
  "lop_user_facilities:delete": ["admin"],
  "lop_facilities:insert": ["admin"],
  "lop_facilities:update": ["admin"],
  "lop_config:update": ["admin"],
  "lop_config:upsert": ["admin"],
};

// Tables containing PHI — read access will be audit-logged
const PHI_TABLES = ["lop_patients", "lop_patient_documents", "lop_reminder_emails"];

export async function POST(request: NextRequest) {
  try {
    // HIPAA: Authenticate from session cookie — not client-supplied ID
    const auth = await requireLopAuth();
    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    const { authUserId, lopUser } = auth;

    const body = await request.json();
    const {
      table,
      operation,
      data,
      match,
      select: selectCols,
      order,
      filters,
      single,
      limit: queryLimit,
    } = body;

    // Validate inputs
    if (!table || !operation) {
      return NextResponse.json(
        { error: "table and operation are required" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json(
        { error: `Table "${table}" is not allowed` },
        { status: 400 },
      );
    }

    const admin = getAdminClient();

    // Server-side role check for write operations
    if (operation !== "select") {
      const ruleKey = `${table}:${operation}`;
      const allowedRoles = TABLE_WRITE_RULES[ruleKey];
      if (allowedRoles && !allowedRoles.includes(lopUser.role as Role)) {
        return NextResponse.json(
          { error: `Role "${lopUser.role}" cannot ${operation} on ${table}` },
          { status: 403 },
        );
      }
    }

    // Execute the operation
    let result: { data: unknown; error: unknown };

    switch (operation) {
      case "select": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q: any = admin.from(table).select(selectCols || "*");
        if (filters) {
          for (const f of filters) {
            if (f.op === "eq") q = q.eq(f.column, f.value);
            else if (f.op === "neq") q = q.neq(f.column, f.value);
            else if (f.op === "gt") q = q.gt(f.column, f.value);
            else if (f.op === "gte") q = q.gte(f.column, f.value);
            else if (f.op === "lt") q = q.lt(f.column, f.value);
            else if (f.op === "lte") q = q.lte(f.column, f.value);
            else if (f.op === "in") q = q.in(f.column, f.value);
            else if (f.op === "is") q = q.is(f.column, f.value);
            else if (f.op === "not_is") q = q.not(f.column, "is", f.value);
            else if (f.op === "like") q = q.like(f.column, f.value);
            else if (f.op === "ilike") q = q.ilike(f.column, f.value);
          }
        }
        if (order) {
          q = q.order(order.column, {
            ascending: order.ascending ?? true,
          });
        }
        if (queryLimit) q = q.limit(queryLimit);
        if (single) {
          result = await q.single();
        } else {
          result = await q;
        }
        break;
      }

      case "insert": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q: any = admin.from(table).insert(data);
        if (selectCols) q = q.select(selectCols);
        if (single) {
          result = await q.single();
        } else {
          result = await q;
        }
        break;
      }

      case "update": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q: any = admin.from(table).update(data);
        if (match) {
          for (const [key, val] of Object.entries(match)) {
            q = q.eq(key, val as string);
          }
        }
        if (selectCols) q = q.select(selectCols);
        if (single) {
          result = await q.single();
        } else {
          result = await q;
        }
        break;
      }

      case "delete": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q: any = admin.from(table).delete();
        if (match) {
          for (const [key, val] of Object.entries(match)) {
            q = q.eq(key, val as string);
          }
        }
        result = await q;
        break;
      }

      case "upsert": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q: any = admin.from(table).upsert(data);
        if (selectCols) q = q.select(selectCols);
        if (single) {
          result = await q.single();
        } else {
          result = await q;
        }
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown operation: ${operation}` },
          { status: 400 },
        );
    }

    if (result.error) {
      console.error(`LOP DB error [${table}.${operation}]:`, result.error);
      return NextResponse.json(
        { error: (result.error as { message?: string }).message || "Database error" },
        { status: 500 },
      );
    }

    // HIPAA: Log PHI read access
    if (operation === "select" && PHI_TABLES.includes(table)) {
      // Fire-and-forget — don't block the response
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
      void admin.from("lop_audit_log").insert({
        user_id: lopUser.id,
        action: `phi_read:${table}`,
        entity_type: table.replace("lop_", ""),
        entity_id: (filters?.find((f: { column: string; op: string; value: string }) => f.column === "id" && f.op === "eq")?.value) ?? null,
        facility_id: (filters?.find((f: { column: string; op: string; value: string }) => f.column === "facility_id" && f.op === "eq")?.value) ?? null,
        ip_address: ip,
        new_values: { select: selectCols ?? "*", filter_count: filters?.length ?? 0 },
      });
    }

    return NextResponse.json({ data: result.data });
  } catch (err) {
    console.error("LOP DB proxy error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
