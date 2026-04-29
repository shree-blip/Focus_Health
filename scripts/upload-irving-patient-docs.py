#!/usr/bin/env python3
"""
ER of Irving Patient Document Pipeline
1. Compresses all PDFs using Ghostscript (ebook quality ~150dpi)
2. Uploads to Google Cloud Storage
3. Inserts records into lop_patient_documents table

Usage:
  DB_PASSWORD='...' python3 scripts/upload-irving-patient-docs.py --dry-run
  DB_PASSWORD='...' python3 scripts/upload-irving-patient-docs.py
"""
import os, sys, re, subprocess, tempfile, unicodedata, argparse
import psycopg2
from pathlib import Path
from google.cloud import storage as gcs_lib

DOCS_ROOT       = Path(__file__).parent.parent / "Letter of Protections & Records"
GCS_BUCKET      = "focus-health-assets-adept-box-494606-s9"
GCS_PREFIX      = "patient-docs/irving"
GCS_PUBLIC_BASE = "https://storage.googleapis.com/focus-health-assets-adept-box-494606-s9"
FACILITY_ID     = "d4233091-3e57-446d-9278-7b4c633a98d6"   # ER of Irving

DB_HOST = os.getenv("DB_HOST",     "127.0.0.1")
DB_PORT = os.getenv("DB_PORT",     "5433")
DB_NAME = os.getenv("DB_NAME",     "focus_health")
DB_USER = os.getenv("DB_USER",     "focus_app")
DB_PASS = os.getenv("DB_PASSWORD", "")

# Add manual overrides here if folder names don't auto-match
MANUAL_MAPPING: dict[str, str] = {}

SKIP_FOLDERS: set[str] = set()


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
    print(f"Loaded {len(idx)} name keys for ER of Irving")

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
        print(f"\nUnmatched folders ({len(no_match_set)}) — not Irving patients:")
        for f in sorted(no_match_set): print(f"  x {f}")


if __name__ == "__main__":
    main()
