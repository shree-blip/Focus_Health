import { NextResponse, type NextRequest } from "next/server";
import { requireLopAuth } from "@/lib/lop/server-auth";
import { Storage } from "@google-cloud/storage";

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
    const buffer = Buffer.from(arrayBuffer);

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

    // Make it publicly readable
    await gcsFile.makePublic();

    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${storagePath}`;

    return NextResponse.json({ url: publicUrl, storage_path: storagePath });
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
