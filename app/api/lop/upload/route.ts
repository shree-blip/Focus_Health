import { NextResponse, type NextRequest } from "next/server";
import { requireLopAuth } from "@/lib/lop/server-auth";
import { Storage } from "@google-cloud/storage";
import { spawnSync } from "child_process";
import * as os from "os";
import * as nodePath from "path";
import * as fs from "fs";

const PROJECT_ID = "adept-box-494606-s9";
const BUCKET_NAME = "focus-health-assets-adept-box-494606-s9";

// Uses Application Default Credentials in Cloud Run (or GOOGLE_APPLICATION_CREDENTIALS locally)
const storage = new Storage({ projectId: PROJECT_ID });
const bucket = storage.bucket(BUCKET_NAME);

/**
 * POST /api/lop/upload
 * Content-Type: multipart/form-data
 * Fields: file (File), path (string) - destination path in GCS
 *
 * Returns: { url: string, storage_path: string }
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireLopAuth();
    if (!auth) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const path = formData.get("path") as string | null;

    if (!file || !path) {
      return NextResponse.json({ error: "file and path are required" }, { status: 400 });
    }

    // Validate file type (PDFs and images only)
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF and image files are allowed" }, { status: 400 });
    }

    // Max 25 MB
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be 25 MB or smaller" }, { status: 400 });
    }

    const storagePath = `lop-documents/${path}`;
    const gcsFile = bucket.file(storagePath);

    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    let originalSize: number | undefined;
    let compressedSize: number | undefined;

    // Compress PDFs larger than 2 MB using Ghostscript (available on Cloud Run)
    if (file.type === "application/pdf" && buffer.length > 2 * 1024 * 1024) {
      try {
        const tmpDir = os.tmpdir();
        const inFile = nodePath.join(tmpDir, `lop-in-${Date.now()}.pdf`);
        const outFile = nodePath.join(tmpDir, `lop-out-${Date.now()}.pdf`);
        fs.writeFileSync(inFile, buffer);
        const result = spawnSync("gs", [
          "-sDEVICE=pdfwrite",
          "-dCompatibilityLevel=1.4",
          "-dPDFSETTINGS=/ebook",
          "-dNOPAUSE",
          "-dQUIET",
          "-dBATCH",
          `-sOutputFile=${outFile}`,
          inFile,
        ], { timeout: 60_000 }); // 60 second cap
        if (result.status === 0 && fs.existsSync(outFile)) {
          const compressed = fs.readFileSync(outFile);
          // Only use compressed version if it's actually smaller
          if (compressed.length < buffer.length) {
            originalSize = buffer.length;
            compressedSize = compressed.length;
            buffer = compressed;
          }
        }
        // Clean up temp files
        try { fs.unlinkSync(inFile); } catch (_) { /* ignore */ }
        try { fs.unlinkSync(outFile); } catch (_) { /* ignore */ }
      } catch (_) {
        // Ghostscript not available — upload original
      }
    }

    await gcsFile.save(buffer, {
      contentType: file.type,
      metadata: {
        cacheControl: "private, max-age=3600",
        metadata: {
          uploadedBy: auth.lopUser.id,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Serve files through our auth-gated proxy so bucket stays private
    const proxyUrl = `/api/lop/file?path=${encodeURIComponent(storagePath)}`;

    return NextResponse.json({
      url: proxyUrl,
      storage_path: storagePath,
      ...(originalSize !== undefined && compressedSize !== undefined
        ? { originalSize, compressedSize }
        : {}),
    });
  } catch (err) {
    console.error("LOP upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/lop/upload
 * Body: { storage_path: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireLopAuth();
    if (!auth) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { storage_path } = await request.json();
    if (!storage_path) {
      return NextResponse.json({ error: "storage_path required" }, { status: 400 });
    }

    // Only allow deleting from lop-documents prefix
    if (!storage_path.startsWith("lop-documents/")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    await bucket.file(storage_path).delete({ ignoreNotFound: true });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("LOP delete error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed" },
      { status: 500 },
    );
  }
}
