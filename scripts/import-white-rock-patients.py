#!/usr/bin/env python3
"""
Import ER of White Rock patient data from CSV into lop_patients table.
Run with: python3 scripts/import-white-rock-patients.py
Requires cloud-sql-proxy running on port 5433.
"""

import csv
import re
import sys
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import execute_values

DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 5433,
    "user": "focus_app",
    "password": os.environ.get("DB_PASSWORD", "FocusHealth2026!$ecure"),
    "dbname": "focus_health",
}

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "ER of White Rock - Dashboard - Sheet1.csv")

DISPOSITION_MAP = {
    "discharged": "discharged",
    "ama": "ama",
    "mse": "mse",
    "lwbs": "lwbs",
    "eloped / lbtc": "eloped_lbtc",
    "eloped/lbtc": "eloped_lbtc",
    "observation": "observation",
    "transferred": "transferred",
}


def parse_date(val):
    """Parse MM/DD/YYYY date string."""
    if not val or not val.strip():
        return None
    val = val.strip()
    # Handle bad years like "19996"
    val = re.sub(r'/(\d{5,})$', lambda m: '/' + m.group(1)[:4], val)
    for fmt in ("%m/%d/%Y", "%m/%d/%y"):
        try:
            return datetime.strptime(val, fmt).date()
        except ValueError:
            pass
    return None


def parse_money(val):
    """Parse $1,234.56 to float."""
    if not val or not val.strip():
        return None
    cleaned = re.sub(r'[\$,\s]', '', val.strip())
    if not cleaned:
        return None
    try:
        result = float(cleaned)
        return result if result != 0.0 else None
    except ValueError:
        return None


def parse_name(full_name):
    """Parse 'LAST, FIRST' format."""
    full_name = full_name.strip()
    if ',' in full_name:
        parts = full_name.split(',', 1)
        last = parts[0].strip().title()
        first = parts[1].strip().title()
    else:
        parts = full_name.rsplit(' ', 1)
        first = parts[0].strip().title() if len(parts) > 1 else full_name.title()
        last = parts[-1].strip().title() if len(parts) > 1 else ''
    return first, last


def main():
    print("Connecting to database...")
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    # Get or create ER of White Rock facility
    cur.execute("SELECT id FROM lop_facilities WHERE name ILIKE '%white rock%' LIMIT 1")
    row = cur.fetchone()
    if not row:
        print("ERROR: ER of White Rock facility not found. Run migration first.")
        cur.execute("""
            INSERT INTO lop_facilities (name, type, address, city, state, zip, is_active, created_at)
            VALUES ('ER of White Rock', 'emergency_room', '9440 Garland Rd', 'Dallas', 'TX', '75218', true, now())
            RETURNING id
        """)
        facility_id = cur.fetchone()[0]
        conn.commit()
        print(f"Created ER of White Rock facility: {facility_id}")
    else:
        facility_id = row[0]
        print(f"Found ER of White Rock facility: {facility_id}")

    # Load law firms from DB to map names → ids
    cur.execute("SELECT id, name FROM lop_law_firms")
    law_firms_db = {r[1].upper().strip(): r[0] for r in cur.fetchall()}
    new_law_firms = {}

    def get_or_create_law_firm(name):
        if not name or not name.strip():
            return None
        key = name.upper().strip()
        if key in law_firms_db:
            return law_firms_db[key]
        if key in new_law_firms:
            return new_law_firms[key]
        cur.execute(
            "INSERT INTO lop_law_firms (name, is_active, created_at) VALUES (%s, true, now()) RETURNING id",
            (name.strip().title(),)
        )
        new_id = cur.fetchone()[0]
        new_law_firms[key] = new_id
        law_firms_db[key] = new_id
        return new_id

    # Read CSV
    print(f"Reading CSV: {CSV_PATH}")
    rows = []
    with open(CSV_PATH, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, 1):
            # Parse name
            raw_name = row.get('PATIENT NAME', '').strip()
            if not raw_name:
                continue
            first_name, last_name = parse_name(raw_name)

            dob = parse_date(row.get('DOB', ''))
            dos = parse_date(row.get('DOS', ''))
            mrn = row.get('MRN', '').strip() or None
            disposition = (row.get('Disposition Status') or '').strip().lower()
            disposition = DISPOSITION_MAP.get(disposition, disposition or None)
            chief_complaint = (row.get('CHIEF COMPLAINT') or '').strip() or None
            primary_insurance = (row.get('Pri Name') or '').strip() or None
            is_lop_raw = (row.get('LOP Case') or '').strip().lower()
            is_lop_case = is_lop_raw == 'yes'
            referral_source = (row.get('Referral Source') or '').strip() or None
            law_firm_name = (row.get('Additional LOP Referral') or '').strip()
            law_firm_id = get_or_create_law_firm(law_firm_name) if law_firm_name else None

            llc_billed = parse_money(row.get('LLC Billed Charges', ''))
            pllc_billed = parse_money(row.get('PLLC Billed Charges', ''))
            total_llc = parse_money(row.get('Total Received LLC', ''))
            total_pllc = parse_money(row.get('Total Received PLLC', ''))

            rows.append((
                facility_id,
                law_firm_id,
                first_name,
                last_name,
                dob,
                mrn,
                dos,
                disposition,
                chief_complaint,
                primary_insurance,
                is_lop_case,
                referral_source,
                llc_billed,
                pllc_billed,
                total_llc,
                total_pllc,
            ))

    print(f"Parsed {len(rows)} patient records. Inserting...")

    # Check if data already exists for this facility to avoid duplicates
    cur.execute("SELECT COUNT(*) FROM lop_patients WHERE facility_id = %s", (facility_id,))
    existing_count = cur.fetchone()[0]
    if existing_count > 0:
        print(f"WARNING: {existing_count} existing patients found for ER of White Rock.")
        answer = input("Delete existing White Rock patients and re-import? [y/N]: ").strip().lower()
        if answer == 'y':
            cur.execute("DELETE FROM lop_patients WHERE facility_id = %s", (facility_id,))
            print(f"Deleted {existing_count} existing records.")
        else:
            print("Aborting import.")
            conn.close()
            sys.exit(0)

    execute_values(cur, """
        INSERT INTO lop_patients (
            facility_id, law_firm_id,
            first_name, last_name, date_of_birth,
            mrn, date_of_service, disposition_status,
            chief_complaint, primary_insurance, is_lop_case,
            referral_source,
            llc_billed_charges, pllc_billed_charges,
            total_received_llc, total_received_pllc,
            case_status, lop_letter_status, medical_records_status
        ) VALUES %s
    """, [
        (
            r[0], r[1], r[2], r[3], r[4],
            r[5], r[6], r[7], r[8], r[9], r[10],
            r[11], r[12], r[13], r[14], r[15],
            'in_progress', 'not_requested', 'not_requested'
        )
        for r in rows
    ])

    conn.commit()
    print(f"✓ Imported {len(rows)} patient records for ER of White Rock.")
    cur.close()
    conn.close()


if __name__ == '__main__':
    main()
