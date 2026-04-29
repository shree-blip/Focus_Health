#!/usr/bin/env python3
"""
Import the White Rock LOP Tracker CSV into lop_patients.

This is the LOP-specific tracker (last contact date, POC, attachments, LOP
status). It's complementary to the operational dashboard CSV imported by
`import-white-rock-patients.py` — this script *merges by MRN* rather than
replacing rows, so operational fields (chief complaint, disposition, etc.)
already populated by the other import are preserved.

Run with:
    python3 scripts/import-white-rock-lop-tracker.py

Requires cloud-sql-proxy running on port 5433 (same pattern as the other
import script).
"""

import csv
import os
import re
import sys
from datetime import datetime
from typing import Optional

import psycopg2
from psycopg2.extras import execute_batch

DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 5433,
    "user": "focus_app",
    "password": os.environ.get("DB_PASSWORD", "FocusHealth2026!$ecure"),
    "dbname": "focus_health",
}

CSV_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "White Rock ER - LOP Tracker - White Rock ER - LOP Tracker.csv",
)

# Map distinct attorney spellings in the CSV to a single canonical name so
# duplicates collapse into one law-firm row. Lookup is case-insensitive.
FIRM_CANONICAL: dict = {
    "FASORO LAW": "Fasoro Law Firm",
    "FASORO LAW FIRM": "Fasoro Law Firm",
    "FIDEL MARTINEZ": "Fidel Martinez Law",
    "FIDEL MARTINEZ LAW": "Fidel Martinez Law",
}

# CSV "LOP Status" → (case_status, lop_letter_status, medical_records_status).
# Empty string falls through to the default.
LOP_STATUS_MAP: dict = {
    "LOP Requested": ("in_progress", "requested", "not_requested"),
    "Medical/ Billing Records Shared": ("in_progress", "received", "received"),
}
DEFAULT_STATUS = ("arrived", "not_requested", "not_requested")


def parse_date(val: str):
    if not val or not val.strip():
        return None
    val = val.strip()
    val = re.sub(r"/(\d{5,})$", lambda m: "/" + m.group(1)[:4], val)
    for fmt in ("%m/%d/%Y", "%m/%d/%y"):
        try:
            return datetime.strptime(val, fmt).date()
        except ValueError:
            continue
    return None


def parse_money(val: str):
    if not val or not val.strip():
        return None
    cleaned = re.sub(r"[\$,\s]", "", val.strip())
    if not cleaned:
        return None
    try:
        result = float(cleaned)
        return result if result != 0.0 else None
    except ValueError:
        return None


def normalize_firm(raw: str) -> Optional[str]:
    """Return the canonical law-firm name or None when there's no firm."""
    name = (raw or "").strip()
    if not name:
        return None
    if name.upper() == "WALK-IN":
        return None  # walk-in patients are tracked without a firm
    return FIRM_CANONICAL.get(name.upper(), name.title())


def build_attachment_notes(row: dict) -> Optional[str]:
    """Capture pending attachment filenames so the bulk uploader can match later."""
    pending: list[str] = []
    for csv_col, label in (
        ("LOP Attachment", "LOP letter"),
        ("Records Attachment", "Medical records"),
        ("Reduction Attachment", "Reduction letter"),
    ):
        val = (row.get(csv_col) or "").strip()
        if val:
            pending.append(f"- {label}: {val}")
    return "Pending attachments (file upload):\n" + "\n".join(pending) if pending else None


def main() -> int:
    if not os.path.exists(CSV_PATH):
        print(f"ERROR: CSV not found at {CSV_PATH}", file=sys.stderr)
        return 1

    print("Connecting to database...")
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    cur.execute("SELECT id FROM lop_facilities WHERE slug = 'white-rock' LIMIT 1")
    row = cur.fetchone()
    if not row:
        print("ERROR: White Rock facility (slug='white-rock') not found.", file=sys.stderr)
        print("Run the base LOP migration before importing.", file=sys.stderr)
        return 1
    facility_id = row[0]
    print(f"White Rock facility id: {facility_id}")

    cur.execute("SELECT id, name FROM lop_law_firms")
    firms_by_upper = {name.upper().strip(): firm_id for firm_id, name in cur.fetchall()}

    def get_or_create_firm(name: Optional[str]) -> Optional[str]:
        if not name:
            return None
        key = name.upper().strip()
        if key in firms_by_upper:
            return firms_by_upper[key]
        cur.execute(
            "INSERT INTO lop_law_firms (name, is_active) VALUES (%s, TRUE) RETURNING id",
            (name,),
        )
        firm_id = cur.fetchone()[0]
        firms_by_upper[key] = firm_id
        print(f"  + created law firm: {name}")
        return firm_id

    print(f"Reading CSV: {CSV_PATH}")
    parsed: list = []
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for raw in reader:
            mrn = (raw.get("MRN") or "").strip()
            first = (raw.get("First Name") or "").strip().title()
            last = (raw.get("Last Name") or "").strip().title()
            if not (mrn and first and last):
                continue

            firm_name = normalize_firm(raw.get("Attonrney", ""))
            firm_id = get_or_create_firm(firm_name)

            case_status, lop_status, mr_status = LOP_STATUS_MAP.get(
                (raw.get("LOP Status") or "").strip(), DEFAULT_STATUS
            )

            attachments_note = build_attachment_notes(raw)
            extra_note = (raw.get("Notes") or "").strip()
            intake_notes = "\n\n".join(part for part in (extra_note, attachments_note) if part) or None

            billing_tags = ["walk-in"] if (raw.get("Attonrney") or "").strip().upper() == "WALK-IN" else []

            parsed.append({
                "facility_id": facility_id,
                "law_firm_id": firm_id,
                "first_name": first,
                "last_name": last,
                "date_of_birth": parse_date(raw.get("DOB", "")),
                "mrn": mrn,
                "date_of_service": parse_date(raw.get("Date of Arrival", "")),
                "last_date_of_contact": parse_date(raw.get("Last Date of Contact", "")),
                "point_of_contact": (raw.get("POC") or "").strip() or None,
                "mr_dept_notes": (raw.get("MR. Dept. Notes") or "").strip() or None,
                "case_status": case_status,
                "lop_letter_status": lop_status,
                "medical_records_status": mr_status,
                "llc_billed_charges": parse_money(raw.get("Total Billed LLC", "")),
                "pllc_billed_charges": parse_money(raw.get("Total Billed PLLC", "")),
                "total_received_llc": parse_money(raw.get("Total Received LLC", "")),
                "total_received_pllc": parse_money(raw.get("Total Received PLLC", "")),
                "date_paid": parse_date(raw.get("Payment Date", "")),
                "intake_notes": intake_notes,
                "billing_tags": billing_tags,
                "is_lop_case": True,
            })

    print(f"Parsed {len(parsed)} rows. Merging by (facility_id, mrn)...")

    inserted = 0
    updated = 0
    skipped = 0
    for p in parsed:
        cur.execute(
            "SELECT id FROM lop_patients WHERE facility_id = %s AND mrn = %s LIMIT 1",
            (p["facility_id"], p["mrn"]),
        )
        existing = cur.fetchone()
        if existing:
            # Merge: only overwrite columns this CSV is authoritative for; leave
            # operational fields (chief_complaint, disposition_status, …) alone.
            cur.execute(
                """
                UPDATE lop_patients SET
                    law_firm_id            = COALESCE(%s, law_firm_id),
                    first_name             = %s,
                    last_name              = %s,
                    date_of_birth          = COALESCE(%s, date_of_birth),
                    date_of_service        = COALESCE(%s, date_of_service),
                    last_date_of_contact   = %s,
                    point_of_contact       = %s,
                    mr_dept_notes          = %s,
                    case_status            = %s,
                    lop_letter_status      = %s,
                    medical_records_status = %s,
                    llc_billed_charges     = COALESCE(%s, llc_billed_charges),
                    pllc_billed_charges    = COALESCE(%s, pllc_billed_charges),
                    total_received_llc     = COALESCE(%s, total_received_llc),
                    total_received_pllc    = COALESCE(%s, total_received_pllc),
                    date_paid              = COALESCE(%s, date_paid),
                    intake_notes           = COALESCE(%s, intake_notes),
                    billing_tags           = CASE
                        WHEN %s::text[] IS NOT NULL AND array_length(%s::text[], 1) > 0
                        THEN COALESCE(billing_tags, ARRAY[]::text[]) || %s::text[]
                        ELSE billing_tags END,
                    is_lop_case            = TRUE,
                    updated_at             = NOW()
                WHERE id = %s
                """,
                (
                    p["law_firm_id"], p["first_name"], p["last_name"],
                    p["date_of_birth"], p["date_of_service"],
                    p["last_date_of_contact"], p["point_of_contact"], p["mr_dept_notes"],
                    p["case_status"], p["lop_letter_status"], p["medical_records_status"],
                    p["llc_billed_charges"], p["pllc_billed_charges"],
                    p["total_received_llc"], p["total_received_pllc"],
                    p["date_paid"], p["intake_notes"],
                    p["billing_tags"], p["billing_tags"], p["billing_tags"],
                    existing[0],
                ),
            )
            updated += 1
        else:
            cur.execute(
                """
                INSERT INTO lop_patients (
                    facility_id, law_firm_id,
                    first_name, last_name, date_of_birth,
                    mrn, date_of_service,
                    last_date_of_contact, point_of_contact, mr_dept_notes,
                    case_status, lop_letter_status, medical_records_status,
                    llc_billed_charges, pllc_billed_charges,
                    total_received_llc, total_received_pllc, date_paid,
                    intake_notes, billing_tags, is_lop_case
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT DO NOTHING
                """,
                (
                    p["facility_id"], p["law_firm_id"],
                    p["first_name"], p["last_name"], p["date_of_birth"],
                    p["mrn"], p["date_of_service"],
                    p["last_date_of_contact"], p["point_of_contact"], p["mr_dept_notes"],
                    p["case_status"], p["lop_letter_status"], p["medical_records_status"],
                    p["llc_billed_charges"], p["pllc_billed_charges"],
                    p["total_received_llc"], p["total_received_pllc"], p["date_paid"],
                    p["intake_notes"], p["billing_tags"], p["is_lop_case"],
                ),
            )
            if cur.rowcount > 0:
                inserted += 1
            else:
                skipped += 1

    conn.commit()
    print(f"\n✓ {inserted} inserted, {updated} updated, {skipped} skipped (duplicates), {len(parsed)} total rows processed.")
    cur.close()
    conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
