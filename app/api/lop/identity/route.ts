import { NextResponse, type NextRequest } from "next/server";
import { requireLopAuth } from "@/lib/lop/server-auth";
import pool from "@/lib/db";

/**
 * POST /api/lop/identity
 * Body: { first_name, last_name, date_of_birth?, phone?, email? }
 *
 * Calls lop_find_or_create_identity() SQL function.
 * Returns: { identityId: string, isReturning: boolean }
 *
 * Used by the new-patient form to get an identity_id before inserting
 * a new lop_patients (case) row. Same person gets the same identity_id
 * across multiple cases, law firms, and facilities.
 */
export async function POST(req: NextRequest) {
  const auth = await requireLopAuth();
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const body = await req.json();
  const { first_name, last_name, date_of_birth, phone, email } = body as Record<string, string | null>;

  if (!first_name?.trim() || !last_name?.trim()) {
    return NextResponse.json({ error: "first_name and last_name are required" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const res = await client.query<{ id: string }>(
      `SELECT lop_find_or_create_identity($1, $2, $3::date, $4, $5) AS id`,
      [
        first_name.trim(),
        last_name.trim(),
        date_of_birth || null,
        phone?.trim() || null,
        email?.trim() || null,
      ],
    );

    const identityId = res.rows[0]?.id ?? null;
    if (!identityId) throw new Error("Identity function returned null");

    // Check how many existing cases are linked to this identity
    const caseRes = await client.query<{ count: string }>(
      `SELECT count(*) FROM lop_patients WHERE identity_id = $1`,
      [identityId],
    );
    const existingCaseCount = parseInt(caseRes.rows[0]?.count ?? "0", 10);

    return NextResponse.json({
      identityId,
      isReturning: existingCaseCount > 0,
      existingCaseCount,
    });
  } finally {
    client.release();
  }
}

/**
 * GET /api/lop/identity/search?q=&dob=
 * Returns matching identities with their case summaries.
 * Used for live search in the new patient form.
 */
export async function GET(req: NextRequest) {
  const auth = await requireLopAuth();
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q   = searchParams.get("q")?.trim() ?? "";
  const dob = searchParams.get("dob")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ identities: [] });
  }

  const client = await pool.connect();
  try {
    // Split q into parts to handle "First Last" or "First" searches
    const parts = q.split(/\s+/).filter(Boolean);
    const firstName = parts[0] ?? "";
    const lastName  = parts[1] ?? "";

    let query: string;
    let params: (string | null)[];

    if (lastName) {
      // Full name search
      query = `
        SELECT
          i.id,
          i.first_name,
          i.last_name,
          i.date_of_birth,
          i.phone,
          count(p.id)::int           AS case_count,
          max(p.date_of_service)     AS latest_dos,
          array_agg(DISTINCT f.name) FILTER (WHERE f.name IS NOT NULL) AS facilities,
          array_agg(DISTINCT lf.name) FILTER (WHERE lf.name IS NOT NULL) AS law_firms
        FROM lop_patient_identities i
        LEFT JOIN lop_patients p  ON p.identity_id = i.id
        LEFT JOIN lop_facilities f ON f.id = p.facility_id
        LEFT JOIN lop_law_firms lf ON lf.id = p.law_firm_id
        WHERE lower(i.first_name) LIKE lower($1)
          AND lower(i.last_name)  LIKE lower($2)
          ${dob ? "AND i.date_of_birth = $3::date" : ""}
        GROUP BY i.id
        ORDER BY max(p.updated_at) DESC NULLS LAST
        LIMIT 10
      `;
      params = dob
        ? [`${firstName}%`, `${lastName}%`, dob]
        : [`${firstName}%`, `${lastName}%`];
    } else {
      // Single token — match against first OR last name
      query = `
        SELECT
          i.id,
          i.first_name,
          i.last_name,
          i.date_of_birth,
          i.phone,
          count(p.id)::int           AS case_count,
          max(p.date_of_service)     AS latest_dos,
          array_agg(DISTINCT f.name) FILTER (WHERE f.name IS NOT NULL) AS facilities,
          array_agg(DISTINCT lf.name) FILTER (WHERE lf.name IS NOT NULL) AS law_firms
        FROM lop_patient_identities i
        LEFT JOIN lop_patients p  ON p.identity_id = i.id
        LEFT JOIN lop_facilities f ON f.id = p.facility_id
        LEFT JOIN lop_law_firms lf ON lf.id = p.law_firm_id
        WHERE lower(i.first_name) LIKE lower($1)
           OR lower(i.last_name)  LIKE lower($1)
        GROUP BY i.id
        ORDER BY max(p.updated_at) DESC NULLS LAST
        LIMIT 10
      `;
      params = [`${firstName}%`];
    }

    const res = await client.query(query, params);
    return NextResponse.json({ identities: res.rows });
  } finally {
    client.release();
  }
}
