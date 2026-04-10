import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * General-purpose LOP database proxy.
 * Uses the service-role client to bypass RLS.
 * Verifies the caller is a real Supabase auth user before executing.
 *
 * POST /api/lop/db
 * Body: { auth_user_id, table, operation, data?, match?, select?, order?, filters? }
 */

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      auth_user_id,
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
    if (!auth_user_id || !table || !operation) {
      return NextResponse.json(
        { error: "auth_user_id, table, and operation are required" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json(
        { error: `Table "${table}" is not allowed` },
        { status: 400 },
      );
    }

    const admin = getAdmin();

    // Verify auth user exists
    const { data: authUser, error: authError } =
      await admin.auth.admin.getUserById(auth_user_id);
    if (authError || !authUser?.user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 });
    }

    // Verify user has lop_users record
    const { data: lopUser } = await admin
      .from("lop_users")
      .select("id, role, is_active")
      .eq("auth_user_id", auth_user_id)
      .single();

    if (!lopUser || !lopUser.is_active) {
      return NextResponse.json(
        { error: "LOP user not found or inactive" },
        { status: 403 },
      );
    }

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

    return NextResponse.json({ data: result.data });
  } catch (err) {
    console.error("LOP DB proxy error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
