#!/usr/bin/env python3
"""
ER of Irving Patient Document Pipeline — 2025 & 2026 Downloads
1. Compresses all PDFs using Ghostscript (ebook quality ~150dpi)
2. Uploads to Google Cloud Storage under patient-docs/irving/
3. Inserts / upserts records into lop_patient_documents table

Source roots:
  /Users/focus/Downloads/2025/<Month YYYY>/<Patient Name>/*.pdf
  /Users/focus/Downloads/2026/<Month YYYY>/<Patient Name>/*.pdf

Usage:
  python3 scripts/upload-irving-downloads-docs.py --dry-run
  DB_PASSWORD='...' python3 scripts/upload-irving-downloads-docs.py
  DB_PASSWORD='...' python3 scripts/upload-irving-downloads-docs.py --skip-compress
"""
import os, sys, re, subprocess, tempfile, unicodedata, argparse
from typing import Optional
import psycopg2
from pathlib import Path
from google.cloud import storage as gcs_lib

# ── Roots to scan (both years) ────────────────────────────────────────────────
DOCS_ROOTS = [
    Path("/Users/focus/Downloads/2025"),
    Path("/Users/focus/Downloads/2026"),
]

GCS_BUCKET      = "focus-health-assets-adept-box-494606-s9"
GCS_PREFIX      = "patient-docs/irving"
GCS_PUBLIC_BASE = "https://storage.googleapis.com/focus-health-assets-adept-box-494606-s9"
FACILITY_ID     = "d4233091-3e57-446d-9278-7b4c633a98d6"   # ER of Irving

DB_HOST = os.getenv("DB_HOST",     "127.0.0.1")
DB_PORT = os.getenv("DB_PORT",     "5433")
DB_NAME = os.getenv("DB_NAME",     "focus_health")
DB_USER = os.getenv("DB_USER",     "focus_app")
DB_PASS = os.getenv("DB_PASSWORD", "")

# ── Optional manual overrides (lowercase folder name → patient UUID) ──────────
MANUAL_MAPPING: dict = {
    # Spelling variants that the fuzzy matcher misses
    "lizbeth chaves":                   "5a6406dd-88ad-4afc-8d15-bdf9672e4c4a",   # DB: Lizbeth Chavez
    "hayder altufaili":                 "18219204-3917-477c-baba-7dc0cd3bd9b8",   # DB: Hayder Altufalli
    "colin jones":                      "17962ca8-9eb2-4b9a-a8b0-64c590828fe6",   # DB: Collin Jones
    "logan lattimer":                   "c8ecb84d-9293-4b59-a0dc-aa94153deada",   # DB: Logan Latimer
    "yureima c. funemayor funemayor":   "c118714b-9bfa-476d-a07f-1b04d05c72cc",   # DB: Yureima Candelaria Fuenmayor
}

# ── Folders to silently skip ──────────────────────────────────────────────────
# Patients not yet in the DB — add once their patient records are created
SKIP_FOLDERS: set = {
    "avidan mauricio martinez",   # not found in DB — create patient record first
    "francisco r. moreno",        # not found in DB — create patient record first
}


# ── Document-type detection ───────────────────────────────────────────────────
def detect_doc_type(filename: str) -> str:
    fn = filename.upper()
    if re.search(r"\bLOP\b", fn):               return "lop_letter"
    if re.search(r"\bAUTH\b|AUTHORIZATION", fn): return "lop_letter"      # auth letters treated as LOP
    if "AFFIDAVIT" in fn:                        return "affidavit"
    if "DROP" in fn:                             return "drop_letter"
    if re.search(r"REDUCTION", fn):              return "reduction_letter_unsigned"
    if re.search(r"CHECK\b|CHECK.IMAGE", fn):    return "check_image"
    if "FACILIT" in fn:                          return "bill_llc"
    if re.search(r"PROFESSIONAL|PROFIS", fn):    return "bill_pllc"
    if re.search(r"[-_ ]MR\.PDF$|[-_ ]MR[-_ ]|MEDICAL.RECORD|CHART", fn):
                                                 return "medical_record"
    return "medical_record"


# ── Name normalisation helpers ────────────────────────────────────────────────
def norm_words(s: str) -> list[str]:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^A-Z0-9]", " ", s.upper()).split()

def norm_str(s: str) -> str:
    return " ".join(norm_words(s))


# ── Load all Irving patients from DB ─────────────────────────────────────────
def load_patients(conn) -> dict:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, first_name, last_name FROM lop_patients WHERE facility_id = %s",
            (FACILITY_ID,)
        )
        rows = cur.fetchall()

    index: dict = {}

    def add(k: str, pid: str):
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


# ── Fuzzy folder → patient match ──────────────────────────────────────────────
def find_patient(idx: dict, folder: str) -> Optional[str]:
    key = folder.strip().lower()
    if key in MANUAL_MAPPING:
        return MANUAL_MAPPING[key]
    if key in SKIP_FOLDERS:
        return None

    fn = norm_str(folder)
    if fn in idx:
        return idx[fn]

    # "Last, First" format
    if "," in folder:
        parts = [x.strip() for x in folder.split(",", 1)]
        for a, b in [(parts[1], parts[0]), (parts[0], parts[1])]:
            k = f"{norm_str(a)} {norm_str(b)}"
            if k in idx:
                return idx[k]
            aw = norm_words(a)
            if aw:
                k2 = f"{aw[0]} {norm_str(b)}"
                if k2 in idx:
                    return idx[k2]

    # Substring: all key words present in folder words
    fw_set = set(norm_words(folder))
    best_pid, best_score = None, 0
    for ik, pid in idx.items():
        kw = set(ik.split())
        if len(kw) >= 2 and kw <= fw_set:
            score = len(kw)
            if score > best_score:
                best_score, best_pid = score, pid

    return best_pid


# ── PDF compression via Ghostscript ──────────────────────────────────────────
def compress_pdf(src: Path, dst: Path) -> bool:
    r = subprocess.run([
        "gs", "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.4",
        "-dPDFSETTINGS=/ebook", "-dNOPAUSE", "-dQUIET", "-dBATCH",
        "-dCompressFonts=true", "-dSubsetFonts=true",
        f"-sOutputFile={dst}", str(src)
    ], capture_output=True, timeout=90)

    if r.returncode != 0 or not dst.exists():
        return False
    # If compression made it larger, keep original
    if dst.stat().st_size >= src.stat().st_size:
        import shutil
        shutil.copy2(src, dst)
    return True


# ── GCS upload ────────────────────────────────────────────────────────────────
def upload_to_gcs(gcs_client, local: Path, gcs_obj: str):
    bucket = gcs_client.bucket(GCS_BUCKET)
    blob   = bucket.blob(gcs_obj)
    blob.upload_from_filename(str(local), content_type="application/pdf")


# ── DB upsert ─────────────────────────────────────────────────────────────────
def upsert_doc(conn, patient_id: str, doc_type: str, file_name: str,
               storage_path: str, file_url: str):
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO lop_patient_documents
              (patient_id, document_type, file_name, storage_path, file_url, status)
            VALUES (%s, %s, %s, %s, %s, 'received')
            ON CONFLICT DO NOTHING
        """, (patient_id, doc_type, file_name, storage_path, file_url))
    conn.commit()


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run",       action="store_true",
                        help="Print what would happen without uploading or writing to DB")
    parser.add_argument("--skip-compress", action="store_true",
                        help="Upload PDFs as-is without Ghostscript compression")
    args = parser.parse_args()

    # Validate roots
    for root in DOCS_ROOTS:
        if not root.exists():
            sys.exit(f"ERROR: docs root not found: {root}")

    print("Connecting to database...")
    conn = psycopg2.connect(
        host=DB_HOST, port=int(DB_PORT),
        dbname=DB_NAME, user=DB_USER, password=DB_PASS,
    )
    gcs_client = gcs_lib.Client() if not args.dry_run else None
    idx = load_patients(conn)
    print(f"Loaded {len(idx)} name-keys for ER of Irving (facility {FACILITY_ID})")

    # Collect all PDFs from both roots
    all_pdfs = []   # list of (root, pdf_path)
    for root in DOCS_ROOTS:
        for pdf in sorted(root.rglob("*.pdf")):
            all_pdfs.append((root, pdf))

    total_mb = sum(p.stat().st_size for _, p in all_pdfs) / 1_000_000
    print(f"Found {len(all_pdfs)} PDFs ({total_mb:.0f} MB) across {len(DOCS_ROOTS)} roots\n")

    stats = {"done": 0, "skip": 0, "no_match": 0, "err": 0}
    no_match_set = set()

    def safe(s: str) -> str:
        return re.sub(r"[^\w\-\.]", "_", s)

    with tempfile.TemporaryDirectory() as tmpdir:
        for root, pdf in all_pdfs:
            # Parts relative to root: <Month YYYY>/<Patient Name>/filename.pdf
            parts = pdf.relative_to(root).parts
            if len(parts) < 2:
                stats["skip"] += 1
                continue

            month_dir = parts[0]          # e.g. "April 2026"
            pat_dir   = parts[-2]         # patient folder name
            fname     = parts[-1]         # filename.pdf

            if pat_dir.strip().lower() in SKIP_FOLDERS:
                stats["skip"] += 1
                continue

            pid = find_patient(idx, pat_dir)
            if not pid:
                no_match_set.add(f"{root.name}/{month_dir}/{pat_dir}")
                stats["no_match"] += 1
                continue

            doc_type   = detect_doc_type(fname)
            gcs_obj    = f"{GCS_PREFIX}/{safe(root.name)}/{safe(month_dir)}/{safe(pat_dir)}/{safe(fname)}"
            public_url = f"{GCS_PUBLIC_BASE}/{gcs_obj}"
            gcs_uri    = f"gs://{GCS_BUCKET}/{gcs_obj}"
            orig_kb    = pdf.stat().st_size / 1024

            if args.dry_run:
                print(f"  [{doc_type:30s}] {root.name}/{month_dir}/{pat_dir} / {fname}  ({orig_kb:.0f} KB)")
                stats["done"] += 1
                continue

            # Compress
            if args.skip_compress:
                upload_src = pdf
            else:
                comp = Path(tmpdir) / safe(fname)
                ok   = compress_pdf(pdf, comp)
                if ok:
                    new_kb = comp.stat().st_size / 1024
                    saved  = max(0, int((1 - new_kb / orig_kb) * 100))
                    print(f"  {orig_kb:.0f}→{new_kb:.0f} KB (-{saved}%)  {pat_dir}/{fname}")
                    upload_src = comp
                else:
                    print(f"  compress FAIL  {pat_dir}/{fname}")
                    upload_src = pdf

            # Upload
            try:
                upload_to_gcs(gcs_client, upload_src, gcs_obj)
            except Exception as exc:
                print(f"  UPLOAD FAIL: {gcs_obj}  {exc}")
                stats["err"] += 1
                continue

            # DB record
            upsert_doc(conn, pid, doc_type, fname, gcs_uri, public_url)
            stats["done"] += 1

    conn.close()

    print(f"\n{'─'*54}")
    print(f"  Processed  : {stats['done']}")
    print(f"  No match   : {stats['no_match']}")
    print(f"  Skipped    : {stats['skip']}")
    print(f"  Errors     : {stats['err']}")

    if no_match_set:
        print(f"\nUnmatched folders ({len(no_match_set)}) — add to MANUAL_MAPPING or SKIP_FOLDERS:")
        for f in sorted(no_match_set):
            print(f"  ✗  {f}")

    if args.dry_run:
        print("\n[DRY RUN — no files uploaded, no DB changes made]")


if __name__ == "__main__":
    main()
