#!/usr/bin/env python3
"""
White Rock Patient Document Pipeline
1. Compresses all PDFs using Ghostscript (ebook quality ~150dpi)
2. Uploads to Google Cloud Storage
3. Inserts records into lop_patient_documents table

Usage:
  python3 scripts/upload-patient-docs.py --dry-run
  DB_PASSWORD='...' python3 scripts/upload-patient-docs.py
"""
import os, sys, re, subprocess, tempfile, unicodedata, argparse
import psycopg2
from pathlib import Path
from google.cloud import storage as gcs_lib

DOCS_ROOT       = Path(__file__).parent.parent / "Letter of Protections & Records"
GCS_BUCKET      = "focus-health-assets-adept-box-494606-s9"
GCS_PREFIX      = "patient-docs/white-rock"
GCS_PUBLIC_BASE = "https://storage.googleapis.com/focus-health-assets-adept-box-494606-s9"
FACILITY_ID     = "bcbf4aa6-1ac5-42b3-a5c1-bd66f71f35c8"

DB_HOST = os.getenv("DB_HOST",     "127.0.0.1")
DB_PORT = os.getenv("DB_PORT",     "5433")
DB_NAME = os.getenv("DB_NAME",     "focus_health")
DB_USER = os.getenv("DB_USER",     "focus_app")
DB_PASS = os.getenv("DB_PASSWORD", "")

# Exact folder-name (lowercase) -> patient UUID from DB
MANUAL_MAPPING = {
    "howes,david":                     "29faf7d6-3d68-4498-9c78-f1fd950a8f0d",
    "olivia garcia":                   "154a7125-e4df-42bb-a80f-b7fd46e263eb",
    "aguero,gabriel":                  "efc222cb-6704-4bf2-9c8c-0e5e1d36a2c0",
    "santillan yamagishi,rodrigo":     "e8db9f52-2f40-4d05-bd52-e15f8f099ebf",
    "alondra martinez":                "57942ac9-b73d-4c88-9c75-24beed933d2f",
    "marta olivia avila":              "80491c57-94e7-468c-b5e4-1f8d5b0e77c4",
    "lady vega":                       "2dd2471c-da9c-4c37-b2dd-8366e4122871",
    "kenneth wayne townsend":          "8ea1254b-277c-40ee-8c01-1eae2c2f5d38",
    "ana rojo":                        "708faa5e-db81-49d7-b9ca-3069f3869dca",
    "madeline rojo":                   "903119d2-585e-487a-a615-be090a2c0e84",
    "arthur_moreno":                   "843f2c19-7b80-4849-8579-4fa831877e1a",
    "rodney cruz":                     "08f0cfca-d57e-4fee-b739-cc17831a3563",
    "jose trinidad correa":            "a7e216a1-af71-4cc6-8c8a-cdd11372a5a3",
    "trinidad correa beltran":         "a7e216a1-af71-4cc6-8c8a-cdd11372a5a3",
    "jose hernandez":                  "885f22a5-0ddc-4060-8681-605715c7bb8b",
    "san martin, anthony":             "b26bced8-fcd5-4201-9c57-ca16a3b2f068",
    "luis e. lemus, jr.":              "9bb510de-c745-4b26-ab35-ce2055abe49c",
    "magana bautista, allan fabricio": "a44c9440-882c-4d24-b0a0-bb172464905f",
    "de jesus gonzalez,gamalier":      "338d2de2-a42a-454e-8e2c-71abd1921e56",
    "bertha alday":                    "285a246c-98f1-40d7-8867-8e257e0d327b",
    "sergio gamez":                    "805d61a0-8369-4593-8dda-9f74f7b57f17",
    "gustavo reyes":                   "4b9d5943-40bd-482d-961f-ee1165d0e370",
    "anthoney obregon":                "34adcec6-0c2b-4ade-ae71-ff956e2e9eec",
    "ashtyn goodwin":                  "f15fdb5b-4d40-480e-9e89-8612d7d68417",
    "jaime quintana castaneda":        "9a8097bc-7f59-4921-95d2-a93dc3fa923a",
    "maria d. torres fuentes":         "11610363-9cb6-4441-9992-69842934095a",
    "brenda williams":                 "233b6f95-0d42-4e37-bbfa-e9c7608660f8",
    "gonzalez,florina":                "da0e892e-b565-4230-aa50-87a7e7af6186",
    "florina gonzalez":                "da0e892e-b565-4230-aa50-87a7e7af6186",
    "rodriguez,joel":                  "0087e8b9-bad7-48ff-a5a7-876c847a5e16",
}

SKIP_FOLDERS = {"charles christian", "carlos alva", "deana humphrey", "christie nicole wade"}


def detect_doc_type(filename):
    fn = filename.upper()
    if re.search(r"\bLOP\b", fn):              return "lop_letter"
    if "AFFIDAVIT" in fn:                      return "affidavit"
    if "DROP" in fn:                           return "drop_letter"
    if re.search(r"REDUCTION", fn):            return "reduction_letter_unsigned"
    if re.search(r"CHECK\b|CHECK.IMAGE", fn): return "check_image"
    if "FACILIT" in fn:                        return "bill_llc"
    if re.search(r"PROFESSIONAL|PROFIS", fn):  return "bill_pllc"
    if re.search(r"[-_ ]MR\.PDF$|[-_ ]MR[-_ ]|MEDICAL.RECORD|CHART", fn):
                                               return "medical_record"
    return "medical_record"


def norm_words(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^A-Z0-9]", " ", s.upper()).split()

def norm_str(s):
    return " ".join(norm_words(s))


def load_patients(conn):
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, first_name, last_name FROM lop_patients WHERE facility_id = %s",
            (FACILITY_ID,)
        )
        rows = cur.fetchall()
    index = {}
    def add(k, pid):
        k = " ".join(k.split())
        if k:
            index.setdefault(k, pid)
    for pid, first, last in rows:
        fn = norm_str(first or "")
        ln = norm_str(last  or "")
        fw = fn.split()[0] if fn else ""
        lw = ln.split()[0] if ln else ""
        add(f"{fn} {ln}", pid)
        add(f"{ln} {fn}", pid)
        add(f"{fw} {ln}", pid)
        add(f"{ln} {fw}", pid)
        add(f"{fn} {lw}", pid)
        add(f"{fw} {lw}", pid)
    return index


def find_patient(idx, folder):
    key = folder.strip().lower()
    if key in MANUAL_MAPPING:
        return MANUAL_MAPPING[key]
    if key in SKIP_FOLDERS:
        return None
    fn = norm_str(folder)
    if fn in idx:
        return idx[fn]
    if "," in folder:
        p = [x.strip() for x in folder.split(",", 1)]
        for a, b in [(p[1], p[0]), (p[0], p[1])]:
            k = f"{norm_str(a)} {norm_str(b)}"
            if k in idx: return idx[k]
            aw = norm_words(a)
            if aw:
                k2 = f"{aw[0]} {norm_str(b)}"
                if k2 in idx: return idx[k2]
    # Substring: all key words found in folder words
    fw = set(norm_words(folder))
    best_pid, best_score = None, 0
    for ik, pid in idx.items():
        kw = set(ik.split())
        if len(kw) >= 2 and kw <= fw:
            score = len(kw)
            if score > best_score:
                best_score, best_pid = score, pid
    return best_pid


def compress_pdf(src, dst):
    r = subprocess.run([
        "gs", "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.4",
        "-dPDFSETTINGS=/ebook", "-dNOPAUSE", "-dQUIET", "-dBATCH",
        "-dCompressFonts=true", "-dSubsetFonts=true",
        f"-sOutputFile={dst}", str(src)
    ], capture_output=True, timeout=90)
    if r.returncode != 0 or not Path(dst).exists():
        return False
    if Path(dst).stat().st_size >= src.stat().st_size:
        import shutil; shutil.copy2(src, dst)
    return True


def upload_to_gcs(gcs_client, local, gcs_obj):
    bucket = gcs_client.bucket(GCS_BUCKET)
    blob   = bucket.blob(gcs_obj)
    blob.upload_from_filename(str(local), content_type="application/pdf")
    return True


def upsert_doc(conn, patient_id, doc_type, file_name, storage_path, file_url):
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO lop_patient_documents
              (patient_id, document_type, file_name, storage_path, file_url, status)
            VALUES (%s, %s, %s, %s, %s, 'received')
            ON CONFLICT DO NOTHING
        """, (patient_id, doc_type, file_name, storage_path, file_url))
    conn.commit()


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run",       action="store_true")
    p.add_argument("--skip-compress", action="store_true")
    args = p.parse_args()

    if not DOCS_ROOT.exists():
        sys.exit(f"ERROR: {DOCS_ROOT} not found")

    print("Connecting to database...")
    conn = psycopg2.connect(host=DB_HOST, port=int(DB_PORT), dbname=DB_NAME,
                            user=DB_USER, password=DB_PASS)
    gcs_client = gcs_lib.Client() if not args.dry_run else None
    idx = load_patients(conn)
    print(f"Loaded {len(idx)} name keys")

    all_pdfs = sorted(DOCS_ROOT.rglob("*.pdf"))
    total_mb = sum(f.stat().st_size for f in all_pdfs) / 1_000_000
    print(f"Found {len(all_pdfs)} PDFs ({total_mb:.0f} MB)\n")

    stats = {"done": 0, "skip": 0, "no_match": 0, "err": 0}
    no_match_set = set()

    def safe(s): return re.sub(r"[^\w\-\.]", "_", s)

    with tempfile.TemporaryDirectory() as tmpdir:
        for pdf in all_pdfs:
            parts = pdf.relative_to(DOCS_ROOT).parts
            if len(parts) < 2:
                stats["skip"] += 1; continue
            month_dir, pat_dir, fname = parts[0], parts[-2], parts[-1]

            if pat_dir.strip().lower() in SKIP_FOLDERS:
                stats["skip"] += 1; continue

            pid = find_patient(idx, pat_dir)
            if not pid:
                no_match_set.add(pat_dir)
                stats["no_match"] += 1; continue

            doc_type   = detect_doc_type(fname)
            gcs_obj    = f"{GCS_PREFIX}/{safe(month_dir)}/{safe(pat_dir)}/{safe(fname)}"
            gcs_uri    = f"gs://{GCS_BUCKET}/{gcs_obj}"
            public_url = f"{GCS_PUBLIC_BASE}/{gcs_obj}"
            orig_kb    = pdf.stat().st_size / 1024

            if args.dry_run:
                print(f"  [{doc_type:22s}] {pat_dir} / {fname}  ({orig_kb:.0f}KB)")
                stats["done"] += 1; continue

            if args.skip_compress:
                upload_src = pdf
            else:
                comp = Path(tmpdir) / safe(fname)
                if compress_pdf(pdf, comp):
                    new_kb = comp.stat().st_size / 1024
                    saved  = max(0, int((1 - new_kb / orig_kb) * 100))
                    print(f"  {orig_kb:.0f}->{new_kb:.0f}KB (-{saved}%)  {pat_dir}/{fname}")
                    upload_src = comp
                else:
                    print(f"  compress fail  {pat_dir}/{fname}")
                    upload_src = pdf

            try:
                upload_to_gcs(gcs_client, upload_src, gcs_obj)
            except Exception as e:
                print(f"  UPLOAD FAIL: {gcs_obj}  {e}")
                stats["err"] += 1; continue

            upsert_doc(conn, pid, doc_type, fname, gcs_uri, public_url)
            stats["done"] += 1

    conn.close()

    print(f"\n{'─'*50}")
    print(f"  Processed : {stats['done']}")
    print(f"  No match  : {stats['no_match']}")
    print(f"  Skipped   : {stats['skip']}")
    print(f"  Errors    : {stats['err']}")
    if no_match_set:
        print("\nUnmatched folders:")
        for f in sorted(no_match_set): print(f"  x {f}")


if __name__ == "__main__":
    main()
