import psycopg2, csv, re
from datetime import datetime

FACILITY_ID = "d4233091-3e57-446d-9278-7b4c633a98d6"
CSV_PATH    = "/Users/focus/Desktop/App-FullStack/focus-health/ER of Irving- LOP - CYNTHIA NEW.csv"
DB_PASS     = "FocusHealth2026!$ecure"

LF_NORM = {
    "AK LAW":           "AK LAW FIRM",
    "AK LAW FIRM":      "AK LAW FIRM",
    "PARKS LAW FIRM":   "PARKS LAW FIRM",
    "BEN ABBOTT":           "BEN ABBOTT",
    "BEN ABBOTT LAW FIRM":  "BEN ABBOTT",
    "EASON":            "EASON LAW FIRM",
    "EASON LAW":        "EASON LAW FIRM",
    "EASON LAW FIRM":   "EASON LAW FIRM",
    "FASORO":           "FASORO LAW FIRM",
    "FASORO LAW":       "FASORO LAW FIRM",
    "FASORO LAW FIRM":  "FASORO LAW FIRM",
    "BRYCE CARPENTER":  "BRYCE CARPENTER",
    "EDWARD LAW FIRM":  "EDWARD LAW GROUP",
    "EDWARD LAW GROUP": "EDWARD LAW GROUP",
    "BUSH & BUSH":      "BUSH & BUSH",
    "BAILEY & GALYEN":  "BAILEY & GALYEN",
    "TAREK":                "TAREK FAHMY LAW FIRM",
    "TAREK LAW":            "TAREK FAHMY LAW FIRM",
    "TAREK FAHMY LAW FIRM": "TAREK FAHMY LAW FIRM",
    "FIDEL MARTINEZ":                   "FIDEL ALEX MARTINEZ",
    "FIDEL ALEX MARTINEZ":              "FIDEL ALEX MARTINEZ",
    "FIDEL MARTINEZ LAW FIRM":          "FIDEL ALEX MARTINEZ",
    "LAW OFFICE OF FIDEL ALEX MARTINEZ":"FIDEL ALEX MARTINEZ",
    "FULLER":           "FULLER LAW FIRM",
    "FULLER LAW FIRM":  "FULLER LAW FIRM",
    "GAVIT":            "GAVIT LAW",
    "GAVIT LAW":        "GAVIT LAW",
    "JD SILVA":                         "JD SILVA & ASSOCIATES",
    "J.D.SILVA & ASSOCIATES,PLLC":      "JD SILVA & ASSOCIATES",
    "J ALEX LAW":       "J. ALEXANDER LAW",
    "J. ALEXANDER LAW": "J. ALEXANDER LAW",
    "LONCAR":           "LONCAR LAW",
    "RAD LAW FIRM":     "RAD LAW FIRM",
    "DUKE SMITH":       "DUKE SMITH LAW",
    "DUKE SETH":        "DUKE SMITH LAW",
    "SAMPLES AMES":     "SAMPLES AMES",
    "THE MAJOR LAW FIRM":   "THE MAJOR LAW FIRM",
    "THE MAJOR LAW FIRM":   "THE MAJOR LAW FIRM",
    "JOHNSON GARCIA":           "JOHNSON GARCIA",
    "JOSE ANGEL GUTIERREZ":     "JOSE ANGEL GUTIERREZ",
    "DANG LAW GROUP":           "DANG LAW GROUP",
    "GIBBINS LAW FIRM":         "GIBBINS LAW FIRM",
    "OSCAR GARZA":              "OSCAR GARZA",
    "OGUNDIPE":                 "OGUNDIPE LAW",
    "AARON HERBERT":            "AARON HERBERT",
    "ADESHOLA":                 "ADESHOLA LAW",
    "AHD LAW FIRM":             "AHD LAW FIRM",
    "CESAR ORNELAS LAW":        "CESAR ORNELAS LAW",
    "DANIEL RAMIREZ":           "DANIEL RAMIREZ",
    "DEON GOLDSCHMIDT":         "DEON GOLDSCHMIDT",
    "EBEDE LAW FIRM":           "EBEDE LAW FIRM",
    "FEIZY LAW OFFICE":         "FEIZY LAW OFFICE",
    "HOUSTON ATTY":             "HOUSTON ATTY",
    "J.A. POYNTER":             "J.A. POYNTER",
    "JAS JORDAN LAW":           "JAS JORDAN LAW",
    "JERRY ANDREW'S":           "JERRY ANDREWS",
    "JESUS D LUNA":             "JESUS D LUNA",
    "LAW OFFICE OF JOHN VONG":  "LAW OFFICE OF JOHN VONG",
    "MARISOL LOPEZ":            "MARISOL LOPEZ",
    "MAS":                      "MAS LAW",
    "MUSGROVE":                 "MUSGROVE LAW",
    "NO REFERENCE FOR LOP":     None,
    "LAW FIRM UNKNOWN":         None,
    "CYNTHIA":                  None,
    "PATRICK SIMON":            "PATRICK SIMON",
    "PATRICK/T CHRISTOPHER LEWIS": "T CHRISTOPHER LEWIS",
    "T CHRISTOPHER":            "T CHRISTOPHER LEWIS",
    "PIERCE SKRABANEK, PLLC":   "PIERCE SKRABANEK PLLC",
    "SONYA BYRD":               "SONYA BYRD",
    "THE VENERABLE LAW FIRM":   "THE VENERABLE LAW FIRM",
    "YOUR INSURANCE ATTORNEY":  "YOUR INSURANCE ATTORNEY",
    "ZPLAWGROUP":               "ZP LAW GROUP",
}

def norm_lf(raw):
    if not raw or not raw.strip(): return None
    key = re.sub(r"\s+", " ", raw.upper().strip())
    if key in LF_NORM: return LF_NORM[key]
    return raw.strip()

def parse_money(s):
    if not s or not s.strip(): return None
    try: return float(re.sub(r"[$,]", "", s.strip()))
    except: return None

def parse_date(s):
    if not s or not s.strip(): return None
    for fmt in ("%m/%d/%Y", "%Y-%m-%d", "%m/%d/%y"):
        try: return datetime.strptime(s.strip(), fmt).date()
        except: pass
    return None

conn = psycopg2.connect(host="127.0.0.1", port=5433, dbname="focus_health",
                        user="focus_app", password=DB_PASS)
cur = conn.cursor()

# ── Step 1: Delete existing ER of Irving patients ─────────────────────────
cur.execute("DELETE FROM lop_patients WHERE facility_id = %s", (FACILITY_ID,))
deleted = cur.rowcount
conn.commit()
print(f"Deleted {deleted} existing ER of Irving patient(s)")

# ── Step 2: Load law firms ─────────────────────────────────────────────────
cur.execute("SELECT id, name FROM lop_law_firms")
lf_map = {r[1].upper().strip(): r[0] for r in cur.fetchall()}

def get_or_create_lf(canonical):
    if canonical is None: return None
    key = canonical.upper().strip()
    if key in lf_map: return lf_map[key]
    cur.execute("INSERT INTO lop_law_firms (name) VALUES (%s) RETURNING id", (canonical,))
    new_id = cur.fetchone()[0]
    lf_map[key] = new_id
    print(f"  + Law firm: {canonical}")
    return new_id

# ── Step 3: Import CSV ─────────────────────────────────────────────────────
stats = {"inserted": 0, "bad": 0}

with open(CSV_PATH, newline="", encoding="utf-8-sig") as f:
    for row in csv.DictReader(f):
        first = row.get("Patient First Name", "").strip()
        last  = row.get("Patient Last Name",  "").strip()
        if not first and not last:
            stats["bad"] += 1; continue

        dob        = parse_date(row.get("DOB", ""))
        dos        = parse_date(row.get("DOS", ""))
        mrn        = row.get("MRN", "").strip() or None
        comp_stat  = row.get("Completion Status", "").strip()
        lop_stat   = row.get("LOP Status", "").strip()
        mr_notes   = row.get("MR Dept. Notes", "").strip() or None
        notes_val  = row.get("Notes", "").strip() or None
        llc_billed = parse_money(row.get("Total Billed LLC", ""))
        pllc_billed= parse_money(row.get("Total Billed PLLC", ""))
        llc_recv   = parse_money(row.get("Total Received LLC", ""))
        pllc_recv  = parse_money(row.get("Total Received PLLC", ""))
        check_date = parse_date(row.get("Check Date", "") or row.get("Check Date LLC", ""))

        lf_id = get_or_create_lf(norm_lf(row.get("Law Firm", "")))

        # case_status enum: scheduled|arrived|intake_complete|in_progress|
        #                   follow_up_needed|paid|partial_paid|case_dropped|
        #                   closed_no_recovery|no_show
        cs  = comp_stat.lower()
        ll  = lop_stat.lower()  # used in both case_status and lop_letter_status logic

        if "case dropped" in ll or "declined" in ll:
            case_status = "case_dropped"
        elif "complete" in cs and "in" not in cs:
            case_status = "paid"
        elif "withdraw" in cs:
            case_status = "case_dropped"
        elif "medical" in ll or "billing records" in ll:
            # "Medical/ Billing Records Shared" — records sent to firm, awaiting payment
            case_status = "follow_up_needed"
        else:
            case_status = "in_progress"

        # lop_letter_status → lop_document_status enum:
        # not_requested|requested|received|missing
        if "medical" in ll or "billing records" in ll:
            # Records have been shared with the law firm → received
            lop_letter_status = "received"
        elif "sent" in ll or "complete" in ll:
            lop_letter_status = "received"
        elif "pending" in ll or "request" in ll or "pt. auth" in ll:
            lop_letter_status = "requested"
        elif "missing" in ll:
            lop_letter_status = "missing"
        elif "case dropped" in ll or "declined" in ll:
            lop_letter_status = "not_requested"
        else:
            lop_letter_status = "not_requested"

        try:
            cur.execute("""
                INSERT INTO lop_patients (
                    facility_id, law_firm_id,
                    first_name, last_name, date_of_birth,
                    date_of_service, mrn,
                    case_status, lop_letter_status,
                    llc_billed_charges, pllc_billed_charges,
                    total_received_llc, total_received_pllc,
                    date_paid, mr_dept_notes, intake_notes,
                    is_lop_case
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s,
                    %s::lop_case_status,
                    %s::lop_document_status,
                    %s, %s, %s, %s, %s, %s, %s,
                    true
                )
            """, (
                FACILITY_ID, lf_id,
                first, last, dob, dos, mrn,
                case_status, lop_letter_status,
                llc_billed, pllc_billed,
                llc_recv, pllc_recv,
                check_date, mr_notes, notes_val,
            ))
            conn.commit()
            stats["inserted"] += 1
        except Exception as e:
            conn.rollback()
            print(f"  ERROR {first} {last}: {e}")
            stats["bad"] += 1

conn.close()
print(f"\n{'─'*45}")
print(f"  Inserted : {stats['inserted']}")
print(f"  Bad rows : {stats['bad']}")
