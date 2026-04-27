import { NextResponse, type NextRequest } from "next/server";
import { requireLopAuth } from "@/lib/lop/server-auth";
import pool from "@/lib/db";

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

    // Build and execute pg query
    let rows: unknown[];

    // Helper to build WHERE clause from filters or match object
    const buildWhere = (
      fArr?: { column: string; op: string; value: unknown }[],
      matchObj?: Record<string, unknown>
    ): { text: string; values: unknown[] } => {
      const parts: string[] = [];
      const values: unknown[] = [];
      if (fArr) {
        for (const f of fArr) {
          const idx = values.length + 1;
          switch (f.op) {
            case "eq": parts.push(`"${f.column}" = $${idx}`); values.push(f.value); break;
            case "neq": parts.push(`"${f.column}" != $${idx}`); values.push(f.value); break;
            case "gt": parts.push(`"${f.column}" > $${idx}`); values.push(f.value); break;
            case "gte": parts.push(`"${f.column}" >= $${idx}`); values.push(f.value); break;
            case "lt": parts.push(`"${f.column}" < $${idx}`); values.push(f.value); break;
            case "lte": parts.push(`"${f.column}" <= $${idx}`); values.push(f.value); break;
            case "in": parts.push(`"${f.column}" = ANY($${idx})`); values.push(f.value); break;
            case "is": parts.push(`"${f.column}" IS ${f.value === null ? "NULL" : `$${idx}`}`); if (f.value !== null) values.push(f.value); break;
            case "not_is": parts.push(`"${f.column}" IS NOT ${f.value === null ? "NULL" : `$${idx}`}`); if (f.value !== null) values.push(f.value); break;
            case "like": parts.push(`"${f.column}" LIKE $${idx}`); values.push(f.value); break;
            case "ilike": parts.push(`"${f.column}" ILIKE $${idx}`); values.push(f.value); break;
          }
        }
      }
      if (matchObj) {
        for (const [key, val] of Object.entries(matchObj)) {
          const idx = values.length + 1;
          parts.push(`"${key}" = $${idx}`);
          values.push(val);
        }
      }
      const text = parts.length ? `WHERE ${parts.join(" AND ")}` : "";
      return { text, values };
    };

    switch (operation) {
      case "select": {
        const cols = selectCols && selectCols !== "*" ? selectCols : "*";
        const { text: whereText, values } = buildWhere(filters);
        let sql = `SELECT ${cols} FROM "${table}" ${whereText}`;
        if (order) sql += ` ORDER BY "${order.column}" ${(order.ascending ?? true) ? "ASC" : "DESC"}`;
        if (queryLimit) sql += ` LIMIT ${parseInt(queryLimit, 10)}`;
        const res = await pool.query(sql, values);
        rows = res.rows;
        if (single) {
          return NextResponse.json({ data: rows[0] ?? null });
        }
        break;
      }

      case "insert": {
        const record = Array.isArray(data) ? data : [data];
        const inserted: unknown[] = [];
        for (const row of record) {
          const entries = Object.entries(row as Record<string, unknown>);
          const keys = entries.map(([k]) => `"${k}"`).join(", ");
          const vals = entries.map((_, i) => `$${i + 1}`).join(", ");
          const values = entries.map(([, v]) => v);
          const res = await pool.query(
            `INSERT INTO "${table}" (${keys}) VALUES (${vals}) RETURNING *`,
            values
          );
          inserted.push(res.rows[0]);
        }
        rows = inserted;
        if (single) return NextResponse.json({ data: rows[0] ?? null });
        break;
      }

      case "update": {
        if (!match || Object.keys(match).length === 0) {
          return NextResponse.json({ error: "match is required for update" }, { status: 400 });
        }
        const setEntries = Object.entries(data as Record<string, unknown>);
        const setClauses = setEntries.map(([k], i) => `"${k}" = $${i + 1}`).join(", ");
        const setValues = setEntries.map(([, v]) => v);
        const { text: whereText, values: whereValues } = buildWhere(undefined, match);
        const offsetValues = whereValues.map((v, i) => ({ v, i: setEntries.length + i + 1 }));
        const offsetWhere = offsetValues.length
          ? `WHERE ${Object.keys(match).map((k, i) => `"${k}" = $${setEntries.length + i + 1}`).join(" AND ")}`
          : "";
        const sql = `UPDATE "${table}" SET ${setClauses} ${offsetWhere} RETURNING *`;
        const allValues = [...setValues, ...whereValues];
        const res = await pool.query(sql, allValues);
        rows = res.rows;
        void offsetValues; // silence unused warning
        if (single) return NextResponse.json({ data: rows[0] ?? null });
        break;
      }

      case "delete": {
        if (!match || Object.keys(match).length === 0) {
          return NextResponse.json({ error: "match is required for delete" }, { status: 400 });
        }
        const { text: whereText, values } = buildWhere(undefined, match);
        await pool.query(`DELETE FROM "${table}" ${whereText}`, values);
        rows = [];
        break;
      }

      case "upsert": {
        const record = Array.isArray(data) ? data : [data];
        const upserted: unknown[] = [];
        for (const row of record) {
          const entries = Object.entries(row as Record<string, unknown>);
          const keys = entries.map(([k]) => `"${k}"`).join(", ");
          const vals = entries.map((_, i) => `$${i + 1}`).join(", ");
          const values = entries.map(([, v]) => v);
          const setClauses = entries.map(([k]) => `"${k}" = EXCLUDED."${k}"`).join(", ");
          const res = await pool.query(
            `INSERT INTO "${table}" (${keys}) VALUES (${vals}) ON CONFLICT DO UPDATE SET ${setClauses} RETURNING *`,
            values
          );
          upserted.push(res.rows[0]);
        }
        rows = upserted;
        if (single) return NextResponse.json({ data: rows[0] ?? null });
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown operation: ${operation}` }, { status: 400 });
    }

    // HIPAA: Log PHI read access (fire-and-forget)
    if (operation === "select" && PHI_TABLES.includes(table)) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
      pool.query(
        `INSERT INTO lop_audit_log (user_id, action, entity_type, entity_id, facility_id, ip_address, new_values)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          lopUser.id,
          `phi_read:${table}`,
          table.replace("lop_", ""),
          filters?.find((f: { column: string; op: string }) => f.column === "id" && f.op === "eq")?.value ?? null,
          filters?.find((f: { column: string; op: string }) => f.column === "facility_id" && f.op === "eq")?.value ?? null,
          ip,
          JSON.stringify({ select: selectCols ?? "*", filter_count: filters?.length ?? 0 }),
        ]
      ).catch(console.error);
    }

    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("LOP DB proxy error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
