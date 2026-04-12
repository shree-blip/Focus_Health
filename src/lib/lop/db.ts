"use client";

/**
 * LOP Database helper — routes all queries through /api/lop/db
 * which uses the service-role client (bypasses RLS).
 *
 * Usage:
 *   import { lopDb } from "@/lib/lop/db";
 *
 *   // SELECT
 *   const { data } = await lopDb.select("lop_facilities", { order: { column: "name" } });
 *
 *   // INSERT
 *   const { data } = await lopDb.insert("lop_users", { email: "...", ... }, { select: "id", single: true });
 *
 *   // UPDATE
 *   const { data } = await lopDb.update("lop_patients", { case_status: "arrived" }, { id: patientId });
 *
 *   // DELETE
 *   await lopDb.remove("lop_user_facilities", { user_id: uid });
 */

interface Filter {
  column: string;
  op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "is" | "not_is" | "like" | "ilike";
  value: unknown;
}

interface SelectOpts {
  select?: string;
  filters?: Filter[];
  order?: { column: string; ascending?: boolean };
  single?: boolean;
  limit?: number;
}

interface MutateOpts {
  select?: string;
  single?: boolean;
}

let _authUserId: string | null = null;

export function setLopDbAuthUser(id: string | null) {
  _authUserId = id;
}

async function call(body: Record<string, unknown>) {
  // HIPAA: Server now authenticates via session cookie, not body.auth_user_id.
  // We still send it as a legacy field but the server ignores it.
  const res = await fetch("/api/lop/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin", // Ensure cookies are sent
    body: JSON.stringify({ auth_user_id: _authUserId, ...body }),
  });

  const json = await res.json();

  if (!res.ok) {
    const err = new Error(json.error || `DB request failed (${res.status})`);
    (err as unknown as Record<string, unknown>).code = res.status;
    throw err;
  }

  return { data: json.data, error: null };
}

export const lopDb = {
  async select(table: string, opts?: SelectOpts) {
    return call({
      table,
      operation: "select",
      select: opts?.select,
      filters: opts?.filters,
      order: opts?.order,
      single: opts?.single,
      limit: opts?.limit,
    });
  },

  async insert(
    table: string,
    data: Record<string, unknown> | Record<string, unknown>[],
    opts?: MutateOpts,
  ) {
    return call({
      table,
      operation: "insert",
      data,
      select: opts?.select,
      single: opts?.single,
    });
  },

  async update(
    table: string,
    data: Record<string, unknown>,
    match: Record<string, unknown>,
    opts?: MutateOpts,
  ) {
    return call({
      table,
      operation: "update",
      data,
      match,
      select: opts?.select,
      single: opts?.single,
    });
  },

  async upsert(
    table: string,
    data: Record<string, unknown> | Record<string, unknown>[],
    opts?: MutateOpts,
  ) {
    return call({
      table,
      operation: "upsert",
      data,
      select: opts?.select,
      single: opts?.single,
    });
  },

  async remove(table: string, match: Record<string, unknown>) {
    return call({ table, operation: "delete", match });
  },
};
